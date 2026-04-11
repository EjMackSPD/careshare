import { DefaultSession } from "next-auth"
import { OnboardingStatus, UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      onboardingStatus: OnboardingStatus
      onboardingStep: number
    } & DefaultSession["user"]
  }

  interface User {
    role?: UserRole
    onboardingStatus?: OnboardingStatus
    onboardingStep?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    onboardingStatus: OnboardingStatus
    onboardingStep: number
  }
}

