/**
 * Prompt classification utilities for PTY prompt detection.
 * Shared by ChatView.jsx and ChatMessage.jsx.
 */

export function isPlanApprovalPrompt(prompt) {
  if (!prompt || !prompt.question) return false;
  const q = prompt.question.toLowerCase();
  return /plan/i.test(q) && (/approv/i.test(q) || /proceed/i.test(q) || /accept/i.test(q));
}

export function isDangerousOperationPrompt(prompt) {
  if (!prompt || !prompt.question) return false;
  const q = prompt.question;
  if (isPlanApprovalPrompt(prompt)) return false;
  // Match Claude Code permission prompt patterns:
  // - "Do you want to proceed?" / "Allow X to Y" / "Want to allow"
  // - Options containing "Allow" or "Deny" keywords
  if (/do you want to proceed|allow.*to|want to allow|wants to|may .*(read|write|execute|run|access|create|delete|modify)|grant .*(access|permission)|permit/i.test(q)) {
    return true;
  }
  // Also detect by options: if options contain both Allow and Deny keywords
  if (prompt.options && prompt.options.length >= 2) {
    const texts = prompt.options.map(o => (o.text || '').toLowerCase());
    const hasAllow = texts.some(t => /^allow|^yes/i.test(t));
    const hasDeny = texts.some(t => /^deny|^no[^a-z]|^reject/i.test(t));
    if (hasAllow && hasDeny) return true;
  }
  return false;
}
