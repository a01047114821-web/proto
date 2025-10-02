import React from 'react';
import type { Customer } from '../types/index.js';
import CustomerCard from './CustomerCard.js';

interface TourStartProps {
  dungeonName: string;
  dungeonId: number;
  customers: Customer[];
  onStart: () => void;
}

const TourStart: React.FC<TourStartProps> = ({ dungeonName, dungeonId, customers, onStart }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-indigo-200">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          {dungeonId === 1 ? '🟢' : dungeonId === 2 ? '🌋' : '👻'}
        </div>
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">{dungeonName} 투어</h2>
        <p className="text-gray-600">오늘의 관광객을 확인하세요</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
        <h3 className="font-bold mb-4 text-center text-gray-800 text-lg flex items-center justify-center gap-2">
          <span>👥</span> 참가자 명단
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customers.map((customer, idx) => (
            <CustomerCard key={customer.id} customer={customer} index={idx} />
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h4 className="font-bold text-yellow-800 mb-1">안전 안내사항</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 던전 내부에서 몬스터를 만날 수 있습니다</li>
              <li>• 미니게임을 통해 안전한 관광 환경을 조성해주세요</li>
              <li>• 고객의 만족도가 수익에 영향을 미칩니다</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
        >
          투어 시작하기 →
        </button>
      </div>
    </div>
  );
};

export default TourStart;