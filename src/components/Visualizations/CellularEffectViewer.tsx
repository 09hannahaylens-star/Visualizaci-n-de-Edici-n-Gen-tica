import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RefreshCw, ZoomOut, Dna, Disc, Sparkles } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface CellularEffectViewerProps {
  onNext?: () => void;
}

export const CellularEffectViewer: React.FC<CellularEffectViewerProps> = ({ onNext }) => {
  const [zoomLevel, setZoomLevel] = useState<'dna' | 'nucleus' | 'cell'>('dna');
  const [isZoomingOut, setIsZoomingOut] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    {
      id: 'dna' as const,
      num: 1,
      title: '1. Nivel Molecular (ADN)',
      scale: '2 nm',
      desc: 'El cambio de nucleótidos queda grabado en el genoma cromosómico.',
    },
    {
      id: 'nucleus' as const,
      num: 2,
      title: '2. Nivel Nuclear (Transcripción)',
      scale: '6 μm',
      desc: 'La ARN polimerasa transcribe el ADN alterado a ARNm que sale por los poros nucleares.',
    },
    {
      id: 'cell' as const,
      num: 3,
      title: '3. Nivel Celular Completo',
      scale: '20 μm',
      desc: 'La nueva proteína se expresa y transforma la fisiología, forma o función de la célula.',
    },
  ];

  const handleZoomOutStep = () => {
    sound.playScan();
    setIsZoomingOut(true);
    setTimeout(() => {
      setZoomLevel((cur) => (cur === 'dna' ? 'nucleus' : 'cell'));
      setIsZoomingOut(false);
    }, 450);
  };

  // Renderizado dinámico en Canvas del zoom-out celular inverso
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = (currentTime: number) => {
      time = currentTime * 0.001;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      // Fondo oscuro
      const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.7);
      bg.addColorStop(0, '#0a1228');
      bg.addColorStop(0.7, '#050914');
      bg.addColorStop(1, '#020409');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Si zoomLevel === 'dna'
      if (zoomLevel === 'dna') {
        ctx.save();
        ctx.translate(cx, cy);

        // Doble hélice grande con nucleótido modificado brillante
        for (let i = -10; i <= 10; i++) {
          const y = i * 16;
          const a = i * 0.45 + time * 1.5;
          const x1 = Math.cos(a) * 55;
          const x2 = -x1;
          const isEdited = i === 0;

          // Peldaño
          ctx.strokeStyle = isEdited ? '#10b981' : 'rgba(148, 163, 184, 0.5)';
          ctx.lineWidth = isEdited ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();

          // Esferas
          ctx.fillStyle = isEdited ? '#34d399' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(x1, y, isEdited ? 7 : 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isEdited ? '#34d399' : '#a855f7';
          ctx.beginPath();
          ctx.arc(x2, y, isEdited ? 7 : 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      } else if (zoomLevel === 'nucleus') {
        // Envoltura nuclear con cromatina
        ctx.save();
        ctx.translate(cx, cy);

        // Núcleo
        ctx.fillStyle = 'rgba(147, 51, 234, 0.25)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Poros nucleares
        for (let i = 0; i < 16; i++) {
          const a = (i * Math.PI * 2) / 16;
          const px = 95 * Math.cos(a);
          const py = 95 * Math.sin(a);
          ctx.fillStyle = '#e9d5ff';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hebras de cromatina interna
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-45, -30);
        ctx.bezierCurveTo(-15, -70, 45, -35, 20, 10);
        ctx.bezierCurveTo(0, 50, -35, 40, -10, 20);
        ctx.stroke();

        // Destello en el gen editado
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#34d399';
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(10, 15, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      } else {
        // Célula completa (20 μm)
        ctx.save();
        ctx.translate(cx, cy);

        // Membrana plasmática
        const cellR = 125;
        const cellGrad = ctx.createRadialGradient(-20, -20, 30, 0, 0, cellR);
        cellGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
        cellGrad.addColorStop(0.85, 'rgba(14, 165, 233, 0.35)');
        cellGrad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
        ctx.fillStyle = cellGrad;

        ctx.beginPath();
        for (let i = 0; i <= 36; i++) {
          const a = (i / 36) * Math.PI * 2;
          const wave = Math.sin(a * 5 + time * 2) * 3;
          const r = cellR + wave;
          const px = r * Math.cos(a);
          const py = r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Núcleo interior pequeño
        ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-15, 10, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mitocondrias periféricas
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + 0.4;
          const px = 75 * Math.cos(a);
          const py = 75 * Math.sin(a);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(px, py, 14, 7, a, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [zoomLevel]);

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor de cascada biológica y zoom out */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
              Ampliación de Escala Inversa
            </span>
            <h3 className="text-base font-bold text-white">
              Del Cambio Molecular al Efecto Celular
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setZoomLevel('dna');
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Volver a ADN</span>
            </button>
            {zoomLevel !== 'cell' && (
              <button
                onClick={handleZoomOutStep}
                disabled={isZoomingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer animate-pulse"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Alejar Cámara ({zoomLevel === 'dna' ? 'Hacia el Núcleo' : 'Hacia la Célula'})</span>
              </button>
            )}
          </div>
        </div>

        {/* Visor interactivo del zoom out celular */}
        <div className="relative w-full h-[260px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Rótulo de la escala visible */}
          <div className="absolute top-3 left-3 flex items-center gap-2 p-2 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">Escala actual:</span>
            <span className="text-cyan-300 font-bold">
              {zoomLevel === 'dna' && '1. ADN (2 nm) · Locus editado'}
              {zoomLevel === 'nucleus' && '2. Núcleo (6 μm) · Transcripción a ARNm'}
              {zoomLevel === 'cell' && '3. Célula Completa (20 μm) · Efecto Fenotípico'}
            </span>
          </div>
        </div>

        {/* Selector de escala de la cascada */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          {stages.map((st) => {
            const isActive = zoomLevel === st.id;
            return (
              <button
                key={st.id}
                onClick={() => {
                  sound.playScan();
                  setZoomLevel(st.id);
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-cyan-400 font-bold">{st.scale}</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400" style={{ opacity: isActive ? 1 : 0.2 }} />
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">{st.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{st.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Declaración rigurosa solicitada */}
        <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong>Principio biológico:</strong> Un cambio molecular en la secuencia genética puede tener consecuencias decisivas a nivel celular. Sin embargo, no toda modificación produce necesariamente un beneficio funcional; la consecuencia depende del contexto biológico y del tipo celular específico.
        </div>
      </div>

      {/* Navegación al paso de Medicina & Casgevy */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-400">
          ¿Cómo se traduce esta cascada celular en tratamientos médicos reales para pacientes humanos?
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>CONEXIÓN CON LA MEDICINA (CASGEVY)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
