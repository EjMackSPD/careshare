# CareShare - Quick Start Guide

Get up and running in 5 minutes! 🚀

## Prerequisites
- Node.js 18+ installed
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))

## Setup Steps

### 1. Create Environment File
\`\`\`bash
# Copy the example and edit it
cp env.example .env
\`\`\`

Add your values:
\`\`\`env
DATABASE_URL="your-neon-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
\`\`\`

Generate secret: \`openssl rand -base64 32\`

### 2. Install & Setup Database
\`\`\`bash
npm install
npx prisma db push
\`\`\`

### 3. Run the App
\`\`\`bash
npm run dev
\`\`\`

Visit: [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Sign Up**: Go to `/signup` and create an account
2. **Create Family**: Click "Create Family Group"
3. **Add Events**: Plan birthdays, appointments, etc.
4. **Track Costs**: Add shared expenses

## Admin Access

To test admin features:
1. Run \`npx prisma studio\`
2. Open User table
3. Change your user's \`role\` to \`ADMIN\`
4. Visit `/admin/login`

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Need More Help?

- Full setup instructions: See `SETUP.md`
- Architecture details: See `PROJECT_OVERVIEW.md`
- Feature documentation: See `README.md`

---

**Ready to coordinate care? Let's go! 🎉**

