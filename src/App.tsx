import { useReducer } from 'react'
import type { AppState, AppAction, CrimeType, StageResult, Role } from './types'
import { CRIME_MAP } from './data/crimes'
import { VICTIM_CRIME_MAP } from './data/victimCrimes'
import RoleSelector from './components/RoleSelector'
import CrimeSelector from './components/CrimeSelector'
import StageDetection from './components/StageDetection'
import QuestionFlow from './components/QuestionFlow'
import ResultReport from './components/ResultReport'
import VictimResultReport from './components/VictimResultReport'

const INITIAL_STATE: AppState = {
  role: null,
  step: 'role',
  selectedCrimes: [],
  q0Step: 0,
  q0Answers: { q1: null, q2: null, q3: null },
  stageResult: null,
  answers: {},
  currentCrimeIdx: 0,
  currentQuestionIdx: 0,
}

function getActiveCrimeMap(role: Role | null) {
  return role === 'victim' ? VICTIM_CRIME_MAP : CRIME_MAP
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, step: 'select' }

    case 'TOGGLE_CRIME': {
      const exists = state.selectedCrimes.includes(action.crime)
      return {
        ...state,
        selectedCrimes: exists
          ? state.selectedCrimes.filter((c) => c !== action.crime)
          : [...state.selectedCrimes, action.crime],
      }
    }

    case 'START_Q0':
      return { ...state, step: 'q0', q0Step: 0, q0Answers: { q1: null, q2: null, q3: null }, stageResult: null }

    case 'ANSWER_Q0': {
      const newAnswers = { ...state.q0Answers, [action.q]: action.value }
      const nextStep = action.q === 'q1' ? 1 : action.q === 'q2' ? 2 : 3
      return { ...state, q0Answers: newAnswers, q0Step: nextStep as AppState['q0Step'] }
    }

    case 'CONFIRM_STAGE':
      return { ...state, stageResult: action.stageResult }

    case 'START_QUESTIONS':
      return { ...state, step: 'questions', currentCrimeIdx: 0, currentQuestionIdx: 0 }

    case 'ANSWER_QUESTION': {
      const key = `${action.crimeId}:${action.questionId}`
      return { ...state, answers: { ...state.answers, [key]: action.value } }
    }

    case 'NEXT_QUESTION': {
      const crimeMap = getActiveCrimeMap(state.role)
      const crime = crimeMap[state.selectedCrimes[state.currentCrimeIdx]]
      if (!crime) return state
      const isLastQuestion = state.currentQuestionIdx === crime.questions.length - 1
      if (isLastQuestion) {
        const isLastCrime = state.currentCrimeIdx === state.selectedCrimes.length - 1
        if (isLastCrime) return { ...state, step: 'result' }
        return { ...state, currentCrimeIdx: state.currentCrimeIdx + 1, currentQuestionIdx: 0 }
      }
      return { ...state, currentQuestionIdx: state.currentQuestionIdx + 1 }
    }

    case 'PREV_QUESTION': {
      if (state.currentQuestionIdx > 0) {
        return { ...state, currentQuestionIdx: state.currentQuestionIdx - 1 }
      }
      if (state.currentCrimeIdx > 0) {
        const crimeMap = getActiveCrimeMap(state.role)
        const prevCrime = crimeMap[state.selectedCrimes[state.currentCrimeIdx - 1]]
        return {
          ...state,
          currentCrimeIdx: state.currentCrimeIdx - 1,
          currentQuestionIdx: (prevCrime?.questions.length ?? 1) - 1,
        }
      }
      return state
    }

    case 'SHOW_RESULT':
      return { ...state, step: 'result' }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

const STEP_LABELS = ['역할 선택', '혐의 선택', '현황 파악', '사건 질문', '진단 결과']
const STEP_MAP: Record<AppState['step'], number> = {
  role: 0, select: 1, q0: 2, questions: 3, result: 4,
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const currentStepIdx = STEP_MAP[state.step]

  function handleToggleCrime(crime: CrimeType) {
    dispatch({ type: 'TOGGLE_CRIME', crime })
  }

  function handleConfirmStage(result: StageResult) {
    dispatch({ type: 'CONFIRM_STAGE', stageResult: result })
  }

  function handleSetRole(role: Role) {
    dispatch({ type: 'SET_ROLE', role })
  }

  if (state.step === 'role') {
    return <RoleSelector onSelect={handleSetRole} />
  }

  const activeCrimeMap = getActiveCrimeMap(state.role)

  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-card-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm font-bold text-navy-900">성범죄 사건 진단</h1>
              {state.role && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-navy-100 text-navy-700 font-medium">
                  {state.role === 'victim' ? '피해자' : '피의자·피고인'}
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="text-xs text-navy-400 hover:text-navy-700 transition-colors"
            >
              처음부터
            </button>
          </div>
          {/* Step indicator — skip role step (index 0) */}
          <div className="flex items-center gap-0.5">
            {STEP_LABELS.slice(1).map((label, i) => {
              const stepIdx = i + 1
              const isActive = stepIdx === currentStepIdx
              const isDone = stepIdx < currentStepIdx
              return (
                <div key={i} className="flex items-center gap-0.5 flex-1">
                  <div className={`
                    flex-1 text-center text-xs py-0.5 rounded transition-colors truncate
                    ${isActive ? 'text-navy-900 font-semibold' : isDone ? 'text-navy-400' : 'text-navy-200'}
                  `}>
                    {label}
                  </div>
                  {i < STEP_LABELS.length - 2 && (
                    <span className={`text-xs flex-shrink-0 ${isDone ? 'text-navy-300' : 'text-navy-100'}`}>›</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main>
        {state.step === 'select' && (
          <CrimeSelector
            role={state.role}
            selected={state.selectedCrimes}
            onToggle={handleToggleCrime}
            onNext={() => dispatch({ type: 'START_Q0' })}
          />
        )}

        {state.step === 'q0' && (
          <StageDetection
            role={state.role}
            q0Answers={state.q0Answers}
            q0Step={state.q0Step}
            stageResult={state.stageResult}
            onAnswer={(q, value) => dispatch({ type: 'ANSWER_Q0', q, value })}
            onConfirm={handleConfirmStage}
            onNext={() => dispatch({ type: 'START_QUESTIONS' })}
          />
        )}

        {state.step === 'questions' && (
          <QuestionFlow
            role={state.role}
            crimeMap={activeCrimeMap}
            selectedCrimes={state.selectedCrimes}
            currentCrimeIdx={state.currentCrimeIdx}
            currentQuestionIdx={state.currentQuestionIdx}
            answers={state.answers}
            onAnswer={(crimeId, questionId, value) =>
              dispatch({ type: 'ANSWER_QUESTION', crimeId, questionId, value })
            }
            onNext={() => dispatch({ type: 'NEXT_QUESTION' })}
            onPrev={() => dispatch({ type: 'PREV_QUESTION' })}
            onFinish={() => dispatch({ type: 'SHOW_RESULT' })}
          />
        )}

        {state.step === 'result' && state.stageResult && state.role === 'victim' && (
          <VictimResultReport
            selectedCrimes={state.selectedCrimes}
            stageResult={state.stageResult}
            answers={state.answers}
            onReset={() => dispatch({ type: 'RESET' })}
          />
        )}

        {state.step === 'result' && state.stageResult && state.role !== 'victim' && (
          <ResultReport
            selectedCrimes={state.selectedCrimes}
            stageResult={state.stageResult}
            answers={state.answers}
            onReset={() => dispatch({ type: 'RESET' })}
          />
        )}
      </main>
    </div>
  )
}
