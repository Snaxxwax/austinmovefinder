#!/usr/bin/env node

/**
 * Austin MoveFinder Todo Completion Handler
 * Automatically stores session progress and todo completion summaries
 */

const fs = require('fs');
const path = require('path');

class TodoCompletionHandler {
  constructor() {
    this.sessionId = `session-${Date.now()}`;
    this.completedTodos = [];
    this.sessionSummary = [];
  }

  /**
   * Record a completed todo with context
   */
  recordTodoCompletion(todo, context = {}) {
    const completion = {
      todo,
      completedAt: new Date().toISOString(),
      sessionId: this.sessionId,
      context,
      timestamp: Date.now()
    };

    this.completedTodos.push(completion);

    // Generate memory storage commands for Claude Code
    this.generateMemoryCommands(completion);

    console.log(`✅ Recorded todo completion: ${todo.content}`);
  }

  /**
   * Generate Claude Code memory commands for todo completion
   */
  generateMemoryCommands(completion) {
    const memoryKey = `todo_completion_${completion.timestamp}`;
    const memoryValue = JSON.stringify({
      todo: completion.todo.content,
      completedAt: completion.completedAt,
      sessionId: this.sessionId,
      context: completion.context,
      project: 'austinmovefinder'
    });

    const commands = `
# Store todo completion in memory
mcp__claude-flow__memory_usage --action store --key "${memoryKey}" --value '${memoryValue}' --namespace austinmovefinder --ttl 2592000

# Update session summary
mcp__claude-flow__memory_usage --action store --key "session_summary_${this.sessionId}" --value "Completed: ${completion.todo.content} at ${completion.completedAt}" --namespace austinmovefinder --ttl 604800
`;

    // Append to memory commands file
    fs.appendFileSync('.claude/memory-commands.txt', commands);
  }

  /**
   * Generate session summary when all todos are complete
   */
  generateSessionSummary(additionalContext = '') {
    const summary = {
      sessionId: this.sessionId,
      completedAt: new Date().toISOString(),
      todosCompleted: this.completedTodos.length,
      todos: this.completedTodos.map(t => t.todo.content),
      additionalContext,
      project: 'austinmovefinder'
    };

    const summaryKey = `session_summary_${this.sessionId}`;
    const summaryValue = JSON.stringify(summary);

    const summaryCommands = `
# Store complete session summary
mcp__claude-flow__memory_usage --action store --key "${summaryKey}" --value '${summaryValue}' --namespace austinmovefinder --ttl 2592000

# Update last session pointer
mcp__claude-flow__memory_usage --action store --key "last_session" --value "${this.sessionId}" --namespace austinmovefinder --ttl 2592000
`;

    fs.appendFileSync('.claude/memory-commands.txt', summaryCommands);

    console.log(`📝 Session summary generated: ${this.completedTodos.length} todos completed`);
    return summary;
  }
}

// Export for use in other scripts
module.exports = TodoCompletionHandler;

// CLI usage
if (require.main === module) {
  const handler = new TodoCompletionHandler();

  const action = process.argv[2];
  const todoContent = process.argv[3];
  const context = process.argv[4] ? JSON.parse(process.argv[4]) : {};

  switch(action) {
    case 'complete':
      handler.recordTodoCompletion({ content: todoContent }, context);
      break;
    case 'summary':
      handler.generateSessionSummary(todoContent);
      break;
    default:
      console.log('Usage: node todo-completion-handler.js [complete|summary] [todo-content] [context-json]');
  }
}