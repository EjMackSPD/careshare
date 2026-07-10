import { Resend } from "resend"
import { brand, escapeHtml, renderEmailLayout } from "./email-template"
import { loginEmailSubject, renderLoginEmailHTML } from "./payload-email"

let resendClient: Resend | null = null

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

export async function sendLoginEmail(input: {
  to: string
  link: string
  code: string
  isNewUser: boolean
}) {
  const resend = getResendClient()

  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping login email to", input.to)
    return
  }

  const from = process.env.EMAIL_FROM || "CareShare <onboarding@resend.dev>"

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: loginEmailSubject(input.isNewUser),
      html: renderLoginEmailHTML({
        link: input.link,
        code: input.code,
        isNewUser: input.isNewUser,
      }),
      text: [
        input.isNewUser
          ? "Confirm your email to finish setting up your CareShare account."
          : "Sign in to CareShare.",
        `Link: ${input.link}`,
        `Code: ${input.code}`,
        "This link and code expire in 15 minutes and can be used once.",
      ].join("\n\n"),
    })

    if (result.error) {
      console.error("Resend rejected login email:", result.error)
    }
  } catch (error) {
    console.error("Failed to send login email:", error)
  }
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

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: `You're invited to join ${input.familyName} on CareShare`,
      html: renderEmailLayout({
        siteUrl,
        preview: `${input.inviterName || "Someone"} invited you to join ${input.familyName} on CareShare`,
        bodyHtml,
      }),
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

export async function sendWelcomeEmail(input: { to: string; name: string | null }) {
  const resend = getResendClient()

  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping welcome email to", input.to)
    return
  }

  const from = process.env.EMAIL_FROM || "CareShare <onboarding@resend.dev>"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const greetingName = input.name ? escapeHtml(input.name) : "there"

  const bodyHtml = `
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:${brand.text};">
      Hi ${greetingName}, welcome to CareShare! We help families coordinate care for the people they love &mdash; shared costs, tasks, documents, and an AI care assistant, all in one place.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="border-radius:10px; background:${brand.brand};">
          <a href="${siteUrl}/dashboard" style="display:inline-block; padding:12px 24px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
            Go to your dashboard
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0; font-size:13px; line-height:1.6; color:${brand.muted};">
      Questions? <a href="${siteUrl}/contact" style="color:${brand.brand};">Contact us</a> anytime.
    </p>
  `

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: "Welcome to CareShare",
      html: renderEmailLayout({
        siteUrl,
        preview: "Welcome to CareShare",
        bodyHtml,
      }),
      text: [
        `Hi ${input.name || "there"}, welcome to CareShare!`,
        "We help families coordinate care for the people they love — shared costs, tasks, documents, and an AI care assistant, all in one place.",
        `Go to your dashboard: ${siteUrl}/dashboard`,
      ].join("\n\n"),
    })

    if (result.error) {
      console.error("Resend rejected welcome email:", result.error)
    }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
  }
}

export async function sendFamilyMemberAddedEmail(input: {
  to: string
  familyName: string
  inviterName: string | null
  role: string
}) {
  const resend = getResendClient()

  if (!resend) {
    console.warn("RESEND_API_KEY not set; skipping family-added email to", input.to)
    return
  }

  const from = process.env.EMAIL_FROM || "CareShare <onboarding@resend.dev>"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const roleLabel = input.role.replace(/_/g, " ").toLowerCase()
  const inviterName = input.inviterName ? escapeHtml(input.inviterName) : "Someone"
  const familyName = escapeHtml(input.familyName)

  const bodyHtml = `
    <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:${brand.text};">
      <strong>${inviterName}</strong> added you to <strong>${familyName}</strong> on CareShare as a <strong>${escapeHtml(roleLabel)}</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="border-radius:10px; background:${brand.brand};">
          <a href="${siteUrl}/dashboard" style="display:inline-block; padding:12px 24px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
            View your dashboard
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0; font-size:13px; line-height:1.6; color:${brand.muted};">
      Sign in with this same email address to see what's new.
    </p>
  `

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: `You've been added to ${input.familyName} on CareShare`,
      html: renderEmailLayout({
        siteUrl,
        preview: `${input.inviterName || "Someone"} added you to ${input.familyName} on CareShare`,
        bodyHtml,
      }),
      text: [
        `${input.inviterName || "Someone"} added you to ${input.familyName} on CareShare as a ${roleLabel}.`,
        `View your dashboard: ${siteUrl}/dashboard`,
      ].join("\n\n"),
    })

    if (result.error) {
      console.error("Resend rejected family-added email:", result.error)
    }
  } catch (error) {
    console.error("Failed to send family-added email:", error)
  }
}
