export interface Customer {
  id: number;
  type: string;
  preference: string;
  color: string;
  hp: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  skills: string[];
  satisfaction?: number;
}

export interface Dungeon {
  id: number;
  name: string;
  owned: boolean;
  level: number;
  maintenance: number;
  cost?: number;
  subtitle: string;
  rating: number;
}

export interface Monster {
  name: string;
  hp: number;
  currentHp?: number;
  attack: number;
  emoji: string;
}

export interface BattleData {
  monster: Monster;
  currentCustomerIndex: number;
  battleLog: string[];
}

export interface Review {
  customer: string;
  text: string;
  stars: number;
}

export interface MinigameData {
  type: 'slime' | 'volcano' | 'ghost';
  [key: string]: any;
}