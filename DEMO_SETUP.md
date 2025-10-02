# Demo Mode Setup

To enable demo mode, you need to create a demo user and sample data.

## Quick Setup via Prisma Studio

Prisma Studio is already running at http://localhost:5555

### 1. Create Demo User

1. Open http://localhost:5555
2. Click on "User" table
3. Click "Add record"
4. Fill in:
   - **email**: `demo@careshare.app`
   - **name**: `Demo User`
   - **password**: Use this bcrypt hash: `$2a$10$YourHashHere`
   - **role**: `FAMILY_MEMBER`
5. Save

**To generate the password hash for "demo123":**
```javascript
// Run in browser console or Node.js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('demo123', 10));
```

Or use this pre-generated hash:
```
$2a$10$rOvHPz7c6QH8kN0vZ8XqFOK9uE7qJ5QxF0KqKjZqL8YqN5xL8kL8e
```

### 2. Run Seed Script (Alternative)

Once tsx is installed, you can run:
```bash
npm run seed
```

This will automatically create:
- Demo user (demo@careshare.app / demo123)
- Demo family group (Smith Family Care Group)
- 4 sample events (appointments, birthday, visits)
- 4 sample costs (medications, care services, equipment)

## Demo Mode Features

Once set up, users can click "Try Demo Mode" on the login page to:
- Auto-login as demo user
- View pre-populated family dashboard
- Explore events, costs, and member management
- Experience the full CareShare platform without registering

## Demo User Credentials

- **Email**: demo@careshare.app
- **Password**: demo123

## Reset Demo Data

To reset demo data, delete the demo user from Prisma Studio and re-run the seed script.

