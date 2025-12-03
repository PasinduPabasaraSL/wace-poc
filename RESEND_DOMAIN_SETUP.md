# Resend Domain Configuration Guide

This guide will walk you through setting up your custom domain in Resend for sending emails from your WACE application.

## Why Configure a Custom Domain?

- **Professional appearance**: Emails come from your domain (e.g., `noreply@yourdomain.com`)
- **Better deliverability**: Custom domains have better email deliverability rates
- **Brand consistency**: Maintains your brand identity in email communications
- **No rate limits**: Custom domains don't have the same sending limits as test domains

---

## Step 1: Add Your Domain in Resend

1. **Log in to Resend**
   - Go to [https://resend.com](https://resend.com)
   - Sign in to your account

2. **Navigate to Domains**
   - Click on **"Domains"** in the left sidebar
   - Click **"Add Domain"** button

3. **Enter Your Domain**
   - Enter your domain name (e.g., `yourdomain.com`)
   - **Do NOT** include `www` or `http://`
   - Click **"Add Domain"**

---

## Step 2: Verify Domain Ownership

Resend will provide you with DNS records to add to your domain. You need to add these records to verify ownership and enable email sending.

### DNS Records to Add

Resend will show you several DNS records. Add all of them to your domain's DNS settings:

#### 1. **SPF Record** (TXT)
```
v=spf1 include:resend.com ~all
```
- **Type**: TXT
- **Name**: `@` (or your root domain)
- **Value**: `v=spf1 include:resend.com ~all`
- **TTL**: 3600 (or default)

#### 2. **DKIM Records** (TXT)
Resend will provide 3 DKIM records. Add all of them:
- **Type**: TXT
- **Name**: `resend._domainkey` (or similar, Resend will provide exact name)
- **Value**: (Resend provides this)
- **TTL**: 3600

#### 3. **DMARC Record** (TXT) - Optional but Recommended
```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```
- **Type**: TXT
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
- **TTL**: 3600

#### 4. **MX Record** (if using Resend for receiving emails)
- Usually not needed for sending only

---

## Step 3: Add DNS Records to Your Domain

The process depends on your domain registrar:

### Common Domain Registrars:

#### **Namecheap**
1. Go to **Domain List** → Select your domain
2. Click **"Advanced DNS"**
3. Click **"Add New Record"**
4. Select **TXT** type
5. Enter the record details from Resend
6. Click **"Save"**

#### **GoDaddy**
1. Go to **My Products** → **DNS**
2. Click **"Add"** under **Records**
3. Select **TXT** type
4. Enter the record details
5. Click **"Save"**

#### **Cloudflare**
1. Go to your domain dashboard
2. Click **"DNS"** in the left sidebar
3. Click **"Add record"**
4. Select **TXT** type
5. Enter the record details
6. Click **"Save"**

#### **Google Domains / Google Workspace**
1. Go to **DNS** settings
2. Click **"Custom records"**
3. Add **TXT** records
4. Save changes

---

## Step 4: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes** for most domains
- Resend will automatically check and verify your domain

**Check Status in Resend:**
- Go back to **Domains** in Resend
- You'll see the verification status
- Status will change from "Pending" to "Verified" when ready

---

## Step 5: Configure Your Application

Once your domain is verified in Resend:

### 1. Set Environment Variable

Add this to your Vercel environment variables:

**Variable Name:** `RESEND_FROM_EMAIL`  
**Value:** `WACE <noreply@yourdomain.com>` (replace with your domain)

**Format:**
```
Display Name <email@yourdomain.com>
```

**Examples:**
- `WACE <noreply@yourdomain.com>`
- `WACE Team <hello@yourdomain.com>`
- `WACE <notifications@yourdomain.com>`

### 2. Add to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **"Add New"**
4. **Key:** `RESEND_FROM_EMAIL`
5. **Value:** `WACE <noreply@yourdomain.com>` (your actual email)
6. Select environments: **Production**, **Preview**, **Development**
7. Click **"Save"**

### 3. Redeploy

After adding the environment variable:
- Vercel will automatically redeploy, OR
- Go to **Deployments** → Click **"Redeploy"** on the latest deployment

---

## Step 6: Test Your Setup

1. **Send a Test Invitation**
   - Go to your WACE app
   - Create or open a pod
   - Invite a member
   - Check if the email is received

2. **Check Email Headers**
   - Open the received email
   - Check "View Source" or "Show Original"
   - Verify the "From" address shows your domain

3. **Check Resend Dashboard**
   - Go to **Emails** in Resend
   - You should see sent emails
   - Check for any errors or bounces

---

## Troubleshooting

### Domain Not Verifying

**Issue:** Domain status stuck on "Pending"

**Solutions:**
1. **Wait longer**: DNS can take up to 48 hours
2. **Check DNS records**: Ensure all records are added correctly
3. **Verify record format**: Make sure there are no extra spaces or quotes
4. **Check TTL**: Lower TTL (300-600) can speed up propagation
5. **Use DNS checker**: Use [mxtoolbox.com](https://mxtoolbox.com) to verify records

### Emails Not Sending

**Issue:** Emails fail to send after domain verification

**Solutions:**
1. **Check RESEND_FROM_EMAIL**: Ensure it matches your verified domain
2. **Check API key**: Verify `RESEND_API_KEY` is set correctly
3. **Check Resend logs**: Look for error messages in Resend dashboard
4. **Verify domain status**: Ensure domain shows "Verified" in Resend

### Emails Going to Spam

**Issue:** Emails are delivered but go to spam folder

**Solutions:**
1. **Add DMARC record**: Helps with email authentication
2. **Warm up domain**: Start with low volume, gradually increase
3. **Use proper email content**: Avoid spam trigger words
4. **Check SPF/DKIM**: Ensure both are properly configured

### DNS Records Not Working

**Issue:** Can't add DNS records or they're not saving

**Solutions:**
1. **Check permissions**: Ensure you have DNS editing access
2. **Contact registrar**: Some registrars require support to add certain records
3. **Use subdomain**: Consider using a subdomain like `mail.yourdomain.com`
4. **Check record limits**: Some registrars limit number of TXT records

---

## Quick Reference

### Environment Variables Needed

```env
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (uses onboarding@resend.dev if not set)
RESEND_FROM_EMAIL=WACE <noreply@yourdomain.com>
```

### Email Format

```
Display Name <email@domain.com>
```

### Common Email Addresses

- `noreply@yourdomain.com` - For automated emails
- `hello@yourdomain.com` - For general communications
- `notifications@yourdomain.com` - For system notifications
- `support@yourdomain.com` - For support emails

---

## Next Steps

After setting up your domain:

1. ✅ Test sending invitations
2. ✅ Monitor email delivery in Resend dashboard
3. ✅ Check spam rates and adjust if needed
4. ✅ Set up email templates (optional)
5. ✅ Configure webhooks for email events (optional)

---

## Need Help?

- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **Resend Support**: [https://resend.com/support](https://resend.com/support)
- **DNS Checker**: [https://mxtoolbox.com](https://mxtoolbox.com)

---

**Note:** You can continue using `onboarding@resend.dev` for testing, but it's recommended to set up your custom domain for production use.

