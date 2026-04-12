import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hydrateStoredDraft } from "@/lib/onboarding"

export default async function PostLoginPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
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

  redirect("/dashboard")
}
