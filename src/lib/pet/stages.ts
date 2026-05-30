export type PetStage = 'egg' | 'baby' | 'juvenile' | 'adult' | 'elder'

export type StageDef = {
  stage: PetStage
  level: number
  label: string
  minXp: number
}

// Single source of truth for growth stages and XP thresholds.
// XP is awarded as study minutes (1 XP per minute studied).
export const PET_STAGES: StageDef[] = [
  { stage: 'egg', level: 1, label: 'Egg', minXp: 0 },
  { stage: 'baby', level: 2, label: 'Baby', minXp: 30 },
  { stage: 'juvenile', level: 3, label: 'Juvenile', minXp: 240 },
  { stage: 'adult', level: 4, label: 'Adult', minXp: 600 },
  { stage: 'elder', level: 5, label: 'Elder', minXp: 1200 }
]

function safeXp(xp: number) {
  return Number.isFinite(xp) ? Math.max(0, xp) : 0
}

export function getStageForXp(xp: number): StageDef {
  const v = safeXp(xp)
  let current = PET_STAGES[0]
  for (const s of PET_STAGES) {
    if (v >= s.minXp) current = s
  }
  return current
}

export function getLevelForXp(xp: number): number {
  return getStageForXp(xp).level
}

export type StageProgress = {
  stage: StageDef
  next: StageDef | null
  xpIntoStage: number
  xpForStage: number
  ratio: number
  isMax: boolean
}

export function getStageProgress(xp: number): StageProgress {
  const v = safeXp(xp)
  const stage = getStageForXp(v)
  const idx = PET_STAGES.findIndex((s) => s.stage === stage.stage)
  const next = idx >= 0 && idx < PET_STAGES.length - 1 ? PET_STAGES[idx + 1] : null

  if (!next) {
    return { stage, next: null, xpIntoStage: v - stage.minXp, xpForStage: 0, ratio: 1, isMax: true }
  }

  const span = next.minXp - stage.minXp
  const into = v - stage.minXp
  const ratio = span > 0 ? Math.max(0, Math.min(1, into / span)) : 1
  return { stage, next, xpIntoStage: into, xpForStage: span, ratio, isMax: false }
}
