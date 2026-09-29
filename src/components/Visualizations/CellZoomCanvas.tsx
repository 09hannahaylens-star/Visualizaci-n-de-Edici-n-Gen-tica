import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Compass, ChevronRight } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface CellZoomCanvasProps {
  onReachDna?: () => void;
  className?: string;
}

export const CellZoomCanvas: React.FC<CellZoomCanvasProps> = ({
  onReachDna,
  className = 'w-full h-full min-h-[480px]',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomProgress, setZoomProgress] = useState<number>(0.05); // 0.0 (Organismo) -> 1.0 (ADN)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const animFrameRef = useRef<number | null>(null);
  const zoomRef = useRef<number>(zoomProgress);
  zoomRef.current = zoomProgress;

  // Actualización controlada del progreso
  const updateZoom = useCallback((newZoom: number) => {
    const clamped = Math.max(0.02, Math.min(1.0, newZoom));
    setZoomProgress(clamped);
    zoomRef.current = clamped;
    if (clamped >= 0.98 && onReachDna) {
      onReachDna();
    }
  }, [onReachDna]);

  useEffect(() => {
    let lastTime = performance.now();
    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && zoomRef.current < 1.0) {
        const nextZoom = zoomRef.current + dt * 0.11; // ~9 segundos para completar el viaje
        if (nextZoom >= 1.0) {
          updateZoom(1.0);
          setIsPlaying(false);
        } else {
          updateZoom(nextZoom);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, updateZoom]);

  // Renderizado gráfico multi-escala cinemático en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animTime = 0;

    // Partículas citoplasmáticas y nucleares
    const cytoParticles = Array.from({ length: 40 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 95 + 25,
      speed: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(139, 92, 246, 0.5)',
    }));

    const render = (currentTime: number) => {
      animTime = currentTime * 0.001;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      const p = zoomRef.current;
      const cx = w / 2;
      const cy = h / 2;

      // Fondo oscuro degradado radial con profundidad volumétrica
      const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) * 0.75);
      bgGrad.addColorStop(0, '#0a1329');
      bgGrad.addColorStop(0.5, '#050a18');
      bgGrad.addColorStop(1, '#020409');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Cuadrícula métrica sutil de coordenadas científicas
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ==========================================
      // CAPA 1: ORGANISMO (p: 0.0 -> 0.35)
      // ==========================================
      if (p < 0.4) {
        const orgAlpha = Math.max(0, 1 - (p / 0.35));
        const orgScale = 1 + p * 3.5;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(orgScale, orgScale);
        ctx.globalAlpha = orgAlpha;

        // Silueta humana biológica estilizada con iluminación cian
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
        ctx.lineWidth = 2.5;

        // Cabeza
        ctx.beginPath();
        ctx.arc(0, -95, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Torso y miembros estilizados
        ctx.beginPath();
        ctx.moveTo(-28, -65);
        ctx.lineTo(28, -65);
        ctx.lineTo(38, 15);
        ctx.lineTo(20, 95);
        ctx.lineTo(-20, 95);
        ctx.lineTo(-38, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Líneas de plexo vascular / celular
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -65);
        ctx.lineTo(0, 55);
        ctx.moveTo(-28, -20);
        ctx.lineTo(28, -20);
        ctx.stroke();
        ctx.setLineDash([]);

        // Marcador focal que se enfoca y pulsa en el tejido celular
        const pulse = 1 + Math.sin(animTime * 3) * 0.08;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -12, 20 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Retícula de mira telescópica
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-32 * pulse, -12);
        ctx.lineTo(-24 * pulse, -12);
        ctx.moveTo(24 * pulse, -12);
        ctx.lineTo(32 * pulse, -12);
        ctx.moveTo(0, -12 - 32 * pulse);
        ctx.lineTo(0, -12 - 24 * pulse);
        ctx.moveTo(0, -12 + 24 * pulse);
        ctx.lineTo(0, -12 + 32 * pulse);
        ctx.stroke();

        ctx.restore();
      }

      // ==========================================
      // CAPA 2: CÉLULA 3D (p: 0.18 -> 0.72)
      // ==========================================
      if (p >= 0.18 && p < 0.75) {
        const cellProgress = (p - 0.18) / (0.75 - 0.18);
        let cellAlpha = 1;
        if (cellProgress < 0.25) {
          cellAlpha = cellProgress / 0.25;
        } else if (cellProgress > 0.72) {
          cellAlpha = Math.max(0, 1 - (cellProgress - 0.72) / 0.28);
        }

        const cellScale = 0.5 + cellProgress * 3.2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(cellScale, cellScale);
        ctx.globalAlpha = cellAlpha;

        const cellRadius = 145;

        // Membrana plasmática volumétrica (bicapa lipídica exterior)
        const memGrad = ctx.createRadialGradient(-30, -30, cellRadius * 0.2, 0, 0, cellRadius + 12);
        memGrad.addColorStop(0, 'rgba(6, 182, 212, 0.06)');
        memGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.18)');
        memGrad.addColorStop(0.95, 'rgba(14, 165, 233, 0.65)');
        memGrad.addColorStop(1, 'rgba(56, 189, 248, 0.95)');
        ctx.fillStyle = memGrad;

        // Ondulación natural de la membrana biológica
        ctx.beginPath();
        const numPoints = 64;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const wave = Math.sin(angle * 6 + animTime * 1.5) * 3 + Math.cos(angle * 4 - animTime) * 2;
          const r = cellRadius + wave;
          const px = r * Math.cos(angle);
          const py = r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Organelos celulares (mitocondrias con crestas internas, lisosomas)
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 + animTime * 0.08;
          const r = 90;
          const ox = r * Math.cos(angle);
          const oy = r * Math.sin(angle);

          // Mitocondria
          ctx.save();
          ctx.translate(ox, oy);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.75)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Crestas internas
          ctx.strokeStyle = 'rgba(199, 210, 254, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(10, 0);
          ctx.stroke();
          ctx.restore();
        }

        // Flujo de partículas citoplasmáticas en movimiento browniano
        cytoParticles.forEach((part) => {
          const curAngle = part.angle + animTime * part.speed;
          const px = part.dist * Math.cos(curAngle);
          const py = part.dist * Math.sin(curAngle);
          ctx.fillStyle = part.color;
          ctx.beginPath();
          ctx.arc(px, py, part.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Núcleo celular central visible desde la célula
        ctx.fillStyle = 'rgba(147, 51, 234, 0.3)';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // ==========================================
      // CAPA 3: NÚCLEO 3D (p: 0.45 -> 0.94)
      // ==========================================
      if (p >= 0.45 && p < 0.96) {
        const nucProgress = (p - 0.45) / (0.96 - 0.45);
        let nucAlpha = 1;
        if (nucProgress < 0.22) {
          nucAlpha = nucProgress / 0.22;
        } else if (nucProgress > 0.74) {
          nucAlpha = Math.max(0, 1 - (nucProgress - 0.74) / 0.26);
        }

        const nucScale = 0.55 + nucProgress * 3.4;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(nucScale, nucScale);
        ctx.globalAlpha = nucAlpha;

        const nucRadius = 130;

        // Envoltura nuclear esférica 3D con iluminación
        const nucGrad = ctx.createRadialGradient(-35, -35, 15, 0, 0, nucRadius + 10);
        nucGrad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
        nucGrad.addColorStop(0.65, 'rgba(126, 34, 206, 0.35)');
        nucGrad.addColorStop(0.9, 'rgba(88, 28, 135, 0.75)');
        nucGrad.addColorStop(1, 'rgba(192, 132, 252, 0.95)');
        ctx.fillStyle = nucGrad;
        ctx.beginPath();
        ctx.arc(0, 0, nucRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(192, 132, 252, 0.9)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Complejos de poro nuclear perimetrales (NPC)
        const poreCount = 20;
        for (let i = 0; i < poreCount; i++) {
          const a = (i * Math.PI * 2) / poreCount;
          const px = nucRadius * Math.cos(a);
          const py = nucRadius * Math.sin(a);
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fibras de cromatina condensada (heterocromatina y eucromatina)
        ctx.strokeStyle = 'rgba(233, 213, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-60, -40);
        ctx.bezierCurveTo(-25, -90, 50, -50, 30, 10);
        ctx.bezierCurveTo(10, 70, -50, 60, -15, 35);
        ctx.bezierCurveTo(20, 10, 70, 50, 45, 85);
        ctx.stroke();

        // Nucléolo denso interior
        ctx.fillStyle = 'rgba(107, 33, 168, 0.6)';
        ctx.beginPath();
        ctx.arc(-25, 20, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ==========================================
      // CAPA 4: ADN 3D (p: 0.72 -> 1.0)
      // ==========================================
      if (p >= 0.7) {
        const dnaAlpha = Math.min(1.0, (p - 0.7) / 0.24);
        const dnaScale = 0.7 + ((p - 0.7) / 0.3) * 0.5;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(dnaScale, dnaScale);
        ctx.globalAlpha = dnaAlpha;

        // Doble hélice emergiendo de la cromatina
        const totalSteps = 30;
        const stepDist = 19;
        const startY = -(totalSteps * stepDist) / 2;
        const radius = 64;

        // Proyección helicoidal
        for (let i = 0; i < totalSteps; i++) {
          const y = startY + i * stepDist;
          const theta = i * 0.44 + animTime * 1.2;
          const x1 = radius * Math.cos(theta);
          const x2 = -x1;
          const z = radius * Math.sin(theta);
          const depthNorm = (z + radius) / (2 * radius);
          const alphaDepth = 0.35 + depthNorm * 0.65;

          // Es un sitio diana cercano al centro?
          const isTargetSite = p > 0.88 && i >= 11 && i <= 19;

          // Peldaño central
          ctx.strokeStyle = isTargetSite
            ? `rgba(34, 211, 238, ${alphaDepth * 0.95})`
            : `rgba(148, 163, 184, ${alphaDepth * 0.5})`;
          ctx.lineWidth = (isTargetSite ? 4 : 2.5);
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();

          // Resplandor diana
          if (isTargetSite) {
            ctx.save();
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          }

          // Nucleótido 1
          const r1 = 6.5 * (0.8 + depthNorm * 0.35);
          ctx.fillStyle = (i % 2 === 0) ? '#38bdf8' : '#818cf8';
          ctx.beginPath();
          ctx.arc(x1, y, r1, 0, Math.PI * 2);
          ctx.fill();

          // Nucleótido 2
          ctx.fillStyle = (i % 2 === 0) ? '#a855f7' : '#34d399';
          ctx.beginPath();
          ctx.arc(x2, y, r1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Metadatos de la escala biológica actual
  const getScaleInfo = () => {
    if (zoomProgress < 0.28) {
      return {
        stage: 'ORGANISMO',
        metric: '~1.70 metros',
        label: 'Escala Macroscópica',
        desc: 'El ser vivo está formado por más de 30 billones de células con el mismo manual de instrucciones.',
      };
    }
    if (zoomProgress < 0.55) {
      return {
        stage: 'CÉLULA 3D',
        metric: '~20 micrómetros (μm)',
        label: 'Unidad Fundamental de la Vida',
        desc: 'Membrana lipídica, citoplasma con orgánulos y citoesqueleto que sostienen los procesos vitales.',
      };
    }
    if (zoomProgress < 0.82) {
      return {
        stage: 'NÚCLEO 3D',
        metric: '~6 micrómetros (μm)',
        label: 'El Archivo Genómico',
        desc: 'Envoltura con poros nucleares que custodia las fibras de cromatina densamente empaquetadas.',
      };
    }
    return {
      stage: 'ADN & REGIÓN DIANA',
      metric: '~2 nanómetros (nm)',
      label: 'Doble Hélice Molecular',
      desc: '3.000 millones de pares de bases químicas. Aquí es donde el sistema CRISPR-Cas9 interviene.',
    };
  };

  const scaleInfo = getScaleInfo();

  return (
    <div className={`relative rounded-xl overflow-hidden bg-[#050811] border border-slate-800 shadow-2xl flex flex-col ${className}`}>
      {/* Canvas principal del viaje continuo */}
      <div className="relative flex-1 min-h-[360px]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* HUD de Escala Científica en esquina superior izquierda */}
        <div className="absolute top-4 left-4 p-3.5 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl max-w-[290px] z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span className="text-[11px] font-mono tracking-wider text-cyan-400 font-bold">
              {scaleInfo.stage}
            </span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-[11px] font-mono text-slate-300">
              {scaleInfo.metric}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white mb-0.5">
            {scaleInfo.label}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {scaleInfo.desc}
          </p>
        </div>

        {/* Marcadores de escala rápidos en esquina superior derecha */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 p-2 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 text-[11px] font-mono z-10">
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(false);
              updateZoom(0.08);
            }}
            className={`px-3 py-1 rounded text-left transition-colors flex items-center justify-between gap-3 ${
              zoomProgress < 0.28 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>1. Organismo</span>
            <span className="text-[10px] text-slate-500">1.7 m</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(false);
              updateZoom(0.42);
            }}
            className={`px-3 py-1 rounded text-left transition-colors flex items-center justify-between gap-3 ${
              zoomProgress >= 0.28 && zoomProgress < 0.55 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>2. Célula 3D</span>
            <span className="text-[10px] text-slate-500">20 μm</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(false);
              updateZoom(0.7);
            }}
            className={`px-3 py-1 rounded text-left transition-colors flex items-center justify-between gap-3 ${
              zoomProgress >= 0.55 && zoomProgress < 0.82 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>3. Núcleo 3D</span>
            <span className="text-[10px] text-slate-500">6 μm</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(false);
              updateZoom(1.0);
            }}
            className={`px-3 py-1 rounded text-left transition-colors flex items-center justify-between gap-3 ${
              zoomProgress >= 0.82 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>4. ADN Doble Hélice</span>
            <span className="text-[10px] text-slate-500">2 nm</span>
          </button>
        </div>
      </div>

      {/* Barra de control inferior del viaje cinematográfico */}
      <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar viaje</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Continuar viaje</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              updateZoom(0.05);
              setIsPlaying(true);
            }}
            title="Reiniciar viaje desde el organismo"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Deslizador continuo de escala */}
        <div className="flex-1 max-w-md flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Organismo</span>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.005"
            value={zoomProgress}
            onChange={(e) => {
              setIsPlaying(false);
              updateZoom(parseFloat(e.target.value));
            }}
            aria-label="Control deslizante de zoom biológico"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[11px] font-mono text-cyan-400 shrink-0 font-bold">ADN (2 nm)</span>
        </div>

        {zoomProgress >= 0.85 && onReachDna && (
          <button
            onClick={() => {
              sound.playClick();
              onReachDna();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all animate-pulse"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explorar ADN en 3D</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
