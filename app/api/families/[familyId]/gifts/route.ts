import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFamilyCapability, logFamilyAuditEvent } from "@/lib/auth-utils"
import { createGiftOrder, isTremendousConfigured } from "@/lib/tremendous"

const DEFAULT_MONTHLY_CAP_USD = 200

function getMonthlyCap() {
  const configured = process.env.GIFT_MONTHLY_CAP_USD
  const parsed = configured ? parseFloat(configured) : NaN
  return Number.isFinite(parsed) ? parsed : DEFAULT_MONTHLY_CAP_USD
}

// GET - Fetch this family's gift order history (audit trail)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params

    try {
      await requireFamilyCapability(familyId, "gifts.read")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to view gifts for this family" },
        { status: 403 }
      )
    }

    const gifts = await prisma.giftOrder.findMany({
      where: { familyId },
      include: {
        orderedByUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    })

    return NextResponse.json(gifts)
  } catch (error) {
    console.error("Error fetching gift orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch gift orders" },
      { status: 500 }
    )
  }
}

// POST - Place a real gift-card order via Tremendous
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params

    let user
    try {
      const result = await requireFamilyCapability(familyId, "gifts.write")
      user = result.user
    } catch {
      return NextResponse.json(
        { error: "Not authorized to send gifts for this family" },
        { status: 403 }
      )
    }

    if (!isTremendousConfigured()) {
      return NextResponse.json(
        { error: "Gift ordering isn't set up yet. Add a Tremendous API key to enable it." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      productId,
      itemName,
      recipientName,
      recipientEmail,
      amount,
      currencyCode,
      message,
    } = body

    if (!productId || !itemName || !recipientName || !recipientEmail || !amount) {
      return NextResponse.json(
        { error: "Product, recipient name/email, and amount are required" },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid gift amount" }, { status: 400 })
    }

    const monthlyCap = getMonthlyCap()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const spentThisMonth = await prisma.giftOrder.aggregate({
      where: {
        familyId,
        status: { in: ["pending", "ordered", "delivered"] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { price: true },
    })

    const alreadySpent = spentThisMonth._sum.price || 0

    if (alreadySpent + parsedAmount > monthlyCap) {
      return NextResponse.json(
        {
          error: `This would exceed the family's $${monthlyCap} monthly gift cap ($${alreadySpent.toFixed(2)} already sent this month).`,
        },
        { status: 400 }
      )
    }

    const giftOrder = await prisma.giftOrder.create({
      data: {
        familyId,
        itemName,
        description: message || null,
        price: parsedAmount,
        currencyCode: currencyCode || "USD",
        status: "pending",
        recipientName,
        recipientEmail,
        orderedBy: user.id,
        orderDate: new Date(),
      },
    })

    try {
      const result = await createGiftOrder({
        externalId: giftOrder.id,
        productId,
        recipientName,
        recipientEmail,
        amount: parsedAmount,
        currencyCode: currencyCode || "USD",
        message,
      })

      const updated = await prisma.giftOrder.update({
        where: { id: giftOrder.id },
        data: {
          status: "ordered",
          tremendousOrderId: result.orderId,
          tremendousRewardId: result.rewardId,
          redemptionUrl: result.redemptionUrl,
        },
      })

      await logFamilyAuditEvent({
        familyId,
        userId: user.id,
        action: "gift.ordered",
        entityType: "gift_order",
        entityId: giftOrder.id,
        metadata: { amount: parsedAmount, recipientEmail },
      })

      return NextResponse.json(updated, { status: 201 })
    } catch (orderError) {
      const failureReason =
        orderError instanceof Error ? orderError.message : "Unknown error placing the order"

      const failed = await prisma.giftOrder.update({
        where: { id: giftOrder.id },
        data: { status: "failed", failureReason },
      })

      return NextResponse.json(
        { error: `Gift order failed: ${failureReason}`, giftOrder: failed },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error("Error creating gift order:", error)
    return NextResponse.json(
      { error: "Failed to create gift order" },
      { status: 500 }
    )
  }
}
