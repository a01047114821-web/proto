export interface Employee {
  id: string;
  name: string;
  type: 'guide' | 'cleaner' | 'marketer';
  level: number;
  salary: number;
  effect: string;
  bonus: number;
}

export interface DungeonUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  dungeonId: number;
  effect: {
    safety?: number;
    thrill?: number;
    shopping?: number;
    revenue?: number;
  };
  purchased: boolean;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: 'crisis' | 'opportunity';
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  moneyChange?: number;
  reputationChange?: number;
  result: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: {
    money?: number;
    reputation?: number;
  };
  completed: boolean;
}