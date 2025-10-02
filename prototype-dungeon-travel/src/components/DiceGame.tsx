import React, { useState } from 'react';
import type { Customer } from '../types/index.js';
import { createCharacterSVG } from '../utils/characterSVG.js';

interface DiceGameProps {
  customers: Customer[];
  dungeonName: string;
  onComplete: (encounterMonster: boolean) => void;
}

const DiceGame: React.FC<DiceGameProps> = ({ customers, dungeonName, onComplete }) => {
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const rollDice = () => {
    setRolling(true);
    setShowResult(false);
    
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      
      if (count > 15) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setRolling(false);
        
        setTimeout(() => {
          setShowResult(true);
          // 1-3: 미니게임, 4-6: 전투
          const encounterMonster = finalValue >= 4;
          setTimeout(() => {
            onComplete(encounterMonster);
          }, 2000);
        }, 500);
      }
    }, 100);
  };

  const getDiceEmoji = (value: number | null) => {
    if (!value) return '🎲';
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[value - 1];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-indigo-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">🎲 {dungeonName} 진입!</h2>
        <p className="text-gray-600">주사위를 굴려 운명을 결정하세요</p>
      </div>

      {/* 고객 표시 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border-2 border-indigo-200">
        <h3 className="font-bold mb-4 text-center text-gray-800 text-lg">오늘의 관광객</h3>
        <div className="flex gap-4 justify-center flex-wrap">
          {customers.map((customer, idx) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="text-lg font-bold text-gray-800">{customer.type}</div>
              </div>
              <div 
                className="w-24 h-24 mx-auto"
                dangerouslySetInnerHTML={{ __html: createCharacterSVG(customer.type) }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 주사위 영역 */}
      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-12 mb-8">
        <div className="text-center">
          <div className={`text-9xl mb-6 transition-all duration-200 ${rolling ? 'animate-spin' : ''}`}>
            {getDiceEmoji(diceValue)}
          </div>
          
          {!rolling && !diceValue && (
            <button
              onClick={rollDice}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105"
            >
              주사위 굴리기 🎲
            </button>
          )}

          {rolling && (
            <div className="text-xl font-bold text-indigo-600 animate-pulse">
              주사위를 굴리는 중...
            </div>
          )}

          {showResult && diceValue && (
            <div className="space-y-4">
              <div className="text-3xl font-bold text-indigo-600">
                {diceValue}!
              </div>
              <div className="text-xl text-gray-700">
                {diceValue >= 4 ? (
                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                    <div className="text-2xl mb-2">⚔️</div>
                    <div className="font-bold text-red-600">몬스터 조우!</div>
                    <div className="text-sm text-red-500 mt-1">전투가 시작됩니다...</div>
                  </div>
                ) : (
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="font-bold text-green-600">안전한 구역!</div>
                    <div className="text-sm text-green-500 mt-1">미니게임을 진행합니다...</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 확률 안내 */}
      <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
        <div className="font-bold mb-2">확률 안내</div>
        <div className="flex justify-between">
          <span>🎮 미니게임 (1-3)</span>
          <span className="font-bold">50%</span>
        </div>
        <div className="flex justify-between">
          <span>⚔️ 몬스터 전투 (4-6)</span>
          <span className="font-bold">50%</span>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;