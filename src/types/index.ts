export type Role = 'victim' | 'accused'

export type CrimeType =
  | 'cam' | 'dist' | 'poss' | 'child' | 'deep' | 'comm' | 'stalk'
  | 'rape' | 'quasi_rape' | 'molestation' | 'quasi_molestation'
  | 'authority' | 'workplace'

export type Stage =
  | 'pre-report' | 'early' | 'mid' | 'forensics' | 'pre-indictment'

export type RiskLevel = 0 | 1 | 2 | 3

export type SentencingDirection = 'special-aggravate' | 'aggravate' | 'mitigate'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  text: string
  subtext?: string
  options: QuestionOption[]
}

export interface CrimeConfig {
  id: CrimeType
  name: string
  shortName: string
  law: string
  notice?: string
  questions: Question[]
  dimensions: DimensionConfig[]
}

export interface DimensionConfig {
  id: string
  name: string
  description: string
  scoringFn: (answers: Record<string, string>) => RiskLevel
}

export interface CombinedWarning {
  id: string
  triggerFn: (crimes: CrimeType[], answers: Record<string, string>) => boolean
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  title: string
  triggerReason: (answers: Record<string, string>) => string
  explanation: string
  sentenceChange: string
}

export interface SentencingFactor {
  direction: SentencingDirection
  label: string
  confirmed: boolean
}

export interface SentencingRangeType {
  typeName: string
  ranges: { label: string; min: string; max: string }[]
}

export interface SentencingConfig {
  types: SentencingRangeType[]
  factorFn: (answers: Record<string, string>) => SentencingFactor[]
  estimateFn: (answers: Record<string, string>) => { typeIdx: number; rangeLabel: string; note: string }
}

export interface Q0Answers {
  q1: string | null
  q2: string | null
  q3: string | null
}

export interface StageResult {
  stage: Stage
  uncertain: boolean
  secondaryStage?: Stage
  message: string
  note?: string
}

export interface CasePrecedent {
  profile: string
  outcome: string
  details: string
}

export type AppStep = 'role' | 'select' | 'q0' | 'questions' | 'result'

export interface AppState {
  role: Role | null
  step: AppStep
  selectedCrimes: CrimeType[]
  q0Step: 0 | 1 | 2 | 3
  q0Answers: Q0Answers
  stageResult: StageResult | null
  answers: Record<string, string>
  currentCrimeIdx: number
  currentQuestionIdx: number
}

// ─── Victim flow types ────────────────────────────────────
export type IndictmentLevel = 0 | 1 | 2 | 3  // 낮음/보통/높음/매우높음

export interface VictimCrimeConfig {
  id: CrimeType
  name: string
  shortName: string
  law: string
  questions: Question[]
}

export interface VictimAnalysis {
  indictmentLevel: IndictmentLevel
  indictmentFactors: { label: string; positive: boolean }[]
  evidenceLevel: 0 | 1 | 2 | 3
  settlementRange: string
  settlementFactors: { label: string; up: boolean }[]
  note: string
  settlementNote: string
}

export type AppAction =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'TOGGLE_CRIME'; crime: CrimeType }
  | { type: 'START_Q0' }
  | { type: 'ANSWER_Q0'; q: 'q1' | 'q2' | 'q3'; value: string }
  | { type: 'CONFIRM_STAGE'; stageResult: StageResult }
  | { type: 'START_QUESTIONS' }
  | { type: 'ANSWER_QUESTION'; crimeId: CrimeType; questionId: string; value: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'SHOW_RESULT' }
  | { type: 'RESET' }
