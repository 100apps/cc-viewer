import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { updateContextWindowFromResponse, CONTEXT_WINDOW_FILE } from '../lib/context-watcher.js';

const CLAUDE_DIR = join(homedir(), '.claude');

// 备份和恢复 context-window.json
let savedContextFile = null;
let contextFileExisted = false;

function backupContextFile() {
  try {
    contextFileExisted = existsSync(CONTEXT_WINDOW_FILE);
    if (contextFileExisted) savedContextFile = readFileSync(CONTEXT_WINDOW_FILE, 'utf-8');
  } catch { }
}

function restoreContextFile() {
  try {
    if (contextFileExisted && savedContextFile !== null) {
      writeFileSync(CONTEXT_WINDOW_FILE, savedContextFile);
    } else if (!contextFileExisted && existsSync(CONTEXT_WINDOW_FILE)) {
      unlinkSync(CONTEXT_WINDOW_FILE);
    }
  } catch { }
  savedContextFile = null;
}

describe('context-watcher: updateContextWindowFromResponse', () => {
  it('writes context_window data from API response usage', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      // 清理旧文件
      if (existsSync(CONTEXT_WINDOW_FILE)) unlinkSync(CONTEXT_WINDOW_FILE);

      const responseBody = {
        usage: {
          input_tokens: 5000,
          output_tokens: 1000,
          cache_creation_input_tokens: 200,
          cache_read_input_tokens: 3000,
        },
      };

      updateContextWindowFromResponse(responseBody, { model: 'claude-sonnet-4-6' }, 'claude-sonnet-4-6');

      assert.ok(existsSync(CONTEXT_WINDOW_FILE), 'context-window.json should be created');
      const data = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      assert.ok(data.context_window, 'should have context_window field');
      assert.equal(data.context_window.total_input_tokens, 8200); // 5000 + 200 + 3000
      assert.equal(data.context_window.total_output_tokens, 1000);
      assert.equal(data.context_window.context_window_size, 200000);
      assert.equal(data.context_window.used_percentage, 5); // (9200 / 200000) * 100 ≈ 5
    } finally {
      restoreContextFile();
    }
  });

  it('infers 1M context window from model name with size tag', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      if (existsSync(CONTEXT_WINDOW_FILE)) unlinkSync(CONTEXT_WINDOW_FILE);

      const responseBody = {
        usage: { input_tokens: 50000, output_tokens: 10000 },
      };

      updateContextWindowFromResponse(responseBody, {}, 'claude-opus-4-6[1m]');

      const data = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      assert.equal(data.context_window.context_window_size, 1000000);
      assert.equal(data.context_window.used_percentage, 6); // (60000 / 1000000) * 100 = 6
    } finally {
      restoreContextFile();
    }
  });

  it('preserves existing fields in context-window.json', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      // 写入一些已有数据（模拟 Claude Code statusLine 写入的）
      const existing = { session_id: 'test-123', model: { id: 'opus' } };
      writeFileSync(CONTEXT_WINDOW_FILE, JSON.stringify(existing) + '\n');

      const responseBody = {
        usage: { input_tokens: 1000, output_tokens: 500 },
      };

      updateContextWindowFromResponse(responseBody, {}, 'claude-sonnet-4-6');

      const data = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      assert.equal(data.session_id, 'test-123', 'should preserve existing session_id');
      assert.equal(data.model.id, 'opus', 'should preserve existing model');
      assert.ok(data.context_window, 'should have new context_window');
    } finally {
      restoreContextFile();
    }
  });

  it('does nothing when response has no usage', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      if (existsSync(CONTEXT_WINDOW_FILE)) unlinkSync(CONTEXT_WINDOW_FILE);

      updateContextWindowFromResponse({ id: 'msg_123' }, {}, 'claude-sonnet-4-6');

      // Should not create file when no usage data
      assert.ok(!existsSync(CONTEXT_WINDOW_FILE), 'should not create file without usage');
    } finally {
      restoreContextFile();
    }
  });

  it('preserves larger existing context_window_size (1M from Claude Code statusLine)', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      // Simulate Claude Code statusLine having written 1M context_window_size
      const existing = {
        context_window: {
          context_window_size: 1000000,
          used_percentage: 10,
        },
      };
      writeFileSync(CONTEXT_WINDOW_FILE, JSON.stringify(existing) + '\n');

      const responseBody = {
        usage: { input_tokens: 50000, output_tokens: 10000 },
      };

      // Model name has no [1m] suffix, so inferContextWindowSize returns 200000
      updateContextWindowFromResponse(responseBody, {}, 'claude-opus-4-6-20250514');

      const data = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      // Should preserve the larger 1M value, not overwrite with 200K
      assert.equal(data.context_window.context_window_size, 1000000);
      // Percentage should be based on 1M: (60000 / 1000000) * 100 = 6
      assert.equal(data.context_window.used_percentage, 6);
    } finally {
      restoreContextFile();
    }
  });

  it('uses inferred size when no existing context_window_size', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      if (existsSync(CONTEXT_WINDOW_FILE)) unlinkSync(CONTEXT_WINDOW_FILE);

      const responseBody = {
        usage: { input_tokens: 50000, output_tokens: 10000 },
      };

      updateContextWindowFromResponse(responseBody, {}, 'claude-sonnet-4-6-20250514');

      const data = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      assert.equal(data.context_window.context_window_size, 200000);
      // (60000 / 200000) * 100 = 30
      assert.equal(data.context_window.used_percentage, 30);
    } finally {
      restoreContextFile();
    }
  });

  it('does not downgrade context_window_size from existing larger value', () => {
    backupContextFile();
    try {
      mkdirSync(CLAUDE_DIR, { recursive: true });
      // Existing file has 1M from a previous [1m] model inference
      const existing = {
        context_window: { context_window_size: 1000000, used_percentage: 5 },
      };
      writeFileSync(CONTEXT_WINDOW_FILE, JSON.stringify(existing) + '\n');

      const responseBody = {
        usage: { input_tokens: 100000, output_tokens: 5000 },
      };

      // inferContextWindowSize('claude-haiku-4-5') = 200000, but existing is 1M
      updateContextWindowFromResponse(responseBody, {}, 'claude-haiku-4-5');

      const data = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      // Should keep 1M (larger), not downgrade to 200K
      assert.equal(data.context_window.context_window_size, 1000000);
    } finally {
      restoreContextFile();
    }
  });
});
