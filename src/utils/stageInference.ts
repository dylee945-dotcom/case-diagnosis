import type { Q0Answers, Stage, StageResult } from '../types'

const STAGE_LABELS_ACCUSED: Record<Stage, string> = {
  'pre-report': '신고 전 / 예방적 확인',
  'early': '수사 초기',
  'mid': '수사 중기',
  'forensics': '포렌식 진행 단계',
  'pre-indictment': '송치 직전 / 기소 검토',
}

const STAGE_LABELS_VICTIM: Record<Stage, string> = {
  'pre-report': '신고 전 / 상담 단계',
  'early': '신고 후 수사 초기',
  'mid': '수사 진행 중',
  'forensics': '증거 분석 단계',
  'pre-indictment': '기소 결정 대기 단계',
}

// 피의자·피고인 단계 추론
export function inferStage(answers: Q0Answers): StageResult {
  const { q1, q2, q3 } = answers
  const L = STAGE_LABELS_ACCUSED
  if (!q1 || !q2 || !q3) return { stage: 'pre-report', uncertain: false, message: L['pre-report'] }

  if (q2 === '3') {
    if (q1 === '3' && q3 === '3') {
      return {
        stage: 'pre-indictment', uncertain: false, message: L['pre-indictment'],
        note: '소환장 수령, 압수영장 집행, 고소장 접수가 모두 확인됩니다.',
      }
    }
    return {
      stage: 'forensics', uncertain: false, message: L['forensics'],
      note: '압수영장이 집행된 상태입니다. 디지털 증거 분석이 진행 중이거나 임박했습니다.',
    }
  }

  if (q2 === '2') {
    return {
      stage: 'mid', uncertain: false, message: L['mid'],
      note: '기기 제출 협의 단계입니다. 임의제출과 압수의 차이가 향후 절차에 영향을 줄 수 있습니다.',
    }
  }

  const hasContact = q1 === '2' || q1 === '3'
  const hasReport = q3 === '2' || q3 === '3'

  if (hasContact && hasReport) {
    return {
      stage: 'early', uncertain: false, message: L['early'],
      note: '수사기관 접촉과 피해자 신고가 모두 확인됩니다.',
    }
  }
  if (hasContact && !hasReport) {
    return {
      stage: 'early', uncertain: true, secondaryStage: 'mid',
      message: `${L['early']} ~ ${L['mid']} 사이`,
      note: '연락을 받으셨지만 아직 기기 제출이나 고소 접수는 확인되지 않은 상태입니다. 이 단계에서는 첫 진술 전략이 가장 중요합니다.',
    }
  }
  if (!hasContact && hasReport) {
    return {
      stage: 'early', uncertain: false, message: L['early'],
      note: '피해자가 신고했습니다. 수사기관이 곧 연락을 취할 수 있는 상태입니다.',
    }
  }
  return {
    stage: 'pre-report', uncertain: false, message: L['pre-report'],
    note: '아직 공식적인 절차가 시작되지 않은 상태입니다. 지금이 사전 대응 전략을 수립할 수 있는 시점입니다.',
  }
}

// 피해자 단계 추론
// q1: 신고 여부 (1=미신고, 2=신고불확실, 3=고소장접수)
// q2: 증거 (1=없음, 2=대화기록, 3=CCTV·목격자)
// q3: 가해자 특정 (1=불상, 2=외모앎, 3=신원확인)
export function inferVictimStage(answers: Q0Answers): StageResult {
  const { q1, q2, q3 } = answers
  const L = STAGE_LABELS_VICTIM
  if (!q1 || !q2 || !q3) return { stage: 'pre-report', uncertain: false, message: L['pre-report'] }

  if (q1 === '1') {
    return {
      stage: 'pre-report', uncertain: false, message: L['pre-report'],
      note: '아직 신고하지 않으신 상태입니다. 지금이 증거 보전과 신고 전략을 준비할 가장 중요한 시점입니다.',
    }
  }

  if (q1 === '2') {
    return {
      stage: 'early', uncertain: true, secondaryStage: 'mid',
      message: `${L['early']} ~ ${L['mid']} 사이`,
      note: '신고는 하셨으나 접수 여부가 불확실한 상태입니다. 담당 수사관에게 고소장 접수 확인을 요청하세요.',
    }
  }

  // q1 === '3': 고소장 정식 접수됨
  if (q3 === '1') {
    return {
      stage: 'early', uncertain: false, message: L['early'],
      note: '고소장은 접수됐으나 가해자 특정이 아직 이루어지지 않았습니다. 수사기관의 신원 파악 조치가 수사의 첫 과제입니다.',
    }
  }

  if (q3 === '2') {
    return {
      stage: 'mid', uncertain: false, message: L['mid'],
      note: '가해자 특징은 알고 있으나 신원이 아직 공식 확인되지 않은 상태입니다. 수사기관에 인상착의·목격 내용을 구체적으로 진술하세요.',
    }
  }

  // q3 === '3': 가해자 신원 확인됨
  if (q2 === '3') {
    return {
      stage: 'pre-indictment', uncertain: false, message: L['pre-indictment'],
      note: '고소장 접수, 가해자 특정, 객관적 증거까지 모두 갖춰진 상태입니다. 검사의 기소 결정을 앞둔 단계입니다.',
    }
  }
  if (q2 === '2') {
    return {
      stage: 'forensics', uncertain: false, message: L['forensics'],
      note: '가해자는 특정됐으나 객관적 증거 보완이 필요합니다. 대화 기록 원본 보전과 추가 증거 확보가 중요합니다.',
    }
  }
  // q2 === '1': 증거 없음
  return {
    stage: 'mid', uncertain: true, secondaryStage: 'forensics',
    message: `${L['mid']} ~ ${L['forensics']} 사이`,
    note: '가해자는 특정됐으나 진술 외 증거가 부족한 상태입니다. 증거 보완 방법을 변호사와 함께 검토하세요.',
  }
}

export function getStageBadgeColor(stage: Stage): string {
  switch (stage) {
    case 'pre-report': return 'bg-navy-50 text-navy-700 border-navy-200'
    case 'early': return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'mid': return 'bg-orange-50 text-orange-800 border-orange-200'
    case 'forensics': return 'bg-red-50 text-red-800 border-red-200'
    case 'pre-indictment': return 'bg-red-100 text-red-900 border-red-300'
  }
}

export function getVictimStageLabel(stage: Stage): string {
  return STAGE_LABELS_VICTIM[stage]
}

export function getAccusedStageLabel(stage: Stage): string {
  return STAGE_LABELS_ACCUSED[stage]
}
