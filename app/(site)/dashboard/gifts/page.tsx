import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { isTremendousConfigured, listGiftProducts } from "@/lib/tremendous"
import GiftCatalog from "@/app/components/GiftCatalog"

export default async function GiftsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const familyMember = await prisma.familyMember.findFirst({
    where: { userId: user.id },
    include: { family: { select: { id: true, name: true, careRecipient: { select: { name: true, preferredName: true } } } } },
  })

  const configured = isTremendousConfigured()
  const products = configured ? await listGiftProducts() : []

  const gifts = familyMember
    ? await prisma.giftOrder.findMany({
        where: { familyId: familyMember.familyId },
        orderBy: { createdAt: "desc" },
        take: 25,
      })
    : []

  return (
    <GiftCatalog
      familyId={familyMember?.familyId ?? null}
      careRecipientName={
        familyMember?.family.careRecipient?.preferredName ||
        familyMember?.family.careRecipient?.name ||
        null
      }
      configured={configured}
      products={products}
      gifts={gifts.map((gift) => ({
        id: gift.id,
        itemName: gift.itemName,
        price: gift.price,
        currencyCode: gift.currencyCode,
        status: gift.status,
        recipientName: gift.recipientName,
        failureReason: gift.failureReason,
        createdAt: gift.createdAt.toISOString(),
      }))}
    />
  )
}
