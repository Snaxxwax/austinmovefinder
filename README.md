# Austin Move Finder

Your complete guide to moving to Austin, Texas. Find neighborhoods, moving tips, local resources, and everything you need for your Austin move.

## 🌟 Features

- **Neighborhood Explorer**: Detailed guides to 25+ Austin neighborhoods with rent prices, walk scores, and amenities
- **Moving Guide**: Comprehensive timeline and checklist for your Austin relocation
- **Local Insights**: Austin-specific tips for utilities, DMV, weather, and culture
- **Blog**: Expert advice and local insights from Austin residents
- **SEO Optimized**: Built for local search and discoverability
- **Mobile Responsive**: Perfect experience on all devices
- **Performance Focused**: Fast loading and optimized for user experience

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## 🏗️ Project Structure

```
austinmovefinder/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── SEOHead.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── NeighborhoodsPage.tsx
│   │   ├── MovingGuidePage.tsx
│   │   ├── BlogPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── ContactPage.tsx
│   ├── lib/
│   │   └── utils.ts      # Data and utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .github/workflows/
│   └── deploy.yml        # Cloudflare Pages deployment
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/austinmovefinder.git
   cd austinmovefinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📦 Build & Deployment

### Local Build
```bash
npm run build
npm run preview
```

### Deploy to Cloudflare Pages

1. **Connect GitHub to Cloudflare Pages**
   - Go to Cloudflare Dashboard → Pages
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Environment Variables**
   Set the following in Cloudflare Pages:
   ```
   NODE_VERSION=18
   ```

3. **Custom Domain**
   - Add `austinmovefinder.com` in Cloudflare Pages
   - Configure DNS in Cloudflare DNS

### GitHub Actions Deployment

The project includes automated deployment via GitHub Actions. On push to `main`:

1. Runs tests and linting
2. Builds the project
3. Deploys to Cloudflare Pages

Required GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token

## 🎨 Design System

### Colors (Austin-themed)
- **Austin Blue**: `#00a0dc` - Primary brand color
- **Austin Green**: `#8cc63f` - Keep Austin Weird green
- **Austin Orange**: `#f47321` - UT orange
- **Austin Purple**: `#663399` - SXSW purple  
- **Austin Teal**: `#0d7377` - Lady Bird Lake teal

### Typography
- **Headings**: Poppins (weights: 400, 500, 600, 700, 800)
- **Body**: Inter (weights: 400, 500, 600, 700)

### Components
Built with shadcn/ui and customized for Austin branding:
- Navigation with mobile responsiveness
- Cards with Austin-themed styling
- SEO-optimized meta components
- Interactive moving checklist
- Neighborhood comparison grid

## 📊 SEO & Performance

- **Meta Tags**: Comprehensive SEO meta tags for all pages
- **Open Graph**: Social media sharing optimization
- **Structured Data**: JSON-LD for local business schema
- **Sitemap**: Auto-generated sitemap for search engines
- **Performance**: Optimized images, code splitting, lazy loading
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

## 🧪 Development

### Code Quality
```bash
npm run lint          # ESLint
npm run type-check    # TypeScript check
```

### Storybook (Optional)
```bash
npm run storybook     # Component development
```

### Testing (Future)
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
```

## 📝 Content Management

### Adding Neighborhoods
Edit `src/lib/utils.ts` and add to the `austinNeighborhoods` array:

```typescript
{
  name: "New Neighborhood",
  slug: "new-neighborhood", 
  description: "Description of the area",
  averageRent: "$2,000",
  walkScore: 75,
  features: ["Feature 1", "Feature 2"]
}
```

### Adding Blog Posts
Edit `src/pages/BlogPage.tsx` and add to the `blogPosts` array.

### Updating Moving Tips
Edit the `austinMovingTips` and `movingChecklist` arrays in `src/lib/utils.ts`.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Contact

- **Website**: [austinmovefinder.com](https://austinmovefinder.com)
- **Email**: hello@austinmovefinder.com
- **Phone**: (512) 555-MOVE

---

Built with ❤️ in Austin, Texas 🌮🎵🏊‍♀️
