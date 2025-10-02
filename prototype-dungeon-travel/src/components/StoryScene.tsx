import React, { useState, useEffect } from 'react';
import type { StoryScene } from '../types/story.js';

interface StorySceneProps {
  scenes: StoryScene[];
  onComplete: () => void;
  autoPlay?: boolean;
}

const StorySceneComponent: React.FC<StorySceneProps> = ({ scenes, onComplete, autoPlay = false }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentScene = scenes[currentSceneIndex];

  useEffect(() => {
    if (!currentScene) return;

    setIsTyping(true);
    setDisplayedText('');
    
    let charIndex = 0;
    const text = currentScene.text;
    
    const interval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentSceneIndex, currentScene]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(currentScene.text);
      setIsTyping(false);
      return;
    }

    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!currentScene) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-purple-500">
          {/* 스피커 이름 */}
          {currentScene.speaker && (
            <div className="bg-purple-600 px-6 py-3">
              <h3 className="text-xl font-bold text-white">{currentScene.speaker}</h3>
            </div>
          )}

          {/* 텍스트 영역 */}
          <div className="p-8 min-h-[200px] flex items-center">
            <p className="text-2xl text-white leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse">▮</span>}
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Skip ⏭️
            </button>

            <div className="text-gray-500 text-sm">
              {currentSceneIndex + 1} / {scenes.length}
            </div>

            <button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
            >
              {currentSceneIndex < scenes.length - 1 ? 'Next ▶' : 'Complete ✓'}
            </button>
          </div>
        </div>

        {/* 힌트 */}
        <div className="text-center mt-4 text-gray-400 text-sm">
          클릭하여 계속 진행하거나 Skip으로 건너뛰기
        </div>
      </div>
    </div>
  );
};

export default StorySceneComponent;