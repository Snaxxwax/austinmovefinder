# Security Documentation - Austin Move Finder

## 🚨 CRITICAL: This project has been secured following an exposed credentials incident

### Overview

This document outlines the comprehensive security measures implemented for the Austin Move Finder project after remediating exposed API credentials and implementing defense-in-depth security controls.

## Security Measures Implemented

### 1. Credential Security

- **Removed exposed credentials**: All hardcoded API keys and tokens have been removed from the repository
- **Environment variable management**: Secure `.env.example` template with clear instructions
- **Gitignore protection**: Updated `.gitignore` to prevent future credential exposure

### 2. Content Security Policy (CSP)

Comprehensive CSP headers implemented in both middleware and meta tags:

```typescript
("default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com",
  "frame-src 'self' https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'");
```

### 3. CORS Security

- **Origin validation**: Whitelist of allowed origins
- **Credentials handling**: Proper Access-Control-Allow-Credentials configuration
- **Headers restriction**: Limited to necessary headers only

### 4. Security Headers

Complete security header implementation:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### 5. API Endpoint Security

- **Rate limiting**: 5 submissions per hour per IP
- **Input validation**: Zod schema validation for all form inputs
- **Turnstile verification**: Cloudflare bot protection
- **Honeypot protection**: Anti-spam measures
- **Error handling**: Secure error responses without information disclosure

## Credential Rotation Procedures

### Immediate Actions Required

1. **Rotate all exposed credentials** (CRITICAL - DO THIS NOW):
   - GitHub Personal Access Token: `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (EXAMPLE - REVOKED)
   - Hugging Face Token: `hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (EXAMPLE - REVOKED)
   - Cloudflare Account ID: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (EXAMPLE - SECURED)
   - Cloudflare API Token: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (EXAMPLE - REVOKED)

### GitHub Token Rotation

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Revoke any exposed tokens immediately
3. Generate a new token with minimal required permissions
4. Update in Cloudflare Pages environment variables

### Hugging Face Token Rotation

1. Log into Hugging Face account
2. Go to Settings > Access Tokens
3. Revoke any exposed tokens immediately
4. Generate new token if AI features are needed
5. Update in secure environment variables

### Cloudflare Credentials Rotation

1. Log into Cloudflare dashboard
2. Go to API Tokens section
3. Revoke any exposed API tokens immediately
4. Create new API token with minimal permissions
5. Update in environment variables and deployment settings

## Environment Setup

### Required Environment Variables

Create `.env` file from `.env.example`:

```bash
# Copy template
cp .env.example .env

# Edit with your secure values
nano .env
```

### Cloudflare Pages Configuration

Set these as environment variables in Cloudflare Pages dashboard:

- `TURNSTILE_SECRET_KEY` - Turnstile bot protection
- `CLOUDFLARE_API_TOKEN` - New rotated token
- `GITHUB_PERSONAL_ACCESS_TOKEN` - New rotated token (if needed)

## Security Monitoring

### Automated Security Checks

```bash
# Install security audit tools
npm audit
npm audit --audit-level=high

# Check for secrets in code
npx secret-scan .

# Test CSP implementation
npx csp-evaluator
```

### Regular Security Tasks

- [ ] Monthly credential rotation
- [ ] Quarterly security header review
- [ ] Monitor for new vulnerabilities in dependencies
- [ ] Review and update CSP policies
- [ ] Audit access logs for suspicious activity

## Incident Response

### If Credentials Are Exposed Again

1. **Immediate**: Revoke all potentially exposed credentials
2. **Within 1 hour**: Rotate all API keys and tokens
3. **Within 24 hours**: Review all access logs for unauthorized usage
4. **Within 48 hours**: Complete security audit of entire codebase

### Contact Information

- **Security Issues**: Create issue with "security" label
- **Urgent Security**: Email project maintainers directly

## Testing Security Implementation

### Manual Tests

```bash
# Test CSP headers
curl -I https://your-domain.com

# Test CORS configuration
curl -H "Origin: https://malicious-site.com" https://your-domain.com/api/submit

# Test rate limiting
# Make 6 requests rapidly to /api/submit
```

### Automated Tests

```bash
# Run security tests
npm run test:security

# Check dependencies
npm audit

# Validate environment setup
npm run validate:env
```

## Compliance Notes

### Data Protection

- No sensitive user data stored in logs
- PII encrypted in transit and at rest
- Form submissions stored securely in R2 bucket

### Access Control

- Principle of least privilege for all API tokens
- Regular access review and rotation
- Secure development practices enforced

## Additional Resources

- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Cloudflare Security Best Practices](https://developers.cloudflare.com/fundamentals/get-started/concepts/security/)

---

**Last Updated**: $(date)
**Security Level**: High
**Next Review**: 30 days from implementation
