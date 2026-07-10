import { brand, renderEmailLayout } from "./email-template"

export function renderPasswordResetEmailHTML(input: { resetUrl: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  return renderEmailLayout({
    siteUrl,
    preview: "Reset your CareShare password",
    bodyHtml: `
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
    `,
  })
}

export function passwordResetEmailSubject() {
  return "Reset your CareShare password"
}

export function loginEmailSubject(isNewUser: boolean) {
  return isNewUser ? "Verify your email for CareShare" : "Your CareShare sign-in link"
}

export function renderLoginEmailHTML(input: {
  link: string
  code: string
  isNewUser: boolean
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const intro = input.isNewUser
    ? "Welcome to CareShare! Confirm your email to finish setting up your account."
    : "Use the button below to sign in to CareShare."

  return renderEmailLayout({
    siteUrl,
    preview: input.isNewUser
      ? "Verify your email for CareShare"
      : "Your CareShare sign-in link",
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:${brand.text};">
        ${intro}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr>
          <td style="border-radius:10px; background:${brand.brand};">
            <a href="${input.link}" style="display:inline-block; padding:12px 24px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
              ${input.isNewUser ? "Verify &amp; continue" : "Sign in to CareShare"}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px; font-size:14px; line-height:1.6; color:${brand.text};">
        Or enter this code:
      </p>
      <p style="margin:0 0 20px; font-size:28px; font-weight:700; letter-spacing:6px; color:${brand.ink};">
        ${input.code}
      </p>
      <p style="margin:0; font-size:13px; line-height:1.6; color:${brand.muted};">
        This link and code expire in 15 minutes and can be used once. If you didn't request this, you can safely ignore this email.
      </p>
    `,
  })
}
