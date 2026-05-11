import type { CrimeType, Role } from '../types'
import { CRIMES } from '../data/crimes'

interface Props {
  role: Role | null
  selected: CrimeType[]
  onToggle: (crime: CrimeType) => void
  onNext: () => void
}

const CRIME_GROUPS = [
  {
    label: '디지털 성범죄',
    ids: ['cam', 'dist', 'poss', 'child', 'deep', 'comm'] as CrimeType[],
  },
  {
    label: '신체 침해 성범죄',
    ids: ['rape', 'quasi_rape', 'molestation', 'quasi_molestation'] as CrimeType[],
  },
  {
    label: '직권·지위 이용 성범죄',
    ids: ['authority', 'workplace'] as CrimeType[],
  },
  {
    label: '기타 괴롭힘',
    ids: ['stalk'] as CrimeType[],
  },
]

export default function CrimeSelector({ role, selected, onToggle, onNext }: Props) {
  const isVictim = role === 'victim'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 mb-2">
          {isVictim ? '피해 혐의를 선택하세요' : '혐의 유형을 선택하세요'}
        </h1>
        <p className="text-navy-500 text-sm leading-relaxed">
          {isVictim
            ? '입으신 피해에 해당하는 항목을 모두 선택하세요. 복수 선택이 가능합니다.'
            : '해당하는 혐의를 모두 선택하세요. 복수 선택이 가능합니다.'}
          <br />
          진단 결과는 선택한 혐의 기준으로 생성됩니다.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {CRIME_GROUPS.map((group) => {
          const groupCrimes = group.ids
            .map((id) => CRIMES.find((c) => c.id === id))
            .filter(Boolean) as typeof CRIMES

          if (groupCrimes.length === 0) return null

          return (
            <div key={group.label}>
              <div className="section-label">{group.label}</div>
              <div className="grid grid-cols-1 gap-2">
                {groupCrimes.map((crime) => {
                  const isSelected = selected.includes(crime.id)
                  return (
                    <button
                      key={crime.id}
                      onClick={() => onToggle(crime.id)}
                      className={`
                        w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150
                        ${isSelected
                          ? 'border-navy-900 bg-navy-50'
                          : 'border-card-border bg-white hover:border-navy-300 hover:shadow-card'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected ? 'border-navy-900 bg-navy-900' : 'border-navy-300'}
                        `}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${isSelected ? 'text-navy-900' : 'text-navy-800'}`}>
                              {crime.name}
                            </span>
                            {isSelected && (
                              <span className="text-xs bg-navy-900 text-white px-2 py-0.5 rounded-full">선택됨</span>
                            )}
                          </div>
                          <div className="text-xs text-navy-400 mt-0.5">{crime.law}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between sticky bottom-4">
        <span className="text-sm text-navy-500">
          {selected.length === 0 ? '혐의를 선택해 주세요' : `${selected.length}개 선택됨`}
        </span>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="btn-primary"
        >
          다음 단계 →
        </button>
      </div>
    </div>
  )
}
