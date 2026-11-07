export interface Candidate { label: string; score: number; margin: number; accepted: boolean }
export function decide(scores: number[], labels: string[]): Candidate {
  if (scores.length !== labels.length || labels.length < 2 || scores.some(v => !Number.isFinite(v) || v < 0 || v > 1)) throw new Error('Output model tidak sesuai label.')
  const order = scores.map((score, i) => ({ score, label: labels[i]! })).sort((a, b) => b.score - a.score)
  const best = order[0]!
  const margin = best.score - order[1]!.score
  return { ...best, margin, accepted: best.score >= .85 && margin >= .15 }
}
