# Deployment Instructions for austinmovefinder.com

## Cloudflare Pages Deployment with Custom Domain

### Prerequisites
1. Cloudflare account with your domain `austinmovefinder.com` added
2. GitHub repository connected to Cloudflare Pages
3. Cloudflare API Token (for automated deployments)

### Configuration Files Added

#### 1. `wrangler.toml`
- Configures custom domains: `austinmovefinder.com` and `www.austinmovefinder.com`
- Sets up production environment variables
- Includes security and performance headers
- Defines build configuration

#### 2. `public/_redirects`
- Handles SPA routing (all routes redirect to index.html)
- SEO-friendly redirects
- www to non-www redirect

### Deployment Steps

#### Option 1: Automatic Deployment (Recommended)
1. Push changes to your GitHub repository
2. Cloudflare Pages will automatically deploy with the new wrangler.toml configuration
3. The custom domain will be configured automatically

#### Option 2: Manual Cloudflare Dashboard Configuration
1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Select your `austinmovefinder` project
3. Go to **Custom Domains** tab
4. Add `austinmovefinder.com` and `www.austinmovefinder.com`
5. Follow DNS configuration instructions

#### Option 3: Using Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Authenticate
wrangler login

# Deploy with custom domain
wrangler pages deploy dist --project-name=austinmovefinder
```

### DNS Configuration
Ensure your domain DNS is configured properly:

1. **A Record**: `austinmovefinder.com` → Cloudflare's IP
2. **CNAME Record**: `www.austinmovefinder.com` → `austinmovefinder.com`

### Environment Variables
If you need environment-specific variables, add them to the `wrangler.toml`:

```toml
[env.production.vars]
REACT_APP_API_URL = "https://api.austinmovefinder.com"
REACT_APP_ENVIRONMENT = "production"
```

### Security Headers Configured
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive camera/microphone/geolocation

### Performance Optimizations
- Static assets cached for 1 year
- HTML pages cached for 5 minutes
- Immutable cache headers for versioned assets

### Troubleshooting

#### If Custom Domain Doesn't Work:
1. Check DNS propagation (can take up to 24 hours)
2. Verify domain is added in Cloudflare Dashboard
3. Ensure SSL/TLS is set to "Full" or "Full (Strict)"
4. Check Cloudflare Pages project settings

#### If Routes Don't Work:
1. Verify `_redirects` file is in the `public` folder
2. Check that `/*    /index.html   200` redirect is present
3. Ensure React Router is configured for browser history

### Next Deployment
The next time you push to your repository, your site will automatically deploy to `austinmovefinder.com` with all the configurations above.