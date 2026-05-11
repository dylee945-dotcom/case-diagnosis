import type { CrimeConfig, RiskLevel } from '../types'

function a(prefix: string, all: Record<string, string>) {
  const r: Record<string, string> = {}
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix)) r[k.slice(prefix.length)] = v
  }
  return r
}

function sc(vals: number[]): RiskLevel {
  const t = vals.reduce((s, v) => s + v, 0)
  if (t >= 4) return 3
  if (t >= 3) return 2
  if (t >= 1) return 1
  return 0
}

export const CRIMES: CrimeConfig[] = [
  // ──────────────────────────────────────────
  // 1. 카메라등이용촬영
  // ──────────────────────────────────────────
  {
    id: 'cam',
    name: '카메라등이용촬영',
    shortName: '불법촬영',
    law: '성폭력처벌법 제14조',
    questions: [
      { id: 'q_location', text: '촬영 장소가 어디였나요?',
        options: [
          { value: 'toilet', label: '화장실 또는 탈의실' },
          { value: 'bedroom', label: '침실 등 사적 공간' },
          { value: 'public', label: '공공장소 (지하철·공원 등)' },
          { value: 'other', label: '기타' },
        ]},
      { id: 'q_count', text: '촬영 횟수는 어느 정도인가요?',
        options: [
          { value: 'once', label: '1회' },
          { value: 'few', label: '2~3회' },
          { value: '4plus', label: '4회 이상' },
        ]},
      { id: 'q_bodypart', text: '촬영된 내용이 신체 부위를 향했나요?',
        subtext: '성적 수치심을 유발하는 신체 부위 기준',
        options: [
          { value: 'yes', label: '예, 해당 부위 포함됨' },
          { value: 'no', label: '아니오 / 불명확' },
        ]},
      { id: 'q_file', text: '현재 촬영 파일의 상태는?',
        options: [
          { value: 'have', label: '기기에 보관 중' },
          { value: 'deleted', label: '삭제했음' },
          { value: 'shared', label: '전송하거나 공유했음' },
        ]},
      { id: 'q_evidence', text: '현재 확인된 증거 수준은?',
        options: [
          { value: 'none', label: '없음 (신고 전)' },
          { value: 'witness_only', label: '목격자 진술만 있음' },
          { value: 'digital', label: '디지털 증거 있음 (기기·파일 등)' },
        ]},
      { id: 'q_victims', text: '피해자가 몇 명인가요?',
        options: [
          { value: 'one', label: '1명' },
          { value: 'two', label: '2명' },
          { value: 'three_plus', label: '3명 이상' },
        ]},
      { id: 'q_prior', text: '동종(성범죄) 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'same_crime', label: '동종 전과 있음' },
          { value: 'other', label: '이종 전과만 있음' },
        ]},
      { id: 'q_settlement', text: '피해자와 합의 진행 여부는?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'ongoing', label: '합의 진행 중' },
          { value: 'done', label: '합의 완료 (처벌불원 확보)' },
        ]},
    ],
    dimensions: [
      { id: 'evidence', name: '증거 강도', description: '수사기관이 확보 가능한 증거의 수준',
        scoringFn: (all) => { const v = a('cam:', all); return sc([v['q_file']==='have'?2:0, v['q_file']==='shared'?2:0, v['q_evidence']==='digital'?2:0, v['q_evidence']==='witness_only'?1:0]) }},
      { id: 'intent', name: '고의 입증', description: '우연이 아닌 고의임을 입증할 수 있는 정도',
        scoringFn: (all) => { const v = a('cam:', all); return sc([v['q_bodypart']==='yes'?2:0, v['q_count']==='4plus'?2:0, v['q_count']==='few'?1:0, v['q_location']==='toilet'?2:0]) }},
      { id: 'harm_scale', name: '피해 규모', description: '피해자 수 및 피해 범위',
        scoringFn: (all) => { const v = a('cam:', all); return sc([v['q_victims']==='three_plus'?3:0, v['q_victims']==='two'?2:0, v['q_count']==='4plus'?1:0]) }},
      { id: 'circumstance', name: '상황 가중', description: '전과·장소·반복성 등 양형 가중 요인',
        scoringFn: (all) => { const v = a('cam:', all); return sc([v['q_prior']==='same_crime'?3:0, v['q_location']==='toilet'?2:0, v['q_count']==='4plus'?1:0, v['q_file']==='deleted'?1:0]) }},
      { id: 'mitigation', name: '감경 여지 부족', description: '합의·초범·미유포 등 감경 요인이 적을수록 위험',
        scoringFn: (all) => { const v = a('cam:', all); const m = [v['q_prior']==='none', v['q_settlement']==='done', v['q_file']!=='shared'].filter(Boolean).length; return (m===3?0:m===2?1:m===1?2:3) as RiskLevel }},
    ],
  },

  // ──────────────────────────────────────────
  // 2. 불법촬영물 유포
  // ──────────────────────────────────────────
  {
    id: 'dist',
    name: '불법촬영물 유포',
    shortName: '불법유포',
    law: '성폭력처벌법 제14조 제2·3항',
    questions: [
      { id: 'q_platform', text: '어떤 방식으로 유포했나요?',
        options: [
          { value: 'telegram_channel', label: '텔레그램 채널 (불특정 다수)' },
          { value: 'group_chat', label: '단체방 (오픈 채팅 등)' },
          { value: 'dm', label: '개인 메시지 (1:1 전송)' },
          { value: 'sns', label: 'SNS·커뮤니티' },
        ]},
      { id: 'q_payment', text: '포인트나 금전을 받은 적 있나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'points', label: '포인트 수취' },
          { value: 'cash', label: '현금·계좌 수취' },
        ]},
      { id: 'q_subscription', text: '구독자나 회원을 모집한 활동이 있었나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '있었음' },
        ]},
      { id: 'q_delete', text: '현재 유포 콘텐츠를 삭제했나요?',
        options: [
          { value: 'no', label: '삭제하지 않았음' },
          { value: 'immediate', label: '자발적으로 즉시 삭제했음' },
          { value: 'after_request', label: '피해자 요청 후 삭제했음' },
        ]},
      { id: 'q_duration', text: '유포가 이루어진 기간은?',
        options: [
          { value: 'once', label: '1회성' },
          { value: 'short', label: '수 주~수 개월' },
          { value: 'long', label: '장기간 (6개월 이상)' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'profit', name: '영리 목적', description: '포인트·금전 수취, 구독자 모집 등 영리 목적 인정 가능성',
        scoringFn: (all) => { const v = a('dist:', all); return sc([v['q_payment']==='cash'?3:0, v['q_payment']==='points'?2:0, v['q_subscription']==='yes'?2:0]) }},
      { id: 'identification', name: '행위자 특정', description: '수사기관이 행위자를 특정할 수 있는 가능성',
        scoringFn: (all) => { const v = a('dist:', all); return sc([v['q_platform']==='telegram_channel'?2:0, v['q_payment']!=='no'?2:0, v['q_subscription']==='yes'?1:0]) }},
      { id: 'scope', name: '유포 범위', description: '불특정 다수 노출 여부 및 피해 확산 정도',
        scoringFn: (all) => { const v = a('dist:', all); return sc([v['q_platform']==='telegram_channel'?3:0, v['q_platform']==='group_chat'?2:0, v['q_platform']==='sns'?2:0, v['q_duration']==='long'?1:0]) }},
      { id: 'ongoing_harm', name: '피해 지속성', description: '피해가 현재도 지속되고 있는지',
        scoringFn: (all) => { const v = a('dist:', all); return sc([v['q_delete']==='no'?3:0, v['q_duration']==='long'?2:0, v['q_platform']==='telegram_channel'?1:0]) }},
      { id: 'culpability', name: '고의·악의성', description: '전과·반복성·영리 목적 종합 악의성',
        scoringFn: (all) => { const v = a('dist:', all); return sc([v['q_prior']==='yes'?2:0, v['q_duration']==='long'?2:0, v['q_payment']!=='no'?1:0, v['q_delete']==='no'?1:0]) }},
    ],
  },

  // ──────────────────────────────────────────
  // 3. 불법촬영물 소지·시청
  // ──────────────────────────────────────────
  {
    id: 'poss',
    name: '불법촬영물 소지·시청',
    shortName: '소지·시청',
    law: '성폭력처벌법 제14조 제4항',
    questions: [
      { id: 'q_source', text: '파일을 어떻게 취득했나요?',
        options: [
          { value: 'torrent', label: '토렌트 다운로드' },
          { value: 'illegal_site', label: '전문 불법 사이트 반복 다운로드' },
          { value: 'link', label: '링크·공유를 통해 받음' },
          { value: 'own_filming', label: '직접 촬영한 것' },
        ]},
      { id: 'q_filename', text: '파일명에 불법 촬영물임을 나타내는 표시가 있었나요?',
        subtext: "'몰카', '불법', '훔쳐보기' 등",
        options: [
          { value: 'yes_illegal', label: '예, 파일명에 명시됨' },
          { value: 'no_unclear', label: '아니오 / 불분명했음' },
        ]},
      { id: 'q_count', text: '소지·시청한 파일 수는?',
        options: [
          { value: 'under10', label: '10개 미만' },
          { value: '10to99', label: '10~99개' },
          { value: '100to499', label: '100~499개' },
          { value: 'over500', label: '500개 이상' },
        ]},
      { id: 'q_minor', text: '파일 중 아동·청소년이 포함되어 있나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '포함되어 있거나 의심됨' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'awareness', name: '불법 인식', description: '파일이 불법 촬영물임을 인식하고 있었을 가능성',
        scoringFn: (all) => { const v = a('poss:', all); return sc([v['q_filename']==='yes_illegal'?3:0, v['q_source']==='illegal_site'?2:0, v['q_source']==='torrent'?1:0]) }},
      { id: 'quantity', name: '소지 수량', description: '파일 수에 따른 양형 가중 정도',
        scoringFn: (all) => { const v = a('poss:', all); if(v['q_count']==='over500')return 3; if(v['q_count']==='100to499')return 2; if(v['q_count']==='10to99')return 1; return 0 }},
      { id: 'method', name: '취득 방법 위험', description: '토렌트·불법 사이트 등 취득 방법의 법적 위험',
        scoringFn: (all) => { const v = a('poss:', all); return sc([v['q_source']==='torrent'?3:0, v['q_source']==='illegal_site'?2:0, v['q_source']==='own_filming'?3:0]) }},
      { id: 'content_severity', name: '내용 심각성', description: '아동·청소년 포함 여부에 따른 법률 적용 수준',
        scoringFn: (all) => { const v = a('poss:', all); return v['q_minor']==='yes'?3:0 }},
      { id: 'recidivism', name: '재범·전과', description: '전과 여부가 양형에 미치는 영향',
        scoringFn: (all) => { const v = a('poss:', all); return v['q_prior']==='yes'?3:0 }},
    ],
  },

  // ──────────────────────────────────────────
  // 4. 아동·청소년 성착취물
  // ──────────────────────────────────────────
  {
    id: 'child',
    name: '아동·청소년 성착취물',
    shortName: '아청법',
    law: '아청법 제11조',
    questions: [
      { id: 'q_age', text: '파일 내 인물의 연령이 어떻게 확인되었나요?',
        options: [
          { value: 'looked_adult', label: '성인으로 보였음' },
          { value: 'clearly_minor', label: '미성년자임이 명확했음' },
          { value: 'unclear', label: '불명확했음' },
        ]},
      { id: 'q_deepfake', text: '딥페이크·AI 합성 파일이 포함되어 있나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_count', text: '소지·시청·취득한 파일 수는?',
        options: [
          { value: 'under10', label: '1~9개' },
          { value: '10to99', label: '10~99개' },
          { value: 'over100', label: '100개 이상' },
        ]},
      { id: 'q_payment', text: '포인트나 금전을 받고 공유한 적 있나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '있었음' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'age_certainty', name: '연령 인식', description: '미성년자임을 알았거나 알 수 있었던 가능성',
        scoringFn: (all) => { const v = a('child:', all); if(v['q_age']==='clearly_minor')return 3; if(v['q_age']==='unclear')return 2; return 1 }},
      { id: 'creation', name: '제작 해당 여부', description: '딥페이크 합성이 아청법상 제작죄에 해당하는지',
        scoringFn: (all) => { const v = a('child:', all); return v['q_deepfake']==='yes'?3:0 }},
      { id: 'quantity', name: '소지 수량', description: '파일 수에 따른 양형 구간',
        scoringFn: (all) => { const v = a('child:', all); if(v['q_count']==='over100')return 3; if(v['q_count']==='10to99')return 2; return 1 }},
      { id: 'profit', name: '영리성', description: '포인트·금전 수취로 영리 목적 인정 가능성',
        scoringFn: (all) => { const v = a('child:', all); return v['q_payment']==='yes'?3:0 }},
      { id: 'severity', name: '전체 중대성', description: '법정형 수준 (소지에서 제작까지)',
        scoringFn: (all) => { const v = a('child:', all); return sc([v['q_deepfake']==='yes'?3:0, v['q_payment']==='yes'?2:0, v['q_count']==='over100'?1:0, v['q_prior']==='yes'?1:0]) }},
    ],
  },

  // ──────────────────────────────────────────
  // 5. 딥페이크 성범죄
  // ──────────────────────────────────────────
  {
    id: 'deep',
    name: '딥페이크 성범죄',
    shortName: '딥페이크',
    law: '성폭력처벌법 제14조의2',
    questions: [
      { id: 'q_channel', text: '채널이나 계정을 운영하며 배포했나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '채널·계정을 운영하며 배포했음' },
        ]},
      { id: 'q_minor', text: '피해자가 미성년자인가요?',
        options: [
          { value: 'no', label: '아니오 (성인)' },
          { value: 'yes_unclear', label: '예, 또는 불확실함' },
        ]},
      { id: 'q_face', text: '합성물에서 피해자 얼굴이 식별 가능한가요?',
        options: [
          { value: 'unclear', label: '불명확 / 인위적 합성임이 분명' },
          { value: 'identifiable', label: '명확히 식별 가능' },
        ]},
      { id: 'q_program', text: '딥페이크 프로그램 설치 이력이 있나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_distribute', text: '합성물을 배포(반포)했나요?',
        options: [
          { value: 'no', label: '제작만 했음 (배포 없음)' },
          { value: 'yes', label: '배포했음' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'purpose', name: '반포 목적', description: '배포 목적이 있었는지',
        scoringFn: (all) => { const v = a('deep:', all); return sc([v['q_channel']==='yes'?3:0, v['q_distribute']==='yes'?2:0]) }},
      { id: 'minor_overlap', name: '아청법 경합', description: '피해자 미성년 시 형량 급상승',
        scoringFn: (all) => { const v = a('deep:', all); return v['q_minor']==='yes_unclear'?3:0 }},
      { id: 'synthesis_quality', name: '합성 수준', description: '얼굴 식별 가능성과 피해자 특정 위험',
        scoringFn: (all) => { const v = a('deep:', all); return v['q_face']==='identifiable'?3:1 }},
      { id: 'edit_history', name: '편집 이력', description: '프로그램 설치 이력 등 제작 증거',
        scoringFn: (all) => { const v = a('deep:', all); return v['q_program']==='yes'?3:0 }},
      { id: 'scope', name: '배포 범위', description: '채널 운영, 불특정 다수 배포 등',
        scoringFn: (all) => { const v = a('deep:', all); return sc([v['q_channel']==='yes'?3:0, v['q_distribute']==='yes'?2:0, v['q_prior']==='yes'?1:0]) }},
    ],
  },

  // ──────────────────────────────────────────
  // 6. 통신매체이용음란
  // ──────────────────────────────────────────
  {
    id: 'comm',
    name: '통신매체이용음란',
    shortName: '통신음란',
    law: '성폭력처벌법 제13조',
    questions: [
      { id: 'q_context', text: '전송 전후 대화가 성적 내용을 포함했나요?',
        options: [
          { value: 'sexual', label: '예, 성적 맥락의 대화가 있었음' },
          { value: 'no', label: '아니오 / 일반 대화였음' },
        ]},
      { id: 'q_continued', text: '상대방이 거부 의사를 표시한 후에도 계속 보냈나요?',
        options: [
          { value: 'no', label: '아니오 (거부 없었거나 1회만)' },
          { value: 'yes', label: '예, 거부 후에도 계속 보냈음' },
        ]},
      { id: 'q_claim', text: '전송 내용의 성격을 어떻게 설명할 것인가요?',
        options: [
          { value: 'sexual', label: '성적 내용이었음 (인정)' },
          { value: 'just_profanity', label: '욕설이었을 뿐이라고 주장할 것' },
        ]},
      { id: 'q_minor', text: '상대방(피해자)이 미성년자인가요?',
        options: [
          { value: 'no', label: '아니오 (성인)' },
          { value: 'yes_unclear', label: '예, 또는 불확실함' },
        ]},
      { id: 'q_count', text: '전송 횟수는?',
        options: [
          { value: 'one_two', label: '1~2회' },
          { value: 'three_nine', label: '3~9회' },
          { value: 'ten_plus', label: '10회 이상' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'purpose', name: '목적 입증', description: '성적 수치심을 줄 목적 입증 가능성',
        scoringFn: (all) => { const v = a('comm:', all); return sc([v['q_context']==='sexual'?2:0, v['q_claim']==='just_profanity'?-1:0, v['q_continued']==='yes'?1:0]) }},
      { id: 'repetition', name: '반복성', description: '전송 횟수와 거부 후 지속 여부',
        scoringFn: (all) => { const v = a('comm:', all); return sc([v['q_count']==='ten_plus'?3:0, v['q_count']==='three_nine'?1:0, v['q_continued']==='yes'?2:0]) }},
      { id: 'victim_status', name: '피해자 취약성', description: '미성년자 피해자 여부에 따른 가중',
        scoringFn: (all) => { const v = a('comm:', all); return v['q_minor']==='yes_unclear'?3:0 }},
      { id: 'defense', name: '방어 어려움', description: "'고의 없다' 주장이 받아들여질 가능성 (높을수록 불리)",
        scoringFn: (all) => { const v = a('comm:', all); return sc([v['q_context']==='sexual'?2:0, v['q_continued']==='yes'?2:0, v['q_count']==='ten_plus'?1:0]) }},
      { id: 'prior', name: '전과 위험', description: '동종 전과에 따른 처벌 수준',
        scoringFn: (all) => { const v = a('comm:', all); return v['q_prior']==='yes'?3:0 }},
    ],
  },

  // ──────────────────────────────────────────
  // 7. 스토킹
  // ──────────────────────────────────────────
  {
    id: 'stalk',
    name: '스토킹',
    shortName: '스토킹',
    law: '스토킹처벌법 제18조',
    questions: [
      { id: 'q_acts', text: '동일 유형의 스토킹 행위가 몇 회 있었나요?',
        options: [
          { value: 'twice', label: '딱 2회' },
          { value: 'few', label: '3~9회' },
          { value: 'many', label: '10회 이상' },
        ]},
      { id: 'q_violation', text: '법원의 접근금지(잠정조치) 명령을 위반한 적 있나요?',
        options: [
          { value: 'no', label: '없음 (명령이 없었거나 위반 없음)' },
          { value: 'yes', label: '예, 접근금지 등 명령을 위반했음' },
        ]},
      { id: 'q_threat', text: '협박이나 폭행을 동반했나요?',
        options: [
          { value: 'no', label: '없음' },
          { value: 'yes', label: '협박 또는 폭행이 있었음' },
        ]},
      { id: 'q_claim', text: '정당한 이유가 있었다고 주장할 것인가요?',
        options: [
          { value: 'no', label: '아니오' },
          { value: 'yes', label: '예, 정당한 이유가 있었음' },
        ]},
      { id: 'q_minor', text: '피해자가 미성년자인가요?',
        options: [
          { value: 'no', label: '아니오 (성인)' },
          { value: 'yes', label: '예' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'repetition', name: '반복성', description: '행위 횟수와 패턴',
        scoringFn: (all) => { const v = a('stalk:', all); if(v['q_acts']==='many')return 3; if(v['q_acts']==='few')return 2; return 1 }},
      { id: 'measure_violation', name: '잠정조치 위반', description: '접근금지 명령 위반에 따른 실형 가능성',
        scoringFn: (all) => { const v = a('stalk:', all); return v['q_violation']==='yes'?3:0 }},
      { id: 'combined', name: '경합 범죄', description: '협박·폭행 동반 시 가중 처벌',
        scoringFn: (all) => { const v = a('stalk:', all); return v['q_threat']==='yes'?3:0 }},
      { id: 'justification', name: '방어 어려움', description: '정당화 주장이 받아들여질 가능성',
        scoringFn: (all) => { const v = a('stalk:', all); if(v['q_claim']==='yes'&&v['q_acts']==='many')return 2; if(v['q_claim']==='yes')return 1; return 2 }},
      { id: 'escalation', name: '위험 상승 요인', description: '미성년 피해자, 전과 등 상황 악화 요인',
        scoringFn: (all) => { const v = a('stalk:', all); return sc([v['q_minor']==='yes'?2:0, v['q_prior']==='yes'?2:0, v['q_violation']==='yes'?1:0]) }},
    ],
  },

  // ──────────────────────────────────────────
  // 8. 강간
  // ──────────────────────────────────────────
  {
    id: 'rape',
    name: '강간',
    shortName: '강간',
    law: '형법 제297조',
    questions: [
      { id: 'q_force', text: '폭행이나 협박을 사용했나요?',
        options: [
          { value: 'physical', label: '신체적 폭행을 사용했음' },
          { value: 'threat', label: '협박(위협)을 사용했음' },
          { value: 'none', label: '사용하지 않았음' },
        ]},
      { id: 'q_relationship', text: '피해자와의 관계는?',
        options: [
          { value: 'stranger', label: '모르는 사람' },
          { value: 'acquaintance', label: '아는 사람 (지인, 동료)' },
          { value: 'partner', label: '연인 또는 전 연인' },
          { value: 'family', label: '가족 또는 친족' },
        ]},
      { id: 'q_consent', text: '당시 피해자의 의사 표현 상황은?',
        options: [
          { value: 'refused', label: '명확히 거부 의사를 표현했음' },
          { value: 'unclear', label: '의사 표현이 불명확했음' },
          { value: 'claim_consent', label: '동의가 있었다고 주장' },
        ]},
      { id: 'q_evidence', text: '디지털 증거나 목격자가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'chat', label: '이전 대화 기록 있음' },
          { value: 'cctv', label: 'CCTV 또는 목격자 있음' },
        ]},
      { id: 'q_prior', text: '동종(성범죄) 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_settlement', text: '피해자와 합의 여부는?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'ongoing', label: '진행 중' },
          { value: 'done', label: '합의 완료' },
        ]},
    ],
    dimensions: [
      { id: 'force_level', name: '폭행·협박 강도', description: '폭행·협박 사용 여부 및 수준',
        scoringFn: (all) => { const v = a('rape:', all); if(v['q_force']==='physical')return 3; if(v['q_force']==='threat')return 2; return 1 }},
      { id: 'consent_dispute', name: '동의 주장 가능성', description: '피해자 동의가 없었음이 입증되는 정도',
        scoringFn: (all) => { const v = a('rape:', all); if(v['q_consent']==='refused')return 3; if(v['q_consent']==='unclear')return 2; return 1 }},
      { id: 'evidence', name: '증거 강도', description: '현재 수사기관이 확보할 수 있는 증거 수준',
        scoringFn: (all) => { const v = a('rape:', all); if(v['q_evidence']==='cctv')return 3; if(v['q_evidence']==='chat')return 2; return 1 }},
      { id: 'relationship_factor', name: '관계 가중', description: '친족·기습 등 관계에 따른 가중 여부',
        scoringFn: (all) => { const v = a('rape:', all); if(v['q_relationship']==='family')return 3; if(v['q_relationship']==='stranger')return 2; return 1 }},
      { id: 'mitigation', name: '감경 여지', description: '합의·초범 등 감경 가능 요인',
        scoringFn: (all) => { const v = a('rape:', all); const m = [v['q_prior']==='none', v['q_settlement']==='done'].filter(Boolean).length; return (m===2?0:m===1?1:3) as RiskLevel }},
    ],
  },

  // ──────────────────────────────────────────
  // 9. 준강간
  // ──────────────────────────────────────────
  {
    id: 'quasi_rape',
    name: '준강간',
    shortName: '준강간',
    law: '형법 제299조',
    questions: [
      { id: 'q_state', text: '피해자가 어떤 상태였나요?',
        options: [
          { value: 'drunk', label: '음주로 인한 심신 장애 상태' },
          { value: 'asleep', label: '수면 또는 의식 불명 상태' },
          { value: 'drug', label: '약물로 인한 장애 상태' },
        ]},
      { id: 'q_awareness', text: '피해자의 그 상태를 인지하고 있었나요?',
        options: [
          { value: 'knew', label: '알고 있었음' },
          { value: 'claimed_not', label: '몰랐다고 주장할 것' },
        ]},
      { id: 'q_evidence', text: '당시 상황의 증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'chat', label: '당일 연락 기록' },
          { value: 'cctv', label: 'CCTV 또는 영상 증거' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_settlement', text: '합의 여부는?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'done', label: '합의 완료' },
        ]},
    ],
    dimensions: [
      { id: 'victim_state', name: '피해자 상태 중대성', description: '피해자의 무력 상태 정도',
        scoringFn: (all) => { const v = a('quasi_rape:', all); if(v['q_state']==='asleep'||v['q_state']==='drug')return 3; return 2 }},
      { id: 'awareness', name: '고의 인식 가능성', description: '상태를 알고 있었음이 인정될 가능성',
        scoringFn: (all) => { const v = a('quasi_rape:', all); return v['q_awareness']==='knew'?3:1 }},
      { id: 'evidence', name: '증거 강도', description: '현재 수사기관이 확보할 수 있는 증거',
        scoringFn: (all) => { const v = a('quasi_rape:', all); if(v['q_evidence']==='cctv')return 3; if(v['q_evidence']==='chat')return 2; return 1 }},
      { id: 'prior', name: '전과', description: '동종 전과에 따른 양형 상승',
        scoringFn: (all) => { const v = a('quasi_rape:', all); return v['q_prior']==='yes'?3:0 }},
      { id: 'mitigation', name: '감경 여지', description: '합의·초범 등 감경 가능 요인',
        scoringFn: (all) => { const v = a('quasi_rape:', all); const m = [v['q_prior']==='none', v['q_settlement']==='done'].filter(Boolean).length; return (m===2?0:m===1?1:3) as RiskLevel }},
    ],
  },

  // ──────────────────────────────────────────
  // 10. 강제추행
  // ──────────────────────────────────────────
  {
    id: 'molestation',
    name: '강제추행',
    shortName: '강제추행',
    law: '형법 제298조',
    questions: [
      { id: 'q_method', text: '어떤 방식의 추행이었나요?',
        options: [
          { value: 'surprise', label: '기습적 신체 접촉 (도주형)' },
          { value: 'force', label: '폭행을 동반한 추행' },
          { value: 'repeated', label: '반복적·지속적 행위' },
        ]},
      { id: 'q_location', text: '발생 장소는?',
        options: [
          { value: 'public', label: '공공장소' },
          { value: 'private', label: '사적 공간' },
          { value: 'workplace', label: '직장 또는 학교' },
        ]},
      { id: 'q_relationship', text: '피해자와의 관계는?',
        options: [
          { value: 'stranger', label: '모르는 사람' },
          { value: 'acquaintance', label: '아는 사람 (지인)' },
          { value: 'work', label: '직장 관계' },
        ]},
      { id: 'q_prior', text: '동종(성범죄) 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_settlement', text: '피해자와 합의 여부는?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'ongoing', label: '진행 중' },
          { value: 'done', label: '합의 완료' },
        ]},
    ],
    dimensions: [
      { id: 'method_severity', name: '행위 방법 중대성', description: '기습·폭행·반복 여부에 따른 중대성',
        scoringFn: (all) => { const v = a('molestation:', all); if(v['q_method']==='force')return 3; if(v['q_method']==='repeated')return 2; return 1 }},
      { id: 'location', name: '장소·관계 가중', description: '직장 등 신뢰 관계·장소에 따른 가중',
        scoringFn: (all) => { const v = a('molestation:', all); return sc([v['q_location']==='workplace'?2:0, v['q_relationship']==='work'?2:0]) }},
      { id: 'evidence', name: '증거 강도', description: '피해자 진술 외 객관적 증거 수준',
        scoringFn: (all) => { const v = a('molestation:', all); return sc([v['q_location']==='public'?2:0, v['q_method']==='force'?1:0]) }},
      { id: 'prior', name: '전과', description: '동종 전과에 따른 양형 상승',
        scoringFn: (all) => { const v = a('molestation:', all); return v['q_prior']==='yes'?3:0 }},
      { id: 'mitigation', name: '감경 여지', description: '합의·초범 등 감경 가능 요인',
        scoringFn: (all) => { const v = a('molestation:', all); const m = [v['q_prior']==='none', v['q_settlement']==='done'].filter(Boolean).length; return (m===2?0:m===1?1:3) as RiskLevel }},
    ],
  },

  // ──────────────────────────────────────────
  // 11. 준강제추행
  // ──────────────────────────────────────────
  {
    id: 'quasi_molestation',
    name: '준강제추행',
    shortName: '준강제추행',
    law: '형법 제299조',
    questions: [
      { id: 'q_state', text: '피해자가 어떤 상태였나요?',
        options: [
          { value: 'drunk', label: '음주 상태' },
          { value: 'asleep', label: '수면 중' },
          { value: 'drug', label: '의식 불명 또는 약물 상태' },
        ]},
      { id: 'q_awareness', text: '피해자의 그 상태를 인지하고 있었나요?',
        options: [
          { value: 'knew', label: '알고 있었음' },
          { value: 'claimed_not', label: '몰랐다고 주장할 것' },
        ]},
      { id: 'q_acts', text: '행위가 몇 회 있었나요?',
        options: [
          { value: 'once', label: '1회' },
          { value: 'multiple', label: '반복 (2회 이상)' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_settlement', text: '합의 여부는?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'done', label: '합의 완료' },
        ]},
    ],
    dimensions: [
      { id: 'victim_state', name: '피해자 상태', description: '피해자의 무력 상태 정도',
        scoringFn: (all) => { const v = a('quasi_molestation:', all); if(v['q_state']==='drug'||v['q_state']==='asleep')return 3; return 2 }},
      { id: 'awareness', name: '고의 인식', description: '상태를 알고 있었음이 인정될 가능성',
        scoringFn: (all) => { const v = a('quasi_molestation:', all); return v['q_awareness']==='knew'?3:1 }},
      { id: 'repetition', name: '반복성', description: '행위 반복 여부',
        scoringFn: (all) => { const v = a('quasi_molestation:', all); return v['q_acts']==='multiple'?2:0 }},
      { id: 'prior', name: '전과', description: '동종 전과에 따른 양형 상승',
        scoringFn: (all) => { const v = a('quasi_molestation:', all); return v['q_prior']==='yes'?3:0 }},
      { id: 'mitigation', name: '감경 여지', description: '합의·초범 등 감경 가능 요인',
        scoringFn: (all) => { const v = a('quasi_molestation:', all); const m = [v['q_prior']==='none', v['q_settlement']==='done'].filter(Boolean).length; return (m===2?0:m===1?1:3) as RiskLevel }},
    ],
  },

  // ──────────────────────────────────────────
  // 12. 위계·위력에 의한 추행
  // ──────────────────────────────────────────
  {
    id: 'authority',
    name: '위계·위력에 의한 추행',
    shortName: '위계위력추행',
    law: '성폭력처벌법 제10조',
    questions: [
      { id: 'q_method', text: '어떤 방식을 사용했나요?',
        options: [
          { value: 'deception', label: '위계 (속임수, 거짓말)' },
          { value: 'authority', label: '위력 (직위·권한 이용)' },
        ]},
      { id: 'q_relationship', text: '관계 유형은?',
        options: [
          { value: 'employment', label: '고용 관계 (직장 상하)' },
          { value: 'teacher', label: '교사·강사 — 학생' },
          { value: 'medical', label: '의사·치료사 — 환자' },
          { value: 'other', label: '기타 업무·위탁 관계' },
        ]},
      { id: 'q_duration', text: '행위가 얼마나 지속됐나요?',
        options: [
          { value: 'once', label: '1회성' },
          { value: 'repeated', label: '반복 (수회 이상)' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
      { id: 'q_settlement', text: '피해자와 합의 여부는?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'ongoing', label: '진행 중' },
          { value: 'done', label: '합의 완료' },
        ]},
    ],
    dimensions: [
      { id: 'power_severity', name: '권력 관계 심각성', description: '의사·교사 등 특수 관계의 위력 정도',
        scoringFn: (all) => { const v = a('authority:', all); if(v['q_relationship']==='medical')return 3; if(v['q_relationship']==='teacher')return 3; if(v['q_relationship']==='employment')return 2; return 1 }},
      { id: 'method', name: '위계·위력 수준', description: '속임수 vs 권한 이용 구분',
        scoringFn: (all) => { const v = a('authority:', all); return v['q_method']==='authority'?2:1 }},
      { id: 'repetition', name: '반복성', description: '반복·지속 여부',
        scoringFn: (all) => { const v = a('authority:', all); return v['q_duration']==='repeated'?2:0 }},
      { id: 'prior', name: '전과', description: '동종 전과에 따른 양형 상승',
        scoringFn: (all) => { const v = a('authority:', all); return v['q_prior']==='yes'?3:0 }},
      { id: 'mitigation', name: '감경 여지', description: '합의·초범 등 감경 가능 요인',
        scoringFn: (all) => { const v = a('authority:', all); const m = [v['q_prior']==='none', v['q_settlement']==='done'].filter(Boolean).length; return (m===2?0:m===1?1:3) as RiskLevel }},
    ],
  },

  // ──────────────────────────────────────────
  // 13. 직장내 성희롱
  // ──────────────────────────────────────────
  {
    id: 'workplace',
    name: '직장내 성희롱',
    shortName: '직장성희롱',
    law: '남녀고용평등법 제12조',
    notice: '※ 직장내 성희롱 중 단순 언어적 행위 등 일부는 형사처벌이 아닌 행정·민사 제재 대상입니다. 신체 접촉 등 형사처벌 가능 행위는 별도 형사법으로 의율됩니다.',
    questions: [
      { id: 'q_type', text: '성희롱의 유형은?',
        options: [
          { value: 'physical', label: '신체 접촉을 포함한 행위' },
          { value: 'verbal', label: '언어적 성적 발언' },
          { value: 'visual', label: '성적 사진·영상 전송' },
          { value: 'demand', label: '성적 제안 또는 요구' },
        ]},
      { id: 'q_position', text: '직위 관계는?',
        options: [
          { value: 'superior', label: '상급자로서 하급자에게' },
          { value: 'peer', label: '동료 간' },
          { value: 'client', label: '고객·거래처 관계' },
        ]},
      { id: 'q_duration', text: '얼마나 지속됐나요?',
        options: [
          { value: 'once', label: '1회성' },
          { value: 'repeated', label: '반복 (수회 이상)' },
          { value: 'long', label: '장기간 지속' },
        ]},
      { id: 'q_report', text: '회사 또는 기관에 신고했나요?',
        options: [
          { value: 'none', label: '없음 (미신고)' },
          { value: 'company', label: '회사 내 신고' },
          { value: 'labor', label: '노동청·고용노동부 신고' },
        ]},
      { id: 'q_prior', text: '동종 전과가 있나요?',
        options: [
          { value: 'none', label: '없음 (초범)' },
          { value: 'yes', label: '있음' },
        ]},
    ],
    dimensions: [
      { id: 'act_severity', name: '행위 중대성', description: '신체 접촉·언어·시각적 행위의 중대성',
        scoringFn: (all) => { const v = a('workplace:', all); if(v['q_type']==='physical')return 3; if(v['q_type']==='demand'||v['q_type']==='visual')return 2; return 1 }},
      { id: 'repetition', name: '반복성', description: '지속 기간 및 반복 여부',
        scoringFn: (all) => { const v = a('workplace:', all); if(v['q_duration']==='long')return 3; if(v['q_duration']==='repeated')return 2; return 0 }},
      { id: 'power', name: '권력 관계', description: '상하 관계 이용 여부',
        scoringFn: (all) => { const v = a('workplace:', all); return v['q_position']==='superior'?2:0 }},
      { id: 'report_status', name: '신고 현황', description: '이미 신고된 경우 수사 진행 속도',
        scoringFn: (all) => { const v = a('workplace:', all); if(v['q_report']==='labor')return 3; if(v['q_report']==='company')return 2; return 0 }},
      { id: 'sanction_level', name: '제재 수준', description: '형사처벌 외 행정·민사 제재 가능성',
        scoringFn: (all) => { const v = a('workplace:', all); return sc([v['q_type']==='physical'?2:0, v['q_position']==='superior'?1:0, v['q_duration']==='long'?1:0]) }},
    ],
  },
]

export const CRIME_MAP: Record<string, CrimeConfig> = Object.fromEntries(
  CRIMES.map((c) => [c.id, c])
)
