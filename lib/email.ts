import { Resend } from "resend"
import { readFileSync } from "fs"
import path from "path"

let resendClient: Resend | null = null
let logoAttachmentCache: Buffer | null = null

function getLogoAttachment(): Buffer | null {
  if (logoAttachmentCache) {
    return logoAttachmentCache
  }

  try {
    logoAttachmentCache = readFileSync(
      path.join(process.cwd(), "public", "careshare-logo-white.png")
    )
    return logoAttachmentCache
  } catch (error) {
    console.error("Could not read logo file for email:", error)
    return null
  }
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

const brand = {
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderEmailLayout(input: {
  siteUrl: string
  preview: string
  bodyHtml: string
  logoCid: string | null
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>CareShare</title>
      </head>
      <body style="margin:0; padding:0; background:${brand.surface}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(input.preview)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.surface}; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:${brand.surfaceRaised}; border-radius:16px; overflow:hidden; border:1px solid ${brand.border};">
                <tr>
                  <td style="background:${brand.brandDeep}; padding:28px 32px;">
                    ${
                      input.logoCid
                        ? `<img src="cid:${input.logoCid}" alt="CareShare" width="150" height="61" style="display:block; border:0;" />`
                        : `<span style="display:block; font-size:22px; font-weight:700; color:#ffffff; letter-spacing:0.02em;">CareShare</span>`
                    }
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

export async function sendFamilyInvitationEmail(input: {
  to: string
  familyName: string
  inviterName: string | null
  role: string
  message?: string | null
}) {
  const resend = getResendClient()

  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping invitation email to", input.to)
    return
  }

  const from = process.env.EMAIL_FROM || "CareShare <onboarding@resend.dev>"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const roleLabel = input.role.replace(/_/g, " ").toLowerCase()
  const inviterName = input.inviterName ? escapeHtml(input.inviterName) : "Someone"
  const familyName = escapeHtml(input.familyName)

  const bodyHtml = `
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:${brand.text};">
      <strong>${inviterName}</strong> invited you to join <strong>${familyName}</strong> on CareShare as a <strong>${escapeHtml(roleLabel)}</strong>.
    </p>
    ${
      input.message
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
            <tr>
              <td style="background:${brand.brandSoft}; border-radius:10px; padding:14px 16px; font-size:14px; line-height:1.5; color:${brand.ink}; font-style:italic;">
                &ldquo;${escapeHtml(input.message)}&rdquo;
              </td>
            </tr>
          </table>`
        : ""
    }
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="border-radius:10px; background:${brand.brand};">
          <a href="${siteUrl}/login" style="display:inline-block; padding:12px 24px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
            Sign in to accept
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0; font-size:14px; line-height:1.6; color:${brand.muted};">
      Sign in with this same email address to see the invitation on your dashboard and accept it. If you don't have a CareShare account yet, <a href="${siteUrl}/signup" style="color:${brand.brand};">create one</a> with this same email address first.
    </p>
  `

  const logo = getLogoAttachment()
  const logoCid = logo ? "careshare-logo" : null

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: `You're invited to join ${input.familyName} on CareShare`,
      html: renderEmailLayout({
        siteUrl,
        preview: `${input.inviterName || "Someone"} invited you to join ${input.familyName} on CareShare`,
        bodyHtml,
        logoCid,
      }),
      attachments: logo
        ? [
            {
              filename: "careshare-logo.png",
              content: logo,
              contentType: "image/png",
              contentId: logoCid!,
            },
          ]
        : undefined,
      text: [
        `${input.inviterName || "Someone"} invited you to join ${input.familyName} on CareShare as a ${roleLabel}.`,
        input.message ? `"${input.message}"` : null,
        `Sign in at ${siteUrl}/login with this same email address to see the invitation and accept it.`,
        `If you don't have a CareShare account yet, create one at ${siteUrl}/signup with this same email address first.`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    })

    if (result.error) {
      console.error("Resend rejected invitation email:", result.error)
    }
  } catch (error) {
    console.error("Failed to send invitation email:", error)
  }
}
