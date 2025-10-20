import React from "react";
import "./Sprite.css";

export default function PlayerSprite({ x, y, scale = 0.8 }) {
  const style = {
    position: "absolute",
    left: x + 640,
    top: y + 160,
    transform: `translate(-50%, -50%) scale(${scale})`, // 크기도 같이 축소/확대
    transformOrigin: "center",
    width: 256,   // 원본 프레임 크기 기준
    height: 256,
    backgroundImage: 'url(/sprites/player_idle_6x.png)',
    backgroundSize: '1536px 256px',
    backgroundRepeat: 'no-repeat',
    animation: 'idle-steps 0.6s steps(6) infinite',
    imageRendering: 'pixelated',
  };
  return <div style={style} />;
}
