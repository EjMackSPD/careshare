const METHOD_VERSION = "2026-03-30"

function getBaseUrl(): string {
  switch (process.env.METHOD_ENV) {
    case "production":
      return "https://production.methodfi.com"
    case "sandbox":
      return "https://sandbox.methodfi.com"
    default:
      return "https://dev.methodfi.com"
  }
}

export type MethodLiabilityAccount = {
  accountId: string
  entityId: string
  liabilityType: string | null
  name: string | null
  mask: string | null
  status: string | null
  balanceCurrent: number | null
}

export type CreateEntityInput = {
  firstName: string
  lastName: string
  email?: string
  phone: string
}

export function isMethodConfigured(): boolean {
  return Boolean(process.env.METHOD_API_KEY)
}

async function methodFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.METHOD_API_KEY

  if (!apiKey) {
    throw new Error("Method Financial is not configured (missing METHOD_API_KEY)")
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Method-Version": METHOD_VERSION,
      ...(init?.headers || {}),
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body?.error?.message || body?.message || `Method request failed (${response.status})`
    throw new Error(message)
  }

  return body
}

export async function createIndividualEntity(input: CreateEntityInput): Promise<string> {
  const body = await methodFetch("/entities", {
    method: "POST",
    body: JSON.stringify({
      type: "individual",
      individual: {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
      },
    }),
  })

  const entityId = body?.data?.id

  if (!entityId) {
    throw new Error("Method did not return an entity id")
  }

  return entityId
}

export async function createConnectSession(entityId: string): Promise<string[]> {
  const body = await methodFetch(`/entities/${entityId}/connect`, {
    method: "POST",
  })

  return body?.accounts || []
}

export async function getLiabilityAccount(
  accountId: string
): Promise<MethodLiabilityAccount> {
  const data = await methodFetch(`/accounts/${accountId}?expand[]=balance`)

  if (!data?.id) {
    throw new Error("Method did not return account data")
  }

  return {
    accountId: data.id,
    entityId: data.holder_id,
    liabilityType: data.liability?.type || data.type || null,
    name: data.liability?.name || null,
    mask: data.liability?.mask || null,
    status: data.status || null,
    balanceCurrent:
      typeof data.balance?.amount === "number" ? data.balance.amount / 100 : null,
  }
}

export async function listLiabilityAccountsForEntity(
  entityId: string
): Promise<MethodLiabilityAccount[]> {
  const body = await methodFetch(
    `/accounts?holder_id=${entityId}&type=liability&status=active`
  )

  const accounts = body?.data || []

  return Promise.all(
    accounts.map((account: { id: string }) => getLiabilityAccount(account.id))
  )
}
