import React, { useState } from 'react';
import { Briefcase, TrendingUp, Award, Target } from 'lucide-react';
import type { Employee, DungeonUpgrade, Challenge } from '../types/upgrade.js';

interface UpgradePanelProps {
  money: number;
  reputation: number;
  employees: Employee[];
  upgrades: DungeonUpgrade[];
  challenges: Challenge[];
  onHireEmployee: (employeeId: string) => void;
  onBuyUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

const UpgradePanel: React.FC<UpgradePanelProps> = ({
  money,
  reputation,
  employees,
  upgrades,
  challenges,
  onHireEmployee,
  onBuyUpgrade,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'upgrades' | 'challenges'>('employees');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🏢 경영 관리</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full transition-all"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div>💰 {money.toLocaleString()}원</div>
            <div>⭐ 평판 {reputation}</div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex-1 py-3 font-bold transition-all ${
              activeTab === 'employees'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="inline w-5 h-5 mr-2" />
            직원 고용
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-3 font-bold transition-all ${
              activeTab === 'upgrades'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="inline w-5 h-5 mr-2" />
            던전 업그레이드
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-3 font-bold transition-all ${
              activeTab === 'challenges'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="inline w-5 h-5 mr-2" />
            도전 과제
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">직원을 고용하여 사업을 확장하세요!</p>
              
              {/* 고용된 직원 */}
              {employees.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">고용된 직원</h3>
                  <div className="space-y-2">
                    {employees.map(emp => (
                      <div key={emp.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-800">{emp.name}</div>
                            <div className="text-sm text-gray-600">{emp.effect}</div>
                          </div>
                          <div className="text-sm text-gray-500">급여: {emp.salary}원/회</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 고용 가능한 직원 */}
              <h3 className="font-bold text-lg mb-3">고용 가능</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'guide1', name: '초보 가이드', salary: 100, effect: '고객 만족도 +10%', icon: '👨‍🏫' },
                  { id: 'guide2', name: '전문 가이드', salary: 200, effect: '고객 만족도 +20%', icon: '👨‍🎓' },
                  { id: 'cleaner1', name: '청소부', salary: 80, effect: '안전도 +15%', icon: '🧹' },
                  { id: 'marketer1', name: '마케터', salary: 150, effect: '평판 획득 +25%', icon: '📢' },
                ].map(emp => {
                  const alreadyHired = employees.some(e => e.id === emp.id);
                  return (
                    <div key={emp.id} className={`border-2 rounded-lg p-4 ${
                      alreadyHired ? 'bg-gray-100 border-gray-300' : 'bg-white border-indigo-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{emp.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold">{emp.name}</div>
                          <div className="text-sm text-gray-600">{emp.effect}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-gray-500">급여: {emp.salary}원/회</div>
                        <button
                          onClick={() => onHireEmployee(emp.id)}
                          disabled={alreadyHired || money < emp.salary * 5}
                          className={`px-4 py-2 rounded font-bold text-sm ${
                            alreadyHired
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : money >= emp.salary * 5
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {alreadyHired ? '고용됨' : `고용 (${emp.salary * 5}원)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">던전을 업그레이드하여 수익을 높이세요!</p>
              <div className="grid grid-cols-1 gap-4">
                {upgrades.map(upgrade => (
                  <div key={upgrade.id} className={`border-2 rounded-lg p-4 ${
                    upgrade.purchased ? 'bg-gray-100 border-gray-300' : 'bg-white border-purple-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{upgrade.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{upgrade.description}</div>
                        <div className="flex gap-2 flex-wrap text-xs">
                          {upgrade.effect.safety && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              안전도 +{upgrade.effect.safety}
                            </span>
                          )}
                          {upgrade.effect.thrill && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                              스릴 +{upgrade.effect.thrill}
                            </span>
                          )}
                          {upgrade.effect.shopping && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              쇼핑 +{upgrade.effect.shopping}
                            </span>
                          )}
                          {upgrade.effect.revenue && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              수익 +{upgrade.effect.revenue}원
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onBuyUpgrade(upgrade.id)}
                        disabled={upgrade.purchased || money < upgrade.cost}
                        className={`ml-4 px-4 py-2 rounded font-bold text-sm whitespace-nowrap ${
                          upgrade.purchased
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : money >= upgrade.cost
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {upgrade.purchased ? '구매완료' : `${upgrade.cost.toLocaleString()}원`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">도전 과제를 완료하고 보상을 받으세요!</p>
              <div className="space-y-4">
                {challenges.map(challenge => (
                  <div key={challenge.id} className={`border-2 rounded-lg p-4 ${
                    challenge.completed ? 'bg-green-50 border-green-300' : 'bg-white border-indigo-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-lg flex items-center gap-2">
                          {challenge.title}
                          {challenge.completed && <span className="text-green-600">✓</span>}
                        </div>
                        <div className="text-sm text-gray-600">{challenge.description}</div>
                      </div>
                      <div className="text-right text-sm">
                        {challenge.reward.money && <div>💰 +{challenge.reward.money}원</div>}
                        {challenge.reward.reputation && <div>⭐ +{challenge.reward.reputation}</div>}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          challenge.completed ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {challenge.progress} / {challenge.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradePanel;