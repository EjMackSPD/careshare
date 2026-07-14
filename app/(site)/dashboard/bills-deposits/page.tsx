import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { isAtomicConfigured } from "@/lib/atomic"
import AtomicManager from "@/app/components/AtomicManager"

export default async function BillsAndDepositsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const familyMember = await prisma.familyMember.findFirst({
    where: { userId: user.id },
    select: { familyId: true },
  })

  const configured = isAtomicConfigured()

  const tasks = familyMember
    ? await prisma.atomicTask.findMany({
        where: { familyId: familyMember.familyId, userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <AtomicManager
      familyId={familyMember?.familyId ?? null}
      configured={configured}
      initialTasks={tasks.map((task) => ({
        id: task.id,
        operation: task.operation,
        status: task.status,
        companyName: task.companyName,
        distributionType: task.distributionType,
        distributionAmount: task.distributionAmount,
        createdAt: task.createdAt.toISOString(),
      }))}
    />
  )
}
