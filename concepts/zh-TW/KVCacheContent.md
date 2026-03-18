# KV-Cache 快取內容

## 什麼是 KV-Cache？

KV-Cache（Key-Value Cache）是大語言模型推理時的核心加速機制。當你與 Claude 對話時，每次請求都會發送完整的對話歷史（system prompt + 工具定義 + 歷史訊息）。如果每次都從頭計算這些內容，會非常耗時且昂貴。

KV-Cache 的作用是：將已經計算過的內容快取起來，下次請求時直接複用，跳過重複計算。

## 快取的工作原理

Anthropic 的 prompt caching 按照固定順序拼接快取鍵：

```
System Prompt → Tools → Messages（到 cache breakpoint）
```

只要這個前綴與上一次請求完全一致，API 就會命中快取（返回 `cache_read_input_tokens`），大幅降低延遲和費用。

## "當前 KV-Cache 快取內容"是什麼？

cc-viewer 中顯示的"當前 KV-Cache 快取內容"，是從最近一次 MainAgent 請求中提取的、被標記為快取的內容。具體包括：

- **System Prompt**：Claude Code 的系統指令，包含你的 CLAUDE.md、專案說明、環境資訊等
- **Messages**：對話歷史中被快取的部分（通常是較早的訊息）
- **Tools**：當前可用的工具定義列表（如 Read、Write、Bash、MCP 工具等）

這些內容在 API 請求的 body 中通過 `cache_control: { type: "ephemeral" }` 標記來指示快取邊界。

## 為什麼要查看快取內容？

1. **理解上下文**：了解 Claude 當前「記住」了哪些內容，幫助你判斷它的行為是否符合預期
2. **費用優化**：快取命中時費用遠低於重新計算。查看快取內容可以幫助你理解為什麼某些請求觸發了快取重建（cache rebuild）
3. **調試對話**：當 Claude 的回答不符合預期時，檢查快取內容可以確認 system prompt 和歷史訊息是否正確
4. **使用者指令導航**：通過快取內容中的使用者訊息列表，可以快速跳轉到對話中的任意位置
5. **上下文品質監控**：在日常調試、修改 Claude Code 配置或調整 prompt 的過程中，KV-Cache-Text 提供了一個集中的視角，幫助你快速確認核心上下文是否出現劣化或被意外內容污染——無需逐條翻閱原始報文

## 快取的生命週期

- **建立**：首次請求或快取失效後，API 會建立新快取（`cache_creation_input_tokens`）
- **命中**：後續請求前綴一致時複用快取（`cache_read_input_tokens`）
- **過期**：快取有 5 分鐘的 TTL（存活時間），超時後自動失效
- **重建**：當 system prompt、工具列表、模型或訊息發生變化時，快取鍵不匹配，觸發重建
