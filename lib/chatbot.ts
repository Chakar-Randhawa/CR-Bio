import type { ChatbotQA } from "@/lib/types";

const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","do","does","did","i","you","your","my","me","of","in","on","at","to",
  "for","and","or","but","how","what","when","where","why","who","can","will","would","should","it","this",
  "that","with","about","have","has","be","please","hi","hello","hey",
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function scoreMatch(queryTokens: Set<string>, qa: ChatbotQA): number {
  const questionTokens = new Set(tokenize(qa.question));
  const answerTokens = new Set(tokenize(qa.answer));
  if (questionTokens.size === 0) return 0;
  let overlap = 0;
  queryTokens.forEach((t) => {
    if (questionTokens.has(t)) overlap += 1;
    else if (answerTokens.has(t)) overlap += 0.35;
  });
  const denom = Math.max(queryTokens.size, questionTokens.size);
  return denom === 0 ? 0 : overlap / denom;
}

const MATCH_THRESHOLD = 0.28;

export function findBestAnswer(message: string, qaList: ChatbotQA[]): { qa: ChatbotQA; score: number } | null {
  const queryTokens = new Set(tokenize(message));
  if (queryTokens.size === 0 || qaList.length === 0) return null;
  let best: { qa: ChatbotQA; score: number } | null = null;
  for (const qa of qaList) {
    const score = scoreMatch(queryTokens, qa);
    if (!best || score > best.score) best = { qa, score };
  }
  if (!best || best.score < MATCH_THRESHOLD) return null;
  return best;
}
