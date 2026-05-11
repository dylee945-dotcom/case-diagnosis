import type { CrimeType, Role, Question } from '../types'

interface SlimCrimeConfig {
  name: string
  shortName: string
  questions: Question[]
}

interface Props {
  role: Role | null
  crimeMap: Record<string, SlimCrimeConfig>
  selectedCrimes: CrimeType[]
  currentCrimeIdx: number
  currentQuestionIdx: number
  answers: Record<string, string>
  onAnswer: (crimeId: CrimeType, questionId: string, value: string) => void
  onNext: () => void
  onPrev: () => void
  onFinish: () => void
}

export default function QuestionFlow({
  role,
  crimeMap,
  selectedCrimes,
  currentCrimeIdx,
  currentQuestionIdx,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onFinish,
}: Props) {
  const isVictim = role === 'victim'
  const crimeId = selectedCrimes[currentCrimeIdx]
  const crime = crimeMap[crimeId]
  if (!crime) return null

  const question = crime.questions[currentQuestionIdx]
  const answerKey = `${crimeId}:${question.id}`
  const currentValue = answers[answerKey]

  const isLastQuestion = currentQuestionIdx === crime.questions.length - 1
  const isLastCrime = currentCrimeIdx === selectedCrimes.length - 1
  const isVeryLast = isLastQuestion && isLastCrime

  const overallTotal = selectedCrimes.reduce((s, id) => s + (crimeMap[id]?.questions.length ?? 0), 0)
  const overallCurrent = selectedCrimes
    .slice(0, currentCrimeIdx)
    .reduce((s, id) => s + (crimeMap[id]?.questions.length ?? 0), 0) + currentQuestionIdx + 1

  const prevAnswers = crime.questions
    .slice(0, currentQuestionIdx)
    .map((q) => {
      const val = answers[`${crimeId}:${q.id}`]
      const opt = q.options.find((o) => o.value === val)
      return opt ? { label: opt.label } : null
    })
    .filter(Boolean) as { label: string }[]

  function handleSelect(value: string) {
    onAnswer(crimeId, question.id, value)
  }

  function handleNext() {
    if (!currentValue) return
    if (isVeryLast) onFinish()
    else onNext()
  }

  const progressPct = (overallCurrent / overallTotal) * 100

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-navy-800">{crime.name}</span>
            {selectedCrimes.length > 1 && (
              <div className="flex gap-1">
                {selectedCrimes.map((id, i) => {
                  const c = crimeMap[id]
                  return (
                    <span
                      key={id}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        i === currentCrimeIdx
                          ? 'bg-navy-900 text-white font-medium'
                          : i < currentCrimeIdx
                          ? 'bg-navy-100 text-navy-500'
                          : 'bg-surface text-navy-300 border border-card-border'
                      }`}
                    >
                      {c?.shortName}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <span className="text-xs text-navy-400 flex-shrink-0">
            {overallCurrent} / {overallTotal}
          </span>
        </div>
        <div className="h-1.5 bg-navy-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy-700 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Victim notice */}
      {isVictim && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-navy-100 bg-navy-50 px-3.5 py-2.5">
          <span className="text-navy-400 flex-shrink-0 text-xs mt-0.5">ℹ</span>
          <p className="text-xs text-navy-600 leading-relaxed">
            피해 상황을 기준으로 답변해 주세요. 가해자 관련 정보는 <span className="font-semibold">알고 있는 범위 내에서</span> 선택하시면 됩니다.
          </p>
        </div>
      )}

      {/* Previous answer chips */}
      {prevAnswers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {prevAnswers.map((a, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs bg-white border border-card-border text-navy-600 px-2.5 py-1 rounded-lg">
              <span className="text-navy-400">Q{i + 1}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Question */}
      <div className="card mb-4">
        <p className="text-xs text-navy-400 mb-2.5">
          {crime.shortName} Q{currentQuestionIdx + 1}.
        </p>
        <h2 className="text-lg font-bold text-navy-900 leading-snug">
          {question.text}
        </h2>
        {question.subtext && (
          <p className="text-xs text-navy-500 mt-2 leading-relaxed">{question.subtext}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-6">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`answer-btn ${currentValue === opt.value ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors
                ${currentValue === opt.value ? 'border-navy-900 bg-navy-900' : 'border-navy-300'}
              `} />
              <span className={`text-sm font-medium ${currentValue === opt.value ? 'text-navy-900' : 'text-navy-700'}`}>
                {opt.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Nav */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={currentCrimeIdx === 0 && currentQuestionIdx === 0}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={!currentValue}
          className="btn-primary flex-1"
        >
          {isVeryLast ? '진단 결과 보기 →' : '다음 →'}
        </button>
      </div>
    </div>
  )
}
