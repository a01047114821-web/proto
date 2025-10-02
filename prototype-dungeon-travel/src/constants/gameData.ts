export const customerTypes = [
  { type: '전사', preference: 'thrill', color: 'bg-red-500', hp: 100, attack: 15, skills: ['강타', '돌진'] },
  { type: '힐러', preference: 'safety', color: 'bg-green-500', hp: 80, attack: 8, skills: ['치유', '보호막'] },
  { type: '상인', preference: 'shopping', color: 'bg-yellow-500', hp: 70, attack: 10, skills: ['던지기', '협상'] }
];

export const monsters = {
  1: { name: '슬라임', hp: 50, attack: 5, emoji: '🟢' },
  2: { name: '화염마', hp: 80, attack: 12, emoji: '🔥' },
  3: { name: '유령', hp: 70, attack: 10, emoji: '👻' }
};

export const dungeonFeatures = {
  1: { thrill: 2, safety: 8, shopping: 5 },
  2: { thrill: 9, safety: 3, shopping: 4 },
  3: { thrill: 7, safety: 5, shopping: 6 }
};

export const initialDungeons = [
  { id: 1, name: '슬라임 동굴', owned: true, level: 1, maintenance: 100, subtitle: '가족 친화적 초급 코스', rating: 4.2 },
  { id: 2, name: '화산 던전', owned: false, level: 0, maintenance: 200, cost: 500, subtitle: '스릴 넘치는 화산 체험', rating: 4.8 },
  { id: 3, name: '유령 성', owned: false, level: 0, maintenance: 300, cost: 1000, subtitle: '미스터리 어드벤처', rating: 4.5 }
];