import React, { useState } from 'react';
import type { RandomEvent, EventChoice } from '../types/upgrade.js';

interface RandomEventProps {
  event: RandomEvent;
  onChoice: (choice: EventChoice) => void;
}

const RandomEventComponent: React.FC<RandomEventProps> = ({ event, onChoice }) => {
  const [showResult, setShowResult] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);

  const handleChoice = (choice: EventChoice) => {
    setSelectedChoice(choice);
    setShowResult(true);
    setTimeout(() => {
      onChoice(choice);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* 헤더 */}
        <div className={`p-6 text-white ${
          event.type === 'crisis' 
            ? 'bg-gradient-to-r from-red-600 to-orange-600' 
            : 'bg-gradient-to-r from-green-600 to-emerald-600'
        }`}>
          <div className="text-sm font-bold mb-1">
            {event.type === 'crisis' ? '⚠️ 위기 발생!' : '✨ 기회 도래!'}
          </div>
          <h2 className="text-2xl font-bold">{event.title}</h2>
        </div>

        {/* 내용 */}
        <div className="p-8">
          {!showResult ? (
            <>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {event.description}
              </p>

              <div className="space-y-3">
                {event.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                      event.type === 'crisis'
                        ? 'border-red-200 hover:border-red-400 hover:bg-red-50'
                        : 'border-green-200 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800">{choice.text}</span>
                      <span className="text-2xl">→</span>
                    </div>
                    {(choice.moneyChange || choice.reputationChange) && (
                      <div className="text-sm text-gray-600 mt-2 flex gap-3">
                        {choice.moneyChange && (
                          <span className={choice.moneyChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            💰 {choice.moneyChange > 0 ? '+' : ''}{choice.moneyChange}원
                          </span>
                        )}
                        {choice.reputationChange && (
                          <span className={choice.reputationChange > 0 ? 'text-green-600' : 'text-red-600'}>
                            ⭐ {choice.reputationChange > 0 ? '+' : ''}{choice.reputationChange}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">
                {event.type === 'crisis' ? '😰' : '😊'}
              </div>
              <p className="text-xl text-gray-700 font-medium">
                {selectedChoice?.result}
              </p>
              <div className="mt-4 text-gray-500 text-sm">
                결과를 적용하는 중...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomEventComponent;