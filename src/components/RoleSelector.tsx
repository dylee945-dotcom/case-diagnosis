import type { Role } from '../types'

interface Props {
  onSelect: (role: Role) => void
}

export default function RoleSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-block text-xs font-semibold text-navy-500 uppercase tracking-widest mb-4 px-3 py-1 bg-navy-50 rounded-full border border-navy-100">
            성범죄 사건 진단
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-3 leading-tight">
            귀하의 상황을 선택해 주세요
          </h1>
          <p className="text-navy-500 text-base leading-relaxed max-w-md mx-auto">
            선택한 입장에 맞는 질문과 진단 결과를 제공합니다.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 피해자 */}
          <button
            onClick={() => onSelect('victim')}
            className="group text-left bg-white border-2 border-card-border hover:border-navy-400 rounded-2xl p-6 transition-all duration-150 shadow-card hover:shadow-card-hover"
          >
            <div className="mb-4">
              <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-navy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-navy-900 mb-1">피해자</h2>
              <p className="text-sm text-navy-500 leading-relaxed">
                피해를 입은 당사자 또는 그 가족·지인으로서 상황을 파악하고 싶은 경우
              </p>
            </div>
            <div className="space-y-1.5">
              {['신고 방법 및 절차 안내', '증거 보전 방법', '기소 가능성 예측', '합의금 참고 범위', '피해자 지원 제도'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-navy-600">
                  <div className="w-1 h-1 rounded-full bg-navy-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy-700 group-hover:text-navy-900 transition-colors">
              피해자로 진단 시작
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* 피의자·피고인 */}
          <button
            onClick={() => onSelect('accused')}
            className="group text-left bg-white border-2 border-card-border hover:border-navy-400 rounded-2xl p-6 transition-all duration-150 shadow-card hover:shadow-card-hover"
          >
            <div className="mb-4">
              <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-navy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-navy-900 mb-1">피의자 · 피고인</h2>
              <p className="text-sm text-navy-500 leading-relaxed">
                수사·재판 대상이 되었거나 그 가능성을 걱정하는 경우
              </p>
            </div>
            <div className="space-y-1.5">
              {['현재 단계 및 위험도 분석', '양형인자 및 예상 형량', '대응 전략 방향', '유사 사건 판례 비교'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-navy-600">
                  <div className="w-1 h-1 rounded-full bg-navy-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-navy-700 group-hover:text-navy-900 transition-colors">
              피의자·피고인으로 진단 시작
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-white border border-card-border rounded-xl px-5 py-4 text-xs text-navy-500 leading-relaxed">
          이 서비스는 법률 정보 제공을 목적으로 합니다. 진단 결과는 참고 자료이며, 실제 법적 판단은 반드시 변호사와 상담하시기 바랍니다.
        </div>
      </div>
    </div>
  )
}
