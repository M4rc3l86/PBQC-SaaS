import { resend, fromEmail, isEmailEnabled } from "./client";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!isEmailEnabled()) {
    console.warn("Email sending is disabled. RESEND_API_KEY not set.");
    return { success: false, error: "Email service is not configured" };
  }

  try {
    const { data, error } = await resend!.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", data);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
