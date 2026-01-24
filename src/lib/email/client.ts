import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@pbqc.de";

export function isEmailEnabled(): boolean {
  return resend !== null;
}
