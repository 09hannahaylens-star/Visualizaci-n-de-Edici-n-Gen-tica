import React, { useState, useEffect, useRef } from 'react';
import { Layers, ShieldCheck, ArrowRight, Zap, RefreshCw, RotateCw, Eye } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface Cas9AssemblyViewerProps {
  onNext?: () => void;
}

export const Cas9AssemblyViewer: React.FC<Cas9AssemblyViewerProps> = ({ onNext }) => {
  const [isAssembled, setIsAssembled] = useState<boolean>(false);
  const [activeDomain, setActiveDomain] = useState<'rec' | 'nuc' | 'hnh' | 'ruvc' | 'pam'>('rec');
  const [orbitAngle, setOrbitAngle] = useState<number>(0.2);
  const [autoOrbit, setAutoOrbit] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitAngleRef = useRef<number>(orbitAngle);
  orbitAngleRef.current = orbitAngle;

  const handleAssemble = () => {
    sound.playScan();
    setIsAssembled(true);
  };

  const handleReset = () => {
    sound.playClick();
    setIsAssembled(false);
  };

  // Renderizado en canvas 3D interactivo para Cas9
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animTime = 0;

    const render = (currentTime: number) => {
      animTime = currentTime * 0.001;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      if (autoOrbit && !isDraggingRef.current) {
        orbitAngleRef.current += 0.008;
        setOrbitAngle(orbitAngleRef.current);
      }

      const rot = orbitAngleRef.current;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      // Fondo oscuro espacial con degradado radial
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, '#0d152e');
      bgGrad.addColorStop(0.7, '#060a17');
      bgGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Cuadrícula métrica sutil
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Estructura 3D de dominios globulares de Cas9
      interface ProteinLobe3D {
        id: 'rec' | 'nuc' | 'hnh' | 'ruvc' | 'pam';
        name: string;
        x: number;
        y: number;
        z: number;
        rx: number;
        ry: number;
        color: string;
        stroke: string;
        glow: string;
      }

      const lobes: ProteinLobe3D[] = [
        // Lóbulo REC (Reconocimiento) - Mayor masa en un lado
        {
          id: 'rec',
          name: 'LÓBULO REC',
          x: -60,
          y: -10,
          z: 0,
          rx: 75,
          ry: 55,
          color: 'rgba(2, 132, 199, 0.45)',
          stroke: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.8)',
        },
        // Lóbulo NUC (Nucleasa)
        {
          id: 'nuc',
          name: 'LÓBULO NUC',
          x: 65,
          y: 5,
          z: -10,
          rx: 70,
          ry: 60,
          color: 'rgba(79, 70, 229, 0.45)',
          stroke: '#818cf8',
          glow: 'rgba(129, 140, 248, 0.8)',
        },
        // Dominio HNH (Corta hebra diana)
        {
          id: 'hnh',
          name: 'DOMINIO HNH',
          x: 25,
          y: -50,
          z: 35,
          rx: 34,
          ry: 34,
          color: 'rgba(14, 165, 233, 0.65)',
          stroke: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.95)',
        },
        // Dominio RuvC (Corta hebra no diana)
        {
          id: 'ruvc',
          name: 'DOMINIO RuvC',
          x: 75,
          y: 45,
          z: 25,
          rx: 36,
          ry: 36,
          color: 'rgba(225, 29, 72, 0.6)',
          stroke: '#fb7185',
          glow: 'rgba(251, 113, 133, 0.95)',
        },
        // Dominio de Interacción con PAM (PI)
        {
          id: 'pam',
          name: 'DOMINIO PI (PAM)',
          x: -15,
          y: 60,
          z: 15,
          rx: 38,
          ry: 26,
          color: 'rgba(217, 119, 6, 0.6)',
          stroke: '#fbbf24',
          glow: 'rgba(251, 191, 36, 0.95)',
        },
      ];

      // Proyectar lóbulos según ángulo orbital 3D
      const projectedLobes = lobes.map((l) => {
        const xRot = l.x * cosR - l.z * sinR;
        const zRot = l.x * sinR + l.z * cosR;
        const scale = 500 / (500 + zRot);
        return {
          ...l,
          projX: cx + xRot * scale,
          projY: cy + l.y * scale,
          projZ: zRot,
          projRx: l.rx * scale,
          projRy: l.ry * scale,
          scale,
        };
      });

      // Ordenar por Z para oclusión realista
      projectedLobes.sort((a, b) => a.projZ - b.projZ);

      // Si está ensamblado, proyectar el ARN Guía en el canal central
      const gRnaOffset = isAssembled ? 0 : -85;
      const gRnaAlpha = isAssembled ? 1 : 0.45;

      // Dibujar los lóbulos de Cas9
      projectedLobes.forEach((l) => {
        const isHighlight = activeDomain === l.id;
        const depthNorm = (l.projZ + 100) / 200;
        const alpha = 0.5 + depthNorm * 0.5;

        ctx.save();
        ctx.translate(l.projX, l.projY);

        if (isHighlight) {
          ctx.shadowBlur = 24;
          ctx.shadowColor = l.glow;
        }

        // Esfera volumétrica del dominio proteico
        const radGrad = ctx.createRadialGradient(-l.projRx * 0.3, -l.projRy * 0.3, 2, 0, 0, l.projRx);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.35, l.stroke);
        radGrad.addColorStop(0.85, l.color);
        radGrad.addColorStop(1, '#050914');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.projRx, l.projRy, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isHighlight ? '#ffffff' : l.stroke;
        ctx.lineWidth = isHighlight ? 3 : 1.5;
        ctx.stroke();

        // Rótulo del dominio
        ctx.fillStyle = isHighlight ? '#ffffff' : 'rgba(255, 255, 255, 0.75)';
        ctx.font = `bold ${Math.max(9, Math.floor(10 * l.scale))}px JetBrains Mono`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(l.name, 0, 0);

        ctx.restore();
      });

      // Dibujar ARN Guía interactivo hibridando en el canal central
      ctx.save();
      ctx.translate(cx, cy + gRnaOffset);
      ctx.globalAlpha = gRnaAlpha;

      // Canal central de gRNA con resplandor
      ctx.save();
      ctx.shadowBlur = isAssembled ? 18 : 6;
      ctx.shadowColor = '#22d3ee';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-110, 0);
      ctx.bezierCurveTo(-40, -35, 30, 25, 90, -10);
      ctx.stroke();

      // Horquillas del andamio
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(90, -10);
      ctx.bezierCurveTo(115, -45, 145, -45, 160, -10);
      ctx.stroke();
      ctx.restore();

      // Indicadores en el ARN
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const px = -110 + t * 200;
        const py = Math.sin(t * Math.PI * 2 + animTime * 3) * 6;
        ctx.fillStyle = i < 5 ? '#38bdf8' : '#c084fc';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Badge de estado RNP
      if (isAssembled) {
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
        ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        const bW = 260;
        ctx.beginPath();
        ctx.roundRect(cx - bW / 2, 25, bW, 28, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ecfdf5';
        ctx.font = 'bold 11px Plus Jakarta Sans';
        ctx.textAlign = 'center';
        ctx.fillText('✓ COMPLEJO RNP FORMADO (CAS9 + gRNA)', cx, 43);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isAssembled, activeDomain, autoOrbit]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    const nextAngle = orbitAngleRef.current + deltaX * 0.01;
    orbitAngleRef.current = nextAngle;
    setOrbitAngle(nextAngle);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Panel del complejo molecular Cas9 en 3D */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Endonucleasa Guiada por ARN
            </span>
            <h3 className="text-base font-bold text-white">
              Proteína Cas9 & Complejo Ribonucleoproteico (RNP) en 3D
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoOrbit(!autoOrbit)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                autoOrbit ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Giro orbital automático de cámara 3D"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{autoOrbit ? 'Órbita 3D activa' : 'Órbita pausada'}</span>
            </button>

            {!isAssembled ? (
              <button
                onClick={handleAssemble}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer animate-pulse"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Ensamblar ARN Guía + Cas9</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Desacoplar</span>
              </button>
            )}
          </div>
        </div>

        {/* Visor 3D orbital interactivo */}
        <div className="relative w-full h-[300px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block cursor-grab active:cursor-grabbing"
          />

          <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none">
            <span>Arrastra para rotar la proteína en 3D</span>
          </div>
        </div>

        {/* Tarjetas informativas de dominios catalíticos */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          <button
            onClick={() => {
              sound.playClick();
              setActiveDomain('rec');
            }}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeDomain === 'rec'
                ? 'bg-blue-950/40 border-cyan-500/60 shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-cyan-400 font-bold mb-0.5">Lóbulo REC</div>
            <div className="text-xs text-slate-300">Reconoce el ARN y orienta el complejo.</div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveDomain('nuc');
            }}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeDomain === 'nuc'
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-indigo-400 font-bold mb-0.5">Lóbulo NUC</div>
            <div className="text-xs text-slate-300">Aloja los centros catalíticos de corte.</div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveDomain('hnh');
            }}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeDomain === 'hnh'
                ? 'bg-sky-950/40 border-sky-500/60 shadow-sm ring-1 ring-sky-500/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-sky-400 font-bold mb-0.5">Dominio HNH</div>
            <div className="text-xs text-slate-300">Corta la hebra de ADN diana complementaria.</div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveDomain('ruvc');
            }}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeDomain === 'ruvc'
                ? 'bg-rose-950/40 border-rose-500/60 shadow-sm ring-1 ring-rose-500/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-rose-400 font-bold mb-0.5">Dominio RuvC</div>
            <div className="text-xs text-slate-300">Corta la hebra desplazada no diana.</div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveDomain('pam');
            }}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeDomain === 'pam'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-amber-400 font-bold mb-0.5">Dominio PI</div>
            <div className="text-xs text-slate-300">Inspecciona y se ancla al motivo PAM.</div>
          </button>
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isAssembled
              ? 'Complejo RNP activo: el ARN guía orienta la nucleasa hacia la secuencia complementaria del genoma.'
              : 'Presiona "Ensamblar" para ver cómo el ARN guía se ancla en la hendidura molecular de Cas9.'}
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>VER EL RECONOCIMIENTO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
