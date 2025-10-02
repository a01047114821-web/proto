import { useState } from 'react';
import type { Dungeon, Customer, Review, BattleData, MinigameData } from '../types/index.js';
import type { StoryScene, EndingType } from '../types/story.js';
import type { Employee, DungeonUpgrade, RandomEvent, Challenge } from '../types/upgrade.js';
import { initialDungeons } from '../constants/gameData.js';
import { introStory } from '../constants/storyData.js';
import { dungeonUpgrades, initialChallenges } from '../constants/upgradeData.js';

export const useGameState = () => {
  const [gameState, setGameState] = useState('intro');
  const [money, setMoney] = useState(1000);
  const [reputation, setReputation] = useState(50);
  const [dungeons, setDungeons] = useState<Dungeon[]>(initialDungeons);
  const [currentTour, setCurrentTour] = useState<{ dungeonId: number; dungeon: string } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [minigameData, setMinigameData] = useState<MinigameData | null>(null);
  const [battleData, setBattleData] = useState<BattleData | null>(null);
  const [currentStory, setCurrentStory] = useState<StoryScene[]>(introStory);
  const [showStory, setShowStory] = useState(true);
  const [tourCount, setTourCount] = useState(0);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [upgrades, setUpgrades] = useState<DungeonUpgrade[]>(dungeonUpgrades);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [eventTriggerCount, setEventTriggerCount] = useState(0);

  return {
    gameState, setGameState,
    money, setMoney,
    reputation, setReputation,
    dungeons, setDungeons,
    currentTour, setCurrentTour,
    customers, setCustomers,
    reviews, setReviews,
    minigameData, setMinigameData,
    battleData, setBattleData,
    currentStory, setCurrentStory,
    showStory, setShowStory,
    tourCount, setTourCount,
    employees, setEmployees,
    upgrades, setUpgrades,
    challenges, setChallenges,
    showUpgradePanel, setShowUpgradePanel,
    currentEvent, setCurrentEvent,
    eventTriggerCount, setEventTriggerCount,
  };
};