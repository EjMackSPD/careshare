import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function PostLoginPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin")
  }

  if (session.user.onboardingStatus !== "COMPLETED") {
    redirect("/onboarding")
  }

  redirect("/dashboard")
}
