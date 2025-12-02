# WACE Platform - Setup Guide

## Quick Start

Follow these steps to get WACE running on your local machine.

---

## Step 1: Install Dependencies

```bash
npm install
# or
pnpm install
```

This will install all required packages including:
- MongoDB/Mongoose
- NextAuth.js
- Resend
- And all other dependencies

---

## Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new organization (or use default)
4. Create a new project (or use default)

### 2.2 Create a Free Cluster

1. Click "Build a Database"
2. Choose "FREE" (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Name your cluster (e.g., "wace-cluster")
5. Click "Create"

### 2.3 Create Database User

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set user privileges to "Atlas admin" (for development)
6. Click "Add User"

### 2.4 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, use specific IPs
4. Click "Confirm"

### 2.5 Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name at the end: `...majority/wace`

**Final connection string format:**
```
mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority
```

---

## Step 3: Set Up Resend (Email Service)

### 3.1 Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up for a free account
3. Verify your email

### 3.2 Get API Key

1. Go to "API Keys" in the dashboard
2. Click "Create API Key"
3. Name it (e.g., "WACE Development")
4. Copy the API key (starts with `re_`)

**Note**: For development, you can use `onboarding@resend.dev` as the sender email. For production, you'll need to verify your domain.

---

## Step 4: Configure Environment Variables

### 4.1 Create `.env.local` File

In the root of your project, create a file named `.env.local`:

```bash
touch .env.local
```

### 4.2 Add Environment Variables

Copy the content from `.env.example` and fill in your values:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Resend Email API
RESEND_API_KEY=re_your_resend_api_key_here

# Environment
NODE_ENV=development
```

### 4.3 Generate NEXTAUTH_SECRET

Generate a secure secret key:

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use an online generator:**
- Visit: https://generate-secret.vercel.app/32

Copy the generated string and paste it as `NEXTAUTH_SECRET` in your `.env.local`.

---

## Step 5: Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

The server will start on `http://localhost:3000`

---

## Step 6: Test the Setup

### 6.1 Create a Test User

1. Open `http://localhost:3000`
2. Navigate to signup page (if exists) or use API directly
3. Create a test account

### 6.2 Verify Database Connection

Check your MongoDB Atlas dashboard:
1. Go to "Database" → "Browse Collections"
2. You should see a `users` collection after creating a user
3. Collections will be created automatically when you use them

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: bad auth"**
- Check your username and password in the connection string
- Verify the database user exists in MongoDB Atlas

**Error: "MongoNetworkError"**
- Check your network access settings in MongoDB Atlas
- Ensure your IP is whitelisted (or 0.0.0.0/0 for development)

**Error: "MONGODB_URI is not defined"**
- Ensure `.env.local` exists in the root directory
- Restart your development server after adding environment variables

### NextAuth Issues

**Error: "NEXTAUTH_SECRET is not defined"**
- Add `NEXTAUTH_SECRET` to `.env.local`
- Restart the development server

**Session not persisting**
- Clear browser cookies
- Check that `NEXTAUTH_URL` matches your current URL

### Email Issues

**Emails not sending**
- Verify your Resend API key is correct
- Check Resend dashboard for any errors
- For testing, ensure you're using a valid email address

---

## Next Steps

Once setup is complete:

1. ✅ Test user signup/login
2. ✅ Create your first pod
3. ✅ Test pod invitation system
4. ✅ Create blocks in the canvas
5. ✅ Test chat functionality
6. ✅ Upload documents
7. ✅ Create calendar events
8. ✅ Add goals

---

## Production Deployment

When ready to deploy:

1. **Update MongoDB Network Access**
   - Remove `0.0.0.0/0` access
   - Add Vercel IP ranges or specific IPs

2. **Update Environment Variables in Vercel**
   - Add all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production URL

3. **Verify Resend Domain**
   - Add and verify your domain in Resend
   - Update sender email in `lib/email.ts`

4. **Deploy to Vercel**
   - Push code to GitHub
   - Import project in Vercel
   - Add environment variables
   - Deploy

---

## Need Help?

- Check `DEVELOPER_DOCUMENTATION.md` for detailed API documentation
- Review MongoDB Atlas documentation
- Check NextAuth.js documentation
- Review Resend documentation

---

**Happy Coding! 🚀**

