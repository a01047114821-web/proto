import React from 'react';
import type { Customer } from '../../types/index.js';
import { createCharacterSVG } from '../../utils/characterSVG.js';

interface Ghost {
  id: number;
  x: number;
  y: number;
  found: boolean;
}

interface GhostGameProps {
  ghosts: Ghost[];
  foundCount: number;
  totalGhosts: number;
  customers: Customer[];
  onGhostClick: (id: number) => void;
  onSkip: () => void;
}

const GhostGame: React.FC<GhostGameProps> = ({ 
  ghosts, 
  foundCount, 
  totalGhosts, 
  customers, 
  onGhostClick, 
  onSkip 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">👻 유령 찾기</h2>
        <p className="text-gray-600">숨어있는 유령 {totalGhosts}마리를 모두 찾으세요!</p>
      </div>
      
      <div className="bg-purple-900 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-white">발견: {foundCount} / {totalGhosts}</span>
          <span className="text-lg text-purple-300">👁️ 잘 살펴보세요!</span>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-32 bg-blue-900 opacity-30 rounded-lg" />
          <div className="absolute top-10 right-10 w-20 h-32 bg-blue-900 opacity-30 rounded-lg" />
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-800 opacity-20 rounded-full" />
          <div className="absolute bottom-10 left-20 w-32 h-16 bg-gray-800 opacity-40" />
          <div className="absolute bottom-10 right-20 w-24 h-40 bg-gray-700 opacity-40 rounded-t-lg" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-40 h-48 bg-red-900 opacity-30 rounded-lg" />
          <div className="absolute top-20 left-1/3 text-3xl">🕯️</div>
          <div className="absolute top-20 right-1/3 text-3xl">🕯️</div>
          <div className="absolute top-5 left-5 text-2xl">🕸️</div>
          <div className="absolute top-5 right-5 text-2xl">🕸️</div>
          <div className="absolute bottom-5 left-1/4 text-2xl">🕸️</div>
        </div>

        {ghosts.map(ghost => (
          <button
            key={ghost.id}
            onClick={() => onGhostClick(ghost.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
              ghost.found 
                ? 'text-6xl animate-bounce cursor-default' 
                : 'text-4xl opacity-10 hover:opacity-40 cursor-pointer hover:scale-110'
            }`}
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`
            }}
            disabled={ghost.found}
          >
            👻
          </button>
        ))}
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

export default GhostGame;