import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { isMethodConfigured } from "@/lib/methodfi"
import LiabilityAccounts from "@/app/components/LiabilityAccounts"

export default async function LiabilitiesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const familyMember = await prisma.familyMember.findFirst({
    where: { userId: user.id },
    include: {
      family: {
        select: { id: true, name: true, careRecipient: { select: { name: true, preferredName: true } } },
      },
    },
  })

  const configured = isMethodConfigured()

  const accounts = familyMember
    ? await prisma.familyLiabilityAccount.findMany({
        where: { familyId: familyMember.familyId },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <LiabilityAccounts
      familyId={familyMember?.familyId ?? null}
      careRecipientName={
        familyMember?.family.careRecipient?.preferredName ||
        familyMember?.family.careRecipient?.name ||
        null
      }
      configured={configured}
      accounts={accounts.map((account) => ({
        id: account.id,
        name: account.name,
        mask: account.mask,
        liabilityType: account.liabilityType,
        status: account.status,
        balanceCurrent: account.balanceCurrent,
        lastSyncedAt: account.lastSyncedAt.toISOString(),
      }))}
    />
  )
}
