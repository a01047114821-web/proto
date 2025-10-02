import React from 'react';
import type { Customer } from '../../types/index.js';
import { createCharacterSVG } from '../../utils/characterSVG.js';

interface SlimeGameProps {
  grid: string[][];
  customers: Customer[];
  onCellClick: (row: number, col: number) => void;
  onSkip: () => void;
}

const SlimeGame: React.FC<SlimeGameProps> = ({ grid, customers, onCellClick, onSkip }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-600 mb-2">🟢 슬라임 청소 작업</h2>
        <p className="text-gray-600">안전한 관광을 위해 슬라임을 제거해주세요</p>
      </div>
      
      <div className="flex justify-center mb-6">
        <div className="inline-grid grid-cols-5 gap-2">
          {grid.map((row, i) => 
            row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                onClick={() => onCellClick(i, j)}
                className={`w-16 h-16 rounded-lg text-3xl flex items-center justify-center transition-all ${
                  cell === 'slime' 
                    ? 'bg-green-500 hover:bg-green-600 cursor-pointer shadow-md' 
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {cell === 'slime' ? '🟢' : ''}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
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

export default SlimeGame;