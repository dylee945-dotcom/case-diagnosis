import type { CrimeType, SentencingConfig, SentencingFactor } from '../types'

function getAnswers(crimeId: CrimeType, allAnswers: Record<string, string>): Record<string, string> {
  const prefix = `${crimeId}:`
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(allAnswers)) {
    if (k.startsWith(prefix)) result[k.slice(prefix.length)] = v
  }
  return result
}

export const SENTENCING: Record<CrimeType, SentencingConfig> = {
  cam: {
    types: [
      {
        typeName: '유형1 — 일반 불법촬영',
        ranges: [
          { label: '감경', min: '징역 1월', max: '8월' },
          { label: '기본', min: '징역 4월', max: '1년' },
          { label: '가중', min: '징역 8월', max: '2년' },
        ],
      },
      {
        typeName: '유형2 — 다수 피해자·상습 (특별 가중)',
        ranges: [
          { label: '감경', min: '징역 6월', max: '1년 6월' },
          { label: '기본', min: '징역 1년', max: '2년 6월' },
          { label: '가중', min: '징역 2년', max: '4년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('cam', allAnswers)
      const factors: SentencingFactor[] = []
      // Special aggravating
      if (a['q_prior'] === 'same_crime')
        factors.push({ direction: 'special-aggravate', label: '동종 전과 (집행유예 이상)', confirmed: true })
      if (a['q_victims'] === 'three_plus')
        factors.push({ direction: 'special-aggravate', label: '다수 피해자 (3인 이상)', confirmed: true })
      if (a['q_file'] === 'shared')
        factors.push({ direction: 'special-aggravate', label: '촬영물 유포', confirmed: true })
      // Aggravating
      if (a['q_victims'] === 'two')
        factors.push({ direction: 'aggravate', label: '피해자 2인', confirmed: true })
      if (a['q_location'] === 'toilet')
        factors.push({ direction: 'aggravate', label: '화장실·탈의실 — 사생활 침해 중대', confirmed: true })
      if (a['q_count'] === '4plus')
        factors.push({ direction: 'aggravate', label: '수회 반복 (4회 이상)', confirmed: true })
      if (a['q_file'] === 'deleted')
        factors.push({ direction: 'aggravate', label: '삭제 시도 — 증거 인멸 의도', confirmed: true })
      // Mitigating
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_file'] === 'have' || a['q_file'] === 'deleted')
        factors.push({ direction: 'mitigate', label: '촬영물 미유포 (외부 유출 없음)', confirmed: true })
      if (a['q_settlement'] === 'done')
        factors.push({ direction: 'mitigate', label: '피해자 합의 (처벌불원)', confirmed: true })
      // Unknown
      if (!a['q_settlement'] || a['q_settlement'] === 'none')
        factors.push({ direction: 'mitigate', label: '피해자 합의 여부 (현재 미확인)', confirmed: false })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('cam', allAnswers)
      const isType2 = a['q_victims'] === 'three_plus' || a['q_prior'] === 'same_crime'
      const typeIdx = isType2 ? 1 : 0
      const hasAgg = a['q_count'] === '4plus' || a['q_location'] === 'toilet' || a['q_victims'] === 'two'
      const hasMit = a['q_prior'] === 'none' && a['q_settlement'] === 'done'
      let rangeLabel = '기본구간'
      if (hasAgg && !hasMit) rangeLabel = '기본구간 중간~가중구간 초입'
      else if (hasMit && !hasAgg) rangeLabel = '감경구간~기본구간 초입'
      else if (hasAgg && hasMit) rangeLabel = '기본구간'
      return { typeIdx, rangeLabel, note: '실제 선고형은 재판부 재량에 따라 달라집니다.' }
    },
  },

  dist: {
    types: [
      {
        typeName: '유형1 — 일반 유포',
        ranges: [
          { label: '감경', min: '징역 4월', max: '1년' },
          { label: '기본', min: '징역 8월', max: '2년' },
          { label: '가중', min: '징역 1년 6월', max: '3년' },
        ],
      },
      {
        typeName: '유형2 — 영리 목적 / 정보통신망 이용 (제3항)',
        ranges: [
          { label: '감경', min: '징역 2년', max: '4년' },
          { label: '기본', min: '징역 3년', max: '6년' },
          { label: '가중', min: '징역 5년', max: '9년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('dist', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_payment'] !== 'no')
        factors.push({ direction: 'special-aggravate', label: '영리 목적 (포인트/금전 수취)', confirmed: true })
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과', confirmed: true })
      if (a['q_platform'] === 'telegram_channel' || a['q_platform'] === 'group_chat')
        factors.push({ direction: 'aggravate', label: '불특정 다수 대상 유포 (채널/단체방)', confirmed: true })
      if (a['q_duration'] === 'long')
        factors.push({ direction: 'aggravate', label: '장기간 반복 유포', confirmed: true })
      if (a['q_delete'] === 'no')
        factors.push({ direction: 'aggravate', label: '삭제 조치 없음', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_delete'] === 'immediate')
        factors.push({ direction: 'mitigate', label: '자발적 즉시 삭제', confirmed: true })
      if (a['q_platform'] === 'dm')
        factors.push({ direction: 'mitigate', label: '유포 범위 제한적 (1:1 전송)', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('dist', allAnswers)
      const isType2 = a['q_payment'] !== 'no' || a['q_subscription'] === 'yes'
      const typeIdx = isType2 ? 1 : 0
      return { typeIdx, rangeLabel: '기본구간', note: '영리 목적 인정 여부에 따라 적용 유형이 달라집니다.' }
    },
  },

  poss: {
    types: [
      {
        typeName: '불법촬영물 소지·시청',
        ranges: [
          { label: '감경', min: '벌금 500만', max: '또는 징역 2월' },
          { label: '기본', min: '벌금 또는 징역 2월', max: '1년' },
          { label: '가중', min: '징역 6월', max: '3년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('poss', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_minor'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '아동·청소년물 포함 → 아청법 별도 적용', confirmed: true })
      if (a['q_count'] === 'over500')
        factors.push({ direction: 'special-aggravate', label: '소지 수량 500개 이상', confirmed: true })
      if (a['q_count'] === '100to499')
        factors.push({ direction: 'aggravate', label: '소지 수량 100개 이상', confirmed: true })
      if (a['q_source'] === 'torrent')
        factors.push({ direction: 'aggravate', label: '토렌트 사용 — 유포 경합 위험', confirmed: true })
      if (a['q_source'] === 'illegal_site')
        factors.push({ direction: 'aggravate', label: '전문 불법 사이트 반복 이용', confirmed: true })
      if (a['q_filename'] === 'yes_illegal')
        factors.push({ direction: 'aggravate', label: '파일명에 불법 표시 — 인식 입증 완료', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_count'] === 'under10')
        factors.push({ direction: 'mitigate', label: '소량 소지 (10개 미만)', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('poss', allAnswers)
      let rangeLabel = '기본구간'
      if (a['q_count'] === 'over500' || a['q_minor'] === 'yes') rangeLabel = '가중구간'
      else if (a['q_count'] === 'under10' && a['q_prior'] === 'none') rangeLabel = '감경구간~기본구간'
      return { typeIdx: 0, rangeLabel, note: '아동청소년물 포함 여부에 따라 적용 법률이 달라집니다.' }
    },
  },

  child: {
    types: [
      {
        typeName: '아청법 소지·시청 (제11조 제5항)',
        ranges: [
          { label: '기본', min: '징역 1년', max: '2년' },
          { label: '가중', min: '징역 1년 6월', max: '3년' },
        ],
      },
      {
        typeName: '아청법 제작 (제11조 제1항) — 딥페이크 포함',
        ranges: [
          { label: '기본', min: '징역 5년 이상', max: '또는 무기징역' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('child', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_payment'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '영리 목적 (포인트/금전 수취)', confirmed: true })
      if (a['q_count'] === 'over100')
        factors.push({ direction: 'aggravate', label: '소지 수량 100개 이상', confirmed: true })
      if (a['q_deepfake'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '딥페이크 합성 — 제작죄 해당 (법정형 하한 5년)', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_count'] === 'under10')
        factors.push({ direction: 'mitigate', label: '소량 소지 (10개 미만)', confirmed: true })
      factors.push({ direction: 'mitigate', label: '벌금형 없음 — 집행유예 가능 여부는 별도 판단', confirmed: false })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('child', allAnswers)
      if (a['q_deepfake'] === 'yes') {
        return { typeIdx: 1, rangeLabel: '제작죄 (법정형 하한 5년)', note: '아청법 제작죄는 가장 중한 처벌을 받습니다.' }
      }
      return { typeIdx: 0, rangeLabel: '기본구간', note: '아청법 소지죄는 벌금형이 없습니다.' }
    },
  },

  deep: {
    types: [
      {
        typeName: '유형1 — 편집·합성 (제14조의2 제1항)',
        ranges: [
          { label: '감경', min: '징역 4월', max: '1년' },
          { label: '기본', min: '징역 8월', max: '2년' },
          { label: '가중', min: '징역 1년 6월', max: '3년' },
        ],
      },
      {
        typeName: '유형2 — 반포 (제14조의2 제2항)',
        ranges: [
          { label: '감경', min: '징역 6월', max: '1년 6월' },
          { label: '기본', min: '징역 1년', max: '2년 6월' },
          { label: '가중', min: '징역 2년', max: '4년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('deep', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_minor'] === 'yes_unclear')
        factors.push({ direction: 'special-aggravate', label: '피해자 미성년 → 아청법 경합 (법정형 하한 5년)', confirmed: true })
      if (a['q_channel'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '채널 운영 → 반포 목적 추정', confirmed: true })
      if (a['q_face'] === 'identifiable')
        factors.push({ direction: 'aggravate', label: '피해자 얼굴 식별 가능', confirmed: true })
      if (a['q_program'] === 'yes')
        factors.push({ direction: 'aggravate', label: '딥페이크 프로그램 설치 이력', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_face'] !== 'identifiable')
        factors.push({ direction: 'mitigate', label: '합성 수준 낮아 인위적 합성 명백', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('deep', allAnswers)
      if (a['q_minor'] === 'yes_unclear') {
        return { typeIdx: 1, rangeLabel: '아청법 경합 — 가중구간 초과', note: '아청법 경합 시 양형기준이 별도 적용됩니다.' }
      }
      const typeIdx = a['q_distribute'] === 'yes' ? 1 : 0
      return { typeIdx, rangeLabel: '기본구간', note: '반포 행위 여부가 유형 분류의 기준입니다.' }
    },
  },

  comm: {
    types: [
      {
        typeName: '통신매체이용음란 (제13조)',
        ranges: [
          { label: '감경', min: '벌금 50만', max: '200만 원 또는 징역 1월~4월' },
          { label: '기본', min: '벌금 200만', max: '700만 원 또는 징역 3월~8월' },
          { label: '가중', min: '징역 6월', max: '1년 6월' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('comm', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과', confirmed: true })
      if (a['q_minor'] === 'yes_unclear')
        factors.push({ direction: 'special-aggravate', label: '미성년자 피해자', confirmed: true })
      if (a['q_count'] === 'ten_plus')
        factors.push({ direction: 'special-aggravate', label: '반복·지속적 전송 (10회 이상)', confirmed: true })
      if (a['q_continued'] === 'yes')
        factors.push({ direction: 'aggravate', label: '피해자 거부 후 지속', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_count'] === 'one_two')
        factors.push({ direction: 'mitigate', label: '1~2회 전송', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('comm', allAnswers)
      let rangeLabel = '기본구간'
      if (a['q_minor'] === 'yes_unclear' || a['q_count'] === 'ten_plus') rangeLabel = '가중구간'
      else if (a['q_count'] === 'one_two' && a['q_prior'] === 'none') rangeLabel = '감경구간~기본구간'
      return { typeIdx: 0, rangeLabel, note: '통신음란죄는 벌금형 선고도 가능하지만 횟수·피해자 상태에 따라 징역형이 적용됩니다.' }
    },
  },

  stalk: {
    types: [
      {
        typeName: '유형1 — 일반 스토킹',
        ranges: [
          { label: '감경', min: '벌금 50만', max: '300만 원 또는 징역 1월~4월' },
          { label: '기본', min: '벌금 300만', max: '700만 원 또는 징역 3월~8월' },
          { label: '가중', min: '징역 6월', max: '1년 6월' },
        ],
      },
      {
        typeName: '유형2 — 흉기·위험물 사용 / 잠정조치 위반 후 재범',
        ranges: [
          { label: '기본', min: '징역 8월', max: '1년 6월' },
          { label: '가중', min: '징역 1년 6월', max: '3년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('stalk', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_violation'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '잠정조치 위반 후 재범 → 유형2 해당', confirmed: true })
      if (a['q_threat'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '협박·폭행 결합 → 경합범 가중', confirmed: true })
      if (a['q_minor'] === 'yes')
        factors.push({ direction: 'aggravate', label: '피해자 미성년자', confirmed: true })
      if (a['q_acts'] === 'many')
        factors.push({ direction: 'aggravate', label: '장기간 반복 (10회 이상)', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_acts'] === 'twice')
        factors.push({ direction: 'mitigate', label: '행위 횟수 적음 (2회)', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('stalk', allAnswers)
      const isType2 = a['q_violation'] === 'yes' || a['q_threat'] === 'yes'
      const typeIdx = isType2 ? 1 : 0
      let rangeLabel = '기본구간'
      if (a['q_acts'] === 'many' || a['q_minor'] === 'yes') rangeLabel = '기본구간~가중구간'
      else if (a['q_acts'] === 'twice' && a['q_prior'] === 'none') rangeLabel = '감경구간'
      return { typeIdx, rangeLabel, note: '잠정조치 위반 또는 협박 동반 시 유형2로 분류됩니다.' }
    },
  },

  rape: {
    types: [
      {
        typeName: '유형1 — 일반 강간',
        ranges: [
          { label: '감경', min: '징역 1년', max: '2년 6월' },
          { label: '기본', min: '징역 2년', max: '4년' },
          { label: '가중', min: '징역 3년', max: '5년' },
        ],
      },
      {
        typeName: '유형2 — 특별가중 (친족·장애인·다수 피해자)',
        ranges: [
          { label: '감경', min: '징역 2년 6월', max: '5년' },
          { label: '기본', min: '징역 4년', max: '7년' },
          { label: '가중', min: '징역 6년', max: '10년 이상' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('rape', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_relationship'] === 'family')
        factors.push({ direction: 'special-aggravate', label: '친족 관계 — 특별법 가중 (법정형 하한 7년)', confirmed: true })
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과 (집행유예 이상)', confirmed: true })
      if (a['q_force'] === 'physical')
        factors.push({ direction: 'aggravate', label: '신체적 폭행 사용', confirmed: true })
      if (a['q_consent'] === 'refused')
        factors.push({ direction: 'aggravate', label: '피해자가 명확히 거부 의사 표현', confirmed: true })
      if (a['q_evidence'] === 'cctv')
        factors.push({ direction: 'aggravate', label: 'CCTV·목격자 등 객관적 증거 존재', confirmed: true })
      if (a['q_relationship'] === 'stranger')
        factors.push({ direction: 'aggravate', label: '기습 강간 (모르는 사람 대상)', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_settlement'] === 'done')
        factors.push({ direction: 'mitigate', label: '피해자 합의 (처벌불원)', confirmed: true })
      if (a['q_consent'] === 'claim_consent')
        factors.push({ direction: 'mitigate', label: '동의 주장 — 구성요건 다툼 가능', confirmed: true })
      if (!a['q_settlement'] || a['q_settlement'] === 'none')
        factors.push({ direction: 'mitigate', label: '합의 여부 미확인 (진행 중 영향 가능)', confirmed: false })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('rape', allAnswers)
      const isType2 = a['q_relationship'] === 'family' || a['q_prior'] === 'yes'
      const typeIdx = isType2 ? 1 : 0
      const hasAgg = a['q_force'] === 'physical' || a['q_consent'] === 'refused' || a['q_relationship'] === 'stranger'
      const hasMit = a['q_prior'] === 'none' && a['q_settlement'] === 'done'
      let rangeLabel = '기본구간'
      if (hasAgg && !hasMit) rangeLabel = '기본구간~가중구간'
      else if (hasMit && !hasAgg) rangeLabel = '감경구간~기본구간'
      return { typeIdx, rangeLabel, note: '강간죄는 법정형 하한이 3년(친족 7년)으로, 벌금형이 없습니다.' }
    },
  },

  quasi_rape: {
    types: [
      {
        typeName: '준강간 — 심신상실·항거불능 이용 (형법 제299조)',
        ranges: [
          { label: '감경', min: '징역 1년', max: '2년 6월' },
          { label: '기본', min: '징역 2년', max: '4년' },
          { label: '가중', min: '징역 3년', max: '5년 이상' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('quasi_rape', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과', confirmed: true })
      if (a['q_state'] === 'drug')
        factors.push({ direction: 'aggravate', label: '약물로 인한 무력 상태 이용 (중대)', confirmed: true })
      if (a['q_state'] === 'asleep')
        factors.push({ direction: 'aggravate', label: '수면·의식 불명 상태 이용', confirmed: true })
      if (a['q_awareness'] === 'knew')
        factors.push({ direction: 'aggravate', label: '피해자 상태 인식 사실 — 고의 입증 가능', confirmed: true })
      if (a['q_evidence'] === 'cctv')
        factors.push({ direction: 'aggravate', label: 'CCTV·영상 등 객관적 증거', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_settlement'] === 'done')
        factors.push({ direction: 'mitigate', label: '피해자 합의', confirmed: true })
      if (a['q_awareness'] === 'claimed_not')
        factors.push({ direction: 'mitigate', label: '인식 부정 주장 — 구성요건 다툼 가능', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('quasi_rape', allAnswers)
      const hasAgg = a['q_state'] === 'drug' || a['q_awareness'] === 'knew' || a['q_prior'] === 'yes'
      const hasMit = a['q_prior'] === 'none' && a['q_settlement'] === 'done'
      let rangeLabel = '기본구간'
      if (hasAgg && !hasMit) rangeLabel = '기본구간~가중구간'
      else if (hasMit && !hasAgg) rangeLabel = '감경구간~기본구간'
      return { typeIdx: 0, rangeLabel, note: '준강간은 강간과 동일한 법정형(3년 이상)이 적용됩니다. \'인식 여부\'가 구성요건 다툼의 핵심입니다.' }
    },
  },

  molestation: {
    types: [
      {
        typeName: '유형1 — 일반 강제추행',
        ranges: [
          { label: '감경', min: '징역 4월', max: '1년' },
          { label: '기본', min: '징역 8월', max: '2년' },
          { label: '가중', min: '징역 1년 6월', max: '3년' },
        ],
      },
      {
        typeName: '유형2 — 반복·폭행 동반·직장 등 가중 유형',
        ranges: [
          { label: '감경', min: '징역 1년 6월', max: '3년' },
          { label: '기본', min: '징역 2년 6월', max: '5년' },
          { label: '가중', min: '징역 4년', max: '7년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('molestation', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과', confirmed: true })
      if (a['q_method'] === 'force')
        factors.push({ direction: 'aggravate', label: '폭행 동반 추행', confirmed: true })
      if (a['q_method'] === 'repeated')
        factors.push({ direction: 'aggravate', label: '반복·지속적 추행', confirmed: true })
      if (a['q_location'] === 'workplace' || a['q_relationship'] === 'work')
        factors.push({ direction: 'aggravate', label: '직장·신뢰 관계 이용', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_settlement'] === 'done')
        factors.push({ direction: 'mitigate', label: '피해자 합의 (처벌불원)', confirmed: true })
      if (a['q_method'] === 'surprise')
        factors.push({ direction: 'mitigate', label: '기습 1회성 — 반복성 없음', confirmed: true })
      if (!a['q_settlement'] || a['q_settlement'] === 'none')
        factors.push({ direction: 'mitigate', label: '합의 여부 미확인', confirmed: false })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('molestation', allAnswers)
      const isType2 = a['q_method'] === 'force' || a['q_method'] === 'repeated' || a['q_prior'] === 'yes'
      const typeIdx = isType2 ? 1 : 0
      const hasMit = a['q_prior'] === 'none' && a['q_settlement'] === 'done'
      let rangeLabel = '기본구간'
      if (!hasMit && (a['q_method'] === 'force' || a['q_prior'] === 'yes')) rangeLabel = '기본구간~가중구간'
      else if (hasMit) rangeLabel = '감경구간~기본구간'
      return { typeIdx, rangeLabel, note: '강제추행은 벌금형도 가능하지만, 반복·폭행 동반 시 실형 구간에 진입합니다.' }
    },
  },

  quasi_molestation: {
    types: [
      {
        typeName: '준강제추행 — 심신상실·항거불능 이용 (형법 제299조)',
        ranges: [
          { label: '감경', min: '징역 4월', max: '1년' },
          { label: '기본', min: '징역 8월', max: '2년' },
          { label: '가중', min: '징역 1년 6월', max: '3년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('quasi_molestation', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과', confirmed: true })
      if (a['q_state'] === 'drug')
        factors.push({ direction: 'aggravate', label: '약물·의식 불명 상태 이용', confirmed: true })
      if (a['q_state'] === 'asleep')
        factors.push({ direction: 'aggravate', label: '수면 중 추행', confirmed: true })
      if (a['q_awareness'] === 'knew')
        factors.push({ direction: 'aggravate', label: '피해자 상태 인식 — 고의 입증 가능', confirmed: true })
      if (a['q_acts'] === 'multiple')
        factors.push({ direction: 'aggravate', label: '반복 행위', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_settlement'] === 'done')
        factors.push({ direction: 'mitigate', label: '피해자 합의', confirmed: true })
      if (a['q_awareness'] === 'claimed_not')
        factors.push({ direction: 'mitigate', label: '인식 부정 주장 — 구성요건 다툼 가능', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('quasi_molestation', allAnswers)
      const hasAgg = a['q_awareness'] === 'knew' || a['q_acts'] === 'multiple' || a['q_prior'] === 'yes'
      const hasMit = a['q_prior'] === 'none' && a['q_settlement'] === 'done'
      let rangeLabel = '기본구간'
      if (hasAgg && !hasMit) rangeLabel = '기본구간~가중구간'
      else if (hasMit && !hasAgg) rangeLabel = '감경구간~기본구간'
      return { typeIdx: 0, rangeLabel, note: '준강제추행은 강제추행과 동일한 법정형이 적용됩니다. 피해자 상태에 대한 \'인식 여부\'가 핵심입니다.' }
    },
  },

  authority: {
    types: [
      {
        typeName: '업무상 위계·위력에 의한 추행 (형법 제303조 / 성폭력처벌법 제10조)',
        ranges: [
          { label: '감경', min: '징역 2월', max: '8월' },
          { label: '기본', min: '징역 6월', max: '1년 6월' },
          { label: '가중', min: '징역 1년', max: '3년' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('authority', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과', confirmed: true })
      if (a['q_relationship'] === 'medical' || a['q_relationship'] === 'teacher')
        factors.push({ direction: 'aggravate', label: '의사·교사 등 고도의 신뢰 관계 이용', confirmed: true })
      if (a['q_duration'] === 'repeated')
        factors.push({ direction: 'aggravate', label: '반복·지속 행위', confirmed: true })
      if (a['q_method'] === 'authority')
        factors.push({ direction: 'aggravate', label: '직위·권한을 직접 이용한 위력', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_settlement'] === 'done')
        factors.push({ direction: 'mitigate', label: '피해자 합의', confirmed: true })
      if (a['q_method'] === 'deception')
        factors.push({ direction: 'mitigate', label: '위계(속임수) — 위력보다 상대적으로 경한 유형', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('authority', allAnswers)
      const hasAgg = a['q_relationship'] === 'medical' || a['q_relationship'] === 'teacher' || a['q_duration'] === 'repeated'
      const hasMit = a['q_prior'] === 'none' && a['q_settlement'] === 'done'
      let rangeLabel = '기본구간'
      if (hasAgg && !hasMit) rangeLabel = '기본구간~가중구간'
      else if (hasMit && !hasAgg) rangeLabel = '감경구간~기본구간'
      return { typeIdx: 0, rangeLabel, note: '업무상 위계위력 추행은 형사처벌 외에 직업 자격 정지·취소 처분이 병과될 수 있습니다.' }
    },
  },

  workplace: {
    types: [
      {
        typeName: '직장내 성희롱 (남녀고용평등법 제12조)',
        ranges: [
          { label: '행정 제재', min: '과태료 최대 1,000만 원', max: '시정명령·징계 권고' },
          { label: '형사 처벌', min: '징역 2년 이하', max: '또는 벌금 2,000만 원 이하' },
        ],
      },
    ],
    factorFn: (allAnswers) => {
      const a = getAnswers('workplace', allAnswers)
      const factors: SentencingFactor[] = []
      if (a['q_prior'] === 'yes')
        factors.push({ direction: 'special-aggravate', label: '동종 전과 또는 행정 제재 전력', confirmed: true })
      if (a['q_type'] === 'physical')
        factors.push({ direction: 'aggravate', label: '신체 접촉 포함 — 강제추행 경합 가능', confirmed: true })
      if (a['q_position'] === 'superior')
        factors.push({ direction: 'aggravate', label: '상급자로서 지위 이용', confirmed: true })
      if (a['q_duration'] === 'long')
        factors.push({ direction: 'aggravate', label: '장기간 지속', confirmed: true })
      if (a['q_report'] === 'labor')
        factors.push({ direction: 'aggravate', label: '노동청 신고 → 행정 조사 병행', confirmed: true })
      if (a['q_prior'] === 'none')
        factors.push({ direction: 'mitigate', label: '초범', confirmed: true })
      if (a['q_duration'] === 'once')
        factors.push({ direction: 'mitigate', label: '1회성', confirmed: true })
      if (a['q_type'] === 'verbal')
        factors.push({ direction: 'mitigate', label: '언어적 행위 — 신체 접촉 없음', confirmed: true })
      return factors
    },
    estimateFn: (allAnswers) => {
      const a = getAnswers('workplace', allAnswers)
      const isCriminal = a['q_type'] === 'physical' || a['q_duration'] === 'long' || a['q_report'] === 'labor'
      let rangeLabel = isCriminal ? '형사 처벌 가능 구간' : '행정 제재 중심 구간'
      return { typeIdx: 0, rangeLabel, note: '직장내 성희롱은 형사 처벌보다 행정·민사 제재가 주된 경우가 많습니다. 신체 접촉이 포함된 경우 강제추행 경합 여부를 별도로 검토해야 합니다.' }
    },
  },
}
