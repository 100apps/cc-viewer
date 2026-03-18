import { readFileSync, writeFileSync, existsSync, watchFile } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const CONTEXT_WINDOW_FILE = join(homedir(), '.claude', 'context-window.json');
export const CLAUDE_SETTINGS_FILE = join(homedir(), '.claude', 'settings.json');

let _lastContextPct = -1;
let _lastContextSize = -1;

/**
 * Watch context-window.json and push context usage to SSE clients.
 * @param {Array} clients - SSE client array (shared reference with server.js)
 */
export function watchContextWindow(clients) {
  if (!existsSync(CONTEXT_WINDOW_FILE)) {
    setTimeout(() => watchContextWindow(clients), 5000);
    return;
  }
  watchFile(CONTEXT_WINDOW_FILE, { interval: 2000 }, () => {
    try {
      const raw = readFileSync(CONTEXT_WINDOW_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const pct = data?.context_window?.used_percentage ?? -1;
      const size = data?.context_window?.context_window_size ?? -1;
      if (pct !== _lastContextPct || size !== _lastContextSize) {
        _lastContextPct = pct;
        _lastContextSize = size;
        clients.forEach(client => {
          try {
            client.write(`event: context_window\ndata: ${JSON.stringify(data.context_window)}\n\n`);
          } catch { }
        });
      }
    } catch { }
  });
}

// 已知模型的上下文窗口大小（tokens）
const MODEL_CONTEXT_SIZES = {
  'opus': 200000,
  'sonnet': 200000,
  'haiku': 200000,
};

// 从模型名中推断上下文窗口大小
function inferContextWindowSize(model) {
  if (!model) return 200000;
  const lower = model.toLowerCase();
  // 检查是否带有显式大小标注，如 claude-opus-4-6[1m]
  const sizeMatch = lower.match(/\[(\d+)([km])\]/);
  if (sizeMatch) {
    const num = parseInt(sizeMatch[1], 10);
    return sizeMatch[2] === 'm' ? num * 1000000 : num * 1000;
  }
  for (const [key, size] of Object.entries(MODEL_CONTEXT_SIZES)) {
    if (lower.includes(key)) return size;
  }
  return 200000; // 默认 200k
}

/**
 * 从 API 响应中提取 usage 信息，写入 context-window.json
 * 非独占方式：不修改用户的 statusLine 配置
 */
export function updateContextWindowFromResponse(responseBody, requestBody, model) {
  try {
    const usage = responseBody?.usage;
    if (!usage) return;

    const inputTokens = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
    const outputTokens = usage.output_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const contextWindowSize = inferContextWindowSize(model);
    const usedPct = Math.round((totalTokens / contextWindowSize) * 100);

    // 读取现有文件（如果存在），保留 Claude Code 写入的其他字段
    let existing = {};
    try {
      if (existsSync(CONTEXT_WINDOW_FILE)) {
        existing = JSON.parse(readFileSync(CONTEXT_WINDOW_FILE, 'utf-8'));
      }
    } catch { }

    // 仅更新 context_window 字段（如果 Claude Code 的 statusLine 也在写，它的数据更准确会覆盖我们的）
    // 保留 Claude Code 写入的 context_window_size（如 1M），仅在不存在时才用推断值
    const existingSize = existing.context_window?.context_window_size;
    const finalSize = (existingSize && existingSize > contextWindowSize) ? existingSize : contextWindowSize;
    const finalPct = Math.round(((inputTokens + outputTokens) / finalSize) * 100);
    existing.context_window = {
      total_input_tokens: inputTokens,
      total_output_tokens: outputTokens,
      context_window_size: finalSize,
      current_usage: usage,
      used_percentage: finalPct,
      remaining_percentage: 100 - finalPct,
    };

    writeFileSync(CONTEXT_WINDOW_FILE, JSON.stringify(existing) + '\n');
  } catch { }
}
