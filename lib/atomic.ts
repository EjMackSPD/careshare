function getBaseUrl(): string {
  return process.env.ATOMIC_ENV === "production"
    ? "https://api.atomicfi.com"
    : "https://sandbox-api.atomicfi.com"
}

export type AtomicOperation = "manage" | "deposit"

export type AtomicTaskDetails = {
  taskId: string
  status: "processing" | "completed" | "failed"
  product: string | null
  companyName: string | null
  distributionType: string | null
  distributionAmount: number | null
}

export function isAtomicConfigured(): boolean {
  return Boolean(process.env.ATOMIC_API_KEY && process.env.ATOMIC_API_SECRET)
}

async function atomicFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.ATOMIC_API_KEY
  const apiSecret = process.env.ATOMIC_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error("AtomicFi is not configured (missing ATOMIC_API_KEY/ATOMIC_API_SECRET)")
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey,
      "x-api-secret": apiSecret,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body?.message || body?.error?.message || `Atomic request failed (${response.status})`
    throw new Error(message)
  }

  return body
}

// Server-side call to mint a short-lived publicToken the client hands to the
// Transact SDK. `identifier` maps the Atomic-side user back to our User.id.
export async function createAccessToken(identifier: string): Promise<string> {
  const body = await atomicFetch("/access-token", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  })

  const publicToken = body?.data?.publicToken

  if (!publicToken) {
    throw new Error("Atomic did not return a publicToken")
  }

  return publicToken
}

export async function getTaskDetails(taskId: string): Promise<AtomicTaskDetails> {
  const body = await atomicFetch(`/task/${taskId}/details`)
  const data = body?.data ?? body

  const rawStatus = data?.status ?? data?.data?.status
  const status: AtomicTaskDetails["status"] =
    rawStatus === "completed" || rawStatus === "failed" ? rawStatus : "processing"

  return {
    taskId,
    status,
    product: data?.product ?? null,
    companyName: data?.company?.name ?? null,
    distributionType: data?.data?.distributionType ?? null,
    distributionAmount:
      typeof data?.data?.distributionAmount === "number" ? data.data.distributionAmount : null,
  }
}
