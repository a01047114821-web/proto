import React, { useEffect } from 'react';
import { MapPin, Award, Settings } from 'lucide-react';
import Header from './components/Header.js';
import DungeonCard from './components/DungeonCard.js';
import TourStart from './components/TourStart.js';
import Battle from './components/Battle.js';
import SlimeGame from './components/minigames/SlimeGame.js';
import VolcanoGame from './components/minigames/VolcanoGame.js';
import GhostGame from './components/minigames/GhostGame.js';
import TourResult from './components/TourResult.js';
import ReviewCard from './components/ReviewCard.js';
import StoryScene from './components/StoryScene.js';
import UpgradePanel from './components/UpgradePanel.js';
import RandomEventComponent from './components/RandomEvent.js';
import DiceGame from './components/DiceGame.js';
import { useGameState } from './hooks/useGameState.js';
import { useTourLogic } from './hooks/useTourLogic.js';
import { useUpgradeLogic } from './hooks/useUpgradeLogic.js';
import { useBattleLogic } from './hooks/useBattleLogic.js';
import { monsters, dungeonFeatures, initialDungeons } from './constants/gameData.js';
import { dungeonStories, endings, introStory } from './constants/storyData.js';

const App: React.FC = () => {
  const state = useGameState();
  
  const completeTour = (success: boolean) => {
    if (!state.currentTour) return;
    
    const purchasedUpgrades = state.upgrades.filter(u => u.purchased && u.dungeonId === state.currentTour!.dungeonId);
    let bonusRevenue = 0;
    let modifiedFeatures = { ...dungeonFeatures[state.currentTour.dungeonId as keyof typeof dungeonFeatures] };
    
    purchasedUpgrades.forEach(upgrade => {
      if (upgrade.effect.revenue) bonusRevenue += upgrade.effect.revenue;
      if (upgrade.effect.safety) modifiedFeatures.safety += upgrade.effect.safety;
      if (upgrade.effect.thrill) modifiedFeatures.thrill += upgrade.effect.thrill;
      if (upgrade.effect.shopping) modifiedFeatures.shopping += upgrade.effect.shopping;
    });
    
    const updatedCustomers = state.customers.map(customer => {
      let satisfaction = 50;
      if (customer.preference === 'thrill') satisfaction += modifiedFeatures.thrill * 5;
      if (customer.preference === 'safety') satisfaction += modifiedFeatures.safety * 5;
      if (customer.preference === 'shopping') satisfaction += modifiedFeatures.shopping * 5;
      if (success) satisfaction += 20;
      if (customer.currentHp > customer.maxHp * 0.7) satisfaction += 10;
      
      const guideBonus = state.employees.filter(e => e.type === 'guide').reduce((sum, e) => sum + e.bonus, 0);
      satisfaction += satisfaction * (guideBonus / 100);
      
      return { ...customer, satisfaction: Math.min(100, satisfaction) };
    });

    const baseRevenue = 200;
    const avgSatisfaction = updatedCustomers.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / updatedCustomers.length;
    let revenue = Math.floor(baseRevenue * (avgSatisfaction / 50)) + bonusRevenue;
    
    const totalSalary = state.employees.reduce((sum, e) => sum + e.salary, 0);
    revenue -= totalSalary;

    state.setMoney(prev => prev + revenue);
    
    const marketerBonus = state.employees.filter(e => e.type === 'marketer').reduce((sum, e) => sum + e.bonus, 0);
    let reputationGain = Math.floor(avgSatisfaction / 20);
    reputationGain += reputationGain * (marketerBonus / 100);
    state.setReputation(prev => Math.min(100, prev + Math.floor(reputationGain)));

    const reviewTemplates = [
      { text: '#스릴쩔었음 #다신안와', condition: (s: number) => s > 70 && modifiedFeatures.thrill > 7 },
      { text: '#안전하고좋아요 #가족추천', condition: (s: number) => s > 70 && modifiedFeatures.safety > 7 },
      { text: '#기념품대박 #지갑주의', condition: (s: number) => s > 70 && modifiedFeatures.shopping > 7 },
      { text: '#몬스터박진감 #생생했음', condition: (s: number) => s > 70 },
      { text: '#별로였음 #비추', condition: (s: number) => s < 40 },
      { text: '#그냥저냥 #한번쯤', condition: (s: number) => s >= 40 && s <= 60 },
      { text: '#완전최고 #재방문의사100%', condition: (s: number) => s > 85 }
    ];

    const newReviews = updatedCustomers.map(customer => {
      const possibleReviews = reviewTemplates.filter(r => r.condition(customer.satisfaction!));
      const review = possibleReviews[Math.floor(Math.random() * possibleReviews.length)] || reviewTemplates[4];
      return { customer: customer.type, text: review.text, stars: Math.floor((customer.satisfaction || 0) / 20) };
    });

    state.setReviews(prev => [...newReviews, ...prev].slice(0, 10));
    state.setCustomers(updatedCustomers);
    
    if (updatedCustomers.some(c => c.satisfaction === 100)) {
      state.setChallenges(prev => prev.map(ch => 
        ch.id === 'challenge5' ? { ...ch, progress: 1, completed: true } : ch
      ));
    }
    
    state.setGameState('review');
    state.setMinigameData(null);
    state.setBattleData(null);
    
    upgradeLogic.triggerRandomEvent();
    
    if (state.currentTour && dungeonStories[state.currentTour.dungeonId] && success) {
      setTimeout(() => {
        state.setCurrentStory(dungeonStories[state.currentTour!.dungeonId].completion);
        state.setShowStory(true);
        state.setGameState('completion-story');
      }, 2000);
    } else {
      checkEnding();
    }
  };

  const tourLogic = useTourLogic(
    state.setCustomers,
    state.setCurrentTour,
    state.setGameState,
    state.setCurrentStory,
    state.setShowStory,
    state.setBattleData,
    state.setMinigameData,
    state.dungeons
  );

  const upgradeLogic = useUpgradeLogic(
    state.money,
    state.setMoney,
    state.reputation,
    state.setReputation,
    state.employees,
    state.setEmployees,
    state.upgrades,
    state.setUpgrades,
    state.setDungeons,
    state.challenges,
    state.setChallenges,
    state.tourCount,
    state.dungeons,
    state.eventTriggerCount,
    state.setEventTriggerCount,
    state.setCurrentEvent
  );

  const battleLogic = useBattleLogic(
    state.customers,
    state.setCustomers,
    state.battleData,
    state.setBattleData,
    completeTour
  );

  const handleIntroComplete = () => {
    state.setShowStory(false);
    state.setGameState('main');
  };

  const handleDiceComplete = (encounterMonster: boolean) => {
    if (!state.currentTour) return;
    
    if (encounterMonster) {
      if (dungeonStories[state.currentTour.dungeonId]) {
        state.setCurrentStory(dungeonStories[state.currentTour.dungeonId].boss);
        state.setShowStory(true);
        state.setGameState('boss-story');
        return;
      }
      
      const monster = { 
        ...monsters[state.currentTour.dungeonId as keyof typeof monsters], 
        currentHp: monsters[state.currentTour.dungeonId as keyof typeof monsters].hp 
      };
      state.setBattleData({
        monster,
        currentCustomerIndex: 0,
        battleLog: [`야생의 ${monster.name}이(가) 나타났다!`]
      });
      state.setGameState('battle');
    } else {
      state.setGameState('minigame');
      
      if (state.currentTour.dungeonId === 1) {
        state.setMinigameData({
          type: 'slime',
          grid: Array(5).fill(null).map(() => 
            Array(5).fill(null).map(() => Math.random() > 0.6 ? 'slime' : 'empty')
          )
        });
      } else if (state.currentTour.dungeonId === 2) {
        state.setMinigameData({
          type: 'volcano',
          eruptions: [],
          score: 0,
          maxScore: 10,
          gameTime: 0,
          isPlaying: true
        });
      } else if (state.currentTour.dungeonId === 3) {
        const ghostPositions = [];
        while (ghostPositions.length < 5) {
          ghostPositions.push({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
        }
        state.setMinigameData({
          type: 'ghost',
          ghosts: ghostPositions.map((pos, i) => ({ ...pos, id: i, found: false })),
          foundCount: 0,
          totalGhosts: 5
        });
      }
    }
  };

  const handleDungeonStoryComplete = () => {
    state.setShowStory(false);
    state.setGameState('dice');
  };

  const handleBossStoryComplete = () => {
    state.setShowStory(false);
    if (!state.currentTour) return;
    
    const monster = { 
      ...monsters[state.currentTour.dungeonId as keyof typeof monsters], 
      currentHp: monsters[state.currentTour.dungeonId as keyof typeof monsters].hp 
    };
    state.setBattleData({
      monster,
      currentCustomerIndex: 0,
      battleLog: [`야생의 ${monster.name}이(가) 나타났다!`]
    });
    state.setGameState('battle');
  };

  const checkEnding = () => {
    const newTourCount = state.tourCount + 1;
    state.setTourCount(newTourCount);
    
    if (newTourCount >= 10) {
      let endingType: 'bad' | 'normal' | 'good' | 'true' = 'normal';
      
      if (state.reputation >= 90 && state.money >= 5000) {
        endingType = 'true';
      } else if (state.reputation >= 70 && state.money >= 3000) {
        endingType = 'good';
      } else if (state.reputation < 30 || state.money < 500) {
        endingType = 'bad';
      }
      
      state.setCurrentStory(endings[endingType]);
      state.setShowStory(true);
      state.setGameState('ending');
    }
  };

  const handleCompletionStoryEnd = () => {
    state.setShowStory(false);
    checkEnding();
    state.setGameState('review');
  };

  const handleEndingComplete = () => {
    state.setGameState('intro');
    state.setMoney(1000);
    state.setReputation(50);
    state.setDungeons(initialDungeons);
    state.setReviews([]);
    state.setTourCount(0);
    state.setCurrentStory(introStory);
    state.setShowStory(true);
    state.setEmployees([]);
    state.setUpgrades(state.upgrades.map(u => ({ ...u, purchased: false })));
  };

  const buyDungeon = (dungeonId: number) => {
    const dungeon = state.dungeons.find(d => d.id === dungeonId);
    if (!dungeon || state.money < (dungeon.cost || 0)) return;
    state.setMoney(prev => prev - (dungeon.cost || 0));
    state.setDungeons(prev => prev.map(d => 
      d.id === dungeonId ? { ...d, owned: true, level: 1 } : d
    ));
  };

  const handleSlimeClick = (row: number, col: number) => {
    if (!state.minigameData) return;
    const newGrid = state.minigameData.grid.map((r: string[], i: number) => 
      r.map((cell: string, j: number) => (i === row && j === col && cell === 'slime') ? 'empty' : cell)
    );
    state.setMinigameData({ ...state.minigameData, grid: newGrid });
    const hasSlime = newGrid.some((row: string[]) => row.some((cell: string) => cell === 'slime'));
    if (!hasSlime) setTimeout(() => completeTour(true), 500);
  };

  useEffect(() => {
    if (state.minigameData?.type === 'volcano' && state.minigameData.isPlaying) {
      const interval = setInterval(() => {
        state.setMinigameData(prev => {
          if (!prev || prev.type !== 'volcano') return prev;
          if (prev.score >= prev.maxScore) {
            setTimeout(() => completeTour(true), 500);
            return { ...prev, isPlaying: false };
          }
          let newEruptions = prev.eruptions.map((e: any) => ({ ...e, timeLeft: e.timeLeft - 1 })).filter((e: any) => e.timeLeft > 0);
          if (Math.random() > 0.7 && newEruptions.length < 3) {
            newEruptions.push({ id: Date.now(), position: Math.floor(Math.random() * 5), timeLeft: 3, canClick: false });
          }
          newEruptions = newEruptions.map((e: any) => ({ ...e, canClick: e.timeLeft === 2 }));
          return { ...prev, eruptions: newEruptions };
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [state.minigameData?.type, state.minigameData?.isPlaying]);

  const handleVolcanoClick = (eruptionId: number) => {
    if (!state.minigameData) return;
    const eruption = state.minigameData.eruptions.find((e: any) => e.id === eruptionId);
    if (!eruption || !eruption.canClick) return;
    state.setMinigameData({
      ...state.minigameData,
      eruptions: state.minigameData.eruptions.filter((e: any) => e.id !== eruptionId),
      score: state.minigameData.score + 1
    });
  };

  const handleGhostClick = (ghostId: number) => {
    if (!state.minigameData) return;
    const newGhosts = state.minigameData.ghosts.map((ghost: any) => 
      ghost.id === ghostId ? { ...ghost, found: true } : ghost
    );
    const newFoundCount = newGhosts.filter((g: any) => g.found).length;
    state.setMinigameData({ ...state.minigameData, ghosts: newGhosts, foundCount: newFoundCount });
    if (newFoundCount >= state.minigameData.totalGhosts) setTimeout(() => completeTour(true), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Header money={state.money} reputation={state.reputation} />

      <div className="max-w-7xl mx-auto">
        {state.currentEvent && (
          <RandomEventComponent event={state.currentEvent} onChoice={upgradeLogic.handleEventChoice} />
        )}
        
        {state.showUpgradePanel && (
          <UpgradePanel
            money={state.money}
            reputation={state.reputation}
            employees={state.employees}
            upgrades={state.upgrades}
            challenges={state.challenges}
            onHireEmployee={upgradeLogic.handleHireEmployee}
            onBuyUpgrade={upgradeLogic.handleBuyUpgrade}
            onClose={() => state.setShowUpgradePanel(false)}
          />
        )}
        
        {state.showStory && state.gameState === 'intro' && (
          <StoryScene scenes={state.currentStory} onComplete={handleIntroComplete} />
        )}
        
        {state.showStory && state.gameState === 'dungeon-story' && (
          <StoryScene scenes={state.currentStory} onComplete={handleDungeonStoryComplete} />
        )}
        
        {state.showStory && state.gameState === 'boss-story' && (
          <StoryScene scenes={state.currentStory} onComplete={handleBossStoryComplete} />
        )}
        
        {state.showStory && state.gameState === 'completion-story' && (
          <StoryScene scenes={state.currentStory} onComplete={handleCompletionStoryEnd} />
        )}
        
        {state.showStory && state.gameState === 'ending' && (
          <StoryScene scenes={state.currentStory} onComplete={handleEndingComplete} />
        )}

        {state.gameState === 'tour-start' && state.currentTour && (
          <TourStart
            dungeonName={state.currentTour.dungeon}
            dungeonId={state.currentTour.dungeonId}
            customers={state.customers}
            onStart={() => state.setGameState('dice')}
          />
        )}

        {state.gameState === 'dice' && state.currentTour && (
          <DiceGame
            customers={state.customers}
            dungeonName={state.currentTour.dungeon}
            onComplete={handleDiceComplete}
          />
        )}

        {state.gameState === 'main' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => state.setShowUpgradePanel(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                경영 관리
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-indigo-600 w-7 h-7" />
                <h2 className="text-2xl font-bold text-gray-800">인기 투어 상품</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {state.dungeons.map(dungeon => (
                  <DungeonCard
                    key={dungeon.id}
                    dungeon={dungeon}
                    money={state.money}
                    onStartTour={tourLogic.startTour}
                    onBuy={buyDungeon}
                  />
                ))}
              </div>
            </div>

            {state.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-indigo-100">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-purple-600 w-7 h-7" />
                  <h2 className="text-2xl font-bold text-gray-800">고객 후기</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.reviews.slice(0, 6).map((review, i) => (
                    <ReviewCard key={i} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {state.gameState === 'battle' && state.battleData && (
          <Battle
            battleData={state.battleData}
            customers={state.customers}
            onAttack={battleLogic.handleAttack}
          />
        )}

        {state.gameState === 'minigame' && state.minigameData?.type === 'slime' && (
          <SlimeGame
            grid={state.minigameData.grid}
            customers={state.customers}
            onCellClick={handleSlimeClick}
            onSkip={() => completeTour(false)}
          />
        )}

        {state.gameState === 'minigame' && state.minigameData?.type === 'volcano' && (
          <VolcanoGame
            score={state.minigameData.score}
            maxScore={state.minigameData.maxScore}
            eruptions={state.minigameData.eruptions}
            customers={state.customers}
            onEruptionClick={handleVolcanoClick}
            onSkip={() => completeTour(false)}
          />
        )}

        {state.gameState === 'minigame' && state.minigameData?.type === 'ghost' && (
          <GhostGame
            ghosts={state.minigameData.ghosts}
            foundCount={state.minigameData.foundCount}
            totalGhosts={state.minigameData.totalGhosts}
            customers={state.customers}
            onGhostClick={handleGhostClick}
            onSkip={() => completeTour(false)}
          />
        )}

        {state.gameState === 'review' && (
          <TourResult
            customers={state.customers}
            onBackToMain={() => {
              state.setGameState('main');
              state.setCurrentTour(null);
              state.setCustomers([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;