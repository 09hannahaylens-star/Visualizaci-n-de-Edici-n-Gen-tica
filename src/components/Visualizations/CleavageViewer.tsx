import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Scissors, RotateCcw, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface CleavageViewerProps {
  onNext?: () => void;
}

export const CleavageViewer: React.FC<CleavageViewerProps> = ({ onNext }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Estados cinematográficos:
  // 1: ready (sistema posicionado)
  // 2: zooming (acercar la cámara)
  // 3: slowmo (ralentizar el movimiento y resaltar fosfodiéster)
  // 4: cutting (corte de las cadenas por HNH y RuvC con chispa catalítica)
  // 5: separating (separar conceptualmente los extremos 5'-P y 3'-OH)
  // 6: cut_done (CORTE REALIZADO visible en 3D con explicación científica)
  const [cleavageStage, setCleavageStage] = useState<
    'ready' | 'zooming' | 'slowmo' | 'cutting' | 'separating' | 'cut_done'
  >('ready');

  const animFrameRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const separationRef = useRef<number>(0);
  const zoomFactorRef = useRef<number>(1.0);
  const sparkIntensityRef = useRef<number>(0);
  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }[]
  >([]);

  // Disparar la secuencia cinematográfica de 7 pasos
  const triggerCleavageSequence = useCallback(() => {
    sound.playScan();
    setCleavageStage('zooming');

    // Paso 1: Zoom in de cámara (600ms)
    setTimeout(() => {
      setCleavageStage('slowmo');
      // Paso 2: Ralentización y resalto fosfodiéster (600ms)
      setTimeout(() => {
        sound.playCleavage();
        setCleavageStage('cutting');
        sparkIntensityRef.current = 1.0;

        // Generar partículas enzimáticas elegantes
        const newParticles = [];
        const colors = ['#22d3ee', '#f43f5e', '#ffffff', '#38bdf8', '#818cf8'];
        for (let i = 0; i < 45; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1.5;
          newParticles.push({
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
          });
        }
        particlesRef.current = newParticles;

        // Paso 5: Separación de extremos (800ms)
        setTimeout(() => {
          setCleavageStage('separating');
          // Paso 6 y 7: Transición y estado final permanente
          setTimeout(() => {
            setCleavageStage('cut_done');
          }, 900);
        }, 600);
      }, 700);
    }, 600);
  }, []);

  const resetCleavage = () => {
    sound.playClick();
    setCleavageStage('ready');
    separationRef.current = 0;
    zoomFactorRef.current = 1.0;
    sparkIntensityRef.current = 0;
    particlesRef.current = [];
  };

  // Motor de renderizado en Canvas para la escena central del corte
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Velocidad de animación según la fase (cámara lenta en slowmo/cutting)
      const speedScale =
        cleavageStage === 'slowmo' || cleavageStage === 'cutting' ? 0.25 : cleavageStage === 'cut_done' ? 0.4 : 1.0;
      animTimeRef.current += dt * speedScale;

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
      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, w, h);

      // Interpolación suave de zoom de cámara
      const targetZoom =
        cleavageStage === 'ready'
          ? 1.0
          : cleavageStage === 'zooming' || cleavageStage === 'slowmo'
          ? 1.28
          : cleavageStage === 'cutting'
          ? 1.35
          : 1.25;
      zoomFactorRef.current += (targetZoom - zoomFactorRef.current) * Math.min(1, dt * 4);

      // Separación de cadenas si está en fase 'separating' o 'cut_done'
      if (cleavageStage === 'separating' || cleavageStage === 'cut_done') {
        const targetSep = 60;
        if (separationRef.current < targetSep) {
          separationRef.current += dt * 55;
        }
      }

      // Atenuar chispas catalíticas
      if (sparkIntensityRef.current > 0.01) {
        sparkIntensityRef.current = Math.max(0, sparkIntensityRef.current - dt * 2.0);
      }

      // Dibujar partículas catalíticas de escisión
      if (particlesRef.current.length > 0) {
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = Math.max(0, p.alpha - dt * 1.5);
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(cx + p.x, cy + p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoomFactorRef.current, zoomFactorRef.current);
      ctx.translate(-cx, -cy);

      // Dibujar las cadenas de ADN
      const numNodes = 26;
      const spacing = 20;
      const startX = cx - (numNodes * spacing) / 2;
      const cutPoint = Math.floor(numNodes / 2);
      const sep = separationRef.current;

      // Cas9 en el fondo envolviendo el sitio de corte
      ctx.save();
      const cas9Alpha = cleavageStage === 'cut_done' ? 0.35 : 0.65;
      ctx.globalAlpha = cas9Alpha;
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 110, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Indicadores catalíticos HNH y RuvC
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 25, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const strand1: { x: number; y: number }[] = [];
      const strand2: { x: number; y: number }[] = [];

      for (let i = 0; i < numNodes; i++) {
        let xOffset = 0;
        let yOffset = 0;
        if (sep > 0) {
          if (i < cutPoint) {
            xOffset = -sep;
            yOffset = -Math.sin(sep * 0.05) * 5;
          } else {
            xOffset = sep;
            yOffset = Math.sin(sep * 0.05) * 5;
          }
        }

        const basePosX = startX + i * spacing + xOffset;
        const angle = i * 0.48 + animTimeRef.current * 1.2;
        const radius = 36;
        const y1 = cy + Math.sin(angle) * radius + yOffset;
        const y2 = cy - Math.sin(angle) * radius + yOffset;

        strand1.push({ x: basePosX, y: y1 });
        strand2.push({ x: basePosX, y: y2 });

        const isCutSite = i === cutPoint - 1 || i === cutPoint;
        const bondAlpha = isCutSite && sep > 8 ? 0 : 0.65;

        // Peldaños de bases
        if (bondAlpha > 0) {
          ctx.strokeStyle =
            isCutSite && (cleavageStage === 'slowmo' || cleavageStage === 'cutting')
              ? 'rgba(244, 63, 94, 0.95)'
              : `rgba(148, 163, 184, ${bondAlpha})`;
          ctx.lineWidth = isCutSite ? 3.5 : 2;
          ctx.beginPath();
          ctx.moveTo(basePosX, y1);
          ctx.lineTo(basePosX, y2);
          ctx.stroke();
        }

        // Esferas de bases
        ctx.fillStyle = isCutSite ? '#fb7185' : (i % 2 === 0 ? '#38bdf8' : '#818cf8');
        ctx.beginPath();
        ctx.arc(basePosX, y1, 4.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isCutSite ? '#f43f5e' : (i % 2 === 0 ? '#a855f7' : '#34d399');
        ctx.beginPath();
        ctx.arc(basePosX, y2, 4.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar hebras de esqueleto fosfodiéster
      for (let i = 0; i < numNodes - 1; i++) {
        if (i === cutPoint - 1 && sep > 2) {
          continue; // Ruptura del enlace fosfodiéster
        }
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(strand1[i].x, strand1[i].y);
        ctx.lineTo(strand1[i + 1].x, strand1[i + 1].y);
        ctx.stroke();

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(strand2[i].x, strand2[i].y);
        ctx.lineTo(strand2[i + 1].x, strand2[i + 1].y);
        ctx.stroke();
      }

      // Si está en fase slowmo o cutting, resaltar enlaces fosfodiéster diana (-3 nt respecto a PAM)
      if (cleavageStage === 'slowmo' || cleavageStage === 'cutting') {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#f43f5e';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 50);
        ctx.lineTo(cx, cy + 50);
        ctx.stroke();
        ctx.restore();
      }

      // Chispa catalítica en el momento del corte
      if (sparkIntensityRef.current > 0.05) {
        ctx.save();
        ctx.globalAlpha = sparkIntensityRef.current * 0.95;
        const sparkGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 120 * sparkIntensityRef.current);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.3, '#38bdf8');
        sparkGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.4)');
        sparkGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 120 * sparkIntensityRef.current, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de choque de escisión
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 55 * (1 - sparkIntensityRef.current), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Marcadores moleculares de extremos rotos
      if (sep > 20) {
        ctx.save();
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText("5'-P", cx - sep + 14, cy - 26);
        ctx.fillText("3'-OH", cx - sep + 14, cy + 28);
        ctx.fillText("3'-OH", cx + sep - 14, cy - 26);
        ctx.fillText("5'-P", cx + sep - 14, cy + 28);
        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cleavageStage]);

  return (
    <div className="flex flex-col gap-4">
      {/* Visor cinematográfico del corte */}
      <div className="p-5 rounded-xl bg-[#060a17] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-rose-400 rotate-[-45deg]" />
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                Momento Central de la Edición
              </span>
              <h3 className="text-base font-bold text-white">
                El Corte del ADN: Ruptura de Doble Cadena (DSB)
              </h3>
            </div>
          </div>

          <button
            onClick={resetCleavage}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repetir Corte</span>
          </button>
        </div>

        {/* Lienzo del corte con beats cinematográficos */}
        <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Estado de corte finalizado (CORTE REALIZADO) */}
          {cleavageStage === 'cut_done' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-500">
              <div className="px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                Doble Rotura Producida (DSB)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                CORTE REALIZADO
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-md mt-2 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                La célula activa mecanismos de reparación del ADN.
              </p>
            </div>
          )}

          {/* Botón de disparo cuando está listo */}
          {cleavageStage === 'ready' && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={triggerCleavageSequence}
                className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-rose-500/30 transition-all hover:scale-105 cursor-pointer animate-pulse"
              >
                <Scissors className="w-4 h-4 rotate-[-45deg]" />
                <span>EJECUTAR CORTE CINEMÁTICO</span>
              </button>
            </div>
          )}

          {/* Indicador de cinemática en curso */}
          {cleavageStage !== 'ready' && cleavageStage !== 'cut_done' && (
            <div className="absolute bottom-3 left-3 text-[11px] font-mono text-cyan-300 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-md border border-slate-800">
              {cleavageStage === 'zooming' && '1. Acercando cámara al sitio objetivo...'}
              {cleavageStage === 'slowmo' && '2. Ralentizando movimiento · Resaltando enlaces fosfodiéster...'}
              {cleavageStage === 'cutting' && '3. Activación catalítica HNH & RuvC · Escisión de doble cadena...'}
              {cleavageStage === 'separating' && '4. Separando conceptualmente los extremos...'}
            </div>
          )}
        </div>

        {/* Ficha técnica y rigor científico */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-1">
              Posición exacta
            </span>
            <span className="text-slate-300 leading-relaxed">
              El corte ocurre a 3 pares de bases en sentido 5&apos; respecto al motivo PAM.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-mono text-indigo-400 font-bold block mb-1">
              Dos nucleasas independientes
            </span>
            <span className="text-slate-300 leading-relaxed">
              HNH escinde la hebra diana y RuvC la hebra desplazada opuesta.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-mono text-rose-400 font-bold block mb-1">
              Alarma celular
            </span>
            <span className="text-slate-300 leading-relaxed">
              La doble rotura pone en alerta a las proteínas de vigilancia del ciclo celular.
            </span>
          </div>
        </div>
      </div>

      {/* Navegación al paso crucial de Reparación */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {cleavageStage === 'cut_done'
              ? 'El corte está hecho. Ahora veamos cómo la célula intenta reparar el ADN.'
              : 'Presiona "Ejecutar corte cinemático" para apreciar el momento central en cámara lenta.'}
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            cleavageStage === 'cut_done'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <span>VER VÍAS DE REPARACIÓN (NHEJ VS HDR)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
