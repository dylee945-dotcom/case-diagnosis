import type { CombinedWarning, CrimeType } from '../types'

export const COMBINED_WARNINGS: CombinedWarning[] = [
  {
    id: 'torrent-distribution',
    triggerFn: (_crimes: CrimeType[], answers: Record<string, string>) =>
      answers['poss:q_source'] === 'torrent',
    severity: 'CRITICAL',
    title: '소지인데, \'유포\'까지 같이 문제될 수 있습니다',
    triggerReason: () => '"토렌트 다운로드"를 선택하셨기 때문입니다.',
    explanation:
      '토렌트는 다운로드하는 순간 동시에 다른 사람에게 업로드(배포)가 자동으로 발생합니다. 이 구조 때문에 법원은 소지와 유포를 함께 적용합니다.',
    sentenceChange: '소지죄(3년 이하) → 유포죄(7년 이하) 상향 가능 / 경합범 형량 누적',
  },
  {
    id: 'deepfake-minor',
    triggerFn: (_crimes: CrimeType[], answers: Record<string, string>) =>
      answers['deep:q_minor'] === 'yes_unclear',
    severity: 'CRITICAL',
    title: '지금 예상보다 형량이 수 배 올라갈 수 있습니다',
    triggerReason: () => '피해자 연령을 미성년(또는 불확실)으로 답변하셨기 때문입니다.',
    explanation:
      '딥페이크 합성은 아청법상 \'제작\'에 해당하며, 아청법이 적용되면 법정형 하한이 5년으로 상향됩니다.',
    sentenceChange: '성폭력처벌법(편집죄) → 아청법 제작죄 경합 / 무기징역 또는 5년 이상으로 법정형 급상승',
  },
  {
    id: 'cam-plus-dist',
    triggerFn: (crimes: CrimeType[], answers: Record<string, string>) =>
      crimes.includes('cam') && crimes.includes('dist') ||
      answers['cam:q_file'] === 'shared',
    severity: 'HIGH',
    title: '촬영과 유포는 각각 별개 범죄로 처벌됩니다',
    triggerReason: (answers: Record<string, string>) =>
      answers['cam:q_file'] === 'shared'
        ? '"파일을 전송·공유했음"을 선택하셨기 때문입니다.'
        : '촬영과 유포 두 죄목을 모두 선택하셨기 때문입니다.',
    explanation:
      '두 행위는 같은 사건에서 발생했더라도 각각 독립적으로 처벌됩니다.',
    sentenceChange: '촬영죄 단독 → 촬영죄 + 유포죄 경합범 / 각 형량이 합산 처리됩니다',
  },
  {
    id: 'poss-child-mixed',
    triggerFn: (_crimes: CrimeType[], answers: Record<string, string>) =>
      answers['poss:q_minor'] === 'yes',
    severity: 'HIGH',
    title: '성인 불법촬영물과 아청물이 섞여 있으면 따로 처벌됩니다',
    triggerReason: () => '아동·청소년이 포함된 파일이 있다고 답변하셨기 때문입니다.',
    explanation:
      '동일한 기기에 있어도 두 법률이 각각 적용됩니다. 아청법 소지죄는 벌금형이 없고, 1년 이상 징역부터 시작합니다.',
    sentenceChange: '불법촬영물 소지(3년 이하) + 아청법 소지(1년 이상) / 경합범 처리 → 형량 누적',
  },
  {
    id: 'stalk-measure-violation',
    triggerFn: (_crimes: CrimeType[], answers: Record<string, string>) =>
      answers['stalk:q_violation'] === 'yes',
    severity: 'CRITICAL',
    title: '접근금지를 어긴 순간부터 사건이 달라집니다',
    triggerReason: () => '잠정조치를 위반했다고 답변하셨기 때문입니다.',
    explanation:
      '잠정조치 위반은 스토킹 본 사건과 별도로 처벌됩니다. 위반 이후 재범은 실형 가능성이 급상승합니다.',
    sentenceChange: '스토킹 단독 → 스토킹 + 잠정조치위반 경합 / 실형 가능성 구간 진입',
  },
  {
    id: 'comm-plus-stalk',
    triggerFn: (crimes: CrimeType[]) =>
      crimes.includes('comm') && crimes.includes('stalk'),
    severity: 'MEDIUM',
    title: '같은 대상에게 두 가지를 동시에 했다면 형량이 누적됩니다',
    triggerReason: () => '통신매체이용음란과 스토킹을 모두 선택하셨기 때문입니다.',
    explanation:
      '동일 피해자를 대상으로 경합하는 경우 각 범죄 최고형의 1/2 가중 원칙이 적용됩니다.',
    sentenceChange: '단일 죄목 → 경합범 가중 처리',
  },
]

export function getActiveWarnings(
  crimes: CrimeType[],
  answers: Record<string, string>
): CombinedWarning[] {
  return COMBINED_WARNINGS.filter((w) => w.triggerFn(crimes, answers))
}
