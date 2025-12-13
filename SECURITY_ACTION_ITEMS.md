# 🚨 URGENT SECURITY ACTION ITEMS

## ⚠️ IMMEDIATE ACTIONS REQUIRED (Do Before Merging)

### 1. Rotate ALL Production Secrets
**CRITICAL - Your .env.local file contains exposed production credentials**

The following secrets MUST be rotated immediately:

#### Database (Neon)
1. Go to Neon dashboard: https://console.neon.tech/
2. Navigate to your project settings
3. Reset database password
4. Update production environment variables in Vercel
5. Update local .env.local

#### UploadThing
1. Go to UploadThing dashboard: https://uploadthing.com/dashboard
2. Regenerate API keys
3. Update `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` in Vercel
4. Update local .env.local

#### NextAuth Secret
```bash
# Generate a new strong secret
openssl rand -base64 32

# Update in:
# 1. Vercel environment variables
# 2. Local .env.local
```

#### Vercel OIDC Token
1. The exposed token will expire, but revoke if possible
2. Check Vercel security settings

### 2. Verify .env.local Is NOT Committed
```bash
# Check if .env.local was ever committed
git log --all --full-history -- .env.local

# If it shows commits, ALL secrets in those commits are compromised
# You MUST rotate them immediately
```

### 3. Update Production Environment Variables
After rotating secrets, update them in Vercel:
1. Go to: https://vercel.com/[your-team]/blog/settings/environment-variables
2. Update:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `NEXTAUTH_SECRET`
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`
   - `GITHUB_ID` (if using different OAuth app)
   - `GITHUB_SECRET` (if using different OAuth app)
3. Set `ENABLE_DEV_AUTH` to `false` (or don't set it at all)
4. Redeploy the application

### 4. Verify GitHub OAuth Settings
1. Go to: https://github.com/settings/developers
2. Verify callback URL matches your production domain
3. If you rotated GITHUB_ID/SECRET, update OAuth app

---

## ✅ COMPLETED IN THIS PR

- [x] Updated Next.js to 15.5.7 (fixes critical RCE)
- [x] Implemented DOMPurify for XSS protection
- [x] Added authentication to UploadThing middleware
- [x] Strengthened dev authentication bypass
- [x] Added server-side input sanitization
- [x] Created SECURITY.md documentation
- [x] Updated .env.example with security warnings
- [x] Build tested and passing

---

## 📋 HIGH PRIORITY (Next Sprint)

### 1. Implement Rate Limiting
**Impact:** Prevent DoS attacks, brute force, spam

```bash
npm install @upstash/ratelimit @upstash/redis
```

Create `src/middleware.ts` with rate limiting logic (see security report).

### 2. Add CSRF Protection
**Impact:** Prevent cross-site request forgery

Options:
- Upgrade to NextAuth v5 (built-in CSRF)
- Implement custom CSRF tokens
- Add origin validation to all API routes

### 3. Configure Content Security Policy
**Impact:** Additional XSS protection layer

Add to `next.config.js`:
```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https://utfs.io https://avatars.githubusercontent.com; style-src 'self' 'unsafe-inline';"
      }
    ]
  }];
}
```

### 4. Add Security Headers
**Impact:** Defense in depth

Add to `next.config.js`:
```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
]
```

---

## 📅 MEDIUM PRIORITY (This Month)

### 5. Implement Audit Logging
Create Prisma model for security events:
- Authentication attempts
- Authorization failures
- Post creation/modification/deletion
- Permission changes
- Failed upload attempts

### 6. Update Vercel CLI
**Current:** 48.8.0 (has vulnerabilities)
**Target:** 32.0.1+

Note: This requires breaking changes. Test thoroughly in dev first.

### 7. Add Backup Admin Mechanism
**Current Risk:** Single hardcoded admin username

Solutions:
- Database flag for admin users
- Email-based recovery system
- Multi-admin support

### 8. Implement File Upload Validation
- Server-side file type checking (magic numbers)
- File size validation
- Malware scanning (optional)

---

## 🔄 ONGOING MAINTENANCE

### Weekly
- [ ] Run `npm audit` and review vulnerabilities
- [ ] Check for Next.js security updates
- [ ] Review application logs for suspicious activity

### Monthly
- [ ] Update all dependencies: `npm update`
- [ ] Review and rotate API keys
- [ ] Test backup/restore procedures
- [ ] Review authorized posters list

### Quarterly
- [ ] Rotate all secrets (database, OAuth, NextAuth)
- [ ] Security audit review
- [ ] Penetration testing (if possible)
- [ ] Review access logs

---

## 🧪 TESTING CHECKLIST

Before deploying to production:
- [ ] All secrets rotated
- [ ] Environment variables updated in Vercel
- [ ] Build passes: `npm run build`
- [ ] Dev server works: `npm run dev`
- [ ] Authentication flow tested
- [ ] File upload tested
- [ ] Post creation/editing tested
- [ ] XSS protection verified (try injecting `<script>alert('XSS')</script>`)
- [ ] ENABLE_DEV_AUTH is false in production

---

## 📞 INCIDENT RESPONSE

If you suspect a security breach:

1. **Immediately** rotate all secrets
2. Review audit logs (if implemented)
3. Check for suspicious posts/users in database
4. Review Vercel deployment logs
5. Check UploadThing for unusual uploads
6. Change all admin passwords
7. Notify users if data was compromised

---

## 🔗 RESOURCES

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prisma Security Guidelines](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

---

## 📝 NOTES

- This branch: `security/critical-fixes`
- Created: 2024-12-08
- Next review: After secret rotation
- Estimated time to complete immediate actions: 30-60 minutes
- Estimated time for high priority items: 1-2 days

**DO NOT MERGE** until immediate actions are completed!
