const SANDBOX_BASE_URL = "https://testflight.tremendous.com/api/v2"
const PRODUCTION_BASE_URL = "https://api.tremendous.com/api/v2"

export type GiftProduct = {
  id: string
  name: string
  category: string
  imageUrl: string | null
  minValue: number
  maxValue: number
  currencyCode: string
}

export type CreateGiftOrderInput = {
  externalId: string
  productId: string
  recipientName: string
  recipientEmail: string
  amount: number
  currencyCode: string
  message?: string | null
}

export type CreateGiftOrderResult = {
  orderId: string
  rewardId: string
  redemptionUrl: string | null
}

function getBaseUrl(): string {
  return process.env.TREMENDOUS_MODE === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL
}

export function isTremendousConfigured(): boolean {
  return Boolean(process.env.TREMENDOUS_API_KEY)
}

async function tremendousFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.TREMENDOUS_API_KEY

  if (!apiKey) {
    throw new Error("Tremendous is not configured (missing TREMENDOUS_API_KEY)")
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body?.errors?.[0]?.message || body?.message || `Tremendous request failed (${response.status})`
    throw new Error(message)
  }

  return body
}

export async function listGiftProducts(): Promise<GiftProduct[]> {
  if (!isTremendousConfigured()) {
    return []
  }

  const body = await tremendousFetch("/products")

  return (body?.products || []).map((product: any) => {
    const skus = product.skus || []
    const minValue = skus.length ? Math.min(...skus.map((sku: any) => sku.min)) : 0
    const maxValue = skus.length ? Math.max(...skus.map((sku: any) => sku.max)) : 0

    return {
      id: product.id,
      name: product.name,
      category: product.category || "other",
      imageUrl: product.images?.[0]?.src || null,
      minValue,
      maxValue,
      currencyCode: product.currency_codes?.[0] || "USD",
    }
  })
}

async function resolveFundingSourceId(): Promise<string> {
  const configured = process.env.TREMENDOUS_FUNDING_SOURCE_ID

  if (configured) {
    return configured
  }

  const body = await tremendousFetch("/funding_sources")
  const fundingSourceId = body?.funding_sources?.[0]?.id

  if (!fundingSourceId) {
    throw new Error("No Tremendous funding source is available on this account")
  }

  return fundingSourceId
}

export async function createGiftOrder(
  input: CreateGiftOrderInput
): Promise<CreateGiftOrderResult> {
  const fundingSourceId = await resolveFundingSourceId()

  const body = await tremendousFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      external_id: input.externalId,
      payment: { funding_source_id: fundingSourceId },
      rewards: [
        {
          products: [input.productId],
          recipient: {
            name: input.recipientName,
            email: input.recipientEmail,
          },
          value: {
            denomination: input.amount,
            currency_code: input.currencyCode,
          },
          delivery: { method: "EMAIL" },
          ...(input.message
            ? { meta: { message: input.message } }
            : {}),
        },
      ],
    }),
  })

  const reward = body?.order?.rewards?.[0]

  if (!reward) {
    throw new Error("Tremendous did not return a reward for this order")
  }

  return {
    orderId: body.order.id,
    rewardId: reward.id,
    redemptionUrl: reward.delivery?.link || null,
  }
}
