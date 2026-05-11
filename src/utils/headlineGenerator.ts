import type { CrimeType, Stage } from '../types'

type HeadlineEntry = { trigger: string; text: string }
type HeadlineMap = Partial<Record<Stage, HeadlineEntry[]>>

const HEADLINES: Record<CrimeType, Record<string, HeadlineMap>> = {
  cam: {
    evidence: {
      forensics: [
        { trigger: 'deleted', text: '삭제했어도, 포렌식에서 파일 하나라도 복원되면\n\'없던 일\'이 다시 생깁니다.' },
        { trigger: 'have', text: '기기를 지금 갖고 있는 것 자체가\n가장 직접적인 증거입니다.' },
        { trigger: 'shared', text: '이미 전송된 파일은 수신자 기기에도 흔적이 남습니다.\n삭제해도 유포 증거는 사라지지 않습니다.' },
      ],
      early: [
        { trigger: 'have', text: '지금 기기를 갖고 있는 것 자체가\n가장 직접적인 증거입니다.' },
        { trigger: 'digital', text: '디지털 증거가 이미 확인된 상태입니다.\n수사관의 분석 요청이 빠르게 진행될 수 있습니다.' },
        { trigger: 'deleted', text: '삭제 기록이 있다면 증거 인멸 시도로\n해석될 수 있습니다.' },
      ],
      'pre-report': [
        { trigger: 'witness_only', text: '지금은 목격자 진술만 있는 상태입니다.\n포렌식 전에 대응 방향을 정해야 합니다.' },
        { trigger: 'have', text: '기기에 파일이 있는 지금이\n대응을 준비할 마지막 시점입니다.' },
      ],
      mid: [
        { trigger: 'have', text: '기기 제출 전 파일 상태가\n이후 수사 방향을 결정합니다.' },
      ],
    },
    intent: {
      'pre-report': [
        { trigger: 'bodypart_yes', text: '촬영 각도와 부위가 이미 고의를 말하고 있습니다.\n우연이었다는 주장이 받아들여지기 어려운 구조입니다.' },
        { trigger: 'count_4plus', text: '4회 이상 반복했다면\n우연이라는 설명 자체가 성립하지 않습니다.' },
      ],
      early: [
        { trigger: 'count_4plus', text: '같은 방식으로 여러 번 촬영한 기록이 있다면,\n\'우연\'이라는 설명은 수사관에게 통하지 않습니다.' },
        { trigger: 'bodypart_yes', text: '특정 신체 부위를 향한 촬영이 확인되면\n고의 부정 주장은 사실상 받아들여지지 않습니다.' },
        { trigger: 'toilet', text: '화장실·탈의실 촬영은\n처음부터 고의가 전제된 공간으로 취급됩니다.' },
      ],
      forensics: [
        { trigger: 'count_4plus', text: '반복 촬영 패턴이 포렌식으로 확인되면\n고의 입증에 결정적인 증거가 됩니다.' },
      ],
    },
    harm_scale: {
      early: [
        { trigger: 'three_plus', text: '피해자가 3명 이상이면\n특별 가중인자가 적용되어 유형이 상향됩니다.' },
        { trigger: 'two', text: '피해자가 2명이면\n단순 일반 양형 구간을 벗어날 수 있습니다.' },
      ],
      'pre-report': [
        { trigger: 'three_plus', text: '여러 피해자가 있다면\n사건의 성격 자체가 달라집니다.' },
      ],
    },
    circumstance: {
      early: [
        { trigger: 'same_prior', text: '동종 전과가 있다면\n이번 사건에서 집행유예 가능성이 크게 낮아집니다.' },
        { trigger: 'toilet', text: '화장실·탈의실 촬영은\n법원이 가장 중하게 다루는 유형입니다.' },
      ],
    },
  },

  dist: {
    profit: {
      early: [
        { trigger: 'points', text: '포인트 몇 개를 받은 것도\n법원은 \'영리 목적\'으로 볼 수 있습니다.\n이 경우 법정형 하한이 3년으로 올라갑니다.' },
        { trigger: 'cash', text: '현금을 받고 유포했다면\n영리 목적이 명백히 인정되어 법정형 하한 3년이 적용됩니다.' },
      ],
      'pre-indictment': [
        { trigger: 'subscription', text: '구독자를 모은 행위가 영리 목적으로 인정되면\n지금보다 훨씬 무거운 조항이 적용됩니다.' },
      ],
      'pre-report': [
        { trigger: 'points', text: '포인트 수취 기록이 남아 있다면\n수사 시 가장 먼저 확인되는 증거가 됩니다.' },
      ],
    },
    identification: {
      forensics: [
        { trigger: 'telegram_channel', text: '텔레그램이라도, IP와 계정 정보가 남아 있으면\n특정됩니다.' },
        { trigger: 'group_chat', text: '단체방 참여 기록과 업로드 이력은\n계정 특정의 결정적 증거입니다.' },
      ],
      early: [
        { trigger: 'telegram_channel', text: '텔레그램 계정과 활동 이력은\n수사 협조 요청 시 제출됩니다.' },
      ],
    },
    scope: {
      'pre-report': [
        { trigger: 'group_chat', text: '단체방에 한 번 올린 것만으로도\n\'불특정 다수에게 노출된 것\'으로 처리됩니다.' },
        { trigger: 'telegram_channel', text: '채널 업로드는 불특정 다수 대상 유포로\n즉시 법원의 중한 취급을 받습니다.' },
      ],
      early: [
        { trigger: 'group_chat', text: '단체방 유포는 범행 범위를\n법원이 가장 넓게 해석하는 방식입니다.' },
      ],
    },
    deletion: {
      early: [
        { trigger: 'no_delete', text: '삭제하지 않은 채 수사가 진행되면\n피해 지속의 의도가 있는 것으로 볼 수 있습니다.' },
      ],
    },
  },

  poss: {
    awareness: {
      early: [
        { trigger: 'illegal_filename', text: '파일명에 \'몰카\'가 적혀 있었다면,\n\'몰랐다\'는 주장은 받아들여지기 어렵습니다.' },
        { trigger: 'illegal_site', text: '불법촬영물 전문 사이트에서 반복 다운로드한 기록은\n인식 부정 주장을 사실상 차단합니다.' },
      ],
      'pre-report': [
        { trigger: 'illegal_filename', text: '파일명에 불법 표시가 있었다면\n신고 전부터 인식 입증이 완성된 상태입니다.' },
      ],
    },
    quantity: {
      forensics: [
        { trigger: 'over500', text: '수백 개 이상이 확인되면 단순 소지를 넘어\n실형 구간에 진입하는 사례가 있습니다.' },
        { trigger: '100to499', text: '100개 이상이 확인되면\n양형인자상 일반 가중 요인이 적용됩니다.' },
      ],
      early: [
        { trigger: 'over500', text: '500개 이상 소지는\n법원이 단순 소지가 아닌 수집·축적 행위로 봅니다.' },
      ],
    },
    method: {
      'pre-report': [
        { trigger: 'torrent', text: '토렌트로 받았다면, 받는 순간 동시에 배포가 됩니다.\n소지가 아니라 유포까지 같이 문제될 수 있습니다.' },
      ],
      early: [
        { trigger: 'torrent', text: '토렌트 사용 이력이 확인되면\n소지와 유포가 경합범으로 처리될 수 있습니다.' },
      ],
    },
    content_type: {
      early: [
        { trigger: 'minor_included', text: '아동·청소년이 포함된 파일이 있으면\n아청법이 별도로 적용되어 형량이 대폭 상승합니다.' },
      ],
    },
  },

  child: {
    age_certainty: {
      'pre-report': [
        { trigger: 'unclear', text: '외모만으로 성인처럼 보여도,\n실제 미성년자였다면 아청법이 적용됩니다.' },
        { trigger: 'clearly_minor', text: '미성년자임이 명확했다면\n아청법 적용은 거의 확실합니다.' },
      ],
      early: [
        { trigger: 'unclear', text: '연령이 불명확해도 미성년자 판정 시\n아청법이 소급 적용됩니다.' },
      ],
    },
    creation: {
      early: [
        { trigger: 'deepfake', text: 'AI로 합성한 것도 법원은 \'제작\'으로 봅니다.\n이 경우 법정형 하한이 5년입니다.' },
      ],
      'pre-report': [
        { trigger: 'deepfake', text: '딥페이크 합성은 단순 소지가 아니라\n아청법상 제작죄로 처벌됩니다.' },
      ],
    },
    quantity: {
      forensics: [
        { trigger: 'over100', text: '아청법 소지죄는 벌금형이 없습니다.\n1개라도 나오면 징역형 구간부터 시작합니다.' },
        { trigger: '10to99', text: '수십 개 이상이면\n양형기준 가중구간에 진입할 수 있습니다.' },
      ],
    },
    profit: {
      'pre-indictment': [
        { trigger: 'payment', text: '포인트 수취가 영리 목적으로 인정되면\n법정형 하한이 5년으로 올라갑니다.' },
      ],
      early: [
        { trigger: 'payment', text: '금전이나 포인트 수취 기록은\n영리 목적 인정의 핵심 증거입니다.' },
      ],
    },
  },

  deep: {
    purpose: {
      'pre-report': [
        { trigger: 'channel', text: '채널을 만든 것 자체가\n\'반포 목적이 있었다\'는 증거로 쓰입니다.' },
        { trigger: 'distributed', text: '배포 행위가 확인되면\n반포 목적은 별도 입증 없이 인정됩니다.' },
      ],
      early: [
        { trigger: 'channel', text: '채널 운영 이력이 있다면\n수사 초기부터 반포 목적이 전제된 수사가 진행됩니다.' },
      ],
    },
    minor_overlap: {
      early: [
        { trigger: 'minor', text: '피해자가 미성년이면 지금 예상보다\n형량이 수 배 이상 올라갑니다.' },
      ],
      'pre-report': [
        { trigger: 'minor', text: '피해자가 미성년이면\n아청법 제작죄 적용으로 법정형 하한이 5년입니다.' },
      ],
    },
    synthesis_quality: {
      forensics: [
        { trigger: 'identifiable', text: '피해자 얼굴이 명확히 보인다면\n수사가 빠르게 진행될 가능성이 높습니다.' },
      ],
      early: [
        { trigger: 'identifiable', text: '얼굴이 식별 가능한 합성물은\n피해자 진술과 결합해 강력한 증거가 됩니다.' },
      ],
    },
    edit_history: {
      early: [
        { trigger: 'program', text: '딥페이크 프로그램 설치 이력이 있으면\n\'편집하지 않았다\'는 주장은 성립하기 어렵습니다.' },
      ],
      'pre-report': [
        { trigger: 'program', text: '프로그램 설치 이력은\n신고 전이라도 삭제해도 포렌식에서 복원됩니다.' },
      ],
    },
  },

  comm: {
    purpose: {
      early: [
        { trigger: 'sexual_context', text: '보내기 전 대화 내용이 남아 있다면,\n그게 목적을 증명하는 가장 강한 증거가 됩니다.' },
        { trigger: 'just_profanity', text: '욕설이었다고 해도, 성적 내용이 포함됐다면\n법원은 목적을 별도로 판단합니다.' },
      ],
      'pre-report': [
        { trigger: 'sexual_context', text: '맥락 대화가 남아 있다면\n신고 즉시 목적 입증이 완성됩니다.' },
      ],
    },
    repetition: {
      'pre-report': [
        { trigger: 'continued_after_no', text: '거부 의사를 표시한 뒤에도 계속 보냈다면,\n고의 부정은 사실상 불가능합니다.' },
      ],
      early: [
        { trigger: 'ten_plus', text: '10회 이상 전송 기록은\n단순 실수가 아닌 반복적 의도를 증명합니다.' },
        { trigger: 'continued_after_no', text: '거부 후 지속은\n고의와 목적 입증을 동시에 충족시킵니다.' },
      ],
    },
    victim_status: {
      'pre-report': [
        { trigger: 'minor', text: '상대방이 미성년자라면\n성인 대상보다 처벌 수위가 올라갑니다.' },
      ],
      early: [
        { trigger: 'minor', text: '피해자가 미성년이면\n양형기준상 특별 가중인자가 적용됩니다.' },
      ],
    },
  },

  stalk: {
    repetition: {
      early: [
        { trigger: 'twice', text: '딱 2번이었다고 해도,\n비슷한 방식에 짧은 간격이면 반복성이 인정될 수 있습니다.' },
        { trigger: 'many', text: '10회 이상의 반복은\n가중구간 적용의 핵심 근거가 됩니다.' },
      ],
      'pre-report': [
        { trigger: 'justification', text: '정당한 이유가 있었다고 해도,\n상대방이 거부 의사를 표시한 이후는 다릅니다.' },
      ],
    },
    measure_violation: {
      early: [
        { trigger: 'violated', text: '접근금지 명령을 한 번이라도 어겼다면,\n그 시점부터 실형 가능성이 급상승합니다.' },
      ],
      forensics: [
        { trigger: 'violated', text: '잠정조치 위반 이력은\n스토킹 본 사건과 별도 처벌되는 독립 범죄입니다.' },
      ],
    },
    combined_crime: {
      'pre-report': [
        { trigger: 'threat', text: '협박이나 폭행이 함께 있었다면\n스토킹이 아니라 훨씬 무거운 경합범이 됩니다.' },
      ],
      early: [
        { trigger: 'threat', text: '협박 동반 스토킹은\n경합범 가중으로 형량이 대폭 상승합니다.' },
      ],
    },
    escalation: {
      early: [
        { trigger: 'minor', text: '피해자가 미성년이면\n양형기준상 일반 가중인자가 추가 적용됩니다.' },
      ],
    },
  },

  rape: {
    force_level: {
      early: [
        { trigger: 'physical', text: '신체적 폭행을 사용했다는 진술이 나오면\n구성요건 입증이 가장 빠른 속도로 완성됩니다.' },
        { trigger: 'threat', text: '협박이 수단이 됐다면\n문자·통화 기록이 가장 결정적인 증거가 됩니다.' },
      ],
      'pre-report': [
        { trigger: 'physical', text: '폭행 흔적이 피해자 신체에 남아 있다면\n지금 바로 의료기관 진단서를 확보해야 합니다.' },
      ],
    },
    consent_dispute: {
      early: [
        { trigger: 'refused', text: '피해자가 명확히 거부했다는 기록이 있다면\n동의 주장은 사실상 받아들여지지 않습니다.' },
        { trigger: 'claim_consent', text: '동의가 있었다고 주장하려면\n그 근거가 되는 구체적인 정황이 필요합니다.' },
      ],
      'pre-report': [
        { trigger: 'refused', text: '명시적 거부 의사가 있었다면\n그 순간의 대화 기록이 재판의 판세를 결정합니다.' },
      ],
    },
    relationship_factor: {
      early: [
        { trigger: 'family', text: '친족 관계라면 형법이 아닌 특수 규정이 적용됩니다.\n법정형 하한이 7년으로 올라갑니다.' },
      ],
      'pre-report': [
        { trigger: 'stranger', text: '모르는 사람을 대상으로 한 사건이라면\nCCTV·DNA 등 증거 확보가 즉시 시작됩니다.' },
      ],
    },
  },

  quasi_rape: {
    victim_state: {
      early: [
        { trigger: 'drug', text: '약물로 인한 무력 상태라면\n가장 중한 준강간 유형에 해당합니다.' },
        { trigger: 'asleep', text: '수면 중 행위는 피해자 저항 불가를 법원이 전제합니다.' },
      ],
      'pre-report': [
        { trigger: 'drunk', text: '음주 상태 이용은 흔하지만\n법원이 심신상실 인정 여부를 엄격히 판단합니다.' },
      ],
    },
    awareness: {
      early: [
        { trigger: 'knew', text: '상태를 알고 있었다는 정황이 나오면\n고의 부정은 사실상 불가능해집니다.' },
        { trigger: 'claimed_not', text: '\'몰랐다\'는 주장이 통하려면\n당시 상황을 뒷받침하는 강력한 정황이 필요합니다.' },
      ],
    },
  },

  molestation: {
    method_severity: {
      early: [
        { trigger: 'force', text: '폭행을 동반한 추행은\n단순 기습 추행보다 훨씬 무거운 유형으로 분류됩니다.' },
        { trigger: 'repeated', text: '반복·지속 행위가 인정되면\n상습 가중 적용 가능성이 있습니다.' },
      ],
      'pre-report': [
        { trigger: 'surprise', text: '기습 1회성이라도\n강제추행은 성립합니다. 1심 유죄율이 매우 높습니다.' },
      ],
    },
    location: {
      early: [
        { trigger: 'workplace', text: '직장에서 발생했다면\n강제추행 외에 직장내 성희롱 경합도 검토됩니다.' },
      ],
    },
  },

  quasi_molestation: {
    victim_state: {
      early: [
        { trigger: 'asleep', text: '수면 중 추행은\n항거불능 상태 이용으로 구성요건이 명확히 충족됩니다.' },
        { trigger: 'drug', text: '약물·의식 불명 상태 이용은\n준강간에 준하는 중한 취급을 받습니다.' },
      ],
    },
    awareness: {
      early: [
        { trigger: 'knew', text: '상태를 알고 행위했다는 증거가 확보되면\n구성요건 다툼의 여지가 거의 없습니다.' },
        { trigger: 'claimed_not', text: '모른다는 주장을 뒷받침하려면\n현장 상황 증거가 반드시 필요합니다.' },
      ],
    },
  },

  authority: {
    power_severity: {
      early: [
        { trigger: 'medical', text: '의사·치료사 관계는\n법원이 가장 중하게 다루는 위력 유형입니다.' },
        { trigger: 'teacher', text: '교사·강사 관계는\n학교폭력 방지법 등 별도 법률 경합도 검토됩니다.' },
      ],
      'pre-report': [
        { trigger: 'employment', text: '고용 관계 위력은\n직장내 성희롱과 함께 다중 처벌 구조를 만들 수 있습니다.' },
      ],
    },
    method: {
      early: [
        { trigger: 'authority', text: '직위·권한을 직접 이용한 위력이 인정되면\n행위자가 부정하더라도 객관적 지위로 판단됩니다.' },
        { trigger: 'deception', text: '위계(속임수)는 위력보다 상대적으로 경하지만\n피해자 진술만으로도 유죄 인정 사례가 많습니다.' },
      ],
    },
  },

  workplace: {
    act_severity: {
      early: [
        { trigger: 'physical', text: '신체 접촉이 있었다면\n직장내 성희롱이 아닌 강제추행 혐의로 격상될 수 있습니다.' },
        { trigger: 'demand', text: '성적 제안·요구는\n위계·위력 추행 경합 여부도 함께 검토됩니다.' },
      ],
      'pre-report': [
        { trigger: 'visual', text: '성적 영상·사진 전송 기록은\n그 자체로 통신매체이용음란죄가 경합될 수 있습니다.' },
      ],
    },
    repetition: {
      early: [
        { trigger: 'long_term', text: '장기간 지속됐다면\n피해자가 고용환경 악화로 인한 불이익을 추가 청구할 수 있습니다.' },
      ],
    },
  },
}

function getAnswerKey(answers: Record<string, string>, crimeId: CrimeType): Record<string, string> {
  const prefix = `${crimeId}:`
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(answers)) {
    if (k.startsWith(prefix)) result[k.slice(prefix.length)] = v
  }
  return result
}

function buildTriggers(crimeId: CrimeType, crimeAnswers: Record<string, string>): string[] {
  const triggers: string[] = []

  if (crimeId === 'cam') {
    if (crimeAnswers['q_file'] === 'deleted') triggers.push('deleted')
    if (crimeAnswers['q_file'] === 'have') triggers.push('have')
    if (crimeAnswers['q_file'] === 'shared') triggers.push('shared')
    if (crimeAnswers['q_evidence'] === 'witness_only') triggers.push('witness_only')
    if (crimeAnswers['q_evidence'] === 'digital') triggers.push('digital')
    if (crimeAnswers['q_bodypart'] === 'yes') triggers.push('bodypart_yes')
    if (crimeAnswers['q_count'] === '4plus') triggers.push('count_4plus')
    if (crimeAnswers['q_count'] === 'few') triggers.push('count_few')
    if (crimeAnswers['q_location'] === 'toilet') triggers.push('toilet')
    if (crimeAnswers['q_victims'] === 'three_plus') triggers.push('three_plus')
    if (crimeAnswers['q_victims'] === 'two') triggers.push('two')
    if (crimeAnswers['q_prior'] === 'same_crime') triggers.push('same_prior')
  } else if (crimeId === 'dist') {
    if (crimeAnswers['q_platform'] === 'telegram_channel') triggers.push('telegram_channel')
    if (crimeAnswers['q_platform'] === 'group_chat') triggers.push('group_chat')
    if (crimeAnswers['q_payment'] === 'points') triggers.push('points')
    if (crimeAnswers['q_payment'] === 'cash') triggers.push('cash')
    if (crimeAnswers['q_subscription'] === 'yes') triggers.push('subscription')
    if (crimeAnswers['q_delete'] === 'no') triggers.push('no_delete')
  } else if (crimeId === 'poss') {
    if (crimeAnswers['q_filename'] === 'yes_illegal') triggers.push('illegal_filename')
    if (crimeAnswers['q_source'] === 'illegal_site') triggers.push('illegal_site')
    if (crimeAnswers['q_source'] === 'torrent') triggers.push('torrent')
    if (crimeAnswers['q_count'] === 'over500') triggers.push('over500')
    if (crimeAnswers['q_count'] === '100to499') triggers.push('100to499')
    if (crimeAnswers['q_minor'] === 'yes') triggers.push('minor_included')
  } else if (crimeId === 'child') {
    if (crimeAnswers['q_age'] === 'unclear') triggers.push('unclear')
    if (crimeAnswers['q_age'] === 'clearly_minor') triggers.push('clearly_minor')
    if (crimeAnswers['q_deepfake'] === 'yes') triggers.push('deepfake')
    if (crimeAnswers['q_count'] === 'over100') triggers.push('over100')
    if (crimeAnswers['q_count'] === '10to99') triggers.push('10to99')
    if (crimeAnswers['q_payment'] === 'yes') triggers.push('payment')
  } else if (crimeId === 'deep') {
    if (crimeAnswers['q_channel'] === 'yes') triggers.push('channel')
    if (crimeAnswers['q_minor'] === 'yes_unclear') triggers.push('minor')
    if (crimeAnswers['q_face'] === 'identifiable') triggers.push('identifiable')
    if (crimeAnswers['q_program'] === 'yes') triggers.push('program')
    if (crimeAnswers['q_distribute'] === 'yes') triggers.push('distributed')
  } else if (crimeId === 'comm') {
    if (crimeAnswers['q_context'] === 'sexual') triggers.push('sexual_context')
    if (crimeAnswers['q_continued'] === 'yes') triggers.push('continued_after_no')
    if (crimeAnswers['q_claim'] === 'just_profanity') triggers.push('just_profanity')
    if (crimeAnswers['q_minor'] === 'yes_unclear') triggers.push('minor')
    if (crimeAnswers['q_count'] === 'ten_plus') triggers.push('ten_plus')
  } else if (crimeId === 'stalk') {
    if (crimeAnswers['q_acts'] === 'twice') triggers.push('twice')
    if (crimeAnswers['q_acts'] === 'many') triggers.push('many')
    if (crimeAnswers['q_violation'] === 'yes') triggers.push('violated')
    if (crimeAnswers['q_threat'] === 'yes') triggers.push('threat')
    if (crimeAnswers['q_claim'] === 'yes') triggers.push('justification')
    if (crimeAnswers['q_minor'] === 'yes') triggers.push('minor')
  } else if (crimeId === 'rape') {
    if (crimeAnswers['q_force'] === 'physical') triggers.push('physical')
    if (crimeAnswers['q_force'] === 'threat') triggers.push('threat')
    if (crimeAnswers['q_relationship'] === 'family') triggers.push('family')
    if (crimeAnswers['q_relationship'] === 'stranger') triggers.push('stranger')
    if (crimeAnswers['q_consent'] === 'refused') triggers.push('refused')
    if (crimeAnswers['q_consent'] === 'claim_consent') triggers.push('claim_consent')
    if (crimeAnswers['q_evidence'] === 'cctv') triggers.push('cctv')
    if (crimeAnswers['q_evidence'] === 'chat') triggers.push('chat')
  } else if (crimeId === 'quasi_rape') {
    if (crimeAnswers['q_state'] === 'drunk') triggers.push('drunk')
    if (crimeAnswers['q_state'] === 'asleep') triggers.push('asleep')
    if (crimeAnswers['q_state'] === 'drug') triggers.push('drug')
    if (crimeAnswers['q_awareness'] === 'knew') triggers.push('knew')
    if (crimeAnswers['q_awareness'] === 'claimed_not') triggers.push('claimed_not')
  } else if (crimeId === 'molestation') {
    if (crimeAnswers['q_method'] === 'surprise') triggers.push('surprise')
    if (crimeAnswers['q_method'] === 'force') triggers.push('force')
    if (crimeAnswers['q_method'] === 'repeated') triggers.push('repeated')
    if (crimeAnswers['q_location'] === 'workplace') triggers.push('workplace')
    if (crimeAnswers['q_relationship'] === 'work') triggers.push('work')
  } else if (crimeId === 'quasi_molestation') {
    if (crimeAnswers['q_state'] === 'drunk') triggers.push('drunk')
    if (crimeAnswers['q_state'] === 'asleep') triggers.push('asleep')
    if (crimeAnswers['q_state'] === 'drug') triggers.push('drug')
    if (crimeAnswers['q_awareness'] === 'knew') triggers.push('knew')
    if (crimeAnswers['q_awareness'] === 'claimed_not') triggers.push('claimed_not')
    if (crimeAnswers['q_acts'] === 'multiple') triggers.push('multiple')
  } else if (crimeId === 'authority') {
    if (crimeAnswers['q_method'] === 'deception') triggers.push('deception')
    if (crimeAnswers['q_method'] === 'authority') triggers.push('authority')
    if (crimeAnswers['q_relationship'] === 'employment') triggers.push('employment')
    if (crimeAnswers['q_relationship'] === 'teacher') triggers.push('teacher')
    if (crimeAnswers['q_relationship'] === 'medical') triggers.push('medical')
    if (crimeAnswers['q_duration'] === 'repeated') triggers.push('repeated')
  } else if (crimeId === 'workplace') {
    if (crimeAnswers['q_type'] === 'physical') triggers.push('physical')
    if (crimeAnswers['q_type'] === 'verbal') triggers.push('verbal')
    if (crimeAnswers['q_type'] === 'visual') triggers.push('visual')
    if (crimeAnswers['q_type'] === 'demand') triggers.push('demand')
    if (crimeAnswers['q_position'] === 'superior') triggers.push('superior')
    if (crimeAnswers['q_duration'] === 'long') triggers.push('long_term')
    if (crimeAnswers['q_duration'] === 'repeated') triggers.push('repeated')
  }
  return triggers
}

export function getHeadline(
  crimeId: CrimeType,
  dimensionId: string,
  stage: Stage,
  answers: Record<string, string>
): string {
  const crimeAnswers = getAnswerKey(answers, crimeId)
  const triggers = buildTriggers(crimeId, crimeAnswers)
  const crimeMap = HEADLINES[crimeId]
  if (!crimeMap) return ''
  const dimMap = crimeMap[dimensionId]
  if (!dimMap) return ''

  const stageEntries = dimMap[stage]
  if (stageEntries) {
    for (const entry of stageEntries) {
      if (triggers.includes(entry.trigger)) return entry.text
    }
    // Return first entry as default for this stage
    if (stageEntries.length > 0) return stageEntries[0].text
  }

  // Fallback to any stage
  for (const entries of Object.values(dimMap)) {
    if (entries && entries.length > 0) {
      for (const entry of entries) {
        if (triggers.includes(entry.trigger)) return entry.text
      }
    }
  }
  return ''
}

export function getBestHeadline(
  crimeId: CrimeType,
  stage: Stage,
  answers: Record<string, string>
): { dimension: string; text: string } | null {
  const crimeAnswers = getAnswerKey(answers, crimeId)
  const triggers = buildTriggers(crimeId, crimeAnswers)
  const crimeMap = HEADLINES[crimeId]
  if (!crimeMap) return null

  // Priority: match trigger at current stage
  for (const [dimId, dimMap] of Object.entries(crimeMap)) {
    const stageEntries = dimMap[stage]
    if (stageEntries) {
      for (const entry of stageEntries) {
        if (triggers.includes(entry.trigger)) {
          return { dimension: dimId, text: entry.text }
        }
      }
    }
  }

  // Fallback: first headline at this stage
  for (const [dimId, dimMap] of Object.entries(crimeMap)) {
    const stageEntries = dimMap[stage]
    if (stageEntries && stageEntries.length > 0) {
      return { dimension: dimId, text: stageEntries[0].text }
    }
  }

  // Fallback: any headline
  for (const [dimId, dimMap] of Object.entries(crimeMap)) {
    for (const entries of Object.values(dimMap)) {
      if (entries && entries.length > 0) {
        return { dimension: dimId, text: entries[0].text }
      }
    }
  }
  return null
}
