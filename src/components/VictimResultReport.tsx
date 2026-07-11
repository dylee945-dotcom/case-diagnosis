import type { CrimeType, StageResult, IndictmentLevel } from '../types'
import { getVictimAnalysis } from '../data/victimAnalysis'
import { getStageBadgeColor, getVictimStageLabel } from '../utils/stageInference'
import { CONSULT_URL } from '../constants'

interface Props {
  selectedCrimes: CrimeType[]
  stageResult: StageResult
  answers: Record<string, string>
  onReset: () => void
}

// ─── Indictment level meta ─────────────────────────────────
const INDICTMENT_META: Record<IndictmentLevel, {
  label: string; desc: string; color: string; bg: string; border: string; barColor: string
}> = {
  0: { label: '낮음',     desc: '현재 증거만으로는 기소가 쉽지 않습니다. 변호사와 함께 증거를 보강하면 결과가 달라질 수 있습니다.',    color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200', barColor: 'bg-slate-400' },
  1: { label: '보통',     desc: '증거 보강과 고소장 작성 방식에 따라 기소 가능성이 크게 달라집니다. 변호사 상담을 통해 전략을 세우세요.', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200', barColor: 'bg-amber-500' },
  2: { label: '높음',     desc: '변호사와 함께 제대로 된 고소장을 작성하고 제출하면 기소로 이어질 가능성이 높습니다.',                  color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', barColor: 'bg-orange-500' },
  3: { label: '매우 높음', desc: '증거와 상황이 모두 유리합니다. 변호사와 함께 고소장을 완성하면 기소 가능성이 매우 높습니다.',          color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   barColor: 'bg-red-500' },
}

const EVIDENCE_LABELS: Record<0|1|2|3, string> = {
  0: '부족',
  1: '간접 증거',
  2: '보통',
  3: '직접 증거',
}

// ─── Support resources ─────────────────────────────────────
const SUPPORT = [
  { name: '해바라기센터 (성폭력 피해자 통합 지원)', contact: '1899-3075', desc: '24시간 의료·법률·심리 지원, 증거 채취' },
  { name: '디지털성범죄피해자지원센터', contact: '02-735-8994', desc: '불법 영상 삭제 지원, 디지털 성범죄 전담' },
  { name: '여성긴급전화', contact: '1366', desc: '24시간 위기 상담, 긴급 지원 연계' },
  { name: '대한법률구조공단', contact: '132', desc: '무료 법률 상담 및 소송 지원' },
]

// ─── Sub-components ────────────────────────────────────────

function StageBadge({ stageResult }: { stageResult: StageResult }) {
  return (
    <div className={`rounded-xl border px-5 py-4 mb-5 ${getStageBadgeColor(stageResult.stage)}`}>
      <div className="text-xs font-semibold opacity-60 mb-1">현재 상황 추정</div>
      <div className="font-bold text-lg leading-snug">
        {stageResult.uncertain && stageResult.secondaryStage
          ? <><span className="font-extrabold">{getVictimStageLabel(stageResult.stage)}</span> ~ {getVictimStageLabel(stageResult.secondaryStage)}</>
          : <span className="font-extrabold">{getVictimStageLabel(stageResult.stage)}</span>
        }
      </div>
      {stageResult.note && (
        <div className="text-xs mt-2 opacity-70 leading-relaxed">{stageResult.note}</div>
      )}
    </div>
  )
}

function IndictmentSummary({ crimes, answers }: { crimes: CrimeType[]; answers: Record<string, string> }) {
  const analyses = crimes.map((id) => getVictimAnalysis(id, answers))
  const maxLevel = Math.max(...analyses.map((a) => a.indictmentLevel)) as IndictmentLevel
  const meta = INDICTMENT_META[maxLevel]

  return (
    <div className={`rounded-2xl border p-5 mb-5 ${meta.bg} ${meta.border}`}>
      <div className="section-label">기소 가능성 종합</div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className={`text-2xl font-black ${meta.color}`}>{meta.label}</div>
          <div className={`text-sm mt-1 ${meta.color} opacity-80`}>{meta.desc}</div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {([3, 2, 1, 0] as IndictmentLevel[]).map((l) => {
            const m = INDICTMENT_META[l]
            return (
              <div key={l} className={`flex items-center gap-1.5 text-xs ${l === maxLevel ? 'font-semibold' : 'opacity-40'}`}>
                <div className={`w-2 h-2 rounded-full ${m.barColor}`} />
                <span className={m.color}>{m.label}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="text-xs opacity-60">
        입력하신 내용 기준 추정치입니다. 실제 기소 여부는 검사의 재량에 따라 결정됩니다.
      </div>
    </div>
  )
}

function EvidenceBar({ level }: { level: 0|1|2|3 }) {
  const colors = ['bg-slate-300', 'bg-amber-400', 'bg-orange-400', 'bg-green-500']
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colors[level]}`} style={{ width: `${(level + 1) * 25}%` }} />
      </div>
      <span className="text-xs font-semibold text-navy-600 w-16 text-right flex-shrink-0">{EVIDENCE_LABELS[level]}</span>
    </div>
  )
}

function SentencingPreview() {
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-navy-500 mb-2">가해자에게 적용될 예상 처벌 범위</div>
      <div className="rounded-lg border border-navy-100 bg-navy-50 px-4 py-3 text-xs text-navy-700 leading-relaxed mb-3">
        예상 처벌 범위는 사건의 구체적 사실관계, 증거 강도, 전과 여부 등에 따라 크게 달라집니다.<br />
        정확한 처벌 수위는 변호사 상담을 통해 직접 확인하시기 바랍니다.
      </div>
      <a
        href={CONSULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg transition-colors text-center"
      >
        처벌 수위 변호사와 확인하기 →
      </a>
    </div>
  )
}

function CrimeAnalysisSection({ crimeId, answers }: { crimeId: CrimeType; answers: Record<string, string> }) {
  const analysis = getVictimAnalysis(crimeId, answers)
  const positives = analysis.indictmentFactors.filter((f) => f.positive)
  const negatives = analysis.indictmentFactors.filter((f) => !f.positive)

  return (
    <div className="mb-8">
      {/* 증거 강도 */}
      <div className="card mb-4">
        <div className="section-label">증거 강도</div>
        <EvidenceBar level={analysis.evidenceLevel} />
        {analysis.evidenceLevel < 2 && (
          <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            증거 보강이 필요합니다. 지금 할 수 있는 조치를 변호사와 확인하세요.
          </div>
        )}
      </div>

      {/* 기소 분석 */}
      <div className="card mb-4">
        <div className="section-label">기소에 영향을 주는 요소</div>
        <div className="space-y-2">
          {positives.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">✓</span>
              <span className="text-navy-700 leading-relaxed">{f.label}</span>
            </div>
          ))}
          {negatives.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">!</span>
              <span className="text-navy-700 leading-relaxed">{f.label}</span>
            </div>
          ))}
        </div>
        {analysis.note && (
          <div className="mt-3 pt-3 border-t border-card-border text-xs text-navy-500 leading-relaxed">
            {analysis.note}
          </div>
        )}
      </div>

      {/* 가해자 예상 처벌 */}
      <div className="card mb-4">
        <SentencingPreview />
      </div>

      {/* 합의금 */}
      <div className="card mb-4">
        <div className="section-label">합의금</div>
        <div className="rounded-lg border border-navy-100 bg-navy-50 px-4 py-3 text-xs text-navy-700 leading-relaxed mb-3">
          합의금은 피해 정도, 증거 강도, 가해자 전과 여부 등에 따라 사건마다 크게 달라집니다.<br />
          적정 합의금 수준과 협상 전략은 변호사 상담을 통해 확인하시기 바랍니다.
        </div>
        <a
          href={CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg transition-colors text-center"
        >
          합의금 범위 변호사와 확인하기 →
        </a>
      </div>
    </div>
  )
}

function NextStepsSection({ answers, crimes }: { answers: Record<string, string>; crimes: CrimeType[] }) {
  const analyses = crimes.map((id) => getVictimAnalysis(id, answers))
  const maxEv = Math.max(...analyses.map((a) => a.evidenceLevel)) as 0|1|2|3

  const steps: string[] = []
  if (maxEv < 2) steps.push('지금 바로 대화기록·문자·SNS 내역을 캡처하고 백업하세요')
  if (crimes.includes('rape') || crimes.includes('quasi_rape'))
    steps.push('해바라기센터 방문 (1899-3075) — 무료 신체 검사와 법의학적 증거 채취')
  if (crimes.includes('cam') || crimes.includes('dist') || crimes.includes('deep'))
    steps.push('디지털성범죄피해자지원센터(02-735-8994)에 불법 영상 삭제 지원 요청')
  if (crimes.includes('stalk'))
    steps.push('경찰서에 잠정조치(접근금지) 신청 — 즉각적 차단 가능')
  if (crimes.includes('workplace'))
    steps.push('고용노동부 신고와 민사 손해배상 청구 병행 검토')
  steps.push('정식 고소장 작성 전 변호사 상담으로 전략 수립')
  steps.push('변호사와 함께 제대로 된 고소장을 작성하고 제출하면 기소 가능성을 높일 수 있습니다')

  return (
    <div className="card mb-6">
      <div className="section-label">지금 해야 할 일</div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-navy-700 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function VictimDocuments() {
  const docs = [
    {
      label: '고소장',
      warning: '사실관계 표현이 부정확하거나 과장되면 무고 위험이 생길 수 있습니다. 변호사 검토를 권장합니다.',
      preview: '고  소  장\n\n고소인: ○○○ (○○○○년생)\n피고소인: ○○○\n\n고소 취지: 피고소인을 아래와 같은 죄명으로 고소하오니...',
    },
    {
      label: '피해자 진술서',
      warning: '피해 사실의 구체적 기술 방식이 수사 방향과 기소 여부에 직접 영향을 줍니다.',
      preview: '피해자 진술서\n\n본인은 아래와 같이 피해 사실을 진술합니다.\n피해 발생 일시 및 장소: ○○년 ○월 ○일 경...',
    },
  ]
  return (
    <div className="mb-6">
      <div className="section-label mb-3">필요 서류 초안</div>
      <a
        href={CONSULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 px-4 bg-navy-900 hover:bg-navy-700 text-white text-sm font-semibold rounded-xl mb-4 transition-colors text-center"
      >
        변호사와 상담하여 서류 완성하기 →
      </a>
      <div className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.label} className="rounded-xl border border-card-border overflow-hidden bg-white">
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

function SupportSection() {
  return (
    <div className="card mb-6">
      <div className="section-label">피해자 지원 기관</div>
      <div className="space-y-3">
        {SUPPORT.map((s) => (
          <div key={s.name} className="flex items-start gap-3">
            <div className="rounded-lg bg-navy-50 border border-navy-100 px-2.5 py-1.5 text-center flex-shrink-0">
              <div className="text-sm font-bold text-navy-900">{s.contact}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-navy-800">{s.name}</div>
              <div className="text-xs text-navy-500 mt-0.5 leading-relaxed">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConsultationCTA() {
  return (
    <div className="bg-navy-900 rounded-2xl p-6 mb-6 text-white">
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
        변호사 상담
      </div>
      <h3 className="text-lg font-bold mb-2">지금 바로 변호사와 상담하세요</h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
        신고 방법부터 증거 확보, 합의 전략, 피해자 지원 제도까지 — 첫 상담에서 모두 안내해 드립니다.
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
export default function VictimResultReport({ selectedCrimes, stageResult, answers, onReset }: Props) {
  return (
    <div className="max-w-[800px] mx-auto px-4 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-navy-900">진단 결과 (피해자)</h2>
        <button onClick={onReset} className="btn-ghost text-sm">처음부터</button>
      </div>

      {/* Stage badge */}
      <StageBadge stageResult={stageResult} />

      {/* Indictment summary */}
      <IndictmentSummary crimes={selectedCrimes} answers={answers} />

      {/* Next steps */}
      <NextStepsSection crimes={selectedCrimes} answers={answers} />

      {/* Per-crime analysis */}
      {selectedCrimes.map((id) => (
        <CrimeAnalysisSection key={id} crimeId={id} answers={answers} />
      ))}

      {/* Documents */}
      <VictimDocuments />

      {/* Support resources */}
      <SupportSection />

      {/* Consultation CTA */}
      <ConsultationCTA />

      {/* Footer */}
      <div className="card-sm text-xs text-navy-500 leading-relaxed mb-4">
        이 진단 결과는 입력하신 정보를 기반으로 생성된 참고 자료입니다. 합의금 범위는 실무 참고치이며 실제 금액은 사건 구체적 사정에 따라 크게 달라집니다. 반드시 변호사와 상담하시기 바랍니다.
      </div>

      <button onClick={onReset} className="btn-secondary w-full">
        ← 처음으로 돌아가기
      </button>
    </div>
  )
}
