import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Receives Atomic's task-status-updated events so tasks that complete async
// (payroll processing after the user leaves Transact) get reflected here.
//
// NOTE: Atomic's webhook signature scheme wasn't available at integration
// time. This endpoint is a no-op for any taskId we don't already have a
// row for, which limits it to updating tasks we created, but it does not
// verify the request actually came from Atomic. Add signature verification
// (see the "Webhook Reference" in the Atomic console for this account)
// before relying on this for anything sensitive.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  const taskId = body?.task
  const status = body?.data?.status

  if (!taskId || (status !== "processing" && status !== "completed" && status !== "failed")) {
    return NextResponse.json({ received: true })
  }

  await prisma.atomicTask
    .update({
      where: { atomicTaskId: taskId },
      data: {
        status,
        companyName: body?.company?.name ?? undefined,
        distributionType: body?.data?.distributionType ?? undefined,
        distributionAmount:
          typeof body?.data?.distributionAmount === "number"
            ? body.data.distributionAmount
            : undefined,
      },
    })
    .catch(() => null) // Unknown taskId (not one we created) — ignore.

  return NextResponse.json({ received: true })
}
