import type { VictimCrimeConfig, CrimeType } from '../types'

export const VICTIM_CRIMES: VictimCrimeConfig[] = [
  // ── 1. 카메라등이용촬영 ─────────────────────────────
  {
    id: 'cam',
    name: '카메라등이용촬영',
    shortName: '불법촬영',
    law: '성폭력처벌법 제14조',
    questions: [
      {
        id: 'q_discovery',
        text: '촬영 피해를 어떻게 알게 됐나요?',
        options: [
          { value: 'found_device', label: '직접 발견 (가해자 기기·소지품 등 확인)' },
          { value: 'spread', label: '유포된 사실을 알게 됨 (지인·SNS 제보 등)' },
          { value: 'confession', label: '가해자로부터 고백 또는 협박 받음' },
          { value: 'investigation', label: '수사기관 수사 중 통보받음' },
        ],
      },
      {
        id: 'q_spread',
        text: '피해 영상·사진이 외부에 유포됐나요?',
        options: [
          { value: 'no', label: '없음 / 아직 확인 안 됨' },
          { value: 'partial', label: '소수에게 전송된 정황 있음' },
          { value: 'wide', label: '온라인 불특정 다수에게 유포 확인됨' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음 (진술만 가능)' },
          { value: 'indirect', label: '대화기록·문자·SNS 등 간접 증거' },
          { value: 'direct', label: '영상·사진 원본 또는 CCTV 등 직접 증거' },
        ],
      },
      {
        id: 'q_perpetrator',
        text: '가해자 신원을 알고 있나요?',
        options: [
          { value: 'unknown', label: '전혀 모름 (불상)' },
          { value: 'partial', label: '얼굴·특징은 알지만 신원 불명' },
          { value: 'known', label: '이름·연락처 등 신원 확인됨' },
        ],
      },
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'stranger', label: '전혀 모르는 사람' },
          { value: 'acquaintance', label: '지인·동료·직장 관계' },
          { value: 'partner', label: '연인 또는 전 연인' },
        ],
      },
    ],
  },

  // ── 2. 불법촬영물 유포 ──────────────────────────────
  {
    id: 'dist',
    name: '불법촬영물 유포',
    shortName: '불법유포',
    law: '성폭력처벌법 제14조 제2·3항',
    questions: [
      {
        id: 'q_origin',
        text: '유포된 콘텐츠의 원래 촬영 경위는?',
        options: [
          { value: 'hidden', label: '동의 없이 몰래 촬영된 것' },
          { value: 'ex_partner', label: '연인 관계 당시 촬영 후 이별 뒤 유포됨' },
          { value: 'hacked', label: '해킹·유출로 취득 후 유포된 것으로 추정' },
          { value: 'unknown', label: '정확한 경위 모름' },
        ],
      },
      {
        id: 'q_spread_platform',
        text: '유포 경로·범위를 알고 있나요?',
        options: [
          { value: 'unknown', label: '모름' },
          { value: 'dm', label: '단체방·개인 메시지로 일부 전송 확인' },
          { value: 'channel', label: '텔레그램 채널·커뮤니티 등 광범위 유포 확인' },
        ],
      },
      {
        id: 'q_deletion',
        text: '콘텐츠 삭제 조치를 했나요?',
        options: [
          { value: 'none', label: '아직 하지 않음' },
          { value: 'requested', label: '삭제 요청했지만 이행 안 됨' },
          { value: 'partial', label: '일부 삭제 완료 (플랫폼 신고 등)' },
        ],
      },
      {
        id: 'q_evidence',
        text: '가해자와의 연관을 입증할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'indirect', label: '대화기록·정황 증거' },
          { value: 'direct', label: '직접 증거 있음 (스크린샷·URL 등)' },
        ],
      },
      {
        id: 'q_perpetrator',
        text: '가해자 신원을 알고 있나요?',
        options: [
          { value: 'unknown', label: '모름' },
          { value: 'partial', label: '특징은 알지만 신원 불명' },
          { value: 'known', label: '신원 확인됨' },
        ],
      },
    ],
  },

  // ── 3. 불법촬영물 소지·시청 ─────────────────────────
  {
    id: 'poss',
    name: '불법촬영물 소지·시청',
    shortName: '소지·시청',
    law: '성폭력처벌법 제14조 제4항',
    questions: [
      {
        id: 'q_discovery',
        text: '가해자가 본인 관련 영상·사진을 소지한 것을 어떻게 알게 됐나요?',
        options: [
          { value: 'investigation', label: '수사기관 수사 중 알게 됨' },
          { value: 'found', label: '해당 파일을 직접 발견' },
          { value: 'tip', label: '제보·제3자를 통해 알게 됨' },
        ],
      },
      {
        id: 'q_spread',
        text: '해당 콘텐츠가 외부에 유포됐을 가능성은?',
        options: [
          { value: 'no', label: '없음 / 개인 소지만으로 추정' },
          { value: 'possible', label: '일부 유포 가능성 있음' },
          { value: 'confirmed', label: '유포 확인됨' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'indirect', label: '간접 증거 (대화기록 등)' },
          { value: 'direct', label: '직접 증거 있음 (파일 확인 등)' },
        ],
      },
      {
        id: 'q_perpetrator',
        text: '가해자 신원을 알고 있나요?',
        options: [
          { value: 'unknown', label: '모름' },
          { value: 'partial', label: '특징 알고 있음' },
          { value: 'known', label: '신원 확인됨' },
        ],
      },
    ],
  },

  // ── 4. 아동·청소년 성착취물 ─────────────────────────
  {
    id: 'child',
    name: '아동·청소년 성착취물',
    shortName: '아청법',
    law: '아청법 제11조',
    questions: [
      {
        id: 'q_content',
        text: '피해 콘텐츠의 내용을 알고 있나요?',
        options: [
          { value: 'real', label: '본인이 등장하는 실제 영상·사진' },
          { value: 'deepfake', label: 'AI 합성(딥페이크) 콘텐츠' },
          { value: 'unknown', label: '정확한 내용 모름' },
        ],
      },
      {
        id: 'q_spread',
        text: '피해 콘텐츠가 유포됐나요?',
        options: [
          { value: 'no', label: '없음 / 모름' },
          { value: 'partial', label: '소수에게 전송됨' },
          { value: 'wide', label: '온라인 광범위 유포 확인됨' },
        ],
      },
      {
        id: 'q_evidence',
        text: '증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'indirect', label: '간접 증거' },
          { value: 'direct', label: '직접 증거 있음' },
        ],
      },
      {
        id: 'q_perpetrator',
        text: '가해자 신원을 알고 있나요?',
        options: [
          { value: 'unknown', label: '모름' },
          { value: 'partial', label: '특징 알고 있음' },
          { value: 'known', label: '신원 확인됨' },
        ],
      },
    ],
  },

  // ── 5. 딥페이크 성범죄 ──────────────────────────────
  {
    id: 'deep',
    name: '딥페이크 성범죄',
    shortName: '딥페이크',
    law: '성폭력처벌법 제14조의2',
    questions: [
      {
        id: 'q_discovery',
        text: '합성물의 존재를 어떻게 알게 됐나요?',
        options: [
          { value: 'found', label: '본인이 직접 발견' },
          { value: 'tip', label: '지인·제보로 알게 됨' },
          { value: 'threat', label: '가해자로부터 협박 받음' },
        ],
      },
      {
        id: 'q_identifiable',
        text: '합성물에서 본인이 특정되나요?',
        options: [
          { value: 'unclear', label: '불명확 (인위적 합성임이 분명)' },
          { value: 'identifiable', label: '얼굴 등으로 본인 특정 가능함' },
        ],
      },
      {
        id: 'q_spread',
        text: '유포 현황은?',
        options: [
          { value: 'no', label: '제작만 된 것으로 보임 (유포 미확인)' },
          { value: 'partial', label: '일부 유포 확인됨' },
          { value: 'wide', label: '다수 플랫폼 광범위 유포 확인됨' },
        ],
      },
      {
        id: 'q_evidence',
        text: '가해자와의 연관 증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'screenshot', label: '콘텐츠 URL·스크린샷 보관됨' },
          { value: 'link', label: '가해자와 직접 연결되는 증거 있음' },
        ],
      },
      {
        id: 'q_perpetrator',
        text: '가해자 신원을 알고 있나요?',
        options: [
          { value: 'unknown', label: '모름' },
          { value: 'partial', label: '특징 알고 있음' },
          { value: 'known', label: '신원 확인됨' },
        ],
      },
    ],
  },

  // ── 6. 통신매체이용음란 ─────────────────────────────
  {
    id: 'comm',
    name: '통신매체이용음란',
    shortName: '통신음란',
    law: '성폭력처벌법 제13조',
    questions: [
      {
        id: 'q_count',
        text: '성적 메시지·사진 전송이 몇 회 있었나요?',
        options: [
          { value: 'few', label: '1~2회' },
          { value: 'several', label: '3~9회' },
          { value: 'many', label: '10회 이상' },
        ],
      },
      {
        id: 'q_refused',
        text: '전송 거부 의사를 밝혔나요?',
        options: [
          { value: 'no', label: '밝히지 않았음 / 기회가 없었음' },
          { value: 'yes', label: '거부 의사를 밝혔으나 계속 전송됨' },
        ],
      },
      {
        id: 'q_content_type',
        text: '전송된 내용의 성격은?',
        options: [
          { value: 'text', label: '성적 문자·발언' },
          { value: 'image', label: '신체 노출 사진·영상' },
          { value: 'both', label: '두 가지 모두' },
        ],
      },
      {
        id: 'q_evidence',
        text: '대화 기록을 보관하고 있나요?',
        options: [
          { value: 'none', label: '없음 / 삭제됨' },
          { value: 'partial', label: '일부 보관 중' },
          { value: 'full', label: '전부 보관 중' },
        ],
      },
      {
        id: 'q_perpetrator',
        text: '가해자 신원을 알고 있나요?',
        options: [
          { value: 'unknown', label: '모름' },
          { value: 'partial', label: '특징 알고 있음' },
          { value: 'known', label: '신원 확인됨' },
        ],
      },
    ],
  },

  // ── 7. 스토킹 ───────────────────────────────────────
  {
    id: 'stalk',
    name: '스토킹',
    shortName: '스토킹',
    law: '스토킹처벌법 제18조',
    questions: [
      {
        id: 'q_frequency',
        text: '스토킹 행위가 얼마나 반복됐나요?',
        options: [
          { value: 'few', label: '2~3회' },
          { value: 'several', label: '4~9회' },
          { value: 'many', label: '10회 이상 또는 장기간' },
        ],
      },
      {
        id: 'q_type',
        text: '스토킹의 주된 유형은?',
        options: [
          { value: 'contact', label: '반복적 연락·문자·전화' },
          { value: 'follow', label: '접근·미행·잠복' },
          { value: 'threat', label: '협박·위협 동반' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음 (진술만)' },
          { value: 'records', label: '문자·카카오톡 기록 있음' },
          { value: 'cctv', label: 'CCTV·목격자 등 객관적 증거 있음' },
        ],
      },
      {
        id: 'q_measure',
        text: '접근금지 가처분·잠정조치를 신청했나요?',
        options: [
          { value: 'no', label: '신청하지 않음' },
          { value: 'pending', label: '신청 예정 / 진행 중' },
          { value: 'issued', label: '이미 발령됨' },
        ],
      },
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'stranger', label: '전혀 모르는 사람' },
          { value: 'acquaintance', label: '지인·직장 관계' },
          { value: 'ex', label: '전 연인 / 가족 관계' },
        ],
      },
    ],
  },

  // ── 8. 강간 ─────────────────────────────────────────
  {
    id: 'rape',
    name: '강간',
    shortName: '강간',
    law: '형법 제297조',
    questions: [
      {
        id: 'q_medical',
        text: '피해 이후 신체 검사를 받으셨나요?',
        subtext: '해바라기센터·원스톱지원센터에서 무료 검사와 증거 보전이 가능합니다',
        options: [
          { value: 'none', label: '받지 않음' },
          { value: 'general', label: '일반 병원 진찰만 받음' },
          { value: 'specialized', label: '해바라기센터·성폭력 전문 기관에서 검사 받음' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음 (진술만)' },
          { value: 'chat', label: '사건 전후 대화기록 있음' },
          { value: 'injury', label: '신체 상해 의료기록 있음' },
          { value: 'cctv', label: 'CCTV 또는 목격자 있음' },
        ],
      },
      {
        id: 'q_force',
        text: '폭행이나 협박이 있었나요?',
        options: [
          { value: 'physical', label: '신체적 폭행이 있었음' },
          { value: 'threat', label: '협박(위협)이 있었음' },
          { value: 'none', label: '명시적 폭행·협박은 없었음' },
        ],
      },
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'stranger', label: '전혀 모르는 사람' },
          { value: 'acquaintance', label: '아는 사람 (지인·동료)' },
          { value: 'partner', label: '연인 또는 전 연인' },
          { value: 'family', label: '가족 또는 친족' },
        ],
      },
      {
        id: 'q_after_contact',
        text: '사건 이후 가해자와 연락이 있었나요?',
        options: [
          { value: 'none', label: '없음 (연락 차단)' },
          { value: 'settlement', label: '합의 관련 연락이 있었음' },
          { value: 'ongoing', label: '지속적으로 연락하고 있음' },
        ],
      },
    ],
  },

  // ── 9. 준강간 ───────────────────────────────────────
  {
    id: 'quasi_rape',
    name: '준강간',
    shortName: '준강간',
    law: '형법 제299조',
    questions: [
      {
        id: 'q_state',
        text: '사건 당시 본인의 상태는?',
        options: [
          { value: 'drunk', label: '음주로 인해 제대로 판단하기 어려웠음' },
          { value: 'asleep', label: '수면 중 또는 의식을 잃은 상태였음' },
          { value: 'drug', label: '약물 등으로 인한 무력 상태였음' },
        ],
      },
      {
        id: 'q_medical',
        text: '피해 이후 신체 검사를 받으셨나요?',
        subtext: '가능한 한 빨리 해바라기센터에서 검사를 받으시면 증거 보전에 유리합니다',
        options: [
          { value: 'none', label: '받지 않음' },
          { value: 'general', label: '일반 병원 진찰만' },
          { value: 'specialized', label: '해바라기센터 등 전문 기관에서 검사 받음' },
        ],
      },
      {
        id: 'q_evidence',
        text: '당시 상황을 확인할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'chat', label: '당시 연락·대화기록 있음' },
          { value: 'cctv', label: 'CCTV 또는 목격자 있음' },
        ],
      },
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'stranger', label: '전혀 모르는 사람' },
          { value: 'acquaintance', label: '지인·동료' },
          { value: 'partner', label: '연인 또는 전 연인' },
        ],
      },
      {
        id: 'q_awareness',
        text: '가해자가 당시 본인의 상태를 알고 있었다고 생각하나요?',
        options: [
          { value: 'certain', label: '알고 있었을 것이 확실함' },
          { value: 'likely', label: '아마 알고 있었을 것임' },
          { value: 'unsure', label: '잘 모르겠음' },
        ],
      },
    ],
  },

  // ── 10. 강제추행 ─────────────────────────────────────
  {
    id: 'molestation',
    name: '강제추행',
    shortName: '강제추행',
    law: '형법 제298조',
    questions: [
      {
        id: 'q_method',
        text: '추행의 방식은?',
        options: [
          { value: 'surprise', label: '순간적·기습적 신체 접촉' },
          { value: 'force', label: '폭행·강압을 동반한 추행' },
          { value: 'repeated', label: '반복적·지속적 추행' },
        ],
      },
      {
        id: 'q_location',
        text: '발생 장소는?',
        options: [
          { value: 'public', label: '공공장소 (지하철·공원 등)' },
          { value: 'workplace', label: '직장·학교' },
          { value: 'private', label: '사적 공간' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음 (진술만)' },
          { value: 'indirect', label: '대화기록 등 간접 증거' },
          { value: 'cctv', label: 'CCTV 또는 목격자 있음' },
        ],
      },
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'stranger', label: '전혀 모르는 사람' },
          { value: 'acquaintance', label: '지인·동료' },
          { value: 'work', label: '직장 상하 관계' },
        ],
      },
      {
        id: 'q_frequency',
        text: '피해가 몇 회 있었나요?',
        options: [
          { value: 'once', label: '1회' },
          { value: 'few', label: '2~3회' },
          { value: 'many', label: '4회 이상' },
        ],
      },
    ],
  },

  // ── 11. 준강제추행 ───────────────────────────────────
  {
    id: 'quasi_molestation',
    name: '준강제추행',
    shortName: '준강제추행',
    law: '형법 제299조',
    questions: [
      {
        id: 'q_state',
        text: '사건 당시 본인의 상태는?',
        options: [
          { value: 'drunk', label: '음주 상태' },
          { value: 'asleep', label: '수면 중' },
          { value: 'drug', label: '의식 불명 또는 약물 상태' },
        ],
      },
      {
        id: 'q_evidence',
        text: '당시 상황을 확인할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'chat', label: '연락·대화기록 있음' },
          { value: 'cctv', label: 'CCTV 또는 목격자 있음' },
        ],
      },
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'stranger', label: '전혀 모르는 사람' },
          { value: 'acquaintance', label: '지인·동료' },
          { value: 'partner', label: '연인 또는 전 연인' },
        ],
      },
      {
        id: 'q_awareness',
        text: '가해자가 당시 본인의 상태를 알고 있었나요?',
        options: [
          { value: 'certain', label: '알고 있었음이 확실함' },
          { value: 'likely', label: '아마 알고 있었을 것임' },
          { value: 'unsure', label: '잘 모르겠음' },
        ],
      },
      {
        id: 'q_frequency',
        text: '피해가 반복됐나요?',
        options: [
          { value: 'once', label: '1회' },
          { value: 'multiple', label: '2회 이상' },
        ],
      },
    ],
  },

  // ── 12. 위계·위력에 의한 추행 ────────────────────────
  {
    id: 'authority',
    name: '위계·위력에 의한 추행',
    shortName: '위계위력추행',
    law: '성폭력처벌법 제10조(추행) / 형법 제303조(간음)',
    questions: [
      {
        id: 'q_relationship',
        text: '가해자와의 관계는?',
        options: [
          { value: 'employment', label: '직장 상하 관계 (고용주·상관)' },
          { value: 'teacher', label: '교사·강사 — 학생 관계' },
          { value: 'medical', label: '의사·치료사 — 환자 관계' },
          { value: 'other', label: '기타 업무·위탁 관계' },
        ],
      },
      {
        id: 'q_method',
        text: '가해자가 사용한 방식은?',
        options: [
          { value: 'authority', label: '위력 (직위·권한을 이용한 압박)' },
          { value: 'deception', label: '위계 (속임수·거짓말로 유인)' },
        ],
      },
      {
        id: 'q_frequency',
        text: '피해가 얼마나 반복됐나요?',
        options: [
          { value: 'once', label: '1회' },
          { value: 'few', label: '2~4회' },
          { value: 'many', label: '5회 이상' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음 (진술만)' },
          { value: 'records', label: '대화기록·메시지 등' },
          { value: 'witness', label: '목격자 또는 다른 피해자 있음' },
        ],
      },
      {
        id: 'q_others',
        text: '다른 피해자가 있나요?',
        options: [
          { value: 'no', label: '본인만 피해' },
          { value: 'yes', label: '다른 피해자도 있음' },
        ],
      },
    ],
  },

  // ── 13. 직장내 성희롱 ───────────────────────────────
  {
    id: 'workplace',
    name: '직장내 성희롱',
    shortName: '직장성희롱',
    law: '남녀고용평등법 제12조',
    questions: [
      {
        id: 'q_type',
        text: '성희롱의 유형은?',
        options: [
          { value: 'physical', label: '신체 접촉을 포함한 행위' },
          { value: 'visual', label: '성적 사진·영상 전송' },
          { value: 'demand', label: '성적 제안·요구' },
          { value: 'verbal', label: '언어적 성적 발언·농담' },
        ],
      },
      {
        id: 'q_position',
        text: '가해자와의 직위 관계는?',
        options: [
          { value: 'superior', label: '상급자 (직속 상관 또는 고위직)' },
          { value: 'peer', label: '동료' },
          { value: 'client', label: '고객·거래처' },
        ],
      },
      {
        id: 'q_duration',
        text: '피해가 얼마나 지속됐나요?',
        options: [
          { value: 'once', label: '1회성' },
          { value: 'repeated', label: '수회 반복' },
          { value: 'long', label: '장기간 지속' },
        ],
      },
      {
        id: 'q_evidence',
        text: '피해를 증명할 증거가 있나요?',
        options: [
          { value: 'none', label: '없음 (진술만)' },
          { value: 'records', label: '대화기록·이메일 등' },
          { value: 'witness', label: '목격자 있음' },
        ],
      },
      {
        id: 'q_reported',
        text: '회사에 신고하거나 이야기한 적 있나요?',
        options: [
          { value: 'no', label: '없음 (신고 안 함)' },
          { value: 'informal', label: '비공식적으로 이야기했음' },
          { value: 'formal', label: '정식 신고함' },
        ],
      },
    ],
  },
]

export const VICTIM_CRIME_MAP: Record<CrimeType, VictimCrimeConfig> = Object.fromEntries(
  VICTIM_CRIMES.map((c) => [c.id, c])
) as Record<CrimeType, VictimCrimeConfig>
