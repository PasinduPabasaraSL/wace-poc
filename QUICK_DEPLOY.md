# Quick Deployment Guide - WACE v2 to Vercel

Follow these steps in order to deploy your app to Vercel.

---

## 🚀 Step 1: Initialize Git and Push to GitHub

### 1.1 Open Terminal in Your Project Folder

Navigate to: `C:\Users\Gagana\Downloads\Wace v2`

### 1.2 Run These Commands:

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: WACE v2"
```

### 1.3 Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **+** icon (top right) → **New repository**
3. Repository name: `wace-v2`
4. **DO NOT** check any boxes (no README, no .gitignore, no license)
5. Click **Create repository**

### 1.4 Push to GitHub

After creating the repo, GitHub will show you commands. Use these (replace `YOUR_USERNAME`):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wace-v2.git
git push -u origin main
```

**If asked for password:** Use a GitHub Personal Access Token:
- Go to: https://github.com/settings/tokens
- Click **Generate new token (classic)**
- Name: `Vercel Deploy`
- Select scope: `repo` (check the box)
- Click **Generate token**
- **Copy the token** (you won't see it again!)
- Use this token as your password when pushing

---

## 🗄️ Step 2: Set Up MongoDB Atlas

### 2.1 Create Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a **FREE** cluster (M0)

### 2.2 Create Database User

1. Go to **Database Access** (left menu)
2. Click **Add New Database User**
3. Authentication: **Password**
4. Username: `wace-admin` (or any name)
5. Password: Create a strong password (SAVE IT!)
6. Database User Privileges: **Atlas admin**
7. Click **Add User**

### 2.3 Allow Network Access

1. Go to **Network Access** (left menu)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (button)
4. Click **Confirm**

### 2.4 Get Connection String

1. Go to **Database** (left menu)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database password
8. Add database name: Change `?retryWrites=true` to `/wace?retryWrites=true`

**Final format:**
```
mongodb+srv://wace-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wace?retryWrites=true&w=majority
```

**SAVE THIS STRING!** You'll need it for Vercel.

---

## 📧 Step 3: Set Up Resend (Email)

### 3.1 Create Account

1. Go to https://resend.com
2. Sign up (free)
3. Verify your email

### 3.2 Get API Key

1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name: `WACE Production`
4. Copy the API key (starts with `re_`)
5. **SAVE THIS KEY!** You won't see it again.

---

## ☁️ Step 4: Deploy to Vercel

### 4.1 Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. **Sign up with GitHub** (recommended - easier!)

### 4.2 Import Project

1. After signing in, click **Add New...** → **Project**
2. Find your `wace-v2` repository
3. Click **Import**

### 4.3 Configure Project

Vercel will auto-detect Next.js. Keep these settings:
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4.4 Add Environment Variables

**BEFORE clicking Deploy**, click **Environment Variables** and add:

#### Variable 1: MONGODB_URI
- **Name:** `MONGODB_URI`
- **Value:** Your MongoDB connection string from Step 2.4
- **Environment:** Check all (Production, Preview, Development)

#### Variable 2: RESEND_API_KEY
- **Name:** `RESEND_API_KEY`
- **Value:** Your Resend API key from Step 3.2
- **Environment:** Check all (Production, Preview, Development)

#### Variable 3: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** Generate a random secret:
  - Go to: https://generate-secret.vercel.app/32
  - Click "Generate"
  - Copy the secret
- **Environment:** Check all (Production, Preview, Development)

#### Variable 4: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://wace-v2.vercel.app` (or your project name)
- **Note:** You'll update this after first deploy with the actual URL
- **Environment:** Production only (uncheck Preview and Development)

#### Variable 5: AUTH_SECRET (Optional - only if your code uses it)
- **Name:** `AUTH_SECRET`
- **Value:** Same as NEXTAUTH_SECRET (if needed)
- **Environment:** Check all (Production, Preview, Development)
- **Note:** Your code uses NEXTAUTH_SECRET, so this may not be needed

### 4.5 Deploy!

1. Click **Deploy**
2. Wait 2-5 minutes for build
3. Once done, you'll see: **"Congratulations! Your project has been deployed"**
4. Click the URL (like `https://wace-v2.vercel.app`)

### 4.6 Update NEXTAUTH_URL

1. Copy your actual Vercel URL (from the deployment page)
2. Go to **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`
4. Click **Edit**
5. Update value to your actual URL (e.g., `https://wace-v2-abc123.vercel.app`)
6. Click **Save**
7. Vercel will auto-redeploy

---

## ✅ Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try **Sign Up** with a new account
3. Check if you receive invitation emails (if you invite someone)
4. Create a pod
5. Test all features

---

## 🔧 Troubleshooting

### Build Fails?
- Check Vercel build logs
- Make sure all environment variables are set
- Verify MongoDB connection string format

### Can't Sign Up/Login?
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your Vercel URL
- Check MongoDB connection

### Emails Not Sending?
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for errors
- For production, you may need to verify a domain

### Database Errors?
- Check MongoDB Atlas network access (should allow all IPs)
- Verify connection string has correct password
- Check database user has proper permissions

---

## 📝 Environment Variables Summary

Add these to Vercel (Settings → Environment Variables):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wace?retryWrites=true&w=majority
RESEND_API_KEY=re_your_api_key_here
NEXTAUTH_SECRET=your-32-character-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## 🎉 You're Done!

Your app should now be live on Vercel! 

**To update your app in the future:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically deploy the new version!

