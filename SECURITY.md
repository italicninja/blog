# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer at: [Your contact email - replace this]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

This project implements the following security measures:

### Authentication & Authorization
- GitHub OAuth via NextAuth.js
- Permission-based access control (CONTRIBUTOR, EDITOR, ADMIN roles)
- Session-based authentication
- Granular permissions for publish/edit/delete operations

### Data Protection
- **XSS Protection**: DOMPurify sanitizes all HTML output
- **SQL Injection Prevention**: Parameterized Prisma queries
- **Input Validation**: Zod schemas validate all user input
- **Content Sanitization**: Server-side sanitization of all user-generated content

### Infrastructure Security
- Environment variable isolation (.env.local in .gitignore)
- HTTPS-only image domains
- Secure session management with NextAuth
- Connection pooling to prevent resource exhaustion

### File Upload Security
- Authentication required for all uploads
- File size limits (4MB max)
- Type restrictions (images only)
- Authorization checks (must be authorized poster)

## Known Limitations

1. **Rate Limiting**: Not yet implemented (planned)
2. **CSRF Protection**: Relies on SameSite cookies (token-based protection planned)
3. **CSP Headers**: Not yet configured (planned)

## Security Best Practices for Contributors

1. **Never commit secrets**
   - Use .env.local for local development
   - Use Vercel environment variables for production
   - Generate strong secrets: `openssl rand -base64 32`

2. **Validate all input**
   - Use Zod schemas for validation
   - Sanitize user content
   - Never trust client-side validation alone

3. **Follow secure coding practices**
   - Use parameterized queries (Prisma)
   - Avoid `dangerouslySetInnerHTML` without sanitization
   - Implement proper error handling
   - Log security events

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update dependencies monthly
   - Monitor security advisories

5. **Test security measures**
   - Run `npm run build` before committing
   - Test authentication flows
   - Verify authorization checks
   - Check for XSS vulnerabilities

## Security Checklist for Deployment

- [ ] All secrets rotated and stored securely in Vercel
- [ ] NEXTAUTH_SECRET is strong (min 32 characters)
- [ ] GitHub OAuth credentials are valid
- [ ] Database connection strings are secure
- [ ] ENABLE_DEV_AUTH is set to 'false' or not set
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Build passes without errors (`npm run build`)
- [ ] HTTPS is enforced
- [ ] Backup procedures are in place

## Recent Security Updates

### 2024-12-08: Critical Security Fixes
- ✅ Updated Next.js to 15.5.7 (fixes RCE vulnerability CVE-2024-XXXXX)
- ✅ Implemented DOMPurify for XSS protection
- ✅ Added authentication to UploadThing middleware
- ✅ Strengthened dev authentication bypass with multiple safeguards
- ✅ Added server-side content sanitization
- ✅ Updated .env.example with security warnings

## Contact

For security-related questions or concerns, please contact:
- Maintainer: [Your name/contact]
- Response time: Within 48 hours

---

Last updated: 2024-12-08
