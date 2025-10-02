import type { Employee, DungeonUpgrade, RandomEvent, Challenge } from '../types/upgrade.js';

export const employeeTypes = [
  {
    id: 'guide1',
    name: '초보 가이드',
    type: 'guide' as const,
    level: 1,
    salary: 100,
    effect: '고객 만족도 +10%',
    bonus: 10
  },
  {
    id: 'guide2',
    name: '전문 가이드',
    type: 'guide' as const,
    level: 2,
    salary: 200,
    effect: '고객 만족도 +20%',
    bonus: 20
  },
  {
    id: 'cleaner1',
    name: '청소부',
    type: 'cleaner' as const,
    level: 1,
    salary: 80,
    effect: '안전도 +15%',
    bonus: 15
  },
  {
    id: 'marketer1',
    name: '마케터',
    type: 'marketer' as const,
    level: 1,
    salary: 150,
    effect: '평판 획득 +25%',
    bonus: 25
  },
];

export const dungeonUpgrades: DungeonUpgrade[] = [
  {
    id: 'slime_photo',
    name: '슬라임 포토존',
    description: '귀여운 슬라임과 사진 찍기!',
    cost: 300,
    dungeonId: 1,
    effect: { shopping: 3, revenue: 50 },
    purchased: false
  },
  {
    id: 'slime_safety',
    name: '미끄럼 방지 매트',
    description: '슬라임 젤리로 미끄러지지 않아요',
    cost: 200,
    dungeonId: 1,
    effect: { safety: 2 },
    purchased: false
  },
  {
    id: 'volcano_bridge',
    name: '안전 다리',
    description: '용암 위를 안전하게!',
    cost: 400,
    dungeonId: 2,
    effect: { safety: 3 },
    purchased: false
  },
  {
    id: 'volcano_extreme',
    name: '익스트림 코스',
    description: '진짜 스릴을 원한다면!',
    cost: 500,
    dungeonId: 2,
    effect: { thrill: 4, revenue: 100 },
    purchased: false
  },
  {
    id: 'ghost_souvenir',
    name: '유령 기념품샵',
    description: '귀여운 유령 인형 판매',
    cost: 350,
    dungeonId: 3,
    effect: { shopping: 4, revenue: 80 },
    purchased: false
  },
  {
    id: 'ghost_lights',
    name: '분위기 조명',
    description: '무섭지만 예쁜 조명',
    cost: 250,
    dungeonId: 3,
    effect: { thrill: 2, safety: 1 },
    purchased: false
  },
];

export const randomEvents: RandomEvent[] = [
  {
    id: 'event1',
    title: '🎬 TV 방송 섭외',
    description: '인기 예능 프로그램에서 촬영 제안이 왔습니다!',
    type: 'opportunity',
    choices: [
      {
        text: '수락한다 (평판 +20)',
        reputationChange: 20,
        result: '방송 효과로 유명해졌습니다!'
      },
      {
        text: '거절한다',
        result: '조용히 사업에 집중합니다.'
      }
    ]
  },
  {
    id: 'event2',
    title: '⚠️ 안전 사고 발생',
    description: '고객이 슬라임에 미끄러졌습니다!',
    type: 'crisis',
    choices: [
      {
        text: '즉시 치료비 지급 (-300원, 평판 유지)',
        moneyChange: -300,
        result: '빠른 대처로 문제를 해결했습니다.'
      },
      {
        text: '보험 처리 (평판 -10)',
        reputationChange: -10,
        result: '시간이 걸렸지만 처리했습니다.'
      }
    ]
  },
  {
    id: 'event3',
    title: '💰 대기업 단체 관광',
    description: '대기업에서 단체 관광을 신청했습니다!',
    type: 'opportunity',
    choices: [
      {
        text: '수락 (+500원, 피곤함)',
        moneyChange: 500,
        result: '큰 수익을 올렸습니다!'
      },
      {
        text: '거절 (여유 유지)',
        result: '무리하지 않기로 했습니다.'
      }
    ]
  },
  {
    id: 'event4',
    title: '🎪 페스티벌 개최',
    description: '던전 페스티벌을 개최할까요?',
    type: 'opportunity',
    choices: [
      {
        text: '개최 (-400원, 평판 +15)',
        moneyChange: -400,
        reputationChange: 15,
        result: '성공적인 페스티벌이었습니다!'
      },
      {
        text: '다음 기회에',
        result: '신중하게 결정했습니다.'
      }
    ]
  },
  {
    id: 'event5',
    title: '⚡ 몬스터 파업',
    description: '몬스터들이 임금 인상을 요구합니다!',
    type: 'crisis',
    choices: [
      {
        text: '인상 수용 (-200원)',
        moneyChange: -200,
        result: '몬스터들이 만족합니다.'
      },
      {
        text: '협상 시도 (평판 -5)',
        reputationChange: -5,
        result: '어렵게 설득했습니다.'
      }
    ]
  },
];

export const initialChallenges: Challenge[] = [
  {
    id: 'challenge1',
    title: '첫 걸음',
    description: '투어 3회 성공',
    target: 3,
    progress: 0,
    reward: { money: 300, reputation: 5 },
    completed: false
  },
  {
    id: 'challenge2',
    title: '인기 여행사',
    description: '평판 70 달성',
    target: 70,
    progress: 50,
    reward: { money: 500, reputation: 10 },
    completed: false
  },
  {
    id: 'challenge3',
    title: '부자',
    description: '3000원 모으기',
    target: 3000,
    progress: 1000,
    reward: { reputation: 15 },
    completed: false
  },
  {
    id: 'challenge4',
    title: '던전 마스터',
    description: '모든 던전 구매',
    target: 3,
    progress: 1,
    reward: { money: 1000, reputation: 20 },
    completed: false
  },
  {
    id: 'challenge5',
    title: '완벽한 서비스',
    description: '만족도 100% 달성',
    target: 1,
    progress: 0,
    reward: { money: 800 },
    completed: false
  },
];