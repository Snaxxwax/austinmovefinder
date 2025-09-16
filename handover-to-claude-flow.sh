#!/bin/bash

# Austin Move Finder - Claude-Flow Handover Script
# Run this script to fully transition project management to claude-flow

echo "🚀 Starting Austin Move Finder handover to claude-flow..."

# Step 1: Initialize claude-flow project management
echo "📋 Step 1: Initializing claude-flow project management..."
claude-flow init --sparc --project=austinmovefinder
claude-flow hive-mind init --project=austinmovefinder

# Step 2: Create primary development swarm
echo "🐝 Step 2: Creating primary development swarm..."
claude-flow hive-mind spawn "Manage and enhance austinmovefinder.com - React/Vite Austin moving blog. Handle development, content, SEO, and deployment to Cloudflare Pages" \
  --queen-type strategic \
  --max-workers 8 \
  --consensus majority \
  --auto-scale \
  --memory-size 200 \
  --encryption \
  --monitor

# Step 3: Create specialized swarms
echo "🎯 Step 3: Creating specialized swarms..."

# Content Strategy Swarm
claude-flow hive-mind spawn "Austin content strategy: neighborhood guides, blog posts, local insights, SEO content for austinmovefinder.com" \
  --queen-type tactical \
  --max-workers 4 \
  --specialization content \
  --auto-spawn

# SEO & Marketing Swarm  
claude-flow hive-mind spawn "Local SEO optimization for Austin Move Finder: rankings, performance, user acquisition, conversion optimization" \
  --queen-type adaptive \
  --max-workers 3 \
  --specialization marketing \
  --claude

# Technical Operations Swarm
claude-flow hive-mind spawn "Technical operations for austinmovefinder.com: infrastructure, performance, security, monitoring, deployments" \
  --queen-type strategic \
  --max-workers 6 \
  --specialization devops \
  --auto-spawn

# Step 4: Set up memory and knowledge base
echo "🧠 Step 4: Setting up project memory..."
claude-flow memory store project-overview \
  --data "Austin Move Finder: Comprehensive moving guide for Austin, TX. React/Vite site with 25+ neighborhoods, moving checklists, local tips. Deployed on Cloudflare Pages." \
  --namespace austinmovefinder \
  --ttl 0

claude-flow memory store tech-stack \
  --data "Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, React Router, Cloudflare Pages, GitHub Actions CI/CD" \
  --namespace austinmovefinder

claude-flow memory store austin-data \
  --data "Austin neighborhoods: Downtown, South Austin (SoCo), East Austin, West Lake Hills, North Austin, Cedar Park. Local utilities: Austin Energy, City of Austin Water, Texas Gas Service. Key info: I-35 traffic, UT campus, Keep Austin Weird culture, live music scene, food trucks, Lady Bird Lake" \
  --namespace austinmovefinder

# Step 5: Configure automation workflows
echo "🔧 Step 5: Setting up automation workflows..."
claude-flow automation setup \
  --trigger github-push \
  --action deploy-cloudflare \
  --project austinmovefinder \
  --notifications enabled

claude-flow workflow create content-pipeline \
  --steps "research,write,review,seo-optimize,publish" \
  --automation enabled \
  --schedule weekly

claude-flow scheduler create monthly-data-update \
  --task "Update Austin neighborhood data: rent prices, developments, amenities" \
  --frequency monthly \
  --day 1 \
  --auto-execute

# Step 6: Set up monitoring and analytics
echo "📊 Step 6: Configuring monitoring and analytics..."
claude-flow monitoring setup \
  --url https://austinmovefinder.com \
  --metrics lighthouse,core-web-vitals,uptime,seo \
  --frequency hourly \
  --alerts enabled \
  --dashboard

claude-flow analytics setup \
  --events "page-views,form-submissions,neighborhood-clicks,blog-reads" \
  --goals "contact-form,newsletter-signup,neighborhood-exploration" \
  --segments "organic,social,direct,referral"

# Step 7: Start MCP server with GitHub integration
echo "🌐 Step 7: Starting MCP server with integrations..."
claude-flow mcp start \
  --auto-orchestrator \
  --github-integration \
  --real-time-sync \
  --port 3000 \
  --daemon

# Step 8: Import task templates and set up scheduling
echo "📅 Step 8: Setting up task templates and scheduling..."
claude-flow task import ./claude-flow-tasks.md

# Schedule regular content creation
claude-flow task schedule "Create weekly Austin blog post" \
  --frequency weekly \
  --day monday \
  --template blog-post \
  --auto-assign

claude-flow task schedule "Monthly neighborhood data update" \
  --frequency monthly \
  --day 1 \
  --template data-update \
  --sources "austin-mls,city-data,real-estate-trends"

# Step 9: Neural network training for Austin-specific content
echo "🧠 Step 9: Training neural networks for Austin expertise..."
claude-flow neural train \
  --domain austin-moving-guide \
  --patterns "neighborhood-preferences,moving-timelines,local-needs,seasonal-trends" \
  --learning-rate adaptive \
  --model-save enabled

# Step 10: Final status check and handover confirmation
echo "✅ Step 10: Final status check..."
claude-flow hive-mind status
claude-flow system health-check
claude-flow monitoring test-alerts

echo ""
echo "🎉 HANDOVER COMPLETE! 🎉"
echo ""
echo "Austin Move Finder is now fully managed by claude-flow:"
echo "• Primary swarm managing overall development"
echo "• Specialized swarms for content, SEO, and technical operations"  
echo "• Automated workflows for GitHub → Cloudflare deployment"
echo "• 24/7 monitoring and performance tracking"
echo "• Monthly content and data update scheduling"
echo "• Neural networks trained for Austin-specific content"
echo ""
echo "🎯 Next Steps:"
echo "1. Monitor swarm activity: claude-flow hive-mind status"
echo "2. Review daily reports: claude-flow monitoring report daily"
echo "3. Check task progress: claude-flow task list --active"
echo "4. Access management guide: ./CLAUDE-FLOW-MANAGEMENT.md"
echo ""
echo "🌮 Austin Move Finder is ready to help people move to Austin! 🎸"
echo ""
echo "Site: https://austinmovefinder.com"
echo "Management Dashboard: http://localhost:3000/console"
echo "Swarm Status: claude-flow hive-mind status"
echo ""
echo "Keep Austin Weird! 🤘"
