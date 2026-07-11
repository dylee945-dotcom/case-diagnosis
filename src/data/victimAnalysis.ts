import type { CrimeType, VictimAnalysis, IndictmentLevel } from '../types'
import { crimeAnswers as a } from '../utils/answers'

function clamp(n: number): IndictmentLevel {
  return Math.max(0, Math.min(3, Math.round(n))) as IndictmentLevel
}

// ─── 공통 헬퍼 ────────────────────────────────────────────
function evidenceScore(val: string): number {
  if (val === 'direct' || val === 'cctv' || val === 'specialized' || val === 'injury'
    || val === 'link' || val === 'witness' || val === 'full') return 3
  if (val === 'indirect' || val === 'records' || val === 'chat' || val === 'screenshot'
    || val === 'partial') return 1
  return 0
}

function perpetratorScore(val: string): number {
  if (val === 'known') return 2
  if (val === 'partial') return 1
  return 0
}

// ─── 범죄별 분석 함수 ──────────────────────────────────────

const ANALYSIS: Record<CrimeType, (all: Record<string, string>) => VictimAnalysis> = {

  cam: (all) => {
    const v = a('cam', all)
    const evLv = clamp(evidenceScore(v['q_evidence']))
    const perpScore = perpetratorScore(v['q_perpetrator'])
    const spreadWide = v['q_spread'] === 'wide'
    const spreadPartial = v['q_spread'] === 'partial'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '직접 증거 확보 — 기소 가능성 대폭 상승', positive: true })
    else if (evLv >= 1) factors.push({ label: '간접 증거 있음 — 수사 보조 가능', positive: true })
    else factors.push({ label: '증거 부족 — 진술 보강 필요', positive: false })

    if (perpScore === 2) factors.push({ label: '가해자 신원 확인 — 즉시 입건 가능', positive: true })
    else if (perpScore === 1) factors.push({ label: '가해자 특징 확인 — 수사 단서 있음', positive: true })
    else factors.push({ label: '가해자 불상 — 디지털 추적 필요', positive: false })

    if (spreadWide) factors.push({ label: '광범위 유포 확인 — 죄질 가중', positive: true })
    else if (spreadPartial) factors.push({ label: '일부 유포 정황 — 유포죄 경합 가능', positive: true })

    if (v['q_discovery'] === 'investigation') factors.push({ label: '수사기관 이미 인지 — 수사 진행 중', positive: true })

    const baseScore = evLv / 3 * 1.5 + perpScore / 2 * 1.5 + (spreadWide ? 1 : spreadPartial ? 0.5 : 0)
    const indictmentLevel = clamp(baseScore)

    const settlementRange = spreadWide ? '1,000만 ~ 5,000만 원'
      : spreadPartial ? '500만 ~ 2,000만 원'
      : '300만 ~ 1,000만 원'

    const settlementFactors: VictimAnalysis['settlementFactors'] = [
      { label: '증거가 강할수록 합의금 상승', up: evLv >= 2 },
      { label: '유포 범위가 넓을수록 합의금 대폭 상승', up: spreadWide },
      { label: '가해자 신원 특정 시 협상력 상승', up: perpScore === 2 },
      { label: '연인 관계인 경우 합의금 상승 가능', up: v['q_relationship'] === 'partner' },
    ]

    return {
      indictmentLevel,
      indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange,
      settlementFactors,
      note: '불법촬영은 피해 영상 존재 자체가 핵심 증거입니다. 영상이 있다면 기소 가능성이 매우 높아집니다.',
      settlementNote: '합의(처벌불원)는 양형에 크게 반영되지만, 성범죄는 합의만으로 처벌을 면할 수 없습니다. 합의 전 변호사와 반드시 상담하세요.',
    }
  },

  dist: (all) => {
    const v = a('dist', all)
    const evLv = clamp(evidenceScore(v['q_evidence']))
    const perpScore = perpetratorScore(v['q_perpetrator'])
    const wideSpread = v['q_spread_platform'] === 'channel'
    const profitConfirmed = v['q_profit'] === 'confirmed'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '직접 증거 확보 — 유포자 특정에 결정적', positive: true })
    else if (evLv >= 1) factors.push({ label: '정황 증거 있음', positive: true })
    else factors.push({ label: '증거 부족 — 플랫폼 신고로 IP 추적 가능', positive: false })

    if (perpScore === 2) factors.push({ label: '가해자 신원 확인 — 즉각 고소 가능', positive: true })
    else factors.push({ label: '가해자 불상 — 디지털 수사 필요', positive: false })

    if (wideSpread) factors.push({ label: '광범위 온라인 유포 — 성폭력처벌법 제14조 가중 적용 가능', positive: true })
    if (profitConfirmed) factors.push({ label: '영리 목적 + 정보통신망 이용 유포 — 성폭력처벌법 제14조 제3항 가중처벌', positive: true })

    const baseScore = evLv / 3 * 1.5 + perpScore / 2 * 1.5 + (wideSpread ? 0.5 : 0) + (profitConfirmed ? 0.5 : 0)
    const indictmentLevel = clamp(baseScore)

    const settlementRange = wideSpread ? '2,000만 ~ 5,000만 원 이상' : '1,000만 ~ 3,000만 원'
    const settlementFactors: VictimAnalysis['settlementFactors'] = [
      { label: '영리 목적 유포 — 합의금 대폭 상승', up: profitConfirmed },
      { label: '광범위 유포 확인 시 합의금 상승', up: wideSpread },
      { label: '삭제 요청 불이행 — 협상력 상승', up: v['q_deletion'] === 'requested' },
      { label: '콘텐츠 일부 삭제 완료 시 합의금 하락 가능', up: false },
    ]

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv, settlementRange, settlementFactors,
      note: '유포 플랫폼 신고·삭제 요청을 즉시 하고 스크린샷·URL을 보존하세요. 영리 목적이 인정되면 가중 처벌됩니다.',
      settlementNote: '콘텐츠 삭제 완료를 합의 조건에 명시하고, 재유포 시 위약금 조항을 포함해야 합니다.',
    }
  },

  poss: (all) => {
    const v = a('poss', all)
    const evLv = clamp(evidenceScore(v['q_evidence']))
    const perpScore = perpetratorScore(v['q_perpetrator'])
    const spreadConfirmed = v['q_spread'] === 'confirmed'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '직접 증거 — 소지 사실 입증 가능', positive: true })
    else factors.push({ label: '증거 보강 필요 — 수사기관 디지털 포렌식 활용 가능', positive: false })

    if (perpScore === 2) factors.push({ label: '가해자 신원 확인', positive: true })
    if (spreadConfirmed) factors.push({ label: '유포 확인 — 추가 죄명 적용 가능', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + perpScore / 2 * 1.0 + (spreadConfirmed ? 0.5 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: '100만 ~ 500만 원',
      settlementFactors: [
        { label: '유포가 있는 경우 합의금 대폭 상승', up: spreadConfirmed },
        { label: '직접 증거 확보 시 협상력 상승', up: evLv >= 2 },
      ],
      note: '소지·시청죄는 아동·청소년물 포함 여부에 따라 처벌 수준이 크게 달라집니다.',
      settlementNote: '소지 피해는 유포 여부에 따라 합의금 범위가 크게 달라집니다. 변호사와 상담 후 결정하세요.',
    }
  },

  child: (all) => {
    const v = a('child', all)
    const evLv = clamp(evidenceScore(v['q_evidence']))
    const perpScore = perpetratorScore(v['q_perpetrator'])
    const wideSpread = v['q_spread'] === 'wide'

    const factors: VictimAnalysis['indictmentFactors'] = []
    factors.push({ label: '아청법 적용 — 법정형 매우 중함 (소지죄도 징역 1년 이상)', positive: true })
    if (evLv >= 2) factors.push({ label: '증거 확보 — 기소 가능성 높음', positive: true })
    if (perpScore === 2) factors.push({ label: '가해자 신원 확인', positive: true })
    if (wideSpread) factors.push({ label: '광범위 유포 — 추가 가중 처벌', positive: true })
    if (v['q_content'] === 'deepfake') factors.push({ label: '딥페이크 제작 — 제작죄 적용 (법정형 5년 이상)', positive: true })

    const indictmentLevel = clamp(1.5 + evLv / 3 * 0.5 + perpScore / 2 * 0.5 + (wideSpread ? 0.5 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: '합의보다 형사 처벌 집중 권고\n(합의하더라도 기소 가능성 높음)',
      settlementFactors: [
        { label: '아청법 피해는 합의로 종결이 어려운 경우 많음', up: false },
        { label: '광범위 유포 시 더욱 강경한 처벌 가능', up: wideSpread },
      ],
      note: '아동·청소년 성착취물 관련 범죄는 공소시효가 길고 합의 여부와 무관하게 기소될 수 있습니다. 신고가 우선입니다.',
      settlementNote: '아청법 관련 범죄는 합의만으로 처벌을 면하기 어렵습니다. 반드시 형사 고소와 병행하시기 바랍니다.',
    }
  },

  deep: (all) => {
    const v = a('deep', all)
    const evLv = clamp(evidenceScore(v['q_evidence']))
    const perpScore = perpetratorScore(v['q_perpetrator'])
    const wideSpread = v['q_spread'] === 'wide'
    const identifiable = v['q_identifiable'] === 'identifiable'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (identifiable) factors.push({ label: '얼굴 특정 가능 — 피해자 특정성 인정', positive: true })
    if (evLv >= 2) factors.push({ label: '증거 확보 — 기소에 유리', positive: true })
    else if (evLv >= 1) factors.push({ label: '정황 증거 있음', positive: true })
    else factors.push({ label: '증거 부족 — 스크린샷·URL 즉시 보존 필요', positive: false })
    if (perpScore === 2) factors.push({ label: '가해자 신원 확인', positive: true })
    if (wideSpread) factors.push({ label: '광범위 유포 — 반포죄 가중 적용', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + perpScore / 2 * 1.0 + (wideSpread ? 0.5 : 0) + (identifiable ? 0.3 : 0))

    const settlementRange = wideSpread ? '1,000만 ~ 5,000만 원' : '300만 ~ 1,500만 원'

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange,
      settlementFactors: [
        { label: '유포 범위 넓을수록 합의금 상승', up: wideSpread },
        { label: '얼굴 특정 가능한 경우 피해 심각성 인정', up: identifiable },
        { label: '가해자 특정 시 협상력 상승', up: perpScore === 2 },
      ],
      note: '딥페이크 합성물은 발견 즉시 URL·스크린샷을 보존하세요. 방심위 신고로 빠른 삭제 조치가 가능합니다.',
      settlementNote: '합의 조건에 원본 파일 완전 삭제 및 재제작·재유포 금지를 반드시 포함하세요.',
    }
  },

  comm: (all) => {
    const v = a('comm', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'full' ? 3 : v['q_evidence'] === 'partial' ? 1 : 0
    const perpScore = perpetratorScore(v['q_perpetrator'])
    const manyTimes = v['q_count'] === 'many'
    const refused = v['q_refused'] === 'yes'
    const isImage = v['q_content_type'] === 'image' || v['q_content_type'] === 'both'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '대화기록 전부 보관 — 기소에 결정적', positive: true })
    else if (evLv >= 1) factors.push({ label: '일부 기록 보관 — 보강 필요', positive: true })
    else factors.push({ label: '기록 없음 — 증거 확보가 가장 시급', positive: false })
    if (refused) factors.push({ label: '거부 의사 표명 후 지속 — 고의 입증 강화', positive: true })
    if (manyTimes) factors.push({ label: '10회 이상 — 반복·지속적 전송으로 가중 처벌', positive: true })
    if (isImage) factors.push({ label: '신체 노출 사진 포함 — 죄질 가중', positive: true })
    if (perpScore === 2) factors.push({ label: '가해자 신원 확인', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + perpScore / 2 + (manyTimes ? 0.5 : 0) + (refused ? 0.3 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: manyTimes ? '150만 ~ 500만 원' : '50만 ~ 200만 원',
      settlementFactors: [
        { label: '반복 횟수 많을수록 합의금 상승', up: manyTimes },
        { label: '이미지·영상 포함 시 합의금 상승', up: isImage },
        { label: '거부 후 지속 시 협상력 강화', up: refused },
      ],
      note: '카카오톡·문자 등 전송 기록을 캡처해두세요. 삭제되기 전에 파일로 저장해 두는 것이 중요합니다.',
      settlementNote: '통신음란죄는 상대적으로 낮은 법정형이나, 반복·이미지 전송 시 합의금이 상승합니다.',
    }
  },

  stalk: (all) => {
    const v = a('stalk', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'cctv' ? 3 : v['q_evidence'] === 'records' ? 1 : 0
    const many = v['q_frequency'] === 'many'
    const threatType = v['q_type'] === 'threat'
    const issued = v['q_measure'] === 'issued'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: 'CCTV·목격자 — 객관적 증거 확보', positive: true })
    else if (evLv >= 1) factors.push({ label: '대화기록 확보 — 수사 협조 가능', positive: true })
    else factors.push({ label: '증거 부족 — 연락 기록 캡처 즉시 필요', positive: false })
    if (many) factors.push({ label: '장기·반복 행위 — 중대한 스토킹 해당', positive: true })
    if (threatType) factors.push({ label: '협박 동반 — 가중 처벌 (법정형 상승)', positive: true })
    if (issued) factors.push({ label: '잠정조치 발령 중 — 위반 시 추가 처벌 가능', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + (many ? 1 : 0.5) + (threatType ? 0.5 : 0) + (issued ? 0.3 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: many ? '200만 ~ 700만 원' : '100만 ~ 300만 원',
      settlementFactors: [
        { label: '반복 횟수 많을수록 합의금 상승', up: many },
        { label: '협박 동반 시 합의금 상승', up: threatType },
        { label: '전 연인 관계 — 복잡한 사정으로 합의금 변동 폭 큼', up: v['q_relationship'] === 'ex' },
      ],
      note: '잠정조치 신청을 통해 즉각적인 접근 차단이 가능합니다. 위반 시 가해자 구속도 가능합니다.',
      settlementNote: '스토킹 합의 시 재범 방지를 위한 접촉 금지 조항을 반드시 포함하세요.',
    }
  },

  rape: (all) => {
    const v = a('rape', all)
    const rawEvidence = v['q_evidence']
    const evLv: 0|1|2|3 = rawEvidence === 'cctv' ? 3 : rawEvidence === 'injury' ? 3 : rawEvidence === 'chat' ? 1 : 0
    const specialized = v['q_medical'] === 'specialized'
    const physicalForce = v['q_force'] === 'physical'
    const threat = v['q_force'] === 'threat'
    const family = v['q_relationship'] === 'family'
    const stranger = v['q_relationship'] === 'stranger'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (specialized) factors.push({ label: '전문 기관 신체 검사 완료 — 법의학적 증거 확보', positive: true })
    else if (v['q_medical'] === 'general') factors.push({ label: '병원 진찰 기록 — 부분적 증거', positive: true })
    else factors.push({ label: '신체 검사 미실시 — 가능한 빨리 해바라기센터 방문 권고', positive: false })

    if (evLv >= 3) factors.push({ label: 'CCTV·상해 의료기록 등 강한 증거', positive: true })
    else if (evLv >= 1) factors.push({ label: '대화기록 확보', positive: true })
    else factors.push({ label: '직접 증거 부족 — 진술 일관성 중요', positive: false })

    if (physicalForce) factors.push({ label: '신체 폭행 사용 — 강도 높은 기소 가능성', positive: true })
    if (threat) factors.push({ label: '협박 사용 — 구성요건 충족', positive: true })
    if (family) factors.push({ label: '친족 관계 — 가중처벌 (법정형 하한 7년)', positive: true })
    if (stranger) factors.push({ label: '기습 강간 — 죄질 가중', positive: true })

    const baseScore = (evLv / 3 * 1.5) + (specialized ? 1 : 0) + (physicalForce || threat ? 0.5 : 0) + (family ? 0.5 : 0)
    const indictmentLevel = clamp(baseScore)

    const settlementRange = (physicalForce || evLv >= 3 || family)
      ? '3,000만 원 이상 (사안에 따라 큰 폭 변동)'
      : '1,000만 ~ 3,000만 원'

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange,
      settlementFactors: [
        { label: '신체 폭행 동반 시 합의금 대폭 상승', up: physicalForce },
        { label: '강한 증거 (CCTV·상해기록) 시 협상력 상승', up: evLv >= 3 },
        { label: '친족 관계 — 특별법상 가중, 합의금 상승', up: family },
        { label: '합의 후 처벌불원도 기소 가능 (강간은 반의사불벌죄 아님)', up: false },
      ],
      note: '강간죄는 피해자 합의와 무관하게 검사가 기소할 수 있습니다. 신체 검사와 증거 보전이 최우선입니다.',
      settlementNote: '합의를 결정하기 전 반드시 변호사와 상담하세요. 합의 후에도 기소가 가능한 범죄입니다.',
    }
  },

  quasi_rape: (all) => {
    const v = a('quasi_rape', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'cctv' ? 3 : v['q_evidence'] === 'chat' ? 1 : 0
    const specialized = v['q_medical'] === 'specialized'
    const certain = v['q_awareness'] === 'certain'
    const drugState = v['q_state'] === 'drug'
    const asleep = v['q_state'] === 'asleep'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (specialized) factors.push({ label: '전문 기관 검사 완료 — 혈중알코올·약물 검출 가능', positive: true })
    else factors.push({ label: '전문 기관 검사 미실시 — 혈중농도 측정 기회 놓칠 수 있음', positive: false })
    if (evLv >= 3) factors.push({ label: 'CCTV·현장 증거 — 당시 상태 입증에 결정적', positive: true })
    else if (evLv >= 1) factors.push({ label: '대화기록 — 당시 상황 재구성 가능', positive: true })
    if (certain) factors.push({ label: '가해자 인식 입증 가능 — 고의 요건 충족', positive: true })
    if (drugState) factors.push({ label: '약물 사용 의심 — 수사기관에 즉시 신고 필요', positive: true })

    const indictmentLevel = clamp((evLv / 3 * 1.5) + (specialized ? 1 : 0) + (certain ? 0.5 : 0) + (drugState ? 0.3 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: '500만 ~ 3,000만 원',
      settlementFactors: [
        { label: '약물 사용 의심 — 죄질 가중, 합의금 상승', up: drugState },
        { label: '수면 중 추행 — 피해 심각성 인정', up: asleep },
        { label: '강한 증거 확보 시 협상력 상승', up: evLv >= 3 },
      ],
      note: '준강간은 피해자의 상태(음주·수면·약물)가 핵심입니다. CCTV·동석인 진술이 중요한 증거가 됩니다.',
      settlementNote: '강간과 동일한 법정형이 적용됩니다. 합의 후에도 기소될 수 있어 신중한 결정이 필요합니다.',
    }
  },

  molestation: (all) => {
    const v = a('molestation', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'cctv' ? 3 : v['q_evidence'] === 'indirect' ? 1 : 0
    const force = v['q_method'] === 'force'
    const repeated = v['q_method'] === 'repeated' || v['q_frequency'] === 'many'
    const public_ = v['q_location'] === 'public'
    const work = v['q_location'] === 'workplace' || v['q_relationship'] === 'work'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: 'CCTV·목격자 — 행위 입증에 결정적', positive: true })
    else if (evLv >= 1) factors.push({ label: '간접 증거 확보', positive: true })
    else factors.push({ label: '증거 부족 — 진술의 일관성·구체성이 중요', positive: false })
    if (force) factors.push({ label: '폭행 동반 — 가중 처벌 (유형2)', positive: true })
    if (repeated) factors.push({ label: '반복 행위 — 죄질 가중', positive: true })
    if (public_) factors.push({ label: '공공장소 — CCTV 확보 가능성 높음', positive: true })
    if (work) factors.push({ label: '직장 관계 이용 — 직권남용 가중', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + (force ? 0.5 : 0) + (repeated ? 0.5 : 0) + (public_ ? 0.3 : 0))

    const settlementRange = (force || repeated)
      ? '1,000만 ~ 3,000만 원'
      : '300만 ~ 1,500만 원'

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange,
      settlementFactors: [
        { label: '폭행 동반 시 합의금 상승', up: force },
        { label: '반복 피해 시 합의금 상승', up: repeated },
        { label: 'CCTV 등 객관적 증거 — 협상력 강화', up: evLv >= 3 },
        { label: '직장 관계 이용 — 합의금 상승 가능', up: work },
      ],
      note: '공공장소 강제추행은 주변 CCTV 영상을 즉시 요청하세요. 시간이 지나면 삭제될 수 있습니다.',
      settlementNote: '강제추행죄는 반의사불벌죄가 아닙니다. 합의 후에도 기소 가능하므로 신중히 결정하세요.',
    }
  },

  quasi_molestation: (all) => {
    const v = a('quasi_molestation', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'cctv' ? 3 : v['q_evidence'] === 'chat' ? 1 : 0
    const certain = v['q_awareness'] === 'certain'
    const drug = v['q_state'] === 'drug'
    const multiple = v['q_frequency'] === 'multiple'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '객관적 증거 확보 — 기소 가능성 높음', positive: true })
    else factors.push({ label: '증거 보강 필요', positive: false })
    if (certain) factors.push({ label: '가해자 인식 입증 가능 — 고의 요건 충족', positive: true })
    if (drug) factors.push({ label: '약물 상태 — 죄질 가중', positive: true })
    if (multiple) factors.push({ label: '반복 행위 — 가중 처벌', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + (certain ? 0.5 : 0) + (drug ? 0.3 : 0) + (multiple ? 0.3 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: '200만 ~ 1,500만 원',
      settlementFactors: [
        { label: '약물 상태 이용 — 죄질 가중, 합의금 상승', up: drug },
        { label: '반복 행위 시 합의금 상승', up: multiple },
        { label: '가해자 인식 입증 시 협상력 강화', up: certain },
      ],
      note: '피해 직후 혈중알코올농도·약물 검사가 가능하면 즉시 받으세요. 시간이 지날수록 증거가 사라집니다.',
      settlementNote: '준강제추행도 강제추행과 동일한 법정형입니다. 합의 여부와 무관하게 기소될 수 있습니다.',
    }
  },

  authority: (all) => {
    const v = a('authority', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'witness' ? 3 : v['q_evidence'] === 'records' ? 1 : 0
    const medical = v['q_relationship'] === 'medical'
    const teacher = v['q_relationship'] === 'teacher'
    const repeated = v['q_frequency'] === 'many'
    const others = v['q_others'] === 'yes'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '목격자·다른 피해자 — 기소 가능성 대폭 상승', positive: true })
    else if (evLv >= 1) factors.push({ label: '대화기록 확보', positive: true })
    else factors.push({ label: '진술 외 증거 필요 — 대화기록 복원 고려', positive: false })
    if (medical) factors.push({ label: '의사·치료사 관계 — 특별한 신뢰 관계 이용', positive: true })
    if (teacher) factors.push({ label: '교사·강사 관계 — 직무상 위력 인정', positive: true })
    if (repeated) factors.push({ label: '반복 행위 — 죄질 가중', positive: true })
    if (others) factors.push({ label: '다른 피해자 존재 — 기소 가능성 매우 높음', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.5 + (medical || teacher ? 0.5 : 0) + (repeated ? 0.3 : 0) + (others ? 1 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: '300만 ~ 2,000만 원',
      settlementFactors: [
        { label: '다른 피해자 있을 경우 합의금 상승', up: others },
        { label: '반복 행위 시 합의금 상승', up: repeated },
        { label: '의사·교사 관계 — 직업적 제재와 연동, 협상력 강화', up: medical || teacher },
      ],
      note: '위계·위력 추행은 직업 자격 정지·취소 처분이 병과될 수 있어 가해자에게 강한 압박 요소가 됩니다.',
      settlementNote: '다른 피해자가 있는 경우 공동 대응이 효과적입니다. 합의 조건에 재발 방지를 명시하세요.',
    }
  },

  workplace: (all) => {
    const v = a('workplace', all)
    const evLv: 0|1|2|3 = v['q_evidence'] === 'witness' ? 3 : v['q_evidence'] === 'records' ? 1 : 0
    const superior = v['q_position'] === 'superior'
    const physical = v['q_type'] === 'physical'
    const long_ = v['q_duration'] === 'long'
    const formalReport = v['q_reported'] === 'formal'

    const factors: VictimAnalysis['indictmentFactors'] = []
    if (evLv >= 3) factors.push({ label: '목격자 확보 — 강력한 증거', positive: true })
    else if (evLv >= 1) factors.push({ label: '대화기록·이메일 확보', positive: true })
    else factors.push({ label: '증거 부족 — 이메일·메시지 즉시 백업 필요', positive: false })
    if (formalReport) factors.push({ label: '정식 신고 완료 — 회사 조사 의무 발생', positive: true })
    if (physical) factors.push({ label: '신체 접촉 포함 — 강제추행 경합 가능 (형사 강화)', positive: true })
    if (superior) factors.push({ label: '상급자 행위 — 직권남용 가중', positive: true })
    if (long_) factors.push({ label: '장기 지속 — 죄질 가중', positive: true })

    const indictmentLevel = clamp(evLv / 3 * 1.0 + (physical ? 1 : 0) + (formalReport ? 0.5 : 0) + (superior ? 0.3 : 0))

    return {
      indictmentLevel, indictmentFactors: factors,
      evidenceLevel: evLv,
      settlementRange: physical
        ? '500만 ~ 2,000만 원 (강제추행 경합 시 상향)'
        : '100만 ~ 500만 원 (주로 민사·행정 해결)',
      settlementFactors: [
        { label: '신체 접촉 포함 시 합의금 대폭 상승', up: physical },
        { label: '장기 지속 시 합의금 상승', up: long_ },
        { label: '상급자 지위 이용 — 협상력 강화', up: superior },
        { label: '노동청 신고 시 행정 처벌 압박 추가 가능', up: formalReport },
      ],
      note: '직장내 성희롱은 형사처벌 규정이 없습니다. 단, 고용노동부 신고 시 사업주에게 과태료(최대 1,000만 원)가 부과될 수 있고, 민사 손해배상 청구도 가능합니다.',
      settlementNote: '합의 외에 노동청 신고와 민사 손해배상 청구를 병행하는 것이 효과적입니다.',
    }
  },
}

export function getVictimAnalysis(crimeId: CrimeType, allAnswers: Record<string, string>): VictimAnalysis {
  return ANALYSIS[crimeId](allAnswers)
}
