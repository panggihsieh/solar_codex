"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Planet = {
  name: string;
  english: string;
  color: string;
  radius: number;
  orbit: number;
  speed: number;
  distance: string;
  period: string;
  temperature: string;
  moons: number;
};

type ScreenPlanet = Planet & { index: number; x: number; y: number; drawRadius: number };

const PLANETS: Planet[] = [
  { name: "水星", english: "Mercury", color: "#a69a8c", radius: 4, orbit: 48, speed: 4.15, distance: "5,790 萬 km", period: "88 天", temperature: "167°C", moons: 0 },
  { name: "金星", english: "Venus", color: "#e7b66e", radius: 7, orbit: 72, speed: 1.62, distance: "1.08 億 km", period: "225 天", temperature: "464°C", moons: 0 },
  { name: "地球", english: "Earth", color: "#4ea4db", radius: 7.5, orbit: 98, speed: 1, distance: "1.50 億 km", period: "365.25 天", temperature: "15°C", moons: 1 },
  { name: "火星", english: "Mars", color: "#c86b4d", radius: 5.5, orbit: 126, speed: 0.53, distance: "2.28 億 km", period: "687 天", temperature: "−65°C", moons: 2 },
  { name: "木星", english: "Jupiter", color: "#d8ae82", radius: 17, orbit: 174, speed: 0.084, distance: "7.78 億 km", period: "11.86 年", temperature: "−110°C", moons: 95 },
  { name: "土星", english: "Saturn", color: "#e5cc8f", radius: 14.5, orbit: 218, speed: 0.034, distance: "14.3 億 km", period: "29.45 年", temperature: "−140°C", moons: 146 },
  { name: "天王星", english: "Uranus", color: "#8fd5d8", radius: 10, orbit: 258, speed: 0.012, distance: "28.7 億 km", period: "84 年", temperature: "−195°C", moons: 28 },
  { name: "海王星", english: "Neptune", color: "#4d73d9", radius: 9.8, orbit: 296, speed: 0.006, distance: "45.0 億 km", period: "164.8 年", temperature: "−200°C", moons: 16 },
];

function makeStars(count: number) {
  let seed = 81427;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    radius: random() * 1.25 + 0.2,
    alpha: random() * 0.55 + 0.15,
  }));
}

const STARS = makeStars(260);

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    yaw: -0.18,
    pitch: 0.78,
    zoom: 1,
    time: 0,
    lastFrame: 0,
    dragging: false,
    moved: false,
    pointerX: 0,
    pointerY: 0,
    screenPlanets: [] as ScreenPlanet[],
  });
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);

  const selected = PLANETS[selectedIndex];

  const resetView = useCallback(() => {
    stateRef.current.yaw = -0.18;
    stateRef.current.pitch = 0.78;
    stateRef.current.zoom = 1;
    setZoom(1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    const state = stateRef.current;

    const draw = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const delta = Math.min((timestamp - (state.lastFrame || timestamp)) / 1000, 0.05);
      state.lastFrame = timestamp;
      if (isPlaying) state.time += delta * speed * 0.34;

      for (const star of STARS) {
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(221, 231, 255, ${star.alpha})`;
        ctx.fill();
      }

      const narrow = width < 760;
      const systemScale = Math.min(width / (narrow ? 710 : 850), height / (narrow ? 740 : 690)) * state.zoom;
      const centerX = width * (narrow ? 0.5 : 0.515);
      const centerY = height * (narrow ? 0.43 : 0.5);
      const cosYaw = Math.cos(state.yaw);
      const sinYaw = Math.sin(state.yaw);
      const cosPitch = Math.cos(state.pitch);
      const sinPitch = Math.sin(state.pitch);

      const project = (x: number, z: number) => {
        const rotatedX = x * cosYaw - z * sinYaw;
        const rotatedZ = x * sinYaw + z * cosYaw;
        return {
          x: centerX + rotatedX * systemScale,
          y: centerY + rotatedZ * sinPitch * systemScale,
          depth: rotatedZ * cosPitch,
        };
      };

      for (const planet of PLANETS) {
        ctx.beginPath();
        for (let step = 0; step <= 120; step += 1) {
          const angle = (step / 120) * Math.PI * 2;
          const point = project(Math.cos(angle) * planet.orbit, Math.sin(angle) * planet.orbit);
          if (step === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.strokeStyle = "rgba(142, 166, 210, 0.19)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const sunGlow = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 52 * systemScale);
      sunGlow.addColorStop(0, "rgba(255, 226, 132, .62)");
      sunGlow.addColorStop(0.32, "rgba(255, 165, 52, .18)");
      sunGlow.addColorStop(1, "rgba(255, 138, 31, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52 * systemScale, 0, Math.PI * 2);
      ctx.fill();

      const sunRadius = Math.max(12, 19 * systemScale);
      const sun = ctx.createRadialGradient(centerX - sunRadius * 0.3, centerY - sunRadius * 0.3, 1, centerX, centerY, sunRadius);
      sun.addColorStop(0, "#fff7c0");
      sun.addColorStop(0.42, "#ffc34f");
      sun.addColorStop(1, "#f07822");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      const bodies = PLANETS.map((planet, index) => {
        const angle = state.time * planet.speed + index * 0.77;
        const point = project(Math.cos(angle) * planet.orbit, Math.sin(angle) * planet.orbit);
        return { ...planet, ...point, index };
      }).sort((a, b) => a.depth - b.depth);

      const screenPlanets: ScreenPlanet[] = [];
      for (const body of bodies) {
        const perspective = 0.88 + ((body.depth + 300) / 600) * 0.2;
        const drawRadius = Math.max(3.5, body.radius * systemScale * perspective);
        const gradient = ctx.createRadialGradient(
          body.x - drawRadius * 0.35,
          body.y - drawRadius * 0.35,
          1,
          body.x,
          body.y,
          drawRadius,
        );
        gradient.addColorStop(0, "#fff2");
        gradient.addColorStop(0.22, body.color);
        gradient.addColorStop(1, "#111b");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(body.x, body.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();

        if (body.name === "土星") {
          ctx.save();
          ctx.translate(body.x, body.y);
          ctx.rotate(-0.18);
          ctx.strokeStyle = "rgba(226, 205, 153, .72)";
          ctx.lineWidth = Math.max(1.5, drawRadius * 0.18);
          ctx.beginPath();
          ctx.ellipse(0, 0, drawRadius * 1.75, drawRadius * 0.52, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (body.index === selectedIndex) {
          ctx.strokeStyle = "rgba(255, 255, 255, .9)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(body.x, body.y, drawRadius + 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = "600 11px ui-monospace, monospace";
          ctx.fillStyle = "rgba(241, 246, 255, .88)";
          ctx.textAlign = "center";
          ctx.fillText(body.english.toUpperCase(), body.x, body.y - drawRadius - 13);
        }
        screenPlanets.push({ ...body, drawRadius });
      }
      state.screenPlanets = screenPlanets;
      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, selectedIndex, speed]);

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.dragging = true;
    state.moved = false;
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.dragging) return;
    const dx = event.clientX - state.pointerX;
    const dy = event.clientY - state.pointerY;
    if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
    state.yaw += dx * 0.006;
    state.pitch = Math.max(0.18, Math.min(1.42, state.pitch + dy * 0.004));
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
  };

  const pointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.moved) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = [...state.screenPlanets].reverse().find(
        (planet) => Math.hypot(planet.x - x, planet.y - y) <= Math.max(12, planet.drawRadius + 5),
      );
      if (hit) setSelectedIndex(hit.index);
    }
    state.dragging = false;
  };

  const changeZoom = (nextZoom: number) => {
    const clamped = Math.max(0.68, Math.min(1.35, nextZoom));
    stateRef.current.zoom = clamped;
    setZoom(clamped);
  };

  return (
    <main className="solar-app">
      <canvas
        ref={canvasRef}
        className="space-canvas"
        aria-label="可拖曳旋轉、點選行星的互動式太陽系模型"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={() => { stateRef.current.dragging = false; }}
        onWheel={(event) => changeZoom(zoom - event.deltaY * 0.0006)}
      />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <strong>太陽系軌道誌</strong>
            <span>SOLAR ORBITAL ATLAS</span>
          </div>
        </div>
        <div className="status"><span /> 即時模型</div>
      </header>

      <section className="control-panel" aria-label="模型控制">
        <div className="panel-label">觀測控制</div>
        <button className="play-button" type="button" onClick={() => setIsPlaying((value) => !value)}>
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
          {isPlaying ? "暫停運行" : "繼續運行"}
        </button>
        <label className="range-control">
          <span><b>公轉速度</b><output>{speed.toFixed(1)}×</output></span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>
        <div className="zoom-control">
          <span>視野縮放</span>
          <div>
            <button type="button" aria-label="縮小" onClick={() => changeZoom(zoom - 0.1)}>−</button>
            <output>{Math.round(zoom * 100)}%</output>
            <button type="button" aria-label="放大" onClick={() => changeZoom(zoom + 0.1)}>＋</button>
          </div>
        </div>
        <button className="reset-button" type="button" onClick={resetView}>重設觀測視角</button>
        <p className="drag-hint">拖曳星圖以改變觀測角度</p>
      </section>

      <aside className="planet-panel" aria-live="polite">
        <div className="planet-index">{String(selectedIndex + 1).padStart(2, "0")} / 08</div>
        <div className="planet-heading">
          <span className="planet-swatch" style={{ backgroundColor: selected.color }} />
          <div>
            <h1>{selected.name}</h1>
            <p>{selected.english.toUpperCase()}</p>
          </div>
        </div>
        <dl className="planet-stats">
          <div><dt>距離太陽</dt><dd>{selected.distance}</dd></div>
          <div><dt>公轉週期</dt><dd>{selected.period}</dd></div>
          <div><dt>平均溫度</dt><dd>{selected.temperature}</dd></div>
          <div><dt>已知衛星</dt><dd>{selected.moons} 顆</dd></div>
        </dl>
      </aside>

      <nav className="planet-nav" aria-label="選擇行星">
        {PLANETS.map((planet, index) => (
          <button
            key={planet.name}
            type="button"
            className={index === selectedIndex ? "active" : ""}
            aria-pressed={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}
          >
            <span style={{ backgroundColor: planet.color }} />
            <small>{planet.name}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
