# Production Deployment Guide

## 🚀 Overview

This guide covers deploying the Surprise Parking App to production on **Cloudflare Pages** (recommended) or **Vercel**.

---

## Prerequisites

- [x] Node.js 20.x installed
- [x] Git repository set up
- [x] PostgreSQL database (Neon, Supabase, or Railway recommended)
- [x] GitHub account
- [x] Cloudflare or Vercel account

---

## 🎯 Quick Start

### Option 1: Cloudflare Pages (Recommended)

**Why Cloudflare?**
- ✅ Free tier with unlimited bandwidth
- ✅ Global CDN with 300+ locations
- ✅ Built-in DDoS protection
- ✅ Automatic HTTPS
- ✅ Excellent performance

**Steps:**

1. **Create Cloudflare Pages Project**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   
   # Create project (first time only)
   wrangler pages project create surprise-app
   ```

2. **Set Environment Variables**
   - Go to: https://dash.cloudflare.com
   - Navigate to: Pages > surprise-app > Settings > Environment variables
   - Add the following:

   ```env
   DATABASE_URL=<your-neon-or-supabase-connection-string>
   SESSION_SECRET=<random-32-char-string>
   NODE_ENV=production
   VITE_APP_URL=https://surprise-app.pages.dev
   ```

3. **Deploy**
   ```bash
   # Build the app
   npm run build
   
   # Deploy to Cloudflare
   npm run deploy:cloudflare
   ```

4. **Set Up Automatic Deployments**
   - The CI/CD workflow is already configured
   - Push to `main` branch triggers production deployment
   - Pull requests deploy preview environments

---

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add SESSION_SECRET production
   vercel env add NODE_ENV production
   ```

4. **Deploy**
   ```bash
   npm run deploy:vercel
   ```

---

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

1. **Create Neon Account**: https://neon.tech
2. **Create Project**: "Surprise Parking"
3. **Copy Connection String**
4. **Run Migrations**:
   ```bash
   DATABASE_URL="<neon-connection-string>" npm run db:migrate
   ```
5. **Seed Data** (optional):
   ```bash
   DATABASE_URL="<neon-connection-string>" npm run db:seed
   ```

### Option 2: Supabase

1. Go to: https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Run migrations as above

### Option 3: Railway

1. Go to: https://railway.app
2. Create PostgreSQL database
3. Get connection string
4. Run migrations

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Random secret for sessions | `generate-32-char-random-string` |
| `NODE_ENV` | Environment | `production` |
| `VITE_APP_URL` | Your app URL | `https://yourapp.pages.dev` |

### Optional Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Payment processing |
| `STRIPE_SECRET_KEY` | Stripe secret key | Payment processing |
| `RESEND_API_KEY` | Resend API key | Email notifications |
| `SENTRY_DSN` | Sentry DSN | Error tracking |
| `CLOUDFLARE_ACCOUNT_ID` | CF Account ID | CF deployment |
| `CLOUDFLARE_API_TOKEN` | CF API token | CF deployment |

---

## 🔧 GitHub Secrets Setup

For automated deployments, add these secrets to your GitHub repository:

**Settings > Secrets and variables > Actions > New repository secret**

### For Cloudflare Pages:
```
CLOUDFLARE_API_TOKEN      # Your Cloudflare API token
CLOUDFLARE_ACCOUNT_ID     # Your Cloudflare account ID
```

### For Vercel (optional):
```
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID            # Vercel organization ID
VERCEL_PROJECT_ID        # Vercel project ID
```

---

## 🚦 CI/CD Pipeline

The app includes a complete CI/CD pipeline that automatically:

### On Pull Request:
- ✅ Runs type checking
- ✅ Runs unit tests
- ✅ Runs E2E tests
- ✅ Builds the application
- ✅ Deploys preview environment

### On Push to Main:
- ✅ All PR checks
- ✅ Deploys to production (Cloudflare Pages)
- ✅ Optionally deploys to Vercel (with `[vercel]` in commit message)

### Workflow File
Location: `.github/workflows/ci-cd.yml`

---

## 📊 Monitoring & Analytics

### 1. Cloudflare Analytics
- Built-in analytics at: Pages > surprise-app > Analytics
- Real-time traffic data
- Performance metrics
- Geographic distribution

### 2. Sentry (Error Tracking)
```bash
# Install Sentry
npm install @sentry/react @sentry/vite-plugin

# Add to vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";
```

Add to `src/client.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 3. Web Vitals
Already configured in `src/client.tsx` with `reportWebVitals()`

---

## 🔒 Security Checklist

- [x] Environment variables not committed to Git
- [x] HTTPS enabled (automatic with Cloudflare/Vercel)
- [x] Security headers configured (vercel.json)
- [x] CORS properly configured
- [x] Database connection over SSL
- [x] Session secrets are strong and unique
- [x] Error boundaries prevent crashes
- [x] Input validation on all forms
- [x] SQL injection protection (using Drizzle ORM)
- [x] XSS protection (React escapes by default)

---

## 🎨 Custom Domain Setup

### Cloudflare Pages:
1. Go to: Pages > surprise-app > Custom domains
2. Click "Set up a custom domain"
3. Add your domain (e.g., `surprise.example.com`)
4. Update DNS records as instructed
5. SSL certificate is automatic

### Vercel:
1. Project Settings > Domains
2. Add your domain
3. Configure DNS (A record or CNAME)
4. Wait for verification

---

## 🧪 Pre-Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Test data seeded (if needed)
- [ ] All tests passing locally
- [ ] Build succeeds: `npm run build`
- [ ] Type check passes: `npm run typecheck`
- [ ] Preview deployment tested
- [ ] SSL certificate configured
- [ ] Custom domain setup (if applicable)
- [ ] Monitoring/analytics setup
- [ ] Error tracking configured

---

## 📈 Performance Optimization

Already implemented:
- ✅ Code splitting (lazy-loaded routes)
- ✅ Asset optimization (Vite handles this)
- ✅ Image optimization
- ✅ Caching headers configured
- ✅ Service worker ready (public/sw.js)
- ✅ Bundle size optimization

To improve further:
1. **Enable service worker** for offline support
2. **Add image CDN** (Cloudflare Images)
3. **Implement lazy loading** for images
4. **Use Suspense** for code splitting

---

## 🔄 Deployment Commands

```bash
# Setup environment (first time)
npm run setup:env

# Run migrations on production DB
DATABASE_URL="<prod-db-url>" npm run db:migrate

# Seed production data (optional)
DATABASE_URL="<prod-db-url>" npm run db:seed

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Cloudflare
npm run deploy:cloudflare

# Deploy to Vercel
npm run deploy:vercel

# Type check
npm run typecheck

# Run tests
npm test
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Database Connection Issues
```bash
# Test connection
psql "<your-database-url>"

# Check if DATABASE_URL is set
echo $DATABASE_URL
```

### Preview Not Working
```bash
# Ensure build succeeded
npm run build

# Check dist folder exists
ls -la dist/

# Try preview again
npm run preview
```

### E2E Tests Timeout
```bash
# Install browsers
npx playwright install chromium

# Run with debug mode
npx playwright test --debug
```

---

## 📞 Support & Resources

### Documentation
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Vite Docs](https://vitejs.dev/)

### Project Documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [IMPROVEMENT_GUIDE.md](./IMPROVEMENT_GUIDE.md) - Enhancement ideas
- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - Completed features
- [IMPROVEMENTS_TEST_REPORT.md](./IMPROVEMENTS_TEST_REPORT.md) - Test results

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test the Production App**
   - Visit your production URL
   - Test all major features
   - Check analytics dashboard
   - Verify mobile responsiveness

2. **Monitor Performance**
   - Check Cloudflare Analytics
   - Review Sentry errors (if configured)
   - Monitor database performance

3. **Share Your App**
   - Update README with production URL
   - Share with team/users
   - Gather feedback

4. **Set Up Alerts**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error rate alerts (Sentry)
   - Performance budgets

---

## 🚀 Quick Deploy (TL;DR)

```bash
# 1. Setup environment
npm run setup:env

# 2. Run migrations
npm run db:migrate

# 3. Build and deploy
npm run build
npm run deploy:cloudflare

# 4. Done! 🎉
```

Your app is now live at: **https://surprise-app.pages.dev**

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.

**Ready to Deploy?** Follow the steps above and your app will be live in minutes! 🚀
