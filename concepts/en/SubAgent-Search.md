# SubAgent: Search

## Definition

Search is a sub-agent type spawned by Claude Code's main agent to perform codebase searches. It executes targeted file and content searches using tools like Glob, Grep, and Read, then returns the results to the parent agent.

## Behavior

- Spawned automatically when the main agent needs to search or explore the codebase
- Runs in an isolated context with read-only access
- Uses Glob for file pattern matching, Grep for content search, and Read for file inspection
- Returns search results to the parent agent for further processing

## When It Appears

Search sub-agents typically appear when:

1. The main agent needs to find specific files, functions, or code patterns
2. A broad codebase exploration is requested by the user
3. The agent is investigating dependencies, references, or usage patterns

## Significance in cc-viewer

In the request timeline, Search sub-agents appear as nested request chains under the parent agent's request. Multiple Search sub-agents may run in parallel when the agent explores different parts of the codebase simultaneously. The SubAgent stats section counts how many Search operations were performed during a session.
