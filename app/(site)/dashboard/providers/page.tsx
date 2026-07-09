import { getPublishedProviders } from "@/lib/cms"
import ProviderDirectory from "@/app/components/ProviderDirectory"

export default async function ProvidersPage() {
  const providers = await getPublishedProviders()

  return <ProviderDirectory providers={providers} />
}
