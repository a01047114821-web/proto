import type { StoryScene, DungeonStory } from '../types/story.js';

export const introStory: StoryScene[] = [
  {
    id: 'intro1',
    text: '마왕이 쓰러지고 10년... 세상은 평화로워졌다.',
  },
  {
    id: 'intro2',
    text: '하지만 평화와 함께 찾아온 건... 경제 불황이었다.',
  },
  {
    id: 'intro3',
    text: '모험가들은 일자리를 잃었고, 던전의 몬스터들도 갈 곳이 없어졌다.',
  },
  {
    id: 'intro4',
    speaker: '당신',
    text: '전직 모험가였던 나는 생각했다. "던전을... 관광지로 만들면 어떨까?"',
  },
  {
    id: 'intro5',
    speaker: '당신',
    text: '몬스터들에게는 일자리를, 사람들에게는 스릴을... 그리고 나에게는 돈을!',
  },
  {
    id: 'intro6',
    text: '그렇게 세계 최초의 "던전 투어 여행사"가 탄생했다.',
  },
];

export const dungeonStories: Record<number, DungeonStory> = {
  1: {
    intro: [
      {
        id: 'slime1',
        speaker: '슬라임 킹',
        text: '끼로로... (인간이다... 드디어 방문객이...)',
      },
      {
        id: 'slime2',
        speaker: '당신',
        text: '안녕하세요, 슬라임 킹님. 던전 투어 사업 제안을 드리러 왔습니다.',
      },
      {
        id: 'slime3',
        speaker: '슬라임 킹',
        text: '끼로로? (투어...? 우리가... 관광 상품이...?)',
      },
      {
        id: 'slime4',
        speaker: '당신',
        text: '네! 가족 단위 관광객에게 인기가 많을 거예요. 안전하고 귀여우니까요.',
      },
    ],
    boss: [
      {
        id: 'slime_boss1',
        speaker: '슬라임 킹',
        text: '끼로로로! (좋다! 하지만 우리도 자존심이 있다! 힘을 보여줘야지!)',
      },
      {
        id: 'slime_boss2',
        text: '슬라임 킹이 당신의 고객들을 테스트하려 한다!',
      },
    ],
    completion: [
      {
        id: 'slime_end1',
        speaker: '슬라임 킹',
        text: '끼로로... (역시... 인간들은 강하구나... 좋아, 계약하지...)',
      },
      {
        id: 'slime_end2',
        speaker: '당신',
        text: '감사합니다! 최고의 관광지로 만들어드리겠습니다.',
      },
    ],
  },
  2: {
    intro: [
      {
        id: 'volcano1',
        speaker: '화염마',
        text: '끄아아악! 감히 내 영역에! ...어? 무기를 들지 않았군?',
      },
      {
        id: 'volcano2',
        speaker: '당신',
        text: '네, 저는 당신과 싸우러 온 게 아닙니다. 사업 제안을 하러 왔습니다.',
      },
      {
        id: 'volcano3',
        speaker: '화염마',
        text: '흥! 사업이라... 더 이상 전쟁도 없는데 우리 같은 전투형 몬스터가 무슨...',
      },
      {
        id: 'volcano4',
        speaker: '당신',
        text: '스릴을 찾는 관광객들이 많습니다. 당신의 화산은 완벽한 어드벤처 관광지예요!',
      },
    ],
    boss: [
      {
        id: 'volcano_boss1',
        speaker: '화염마',
        text: '크하하! 좋다! 하지만 약한 놈들은 받을 수 없어! 네 고객들이 진짜 용기가 있는지 시험하겠다!',
      },
    ],
    completion: [
      {
        id: 'volcano_end1',
        speaker: '화염마',
        text: '크으... 인정한다! 이 정도 용기라면... 내 화산을 맡겨도 되겠군!',
      },
      {
        id: 'volcano_end2',
        speaker: '당신',
        text: '최고의 어드벤처 명소로 만들어드리겠습니다!',
      },
    ],
  },
  3: {
    intro: [
      {
        id: 'ghost1',
        speaker: '유령 백작',
        text: '오호... 오랜만에 방문객이군... 크크크...',
      },
      {
        id: 'ghost2',
        speaker: '당신',
        text: '유령 백작님, 던전 투어 사업 제안을 드리러 왔습니다.',
      },
      {
        id: 'ghost3',
        speaker: '유령 백작',
        text: '투어라... 흥미롭군. 하지만 우리 성은 무시무시한 곳이라네. 관광객들이 견딜 수 있을까?',
      },
      {
        id: 'ghost4',
        speaker: '당신',
        text: '호러 테마는 매니아층이 두텁습니다. 미스터리를 즐기는 분들이 많아요.',
      },
    ],
    boss: [
      {
        id: 'ghost_boss1',
        speaker: '유령 백작',
        text: '크크크... 좋아. 그렇다면 우리의 "환대"를 받아보게나!',
      },
    ],
    completion: [
      {
        id: 'ghost_end1',
        speaker: '유령 백작',
        text: '크크크... 멋지군! 이 정도 배짱이면 우리 성을 즐길 자격이 있어!',
      },
      {
        id: 'ghost_end2',
        speaker: '당신',
        text: '최고의 호러 체험관으로 만들어드리겠습니다!',
      },
    ],
  },
};

export const randomEvents: StoryScene[] = [
  {
    id: 'event1',
    speaker: '고객',
    text: '와! 진짜 슬라임이다! 사진 찍어도 돼요?',
  },
  {
    id: 'event2',
    speaker: '슬라임',
    text: '끼로로~ (좋아요~ 포즈 취할게요~)',
  },
  {
    id: 'event3',
    speaker: '고객',
    text: '이 화산 진짜 뜨겁네요! 완전 리얼하다!',
  },
  {
    id: 'event4',
    speaker: '화염마',
    text: '크하하! 안전은 보장한다! 스릴만 즐겨라!',
  },
  {
    id: 'event5',
    speaker: '고객',
    text: '으악! 유령이다! ...근데 귀엽네?',
  },
  {
    id: 'event6',
    speaker: '유령',
    text: '귀... 귀엽다고...? (부끄)',
  },
];

export const endings = {
  bad: [
    {
      id: 'bad1',
      text: '결국 당신의 여행사는 문을 닫았다.',
    },
    {
      id: 'bad2',
      text: '하지만 당신은 새로운 도전을 꿈꾼다...',
    },
    {
      id: 'bad3',
      text: 'BAD ENDING - 재도전하시겠습니까?',
    },
  ],
  normal: [
    {
      id: 'normal1',
      text: '당신의 던전 투어 여행사는 안정적으로 운영되고 있다.',
    },
    {
      id: 'normal2',
      text: '몬스터들도, 관광객들도 만족하는 것 같다.',
    },
    {
      id: 'normal3',
      text: 'NORMAL ENDING - 평범하지만 행복한 결말',
    },
  ],
  good: [
    {
      id: 'good1',
      text: '당신의 던전 투어 여행사는 대성공을 거두었다!',
    },
    {
      id: 'good2',
      text: '이제 전국의 던전들이 당신에게 연락을 해온다.',
    },
    {
      id: 'good3',
      speaker: '당신',
      text: '던전과 인간의 공존... 나쁘지 않네.',
    },
    {
      id: 'good4',
      text: 'GOOD ENDING - 성공한 사업가',
    },
  ],
  true: [
    {
      id: 'true1',
      text: '당신의 던전 투어 여행사는 세계적인 기업이 되었다.',
    },
    {
      id: 'true2',
      speaker: '왕',
      text: '던전 관광 산업의 창시자에게 기사 작위를 수여하노라!',
    },
    {
      id: 'true3',
      speaker: '슬라임 킹',
      text: '끼로로! (고마워요! 우리에게 새로운 삶을 주셔서!)',
    },
    {
      id: 'true4',
      speaker: '화염마',
      text: '크하하! 싸움만이 전부가 아니란 걸 배웠다!',
    },
    {
      id: 'true5',
      speaker: '유령 백작',
      text: '덕분에 우리도 행복하다네... 정말 고맙네.',
    },
    {
      id: 'true6',
      speaker: '당신',
      text: '모두가 행복한 세상... 이게 내가 꿈꾸던 거였어.',
    },
    {
      id: 'true7',
      text: 'TRUE ENDING - 던전과 인간의 공존',
    },
  ],
};