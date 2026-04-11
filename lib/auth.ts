import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { OnboardingStatus } from "@prisma/client"

const providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...providers,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingStatus: user.onboardingStatus,
          onboardingStep: user.onboardingStep,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.onboardingStatus = (user as any).onboardingStatus
        token.onboardingStep = (user as any).onboardingStep
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            onboardingStatus: true,
            onboardingStep: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.onboardingStatus = dbUser.onboardingStatus
          token.onboardingStep = dbUser.onboardingStep
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role as string
        (session.user as any).id = token.id as string
        ;(session.user as any).onboardingStatus =
          token.onboardingStatus as OnboardingStatus
        ;(session.user as any).onboardingStep = token.onboardingStep as number
      }
      return session
    },
    async signIn({ user }) {
      if (!user.email) {
        return false
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (!existingUser) {
        return true
      }

      if (existingUser.onboardingStatus === OnboardingStatus.NOT_STARTED) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            onboardingStatus: OnboardingStatus.IN_PROGRESS,
            onboardingStep: 1,
          },
        })
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      if (new URL(url).origin === baseUrl) {
        return url
      }

      return `${baseUrl}/auth/post-login`
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

