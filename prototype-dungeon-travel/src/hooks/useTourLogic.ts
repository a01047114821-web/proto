import type { Customer } from '../types/index.js';
import { customerTypes, monsters, dungeonFeatures } from '../constants/gameData.js';
import { dungeonStories } from '../constants/storyData.js';

export const useTourLogic = (
  setCustomers: (customers: Customer[]) => void,
  setCurrentTour: (tour: { dungeonId: number; dungeon: string } | null) => void,
  setGameState: (state: string) => void,
  setCurrentStory: (story: any[]) => void,
  setShowStory: (show: boolean) => void,
  setBattleData: (data: any) => void,
  setMinigameData: (data: any) => void,
  dungeons: any[]
) => {
  const generateCustomers = (): Customer[] => {
    const numCustomers = Math.floor(Math.random() * 2) + 2;
    return Array(numCustomers).fill(null).map((_, i) => {
      const baseType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
      return { id: i, ...baseType, satisfaction: 50, currentHp: baseType.hp, maxHp: baseType.hp };
    });
  };

  const startTour = (dungeonId: number) => {
    const dungeon = dungeons.find(d => d.id === dungeonId);
    if (!dungeon?.owned) return;

    const newCustomers = generateCustomers();
    setCustomers(newCustomers);
    setCurrentTour({ dungeonId, dungeon: dungeon.name });
    
    const isFirstVisit = dungeon.level === 1;
    if (isFirstVisit && dungeonStories[dungeonId]) {
      setCurrentStory(dungeonStories[dungeonId].intro);
      setShowStory(true);
      setGameState('dungeon-story');
    } else {
      setGameState('tour-start');
    }
  };

  const proceedToActivity = (currentTour: any) => {
    if (!currentTour) return;
    const encounterMonster = Math.random() > 0.3;
    
    if (encounterMonster) {
      if (dungeonStories[currentTour.dungeonId]) {
        setCurrentStory(dungeonStories[currentTour.dungeonId].boss);
        setShowStory(true);
        setGameState('boss-story');
        return;
      }
      
      const monster = { 
        ...monsters[currentTour.dungeonId as keyof typeof monsters], 
        currentHp: monsters[currentTour.dungeonId as keyof typeof monsters].hp 
      };
      setBattleData({
        monster,
        currentCustomerIndex: 0,
        battleLog: [`야생의 ${monster.name}이(가) 나타났다!`]
      });
      setGameState('battle');
    } else {
      setGameState('minigame');
      
      if (currentTour.dungeonId === 1) {
        setMinigameData({
          type: 'slime',
          grid: Array(5).fill(null).map(() => 
            Array(5).fill(null).map(() => Math.random() > 0.6 ? 'slime' : 'empty')
          )
        });
      } else if (currentTour.dungeonId === 2) {
        setMinigameData({
          type: 'volcano',
          eruptions: [],
          score: 0,
          maxScore: 10,
          gameTime: 0,
          isPlaying: true
        });
      } else if (currentTour.dungeonId === 3) {
        const ghostPositions = [];
        while (ghostPositions.length < 5) {
          ghostPositions.push({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
        }
        setMinigameData({
          type: 'ghost',
          ghosts: ghostPositions.map((pos, i) => ({ ...pos, id: i, found: false })),
          foundCount: 0,
          totalGhosts: 5
        });
      }
    }
  };

  return {
    generateCustomers,
    startTour,
    proceedToActivity,
  };
};