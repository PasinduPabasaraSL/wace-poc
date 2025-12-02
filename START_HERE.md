# 🚀 START HERE - Deploy WACE v2 to Vercel

Follow these steps **in order**. Each step is simple and explained clearly.

---

## ✅ Step 1: Push Code to GitHub (5 minutes)

### 1.1 Create GitHub Account (if you don't have one)
- Go to https://github.com and sign up (free)

### 1.2 Create a New Repository
1. On GitHub, click the **+** icon (top right) → **New repository**
2. Name: `wace-v2`
3. **IMPORTANT:** Leave all checkboxes **UNCHECKED** (no README, no .gitignore)
4. Click **Create repository**

### 1.3 Push Your Code

Open PowerShell or Command Prompt in your project folder and run:

```bash
git add .
git commit -m "Initial commit: WACE v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wace-v2.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

**If asked for password:** 
- Go to https://github.com/settings/tokens
- Click **Generate new token (classic)**
- Name: `Vercel`
- Check **repo** checkbox
- Click **Generate token**
- **Copy the token** and use it as your password

---

## ✅ Step 2: MongoDB Atlas Setup (10 minutes)

### 2.1 Create Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up (free tier is fine)

### 2.2 Create Database
1. Create a **FREE** cluster (M0)
2. Wait 3-5 minutes for cluster to be created

### 2.3 Create Database User
1. Go to **Database Access** (left menu)
2. Click **Add New Database User**
3. Username: `waceuser`
4. Password: Create a strong password (SAVE IT!)
5. Privileges: **Atlas admin**
6. Click **Add User**

### 2.4 Allow Network Access
1. Go to **Network Access** (left menu)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere**
4. Click **Confirm**

### 2.5 Get Connection String
1. Go to **Database** (left menu)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database password
6. Add `/wace` before the `?` in the connection string

**Example:**
```
mongodb+srv://waceuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wace?retryWrites=true&w=majority
```

**SAVE THIS!** You'll need it for Vercel.

---

## ✅ Step 3: Resend Email Setup (5 minutes)

### 3.1 Create Account
- Go to https://resend.com
- Sign up (free)

### 3.2 Get API Key
1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name: `WACE`
4. Copy the key (starts with `re_`)
5. **SAVE THIS!** You won't see it again.

---

## ✅ Step 4: Deploy to Vercel (10 minutes)

### 4.1 Sign Up
- Go to https://vercel.com
- **Sign up with GitHub** (easiest way!)

### 4.2 Import Project
1. Click **Add New...** → **Project**
2. Find `wace-v2` repository
3. Click **Import**

### 4.3 Add Environment Variables

**BEFORE clicking Deploy**, add these variables:

#### 1. MONGODB_URI
- Click **Environment Variables**
- Name: `MONGODB_URI`
- Value: Your MongoDB connection string from Step 2.5
- Check: Production, Preview, Development

#### 2. RESEND_API_KEY
- Name: `RESEND_API_KEY`
- Value: Your Resend API key from Step 3.2
- Check: Production, Preview, Development

#### 3. NEXTAUTH_SECRET
- Name: `NEXTAUTH_SECRET`
- Value: Generate at https://generate-secret.vercel.app/32
- Check: Production, Preview, Development

#### 4. NEXTAUTH_URL
- Name: `NEXTAUTH_URL`
- Value: `https://wace-v2.vercel.app` (you'll update this after deploy)
- Check: **Production only** (uncheck others)

### 4.4 Deploy!
1. Click **Deploy**
2. Wait 2-5 minutes
3. Copy your deployment URL (like `https://wace-v2-abc123.vercel.app`)

### 4.5 Update NEXTAUTH_URL
1. Go to **Settings** → **Environment Variables**
2. Edit `NEXTAUTH_URL`
3. Change value to your actual Vercel URL
4. Save (Vercel will auto-redeploy)

---

## ✅ Step 5: Test!

1. Visit your Vercel URL
2. Sign up
3. Create a pod
4. Test features

---

## 🆘 Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Check `QUICK_DEPLOY.md` for quick reference
- Check Vercel build logs if something fails

---

## 📋 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas set up with connection string
- [ ] Resend API key obtained
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] NEXTAUTH_URL updated
- [ ] App tested and working

---

**That's it! Your app should be live! 🎉**

