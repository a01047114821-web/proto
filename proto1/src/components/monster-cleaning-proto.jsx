import React, { useState, useEffect, useRef } from "react";
import { Lock, Zap } from "lucide-react";
import PlayerSprite from "../PlayerSprite"; // 추가
import { useLayoutEffect } from "react";
// === Infection / Zombie rules ===
const CORPSE_TIMEOUT_MS = 50_000; // 사체가 좀비로 변하기까지 시간 (20초)
const ZOMBIE_SPEED = 1.6; // 좀비 이동 속도(px/frame)
const ZOMBIE_AGGRO_RADIUS = 220; // 추격 시작 반경
const ZOMBIE_ATTACK_RANGE = 24; // 공격 범위(플레이어와의 거리)
const PLAYER_PICKUP_RANGE = 28;
const ZOMBIE_DAMAGE = 10; // 공격 데미지
const INVINCIBLE_MS = 800; // 피격 후 무적 시간

const displayName = {
  blood: "💉 피",
  bone: "🦴 뼈",
  leather: "🛡️ 가죽",
  toxin: "☠️ 독소",
  manaLiquid: "💧 마나액",
  bonePowder: "⚪ 골분",
  reinforcedLeather: "🛡️ 강화가죽",
  refinedToxin: "🧪 정제독소",
  energyCrystal: "💎 결정",
};
const toKo = (key) => displayName[key] || key;


function useCanvasScale(canvasRef, logicalW = 1200, logicalH = 600) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => {
      // 표시(클라이언트) 크기 / 내부 크기
      const sx = el.clientWidth / logicalW;
      const sy = el.clientHeight / logicalH;
      setScale(Math.min(sx, sy)); // 보통 둘이 같지만 혹시 모를 왜곡 방지
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [canvasRef, logicalW, logicalH]);

  return scale;
}

const MonsterCleaningIsometric = () => {
  const canvasRef = useRef(null);
  const scale = useCanvasScale(canvasRef, 1200, 600);
  const [gameState, setGameState] = useState({
    player: {
      x: 100,
      y: 300,
      speed: 3,
      carrying: null,
      hp: 100,
      invincibleUntil: 0,
    },
    resources: {
      blood: 0,
      bone: 0,
      leather: 0,
      toxin: 0,
      manaLiquid: 0,
      bonePowder: 0,
      reinforcedLeather: 0,
      refinedToxin: 0,
      energyCrystal: 0,
      purifier: 0,
      //orders: [],
    },
    money: 500,
    orders: [],
    corpseZones: [
      {
        id: 1,
        x: 15,
        y: 210,
        width: 200,
        height: 200,
        purified: false,
        name: "제1구역",
      },
      {
        id: 2,
        x: 15,
        y: 450,
        width: 180,
        height: 130,
        purified: true,
        name: "제2구역",
      },
      {
        id: 3,
        x: 15,
        y: 0,
        width: 220,
        height: 180,
        purified: true,
        name: "제3구역",
      },
    ],
    corpses: [
      // { id: 1, x: 150, y: 200, collected: false, zone: 1 },
      // { id: 2, x: 200, y: 250, collected: false, zone: 1 },
      // { id: 3, x: 180, y: 180, collected: false, zone: 1 },
      // { id: 4, x: 220, y: 220, collected: false, zone: 1 },
      // { id: 5, x: 160, y: 270, collected: false, zone: 1 },
      // { id: 6, x: 240, y: 300, collected: false, zone: 1 },
    ],
    facilities: [
      {
        id: 1,
        type: "dissectionTable",
        x: 350,
        y: 200,
        unlocked: true,
        working: false,
        progress: 0,
        input: null,
        level: 1,
        outputsReady: [], // ✅ 새로 추가 (가공 완료 후 생성되는 아이템 리스트)
      },
      {
        id: 2,
        type: "bloodPurifier",
        x: 550,
        y: 150,
        unlocked: false,
        working: false,
        progress: 0,
        input: null,
        level: 1,
      },
      {
        id: 3,
        type: "boneCrusher",
        x: 550,
        y: 250,
        unlocked: false,
        working: false,
        progress: 0,
        input: null,
        level: 1,
      },
      {
        id: 4,
        type: "leatherProcessor",
        x: 550,
        y: 350,
        unlocked: false,
        working: false,
        progress: 0,
        input: null,
        level: 1,
      },
      {
        id: 5,
        type: "toxinExtractor",
        x: 550,
        y: 450,
        unlocked: false,
        working: false,
        progress: 0,
        input: null,
        level: 1,
      },
      {
        id: 6,
        type: "alchemyLab",
        x: 750,
        y: 200,
        unlocked: false,
        working: false,
        progress: 0,
        input: null,
        level: 1,
      },
      {
        id: 7,
        type: "refineryStation",
        x: 750,
        y: 350,
        unlocked: false,
        working: false,
        progress: 0,
        input: null,
        level: 1,
      },
      { id: 8, type: "storage", x: 950, y: 300, unlocked: false },
      { id: 9, type: "conveyor", x: 950, y: 450, unlocked: false },
      { id: 10, type: "trashBin", x: 980, y: 520, unlocked: true },
      { id: 11, type: "orderBoard", x: 880, y: 80, unlocked: true },
    ],
    keys: {},
    selectedTarget: null,
    notifications: [],
    completedOrders: 0,
  });

  const facilityInfo = {
    dissectionTable: {
      name: "해체 작업대",
      color: "#8B0000",
      icon: "🔪",
      size: 70,
      processTime: 2000,
      input: "corpse",
      outputs: ["blood", "bone", "leather", "toxin"],
      description: "사체를 부위별로 분리",
      unlockCost: 0,
      unlockCondition: "시작 시설",
    },
    bloodPurifier: {
      name: "피 정화실",
      color: "#DC143C",
      icon: "💉",
      size: 70,
      processTime: 1500,
      input: "blood",
      outputs: ["manaLiquid"],
      description: "피를 마나 액체로 정제",
      unlockCost: 0,
      unlockCondition: "해체 작업대 3회 완료",
    },
    boneCrusher: {
      name: "뼈 분쇄실",
      color: "#A9A9A9",
      icon: "⚙️",
      size: 70,
      processTime: 1200,
      input: "bone",
      outputs: ["bonePowder"],
      description: "뼈를 분말로 가공",
      unlockCost: 0,
      unlockCondition: "피 정화실 해금 후",
    },
    leatherProcessor: {
      name: "가죽 가공실",
      color: "#D2691E",
      icon: "🛡️",
      size: 70,
      processTime: 1800,
      input: "leather",
      outputs: ["reinforcedLeather"],
      description: "가죽을 강화",
      unlockCost: 0,
      unlockCondition: "뼈 분쇄실 해금 후",
    },
    toxinExtractor: {
      name: "독소 추출기",
      color: "#9370DB",
      icon: "☠️",
      size: 70,
      processTime: 1600,
      input: "toxin",
      outputs: ["refinedToxin"],
      description: "독소를 정제",
      unlockCost: 280,
      unlockCondition: "가죽 가공실 해금 후",
    },
    alchemyLab: {
      name: "연금 연구소",
      color: "#4169E1",
      icon: "🧪",
      size: 70,
      processTime: 2500,
      input: "manaLiquid",
      outputs: ["energyCrystal"],
      description: "마나로 결정 생성",
      unlockCost: 500,
      unlockCondition: "모든 1차 가공 완료",
    },
    refineryStation: {
      name: "고급 정제소",
      color: "#FF8C00",
      icon: "⚗️",
      size: 70,
      processTime: 2000,
      input: "bonePowder",
      outputs: ["energyCrystal"],
      description: "골분으로 결정 생성",
      unlockCost: 450,
      unlockCondition: "연금 연구소 해금 후",
    },
    storage: {
      name: "자원 저장소",
      color: "#4682B4",
      icon: "📦",
      size: 70,
      description: "자원 자동 판매",
      unlockCost: 600,
      unlockCondition: "10개 결정 생산",
    },
    conveyor: {
      name: "컨베이어 시스템",
      color: "#FFD700",
      icon: "🔄",
      size: 70,
      description: "완전 자동화!",
      unlockCost: 1000,
      unlockCondition: "모든 시설 해금",
    },
    trashBin: {
      name: "폐기통",
      color: "#444", // 진회색 박스
      icon: "🗑️",
      size: 60,
      description: "손에 든 아이템을 버립니다",
      unlockCost: 0,
      unlockCondition: "시작 시설",
    },
    orderBoard: {
      name: "주문 게시판",
      color: "#2e4057",
      icon: "📜",
      size: 70,
      description: "자원 납품 계약으로 큰 보상 획득",
      unlockCost: 0,
      unlockCondition: "시작 시설",
    },
  };
  
  const addNotification = (message) => {
    const id = Date.now();
    setGameState((prev) => ({
      ...prev,
      notifications: [...prev.notifications, { id, message }],
    }));
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== id),
      }));
    }, 3000);
  };

  const handleInteractionRef = useRef(() => {});
  useEffect(() => {
    handleInteractionRef.current = handleInteraction;
  });

  // 교체 확인 모달 상태
  const [confirmReplace, setConfirmReplace] = useState({
    open: false,
    facilityId: null,
  });

  // 모달: "폐기하고 해체" 실행
  const handleConfirmReplace = () => {
    setGameState((prev) => {
      const s = { ...prev };
      const fac = s.facilities.find((f) => f.id === confirmReplace.facilityId);
      if (!fac) return s;

      // 기존 작업 / 산출물 폐기
      s.facilities = s.facilities.map((f) =>
        f.id === fac.id
          ? { ...f, input: null, working: false, progress: 0, outputsReady: [] }
          : f
      );
      // 플레이어가 시체를 들고 있으면 즉시 해체 시작
      if (s.player.carrying === "corpse") {
        s.player.carrying = null;
        s.facilities = s.facilities.map((f) =>
          f.id === fac.id
            ? { ...f, input: "corpse", working: true, progress: 0 }
            : f
        );
        addNotification("해체 작업 시작");
      } else {
        addNotification("시체가 없어 해체를 시작하지 못했습니다");
      }

      return s;
    });

    setConfirmReplace({ open: false, facilityId: null });
  };

  // 모달: 취소
  const handleCancelReplace = () => {
    setConfirmReplace({ open: false, facilityId: null });
    addNotification("해체를 취소했습니다.");
  };

  // ✅ 1. 이미 존재하는 시체들을 안쪽으로 밀어넣기 (보정용)
  useEffect(() => {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const margin = 22;

    setGameState((prev) => {
      const s = { ...prev };
      s.corpses = s.corpses.map((c) => {
        const z = s.corpseZones.find((zz) => zz.id === c.zone);
        if (!z) return c;

        const minX = z.x + margin;
        const maxX = z.x + z.width - margin;
        const minY = z.y + margin;
        const maxY = z.y + z.height - margin;

        return {
          ...c,
          x: clamp(c.x, minX, maxX),
          y: clamp(c.y, minY, maxY),
        };
      });
      return s;
    });
  }, []);

  // ✅ 2. 게임 시작 시 새 시체 5마리 스폰 (초기 생성용)
  useEffect(() => {
    const now = Date.now(); // ✅ 현재 시각 저장

    setGameState((prev) => {
      const s = { ...prev };
      const zones = s.corpseZones.filter((z) => !z.purified);
      if (!zones.length) return s;

      const newCorpses = [];
      const margin = 22;

      for (let i = 0; i < 5; i++) {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const x =
          zone.x +
          margin +
          Math.random() * Math.max(0, zone.width - 2 * margin);
        const y =
          zone.y +
          margin +
          Math.random() * Math.max(0, zone.height - 2 * margin);

        newCorpses.push({
          id: now + Math.random(),
          x,
          y,
          collected: false,
          zone: zone.id,
          state: "corpse", // 🧟‍♂️ 시체 상태
          spawnAt: now, // 스폰 시각
          zombieAt: now + CORPSE_TIMEOUT_MS, // 변이 예정 시각
          homeX: x,
          homeY: y,
        });
      }

      s.corpses = [...s.corpses, ...newCorpses];
      return s;
    });
  }, []);

  // ====== 키 리스너: 한 번만 등록 + 기본 스크롤 방지 + 최신 핸들러 호출 ======
  useEffect(() => {
    const onKeyDown = (e) => {
      // 화살표/스페이스 기본 스크롤 방지
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === "e" || e.key === "E" || e.key === " ") {
        handleInteractionRef.current();
      }
      const k = e.key.toLowerCase();
      setGameState((prev) => ({ ...prev, keys: { ...prev.keys, [k]: true } }));
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      setGameState((prev) => ({ ...prev, keys: { ...prev.keys, [k]: false } }));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const stateRef = useRef(gameState);
  useEffect(() => {
    stateRef.current = gameState;
  });

  // ====== 메인 루프(rAF): 한 번만 시작, 매 프레임 업데이트 + 드로잉 ======
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let rafId;
    const loop = () => {
      // ---------- 1) 게임 로직 업데이트 ----------
      setGameState((prev) => {
        const s = { ...prev };

        s.corpses = s.corpses.filter((c) => !c.collected);

        const player = { ...s.player };
        // 이동
        if (s.keys["arrowup"] || s.keys["w"]) player.y -= player.speed;
        if (s.keys["arrowdown"] || s.keys["s"]) player.y += player.speed;
        if (s.keys["arrowleft"] || s.keys["a"]) player.x -= player.speed;
        if (s.keys["arrowright"] || s.keys["d"]) player.x += player.speed;

        // 경계
        player.x = Math.max(30, Math.min(1170, player.x));
        player.y = Math.max(30, Math.min(570, player.y));

        // ===== 사체 → 좀비 변이 & 좀비 AI =====
        //const now = performance?.now?.() ?? Date.now();
        // === 좀비 변이 및 AI (구역 이탈 금지 + 귀환 로직) ===
        {
          const now = Date.now();
          s.corpses = s.corpses.filter((c) => !c.collected);
          // 구역 유틸
          const getZone = (id) => s.corpseZones.find((z) => z.id === id);
          const inZone = (z, px, py, margin = 0) => {
            if (!z) return false;
            return (
              px >= z.x + margin &&
              px <= z.x + z.width - margin &&
              py >= z.y + margin &&
              py <= z.y + z.height - margin
            );
          };
          const clampToZone = (z, px, py, margin = 4) => {
            if (!z) return { x: px, y: py };
            const x = Math.max(
              z.x + margin,
              Math.min(z.x + z.width - margin, px)
            );
            const y = Math.max(
              z.y + margin,
              Math.min(z.y + z.height - margin, py)
            );
            return { x, y };
          };

          const CHASE_SPD = ZOMBIE_SPEED;
          const RETURN_SPD = ZOMBIE_SPEED * 0.8;
          const EDGE_MARGIN = 6; // 경계 살짝 안쪽에서만 움직이게

          s.corpses = s.corpses.map((c) => {
            if (c.collected) return c;

            const z = getZone(c.zone);

            // 1) 시체 → 좀비 변이
            if (c.state !== "zombie") {
              const zbAt = c.zombieAt ?? (c.spawnAt ?? now) + CORPSE_TIMEOUT_MS;
              if (now >= zbAt) {
                // ② 변이 직전 유예: 플레이어가 근처(<=28px)이고 빈손이면 300ms 미룸
                const dxp = player.x - c.x;
                const dyp = player.y - c.y;
                const pd = Math.hypot(dxp, dyp);
                const PLAYER_PICKUP_RANGE = 28; // 집기 허용 반경(선택)
                const ZOMBIE_GRACE_MS = 300; // 변이 유예
                const canPickupNow =
                  !s.player.carrying && pd <= PLAYER_PICKUP_RANGE;
                if (now >= zbAt && !canPickupNow) {
                  return { ...c, state: "zombie", zombieAt: zbAt };
                }
                return {
                  ...c,
                  zombieAt:
                    now >= zbAt && canPickupNow ? now + ZOMBIE_GRACE_MS : zbAt,
                };
              }
              return { ...c, zombieAt: zbAt };
            }

            // 2) 좀비 AI
            const homeX = c.homeX ?? c.x;
            const homeY = c.homeY ?? c.y;

            const dx = player.x - c.x;
            const dy = player.y - c.y;
            const dist = Math.hypot(dx, dy);

            // 플레이어가 같은 구역 안에 있을 때만 추격
            const playerInSameZone = inZone(z, player.x, player.y, EDGE_MARGIN);
            const shouldChase =
              playerInSameZone && dist < ZOMBIE_AGGRO_RADIUS && dist > 0.0001;

            let nx = c.x;
            let ny = c.y;

            if (shouldChase) {
              // 추격 이동
              const vx = (dx / dist) * CHASE_SPD;
              const vy = (dy / dist) * CHASE_SPD;
              nx += vx;
              ny += vy;

              // 경계 밖으로 못 나가게 즉시 클램프
              const clamped = clampToZone(z, nx, ny, EDGE_MARGIN);
              nx = clamped.x;
              ny = clamped.y;
            } else {
              // 추격 불가(플레이어가 밖/멀다) → 홈으로 귀환
              const hdx = homeX - c.x;
              const hdy = homeY - c.y;
              const hdist = Math.hypot(hdx, hdy);
              if (hdist > 0.5) {
                const vx = (hdx / hdist) * RETURN_SPD;
                const vy = (hdy / hdist) * RETURN_SPD;
                nx += vx;
                ny += vy;
              }
              const clamped = clampToZone(z, nx, ny, EDGE_MARGIN);
              nx = clamped.x;
              ny = clamped.y;
            }

            // 3) 공격 판정 (클램프된 좌표 기준)
            const pdx = player.x - nx;
            const pdy = player.y - ny;
            const pdist = Math.hypot(pdx, pdy);
            if (pdist <= ZOMBIE_ATTACK_RANGE && playerInSameZone) {
              if (now >= (s.player.invincibleUntil || 0)) {
                s.player = {
                  ...s.player,
                  hp: Math.max(0, s.player.hp - ZOMBIE_DAMAGE),
                  invincibleUntil: now + INVINCIBLE_MS,
                };
                addNotification(`⚠️ 공격 받음 (-${ZOMBIE_DAMAGE})`);
              }
            }

            return { ...c, x: nx, y: ny };
          });
        }

        // 가장 가까운 대상 찾기ㅞ~
        let nearestTarget = null;
        //let minDist = 80;
        let minDist = Math.max(PLAYER_PICKUP_RANGE, 80);
        // 사체
        s.corpses.forEach((corpse) => {
          if (corpse.collected) return;
          const dist = Math.hypot(player.x - corpse.x, player.y - corpse.y);
          if (dist < minDist) {
            nearestTarget = { type: "corpse", data: corpse };
            minDist = dist;
          }
        });

        // 시설
        s.facilities.forEach((facility) => {
          if (!facility.unlocked) return;
          const dist = Math.hypot(player.x - facility.x, player.y - facility.y);
          if (dist < minDist) {
            nearestTarget = { type: "facility", data: facility };
            minDist = dist;
          }
        });

        s.selectedTarget = nearestTarget;

        // 시설 작업 진행
        s.facilities = s.facilities.map((f) => {
          if (f.working && f.progress < 100) {
            const info = facilityInfo[f.type];
            return {
              ...f,
              progress: f.progress + 100 / (info.processTime / 50),
            };
          }
          // 작업 완료
          if (f.working && f.progress >= 100) {
            const info = facilityInfo[f.type];

            if (info.outputs) {
              const produced = info.outputs.map((o) => ({
                id: Date.now() + Math.random(),
                type: o,
                collected: false,
              }));

              // 해체 완료 카운트는 여기서 표시만 하고, map 바깥에서 한 번만 반영/알림
              if (f.type === "dissectionTable") s.completedOrders += 1;

              // ✅ map 콜백은 "시설 1개"만 리턴해야 한다
              addNotification(
                `${facilityInfo[f.type].name} 완료! 생산물을 수령하세요.`
              );
              return {
                ...f,
                working: false,
                progress: 0,
                input: null,
                outputsReady: produced,
              };
            }

            // outputs 없는 경우 기본 리셋
            return { ...f, working: false, progress: 0, input: null };
          }

          return f;
        });

        s.player = player;

        // 🔑 드로잉에서 바로 최신 값 쓰도록 ref 갱신
        stateRef.current = s;
        return s;
      });

      // ---------- 2) 드로잉 ----------
      const gs = stateRef.current;

      // 배경
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, 1200, 600);

      // 그리드
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      for (let i = 0; i < 1200; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();
      }
      for (let i = 0; i < 600; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1200, i);
        ctx.stroke();
      }

      // 사체 영역 (예시 고정 박스)
      // ctx.fillStyle = "rgba(139, 0, 0, 0.2)";
      // ctx.fillRect(80, 120, 200, 200);
      // ctx.strokeStyle = "#8B0000";
      // ctx.lineWidth = 2;
      // ctx.setLineDash([5, 5]);
      // ctx.strokeRect(80, 120, 200, 200);
      // ctx.setLineDash([]);
      // ctx.font = "12px Arial";
      // ctx.fillStyle = "#ff6666";
      // ctx.textAlign = "center";
      // ctx.fillText("사체 발견 구역", 180, 110);

      // ✅ 모든 사체 구역을 state로부터 그림
      const zones = gs.corpseZones || [];
      zones.forEach((zone) => {
        ctx.fillStyle = "rgba(139, 0, 0, 0.20)";
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

        ctx.strokeStyle = "#8B0000";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        ctx.setLineDash([]);

        ctx.font = "12px Arial";
        ctx.fillStyle = "#ff6666";
        ctx.textAlign = "center";
        ctx.fillText(
          "사체 발견 구역",
          zone.x + zone.width / 2,
          Math.max(0, zone.y - 8)
        );
      });

      // 사체
      gs.corpses.forEach((c) => {
        if (c.collected) return;

        const isSelected =
          gs.selectedTarget?.type === "corpse" &&
          gs.selectedTarget?.data.id === c.id;

        if (isSelected) {
          ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
          ctx.beginPath();
          ctx.arc(c.x, c.y, 25, 0, Math.PI * 2);
          ctx.fill();
        }

        if (c.state === "zombie") {
          ctx.fillStyle = "rgba(255,0,0,0.25)";
          ctx.beginPath();
          ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.state === "zombie" ? "🧟‍♂️" : "🧟", c.x, c.y);

        // ---- 사체일 때 '좀비 변이까지 남은 시간' 표시 (텍스트 + 원형 게이지) ----
        if (c.state !== "zombie") {
          const now = Date.now();
          const total = CORPSE_TIMEOUT_MS;
          const zbAt = c.zombieAt ?? (c.spawnAt ?? now) + total;
          const remainMs = Math.max(0, zbAt - now);
          const remainSec = (remainMs / 1000).toFixed(1);
          const ratio = 1 - Math.min(1, remainMs / total); // 0→1 진행도

          // 원형 게이지(얇은 호) - 남은 시간이 적을수록 붉게
          const r = 22;
          ctx.save();
          ctx.lineWidth = 4;
          // 색상: 녹색→노랑→빨강 (H 120→0 근사)
          const hue = Math.floor(120 * (1 - ratio)); // 120(초록)~0(빨강)
          ctx.strokeStyle = `hsl(${hue} 80% 55%)`;
          ctx.beginPath();
          ctx.arc(
            c.x,
            c.y,
            r,
            -Math.PI / 2,
            -Math.PI / 2 + ratio * Math.PI * 2
          );
          ctx.stroke();
          ctx.restore();

          // 남은 시간 텍스트
          ctx.save();
          ctx.font = "11px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(`${remainSec}s`, c.x, c.y - (r + 6));
          ctx.restore();
        }
      });

      // 시설
      gs.facilities.forEach((facility) => {
        const info = facilityInfo[facility.type];
        if (!info) return;

        if (facility.unlocked) {
          ctx.fillStyle = info.color;
          ctx.fillRect(
            facility.x - info.size / 2,
            facility.y - info.size / 2,
            info.size,
            info.size
          );

          const isSelected =
            gs.selectedTarget?.type === "facility" &&
            gs.selectedTarget?.data.id === facility.id;

          ctx.strokeStyle = isSelected ? "#FFD700" : "#555";
          ctx.lineWidth = isSelected ? 4 : 2;
          ctx.strokeRect(
            facility.x - info.size / 2,
            facility.y - info.size / 2,
            info.size,
            info.size
          );

          ctx.font = "35px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(info.icon, facility.x, facility.y);

          if (facility.working) {
            ctx.fillStyle = "#000";
            ctx.fillRect(facility.x - 32, facility.y + 42, 64, 10);
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(
              facility.x - 32,
              facility.y + 42,
              (facility.progress / 100) * 64,
              10
            );
          }

          ctx.font = "11px Arial";
          ctx.fillStyle = "#fff";
          ctx.fillText(info.name, facility.x, facility.y - 45);
        } else {
          ctx.fillStyle = "#0a0a0a";
          ctx.fillRect(
            facility.x - info.size / 2,
            facility.y - info.size / 2,
            info.size,
            info.size
          );
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            facility.x - info.size / 2,
            facility.y - info.size / 2,
            info.size,
            info.size
          );

          ctx.font = "40px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🔒", facility.x, facility.y);

          ctx.font = "10px Arial";
          ctx.fillStyle = "#666";
          ctx.fillText(info.name, facility.x, facility.y - 45);
        }
      });

      // 플레이어
      // ctx.fillStyle = gs.player.carrying ? "#FFD700" : "#4CAF50";
      // ctx.beginPath();
      // ctx.arc(gs.player.x, gs.player.y, 18, 0, Math.PI * 2);
      // ctx.fill();

      // ctx.fillStyle = "#fff";
      // ctx.font = "24px Arial";
      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      //ctx.fillText("👷", gs.player.x, gs.player.y);

      if (gs.player.carrying) {
        ctx.font = "20px Arial";
        const carryingIcon =
          gs.player.carrying === "corpse"
            ? "🧟"
            : gs.player.carrying === "blood"
            ? "💉"
            : gs.player.carrying === "bone"
            ? "🦴"
            : gs.player.carrying === "leather"
            ? "🛡️"
            : gs.player.carrying === "toxin"
            ? "☠️"
            : gs.player.carrying === "manaLiquid"
            ? "💧"
            : gs.player.carrying === "bonePowder"
            ? "⚪"
            : gs.player.carrying === "reinforcedLeather"
            ? "🛡️"
            : gs.player.carrying === "refinedToxin"
            ? "🧪"
            : "📦";
        ctx.fillText(carryingIcon, gs.player.x, gs.player.y - 30);
      }

      // 다음 프레임
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []); // ← 의존성 비워서 루프/컨텍스트 한 번만 생성
  // 개별 결과물을 인벤토리에 넣기
  const handleStoreOutput = (item, facilityId) => {
    setGameState((prev) => {
      const s = { ...prev, resources: { ...prev.resources } };

      // 자원 +1
      s.resources[item.type] = (s.resources[item.type] || 0) + 1;

      // 해당 작업대 outputsReady 에서 제거 (불변 업데이트)
      s.facilities = s.facilities.map((f) =>
        f.id !== facilityId
          ? f
          : {
              ...f,
              outputsReady: (f.outputsReady || []).filter(
                (o) => o.id !== item.id
              ),
            }
      );

      addNotification(`${item.type}을(를) 인벤토리에 넣었습니다`);
      return s;
    });
  };

  // 해당 작업대 결과물을 전부 인벤토리에 넣기
  const handleStoreAllOutputs = (facilityId) => {
    setGameState((prev) => {
      const s = { ...prev, resources: { ...prev.resources } };

      const fac = s.facilities.find((f) => f.id === facilityId);
      if (!fac || !fac.outputsReady || fac.outputsReady.length === 0) return s;

      // 타입별 개수 합산 후 자원에 더하기
      for (const it of fac.outputsReady) {
        s.resources[it.type] = (s.resources[it.type] || 0) + 1;
      }

      // 해당 작업대의 대기 결과물 비우기
      s.facilities = s.facilities.map((f) =>
        f.id !== facilityId ? f : { ...f, outputsReady: [] }
      );

      addNotification(
        `작업대 결과물을 모두 인벤토리에 넣었습니다 (+${fac.outputsReady.length})`
      );
      return s;
    });
  };

  const handleTakeOutput = (item, facilityId) => {
    setGameState((prev) => {
      const s = { ...prev };

      if (s.player.carrying) {
        addNotification(
          "빈 손일 때만 가져갈 수 있어요. 🗑️ 폐기통에 버리고 오세요."
        );
        return s;
      }

      // A안: 스마트 교체
      s.player = { ...s.player, carrying: item.type };

      s.facilities = s.facilities.map((f) => {
        if (f.id !== facilityId) return f;
        return {
          ...f,
          outputsReady: (f.outputsReady || []).filter((o) => o.id !== item.id),
        };
      });

      addNotification(`${item.type}을(를) 가져왔습니다`);
      return s;
    });
  };

  const handleTakeFromInventory = (itemType) => {
    setGameState((prev) => {
      const s = { ...prev, resources: { ...prev.resources } };

      // 손에 뭐 들고 있으면 막기 (쓰레기통 규칙 유지)
      if (s.player.carrying) {
        addNotification("손이 가득 차 있습니다. 🗑️에 버리고 오세요.");
        return s;
      }

      // 자원 없으면 막기
      if (!s.resources[itemType] || s.resources[itemType] <= 0) {
        addNotification("해당 자원이 없습니다.");
        return s;
      }

      // 자원 1개 감소 + 손에 들기
      s.resources[itemType]--;
      s.player.carrying = itemType;

      addNotification(`${itemType} 1개를 꺼냈습니다.`);
      return s;
    });
  };

  const handleInteraction = () => {
    const target = stateRef.current.selectedTarget;
    if (!target) return;

    setGameState((prev) => {
      const newState = { ...prev };

      if (target.type === "corpse") {
        if (target.data.state === "zombie") {
          addNotification("좀비는 수거할 수 없습니다! 피하세요.");
          return newState;
        }
        if (newState.player.carrying) {
          addNotification(
            "빈 손일 때만 수거 가능해요. 🗑️ 폐기통에 버리고 오세요."
          );
          return newState;
        }
        newState.player = { ...newState.player, carrying: "corpse" };
        newState.corpses = newState.corpses.filter(
          (c) => c.id !== target.data.id
        );
        newState.selectedTarget = null;
        newState.money += 20; // 수거 수당
        addNotification("사체를 수거했습니다 수거 수당 + 20");

        stateRef.current = newState;
        return newState;
      } else if (target.type === "facility") {
        const facility = target.data;
        const info = facilityInfo[facility.type];

        // 🗑️ 폐기통
        if (facility.type === "trashBin") {
          if (newState.player.carrying) {
            newState.player.carrying = null;
            addNotification("손에 든 아이템을 폐기했습니다");
          } else {
            addNotification("버릴 아이템이 없습니다");
          }
          return newState;
        }

        // 📦 저장소 납품
        if (facility.type === "storage" && newState.player.carrying) {
          const prices = {
            manaLiquid: 50,
            bonePowder: 40,
            reinforcedLeather: 80,
            refinedToxin: 60,
            energyCrystal: 150,
          };
          const price = prices[newState.player.carrying] || 0;
          newState.money += price;
          newState.player.carrying = null;
          addNotification(`+${price}원`);
          return newState;
        }

        // 🔄 컨베이어
        if (facility.type === "conveyor") {
          addNotification("자동화 시스템 가동 중!");
          return newState;
        }

        // 🧪 작업 시설 공통
        else if (info.input) {
          // === 해체 작업대 전용: 교체 확인 모달 ===
          if (facility.type === "dissectionTable") {
            const hasCorpseOnTable =
              facility.input === "corpse" ||
              facility.working ||
              (facility.outputsReady?.length ?? 0) > 0;

            // 플레이어가 시체를 들고 왔는데 이미 해체대에 뭔가 있다면 → 모달 오픈
            if (newState.player.carrying === "corpse" && hasCorpseOnTable) {
              setConfirmReplace({ open: true, facilityId: facility.id });
              return newState; // 여기서 멈춤 (모달에서 결정)
            }

            // 빈 해체대에 시체 투입 → 바로 시작
            if (
              newState.player.carrying === "corpse" &&
              !facility.working &&
              !hasCorpseOnTable
            ) {
              newState.player.carrying = null;
              newState.facilities = newState.facilities.map((f) =>
                f.id === facility.id
                  ? {
                      ...f,
                      working: true,
                      progress: 0,
                      input: "corpse",
                      outputsReady: [],
                    }
                  : f
              );
              addNotification("해체 작업 시작");
              return newState;
            }

            // 안내 메시지
            if (
              newState.player.carrying &&
              newState.player.carrying !== "corpse"
            ) {
              addNotification("해체 작업대에는 시체만 올릴 수 있습니다.");
            } else if (!newState.player.carrying && !facility.working) {
              addNotification("시체를 들고 오면 해체를 시작합니다.");
            }
            return newState;
          }

          // === 해체 작업대 외 시설: 정상 투입 ===
          if (newState.player.carrying === info.input && !facility.working) {
            newState.player.carrying = null;
            newState.facilities = newState.facilities.map((f) =>
              f.id === facility.id
                ? { ...f, working: true, progress: 0, input: info.input }
                : f
            );
            addNotification(`${info.name} 작업 시작`);
            return newState;
          }
        }

        // 📦 생산물 회수 (해체 작업대 제외 — 버튼으로만 수령)
        if (info.outputs) {
          if (newState.player.carrying) {
            addNotification(
              "빈 손일 때만 생산물을 들 수 있습니다. 🗑️에 버리고 오세요."
            );
            return newState;
          }
          if (facility.type === "dissectionTable") {
            // 해체 작업대는 사이드패널 버튼으로만 수령/저장
            return newState;
          }
          const available = info.outputs.find(
            (o) => (newState.resources[o] || 0) > 0
          );
          if (available) {
            newState.resources[available]--;
            newState.player.carrying = available;
            addNotification(`${available} 회수`);
          }
        }

        return newState;
      }
    });
  };

  const genOrders = () => {
    const pool = [
      { item: "blood", label: "피" },
      { item: "bone", label: "뼈" },
      { item: "leather", label: "가죽" },
      { item: "toxin", label: "독소" },
      { item: "manaLiquid", label: "마나액" },
      { item: "bonePowder", label: "골분" },
      { item: "reinforcedLeather", label: "강화 가죽" },
      { item: "refinedToxin", label: "정제 독소" },
      { item: "energyCrystal", label: "결정" },
    ];
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    const mk = () => {
      const a = pick(),
        b = pick();
      const reqs = [
        { item: a.item, count: 2 + Math.floor(Math.random() * 3) },
        { item: b.item, count: 1 + Math.floor(Math.random() * 2) },
      ];
      const reward =
        reqs.reduce(
          (sum, r) =>
            sum +
            (r.item === "energyCrystal"
              ? 150
              : r.item === "reinforcedLeather"
              ? 80
              : r.item === "manaLiquid"
              ? 50
              : r.item === "bonePowder"
              ? 40
              : r.item === "refinedToxin"
              ? 60
              : 25) *
              r.count,
          0
        ) + 50; // 약간 프리미엄
      return {
        id: Date.now() + Math.random(),
        reqs,
        reward,
        expiresAt: Date.now() + 1000 * 60 * 10,
      };
    };
    setGameState((prev) => ({ ...prev, orders: [mk(), mk(), mk()] }));
  };
  useEffect(() => {
    genOrders();
  }, []);

  const handleCompleteOrder = (orderId) => {
    setGameState((prev) => {
      const s = { ...prev };
      const order = s.orders.find((o) => o.id === orderId);
      if (!order) return s;

      // 보유 자원 체크
      const can = order.reqs.every(
        (r) => (s.resources[r.item] || 0) >= r.count
      );
      if (!can) {
        addNotification("자원이 부족합니다");
        return s;
      }
      // 자원 차감
      order.reqs.forEach((r) => {
        s.resources[r.item] -= r.count;
      });
      s.money += order.reward;

      // 주문 갱신(완료한 것 제거 / 새 주문 보충)
      const rest = s.orders.filter((o) => o.id !== orderId);
      s.orders = rest;
      addNotification(`주문 완료! +${order.reward}원`);

      // 빈 칸 채워 넣기(선택)
      if (s.orders.length < 3) {
        // 간단히 새로 하나 생성
        const added = (() => {
          const pool = [
            "blood",
            "bone",
            "leather",
            "toxin",
            "manaLiquid",
            "bonePowder",
            "reinforcedLeather",
            "refinedToxin",
            "energyCrystal",
          ];
          const reqs = [
            {
              item: pool[Math.floor(Math.random() * pool.length)],
              count: 2 + Math.floor(Math.random() * 3),
            },
            {
              item: pool[Math.floor(Math.random() * pool.length)],
              count: 1 + Math.floor(Math.random() * 2),
            },
          ];
          const reward =
            50 +
            reqs.reduce(
              (s2, r) =>
                s2 +
                (r.item === "energyCrystal"
                  ? 150
                  : r.item === "reinforcedLeather"
                  ? 80
                  : r.item === "manaLiquid"
                  ? 50
                  : r.item === "bonePowder"
                  ? 40
                  : r.item === "refinedToxin"
                  ? 60
                  : 25) *
                  r.count,
              0
            );
          return {
            id: Date.now() + Math.random(),
            reqs,
            reward,
            expiresAt: Date.now() + 1000 * 60 * 10,
          };
        })();
        s.orders = [...s.orders, added];
      }
      return s;
    });
  };
  const canUnlock = (facility) => {
    const info = facilityInfo[facility.type];
    if (gameState.money < info.unlockCost) return false;

    const unlockedTypes = gameState.facilities
      .filter((f) => f.unlocked)
      .map((f) => f.type);

    if (facility.type === "bloodPurifier")
      return gameState.completedOrders >= 3;
    if (facility.type === "boneCrusher")
      return unlockedTypes.includes("bloodPurifier");
    if (facility.type === "leatherProcessor")
      return unlockedTypes.includes("boneCrusher");
    if (facility.type === "toxinExtractor")
      return unlockedTypes.includes("leatherProcessor");
    if (facility.type === "alchemyLab") {
      return (
        unlockedTypes.includes("bloodPurifier") &&
        unlockedTypes.includes("boneCrusher") &&
        unlockedTypes.includes("leatherProcessor") &&
        unlockedTypes.includes("toxinExtractor")
      );
    }
    if (facility.type === "refineryStation")
      return unlockedTypes.includes("alchemyLab");
    if (facility.type === "storage")
      return gameState.resources.energyCrystal >= 10;
    if (facility.type === "conveyor") {
      return (
        unlockedTypes.includes("storage") &&
        unlockedTypes.includes("refineryStation")
      );
    }

    return true;
  };

  const unlockFacility = (facilityId) => {
    const facility = gameState.facilities.find((f) => f.id === facilityId);
    if (!canUnlock(facility)) return;

    const info = facilityInfo[facility.type];

    setGameState((prev) => ({
      ...prev,
      money: prev.money - info.unlockCost,
      facilities: prev.facilities.map((f) =>
        f.id === facilityId ? { ...f, unlocked: true } : f
      ),
    }));

    addNotification(`${info.name} 해금!`);
  };

  // 🧟 시체 자동 젠 시스템 (시체 발견 구역 안에서만 젠)
  useEffect(() => {
    const spawnCorpse = () => {
      setGameState((prev) => {
        const activeCorpses = prev.corpses.filter((c) => !c.collected);
        if (activeCorpses.length >= 10) return prev; // 너무 많으면 젠 안함

        // 정화되지 않은 구역만 대상
        const zones = prev.corpseZones.filter((z) => !z.purified);
        if (zones.length === 0) return prev;

        // 랜덤 구역 선택
        const zone = zones[Math.floor(Math.random() * zones.length)];

        // 구역 내부 랜덤 위치 지정
        const margin = 22;
        const x =
          zone.x +
          margin +
          Math.random() * Math.max(0, zone.width - 2 * margin);
        const y =
          zone.y +
          margin +
          Math.random() * Math.max(0, zone.height - 2 * margin);
        const now = Date.now();

        const newCorpse = {
          id: now + Math.random(),
          x,
          y,
          collected: false,
          zone: zone.id,
          state: "corpse",
          spawnAt: now,
          zombieAt: now + CORPSE_TIMEOUT_MS,
          homeX: x,
          homeY: y,
        };

        return {
          ...prev,
          corpses: [...prev.corpses, newCorpse],
        };
      });
    };

    // 10초마다 시체 젠
    const interval = setInterval(spawnCorpse, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {gameState.notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-green-600 border-2 border-green-400 px-4 py-2 rounded-lg shadow-lg text-white font-bold"
          >
            {notif.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4 border-2 border-purple-500">
          <h1 className="text-3xl font-bold text-purple-300 mb-3">
            🧹 몬스터 클리닝 컴퍼니
          </h1>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className="bg-slate-700 p-2 rounded text-center">
              <div className="text-yellow-400 text-xs">💰 자금</div>
              <div className="text-lg font-bold text-white">
                {gameState.money}
              </div>
            </div>
            <div className="bg-slate-700 p-2 rounded text-center">
              <div className="text-red-400 text-xs">💉 피</div>
              <div className="text-lg font-bold text-white">
                {gameState.resources.blood}
              </div>
            </div>
            <div className="bg-slate-700 p-2 rounded text-center">
              <div className="text-gray-400 text-xs">🦴 뼈</div>
              <div className="text-lg font-bold text-white">
                {gameState.resources.bone}
              </div>
            </div>
            <div className="bg-slate-700 p-2 rounded text-center">
              <div className="text-amber-400 text-xs">🛡️ 가죽</div>
              <div className="text-lg font-bold text-white">
                {gameState.resources.leather}
              </div>
            </div>
            <div className="bg-slate-700 p-2 rounded text-center">
              <div className="text-purple-400 text-xs">☠️ 독소</div>
              <div className="text-lg font-bold text-white">
                {gameState.resources.toxin}
              </div>
            </div>
            <div className="bg-slate-700 p-2 rounded text-center">
              <div className="text-cyan-400 text-xs">💎 결정</div>
              <div className="text-lg font-bold text-white">
                {gameState.resources.energyCrystal}
              </div>
            </div>
          </div>
        </div>
          
        <div className="flex gap-4">
          {/* Canvas */}
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              width={1200}
              height={600}
              className="border-4 border-slate-700 rounded-lg bg-slate-800 w-full"
            />
            
            {/* ✅ 좌표와 크기에 스케일 적용 */}
  <PlayerSprite
    x={gameState.player.x * scale}
    y={gameState.player.y * scale}
    scale={0.3} // 아래 컴포넌트에서 width/height에 반영
  />
            
            <div className="bg-slate-800 rounded-lg p-3 mt-4 border-2 border-slate-700">
              <div className="text-sm text-gray-300 space-y-1">
                <p>
                  <strong className="text-white">🎮 조작:</strong> WASD 또는
                  방향키로 이동
                </p>
                <p>
                  <strong className="text-white">⚡ 상호작용:</strong> E 또는
                  스페이스바 (가까이 가면 노란 테두리 표시)
                </p>
                <p>
                  <strong className="text-yellow-400">💡 목표:</strong> 사체를
                  수거 → 해체 → 가공 → 판매 → 시설 해금!
                </p>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-80 space-y-4">
            {gameState.selectedTarget &&
              (() => {
                const sel = gameState.selectedTarget;
                if (sel.type === "corpse") {
                  return (
                    <div className="bg-slate-800 rounded-lg p-4 border-2 border-yellow-500">
                      <h3 className="font-bold text-yellow-400 mb-2">
                        📍 선택됨
                      </h3>
                      <div className="text-white">
                        <p className="text-lg">🧟 사체</p>
                        <p className="text-sm text-gray-300">E를 눌러 수거</p>
                      </div>
                    </div>
                  );
                }

                const fInfo = facilityInfo[sel.data.type];
                const f = sel.data;

                return (
                  <div className="bg-slate-800 rounded-lg p-4 border-2 border-yellow-500">
                    <h3 className="font-bold text-yellow-400 mb-2">
                      📍 선택됨
                    </h3>
                    <div className="text-white">
                      <p className="font-bold">{fInfo.name}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {fInfo.description}
                      </p>

                      {/* 진행 바 */}
                      {f.working && (
                        <div className="mt-2">
                          <div className="bg-slate-700 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 h-full transition-all"
                              style={{ width: `${Math.floor(f.progress)}%` }}
                            />
                          </div>
                          <p className="text-xs text-green-400 mt-1">
                            작업 중: {Math.floor(f.progress)}%
                          </p>
                        </div>
                      )}

                      {sel.data.type === "orderBoard" && (
                        <div className="mt-3">
                          <p className="text-sm text-yellow-400 mb-2">
                            📜 진행 중 주문
                          </p>
                          <div className="space-y-2">
                            {gameState.orders.length === 0 && (
                              <p className="text-gray-400 text-sm">
                                현재 주문이 없습니다
                              </p>
                            )}
                            {gameState.orders.map((o) => (
                              <div
                                key={o.id}
                                className="bg-slate-700 p-2 rounded"
                              >
                                <div className="text-xs text-gray-300 mb-1">
                                  요청:{" "}
                                  {o.reqs
                                    .map((r) => `${toKo(r.item)} x${r.count}`)
                                    .join(", ")}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-yellow-300 text-sm font-bold">
                                    보상: {o.reward}원
                                  </span>
                                  <button
                                    onClick={() => handleCompleteOrder(o.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold"
                                  >
                                    납품
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            인벤토리 자원을 소비해 큰 보상을 받아요.
                          </p>
                        </div>
                      )}

                      {/* 해체 작업대 결과물 선택 */}
                      {(f.outputsReady?.length ?? 0) > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-yellow-400 mb-2">
                            {f.type === "dissectionTable"
                              ? "📦 가져갈 재료 선택"
                              : "📦 생산물 수령"}
                          </p>

                          {/* 모두 인벤토리로 넣기 버튼 */}
                          <button
                            onClick={() => handleStoreAllOutputs(f.id)}
                            className="mb-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            모두 인벤토리로
                          </button>

                          <div className="flex flex-wrap gap-2">
                            {f.outputsReady.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 bg-slate-700 px-2 py-1 rounded"
                              >
                                <span className="text-sm">
                                  {item.type === "blood"
                                    ? "💉 피"
                                    : item.type === "bone"
                                    ? "🦴 뼈"
                                    : item.type === "leather"
                                    ? "🛡️ 가죽"
                                    : item.type === "toxin"
                                    ? "☠️ 독소"
                                    : item.type === "manaLiquid"
                                    ? "💧 마나액"
                                    : item.type === "bonePowder"
                                    ? "⚪ 골분"
                                    : item.type === "reinforcedLeather"
                                    ? "🛡️ 강화가죽"
                                    : item.type === "refinedToxin"
                                    ? "🧪 정제독소"
                                    : item.type === "energyCrystal"
                                    ? "💎 결정"
                                    : item.type}
                                </span>

                                {/* 들기 버튼 (빈 손일 때만) */}
                                <button
                                  onClick={() => handleTakeOutput(item, f.id)}
                                  disabled={!!gameState.player.carrying}
                                  title={
                                    gameState.player.carrying
                                      ? "빈 손일 때만 들 수 있어요"
                                      : ""
                                  }
                                  className={`px-2 py-1 rounded text-xs text-white
     ${
       gameState.player.carrying
         ? "bg-gray-600 cursor-not-allowed"
         : "bg-slate-600 hover:bg-green-600"
     }`}
                                >
                                  들기
                                </button>

                                {/* 인벤토리로 넣기 버튼 */}
                                <button
                                  onClick={() => handleStoreOutput(item, f.id)}
                                  className="bg-slate-600 hover:bg-cyan-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  인벤토리
                                </button>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-gray-400 mt-2">
                            ‘들기’는 빈 손일 때만 가능하고, ‘인벤토리’는 바로
                            자원창에 저장됩니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            <div className="bg-slate-800 rounded-lg p-4 border-2 border-indigo-500">
              <h3 className="font-bold text-indigo-300 mb-2">🎒 인벤토리</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(gameState.resources)
                  .filter(([_, count]) => count > 0)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="bg-slate-700 p-2 rounded flex justify-between items-center"
                    >
                      <span>
                        {type === "blood"
                          ? "💉 피"
                          : type === "bone"
                          ? "🦴 뼈"
                          : type === "leather"
                          ? "🛡️ 가죽"
                          : type === "toxin"
                          ? "☠️ 독소"
                          : type === "manaLiquid"
                          ? "💧 마나액"
                          : type === "bonePowder"
                          ? "⚪ 골분"
                          : type === "reinforcedLeather"
                          ? "🛡️ 강화가죽"
                          : type === "refinedToxin"
                          ? "🧪 정제독소"
                          : type === "energyCrystal"
                          ? "💎 결정"
                          : type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-300 font-bold">
                          {count}
                        </span>
                        <button
                          onClick={() => handleTakeFromInventory(type)}
                          className="bg-slate-600 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                        >
                          꺼내기
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 교체 확인 모달 */}
            {confirmReplace.open && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
                <div className="w-[360px] rounded-xl bg-slate-800 border border-slate-600 shadow-2xl p-5">
                  <h3 className="text-lg font-bold text-white mb-2">
                    해체 작업 확인
                  </h3>
                  <p className="text-sm text-gray-300 leading-6">
                    해체 작업대에 이미{" "}
                    <span className="text-yellow-300">시체 또는 산출물</span>이
                    있습니다.
                    <br />
                    <span className="text-rose-300">기존 내용을 폐기</span>하고
                    새로운 시체로 해체를 시작할까요?
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleConfirmReplace}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      폐기하고 해체
                    </button>
                    <button
                      onClick={handleCancelReplace}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white"
                    >
                      취소
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    ※ 폐기 시 기존 산출물은 사라집니다.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-lg p-4 border-2 border-slate-700">
              <h3 className="font-bold text-white mb-3">🔓 시설 해금</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gameState.facilities
                  .filter((f) => !f.unlocked)
                  .map((facility) => {
                    const info = facilityInfo[facility.type];
                    const canUnlockNow = canUnlock(facility);

                    return (
                      <div
                        key={facility.id}
                        className="bg-slate-700 p-3 rounded"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">
                            {info.icon} {info.name}
                          </span>
                          <span className="text-yellow-400 text-sm font-bold">
                            {info.unlockCost}원
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          {info.unlockCondition}
                        </p>
                        <button
                          onClick={() => unlockFacility(facility.id)}
                          disabled={!canUnlockNow}
                          className={`w-full px-3 py-1 rounded text-sm font-bold ${
                            canUnlockNow
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {canUnlockNow ? "해금하기" : "조건 미충족"}
                        </button>
                      </div>
                    );
                  })}
                {gameState.facilities.filter((f) => !f.unlocked).length ===
                  0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    모든 시설 해금!
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border-2 border-blue-500">
              <h3 className="font-bold text-white mb-2">📊 진행 상황</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>해체 완료: {gameState.completedOrders}회</p>
                <p>보유 자금: {gameState.money}원</p>
                <p>결정 생산: {gameState.resources.energyCrystal}개</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonsterCleaningIsometric;
