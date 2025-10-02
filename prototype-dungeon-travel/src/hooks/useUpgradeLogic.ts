import { useEffect } from 'react';
import type { Employee, DungeonUpgrade, Challenge, EventChoice } from '../types/upgrade.js';
import { employeeTypes, randomEvents } from '../constants/upgradeData.js';

export const useUpgradeLogic = (
  money: number,
  setMoney: (fn: (prev: number) => number) => void,
  reputation: number,
  setReputation: (fn: (prev: number) => number) => void,
  employees: Employee[],
  setEmployees: (fn: (prev: Employee[]) => Employee[]) => void,
  upgrades: DungeonUpgrade[],
  setUpgrades: (fn: (prev: DungeonUpgrade[]) => DungeonUpgrade[]) => void,
  setDungeons: (fn: (prev: any[]) => any[]) => void,
  challenges: Challenge[],
  setChallenges: (fn: (prev: Challenge[]) => Challenge[]) => void,
  tourCount: number,
  dungeons: any[],
  eventTriggerCount: number,
  setEventTriggerCount: (fn: (prev: number) => number) => void,
  setCurrentEvent: (event: any) => void
) => {
  const handleHireEmployee = (employeeId: string) => {
    const employeeTemplate = employeeTypes.find(e => e.id === employeeId);
    if (!employeeTemplate) return;
    
    const cost = employeeTemplate.salary * 5;
    if (money < cost) return;
    
    setMoney(prev => prev - cost);
    setEmployees(prev => [...prev, { ...employeeTemplate }]);
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || money < upgrade.cost) return;
    
    setMoney(prev => prev - upgrade.cost);
    setUpgrades(prev => prev.map(u => 
      u.id === upgradeId ? { ...u, purchased: true } : u
    ));
    
    setDungeons(prev => prev.map(d => {
      if (d.id === upgrade.dungeonId) {
        return { ...d };
      }
      return d;
    }));
  };

  const triggerRandomEvent = () => {
    const newCount = eventTriggerCount + 1;
    setEventTriggerCount(() => newCount);
    
    if (newCount % 3 === 0 && Math.random() < 0.3) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      setCurrentEvent(event);
    }
  };

  const handleEventChoice = (choice: EventChoice) => {
    if (choice.moneyChange) {
      setMoney(prev => Math.max(0, prev + choice.moneyChange!));
    }
    if (choice.reputationChange) {
      setReputation(prev => Math.max(0, Math.min(100, prev + choice.reputationChange!)));
    }
    setCurrentEvent(null);
  };

  const updateChallenges = () => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.completed) return challenge;
      
      let newProgress = challenge.progress;
      
      if (challenge.id === 'challenge1') {
        newProgress = tourCount;
      } else if (challenge.id === 'challenge2') {
        newProgress = reputation;
      } else if (challenge.id === 'challenge3') {
        newProgress = money;
      } else if (challenge.id === 'challenge4') {
        newProgress = dungeons.filter(d => d.owned).length;
      }
      
      const completed = newProgress >= challenge.target;
      
      if (completed && !challenge.completed) {
        if (challenge.reward.money) {
          setMoney(prev => prev + challenge.reward.money!);
        }
        if (challenge.reward.reputation) {
          setReputation(prev => Math.min(100, prev + challenge.reward.reputation!));
        }
      }
      
      return { ...challenge, progress: newProgress, completed };
    }));
  };

  useEffect(() => {
    updateChallenges();
  }, [tourCount, reputation, money, dungeons]);

  return {
    handleHireEmployee,
    handleBuyUpgrade,
    triggerRandomEvent,
    handleEventChoice,
  };
};