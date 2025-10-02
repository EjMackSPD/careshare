# CareShare

A platform that helps loved ones coordinate care for elderly family members. CareShare enables families to share costs, organize food deliveries, pay bills, and plan events like birthdays.

## Features

- 🏠 **Marketing Site**: Public-facing pages explaining the platform
- 👨‍👩‍👧‍👦 **Family Coordination**: Create family groups and invite members
- 💰 **Cost Management**: Track expenses, split bills, and manage contributions
- 📅 **Event Planning**: Schedule appointments, birthdays, and visits
- 🏥 **Admin Portal**: For nursing homes and care providers to manage multiple families
- 🔐 **Role-Based Access**: Family members and admin roles with protected routes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (sign up at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository and navigate to the project:

\`\`\`bash
cd care-share
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file in the root directory:

\`\`\`env
# Database URL from Neon
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Generate a secret with: openssl rand -base64 32
\`\`\`

4. Generate Prisma Client and run migrations:

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

5. (Optional) Seed the database with test data:

\`\`\`bash
# Create an admin user
npx prisma studio
# Use Prisma Studio to manually create a user with role="ADMIN"
\`\`\`

6. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
care-share/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── families/             # Family CRUD operations
│   │   ├── events/               # Event management
│   │   └── costs/                # Cost tracking
│   ├── admin/                    # Admin portal pages
│   ├── dashboard/                # User dashboard
│   ├── family/                   # Family management pages
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── features/                 # Features page
│   ├── demo/                     # Demo page
│   └── page.tsx                  # Home page
├── lib/                          # Shared utilities
│   ├── auth.ts                   # NextAuth configuration
│   ├── auth-utils.ts             # Auth helper functions
│   └── prisma.ts                 # Prisma client
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema
└── middleware.ts                 # Protected routes middleware
\`\`\`

## Database Schema

The application uses the following main models:

- **User**: Authentication and profile information
- **Family**: Family groups for coordinating care
- **FamilyMember**: Junction table for family membership
- **Event**: Birthdays, appointments, and other events
- **Cost**: Shared expenses and bills
- **AdminFamily**: Links admins to families they manage

See \`prisma/schema.prisma\` for the complete schema.

## Authentication

- **Family Members**: Sign up at \`/signup\` and log in at \`/login\`
- **Admins**: Log in at \`/admin/login\`
- Users are created with \`FAMILY_MEMBER\` role by default
- Admins must be created manually in the database with \`ADMIN\` role

## API Routes

### Authentication
- \`POST /api/auth/signup\` - Create new user account
- \`POST /api/auth/[...nextauth]\` - NextAuth endpoints

### Families
- \`GET /api/families\` - Get user's families
- \`POST /api/families\` - Create new family
- \`GET /api/families/[familyId]/events\` - Get family events
- \`POST /api/families/[familyId]/events\` - Create event
- \`GET /api/families/[familyId]/costs\` - Get family costs
- \`POST /api/families/[familyId]/costs\` - Create cost

### Events & Costs
- \`PATCH /api/events/[eventId]\` - Update event
- \`DELETE /api/events/[eventId]\` - Delete event
- \`PATCH /api/costs/[costId]\` - Update cost
- \`DELETE /api/costs/[costId]\` - Delete cost

## Deployment to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables in Vercel dashboard:
   - \`DATABASE_URL\` (from Neon)
   - \`NEXTAUTH_URL\` (your Vercel domain)
   - \`NEXTAUTH_SECRET\` (generate a secure random string)

4. Deploy! Vercel will automatically detect Next.js and configure the build.

## Development Commands

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma commands
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema changes to database
npx prisma migrate dev # Create and apply migrations
\`\`\`

## Features Overview

### For Families
- Create and join family groups
- Track shared expenses and contributions
- Plan and schedule events
- Coordinate care activities
- View dashboard with upcoming tasks

### For Care Providers (Admins)
- Manage multiple family groups
- View engagement analytics
- Monitor family activity
- Support families with coordination

## Future Enhancements

- Real-time notifications
- Mobile app
- Payment processing integration
- Document sharing
- Medication tracking
- Care provider scheduling
- Video chat integration

## License

This project is built for demonstration purposes.

## Support

For questions or issues, please open an issue on GitHub.
