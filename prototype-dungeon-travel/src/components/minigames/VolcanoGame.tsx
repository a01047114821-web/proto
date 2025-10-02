import React from 'react';
import type { Customer } from '../../types/index.js';
import { createCharacterSVG } from '../../utils/characterSVG.js';

interface Eruption {
  id: number;
  position: number;
  timeLeft: number;
  canClick: boolean;
}

interface VolcanoGameProps {
  score: number;
  maxScore: number;
  eruptions: Eruption[];
  customers: Customer[];
  onEruptionClick: (id: number) => void;
  onSkip: () => void;
}

const VolcanoGame: React.FC<VolcanoGameProps> = ({ 
  score, 
  maxScore, 
  eruptions, 
  customers, 
  onEruptionClick, 
  onSkip 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-orange-600 mb-2">🌋 화산 다리 설치</h2>
        <p className="text-gray-600">분출이 노란색일 때 클릭하여 다리를 설치하세요!</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-white">진행도: {score} / {maxScore}</span>
          <span className="text-lg text-orange-400">🔥 타이밍이 중요합니다!</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div 
            className="bg-orange-500 h-4 rounded-full transition-all"
            style={{ width: `${(score / maxScore) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-red-900 to-orange-900 rounded-lg p-8 h-96">
        <div className="flex justify-around items-end h-full">
          {[0, 1, 2, 3, 4].map(position => {
            const eruption = eruptions.find(e => e.position === position);
            return (
              <div key={position} className="flex flex-col items-center">
                {eruption && (
                  <button
                    onClick={() => onEruptionClick(eruption.id)}
                    className={`mb-4 transition-all transform ${
                      eruption.canClick 
                        ? 'text-6xl animate-pulse cursor-pointer hover:scale-110' 
                        : 'text-4xl opacity-50'
                    }`}
                    style={{
                      color: eruption.timeLeft === 3 ? '#EF4444' : eruption.timeLeft === 2 ? '#FBBF24' : '#DC2626'
                    }}
                  >
                    🔥
                  </button>
                )}
                <div className="w-16 h-16 bg-red-800 rounded-full border-4 border-red-600 flex items-center justify-center">
                  <span className="text-2xl">🌋</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mt-6 mb-6 border-2 border-indigo-200">
        <h3 className="font-bold mb-3 text-center text-gray-700">오늘의 관광객</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          {customers.map(customer => (
            <div key={customer.id} className="bg-white rounded-xl shadow-md p-3">
              <div 
                className="w-20 h-20 mb-2"
                dangerouslySetInnerHTML={{ __html: createCharacterSVG(customer.type) }}
              />
              <div className="text-sm text-center font-bold text-gray-800">{customer.type}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onSkip}
          className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-bold text-white"
        >
          건너뛰기 (패널티)
        </button>
      </div>
    </div>
  );
};

export default VolcanoGame;