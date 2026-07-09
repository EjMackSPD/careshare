import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFamilyCapability, logFamilyAuditEvent } from "@/lib/auth-utils"
import {
  createIndividualEntity,
  createConnectSession,
  getLiabilityAccount,
  isMethodConfigured,
} from "@/lib/methodfi"

// GET - Fetch this family's linked liability accounts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params

    try {
      await requireFamilyCapability(familyId, "liabilities.read")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to view liability accounts for this family" },
        { status: 403 }
      )
    }

    const accounts = await prisma.familyLiabilityAccount.findMany({
      where: { familyId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ configured: isMethodConfigured(), accounts })
  } catch (error) {
    console.error("Error fetching liability accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch liability accounts" },
      { status: 500 }
    )
  }
}

// POST - Create a Method entity, run a connect session, and store discovered liability accounts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params

    let user
    try {
      const result = await requireFamilyCapability(familyId, "liabilities.write")
      user = result.user
    } catch {
      return NextResponse.json(
        { error: "Not authorized to link accounts for this family" },
        { status: 403 }
      )
    }

    if (!isMethodConfigured()) {
      return NextResponse.json(
        { error: "Liability account linking isn't set up yet. Add a Method Financial API key to enable it." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phone, email } = body

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required" },
        { status: 400 }
      )
    }

    const entityId = await createIndividualEntity({ firstName, lastName, phone, email })
    const accountIds = await createConnectSession(entityId)

    const accounts = await Promise.all(
      accountIds.map((accountId) => getLiabilityAccount(accountId))
    )

    const saved = await Promise.all(
      accounts.map((account) =>
        prisma.familyLiabilityAccount.upsert({
          where: { methodAccountId: account.accountId },
          create: {
            familyId,
            methodEntityId: entityId,
            methodAccountId: account.accountId,
            liabilityType: account.liabilityType,
            name: account.name,
            mask: account.mask,
            status: account.status,
            balanceCurrent: account.balanceCurrent,
          },
          update: {
            liabilityType: account.liabilityType,
            name: account.name,
            mask: account.mask,
            status: account.status,
            balanceCurrent: account.balanceCurrent,
            lastSyncedAt: new Date(),
          },
        })
      )
    )

    await logFamilyAuditEvent({
      familyId,
      userId: user.id,
      action: "liabilities.linked",
      entityType: "family_liability_account",
      entityId,
      metadata: { accountCount: saved.length },
    })

    return NextResponse.json({ accounts: saved }, { status: 201 })
  } catch (error) {
    console.error("Error linking liability accounts:", error)
    const message = error instanceof Error ? error.message : "Failed to link accounts"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
