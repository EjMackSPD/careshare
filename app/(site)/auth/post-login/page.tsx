import { redirect } from "next/navigation"
import { auth, canAccessPayloadAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hydrateStoredDraft } from "@/lib/onboarding"
import { sanitizeCallbackUrl } from "@/lib/safe-redirect"

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl)

  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Hard gates take priority over any requested destination.
  if (session.user.mustResetPassword) {
    redirect("/reset-password-required")
  }

  // New users must confirm their email before accessing the product.
  if (!session.user.emailVerified) {
    redirect("/verify-email")
  }

  if (canAccessPayloadAdmin(session.user)) {
    redirect("/admin")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingStatus: true,
      onboardingData: true,
      familyMembers: {
        select: { id: true },
        take: 1,
      },
    },
  })

  if ((dbUser?.onboardingStatus ?? session.user.onboardingStatus) !== "COMPLETED") {
    redirect("/onboarding")
  }

  const draft = hydrateStoredDraft(dbUser?.onboardingData ?? null)
  const hasFamily = Boolean(dbUser?.familyMembers.length)

  if (draft.audienceType === "CARE_CENTER") {
    redirect("/onboarding/partner-complete")
  }

  if (draft.audienceType === "FAMILY" && draft.careContext.familyIntent === "JOIN" && !hasFamily) {
    redirect("/onboarding/join-family")
  }

  // A validated deep link overrides the default dashboard landing.
  redirect(safeCallbackUrl ?? "/dashboard")
}
