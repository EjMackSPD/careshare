export const brand = {
  brand: "#287fae",
  brandDark: "#1d648d",
  brandDeep: "#12384d",
  brandSoft: "#e8f4f9",
  ink: "#102a33",
  text: "#17323d",
  muted: "#617371",
  surface: "#f6fbfa",
  surfaceRaised: "#ffffff",
  border: "#d8e8e4",
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function renderEmailLayout(input: {
  siteUrl: string
  preview?: string
  bodyHtml: string
}) {
  const logoUrl = `${input.siteUrl}/careshare-logo-white.png`

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>CareShare</title>
      </head>
      <body style="margin:0; padding:0; background:${brand.surface}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        ${
          input.preview
            ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(input.preview)}</div>`
            : ""
        }
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.surface}; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:${brand.surfaceRaised}; border-radius:16px; overflow:hidden; border:1px solid ${brand.border};">
                <tr>
                  <td align="left" style="background:${brand.brandDeep}; padding:24px 32px;">
                    <img src="${logoUrl}" alt="CareShare" width="150" height="61" style="display:block; border:0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 8px;">
                    ${input.bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 32px;">
                    <p style="margin:0; font-size:13px; line-height:1.5; color:${brand.muted};">
                      CareShare helps families coordinate care for the people they love.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0; font-size:12px; color:${brand.muted};">
                &copy; ${new Date().getFullYear()} CareShare. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
