#!/usr/bin/env node

/**
 * Austin MoveFinder Session Summary Generator
 * Creates comprehensive session summaries for memory storage
 */

import fs from 'fs';
import path from 'path';

class SessionSummaryGenerator {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `session-${Date.now()}`;
    this.startTime = new Date();
    this.todos = [];
    this.achievements = [];
    this.filesModified = [];
    this.memoryEntries = [];
  }

  /**
   * Add completed todo to session
   */
  addCompletedTodo(todoContent, context = {}) {
    this.todos.push({
      content: todoContent,
      completedAt: new Date().toISOString(),
      context
    });
  }

  /**
   * Add achievement or milestone
   */
  addAchievement(achievement, description = '') {
    this.achievements.push({
      achievement,
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add modified file
   */
  addModifiedFile(filePath, changeType = 'modified', description = '') {
    this.filesModified.push({
      path: filePath,
      changeType, // 'created', 'modified', 'deleted'
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add memory entry created
   */
  addMemoryEntry(key, description = '') {
    this.memoryEntries.push({
      key,
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate comprehensive session summary
   */
  generateSummary(additionalNotes = '') {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000 / 60); // minutes

    const summary = {
      sessionId: this.sessionId,
      project: 'austinmovefinder',
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: duration,

      // Core metrics
      todosCompleted: this.todos.length,
      achievementsUnlocked: this.achievements.length,
      filesModified: this.filesModified.length,
      memoryEntriesCreated: this.memoryEntries.length,

      // Detailed breakdown
      todos: this.todos,
      achievements: this.achievements,
      filesChanged: this.filesModified,
      memoryEntries: this.memoryEntries,

      // Context
      additionalNotes,

      // Metadata
      createdAt: endTime.toISOString(),
      version: '1.0.0'
    };

    return summary;
  }

  /**
   * Generate Claude Code memory commands for the session
   */
  generateMemoryCommands(summary = null) {
    if (!summary) {
      summary = this.generateSummary();
    }

    const summaryKey = `session_summary_${this.sessionId}`;
    const summaryValue = JSON.stringify(summary);

    // Generate comprehensive memory storage commands
    const commands = `
# === Session Summary Memory Storage ===
# Session: ${this.sessionId}
# Duration: ${summary.durationMinutes} minutes
# Todos completed: ${summary.todosCompleted}

# Store complete session summary
mcp__claude-flow__memory_usage --action store --key "${summaryKey}" --value '${summaryValue}' --namespace austinmovefinder --ttl 2592000

# Update session metrics
mcp__claude-flow__memory_usage --action store --key "last_session_metrics" --value '{"sessionId":"${this.sessionId}","todosCompleted":${summary.todosCompleted},"duration":${summary.durationMinutes},"timestamp":"${summary.endTime}"}' --namespace austinmovefinder --ttl 604800

# Store session index for easy retrieval
mcp__claude-flow__memory_usage --action store --key "session_index_${this.sessionId}" --value '{"todos":${JSON.stringify(summary.todos.map(t => t.content))},"achievements":${JSON.stringify(summary.achievements.map(a => a.achievement))},"files":${JSON.stringify(summary.filesChanged.map(f => f.path))}}' --namespace austinmovefinder --ttl 2592000

# Update latest session pointer
mcp__claude-flow__memory_usage --action store --key "latest_session" --value "${this.sessionId}" --namespace austinmovefinder --ttl 2592000

`;

    return commands;
  }

  /**
   * Save session summary to file and generate memory commands
   */
  saveSession(additionalNotes = '') {
    const summary = this.generateSummary(additionalNotes);

    // Save summary to JSON file
    const summaryPath = `.claude/sessions/session-${this.sessionId}.json`;
    fs.mkdirSync('.claude/sessions', { recursive: true });
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Generate and save memory commands
    const commands = this.generateMemoryCommands(summary);
    const commandsPath = `.claude/sessions/session-${this.sessionId}-memory-commands.txt`;
    fs.writeFileSync(commandsPath, commands);

    // Update session log
    const logEntry = `${new Date().toISOString()} - Session ${this.sessionId} completed: ${summary.todosCompleted} todos, ${summary.durationMinutes} minutes\n`;
    fs.appendFileSync('.claude/session-log.txt', logEntry);

    console.log(`📝 Session summary saved: ${summaryPath}`);
    console.log(`💾 Memory commands saved: ${commandsPath}`);
    console.log(`⏱️ Session duration: ${summary.durationMinutes} minutes`);
    console.log(`✅ Todos completed: ${summary.todosCompleted}`);

    return {
      summary,
      summaryPath,
      commandsPath
    };
  }
}

// Export for use as module
export default SessionSummaryGenerator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const sessionId = process.argv[2] || null;
  const additionalNotes = process.argv[3] || '';

  const generator = new SessionSummaryGenerator(sessionId);

  // Example usage for this session
  generator.addCompletedTodo('Create session initialization script to restore project context', {
    script_location: '.claude/session-init.sh',
    commands_file: '.claude/restore-context-commands.txt'
  });

  generator.addCompletedTodo('Add automatic memory storage after todo completion', {
    handler_script: '.claude/todo-completion-handler.js',
    workflow_doc: '.claude/memory-workflow.md'
  });

  generator.addAchievement('Memory system fully operational', 'Created comprehensive memory workflow for session continuity');

  generator.addModifiedFile('.claude/session-init.sh', 'created', 'Session initialization script');
  generator.addModifiedFile('.claude/todo-completion-handler.js', 'created', 'Todo completion handler');
  generator.addModifiedFile('.claude/memory-workflow.md', 'created', 'Memory workflow documentation');

  const result = generator.saveSession(additionalNotes);

  console.log('\n🎯 To store this session in memory, run these Claude Code commands:');
  console.log('```');
  console.log(generator.generateMemoryCommands());
  console.log('```');
}