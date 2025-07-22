# Claude-Flow Task Templates for Austin Move Finder

## Content Creation Tasks

### Blog Post Creation
```bash
claude-flow task create "Write comprehensive blog post about [NEIGHBORHOOD] in Austin" \
  --template blog-post \
  --requirements "1500+ words, SEO optimized, local insights, resident quotes, amenities, rent data" \
  --deliverables "markdown file, meta tags, social media snippets"
```

### Neighborhood Guide Updates
```bash
claude-flow task create "Update [NEIGHBORHOOD] guide with latest data" \
  --template neighborhood-update \
  --requirements "current rent prices, new developments, amenity changes, walk score updates" \
  --sources "local real estate, city planning, community feedback"
```

## Technical Development Tasks

### Feature Development
```bash
claude-flow task create "Develop [FEATURE] for austinmovefinder.com" \
  --template feature-dev \
  --requirements "React component, TypeScript, responsive design, tests, documentation" \
  --testing "unit tests, accessibility check, performance impact"
```

### SEO Optimization
```bash
claude-flow task create "SEO optimization for [PAGE/SECTION]" \
  --template seo-optimize \
  --requirements "keyword research, meta tags, schema markup, performance audit" \
  --metrics "Core Web Vitals, lighthouse score, search rankings"
```

## Maintenance Tasks

### Monthly Austin Data Updates
```bash
claude-flow task create "Monthly Austin market data update" \
  --template data-update \
  --schedule monthly \
  --sources "Austin MLS, city data, transportation updates" \
  --automation enabled
```

### Performance Monitoring
```bash
claude-flow task create "Weekly performance audit" \
  --template performance-check \
  --schedule weekly \
  --metrics "page speed, uptime, conversion rates" \
  --alerts "performance degradation, broken links, SEO issues"
```

## Content Calendar Tasks

### Seasonal Content
```bash
# Summer moving content
claude-flow task create "Summer moving guide for Austin heat" \
  --schedule "yearly:june" \
  --content-type seasonal \
  --keywords "austin summer moving, heat tips, air conditioning"

# UT student moving content  
claude-flow task create "UT student housing guide" \
  --schedule "yearly:july" \
  --content-type educational \
  --keywords "UT housing, student apartments, campus areas"

# Tech worker relocation content
claude-flow task create "Tech worker relocation guide" \
  --schedule "quarterly" \
  --content-type professional \
  --keywords "austin tech jobs, silicon hills, tech company relocations"
```

## Community Engagement Tasks

### Local Events Integration
```bash
claude-flow task create "Integrate upcoming Austin events into moving guide" \
  --template events-integration \
  --sources "austin.com, do512, city calendar" \
  --update-frequency weekly
```

### Community Feedback Processing
```bash
claude-flow task create "Process and integrate user feedback" \
  --template feedback-processing \
  --sources "contact form, social media, comments" \
  --action-items "content updates, feature requests, bug reports"
```
