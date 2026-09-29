import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Activity, Sparkles, Play, Pause, RotateCcw, Dna, User } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface MedicalCasgevyViewerProps {
  onNext?: () => void;
}

export const MedicalCasgevyViewer: React.FC<MedicalCasgevyViewerProps> = ({ onNext }) => {
  const [activeStep, setActiveStep] = useState<number>(2); // 1 a 5
  const [isPlayingPipeline, setIsPlayingPipeline] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'sickled' | 'healthy'>('healthy');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const steps = [
    {
      num: 1,
      title: '1. Paciente',
      tag: 'PACIENTE',
      desc: 'El paciente presenta anemia falciforme; sus glóbulos rojos adoptan forma rígida en hoz.',
    },
    {
      num: 2,
      title: '2. Células Madre (CD34+)',
      tag: 'CÉLULAS',
      desc: 'Se extraen células madre hematopoyéticas capaces de generar todo el linaje sanguíneo.',
    },
    {
      num: 3,
      title: '3. Edición Genética Ex Vivo',
      tag: 'EDICIÓN GENÉTICA',
      desc: 'El complejo CRISPR-Cas9 desactiva el represor BCL11A sin tocar el gen de la hemoglobina defectuosa.',
    },
    {
      num: 4,
      title: '4. Células Modificadas (HbF)',
      tag: 'CÉLULAS MODIFICADAS',
      desc: 'Las células editadas reanudan la producción de Hemoglobina Fetal (HbF), sana y elástica.',
    },
    {
      num: 5,
      title: '5. Reinfusión',
      tag: 'REINFUSIÓN',
      desc: 'Las células vuelven al paciente, anidan en la médula ósea y generan glóbulos rojos normales.',
    },
  ];

  // Pipeline interactivo en Canvas con flujo continuo de células sanguíneas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Células que viajan a través del circuito terapéutico de 5 nodos
    interface FlowCell {
      progress: number; // 0.0 a 5.0
      speed: number;
      offsetY: number;
      size: number;
    }

    const flowCells: FlowCell[] = Array.from({ length: 18 }, (_, i) => ({
      progress: (i / 18) * 5.0,
      speed: 0.16 + Math.random() * 0.06,
      offsetY: (Math.random() - 0.5) * 12,
      size: Math.random() * 2 + 5.5,
    }));

    const render = (currentTime: number) => {
      time = currentTime * 0.001;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      // Fondo oscuro espacial/biomédico
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, '#0d132b');
      bgGrad.addColorStop(0.7, '#060a17');
      bgGrad.addColorStop(1, '#020409');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Posiciones de los 5 nodos en el lienzo
      const paddingX = Math.min(60, w * 0.1);
      const startX = paddingX;
      const endX = w - paddingX;
      const stepDist = (endX - startX) / 4;
      const centerY = h * 0.5;

      const nodes = [
        { num: 1, label: 'PACIENTE', x: startX, y: centerY, color: '#f43f5e' },
        { num: 2, label: 'CÉLULAS', x: startX + stepDist, y: centerY, color: '#38bdf8' },
        { num: 3, label: 'EDICIÓN', x: startX + stepDist * 2, y: centerY, color: '#a855f7' },
        { num: 4, label: 'MODIFICADAS', x: startX + stepDist * 3, y: centerY, color: '#10b981' },
        { num: 5, label: 'REINFUSIÓN', x: endX, y: centerY, color: '#ec4899' },
      ];

      // Pista luminosa conectora
      ctx.save();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
      }
      ctx.stroke();

      // Pista de pulso activo
      const gradPulse = ctx.createLinearGradient(startX, centerY, endX, centerY);
      gradPulse.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
      gradPulse.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
      gradPulse.addColorStop(1, 'rgba(16, 185, 129, 0.6)');
      ctx.strokeStyle = gradPulse;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -time * 25;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Mover y dibujar las células que fluyen por el circuito
      flowCells.forEach((cell) => {
        if (isPlayingPipeline) {
          cell.progress += cell.speed * 0.016;
          if (cell.progress >= 5.0) {
            cell.progress = 0.0;
          }
        }

        // Posición interpolada en los segmentos del circuito
        const segIdx = Math.floor(cell.progress);
        const nextSeg = Math.min(4, segIdx + 1);
        const t = cell.progress - segIdx;

        const p1 = nodes[segIdx];
        const p2 = nodes[nextSeg];

        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t + cell.offsetY;

        ctx.save();
        // Características de la célula según la etapa:
        // Antes de edición (seg < 2): células falciformes / precursoras (rojo/azul apagado)
        // En edición (seg === 2): electroporación con destellos púrpuras
        // Después de edición (seg >= 3): glóbulos bicóncavos elásticos y radiantes (esmeralda/fucsia saludable)
        if (cell.progress < 2.0) {
          // Glóbulo falciforme inicial
          ctx.fillStyle = '#f43f5e';
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(x, y, cell.size * 1.3, cell.size * 0.6, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (cell.progress < 3.0) {
          // Paso por la cámara de edición genética
          const pulse = 0.8 + 0.3 * Math.sin(time * 8);
          ctx.fillStyle = '#c084fc';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#a855f7';
          ctx.beginPath();
          ctx.arc(x, y, cell.size * pulse, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Glóbulo rojo modificado y sano con HbF
          ctx.fillStyle = '#10b981';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#34d399';
          ctx.beginPath();
          ctx.arc(x, y, cell.size, 0, Math.PI * 2);
          ctx.fill();

          // Centro bicóncavo
          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.arc(x, y, cell.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Dibujar las 5 estaciones (Nodos)
      nodes.forEach((n) => {
        const isCurrent = activeStep === n.num;
        const rNode = isCurrent ? 24 : 18;

        ctx.save();
        if (isCurrent) {
          ctx.shadowBlur = 18;
          ctx.shadowColor = n.color;
        }

        // Círculo del nodo
        ctx.fillStyle = isCurrent ? n.color : '#0f172a';
        ctx.strokeStyle = isCurrent ? '#ffffff' : n.color;
        ctx.lineWidth = isCurrent ? 2.5 : 1.8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, rNode, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Número interior
        ctx.fillStyle = isCurrent ? '#050811' : '#ffffff';
        ctx.font = `bold ${isCurrent ? 12 : 10}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`0${n.num}`, n.x, n.y);

        // Etiqueta del nodo
        ctx.fillStyle = isCurrent ? '#ffffff' : '#94a3b8';
        ctx.font = `bold 10px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillText(n.label, n.x, n.y + rNode + 16);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeStep, isPlayingPipeline]);

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor principal de la aplicación médica Casgevy */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Cabecera con transición visual de escala: ADN → CÉLULA → PACIENTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
          <div>
            {/* Ruta visual de zoom-out */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono mb-1.5 flex-wrap">
              <span className="text-slate-500">Escala:</span>
              <span className="text-cyan-400 font-semibold">ADN (2 nm)</span>
              <span className="text-slate-600">→</span>
              <span className="text-indigo-400 font-semibold">Célula (20 μm)</span>
              <span className="text-slate-600">→</span>
              <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                Organismo & Medicina (Casgevy)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Flujo Terapéutico Conceptual: De la Edición a la Cura Clínica
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsPlayingPipeline(!isPlayingPipeline);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              {isPlayingPipeline ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pausar flujo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reproducir flujo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PIPELINE VISUAL ANIMADO EN CANVAS: PACIENTE → CÉLULAS → EDICIÓN → MODIFICADAS → REINFUSIÓN */}
        <div className="relative w-full h-[180px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden mb-4 select-none">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Rótulo de la etapa activa sobre el lienzo */}
          <div className="absolute top-2.5 left-3 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-300">
            <span>Haz clic en las etapas inferiores para enfocar cada fase del proceso</span>
          </div>
        </div>

        {/* SELECTOR DE LAS 5 ETAPAS CLÍNICAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          {steps.map((st) => {
            const isActive = activeStep === st.num;
            return (
              <button
                key={st.num}
                onClick={() => {
                  sound.playClick();
                  setActiveStep(st.num);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-950/40 border-rose-500/70 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-0.5">
                  <span className={isActive ? 'text-rose-300 font-bold' : 'text-slate-400'}>
                    0{st.num}
                  </span>
                  {activeStep > st.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-white truncate">{st.tag}</div>
              </button>
            );
          })}
        </div>

        {/* VISUALIZACIÓN DINÁMICA DE LA TRANSFORMACIÓN CELULAR (GLÓBULO ROJO) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
          {/* Gráfico SVG interactivo del eritrocito falciforme vs sano con HbF */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('sickled');
                }}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'sickled'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Antes: Glóbulo Falciforme
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('healthy');
                }}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'healthy'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Después: Glóbulo Sano (HbF)
              </button>
            </div>

            <svg viewBox="0 0 320 130" className="w-full max-w-xs h-auto select-none py-1">
              <defs>
                <radialGradient id="gradSickled" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#881337" />
                </radialGradient>
                <radialGradient id="gradHealthy" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="60%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#064e3b" />
                </radialGradient>
              </defs>

              {viewMode === 'sickled' ? (
                // Célula falciforme rígida
                <g className="animate-in fade-in zoom-in-95 duration-300">
                  <path
                    d="M 105,20 C 180,10 220,55 205,105 C 170,85 150,48 105,20 Z"
                    fill="url(#gradSickled)"
                    stroke="#fb7185"
                    strokeWidth="2.5"
                  />
                  <text x="160" y="122" fontSize="10.5" fontFamily="JetBrains Mono" fill="#fda4af" textAnchor="middle" fontWeight="bold">
                    Glóbulo Falciforme (Rígido, Frágil)
                  </text>
                </g>
              ) : (
                // Célula bicóncava elástica con HbF reactivada
                <g className="animate-in fade-in zoom-in-95 duration-300">
                  <ellipse cx="160" cy="55" rx="68" ry="40" fill="url(#gradHealthy)" stroke="#34d399" strokeWidth="2.5" />
                  <ellipse cx="160" cy="55" rx="32" ry="18" fill="#064e3b" opacity="0.75" />
                  <text x="160" y="122" fontSize="10.5" fontFamily="JetBrains Mono" fill="#34d399" textAnchor="middle" fontWeight="bold">
                    ✓ Glóbulo Bicóncavo Flexible (HbF Activa)
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Explicación concisa y directa de la etapa activa */}
          <div className="w-full md:w-1/2 space-y-2">
            <span className="text-xs font-mono text-rose-400 font-semibold uppercase tracking-wider block">
              Etapa {activeStep} de 5: {steps[activeStep - 1].tag}
            </span>
            <h4 className="text-base font-bold text-white">
              {steps[activeStep - 1].title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {steps[activeStep - 1].desc}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  const next = activeStep < 5 ? activeStep + 1 : 1;
                  setActiveStep(next);
                  if (next >= 4) setViewMode('healthy');
                  else if (next === 1) setViewMode('sickled');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <span>{activeStep < 5 ? 'Avanzar al siguiente paso' : 'Reiniciar al paso 1'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nota biológica conceptual sin jerga de laboratorio */}
        <div className="mt-3 p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            <strong>Concepto clave de Casgevy:</strong> En vez de intentar reemplazar el gen defectuoso de la hemoglobina adulta, CRISPR desactiva el interruptor genético <em>BCL11A</em>. Esto reanuda la producción de hemoglobina fetal (HbF), corrigiendo la forma y elasticidad celular.
          </span>
        </div>
      </div>

      {/* Navegación al paso de Somática vs Germinal */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-400">
          Casgevy actúa exclusivamente en células somáticas de la sangre. ¿Qué diferencia este abordaje de la edición en la línea germinal?
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>SOMÁTICA VS GERMINAL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
