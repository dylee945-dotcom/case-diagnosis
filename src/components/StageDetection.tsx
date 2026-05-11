import { useState } from 'react'
import type { Q0Answers, StageResult, Role } from '../types'
import { inferStage, inferVictimStage, getStageBadgeColor, getVictimStageLabel, getAccusedStageLabel } from '../utils/stageInference'

interface Props {
  role: Role | null
  q0Answers: Q0Answers
  q0Step: number
  stageResult: StageResult | null
  onAnswer: (q: 'q1' | 'q2' | 'q3', value: string) => void
  onConfirm: (result: StageResult) => void
  onNext: () => void
}

const Q0_ACCUSED = [
  {
    key: 'q1' as const,
    text: '경찰·검찰 등 수사기관으로부터 연락을 받은 적 있나요?',
    options: [
      { value: '1', label: '아직 없음' },
      { value: '2', label: '전화나 문자로 연락이 왔음' },
      { value: '3', label: '출석 요구서·소환장을 받았음' },
    ],
  },
  {
    key: 'q2' as const,
    text: '기기 제출이나 압수와 관련된 이야기를 들은 적 있나요?',
    options: [
      { value: '1', label: '없음' },
      { value: '2', label: '임의제출을 요청받았음' },
      { value: '3', label: '압수영장이 집행되었거나 진행 중' },
    ],
  },
  {
    key: 'q3' as const,
    text: '피해자(또는 상대방)가 신고했는지 알고 있나요?',
    options: [
      { value: '1', label: '모름 / 신고 안 된 것 같음' },
      { value: '2', label: '신고했다고 들었음' },
      { value: '3', label: '고소장이 접수됐다는 것을 확인함' },
    ],
  },
]

const Q0_VICTIM = [
  {
    key: 'q1' as const,
    text: '수사기관에 신고(고소)하셨나요?',
    options: [
      { value: '1', label: '아직 신고하지 않았음' },
      { value: '2', label: '신고는 했으나 접수 여부 불확실' },
      { value: '3', label: '고소장이 정식 접수됨' },
    ],
  },
  {
    key: 'q2' as const,
    text: '피해를 입증할 증거가 있나요?',
    options: [
      { value: '1', label: '없음 (진술 외 자료 없음)' },
      { value: '2', label: '문자·카카오톡 등 대화 기록 있음' },
      { value: '3', label: 'CCTV·영상·목격자 등 객관적 증거 있음' },
    ],
  },
  {
    key: 'q3' as const,
    text: '가해자의 신원을 알고 있나요?',
    options: [
      { value: '1', label: '신원 불상 (모르는 사람)' },
      { value: '2', label: '얼굴이나 특징을 알고 있음' },
      { value: '3', label: '이름·연락처 등 신원 확인됨' },
    ],
  },
]

export default function StageDetection({ role, q0Answers, q0Step, stageResult, onAnswer, onConfirm, onNext }: Props) {
  const [fading, setFading] = useState(false)
  const isVictim = role === 'victim'

  const Q0 = isVictim ? Q0_VICTIM : Q0_ACCUSED
  const allAnswered = !!(q0Answers.q1 && q0Answers.q2 && q0Answers.q3)
  const currentQ = allAnswered ? null : Q0[q0Step]

  function getStageLabel(stage: string): string {
    return isVictim
      ? getVictimStageLabel(stage as Parameters<typeof getVictimStageLabel>[0])
      : getAccusedStageLabel(stage as Parameters<typeof getAccusedStageLabel>[0])
  }

  function handleAnswer(q: 'q1' | 'q2' | 'q3', value: string) {
    setFading(true)
    setTimeout(() => {
      setFading(false)
      onAnswer(q, value)
      if (q === 'q3') {
        const merged = { ...q0Answers, q3: value }
        const result = isVictim ? inferVictimStage(merged) : inferStage(merged)
        onConfirm(result)
      }
    }, 150)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-navy-500 mb-2">
          <span className="text-navy-700 font-semibold">
            {isVictim ? '현재 상황 파악' : '현재 단계 파악'}
          </span>
          {!allAnswered && <span className="text-navy-400"> · 질문 {q0Step + 1} / 3</span>}
        </div>
        <div className="flex gap-1.5 mb-1">
          {[0, 1, 2].map((i) => {
            const done = allAnswered || i < q0Step
            const active = !allAnswered && i === q0Step
            return (
              <div key={i} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${
                  done ? 'bg-navy-700' : active ? 'bg-navy-300' : 'bg-navy-100'
                }`} />
              </div>
            )
          })}
        </div>
        {!allAnswered && (
          <div className="text-xs text-navy-400 mt-1">
            3개 질문에 답변하면 현재 상황이 자동으로 분석됩니다
          </div>
        )}
      </div>

      {/* Question */}
      {!allAnswered && currentQ && (
        <div className={`transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="card mb-4">
            <p className="text-xs text-navy-400 mb-2.5">Q{q0Step + 1}.</p>
            <h2 className="text-lg font-bold text-navy-900 leading-snug">
              {currentQ.text}
            </h2>
          </div>
          <div className="space-y-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(currentQ.key, opt.value)}
                className="answer-btn"
              >
                <span className="text-sm font-medium text-navy-800">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {allAnswered && stageResult && (
        <div>
          <div className={`rounded-xl border p-5 mb-4 ${getStageBadgeColor(stageResult.stage)}`}>
            <div className="text-xs font-medium mb-2 opacity-70">
              {isVictim ? '입력하신 내용을 기준으로' : '입력 내용을 기준으로'}
            </div>
            <div className="text-xl font-bold leading-snug">
              {isVictim ? '현재 상황을 ' : '현재 단계를 '}
              <span className="font-extrabold">
                {stageResult.uncertain && stageResult.secondaryStage
                  ? `${getStageLabel(stageResult.stage)} ~ ${getStageLabel(stageResult.secondaryStage)}`
                  : getStageLabel(stageResult.stage)}
              </span>
              {' '}으로 추정합니다
            </div>
          </div>

          {stageResult.note && (
            <div className="card-sm mb-4 text-sm text-navy-700 leading-relaxed">
              {stageResult.note}
            </div>
          )}

          <div className="text-xs text-navy-400 mb-5 px-1">
            {isVictim
              ? '실제 수사 진행 상황은 담당 수사관에게 직접 확인하세요.'
              : '실제 단계는 담당 수사관 확인이 필요합니다.'}
          </div>

          {/* Summary */}
          <div className="card mb-5">
            <div className="section-label">선택하신 답변</div>
            <div className="space-y-2">
              {Q0.map((q, i) => {
                const val = q0Answers[q.key]
                const opt = q.options.find((o) => o.value === val)
                return (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="text-navy-400 flex-shrink-0 pt-0.5">Q{i + 1}.</span>
                    <span className="text-navy-700 leading-relaxed">{opt?.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={onNext} className="btn-primary w-full">
            {isVictim ? '상세 분석으로 이동 →' : '사건 질문으로 이동 →'}
          </button>
        </div>
      )}
    </div>
  )
}
