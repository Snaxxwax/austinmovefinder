#!/bin/bash

# Austin MoveFinder Session Initialization Script
# Automatically restores project context from memory systems

echo "🚀 Initializing Austin MoveFinder session..."

# Initialize swarm if not already active
echo "📡 Checking swarm status..."

# Store session start
SESSION_ID="session-$(date +%s)"
echo "📝 Session ID: $SESSION_ID"

# Create session memory commands for Claude Code
cat > .claude/restore-context-commands.txt << 'EOF'
# Run these commands in Claude Code to restore session context:

# 1. Initialize swarm
mcp__ruv-swarm__swarm_init --topology hierarchical --maxAgents 5 --strategy specialized

# 2. Restore project context
mcp__claude-flow__memory_usage --action retrieve --key austin_project_context --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key tech_stack --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key key_commands --namespace austinmovefinder
mcp__claude-flow__memory_usage --action retrieve --key data_structure --namespace austinmovefinder

# 3. List all available memory
mcp__claude-flow__memory_usage --action list --namespace austinmovefinder

# 4. Check for recent session summaries
mcp__claude-flow__memory_search --pattern "session_summary" --namespace austinmovefinder --limit 3
EOF

echo "✅ Session initialization commands created in .claude/restore-context-commands.txt"
echo "📚 Use these commands in Claude Code to restore full project context"

# Create session log entry
echo "$(date '+%Y-%m-%d %H:%M:%S') - Session $SESSION_ID initialized" >> .claude/session-log.txt

echo "🎯 Austin MoveFinder session ready!"