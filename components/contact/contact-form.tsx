"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { submitInquiry, type InquiryState } from "@/src/features/contact/actions";
import {
  contactFields,
  fieldLimits,
  hasErrors,
  normalizeContact,
  requiredFields,
  validateContact,
  type ContactError,
  type ContactErrors,
  type ContactField
} from "@/src/features/contact/schema";
import type { Locale } from "@/src/i18n/config";
import type { Dictionary } from "@/src/i18n/dictionaries";
import { format } from "@/src/i18n/format";

type ContactFormProps = {
  locale: Locale;
  copy: Dictionary["form"];
  interests: { id: string; label: string }[];
  email: string;
  initial: { interest?: string; category?: string };
};

const initialState: InquiryState = { status: "idle" };

export function ContactForm({ locale, copy, interests, email, initial }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  // Client-side errors give instant feedback; the Server Action re-validates authoritatively.
  const [clientErrors, setClientErrors] = useState<ContactErrors | null>(null);
  const errors = clientErrors ?? state.errors ?? {};
  const values = state.values;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateContact(
      normalizeContact(new FormData(event.currentTarget)),
      interests.map((interest) => interest.id)
    );
    if (hasErrors(result)) {
      event.preventDefault();
      setClientErrors(result);
      focusFirstError(event.currentTarget, result);
    } else {
      setClientErrors(null);
    }
  }

  function clearError(field: ContactField) {
    if (errors[field]) setClientErrors({ ...errors, [field]: undefined });
  }

  const message = (error: ContactError) =>
    error.code === "tooLong" ? format(copy.errors.tooLong, { max: error.max }) : copy.errors[error.code];

  const statusMessage = clientErrors && hasErrors(clientErrors) ? copy.status.invalid : statusCopy(state, copy, email);
  const statusTone = state.status === "success" && !clientErrors ? "success" : statusMessage ? "error" : "idle";

  const field = (name: ContactField, control: (props: FieldProps) => ReactNode, wide = false) => {
    const error = errors[name];
    const required = requiredFields.includes(name);
    return (
      <div className={wide ? "form-field form-field--wide" : "form-field"}>
        <label htmlFor={name}>
          {copy.fields[name]}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {control({
          id: name,
          name,
          required,
          maxLength: fieldLimits[name],
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${name}-error` : undefined,
          onChange: () => clearError(name)
        })}
        {error && (
          <p className="field-error" id={`${name}-error`}>
            {message(error)}
          </p>
        )}
      </div>
    );
  };

  // `key` remounts the fields after each server response so defaultValue reflects echoed values.
  return (
    <form className="contact-form" action={formAction} onSubmit={validateBeforeSubmit} noValidate aria-busy={pending}>
      <input type="hidden" name="locale" value={locale} />
      <div className="form-grid" key={JSON.stringify(values ?? initial)}>
        {field("name", (props) => (
          <input {...props} autoComplete="name" defaultValue={values?.name} />
        ))}
        {field("company", (props) => (
          <input {...props} autoComplete="organization" defaultValue={values?.company} />
        ))}
        {field("email", (props) => (
          <input {...props} type="email" autoComplete="email" defaultValue={values?.email} />
        ))}
        {field("phone", (props) => (
          <input {...props} type="tel" autoComplete="tel" defaultValue={values?.phone} />
        ))}
        {field("country", (props) => (
          <input {...props} autoComplete="country-name" defaultValue={values?.country} />
        ))}
        {field("interest", (props) => (
          <select {...props} defaultValue={values?.interest ?? initial.interest ?? ""}>
            <option value="">{copy.interestPlaceholder}</option>
            {interests.map((interest) => (
              <option value={interest.id} key={interest.id}>
                {interest.label}
              </option>
            ))}
          </select>
        ))}
        {field(
          "category",
          (props) => (
            <input
              {...props}
              placeholder={copy.categoryPlaceholder}
              defaultValue={values?.category ?? initial.category}
            />
          ),
          true
        )}
        {field(
          "message",
          (props) => (
            <textarea {...props} rows={6} placeholder={copy.messagePlaceholder} defaultValue={values?.message} />
          ),
          true
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="button button--lime" type="submit" disabled={pending}>
        {pending ? copy.sending : copy.submit}
        <Icon name="arrow" />
      </button>
      <p className={`form-status form-status--${statusTone}`} role="status" aria-live="polite">
        {pending ? copy.sending : statusMessage}
      </p>
    </form>
  );
}

type FieldProps = {
  id: ContactField;
  name: ContactField;
  required: boolean;
  maxLength: number;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  onChange: () => void;
};

function statusCopy(state: InquiryState, copy: Dictionary["form"], email: string) {
  switch (state.status) {
    case "idle":
      return "";
    case "unavailable":
      return format(copy.status.unavailable, { email });
    default:
      return copy.status[state.status];
  }
}

function focusFirstError(form: HTMLFormElement, errors: ContactErrors) {
  const first = contactFields.find((name) => errors[name]);
  if (first) form.querySelector<HTMLElement>(`#${first}`)?.focus();
}
