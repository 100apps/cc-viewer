# KV-Cache Content

## What is KV-Cache?

KV-Cache (Key-Value Cache) is a core acceleration mechanism for large language model inference. When you chat with Claude, each request sends the complete conversation history (system prompt + tool definitions + historical messages). If we recalculated this content from scratch every time, it would be extremely time-consuming and expensive.

KV-Cache works by caching already-computed content and reusing it on the next request, skipping redundant calculations.

## How Caching Works

Anthropic's prompt caching concatenates the cache key in a fixed order:

```
System Prompt → Tools → Messages (up to cache breakpoint)
```

As long as this prefix matches the previous request exactly, the API returns a cache hit (`cache_read_input_tokens`), significantly reducing latency and cost.

## What is "Current KV-Cache Content"?

The "Current KV-Cache Content" displayed in cc-viewer is extracted from the most recent MainAgent request and marked as cached. It specifically includes:

- **System Prompt**: Claude Code's system instructions, containing your CLAUDE.md, project instructions, environment information, etc.
- **Messages**: The portion of conversation history that is cached (typically earlier messages)
- **Tools**: The current list of available tool definitions (such as Read, Write, Bash, MCP tools, etc.)

These contents are marked with cache boundaries in the API request body via `cache_control: { type: "ephemeral" }`.

## Why View Cache Content?

1. **Understand Context**: See what Claude currently "remembers" to help you judge whether its behavior matches expectations
2. **Cost Optimization**: Cache hits cost far less than recalculation. Viewing cache content helps you understand why certain requests triggered cache rebuilds
3. **Debug Conversations**: When Claude's responses don't match expectations, checking cache content confirms whether the system prompt and historical messages are correct
4. **User Instruction Navigation**: Through the user message list in cached content, you can quickly jump to any position in the conversation
5. **Context Quality Monitoring**: During daily debugging, modifying Claude Code configuration, or adjusting prompts, KV-Cache-Text provides a centralized view to quickly confirm whether core context has degraded or been unexpectedly polluted—without manually reviewing raw messages

## Cache Lifecycle

- **Creation**: On first request or after cache expiration, the API creates a new cache (`cache_creation_input_tokens`)
- **Hit**: Subsequent requests with matching prefixes reuse the cache (`cache_read_input_tokens`)
- **Expiration**: Cache has a 5-minute TTL (time-to-live) and automatically expires after timeout
- **Rebuild**: When system prompt, tool list, model, or messages change, the cache key no longer matches, triggering a rebuild
