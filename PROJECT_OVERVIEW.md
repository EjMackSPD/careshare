# CareShare - Project Overview

## What is CareShare?

CareShare is a full-stack web application built with Next.js 14 that helps families coordinate care for elderly relatives. It provides tools for managing shared costs, planning events, and organizing care responsibilities.

## Key Features

### 1. Marketing Website
- **Home Page** (`/`): Value proposition and benefits
- **Features Page** (`/features`): Detailed feature explanations
- **Demo Page** (`/demo`): Step-by-step product walkthrough
- All styled with CSS Modules for modern, responsive design

### 2. Authentication System
- **NextAuth.js**: Secure JWT-based authentication
- **Role-Based Access**: Family members and admins have different permissions
- **Protected Routes**: Middleware ensures only authenticated users can access private pages
- **Separate Login Flows**: Different entry points for families and admins

### 3. Family Coordination
- **Family Groups**: Create and manage multiple family groups
- **Member Management**: Invite and organize family members
- **Dashboard**: Overview of all family activities, costs, and events
- **Role System**: Organizers and regular members

### 4. Cost Management
- **Expense Tracking**: Record all care-related expenses
- **Bill Splitting**: Assign costs to specific family members
- **Status Tracking**: Monitor pending, paid, and overdue payments
- **Financial Overview**: See who paid what and when

### 5. Event Planning
- **Multiple Event Types**: Birthdays, appointments, food deliveries, visits
- **Calendar View**: See all upcoming events
- **Event Details**: Location, description, and date/time
- **Family Coordination**: Everyone sees the same events

### 6. Admin Portal
- **Care Provider Access**: Separate admin interface
- **Multi-Family Management**: Admins can oversee multiple families
- **Analytics Dashboard**: View engagement metrics
- **Family Support**: Help families stay organized

## Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14 | React framework with App Router |
| **Language** | TypeScript | Type-safe development |
| **Styling** | CSS Modules | Component-scoped styling |
| **Database** | Neon PostgreSQL | Serverless Postgres database |
| **ORM** | Prisma | Type-safe database access |
| **Authentication** | NextAuth.js | Secure authentication |
| **Hosting** | Vercel | Optimized Next.js hosting |

## Project Structure

\`\`\`
care-share/
├── app/                          # Next.js 14 App Router
│   ├── (marketing)/
│   │   ├── page.tsx              # Home page
│   │   ├── features/             # Features page
│   │   └── demo/                 # Demo page
│   │
│   ├── (auth)/
│   │   ├── login/                # Family login
│   │   └── signup/               # User registration
│   │
│   ├── (authenticated)/
│   │   ├── dashboard/            # Main dashboard
│   │   └── family/               # Family management
│   │       ├── page.tsx          # Family list
│   │       ├── create/           # Create family
│   │       └── [id]/             # Family details
│   │
│   ├── admin/                    # Admin portal
│   │   ├── page.tsx              # Admin dashboard
│   │   └── login/                # Admin login
│   │
│   └── api/                      # API routes
│       ├── auth/
│       │   ├── [...nextauth]/    # NextAuth endpoints
│       │   └── signup/           # Registration endpoint
│       ├── families/             # Family CRUD
│       │   └── [familyId]/
│       │       ├── events/       # Event endpoints
│       │       └── costs/        # Cost endpoints
│       ├── events/[eventId]/     # Event update/delete
│       └── costs/[costId]/       # Cost update/delete
│
├── lib/                          # Shared utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth configuration
│   └── auth-utils.ts             # Auth helper functions
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── types/
│   └── next-auth.d.ts            # NextAuth type extensions
│
└── middleware.ts                 # Route protection
\`\`\`

## Database Schema

### Core Models

**User**
- Authentication credentials
- Name, email, password
- Role: FAMILY_MEMBER or ADMIN
- Relations to families, costs, and admin assignments

**Family**
- Family group information
- Name, description, elder name
- Creator reference
- Relations to members, events, and costs

**FamilyMember** (Junction Table)
- Links users to families
- Role: member or organizer
- Join date tracking

**Event**
- Scheduled events
- Type: BIRTHDAY, APPOINTMENT, FOOD_DELIVERY, VISIT, OTHER
- Date, location, description
- Belongs to a family

**Cost**
- Shared expenses
- Amount, description
- Status: PENDING, PAID, OVERDUE
- Can be assigned to specific user
- Belongs to a family

**AdminFamily** (Junction Table)
- Links admin users to families they manage
- Enables multi-family oversight

## API Architecture

### RESTful Endpoints

All API routes follow REST conventions:

- **GET**: Retrieve data
- **POST**: Create new resources
- **PATCH**: Update existing resources
- **DELETE**: Remove resources

### Authentication
Every API route checks authentication using NextAuth:
\`\`\`typescript
const user = await getCurrentUser()
if (!user) return unauthorized
\`\`\`

### Authorization
Family-related endpoints verify membership:
\`\`\`typescript
const isMember = await checkFamilyMembership(userId, familyId)
if (!isMember) return forbidden
\`\`\`

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure session management
3. **CSRF Protection**: Built into NextAuth
4. **SQL Injection Prevention**: Prisma ORM parameterized queries
5. **Role-Based Access Control**: Middleware enforces permissions
6. **Environment Variables**: Sensitive data never in code

## Styling Approach

### CSS Modules
Each component has its own scoped stylesheet:
- `page.tsx` → `page.module.css`
- No global style conflicts
- Easy to maintain and understand

### Design System
- **Primary Color**: Blue (#2563eb) for family features
- **Secondary Color**: Cyan (#0ea5e9) for admin features
- **Neutral Colors**: Grays for text and backgrounds
- **Typography**: System fonts for fast loading
- **Responsive**: Mobile-first approach

## Development Workflow

### Local Development
\`\`\`bash
npm run dev          # Start dev server
npx prisma studio    # Open database GUI
\`\`\`

### Database Changes
\`\`\`bash
# 1. Edit prisma/schema.prisma
# 2. Push changes
npx prisma db push
# 3. Regenerate client
npx prisma generate
\`\`\`

### Deployment
\`\`\`bash
git push origin main  # Vercel auto-deploys
\`\`\`

## Environment Variables

Required for all environments:
- \`DATABASE_URL\`: Neon PostgreSQL connection string
- \`NEXTAUTH_URL\`: Application URL
- \`NEXTAUTH_SECRET\`: Random secure string

## Future Enhancement Ideas

### Phase 2
- Email notifications for events
- Mobile responsive improvements
- PDF report generation
- Document uploads

### Phase 3
- Real-time updates (WebSockets)
- Mobile apps (React Native)
- Payment processing (Stripe)
- Calendar integrations

### Phase 4
- Video chat integration
- Medication tracking
- Care provider scheduling
- Health record management

## Testing Approach

For production, consider adding:
- Unit tests (Jest)
- Integration tests (Playwright)
- E2E tests for critical flows
- API tests for all endpoints

## Performance Optimizations

Built-in optimizations:
- **Server Components**: Reduced JavaScript to client
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Static Generation**: Marketing pages can be static
- **Database Indexing**: Strategic indexes in Prisma schema

## Scalability Considerations

Current architecture supports:
- Thousands of families
- Hundreds of concurrent users
- Millions of events/costs

Neon and Vercel both scale automatically.

## Contributing Guidelines

When adding features:
1. Follow existing file structure
2. Use TypeScript strictly
3. Create CSS Modules for styles
4. Add API authentication checks
5. Update Prisma schema if needed
6. Test thoroughly before deploying

## License & Usage

This is a demonstration project built to showcase:
- Modern Next.js development
- Full-stack TypeScript
- Prisma ORM
- NextAuth.js authentication
- CSS Modules styling
- Vercel deployment

Feel free to use as a template for similar projects!

---

**Built with ❤️ using Next.js 14, TypeScript, and Prisma**

