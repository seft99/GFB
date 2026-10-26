const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9223";

async function waitForTarget() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const targets = await fetch(`${endpoint}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Could not connect to the Edge debugging target.");
}

const target = await waitForTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const browserErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text);
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") browserErrors.push(message.params.entry.text);
});

function call(method, params = {}) {
  sequence += 1;
  const id = sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(url) {
  await call("Page.navigate", { url });
  await new Promise((resolve) => setTimeout(resolve, 1300));
}

await call("Runtime.enable");
await call("Page.enable");
await call("Log.enable");
await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

await navigate("http://127.0.0.1:3000/es");
const mobile = await evaluate(`(() => {
  const interactive = [...document.querySelectorAll('a, button, input, select, textarea')]
    .filter((node) => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
  const outOfBounds = interactive.map((node) => {
    const rect = node.getBoundingClientRect();
    return { label: (node.textContent || node.getAttribute('aria-label') || node.tagName).trim().slice(0, 60), left: rect.left, right: rect.right };
  }).filter((item) => item.left < -1 || item.right > innerWidth + 1);
  const button = document.querySelector('.menu-button');
  return { innerWidth, scrollWidth: document.documentElement.scrollWidth, outOfBounds, menuDisplay: getComputedStyle(button).display, menuExpanded: button.getAttribute('aria-expanded') };
})()`);

await evaluate(`document.querySelector('.menu-button').click()`);
const menu = await evaluate(`({ expanded: document.querySelector('.menu-button').getAttribute('aria-expanded'), open: document.querySelector('.mobile-menu').classList.contains('is-open') })`);

await navigate("http://127.0.0.1:3000/es/contact?interest=packaging-solutions");
await evaluate(`document.querySelector('form').requestSubmit()`);
await new Promise((resolve) => setTimeout(resolve, 250));
const form = await evaluate(`({ invalid: document.querySelectorAll('[aria-invalid="true"]').length, errors: document.querySelectorAll('.field-error').length, status: document.querySelector('[role="status"]').textContent.trim(), selectedInterest: document.querySelector('#interest').value })`);

await call("Emulation.clearDeviceMetricsOverride");
await navigate("http://127.0.0.1:3000/en/raw-materials/fruit-concentrates");
const desktop = await evaluate(`({ title: document.title, h1: document.querySelector('h1').textContent.trim(), canonical: document.querySelector('link[rel="canonical"]').href, scrollWidth: document.documentElement.scrollWidth, innerWidth })`);

socket.close();

const report = { mobile, menu, form, desktop, browserErrors };
console.log(JSON.stringify(report, null, 2));

if (mobile.scrollWidth > mobile.innerWidth || mobile.outOfBounds.length || mobile.menuDisplay === "none" || !menu.open || menu.expanded !== "true" || form.invalid < 4 || form.selectedInterest !== "packaging-solutions" || browserErrors.length) {
  process.exitCode = 1;
}
