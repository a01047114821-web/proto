import React from 'react';
import type { Customer } from '../types/index.js';
import { createCharacterSVG } from '../utils/characterSVG.js';

interface CustomerCardProps {
  customer: Customer;
  index: number;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, index }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-800">{customer.type}</div>
        </div>
      </div>
      
      <div 
        className="w-24 h-24 mx-auto mb-3"
        dangerouslySetInnerHTML={{ __html: createCharacterSVG(customer.type) }}
      />
      
      <div className="space-y-2">
        <div className={`text-xs px-3 py-1 rounded-full text-center text-white ${customer.color}`}>
          {customer.preference === 'thrill' ? '⚔️ 스릴 선호' : 
           customer.preference === 'safety' ? '💚 안전 선호' : 
           '💰 쇼핑 선호'}
        </div>
        <div className="text-sm text-gray-600 text-center">
          HP: {customer.hp} | 공격력: {customer.attack}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;