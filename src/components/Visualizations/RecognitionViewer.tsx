import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2, ArrowRight, Play, RotateCcw, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface RecognitionViewerProps {
  onNext?: () => void;
}

export const RecognitionViewer: React.FC<RecognitionViewerProps> = ({ onNext }) => {
  const [step, setStep] = useState<number>(1); // 1: Escaneo, 2: Anclaje PAM, 3: R-loop, 4: Reconocimiento Completo
  const [isRecognized, setIsRecognized] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stepsList = [
    {
      num: 1,
      title: '1. Escaneo e Inspección',
      desc: 'El complejo RNP se desplaza sobre el ADN en busca de un motivo químico compatible.',
    },
    {
      num: 2,
      title: '2. Anclaje en Motivo PAM',
      desc: 'El dominio PI de Cas9 reconoce la secuencia 5\'-NGG-3\', deteniendo transitoriamente la enzima.',
    },
    {
      num: 3,
      title: '3. Apertura de la Doble Hélice',
      desc: 'Se desnaturalizan los enlaces de hidrógeno locales formando el bucle de desenrollamiento (R-loop).',
    },
    {
      num: 4,
      title: '4. Reconocimiento Total',
      desc: 'El ARN guía se aparea con los 20 nucleótidos diana, activando los centros catalíticos de corte.',
    },
  ];

  const handleNextStep = () => {
    sound.playScan();
    const next = Math.min(4, step + 1);
    setStep(next);
    if (next === 4) {
      setIsRecognized(true);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setStep(1);
    setIsRecognized(false);
  };

  // Renderizado dinámico en Canvas de la escena de Reconocimiento
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
      const bg = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) * 0.7);
      bg.addColorStop(0, '#091126');
      bg.addColorStop(0.7, '#050814');
      bg.addColorStop(1, '#02040a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Partículas tenues
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(i * 45 + time * 0.4) * 0.5 + 0.5) * w;
        const py = (Math.cos(i * 77 + time * 0.3) * 0.5 + 0.5) * h;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parámetros dinámicos según el paso
      // En paso 4: cámara se acerca y se enfoca en el centro
      const zoomFactor = step === 4 ? 1.15 : 1.0;
      const cas9X = step === 1 ? cx - 110 + Math.sin(time * 2) * 20 : step === 2 ? cx - 20 : cx;
      const targetGlow = step >= 3;
      const nonTargetDim = step === 4 ? 0.35 : 0.85;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoomFactor, zoomFactor);
      ctx.translate(-cx, -cy);

      // 1. ADN Genómico (Doble Hélice extendida)
      const numNodes = 28;
      const spacing = 22;
      const startX = cx - (numNodes * spacing) / 2;
      const targetStart = 8;
      const targetEnd = 18;
      const pamIndex = 19;

      // Dibujar peldaños y hebras de ADN
      const strand1: { x: number; y: number }[] = [];
      const strand2: { x: number; y: number }[] = [];

      for (let i = 0; i < numNodes; i++) {
        const x = startX + i * spacing;
        const isTarget = i >= targetStart && i <= targetEnd;
        const isPam = i === pamIndex || i === pamIndex + 1;

        // Apertura de hebra en el sitio diana durante el R-loop (step >= 3)
        let openFactor = 0;
        if (step >= 3 && isTarget) {
          const tNorm = (i - targetStart) / (targetEnd - targetStart);
          openFactor = Math.sin(tNorm * Math.PI) * 22;
        }

        const y1 = cy - 22 - openFactor;
        const y2 = cy + 22 + (openFactor * 0.5);

        strand1.push({ x, y: y1 });
        strand2.push({ x, y: y2 });

        // Peldaño de bases
        const baseAlpha = (isTarget || isPam) ? 1.0 : nonTargetDim;
        ctx.save();
        ctx.globalAlpha = baseAlpha;

        if (isPam) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3.5;
        } else if (isTarget && targetGlow) {
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Esferas de bases
        ctx.fillStyle = isPam ? '#f59e0b' : isTarget && targetGlow ? '#38bdf8' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y1, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isPam ? '#fbbf24' : isTarget && targetGlow ? '#06b6d4' : '#6366f1';
        ctx.beginPath();
        ctx.arc(x, y2, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dibujar hebras fosfodiéster
      ctx.save();
      ctx.globalAlpha = nonTargetDim;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(strand1[0].x, strand1[0].y);
      for (let i = 1; i < numNodes; i++) {
        ctx.lineTo(strand1[i].x, strand1[i].y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(strand2[0].x, strand2[0].y);
      for (let i = 1; i < numNodes; i++) {
        ctx.lineTo(strand2[i].x, strand2[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // Si targetGlow, dibujar halo volumétrico sobre el sitio diana
      if (targetGlow) {
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#06b6d4';
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX + targetStart * spacing - 10, cy - 50, (targetEnd - targetStart + 1) * spacing + 20, 100);
        ctx.restore();
      }

      // 2. Proteína Cas9 envolviendo el complejo
      ctx.save();
      ctx.translate(cas9X, cy - 10);
      const cas9Alpha = step >= 2 ? 0.75 : 0.5;
      ctx.globalAlpha = cas9Alpha;

      // Masa molecular de Cas9
      ctx.fillStyle = 'rgba(30, 27, 75, 0.65)';
      ctx.strokeStyle = step === 4 ? '#818cf8' : '#4338ca';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 130, 70, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Centro catalítico RuvC (rosa) y HNH (azul)
      ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
      ctx.beginPath();
      ctx.arc(35, 30, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.beginPath();
      ctx.arc(-20, -30, 12, 0, Math.PI * 2);
      ctx.fill();

      // ARN Guía hibridado (Bucle R)
      if (step >= 3) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-90, -5);
        ctx.bezierCurveTo(-40, 18, 30, 18, 80, -5);
        ctx.stroke();

        // Andamio
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(80, -5);
        ctx.bezierCurveTo(95, -35, 115, -35, 125, -5);
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();

      // Indicadores y títulos sobreimpresos cinematográficos
      if (step >= 2) {
        // Indicador PAM detectado
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('▲ PAM (NGG)', cx + 115, cy + 65);
        ctx.restore();
      }

      if (step === 4) {
        // OBJETIVO IDENTIFICADO y CRISPR-CAS9 POSICIONADO
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
        ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        const bw1 = 200;
        ctx.beginPath();
        ctx.roundRect(cx - bw1 - 10, 20, bw1, 30, 15);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ecfdf5';
        ctx.font = 'bold 11px Plus Jakarta Sans';
        ctx.textAlign = 'center';
        ctx.fillText('✓ OBJETIVO IDENTIFICADO', cx - bw1 / 2 - 10, 39);

        // Segundo badge: SISTEMA CRISPR-CAS9 POSICIONADO
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#06b6d4';
        const bw2 = 250;
        ctx.beginPath();
        ctx.roundRect(cx + 10, 20, bw2, 30, 15);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e0f2fe';
        ctx.fillText('SISTEMA CRISPR-CAS9 POSICIONADO', cx + bw2 / 2 + 10, 39);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [step]);

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor visual del reconocimiento */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Momento de Reconocimiento
            </span>
            <h3 className="text-base font-bold text-white">
              Inspección Molecular & Posicionamiento de Cas9
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
            <button
              onClick={handleNextStep}
              disabled={step >= 4}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                step < 4
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Siguiente Etapa ({step}/4)</span>
            </button>
          </div>
        </div>

        {/* Lienzo del reconocimiento cinemático */}
        <div className="relative w-full h-[300px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Información en tiempo real */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 p-2 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">Estado:</span>
            <span className="text-cyan-300 font-bold">
              {step === 1 && 'Colisiones brownianas sobre el genoma'}
              {step === 2 && 'Fijación en motivo PAM 5\'-NGG-3\''}
              {step === 3 && 'Desenrollamiento de la doble hélice (Bucle R)'}
              {step === 4 && 'Apareamiento total y conformación catalítica lista'}
            </span>
          </div>
        </div>

        {/* Pasos interactivos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          {stepsList.map((s) => (
            <button
              key={s.num}
              onClick={() => {
                sound.playScan();
                setStep(s.num);
                if (s.num === 4) setIsRecognized(true);
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                step === s.num
                  ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                  : step > s.num
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${step === s.num ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {s.title}
                </span>
                {step > s.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {s.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">Filtro de seguridad biológica:</strong> Si no existe el motivo PAM adyacente, Cas9 no puede desnaturalizar la doble hélice y se disocia de inmediato sin producir daño al ADN.
          </span>
        </div>
      </div>

      {/* Navegación al paso crucial del Corte */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isRecognized
              ? 'El sistema CRISPR-Cas9 está completamente posicionado y activado. Presenciaremos el corte de doble cadena.'
              : 'Completa las 4 fases de reconocimiento para activar los centros catalíticos de corte.'}
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isRecognized
              ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/25 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <span>IR AL CORTE DEL ADN</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
