import React, { useState, useEffect, useRef } from "react";
import {
  Swords,
  Hammer,
  Flame,
  Droplet,
  Mountain,
  Sparkles,
  Home,
  Grid3x3,
  FlaskConical,
  Shield,
} from "lucide-react";
const COST_MULTIPLIER = 2;
const TowerCraft = () => {
  const [resources, setResources] = useState({
    wood: 10,
    stone: 5,
    water: 5,
    fire: 0,
    metal: 0,
    crystal: 0,
  });
  const [inventory, setInventory] = useState([
    {
      id: 1,
      type: "basic",
      name: "기본 타워",
      damage: 10,
      cooldown: 2000,
      hp: 100,
      maxHp: 100,
      level: 1,
      effect: "none",
    },
    {
      id: 2,
      type: "basic",
      name: "기본 타워",
      damage: 10,
      cooldown: 2000,
      hp: 100,
      maxHp: 100,
      level: 1,
      effect: "none",
    },
  ]);
  const [battleField, setBattleField] = useState(Array(36).fill(null));
  const [towerHealth, setTowerHealth] = useState({});
  const [selectedTower, setSelectedTower] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [wave, setWave] = useState(1);
  const [enemyCount, setEnemyCount] = useState(0);
  const [bossSpawned, setBossSpawned] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [maxPlayerHp] = useState(100);
  const [enemyTargets, setEnemyTargets] = useState({});
  const [craftGrid, setCraftGrid] = useState(Array(9).fill(null));
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [projectiles, setProjectiles] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState(null);
  const [showRecipes, setShowRecipes] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedMergeTowers, setSelectedMergeTowers] = useState([]);
  const [enemyEffects, setEnemyEffects] = useState({});
  const [unlockedRecipes, setUnlockedRecipes] = useState([0, 1, 2]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  const enemyIdRef = useRef(0);
  const projectileIdRef = useRef(0);
  const floatingTextIdRef = useRef(0);
  const towerIdRef = useRef(3);

  const resourceIcons = {
    wood: <Hammer className="w-4 h-4" />,
    stone: <Mountain className="w-4 h-4" />,
    water: <Droplet className="w-4 h-4" />,
    fire: <Flame className="w-4 h-4" />,
    metal: <Shield className="w-4 h-4" />,
    crystal: <Sparkles className="w-4 h-4" />,
  };

  const resourceNames = {
    wood: "나무",
    stone: "돌",
    water: "물",
    fire: "화염",
    metal: "금속",
    crystal: "크리스탈",
  };

  const resourceColors = {
    wood: "bg-amber-600",
    stone: "bg-gray-600",
    water: "bg-blue-500",
    fire: "bg-red-500",
    metal: "bg-slate-400",
    crystal: "bg-purple-500",
  };

  const recipes = [
    {
      name: "용암 타워",
      pattern: [null, null, null, null, "fire", null, "stone", "metal", null],
      damage: 25,
      cooldown: 3000,
      hp: 150,
      effect: "splash",
      description: "🔥 화염 코어 + 돌/금속 = 광역 폭발",
    },
    {
      name: "얼음 타워",
      pattern: [
        "water",
        null,
        "water",
        null,
        "crystal",
        null,
        null,
        null,
        null,
      ],
      damage: 12,
      cooldown: 2800,
      hp: 140,
      effect: "slow",
      description: "💎 크리스탈 코어 + 물 = 감속 효과",
    },
    {
      name: "기본 타워",
      pattern: ["wood", "wood", null, null, "stone", null, null, null, null],
      damage: 15,
      cooldown: 2000,
      hp: 100,
      effect: "none",
      description: "🗻 돌 코어 + 나무 = 기본 방어",
    },
    {
      name: "방어 타워",
      pattern: [
        null,
        null,
        null,
        "metal",
        "stone",
        "metal",
        null,
        "water",
        null,
      ],
      damage: 8,
      cooldown: 2500,
      hp: 250,
      effect: "tank",
      description: "🗻 돌 코어 + 금속 = 고체력 탱커",
    },
    {
      name: "번개 타워",
      pattern: [null, "fire", null, null, "crystal", null, null, "fire", null],
      damage: 35,
      cooldown: 3500,
      hp: 120,
      effect: "chain",
      description: "💎 크리스탈 코어 + 화염 = 연쇄 번개",
    },
    {
      name: "지옥 타워",
      pattern: [null, null, null, "fire", "fire", "fire", null, null, null],
      damage: 40,
      cooldown: 4000,
      hp: 100,
      effect: "burn",
      description: "🔥 3중 화염 코어 = 화상 데미지",
    },
    {
      name: "자연 타워",
      pattern: [null, "wood", null, "wood", "water", null, null, null, null],
      damage: 18,
      cooldown: 2200,
      hp: 180,
      effect: "poison",
      description: "💧 물 코어 + 나무 = 중독 효과",
    },
    {
      name: "힐링 타워",
      pattern: [null, null, null, "water", "crystal", "wood", null, null, null],
      damage: 5,
      cooldown: 4000,
      hp: 200,
      effect: "heal",
      description: "💎 크리스탈 코어 + 물/나무 = 치유",
    },
  ];

  // 자원 자동 증가
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setResources((prev) => ({
  //       wood: prev.wood + 1,
  //       stone: prev.stone + 0.5,
  //       water: prev.water + 0.5,
  //       fire: prev.fire + 0.3,
  //       metal: prev.metal + 0.2,
  //       crystal: prev.crystal + 0.1,
  //     }));
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  // 적 생성
  useEffect(() => {
    if (playerHp === 0) return;
    const spawnInterval = setInterval(() => {
      if (enemyCount >= 19 && !bossSpawned) {
        const lane = Math.floor(Math.random() * 6);
        const baseHp = 100 * Math.pow(1.3, wave - 1);
        const newBoss = {
          id: enemyIdRef.current++,
          hp: baseHp,
          name: `보스 웨이브 ${wave}`, // 👈 이름 필드 추가
          maxHp: baseHp,
          x: 90,
          lane,
          speed: 0.05,
          isBoss: true,
        };
        setEnemies((prev) => [...prev, newBoss]);
        setBossSpawned(true);
      } else if (enemyCount < 20) {
        const lane = Math.floor(Math.random() * 6);
        const baseHp = 30 * Math.pow(1.3, wave - 1);
        const newEnemy = {
          id: enemyIdRef.current++,
          hp: baseHp,
          maxHp: baseHp,
          x: 90,
          lane,
          speed: 0.1,
          isBoss: false,
        };
        setEnemies((prev) => [...prev, newEnemy]);
        setEnemyCount((prev) => prev + 1);
      }
    }, 3000);
    return () => clearInterval(spawnInterval);
  }, [wave, playerHp, enemyCount, bossSpawned]);

  // 현재 그리드가 레시피 패턴을 만족하는지
  const matchesPattern = (pattern) => {
    for (let i = 0; i < 9; i++) {
      if (pattern[i] !== null && craftGrid[i] !== pattern[i]) return false;
    }
    return true;
  };

  // 현재 그리드와 일치하는 "해금된" 레시피 찾기
  const getMatchedRecipe = () => {
    for (let i = 0; i < recipes.length; i++) {
      if (unlockedRecipes.includes(i) && matchesPattern(recipes[i].pattern)) {
        return { recipe: recipes[i], idx: i };
      }
    }
    return null;
  };

  // 객체 형태의 카운트 유틸
  const countBy = (arr) => {
    const m = {};
    arr.forEach((x) => {
      if (x) m[x] = (m[x] || 0) + 1;
    });
    return m;
  };
  // 게임 루프
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setEnemies((prev) => {
        const remaining = [];
        prev.forEach((enemy) => {
          const effect = enemyEffects[enemy.id];
          let newSpeed = enemy.speed;
          if (effect?.slow && Date.now() < effect.slow.endTime)
            newSpeed = enemy.speed * 0.5;

          const towersInLane = battleField
            .map((tower, idx) =>
              tower && Math.floor(idx / 6) === enemy.lane
                ? { tower, idx, col: idx % 6 }
                : null
            )
            .filter((t) => t !== null)
            .sort((a, b) => b.col - a.col);

          let shouldMove = true;
          let targetTower = null;

          if (towersInLane.length > 0) {
            const rightmostTower = towersInLane[0];
            const towerXPos = 20 + rightmostTower.col * 3.5;
            if (enemy.x <= towerXPos + 5 && enemy.x >= towerXPos - 2) {
              shouldMove = false;
              targetTower = rightmostTower.idx;
            }
          }

          let newX = enemy.x;
          if (shouldMove) newX = enemy.x - newSpeed;

          if (targetTower !== null) {
            setEnemyTargets((prevTargets) => ({
              ...prevTargets,
              [enemy.id]: targetTower,
            }));
          } else {
            setEnemyTargets((prevTargets) => {
              const nt = { ...prevTargets };
              delete nt[enemy.id];
              return nt;
            });
          }

          if (newX <= 5) {
            setPlayerHp((prevHp) => Math.max(0, prevHp - 10));
            addFloatingText("-10 HP", 10, 50, "fire");
          } else if (enemy.hp > 0) {
            remaining.push({ ...enemy, x: newX });
          }
        });
        return remaining;
      });

      // 적의 타워 공격
      const currentTime = Date.now();
      Object.entries(enemyTargets).forEach(([enemyId, towerIdx]) => {
        const enemy = enemies.find((e) => e.id === parseInt(enemyId));
        if (!enemy || enemy.hp <= 0) return;

        if (battleField[towerIdx]) {
          const lastAttackKey = `${enemyId}_${towerIdx}`;
          if (!window.lastTowerAttack) window.lastTowerAttack = {};
          if (
            !window.lastTowerAttack[lastAttackKey] ||
            currentTime - window.lastTowerAttack[lastAttackKey] >= 1000
          ) {
            window.lastTowerAttack[lastAttackKey] = currentTime;

            setTowerHealth((prevHealth) => {
              const tower = battleField[towerIdx];
              const currentHp = prevHealth[towerIdx] ?? tower.hp;
              const damage = 10;
              const newHp = currentHp - damage;
              const row = Math.floor(towerIdx / 6);
              const col = towerIdx % 6;
              const towerXPercent = 7 + col * 2.7;
              const towerYPercent = 32 + row * 7.3;
              addFloatingText(
                `-${damage}`,
                towerXPercent,
                towerYPercent,
                "fire"
              );

              if (newHp <= 0) {
                setBattleField((prevField) => {
                  const newField = [...prevField];
                  newField[towerIdx] = null;
                  return newField;
                });
                addFloatingText(
                  "타워 파괴!",
                  towerXPercent,
                  towerYPercent,
                  "fire"
                );
                setEnemyTargets((prevTargets) => {
                  const nt = { ...prevTargets };
                  delete nt[enemyId];
                  return nt;
                });
                return { ...prevHealth, [towerIdx]: 0 };
              }
              return { ...prevHealth, [towerIdx]: newHp };
            });
          }
        }
      });

      // DOT 데미지
      setEnemies((prev) =>
        prev.map((enemy) => {
          const effect = enemyEffects[enemy.id];
          let damage = 0;
          if (effect?.burn && Date.now() < effect.burn.endTime) damage += 0.4;
          if (effect?.poison && Date.now() < effect.poison.endTime)
            damage += 0.2;
          if (damage > 0) {
            const newHp = enemy.hp - damage;
            if (newHp <= 0) {
              const dropType = ["fire", "metal", "crystal"][
                Math.floor(Math.random() * 3)
              ];
              const dropAmount = Math.random() < 0.05 ? 10 : 1;
              setResources((prev) => ({
                ...prev,
                [dropType]: prev[dropType] + dropAmount,
              }));
              return { ...enemy, hp: 0 };
            }
            return { ...enemy, hp: newHp };
          }
          return enemy;
        })
      );

      // 발사체 이동
      setProjectiles((prev) =>
        prev
          .map((proj) => ({ ...proj, x: proj.x + proj.vx }))
          .filter((proj) => proj.x < 95)
      );

      // 충돌 처리
      setProjectiles((prevProj) => {
        const remainingProj = [];
        const projToRemove = new Set();
        prevProj.forEach((proj) => {
          if (projToRemove.has(proj.id)) return;
          const enemiesInLane = enemies
            .filter((e) => e.lane === proj.lane && e.hp > 0)
            .sort((a, b) => a.x - b.x);
          for (const enemy of enemiesInLane) {
            if (Math.abs(proj.x - enemy.x) < 5) {
              projToRemove.add(proj.id);
              if (proj.effect) {
                const now = Date.now();
                setEnemyEffects((prev) => ({
                  ...prev,
                  [enemy.id]: {
                    ...prev[enemy.id],
                    [proj.effect]: {
                      endTime: now + (proj.effect === "slow" ? 3000 : 5000),
                    },
                  },
                }));
              }
              const newHp = enemy.hp - proj.damage;
              addFloatingText(
                `-${proj.damage}`,
                enemy.x,
                50 + enemy.lane * 7.3,
                "fire"
              );

              setEnemies((prevEnemies) =>
                prevEnemies.map((e) => {
                  if (e.id === enemy.id) {
                    if (newHp <= 0) {
                      if (e.isBoss) {
                        setWave((prev) => {
                          const nextWave = prev + 1; // ✅ 레시피와 무관하게 웨이브 증가
                          const idx = 2 + nextWave; // 레시피가 있으면만 해금
                          if (recipes[idx]) {
                            setUnlockedRecipes((prevUnlocked) => {
                              if (!prevUnlocked.includes(idx)) {
                                const newUnlocked = [...prevUnlocked, idx];
                                setNotificationText(
                                  `🎉 새 레시피 해금: ${recipes[idx].name}`
                                );
                                setShowNotification(true);
                                setTimeout(
                                  () => setShowNotification(false),
                                  3000
                                );
                                return newUnlocked;
                              }
                              return prevUnlocked;
                            });
                          }
                          return nextWave;
                        });

                        setEnemyCount(0);
                        setBossSpawned(false);
                        addFloatingText("웨이브 클리어!", 50, 50, "crystal");
                      }
                      const dropType = ["fire", "metal", "crystal"][
                        Math.floor(Math.random() * 3)
                      ];
                      const dropAmount = e.isBoss
                        ? 50
                        : Math.random() < 0.05
                        ? 10
                        : 1;
                      setResources((prev) => ({
                        ...prev,
                        [dropType]: prev[dropType] + dropAmount,
                      }));
                      return { ...e, hp: 0 };
                    }
                    return { ...e, hp: newHp };
                  }
                  return e;
                })
              );
              break;
            }
          }
          if (!projToRemove.has(proj.id)) remainingProj.push(proj);
        });
        return remainingProj;
      });
    }, 50);
    return () => clearInterval(gameLoop);
  }, [enemyEffects, battleField, enemies, enemyTargets, playerHp]);

  // 타워 동작(힐/공격)
  useEffect(() => {
    if (playerHp === 0) return;
    const placed = battleField
      .map((tower, index) => (tower ? { ...tower, gridIndex: index } : null))
      .filter(Boolean);
    const timers = [];
    placed.forEach((tower) => {
      if (tower.effect === "heal") {
        const healInterval = setInterval(() => {
          const row = Math.floor(tower.gridIndex / 6);
          const towersInLane = battleField
            .map((t, idx) => (t && Math.floor(idx / 6) === row ? idx : null))
            .filter((idx) => idx !== null);
          towersInLane.forEach((towerIdx) => {
            setTowerHealth((prev) => {
              const t = battleField[towerIdx];
              if (!t) return prev;
              const currentHp = prev[towerIdx] ?? t.hp;
              const maxHp = t.maxHp || t.hp;
              if (currentHp < maxHp) {
                const newHp = Math.min(currentHp + 1, maxHp);
                const col = towerIdx % 6;
                const towerXPercent = 7 + col * 2.7;
                const towerYPercent = 32 + row * 7.3;
                addFloatingText("+1", towerXPercent, towerYPercent, "crystal");
                return { ...prev, [towerIdx]: newHp };
              }
              return prev;
            });
          });
        }, 10000);
        timers.push(healInterval);
      } else {
        const attackInterval = setInterval(() => {
          const row = Math.floor(tower.gridIndex / 6);
          const col = tower.gridIndex % 6;
          setEnemies((current) => {
            const targetable = current.filter(
              (e) => e.lane === row && e.hp > 0
            );
            if (targetable.length === 0) return current;
            const gridLeft = 16,
              cellSize = 44;
            const towerX =
              ((gridLeft + 8 + col * cellSize + 20) / window.innerWidth) * 100;
            let effectType = null;
            if (tower.effect === "slow") effectType = "slow";
            if (tower.effect === "burn") effectType = "burn";
            if (tower.effect === "poison") effectType = "poison";
            const proj = {
              id: projectileIdRef.current++,
              x: towerX + 5,
              lane: row,
              vx: 2,
              damage: tower.damage,
              effect: effectType,
            };
            setProjectiles((prev) => [...prev, proj]);
            return current;
          });
        }, tower.cooldown);
        timers.push(attackInterval);
      }
    });
    return () => timers.forEach(clearInterval);
  }, [battleField, playerHp]);

  const addFloatingText = (text, x, y, color) => {
    const id = floatingTextIdRef.current++;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(
      () => setFloatingTexts((prev) => prev.filter((t) => t.id !== id)),
      1000
    );
  };

  const handleResourceClick = (type) => {
    const isCritical = Math.random() < 0.05;
    const amount = isCritical ? 10 : 1;
    setResources((prev) => ({ ...prev, [type]: prev[type] + amount }));
    setComboCount((prev) => prev + 1);
    if (comboTimer) clearTimeout(comboTimer);
    setComboTimer(setTimeout(() => setComboCount(0), 5000));
    addFloatingText(`+${amount}${isCritical ? " 크리!" : ""}`, 50, 50, type);
  };

  const handleGridClick = (i) => {
    if (selectedResource) {
      const g = [...craftGrid];
      g[i] = selectedResource;
      setCraftGrid(g);
      setSelectedResource(null);
    } else if (craftGrid[i]) {
      const g = [...craftGrid];
      g[i] = null;
      setCraftGrid(g);
    }
  };

  const handleCraft = () => {
    const filledSlots = craftGrid.filter((slot) => slot !== null);
    if (filledSlots.length < 3) return;

    const COST_MULTIPLIER = 2; // 🔹 재료 배수

    const matchesPattern = (pattern) => {
      for (let i = 0; i < 9; i++) {
        if (pattern[i] !== null && craftGrid[i] !== pattern[i]) {
          return false;
        }
      }
      return true;
    };

    let matchedRecipe = null;
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      if (unlockedRecipes.includes(i) && matchesPattern(recipe.pattern)) {
        matchedRecipe = recipe;
        break;
      }
    }

    if (!matchedRecipe) {
      addFloatingText("잘못된 패턴!", 50, 50, "fire");
      return;
    }

    // 🔹 필요한 자원 수 계산
    const required = {};
    matchedRecipe.pattern.forEach((s) => {
      if (s) required[s] = (required[s] || 0) + 1;
    });

    // 🔹 자원 충분한지 검증
    const hasEnough = Object.entries(required).every(
      ([type, count]) => resources[type] >= count * COST_MULTIPLIER
    );

    if (!hasEnough) {
      addFloatingText("자원이 부족합니다!", 50, 50, "fire");
      return; // ❗ 부족하면 제작 중단
    }

    // 🔹 자원 차감
    setResources((prev) => {
      const next = { ...prev };
      for (const [type, count] of Object.entries(required)) {
        next[type] = Math.max(0, next[type] - count * COST_MULTIPLIER);
      }
      return next;
    });

    // 🔹 타워 생성
    const newTower = {
      id: towerIdRef.current++,
      type: matchedRecipe.name.toLowerCase().replace(" ", "_"),
      name: matchedRecipe.name,
      damage: matchedRecipe.damage,
      cooldown: matchedRecipe.cooldown,
      hp: matchedRecipe.hp,
      maxHp: matchedRecipe.hp,
      level: 1,
      effect: matchedRecipe.effect,
    };

    setInventory((prev) => [...prev, newTower]);
    setCraftGrid(Array(9).fill(null));
    addFloatingText(`${newTower.name} 생성!`, 50, 50, "crystal");
  };

  const handleBattleFieldClick = (index) => {
    if (selectedTower) {
      if (battleField[index] === null) {
        const nf = [...battleField];
        nf[index] = selectedTower;
        setBattleField(nf);
        setTowerHealth((prev) => ({ ...prev, [index]: selectedTower.hp }));
        setInventory((prev) => prev.filter((t) => t.id !== selectedTower.id));
        setSelectedTower(null);
      }
    } else if (battleField[index]) {
      const t = battleField[index];
      const nf = [...battleField];
      nf[index] = null;
      setBattleField(nf);
      const cur = towerHealth[index] ?? t.hp;
      setInventory((prev) => [...prev, { ...t, hp: Math.floor(cur) }]);
      setTowerHealth((prev) => {
        const nh = { ...prev };
        delete nh[index];
        return nh;
      });
    }
  };

  const handleMergeTowers = () => {
    if (selectedMergeTowers.length !== 3)
      return addFloatingText("타워 3개 선택!", 50, 50, "fire");
    const f = selectedMergeTowers[0];
    if (
      !selectedMergeTowers.every(
        (t) => t.type === f.type && t.level === f.level
      )
    )
      return addFloatingText("같은 타입 & 레벨!", 50, 50, "fire");
    const newTower = {
      id: towerIdRef.current++,
      type: f.type,
      name: f.name,
      damage: Math.floor(f.damage * 2.5),
      cooldown: f.cooldown,
      hp: Math.floor(f.hp * 2.5),
      maxHp: Math.floor(f.maxHp * 2.5),
      level: f.level + 1,
      effect: f.effect,
    };
    setInventory((prev) => [
      ...prev.filter((t) => !selectedMergeTowers.find((st) => st.id === t.id)),
      newTower,
    ]);
    setSelectedMergeTowers([]);
    addFloatingText(`레벨 ${newTower.level}!`, 50, 50, "crystal");
  };

  const toggleMergeTower = (tower) => {
    setSelectedMergeTowers((prev) =>
      prev.find((t) => t.id === tower.id)
        ? prev.filter((t) => t.id !== tower.id)
        : prev.length < 3
        ? [...prev, tower]
        : prev
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden flex flex-col">
      {/* 상단: 전장 */}
      <div className="h-1/3 bg-gradient-to-b from-slate-700 to-slate-800 relative border-b-4 border-yellow-600">
        <div className="absolute top-2 left-2 z-10 bg-black/70 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold">❤️ 플레이어 체력</span>
            <span className="text-sm font-bold">
              {playerHp}/{maxPlayerHp}
            </span>
          </div>
          <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                playerHp > 60
                  ? "bg-green-500"
                  : playerHp > 30
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
            />
          </div>
        </div>

        <div className="absolute top-2 right-2 text-sm font-bold bg-black/50 px-3 py-1 rounded z-10">
          웨이브 {wave}
        </div>

        {showNotification && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-purple-600 border-4 border-yellow-400 px-6 py-3 rounded-lg z-50 animate-pulse">
            <div className="text-xl font-bold text-white text-center">
              {notificationText}
            </div>
          </div>
        )}

        {playerHp === 0 && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-4">
                게임 오버
              </div>
              <div className="text-lg mb-4">기지가 파괴되었습니다!</div>
              <button
                onClick={() => {
                  setPlayerHp(100);
                  setWave(1);
                  setEnemies([]);
                  setEnemyCount(0);
                  setBossSpawned(false);
                  setBattleField(Array(36).fill(null));
                  setTowerHealth({});
                  setEnemyTargets({});
                  setUnlockedRecipes([0, 1, 2]);
                }}
                className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold"
              >
                게임 재시작
              </button>
            </div>
          </div>
        )}

        {/* 적 경로 시각화 */}
        <div className="absolute left-72 top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 pointer-events-none">
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <div
              key={line}
              className="h-10 w-full border-b-4 border-dotted border-yellow-400"
              style={{ minHeight: "40px" }}
            />
          ))}
        </div>

        {/* 전장 그리드 */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className="grid grid-cols-6 gap-1 bg-black/40 p-2 rounded-lg">
            {battleField.map((tower, idx) => {
              const currentHp = towerHealth[idx];
              const maxHp = tower?.hp || 100;
              const hpPercent = currentHp ? (currentHp / maxHp) * 100 : 100;
              return (
                <button
                  key={idx}
                  onClick={() => handleBattleFieldClick(idx)}
                  className={`w-10 h-10 border-2 rounded ${
                    tower
                      ? "bg-blue-600 border-blue-400"
                      : "bg-gray-800/50 border-gray-600"
                  } flex items-center justify-center relative hover:border-white transition-colors`}
                >
                  {tower && (
                    <>
                      <Swords className="w-4 h-4" />
                      {tower.level > 1 && (
                        <span className="absolute -top-1 -right-1 text-[10px] bg-yellow-500 text-black px-1 rounded-full font-bold">
                          {tower.level}
                        </span>
                      )}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 px-1 py-0.5 rounded text-[8px] whitespace-nowrap pointer-events-none">
                        {tower.name}
                      </div>
                      <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-700 rounded">
                        <div
                          className={`h-full rounded transition-all ${
                            hpPercent > 60
                              ? "bg-green-500"
                              : hpPercent > 30
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-1">
            {[0, 1, 2, 3, 4, 5].map((line) => (
              <div
                key={line}
                className="h-10 w-96 border-b-2 border-dashed border-gray-600 opacity-30"
              />
            ))}
          </div>
        </div>

        {/* 적 */}
        {enemies.map((enemy) => {
          const effect = enemyEffects[enemy.id];
          const isSlowed = effect?.slow && Date.now() < effect.slow.endTime;
          const isBurning = effect?.burn && Date.now() < effect.burn.endTime;
          const isPoisoned =
            effect?.poison && Date.now() < effect.poison.endTime;
          const isAttacking = enemyTargets[enemy.id] !== undefined;
          const size = enemy.isBoss ? 32 : 32; // 화면에서 보일 프레임 크기

          return (
            <div
              key={enemy.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `${enemy.x}%`,
                top: `calc(50% - 130px + ${enemy.lane * 44}px)`,
              }}
            >
              {/* HP바 */}
              <div className="w-12 h-1 bg-gray-700 rounded mb-1">
                <div
                  className="h-full bg-green-500 rounded"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>

              {/* 슬라임 이미지 */}
              <div
                className="slime-sprite"
                style={{ width: size, height: size }}
              />
              {enemy.isBoss && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="text-[10px] bg-purple-600 text-yellow-300 px-2 py-0.5 rounded border border-yellow-400">
                    {enemy.name || "BOSS"} {/* 👈 보스 이름 표시 */}
                  </div>
                </div>
              )}
              {/* 상태 이펙트 */}
              <div className="absolute -top-5 flex gap-1 text-xs">
                {isSlowed && <span className="text-blue-400">❄️</span>}
                {isBurning && <span className="text-orange-400">🔥</span>}
                {isPoisoned && <span className="text-green-400">☠️</span>}
                {isAttacking && <span className="text-red-400">⚔️</span>}
              </div>
            </div>
          );
        })}

        {/* 발사체 */}
        {projectiles.map((proj) => (
          <div
            key={proj.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${proj.x}%`,
              top: `calc(50% - 130px + ${proj.lane * 44}px)`,
            }}
          />
        ))}

        {/* 텍스트 이펙트 */}
        {floatingTexts.map((text) => (
          <div
            key={text.id}
            className={`absolute text-xs font-bold animate-pulse ${
              text.color === "crystal" ? "text-purple-300" : "text-yellow-300"
            }`}
            style={{ left: `${text.x}%`, top: `${text.y}%` }}
          >
            {text.text}
          </div>
        ))}
      </div>

      {/* 중단: 리소스/제작/인벤토리 */}
      <div className="h-1/3 bg-gradient-to-b from-green-900 to-green-800 p-4 overflow-y-auto">
        {activeTab === "home" && (
          <>
            <div className="text-center mb-2">
              <div className="text-xs text-gray-300">
                {comboCount > 10
                  ? "🔥 콤보 x2!"
                  : `탭 수집 (콤보: ${comboCount})`}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(resources).map(([type, amount]) => (
                <button
                  key={type}
                  onClick={() => handleResourceClick(type)}
                  className={`${resourceColors[type]} p-3 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-transform`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {resourceIcons[type]}
                  </div>
                  <div className="text-xs font-bold">{resourceNames[type]}</div>
                  <div className="text-sm">{Math.floor(amount)}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === "craft" && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-sm font-bold">⚗️ 연금술</div>
              <button
                onClick={() => setShowRecipes(!showRecipes)}
                className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-xs font-bold"
              >
                📖 레시피
              </button>
            </div>
            {/* 👇 여기에 필요 자원 표시 블록 추가 👇 */}
            {(() => {
              const match = getMatchedRecipe();
              if (match) {
                const req = countBy(match.recipe.pattern);
                const allEnough = Object.entries(req).every(
                  ([t, c]) => resources[t] >= c * COST_MULTIPLIER
                );

                return (
                  <div className="mb-2">
                    <div className="text-xs text-gray-300 mb-1">
                      <span className="font-bold text-yellow-300">
                        {match.recipe.name}
                      </span>{" "}
                      필요 자원
                      <span
                        className={`ml-2 text-[11px] ${
                          allEnough ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {allEnough ? "✓ 충족" : "✗ 부족"}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(req).map(([type, cnt]) => {
                        const need = cnt * COST_MULTIPLIER;
                        const have = Math.floor(resources[type]);
                        const ok = have >= need;
                        return (
                          <div
                            key={type}
                            className={`${resourceColors[type]} ${
                              ok ? "" : "opacity-60"
                            } px-2 py-0.5 rounded text-[11px] flex items-center gap-1`}
                          >
                            {resourceIcons[type]}
                            <span>{resourceNames[type]}</span>
                            <span className="ml-1">
                              {have}/{need}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                const placed = countBy(craftGrid);
                const entries = Object.entries(placed);
                if (entries.length === 0) return null;
                return (
                  <div className="mb-2">
                    <div className="text-xs text-gray-300 mb-1">
                      배치된 자원
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {entries.map(([type, cnt]) => (
                        <div
                          key={type}
                          className={`${resourceColors[type]} px-2 py-0.5 rounded text-[11px] flex items-center gap-1`}
                        >
                          {resourceIcons[type]}
                          <span>{resourceNames[type]}</span>
                          <span className="ml-1">{cnt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            })()}
            <div className="text-xs text-center text-gray-300 mb-2">
              💡 중앙 = 코어 | 주변 = 재료
            </div>
            <div className="grid grid-cols-3 gap-1 mb-3 max-w-[200px] mx-auto">
              {craftGrid.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGridClick(idx)}
                  className={`w-16 h-16 border-2 rounded ${
                    idx === 4 ? "border-yellow-400" : "border-gray-600"
                  } ${
                    slot ? resourceColors[slot] : "bg-gray-700"
                  } flex items-center justify-center relative`}
                >
                  {idx === 4 && !slot && (
                    <div className="absolute text-[10px] text-yellow-400 font-bold">
                      코어
                    </div>
                  )}
                  {slot && resourceIcons[slot]}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-center mb-2 flex-wrap">
              {Object.keys(resources).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedResource(type)}
                  className={`${
                    resourceColors[type]
                  } px-3 py-1 rounded text-xs ${
                    selectedResource === type ? "ring-2 ring-white" : ""
                  }`}
                >
                  {resourceIcons[type]}
                </button>
              ))}
            </div>
            <button
              onClick={handleCraft}
              className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg font-bold mx-auto"
            >
              타워 제작
            </button>
          </div>
        )}

        {activeTab === "towers" && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold">
                인벤토리 ({inventory.length})
              </div>
              <button
                onClick={() => setMergeMode(!mergeMode)}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  mergeMode ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                {mergeMode ? "✓ 합성" : "합성 3→1"}
              </button>
            </div>
            {mergeMode && (
              <div className="mb-2">
                <div className="text-xs text-gray-300 mb-1">
                  선택: {selectedMergeTowers.length}/3
                </div>
                <button
                  onClick={handleMergeTowers}
                  disabled={selectedMergeTowers.length !== 3}
                  className="bg-purple-600 disabled:bg-gray-600 px-3 py-1 rounded text-xs font-bold w-full"
                >
                  타워 합성
                </button>
              </div>
            )}
            <div className="overflow-y-auto flex-1">
              <div className="space-y-2">
                {inventory.map((tower) => (
                  <div
                    key={tower.id}
                    onClick={() => {
                      mergeMode
                        ? toggleMergeTower(tower)
                        : setSelectedTower(
                            selectedTower?.id === tower.id ? null : tower
                          );
                    }}
                    className={`bg-gray-700 p-2 rounded cursor-pointer border-2 ${
                      selectedTower?.id === tower.id
                        ? "border-yellow-500"
                        : selectedMergeTowers.find((t) => t.id === tower.id)
                        ? "border-green-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold">{tower.name}</div>
                      <div className="text-xs bg-yellow-600 px-2 py-0.5 rounded">
                        Lv.{tower.level}
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 mb-1">
                      공격: {tower.damage} | 체력: {tower.hp}/{tower.maxHp}
                    </div>
                    <div className="w-full h-1.5 bg-gray-600 rounded mt-1">
                      <div
                        className={`h-full rounded ${
                          tower.hp / tower.maxHp > 0.6
                            ? "bg-green-500"
                            : tower.hp / tower.maxHp > 0.3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${(tower.hp / tower.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 탭바 */}
      {showRecipes && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="
      bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl
      w-[92vw] max-w-[480px] h-[80vh] md:h-[85vh]
      border-2 border-purple-500 flex flex-col shadow-2xl
    "
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg md:text-xl font-bold text-purple-300">
                🔮 레시피
              </h2>
              <button
                onClick={() => setShowRecipes(false)}
                className="text-2xl font-bold hover:text-red-500 leading-none"
                aria-label="close"
              >
                ×
              </button>
            </div>

            {/* 보유 자원 요약 */}
            <div className="p-3 bg-gray-800 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-2">보유 자원:</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(resources).map(([type, amount]) => (
                  <div
                    key={type}
                    className={`${resourceColors[type]} px-2 py-1 rounded text-[11px] flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-1">
                      {resourceIcons[type]}
                      <span className="font-medium">{resourceNames[type]}</span>
                    </div>
                    <span className="font-bold">{Math.floor(amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 스크롤 영역 */}
            <div
              className="
          flex-1 overflow-y-auto p-3 md:p-4
          max-h-[calc(80vh-160px)] md:max-h-[calc(85vh-170px)]
        "
            >
              <div className="space-y-3">
                {recipes.map((recipe, idx) => {
                  const COST_MULTIPLIER = 2; // 🔹 재료 2배 (원하면 3, 4로 조정)
                  const unlocked = unlockedRecipes.includes(idx);

                  // 🔹 해금된 레시피만 재료 계산
                  const required = {};
                  if (unlocked) {
                    recipe.pattern.forEach((s) => {
                      if (s) required[s] = (required[s] || 0) + 1;
                    });
                  }

                  // 🔹 제작 가능 여부 (재료 * 배수 적용)
                  const canCraft = unlocked
                    ? Object.entries(required).every(
                        ([t, c]) => resources[t] >= c * COST_MULTIPLIER
                      )
                    : false;

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-lg p-3 md:p-4 border-2
        ${
          unlocked
            ? canCraft
              ? "border-green-500"
              : "border-gray-600"
            : "border-gray-700"
        }
        ${unlocked ? "bg-gray-700" : "bg-gray-800/70"}`}
                    >
                      {/* 🔒 잠금 오버레이 */}
                      {!unlocked && (
                        <>
                          <div className="absolute inset-0 bg-black/50 rounded-lg pointer-events-none" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="text-2xl">🔒</div>
                              <div className="text-xs text-gray-300">잠금</div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* 타이틀 */}
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`font-bold ${
                            unlocked ? "text-yellow-300" : "text-gray-400"
                          } text-sm md:text-base`}
                        >
                          {unlocked ? recipe.name : "???"}
                        </div>
                        {unlocked && canCraft && (
                          <span className="text-green-400 text-xs">
                            ✓ 제작 가능
                          </span>
                        )}
                      </div>

                      {/* 패턴 미니 그리드 */}
                      <div className="grid grid-cols-3 gap-1 mb-2 max-w-[132px] md:max-w-[144px]">
                        {recipe.pattern.map((slot, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 md:w-9 md:h-9 rounded flex items-center justify-center text-[10px]
              border-2 ${i === 4 ? "border-yellow-400" : "border-gray-600"}
              ${
                unlocked
                  ? slot
                    ? resourceColors[slot]
                    : "bg-gray-800"
                  : "bg-gray-900/60"
              }`}
                          >
                            {i === 4 && !slot && unlocked && (
                              <div className="text-[9px] text-yellow-400">
                                ⭐
                              </div>
                            )}
                            {unlocked && slot && resourceIcons[slot]}
                          </div>
                        ))}
                      </div>

                      {/* 필요 자원 */}
                      {unlocked ? (
                        <>
                          <div className="mb-2">
                            <div className="text-[11px] text-gray-400 mb-1">
                              필요:
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(required).map(([t, c]) => {
                                const hasEnough =
                                  resources[t] >= c * COST_MULTIPLIER;
                                return (
                                  <div
                                    key={t}
                                    className={`${resourceColors[t]} ${
                                      !hasEnough ? "opacity-50" : ""
                                    } px-2 py-0.5 rounded text-[11px] flex items-center gap-1`}
                                  >
                                    {resourceIcons[t]}
                                    <span>{c * COST_MULTIPLIER}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 설명 + 스탯 */}
                          <div className="text-[11px] text-gray-300 mb-1">
                            {recipe.description}
                          </div>
                          <div className="text-[11px] text-gray-400 flex gap-3">
                            <span>⚔️ {recipe.damage}</span>
                            <span>❤️ {recipe.hp}</span>
                            <span>⏱️ {recipe.cooldown / 1000}초</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-gray-400 italic">
                          해방 시 정보가 공개됩니다
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-3 bg-gray-800 border-t border-gray-700 text-[11px] text-gray-400 text-center">
              ⭐ 중앙 = 코어 (타워 타입) | 🔧 주변 = 재료 (능력 강화)
            </div>
          </div>
        </div>
      )}
      <div className="h-16 bg-gray-900 flex items-center justify-around border-t-2 border-gray-700">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center p-2 rounded ${
            activeTab === "home" ? "bg-gray-700" : ""
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">홈</span>
        </button>
        <button
          onClick={() => setActiveTab("craft")}
          className={`flex flex-col items-center p-2 rounded ${
            activeTab === "craft" ? "bg-gray-700" : ""
          }`}
        >
          <Grid3x3 className="w-6 h-6" />
          <span className="text-xs">제작</span>
        </button>
        <button
          onClick={() => setActiveTab("towers")}
          className={`flex flex-col items-center p-2 rounded ${
            activeTab === "towers" ? "bg-gray-700" : ""
          }`}
        >
          <FlaskConical className="w-6 h-6" />
          <span className="text-xs">타워</span>
        </button>
      </div>
    </div>
  );
};

export default TowerCraft;
