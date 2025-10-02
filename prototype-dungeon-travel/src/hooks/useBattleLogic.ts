import type { Customer, BattleData } from '../types/index.js';

export const useBattleLogic = (
  customers: Customer[],
  setCustomers: (fn: (prev: Customer[]) => Customer[]) => void,
  battleData: BattleData | null,
  setBattleData: (data: any) => void,
  completeTour: (success: boolean) => void
) => {
  const handleAttack = (skillIndex: number) => {
    if (!battleData) return;
    const currentCustomer = customers[battleData.currentCustomerIndex];
    const monster = battleData.monster;
    const skill = currentCustomer.skills[skillIndex];
    
    let damage = currentCustomer.attack + Math.floor(Math.random() * 5);
    if (skill === '강타') damage *= 1.5;
    
    if (skill === '치유') {
      const healAmount = 20;
      const newCustomers = [...customers];
      newCustomers[battleData.currentCustomerIndex].currentHp = Math.min(
        currentCustomer.maxHp,
        currentCustomer.currentHp + healAmount
      );
      setCustomers(() => newCustomers);
      setBattleData({
        ...battleData,
        battleLog: [...battleData.battleLog, `${currentCustomer.type}이(가) ${skill}을(를) 사용했다! HP +${healAmount}`]
      });
      return;
    }

    const newMonsterHp = Math.max(0, monster.currentHp! - Math.floor(damage));
    const newLog = [...battleData.battleLog, `${currentCustomer.type}의 ${skill}! ${Math.floor(damage)}의 데미지!`];

    if (newMonsterHp <= 0) {
      newLog.push(`${monster.name}을(를) 물리쳤다!`);
      setBattleData({ ...battleData, monster: { ...monster, currentHp: 0 }, battleLog: newLog });
      setTimeout(() => completeTour(true), 1500);
      return;
    }

    const monsterDamage = monster.attack + Math.floor(Math.random() * 3);
    const newCustomers = [...customers];
    newCustomers[battleData.currentCustomerIndex].currentHp = Math.max(0, currentCustomer.currentHp - monsterDamage);
    setCustomers(() => newCustomers);
    newLog.push(`${monster.name}의 공격! ${currentCustomer.type}에게 ${monsterDamage}의 데미지!`);

    if (newCustomers[battleData.currentCustomerIndex].currentHp <= 0) {
      newLog.push(`${currentCustomer.type}이(가) 쓰러졌다!`);
      let nextIndex = battleData.currentCustomerIndex + 1;
      while (nextIndex < customers.length && newCustomers[nextIndex].currentHp <= 0) {
        nextIndex++;
      }

      if (nextIndex >= customers.length) {
        newLog.push('모든 고객이 쓰러졌다...');
        setBattleData({ ...battleData, monster: { ...monster, currentHp: newMonsterHp }, battleLog: newLog });
        setTimeout(() => completeTour(false), 1500);
        return;
      }

      setBattleData({
        ...battleData,
        monster: { ...monster, currentHp: newMonsterHp },
        currentCustomerIndex: nextIndex,
        battleLog: newLog
      });
    } else {
      setBattleData({ ...battleData, monster: { ...monster, currentHp: newMonsterHp }, battleLog: newLog });
    }
  };

  return { handleAttack };
};