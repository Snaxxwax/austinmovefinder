# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains a React TypeScript application for Austin, Texas moving services, plus shared database dependencies:

- **austinmovefinder/** - Production-ready TypeScript/React/Tailwind moving guide
- **Root level** - SQLite database dependencies (better-sqlite3, sqlite3)

## Primary Project: austinmovefinder

### Key Commands

```bash
cd austinmovefinder

# Development
npm run dev                    # Start dev server (port 5173)
npm run build                  # TypeScript build + Vite build
npm run preview               # Preview production build

# Code Quality
npm run lint                  # ESLint with TypeScript rules
npm run storybook            # Component development (port 6006)
npm run build-storybook      # Build Storybook
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with Austin-themed design system + shadcn/ui
- **Components**: Radix UI primitives with custom Austin branding
- **Icons**: Lucide React
- **SEO**: React Helmet Async with structured data
- **Routing**: React Router DOM

### Architecture

```
src/
├── components/
│   ├── ui/                  # shadcn/ui reusable components
│   ├── Navigation.tsx       # Responsive nav with mobile menu
│   ├── Footer.tsx          # Austin-branded footer
│   └── SEOHead.tsx         # Advanced SEO meta component
├── pages/                  # Page components with Austin focus
│   ├── HomePage.tsx        # Landing page with local features
│   ├── NeighborhoodsPage.tsx  # 25+ Austin neighborhoods guide
│   ├── MovingGuidePage.tsx    # 8-week moving timeline
│   ├── BlogPage.tsx           # Austin moving tips blog
│   ├── AboutPage.tsx          # About the service
│   └── ContactPage.tsx        # Contact form
├── lib/
│   └── utils.ts            # Austin data + utility functions
└── App.tsx                 # Main router configuration
```

### Data Management

Austin-specific data is centralized in `src/lib/utils.ts`:
- `austinNeighborhoods`: 25+ neighborhoods with rent, walk scores, features
- `movingChecklist`: 8-week Austin-specific moving timeline
- `austinMovingTips`: Local utilities, DMV, traffic, culture tips

### Austin Design System

The project uses a custom Austin-themed color palette:
- Austin Blue: `#00a0dc` (primary brand)
- Austin Green: `#8cc63f` (Keep Austin Weird)
- Austin Orange: `#f47321` (UT orange)  
- Austin Purple: `#663399` (SXSW purple)
- Austin Teal: `#0d7377` (Lady Bird Lake)

## Development Guidelines

### Code Patterns
- Follow TypeScript best practices
- Use shadcn/ui components for consistent UI
- Implement responsive design with Tailwind mobile-first approach
- Include Austin-specific SEO meta tags and structured data
- Use React Router for client-side routing

### Content Management
- Austin neighborhoods: Edit `austinNeighborhoods` array in `src/lib/utils.ts`
- Moving timeline: Update `movingChecklist` in `src/lib/utils.ts`  
- Blog posts: Add to `blogPosts` array in `src/pages/BlogPage.tsx`
- Austin tips: Modify `austinMovingTips` in `src/lib/utils.ts`

### Austin Market Focus
The project targets people moving to or living in Austin, Texas. Maintain local relevance:
- Use Austin-specific terminology and references
- Include local utilities, services, and cultural information
- Reference Austin neighborhoods, landmarks, and lifestyle
- Optimize for local search terms and Austin moving keywords

### Testing and Quality
- Run TypeScript check: `npm run build` (includes tsc)
- Lint before commits: `npm run lint`
- Test responsive design across mobile/desktop
- Validate SEO with structured data testing tools
- Check Core Web Vitals for performance

## Deployment

The austinmovefinder project includes:
- Cloudflare Pages deployment configuration
- GitHub Actions CI/CD workflow
- Production build optimizations
- SEO and performance optimizations

Refer to the comprehensive README.md in austinmovefinder/ for detailed deployment instructions.