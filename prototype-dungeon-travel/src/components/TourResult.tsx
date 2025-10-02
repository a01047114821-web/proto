import React from 'react';
import type { Customer } from '../types/index.js';
import { createCharacterSVG } from '../utils/characterSVG.js';

interface TourResultProps {
  customers: Customer[];
  onBackToMain: () => void;
}

const TourResult: React.FC<TourResultProps> = ({ customers, onBackToMain }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-600 mb-2">✅ 투어 완료!</h2>
        <p className="text-gray-600">고객 만족도를 확인하세요</p>
      </div>
      
      <div className="space-y-4 mb-6">
        {customers.map((customer, i) => (
          <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200 flex items-center gap-4">
            <div 
              className="w-16 h-16 flex-shrink-0"
              dangerouslySetInnerHTML={{ __html: createCharacterSVG(customer.type) }}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-gray-800">{customer.type}</span>
                <span className="text-lg font-bold text-indigo-600">만족도: {customer.satisfaction}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    customer.satisfaction! > 70 ? 'bg-green-500' : 
                    customer.satisfaction! > 40 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${customer.satisfaction}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onBackToMain}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg"
        >
          본사로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default TourResult;