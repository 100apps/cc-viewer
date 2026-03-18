# KV-Cache 缓存内容

## 什么是 KV-Cache？

KV-Cache（Key-Value Cache）是大语言模型推理时的核心加速机制。当你与 Claude 对话时，每次请求都会发送完整的对话历史（system prompt + 工具定义 + 历史消息）。如果每次都从头计算这些内容，会非常耗时且昂贵。

KV-Cache 的作用是：将已经计算过的内容缓存起来，下次请求时直接复用，跳过重复计算。

## 缓存的工作原理

Anthropic 的 prompt caching 按照固定顺序拼接缓存键：

```
System Prompt → Tools → Messages（到 cache breakpoint）
```

只要这个前缀与上一次请求完全一致，API 就会命中缓存（返回 `cache_read_input_tokens`），大幅降低延迟和费用。

## "当前 KV-Cache 缓存内容"是什么？

cc-viewer 中显示的"当前 KV-Cache 缓存内容"，是从最近一次 MainAgent 请求中提取的、被标记为缓存的内容。具体包括：

- **System Prompt**：Claude Code 的系统指令，包含你的 CLAUDE.md、项目说明、环境信息等
- **Messages**：对话历史中被缓存的部分（通常是较早的消息）
- **Tools**：当前可用的工具定义列表（如 Read、Write、Bash、MCP 工具等）

这些内容在 API 请求的 body 中通过 `cache_control: { type: "ephemeral" }` 标记来指示缓存边界。

## 为什么要查看缓存内容？

1. **理解上下文**：了解 Claude 当前"记住"了哪些内容，帮助你判断它的行为是否符合预期
2. **费用优化**：缓存命中时费用远低于重新计算。查看缓存内容可以帮助你理解为什么某些请求触发了缓存重建（cache rebuild）
3. **调试对话**：当 Claude 的回答不符合预期时，检查缓存内容可以确认 system prompt 和历史消息是否正确
4. **用户指令导航**：通过缓存内容中的用户消息列表，可以快速跳转到对话中的任意位置
5. **上下文质量监控**：在日常调试、修改 Claude Code 配置或调整 prompt 的过程中，KV-Cache-Text 提供了一个集中的视角，帮助你快速确认核心上下文是否出现劣化或被意外内容污染——无需逐条翻阅原始报文

## 缓存的生命周期

- **创建**：首次请求或缓存失效后，API 会创建新缓存（`cache_creation_input_tokens`）
- **命中**：后续请求前缀一致时复用缓存（`cache_read_input_tokens`）
- **过期**：缓存有 5 分钟的 TTL（存活时间），超时后自动失效
- **重建**：当 system prompt、工具列表、模型或消息发生变化时，缓存键不匹配，触发重建
