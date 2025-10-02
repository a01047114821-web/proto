import React from 'react';
//import { Building2, Star, Coins } from 'lucide-react';

import { Coins,Star,Building2 } from 'lucide-react';
interface HeaderProps {
  money: number;
  reputation: number;
}

const Header: React.FC<HeaderProps> = ({ money, reputation }) => {
  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-xl">
              <Building2 className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                던전 투어 여행사
              </h1>
              <p className="text-gray-600 text-sm">Dungeon Tourism Agency</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Coins className="text-amber-500 w-5 h-5" />
                <span className="text-2xl font-bold text-gray-800">{money.toLocaleString()}</span>
                <span className="text-gray-500">원</span>
              </div>
              <div className="flex items-center gap-2 justify-end mt-1">
                <Star className="text-yellow-500 w-4 h-4" />
                <span className="text-sm text-gray-600">평판 {reputation}점</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;