const brand = {
  brandDeep: "#12384d",
  brand: "#287fae",
  ink: "#102a33",
  text: "#17323d",
  muted: "#617371",
  surface: "#f6fbfa",
  surfaceRaised: "#ffffff",
  border: "#d8e8e4",
}

function layout(bodyHtml: string) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>CareShare</title>
      </head>
      <body style="margin:0; padding:0; background:${brand.surface}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.surface}; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:${brand.surfaceRaised}; border-radius:16px; overflow:hidden; border:1px solid ${brand.border};">
                <tr>
                  <td style="background:${brand.brandDeep}; padding:24px 32px;">
                    <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:0.02em;">CareShare</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 40px;">
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export function renderPasswordResetEmailHTML(input: { resetUrl: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  return layout(`
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:${brand.text};">
      We received a request to reset the password for your CareShare account.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="border-radius:10px; background:${brand.brand};">
          <a href="${input.resetUrl}" style="display:inline-block; padding:12px 24px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
            Reset your password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:${brand.muted};">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
    <p style="margin:0; font-size:13px; line-height:1.6; color:${brand.muted};">
      Not sure which email you signed up with? <a href="${siteUrl}/contact" style="color:${brand.brand};">Contact us</a> and we'll help you find your account.
    </p>
  `)
}

export function passwordResetEmailSubject() {
  return "Reset your CareShare password"
}
