"use client";

import { useState } from "react";
import { divisions } from "@/src/content/site-content";
import type { Locale } from "@/src/content/types";
import { normalizeContact, validateContact, type ContactErrors, type ContactPayload } from "@/src/lib/contact-validation";
import { Icon } from "./icon";

const blank: ContactPayload = { name: "", company: "", email: "", phone: "", country: "", interest: "", category: "", message: "", source: "", website: "" };

export function ContactForm({ locale, initialInterest = "" }: { locale: Locale; initialInterest?: string }) {
  const es = locale === "es";
  const [values, setValues] = useState({ ...blank, interest: initialInterest, source: typeof window === "undefined" ? "" : window.location.pathname });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<{ type: "idle" | "sending" | "success" | "error"; message: string }>({ type: "idle", message: "" });

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeContact(values);
    const nextErrors = validateContact(normalized);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ type: "error", message: es ? "Revise los campos marcados." : "Please review the highlighted fields." });
      return;
    }
    setStatus({ type: "sending", message: es ? "Enviando…" : "Sending…" });
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalized) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setValues(blank);
      setStatus({ type: "success", message: es ? "Consulta enviada. Nuestro equipo se pondrá en contacto." : "Inquiry sent. Our team will be in touch." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error && error.message ? error.message : (es ? "No se pudo enviar la consulta." : "The inquiry could not be sent.") });
    }
  }

  const field = (name: keyof ContactPayload, label: string, input: React.ReactNode) => (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>{input}
      {errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}
    </div>
  );

  return (
    <form className="contact-form" onSubmit={submit} noValidate aria-busy={status.type === "sending"}>
      <div className="form-grid">
        {field("name", es ? "Nombre *" : "Name *", <input id="name" name="name" autoComplete="name" value={values.name} onChange={update} aria-invalid={!!errors.name} />)}
        {field("company", es ? "Empresa *" : "Company *", <input id="company" name="company" autoComplete="organization" value={values.company} onChange={update} aria-invalid={!!errors.company} />)}
        {field("email", es ? "Email corporativo *" : "Business email *", <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={update} aria-invalid={!!errors.email} />)}
        {field("phone", es ? "Teléfono" : "Phone", <input id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={update} />)}
        {field("country", es ? "País" : "Country", <input id="country" name="country" autoComplete="country-name" value={values.country} onChange={update} />)}
        {field("interest", es ? "Área de interés *" : "Area of interest *", <select id="interest" name="interest" value={values.interest} onChange={update} aria-invalid={!!errors.interest}><option value="">{es ? "Seleccione una" : "Select one"}</option>{divisions.map((division) => <option value={division.slug} key={division.slug}>{division.title[locale]}</option>)}</select>)}
      </div>
      {field("category", es ? "Producto, categoría o servicio" : "Product, category or service", <input id="category" name="category" value={values.category} onChange={update} placeholder={es ? "Ej. latas sleek, concentrado de limón…" : "e.g. sleek cans, lemon concentrate…"} />)}
      {field("message", es ? "Cuéntenos sobre su proyecto *" : "Tell us about your project *", <textarea id="message" name="message" rows={6} value={values.message} onChange={update} aria-invalid={!!errors.message} placeholder={es ? "Aplicación, formato, volumen estimado, destino y plazos relevantes." : "Application, format, estimated volume, destination and relevant timing."} />)}
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} /></div>
      <button className="button button--lime" type="submit" disabled={status.type === "sending"}>{status.type === "sending" ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar consulta" : "Send inquiry")}<Icon name="arrow" /></button>
      <div className={`form-status form-status--${status.type}`} role="status" aria-live="polite">{status.message}</div>
    </form>
  );
}
