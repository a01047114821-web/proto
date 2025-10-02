import React from 'react';
import type { Customer, BattleData } from '../types/index.js';
import { createCharacterSVG } from '../utils/characterSVG.js';

interface BattleProps {
  battleData: BattleData;
  customers: Customer[];
  onAttack: (skillIndex: number) => void;
}

const Battle: React.FC<BattleProps> = ({ battleData, customers, onAttack }) => {
  const currentCustomer = customers[battleData.currentCustomerIndex];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-red-600 mb-2">⚔️ 돌발 상황 발생!</h2>
        <p className="text-gray-600">고객을 안전하게 지켜주세요</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="text-center bg-red-50 p-6 rounded-xl">
          <div className="text-8xl mb-4 animate-bounce">{battleData.monster.emoji}</div>
          <h3 className="text-xl font-bold mb-2">{battleData.monster.name}</h3>
          <div className="bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-red-500 h-4 rounded-full transition-all"
              style={{ width: `${(battleData.monster.currentHp! / battleData.monster.hp) * 100}%` }}
            />
          </div>
          <p className="text-sm font-semibold">{battleData.monster.currentHp} / {battleData.monster.hp} HP</p>
        </div>

        <div className="text-center bg-blue-50 p-6 rounded-xl">
          <div 
            className="w-32 h-32 mx-auto mb-4"
            dangerouslySetInnerHTML={{ __html: createCharacterSVG(currentCustomer.type) }}
          />
          <h3 className="text-xl font-bold mb-2">{currentCustomer.type}</h3>
          <div className="bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${(currentCustomer.currentHp / currentCustomer.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-sm font-semibold">{currentCustomer.currentHp} / {currentCustomer.maxHp} HP</p>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl p-4 mb-6 h-32 overflow-y-auto">
        {battleData.battleLog.map((log, i) => (
          <p key={i} className="text-sm mb-1 text-gray-700">{log}</p>
        ))}
      </div>

      {battleData.monster.currentHp! > 0 && currentCustomer.currentHp > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {currentCustomer.skills.map((skill, i) => (
            <button
              key={i}
              onClick={() => onAttack(i)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Battle;