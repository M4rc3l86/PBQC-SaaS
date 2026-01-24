interface InvitationTemplateProps {
  orgName: string;
  inviteLink: string;
  role: string;
}

export function invitationEmailTemplate({
  orgName,
  inviteLink,
  role,
}: InvitationTemplateProps): string {
  const roleLabels: Record<string, string> = {
    owner: "Inhaber",
    manager: "Manager",
    worker: "Mitarbeiter",
  };

  const roleLabel = roleLabels[role] || role;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Einladung zu ${orgName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                Sie wurden eingeladen
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Hallo,
              </p>
              <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Sie wurden zur Organisation <strong>${orgName}</strong> als <strong>${roleLabel}</strong> eingeladen.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Klicken Sie auf die Schaltfläche unten, um die Einladung anzunehmen und Zugang zu erhalten.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="${inviteLink}" style="display: inline-block; padding: 12px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                      Einladung annehmen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alternative link -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                Oder kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #6b7280; word-break: break-all;">
                ${inviteLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                Wenn Sie diese Einladung nicht angefordert haben, können Sie diese E-Mail ignorieren.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; line-height: 1.5; color: #9ca3af;">
                Diese E-Mail wurde von PBQC - Photo-Based Quality Control gesendet.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
