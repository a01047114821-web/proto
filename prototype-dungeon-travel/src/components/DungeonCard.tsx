import React from 'react';
import { Star, Calendar } from 'lucide-react';
import type { Dungeon } from '../types/index.js';

interface DungeonCardProps {
  dungeon: Dungeon;
  money: number;
  onStartTour: (id: number) => void;
  onBuy: (id: number) => void;
}

const DungeonCard: React.FC<DungeonCardProps> = ({ dungeon, money, onStartTour, onBuy }) => {
  return (
    <div className={`rounded-xl overflow-hidden shadow-md transition-all hover:shadow-xl ${
      dungeon.owned ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200' : 'bg-gray-50 border-2 border-gray-200'
    }`}>
      <div className={`h-40 flex items-center justify-center text-6xl ${
        dungeon.id === 1 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
        dungeon.id === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
        'bg-gradient-to-br from-purple-400 to-indigo-500'
      }`}>
        {dungeon.id === 1 ? '🟢' : dungeon.id === 2 ? '🌋' : '👻'}
      </div>
      
      <div className="p-5">
        {dungeon.owned && (
          <div className="inline-block bg-indigo-600 text-white text-xs px-3 py-1 rounded-full mb-2">
            보유중
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-1">{dungeon.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{dungeon.subtitle}</p>
        
        <div className="flex items-center gap-1 mb-3">
          {Array(5).fill(0).map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(dungeon.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">{dungeon.rating}</span>
        </div>
        
        {dungeon.owned ? (
          <>
            <div className="text-sm text-gray-700 mb-3 space-y-1">
              <div className="flex justify-between">
                <span>등급</span>
                <span className="font-semibold">Lv.{dungeon.level}</span>
              </div>
              <div className="flex justify-between">
                <span>운영비</span>
                <span className="font-semibold">{dungeon.maintenance}원</span>
              </div>
            </div>
            <button
              onClick={() => onStartTour(dungeon.id)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-bold shadow-md transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                투어 시작
              </div>
            </button>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-indigo-600 mb-3">
              {dungeon.cost?.toLocaleString()}원
            </div>
            <button
              onClick={() => onBuy(dungeon.id)}
              disabled={money < (dungeon.cost || 0)}
              className={`w-full py-3 rounded-lg font-bold transition-all ${
                money >= (dungeon.cost || 0)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {money >= (dungeon.cost || 0) ? '상품 구매' : '예산 부족'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DungeonCard;