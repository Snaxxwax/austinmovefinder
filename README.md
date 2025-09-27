# Austin Move Finder - Astro Version

Modern, performant website built with Astro and deployed on Cloudflare Pages.

## 🚀 Features

- **Static Site Generation** - Fast loading times with Astro
- **Serverless Forms** - Cloudflare Pages Functions handle form submissions
- **Content Management** - Decap CMS for easy content editing
- **Bot Protection** - Cloudflare Turnstile integration
- **Data Storage** - R2 storage for form submissions
- **SEO Optimized** - Enhanced meta tags and structured data
- **Responsive Design** - Mobile-first approach

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Fill in your environment variables in `.env`

4. Start development server:
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to Cloudflare Pages
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📝 Content Management

Access the CMS at `/admin` to:
- Create and edit blog posts
- Manage neighborhood guides
- Update page content
- Configure site settings

## 🏗️ Architecture

### File Structure
```
src/
├── components/          # Reusable Astro components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   ├── forms/          # Form components
│   ├── blog/           # Blog-specific components
│   └── ui/             # UI components
├── content/            # Content collections
│   ├── blog/           # Blog posts (Markdown)
│   ├── neighborhoods/  # Neighborhood guides
│   └── pages/          # Static pages
├── pages/              # Astro pages and API routes
└── assets/             # Images, scripts, styles

functions/
└── api/                # Cloudflare Pages Functions
    └── submit.ts       # Form submission handler
```

### Tech Stack
- **Framework**: Astro 4.0
- **Styling**: CSS with custom properties + Tailwind (optional)
- **CMS**: Decap CMS (formerly Netlify CMS)
- **Deployment**: Cloudflare Pages
- **Forms**: Cloudflare Pages Functions + R2 storage
- **Security**: Turnstile bot protection

## 🚀 Deployment

### Cloudflare Pages Setup
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables in Cloudflare dashboard
5. Set up R2 bucket for form submissions

### Environment Variables (Cloudflare Dashboard)
- `TURNSTILE_SECRET_KEY` - Turnstile secret key
- `EMAIL_API_KEY` - Email service API key
- `EMAIL_FROM` - Sender email address
- `EMAIL_TO` - Recipient email address

### R2 Bucket Setup
1. Create R2 bucket: `austin-move-finder-submissions`
2. Bind to Pages Function in wrangler.toml
3. Set appropriate CORS policies if needed

## 📊 Performance

Target Lighthouse scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## 🔒 Security

- Form validation with Zod schemas
- Bot protection with Cloudflare Turnstile
- Rate limiting on form submissions
- Input sanitization and CSRF protection
- HTTPS enforcement

## 📧 Support

For questions or issues, contact the development team or create an issue in the repository.