import { NextResponse } from "next/server";
import { normalizeContact, validateContact } from "@/src/lib/contact-validation";

const attempts = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return NextResponse.json({ ok: false, message: "Too many attempts. Please wait and try again." }, { status: 429 });
  attempts.set(ip, [...recent, now]);

  const body = await request.json().catch(() => null);
  const payload = normalizeContact(body);
  const errors = validateContact(payload);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, message: "Please review the submitted information.", errors }, { status: 400 });

  return NextResponse.json({ ok: false, configured: false, message: "Online delivery is not configured yet. Please email info@gfb-solutions.com directly." }, { status: 503 });
}
