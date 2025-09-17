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

## Session Memory Initialization

⚠️ **IMPORTANT**: Start every Claude Code session by running these commands to restore project context:

```bash
# 1. Run session initialization
./.claude/session-init.sh

# 2. Execute these memory commands in Claude Code:
mcp__ruv-swarm__swarm_init --topology hierarchical --maxAgents 5 --strategy specialized
mcp__claude-flow__memory_usage --action retrieve --key austin_project_context --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key tech_stack --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key key_commands --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key data_structure --namespace austinmovefinder
mcp__claude-flow__memory_usage --action list --namespace austinmovefinder
mcp__claude-flow__memory_search --pattern "session_summary" --namespace austinmovefinder --limit 3
```

### Memory Workflow Protocol

**After each todo completion:**
```bash
# Store completion in memory
mcp__claude-flow__memory_usage --action store --key "todo_completion_[timestamp]" --value "[completion details]" --namespace austinmovefinder --ttl 2592000
```

**At session end:**
```bash
# Generate session summary
node .claude/session-summary-generator.js [session-id] "[additional context]"

# Store session summary
mcp__claude-flow__memory_usage --action store --key "session_summary_[session-id]" --value "[session details]" --namespace austinmovefinder --ttl 2592000
```

## Claude Flow Integration

This project supports Claude Flow for advanced AI-assisted development workflows. Claude Flow enables multi-agent coordination and automated task orchestration.

### Available MCP Servers

The project is configured with several MCP (Model Context Protocol) servers:
- **flow-nexus**: Advanced swarm coordination and distributed task execution
- **ruv-swarm**: Neural-enhanced autonomous agent swarms
- **cloudflare-workers-builds**: CI/CD integration for serverless deployments
- **cloudflare-browser-rendering**: Automated testing and screenshot generation
- **astro-docs**: Framework documentation lookup
- **context7**: Real-time library documentation access

### Claude Flow Commands

#### Swarm Initialization
```bash
# Initialize a development swarm for React/TypeScript work
mcp__flow-nexus__swarm_init --topology hierarchical --strategy specialized --maxAgents 5

# Create specialized agents for this project
mcp__flow-nexus__agent_spawn --type coder --capabilities ["react", "typescript", "tailwind"]
mcp__flow-nexus__agent_spawn --type analyst --capabilities ["seo", "performance", "austin-data"]
```

#### Task Orchestration
```bash
# Orchestrate complex development tasks
mcp__flow-nexus__task_orchestrate --task "Add new Austin neighborhood to the guide with complete data" --strategy adaptive --priority high

# Execute workflow for feature development
mcp__flow-nexus__workflow_execute --workflow_id "feature-development" --input_data {"component": "NeighborhoodCard", "neighborhood": "Mueller"}
```

#### Neural Pattern Training
```bash
# Train patterns for Austin-specific content optimization
mcp__flow-nexus__neural_train --pattern_type optimization --training_data "austin-neighborhoods-seo"

# Enable autonomous learning for content patterns
mcp__ruv-swarm__daa_init --enableLearning true --enableCoordination true
```

### Workflow Templates

#### Feature Development Workflow
1. **Research Phase**: Use `trend-researcher` agent to analyze Austin market trends
2. **Design Phase**: Use `ui-designer` agent for component design with Austin branding
3. **Development Phase**: Use `frontend-developer` agent for React/TypeScript implementation
4. **Testing Phase**: Use `test-writer-fixer` agent for comprehensive testing
5. **SEO Optimization**: Use custom Austin SEO patterns for local search optimization

#### Content Update Workflow
1. **Data Analysis**: Analyze Austin real estate trends and neighborhood changes
2. **Content Generation**: Generate Austin-specific moving tips and guides
3. **SEO Enhancement**: Optimize for local Austin search terms
4. **Performance Testing**: Validate Core Web Vitals and mobile responsiveness

### Austin-Specific Automation

#### Neighborhood Data Updates
```bash
# Automated Austin neighborhood data refresh
mcp__flow-nexus__workflow_create --name "austin-data-refresh" --steps [
  {"agent": "researcher", "task": "scrape Austin rent data"},
  {"agent": "analyst", "task": "analyze walkability scores"},
  {"agent": "coder", "task": "update austinNeighborhoods array"}
]
```

#### SEO Content Optimization
```bash
# Austin-focused SEO optimization
mcp__flow-nexus__task_orchestrate --task "Optimize all pages for Austin local search" --strategy parallel --maxAgents 3
```

### Deployment Automation

#### Cloudflare Integration
```bash
# Deploy via Cloudflare with automated testing
mcp__cloudflare-workers-builds__workers_list
mcp__flow-nexus__workflow_execute --workflow_id "deploy-to-cloudflare" --async true
```

#### Quality Assurance Pipeline
```bash
# Automated QA with visual regression testing
mcp__cloudflare-browser-rendering__get_url_screenshot --url "https://austinmovefinder.pages.dev"
mcp__flow-nexus__neural_predict_distributed --cluster_id "qa-cluster" --input_data {"page": "neighborhoods"}
```

### Best Practices for Claude Flow

1. **Agent Specialization**: Create agents specialized for Austin market knowledge
2. **Workflow Coordination**: Use hierarchical topology for complex feature development
3. **Neural Learning**: Enable autonomous learning for Austin-specific content patterns
4. **Performance Monitoring**: Use distributed neural networks for performance prediction
5. **Local Context**: Always maintain Austin market focus in all automated tasks

### Troubleshooting Claude Flow

- **Swarm Issues**: Check swarm status with `mcp__flow-nexus__swarm_status`
- **Agent Performance**: Monitor with `mcp__flow-nexus__agent_metrics`
- **Task Failures**: Review with `mcp__flow-nexus__workflow_audit_trail`
- **Neural Training**: Validate patterns with `mcp__flow-nexus__neural_patterns`

## Deployment

The austinmovefinder project includes:
- Cloudflare Pages deployment configuration
- GitHub Actions CI/CD workflow
- Production build optimizations
- SEO and performance optimizations
- Claude Flow automated deployment pipelines

Refer to the comprehensive README.md in austinmovefinder/ for detailed deployment instructions.