# WACE v2 - Vercel Deployment Guide

This guide will walk you through deploying your WACE v2 application to Vercel, including setting up Git, environment variables, and all necessary services.

## Prerequisites

- A GitHub account (free)
- A Vercel account (free tier available)
- MongoDB Atlas account (free tier available)
- Resend account (free tier available)

---

## Step 1: Set Up Git Repository

### 1.1 Initialize Git (if not already done)

Open your terminal in the project directory and run:

```bash
git init
```

### 1.2 Create .gitignore (if not exists)

Make sure you have a `.gitignore` file that includes:

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Uploads
public/uploads/
```

### 1.3 Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it: `wace-v2` (or any name you prefer)
4. **DO NOT** initialize with README, .gitignore, or license (we already have files)
5. Click **Create repository**

### 1.4 Connect and Push to GitHub

In your terminal, run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: WACE v2"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/wace-v2.git

# Push to GitHub
git branch -M main
git push -u origin main
```

If prompted for credentials, use a **Personal Access Token** (not your password):
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` permissions
- Use this token as your password

---

## Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new **Free** cluster (M0)

### 2.2 Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password (save these!)
5. Set privileges to **Atlas admin** (or **Read and write to any database**)
6. Click **Add User**

### 2.3 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for Vercel deployment)
   - Or add specific IPs if you prefer
4. Click **Confirm**

### 2.4 Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your database user password
6. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority`

**Save this connection string!** You'll need it for Vercel.

---

## Step 3: Set Up Resend (Email Service)

### 3.1 Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 3.2 Create API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: `WACE Production`
4. Copy the API key (starts with `re_`)
5. **Save this key!** You won't see it again.

### 3.3 Add Domain (Optional for Production)

For production, you'll need to verify a domain. For now, you can use Resend's test domain for development.

---

## Step 4: Deploy to Vercel

### 4.1 Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with your GitHub account (recommended)

### 4.2 Import Project

1. Click **Add New...** → **Project**
2. Import your `wace-v2` repository from GitHub
3. Vercel will auto-detect Next.js

### 4.3 Configure Project Settings

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (default)
**Build Command:** `npm run build` (default)
**Output Directory:** `.next` (default)
**Install Command:** `npm install` (default)

### 4.4 Add Environment Variables

Click **Environment Variables** and add these:

#### Required Variables:

1. **MONGODB_URI**
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority`
   - Environment: Production, Preview, Development

2. **RESEND_API_KEY**
   - Value: Your Resend API key (starts with `re_`)
   - Environment: Production, Preview, Development

3. **NEXTAUTH_SECRET**
   - Value: Generate a random secret (see below)
   - Environment: Production, Preview, Development
   - Generate with: `openssl rand -base64 32` (or use [this generator](https://generate-secret.vercel.app/32))

4. **NEXTAUTH_URL**
   - Value: Your Vercel deployment URL
   - Example: `https://wace-v2.vercel.app` (will be provided after first deploy)
   - Environment: Production
   - For Preview: `https://wace-v2-git-main-yourusername.vercel.app`
   - For Development: `http://localhost:3000`

5. **AUTH_SECRET** (if used)
   - Value: Same as NEXTAUTH_SECRET
   - Environment: Production, Preview, Development

### 4.5 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://wace-v2.vercel.app`

### 4.6 Update NEXTAUTH_URL

After first deployment:
1. Go to **Settings** → **Environment Variables**
2. Update `NEXTAUTH_URL` with your actual Vercel URL
3. Redeploy (or it will auto-redeploy)

---

## Step 5: Post-Deployment Setup

### 5.1 Test Your Deployment

1. Visit your Vercel URL
2. Try signing up
3. Check if emails are sent (check Resend dashboard)
4. Verify database connection (create a pod, etc.)

### 5.2 Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### 5.3 Monitor Deployments

- Check **Deployments** tab for build logs
- Check **Analytics** for usage
- Check **Functions** for API route logs

---

## Step 6: Environment Variables Reference

Here's a complete list of all environment variables you need:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority

# Authentication
NEXTAUTH_SECRET=your-random-secret-here-min-32-chars
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_SECRET=your-random-secret-here-min-32-chars

# Email Service
RESEND_API_KEY=re_your_api_key_here
```

---

## Step 7: Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript errors locally first

### Database Connection Issues

1. Verify MongoDB Atlas network access allows all IPs
2. Check connection string format
3. Verify database user credentials

### Email Not Sending

1. Check Resend API key is correct
2. Verify domain is verified (if using custom domain)
3. Check Resend dashboard for error logs

### Authentication Issues

1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your deployment URL
3. Clear browser cookies and try again

---

## Step 8: Updating Your Deployment

After making changes:

```bash
# Make your changes locally
# Then commit and push:
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:
- Detect the push
- Build your project
- Deploy the new version

---

## Quick Checklist

- [ ] Git repository created and pushed to GitHub
- [ ] MongoDB Atlas cluster created and configured
- [ ] MongoDB connection string obtained
- [ ] Resend account created and API key obtained
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added to Vercel
- [ ] First deployment successful
- [ ] NEXTAUTH_URL updated with actual Vercel URL
- [ ] Tested signup/login
- [ ] Tested email sending
- [ ] Tested database operations

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Check Resend dashboard
4. Review error messages in browser console

---

## Notes

- **Free Tier Limits:**
  - Vercel: 100GB bandwidth/month, unlimited deployments
  - MongoDB Atlas: 512MB storage, shared cluster
  - Resend: 3,000 emails/month, 100 emails/day

- **Security:**
  - Never commit `.env.local` to Git
  - Use strong secrets for NEXTAUTH_SECRET
  - Regularly rotate API keys

- **Performance:**
  - Vercel automatically optimizes Next.js
  - MongoDB Atlas free tier is sufficient for development
  - Consider upgrading for production scale

