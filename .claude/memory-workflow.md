# Austin MoveFinder Memory Workflow

## Session Initialization Protocol

### Step 1: Start Every Session
Run the initialization script to prepare session context:
```bash
./.claude/session-init.sh
```

### Step 2: Restore Context in Claude Code
Execute the commands from `.claude/restore-context-commands.txt`:

```
# Initialize swarm
mcp__ruv-swarm__swarm_init --topology hierarchical --maxAgents 5 --strategy specialized

# Restore project context
mcp__claude-flow__memory_usage --action retrieve --key austin_project_context --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key tech_stack --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key key_commands --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key data_structure --namespace austinmovefinder

# List all available memory
mcp__claude-flow__memory_usage --action list --namespace austinmovefinder

# Check for recent session summaries
mcp__claude-flow__memory_search --pattern "session_summary" --namespace austinmovefinder --limit 3
```

## Todo Completion Protocol

### After Each Todo Completion:
1. **Record the completion**:
```javascript
node .claude/todo-completion-handler.js complete "Todo description" '{"context":"additional info"}'
```

2. **Store in memory immediately**:
```
mcp__claude-flow__memory_usage --action store --key "todo_completion_[timestamp]" --value "[completion details]" --namespace austinmovefinder --ttl 2592000
```

### Session End Protocol:
1. **Generate session summary**:
```javascript
node .claude/todo-completion-handler.js summary "Additional session context"
```

2. **Store session summary**:
```
mcp__claude-flow__memory_usage --action store --key "session_summary_[session_id]" --value "[session details]" --namespace austinmovefinder --ttl 2592000
```

## Memory Structure

### Core Project Memory Keys:
- `austin_project_context`: Overall project description
- `tech_stack`: Technology stack and design system
- `key_commands`: Development commands
- `data_structure`: Austin data organization

### Session Memory Keys:
- `todo_completion_[timestamp]`: Individual todo completions
- `session_summary_[session_id]`: Complete session summaries
- `last_session`: Pointer to most recent session

### Retrieval Commands:
```bash
# Get all project memory
mcp__claude-flow__memory_usage --action list --namespace austinmovefinder

# Search for specific patterns
mcp__claude-flow__memory_search --pattern "austin" --namespace austinmovefinder --limit 10

# Retrieve specific context
mcp__claude-flow__memory_usage --action retrieve --key "austin_project_context" --namespace austinmovefinder
```

## Automated Workflow Integration

This memory system enables:
- ✅ Session continuity across Claude Code instances
- ✅ Todo completion tracking and progress history
- ✅ Project context preservation
- ✅ Session summary generation
- ✅ Historical development tracking

## Usage in CLAUDE.md

Include these memory initialization commands in the project's CLAUDE.md file to ensure every Claude Code session starts with full context.