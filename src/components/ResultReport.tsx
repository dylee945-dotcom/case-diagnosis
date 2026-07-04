import type { CrimeType, RiskLevel, StageResult, Role } from '../types'
import { CRIME_MAP } from '../data/crimes'
import { getActiveWarnings } from '../data/combinedWarnings'
import { getCasePrecedents } from '../data/casePrecedents'
import { getBestHeadline } from '../utils/headlineGenerator'
import { getStageBadgeColor, getVictimStageLabel, getAccusedStageLabel } from '../utils/stageInference'

const CONSULT_URL = 'https://www.lawtalk.co.kr/directory/profile/7502-%EC%9D%B4%EB%8F%84%EC%97%B0'

interface Props {
  role: Role | null
  selectedCrimes: CrimeType[]
  stageResult: StageResult
  answers: Record<string, string>
  onReset: () => void
}

// ─── Risk meta ───────────────────────────────────────────
const RISK_META: Record<RiskLevel, { bar: string; text: string; bg: string; border: string; label: string; desc: string }> = {
  0: { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  label: '낮음', desc: '낮은 편' },
  1: { bar: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  label: '중간', desc: '중간 수준' },
  2: { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: '높음', desc: '높은 편' },
  3: { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    label: '위험', desc: '위험 구간' },
}

const SEVERITY_STYLE = {
  CRITICAL: { card: 'border-red-200 bg-red-50',    badge: 'bg-red-600 text-white',    label: 'CRITICAL' },
  HIGH:     { card: 'border-orange-200 bg-orange-50', badge: 'bg-orange-500 text-white', label: 'HIGH' },
  MEDIUM:   { card: 'border-amber-200 bg-amber-50',  badge: 'bg-amber-500 text-white',  label: 'MEDIUM' },
}

// ─── Document data ────────────────────────────────────────
const ACCUSED_DOCS = [
  {
    id: 'appeal',
    label: '반성문',
    warning: '⛔ 이 초안은 혐의 인정을 전제로 한 문구입니다. 혐의를 부인하는 경우 절대 사용하지 마세요. 표현 방식에 따라 검사·판사가 진정한 반성으로 인정하지 않을 수 있습니다.',
    preview: '이 사건과 관련하여 저의 행동이 피해자에게 심각한 고통을 주었음을 깊이 반성합니다. 저는 당시 상황의 심각성을 충분히 인식하지 못한 채...',
  },
  {
    id: 'opinion',
    label: '변호인 의견서',
    warning: '구성요건 다툼 포인트가 잘못 기재되면 오히려 불리한 자료로 작용할 수 있습니다.',
    preview: '피의자 ○○○에 대한 혐의와 관련하여 다음과 같이 의견을 제출합니다.\n\n1. 사건의 개요\n2. 구성요건 검토...',
  },
]

const VICTIM_DOCS = [
  {
    id: 'complaint',
    label: '고소장',
    warning: '사실관계 표현이 부정확하거나 과장되면 무고 위험이 생길 수 있습니다. 변호사 검토를 권장합니다.',
    preview: '고  소  장\n\n고소인: ○○○ (○○○○년생)\n피고소인: ○○○\n\n고소 취지: 피고소인을 아래와 같은 죄명으로 고소하오니...',
  },
]

// ─── Helper functions ─────────────────────────────────────
function computeOverallRisk(crimes: CrimeType[], answers: Record<string, string>) {
  const levels: RiskLevel[] = []
  for (const id of crimes) {
    const crime = CRIME_MAP[id]
    if (!crime) continue
    for (const dim of crime.dimensions) levels.push(dim.scoringFn(answers))
  }
  if (levels.length === 0) return { maxLevel: 0 as RiskLevel, counts: { 0: 0, 1: 0, 2: 0, 3: 0 } as Record<RiskLevel, number> }
  const maxLevel = Math.max(...levels) as RiskLevel
  const counts = { 0: 0, 1: 0, 2: 0, 3: 0 } as Record<RiskLevel, number>
  for (const l of levels) counts[l]++
  return { maxLevel, counts }
}

// ─── Sub-components ───────────────────────────────────────

function OverallRiskSummary({ crimes, answers }: { crimes: CrimeType[]; answers: Record<string, string> }) {
  const { maxLevel, counts } = computeOverallRisk(crimes, answers)
  const meta = RISK_META[maxLevel]
  return (
    <div className={`rounded-2xl border p-5 mb-5 ${meta.bg} ${meta.border}`}>
      <div className="section-label">종합 리스크 요약</div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className={`text-base font-bold ${meta.text}`}>
            유사 사건 대비 <span className="text-xl">{meta.label}</span> 위험 구간
          </div>
          <div className="text-sm text-navy-600 mt-0.5">답변하신 내용을 기준으로 산출했습니다</div>
        </div>
        <div className={`text-3xl font-black ${meta.text} flex-shrink-0 leading-none`}>{meta.label}</div>
      </div>
      <div className="flex flex-wrap gap-3">
        {([3, 2, 1, 0] as RiskLevel[]).map((l) => {
          if (counts[l] === 0) return null
          const m = RISK_META[l]
          return (
            <div key={l} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${m.bar}`} />
              <span className={`text-xs font-medium ${m.text}`}>{m.label} {counts[l]}개</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RiskDimensionBar({ level }: { level: RiskLevel }) {
  const meta = RISK_META[level]
  return (
    <div className="flex items-center gap-3">
      <div className="risk-track flex-1">
        <div className={`h-full ${meta.bar} rounded-full transition-all duration-500`} style={{ width: `${(level + 1) * 25}%` }} />
      </div>
      <span className={`text-xs font-semibold w-10 text-right flex-shrink-0 ${meta.text}`}>{meta.desc}</span>
    </div>
  )
}

function CasePrecedentsSection({ crimeId }: { crimeId: CrimeType }) {
  const precedents = getCasePrecedents(crimeId)
  if (precedents.length === 0) return null
  return (
    <div className="card mb-4">
      <div className="section-label">유사 사건 판례에 비춰본 추정 선고형</div>
      <div className="space-y-3">
        {precedents.map((p, i) => (
          <div key={i} className="rounded-xl border border-card-border bg-surface p-3.5">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-xs font-bold text-navy-400 flex-shrink-0">사례 {i + 1}</span>
              <span className="text-xs text-navy-600 leading-relaxed">{p.profile}</span>
            </div>
            <div className="text-sm font-semibold text-navy-900 mb-1">{p.outcome}</div>
            <div className="text-xs text-navy-500 leading-relaxed">{p.details}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-navy-400 leading-relaxed">
        위 사례는 공개된 판결문 기준으로 구성한 참고 자료입니다. 실제 선고형은 재판부 재량에 따라 달라집니다.
      </div>
    </div>
  )
}

function CrimeSection({ crimeId, stageResult, answers, isVictim }: {
  crimeId: CrimeType
  stageResult: StageResult
  answers: Record<string, string>
  isVictim: boolean
}) {
  const crime = CRIME_MAP[crimeId]
  if (!crime) return null

  const headline = isVictim ? null : getBestHeadline(crimeId, stageResult.stage, answers)

  return (
    <div className="mb-8">
      {/* 결정적 한 줄 — 피의자 전용 */}
      {headline && (
        <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 mb-4">
          <p className="text-navy-900 font-bold text-base leading-relaxed whitespace-pre-line">
            {headline.text}
          </p>
        </div>
      )}

      {/* Risk dimensions */}
      <div className="card mb-4">
        <div className="section-label">
          {isVictim ? '피해 심각성 분석' : '5개 차원 리스크 분석'}
        </div>
        <div className="space-y-4">
          {crime.dimensions.map((dim) => {
            const level = dim.scoringFn(answers)
            return (
              <div key={dim.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-navy-800 font-semibold">{dim.name}</span>
                </div>
                <RiskDimensionBar level={level} />
                <p className="text-xs text-navy-500 mt-1 leading-relaxed">{dim.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sentencing — replaced with consultation button */}
      <div className="card mb-4">
        <div className="section-label">
          {isVictim ? '가해자에게 예상되는 처벌 수위' : '양형기준 기반 예상 권고 구간'}
        </div>
        <p className="text-xs text-navy-500 mb-4 leading-relaxed">
          {isVictim
            ? '처벌 수위는 확보된 증거와 고소 전략에 따라 크게 달라집니다. 변호사 상담을 통해 정확한 분석을 받아보세요.'
            : '예상 처벌 수위는 사건의 구체적 사실관계, 증거, 법률 전략에 따라 크게 달라집니다. 변호사 상담을 통해 정확한 분석을 받아보세요.'}
        </p>
        <a
          href={CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-navy-900 text-white font-bold rounded-xl text-sm hover:bg-navy-700 transition-colors text-center"
        >
          변호사와 예상 처벌 수위 확인하기 →
        </a>
      </div>

      {/* Case Precedents */}
      <CasePrecedentsSection crimeId={crimeId} />
    </div>
  )
}

// ─── Documents section (단일 통합) ───────────────────────
function DocumentsSection({ isVictim }: { isVictim: boolean }) {
  const docs = isVictim ? VICTIM_DOCS : ACCUSED_DOCS
  return (
    <div className="mb-6">
      <div className="section-label mb-3">관련 문서 초안</div>
      <div className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.id} className="rounded-xl border border-card-border overflow-hidden bg-white">
            <div className="px-4 py-2.5 bg-navy-50 border-b border-card-border flex items-center justify-between">
              <span className="text-sm font-semibold text-navy-800">{doc.label}</span>
              <span className="text-xs bg-white border border-card-border text-navy-500 px-2 py-0.5 rounded-full">초안</span>
            </div>
            <div className="relative overflow-hidden max-h-20">
              <div className="px-4 pt-3 pb-1 font-mono text-xs text-navy-600 leading-relaxed whitespace-pre-line bg-white">
                {doc.preview}
              </div>
              <div className="blur-fade absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
            <div className="mx-3 mt-2 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs text-amber-800 leading-relaxed">주의 — {doc.warning}</p>
            </div>
            <div className="px-3 pb-3">
              <a
                href={CONSULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-colors text-center"
              >
                {doc.label} 검토 + 완성하기 →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Consultation CTA ─────────────────────────────────────
function ConsultationCTA({ role }: { role: Role | null }) {
  const isVictim = role === 'victim'
  return (
    <div className="bg-navy-900 rounded-2xl p-5 mb-6 text-white">
      <div className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
        변호사 상담
      </div>
      <h3 className="text-lg font-bold mb-2">
        {isVictim
          ? '지금 바로 변호사와 상담하세요'
          : '지금 상황을 변호사와 함께 점검하세요'}
      </h3>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {isVictim
          ? '신고 방법부터 증거 확보, 피해자 지원 제도까지 — 첫 상담에서 모두 안내해 드립니다.'
          : '진단 결과를 바탕으로 실제 대응 전략을 설계합니다. 초기 대응 하나가 결과를 바꿉니다.'}
      </p>
      <a
        href={CONSULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-white text-navy-900 font-bold rounded-xl text-sm hover:bg-navy-50 transition-colors text-center"
      >
        상담하기 →
      </a>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────
export default function ResultReport({ role, selectedCrimes, stageResult, answers, onReset }: Props) {
  const warnings = getActiveWarnings(selectedCrimes, answers)
  const isVictim = role === 'victim'

  function getStageLabel(stage: string) {
    return isVictim
      ? getVictimStageLabel(stage as Parameters<typeof getVictimStageLabel>[0])
      : getAccusedStageLabel(stage as Parameters<typeof getAccusedStageLabel>[0])
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-navy-900">진단 결과</h2>
        <button onClick={onReset} className="btn-ghost text-sm">처음부터</button>
      </div>

      {/* Top disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">⚠ 참고 자료</span> — 이 진단 결과는 일반적인 정보 제공 목적이며 법률 자문이 아닙니다. 실제 결과는 사건의 구체적 사실관계에 따라 크게 달라집니다.
        </p>
      </div>

      {/* Crime headers — shown immediately after title */}
      {selectedCrimes.map((crimeId) => {
        const crime = CRIME_MAP[crimeId]
        if (!crime) return null
        return (
          <div key={crimeId} className="card-accent mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-navy-900 text-base">{crime.name}</h3>
                <div className="text-xs text-navy-400 mt-0.5">{crime.law}</div>
              </div>
              <span className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                {isVictim ? '피해 분석' : '혐의 분석'}
              </span>
            </div>
            {crime.notice && (
              <p className="text-xs text-amber-700 mt-2 leading-relaxed border-t border-amber-100 pt-2">{crime.notice}</p>
            )}
          </div>
        )
      })}

      {/* Stage badge */}
      <div className={`rounded-xl border px-5 py-4 mb-5 ${getStageBadgeColor(stageResult.stage)}`}>
        <div className="text-xs font-semibold opacity-60 mb-1">
          {isVictim ? '현재 상황 추정' : '현재 단계 추정'}
        </div>
        <div className="font-bold text-lg leading-snug">
          {stageResult.uncertain && stageResult.secondaryStage
            ? <><span className="font-extrabold">{getStageLabel(stageResult.stage)}</span> ~ {getStageLabel(stageResult.secondaryStage)}</>
            : <span className="font-extrabold">{getStageLabel(stageResult.stage)}</span>
          }
        </div>
        {stageResult.note && (
          <div className="text-xs mt-2 opacity-70 leading-relaxed">{stageResult.note}</div>
        )}
        <div className="text-xs opacity-40 mt-1">
          {isVictim
            ? '실제 수사 진행 상황은 담당 수사관에게 직접 확인하세요.'
            : '실제 단계는 담당 수사관 확인이 필요합니다.'}
        </div>
      </div>

      {/* Overall risk — 피의자만 표시 */}
      {!isVictim && <OverallRiskSummary crimes={selectedCrimes} answers={answers} />}

      {/* Combined warnings */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-bold text-navy-900 mb-3">
            {isVictim
              ? '가해자에게 적용될 수 있는 추가 혐의'
              : '지금 상황에서 추가로 문제될 수 있는 것이 있습니다'}
          </div>
          <div className="space-y-3">
            {warnings.map((w) => {
              const sty = SEVERITY_STYLE[w.severity]
              return (
                <div key={w.id} className={`rounded-xl border p-4 ${sty.card}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sty.badge}`}>{sty.label}</span>
                    <h4 className="font-bold text-navy-900 text-sm">{w.title}</h4>
                  </div>
                  <div className="text-xs text-navy-600 mb-2 leading-relaxed">
                    <span className="font-semibold text-navy-700">
                      {isVictim ? '관련 근거 —' : '이 경고가 나온 이유 —'}
                    </span>{' '}
                    {w.triggerReason(answers)}
                  </div>
                  <p className="text-xs text-navy-700 leading-relaxed mb-3">{w.explanation}</p>
                  <div className="border-t border-black/5 pt-3">
                    <div className="text-xs text-navy-500 mb-1">
                      {isVictim ? '가해자 처벌 수위 변화' : '수위 변화'}
                    </div>
                    <div className="text-xs text-navy-800 font-semibold leading-relaxed">{w.sentenceChange}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Consultation CTA — 피의자: 종합 리스크 요약 + 경고 이후 바로 표시 */}
      {!isVictim && <ConsultationCTA role={role} />}

      {/* Per-crime analysis */}
      {selectedCrimes.map((crimeId) => (
        <CrimeSection
          key={crimeId}
          crimeId={crimeId}
          stageResult={stageResult}
          answers={answers}
          isVictim={isVictim}
        />
      ))}

      {/* Documents — 1회 통합 표시 */}
      <DocumentsSection isVictim={isVictim} />

      {/* Footer */}
      <div className="card-sm text-xs text-navy-500 leading-relaxed mb-4">
        <span className="font-bold text-navy-700">⚠ 법적 면책 고지</span> — 이 진단 결과는 입력된 정보를 토대로 생성된 참고 자료이며, 법률 자문이 아닙니다. 본 결과의 정확성·완전성에 대하여 어떠한 법적 책임도 부담하지 않습니다. 실제 법적 결과는 사건의 구체적 사실관계, 증거, 법원 재량에 따라 크게 달라질 수 있으므로, 이 결과만을 근거로 어떠한 법적 결정도 내리지 마시기 바랍니다. 반드시 변호사와 직접 상담하여 구체적인 법률 조언을 받으시기 바랍니다.
      </div>

      <button onClick={onReset} className="btn-secondary w-full">
        ← 처음으로 돌아가기
      </button>
    </div>
  )
}
