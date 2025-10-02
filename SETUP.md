# CareShare - Complete Setup Guide

This guide will walk you through setting up the CareShare application from scratch.

## Prerequisites

Before you begin, make sure you have:
- Node.js 18 or later installed
- npm (comes with Node.js)
- A GitHub account (for deployment)
- A Neon account (free tier available at [neon.tech](https://neon.tech))

## Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/sign in
2. Create a new project (e.g., "careshare-db")
3. Copy your database connection string - it looks like:
   \`\`\`
   postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   \`\`\`
4. Save this for the next step

## Step 2: Configure Environment Variables

1. In the project root, create a \`.env\` file:
   \`\`\`bash
   cp env.example .env
   \`\`\`

2. Edit the \`.env\` file and update the values:
   \`\`\`env
   DATABASE_URL="your-neon-connection-string-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="run: openssl rand -base64 32"
   \`\`\`

3. To generate a secure \`NEXTAUTH_SECRET\`, run in your terminal:
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`
   Copy the output and paste it as your \`NEXTAUTH_SECRET\`

## Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install all required packages and automatically generate the Prisma client.

## Step 4: Set Up the Database

Push the Prisma schema to your Neon database:

\`\`\`bash
npx prisma db push
\`\`\`

This creates all the necessary tables in your database.

## Step 5: Create Test Users (Optional)

To test the application, you'll need some users. You can create them using Prisma Studio:

\`\`\`bash
npx prisma studio
\`\`\`

This opens a GUI at \`http://localhost:5555\` where you can:

### Create a Family Member User:
1. Click on "User" table
2. Click "Add record"
3. Fill in:
   - email: \`test@example.com\`
   - name: \`Test User\`
   - password: Use a bcrypt hash (see below)
   - role: \`FAMILY_MEMBER\`
4. Click "Save 1 change"

### Create an Admin User:
1. Click on "User" table
2. Click "Add record"
3. Fill in:
   - email: \`admin@example.com\`
   - name: \`Admin User\`
   - password: Use a bcrypt hash (see below)
   - role: \`ADMIN\`
4. Click "Save 1 change"

### Generate Password Hash:

Run this in Node.js console or create a quick script:

\`\`\`javascript
// In terminal: node
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('password123', 10);
console.log(hash);
// Copy the output to use as password in Prisma Studio
\`\`\`

Or just use the signup page at \`http://localhost:3000/signup\` once the app is running!

## Step 6: Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:3000\`

## Step 7: Test the Application

### Test Family Member Flow:
1. Go to \`http://localhost:3000/signup\`
2. Create a new account
3. Login at \`http://localhost:3000/login\`
4. Create a family group
5. Add events and costs

### Test Admin Flow:
1. Create an admin user in Prisma Studio (see Step 5)
2. Go to \`http://localhost:3000/admin/login\`
3. Login with admin credentials
4. View the admin dashboard

## Step 8: Deploy to Vercel

### Push to GitHub:

\`\`\`bash
git add .
git commit -m "Initial CareShare setup"
git remote add origin https://github.com/yourusername/careshare.git
git push -u origin main
\`\`\`

### Deploy on Vercel:

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - \`DATABASE_URL\`: Your Neon connection string
   - \`NEXTAUTH_SECRET\`: Your generated secret
   - \`NEXTAUTH_URL\`: Your Vercel URL (e.g., \`https://careshare.vercel.app\`)
5. Click "Deploy"

### Update Environment:

Once deployed, update your \`.env\` locally and in Vercel:
- Change \`NEXTAUTH_URL\` to your production URL

## Troubleshooting

### "Module not found" errors
\`\`\`bash
rm -rf node_modules
rm package-lock.json
npm install
\`\`\`

### Prisma Client errors
\`\`\`bash
npx prisma generate
\`\`\`

### Database connection issues
- Verify your \`DATABASE_URL\` is correct
- Make sure your Neon database is active
- Check that \`?sslmode=require\` is at the end of the URL

### NextAuth errors
- Ensure \`NEXTAUTH_SECRET\` is set
- Verify \`NEXTAUTH_URL\` matches your current environment

## Next Steps

### Recommended Actions:
1. Create your first family group
2. Invite team members
3. Add some events and costs
4. Explore the admin portal (if you have admin access)

### Customize the Application:
1. Update branding colors in CSS modules
2. Add your logo
3. Customize email notifications
4. Add more features!

## Database Management

### View Database:
\`\`\`bash
npx prisma studio
\`\`\`

### Create Migration (for production):
\`\`\`bash
npx prisma migrate dev --name description-of-change
\`\`\`

### Reset Database (⚠️ Deletes all data):
\`\`\`bash
npx prisma db push --force-reset
\`\`\`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Neon Documentation](https://neon.tech/docs)

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure your database is accessible
4. Review the README.md for additional information

---

Happy coordinating! 🎉

