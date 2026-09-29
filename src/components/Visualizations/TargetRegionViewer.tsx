import React, { useState } from 'react';
import { Target, CheckCircle2, Search, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface TargetRegionViewerProps {
  onIdentified?: () => void;
  onNext?: () => void;
}

export const TargetRegionViewer: React.FC<TargetRegionViewerProps> = ({
  onIdentified,
  onNext,
}) => {
  const [isIdentified, setIsIdentified] = useState<boolean>(false);
  const [activeBaseIndex, setActiveBaseIndex] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Secuencia de ADN simulada con la región diana (20 nucleótidos) y el motivo PAM (NGG: CGG)
  const prefixBases = ['G', 'A', 'T', 'C', 'C', 'T'];
  const targetBases = ['C', 'A', 'G', 'T', 'G', 'G', 'C', 'G', 'A', 'A', 'T', 'C', 'C', 'T', 'A', 'G', 'C', 'T', 'A', 'A'];
  const pamBases = ['C', 'G', 'G'];
  const suffixBases = ['T', 'A', 'G', 'A', 'T', 'C'];

  const complement: Record<string, string> = {
    A: 'T',
    T: 'A',
    C: 'G',
    G: 'C',
  };

  const handleIdentify = () => {
    sound.playScan();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsIdentified(true);
      if (onIdentified) {
        onIdentified();
      }
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Visor interactivo de secuencia cromosómica */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl overflow-hidden relative">
        {/* Fondo con retícula científica */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-semibold text-white">
                Locus Genómico Diana
              </span>
              <span className="text-xs font-mono text-slate-500">
                Chr 11 · Exón 2 · Secuencia diana
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/20 border border-cyan-400 inline-block shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                Región Diana (20 nt)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-400 inline-block shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                Motivo PAM (NGG)
              </span>
            </div>
          </div>

          {/* Banda de nucleótidos deslizable */}
          <div className="overflow-x-auto pb-4 pt-2">
            <div className="min-w-[760px] flex flex-col gap-2 font-mono select-none">
              {/* Hebra sentido 5' -> 3' */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-cyan-400 font-bold w-12 shrink-0">
                  5&apos; →
                </span>
                <div className="flex items-center gap-1">
                  {/* Prefijo */}
                  {prefixBases.map((b, i) => (
                    <div
                      key={`pre-top-${i}`}
                      className="w-7 h-9 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold"
                    >
                      {b}
                    </div>
                  ))}

                  {/* Región Diana (20 nt) */}
                  {targetBases.map((b, i) => {
                    const isHovered = activeBaseIndex === i;
                    return (
                      <div
                        key={`tgt-top-${i}`}
                        onMouseEnter={() => setActiveBaseIndex(i)}
                        onMouseLeave={() => setActiveBaseIndex(null)}
                        className={`w-7 h-9 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isIdentified
                            ? 'bg-cyan-500/25 border-2 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/40 -translate-y-1'
                            : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                        } ${isHovered ? 'ring-2 ring-cyan-300 scale-105' : ''}`}
                      >
                        {b}
                      </div>
                    );
                  })}

                  {/* Motivo PAM */}
                  {pamBases.map((b, i) => (
                    <div
                      key={`pam-top-${i}`}
                      className={`w-7 h-9 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isIdentified
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-200 shadow-md shadow-amber-500/40 -translate-y-1'
                          : 'bg-slate-900 border border-slate-700/80 text-amber-300'
                      }`}
                    >
                      {b}
                    </div>
                  ))}

                  {/* Sufijo */}
                  {suffixBases.map((b, i) => (
                    <div
                      key={`suf-top-${i}`}
                      className="w-7 h-9 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold"
                    >
                      {b}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 w-10 text-right shrink-0">
                  → 3&apos;
                </span>
              </div>

              {/* Puentes de hidrógeno centrales */}
              <div className="flex items-center gap-1">
                <span className="w-12 shrink-0" />
                <div className="flex items-center gap-1">
                  {[...prefixBases, ...targetBases, ...pamBases, ...suffixBases].map((_, i) => (
                    <div key={`bridge-${i}`} className="w-7 flex justify-center py-0.5">
                      <div
                        className={`w-0.5 h-3.5 transition-colors duration-300 ${
                          isIdentified && i >= prefixBases.length && i < prefixBases.length + targetBases.length
                            ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                            : isIdentified && i >= prefixBases.length + targetBases.length && i < prefixBases.length + targetBases.length + pamBases.length
                            ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                            : 'bg-slate-700'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <span className="w-10 shrink-0" />
              </div>

              {/* Hebra complementaria 3' -> 5' */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-indigo-400 font-bold w-12 shrink-0">
                  3&apos; ←
                </span>
                <div className="flex items-center gap-1">
                  {/* Prefijo */}
                  {prefixBases.map((b, i) => (
                    <div
                      key={`pre-bot-${i}`}
                      className="w-7 h-9 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold"
                    >
                      {complement[b]}
                    </div>
                  ))}

                  {/* Diana complementaria */}
                  {targetBases.map((b, i) => (
                    <div
                      key={`tgt-bot-${i}`}
                      className={`w-7 h-9 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isIdentified
                          ? 'bg-cyan-950/60 border border-cyan-500/60 text-cyan-300 shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {complement[b]}
                    </div>
                  ))}

                  {/* PAM complementaria */}
                  {pamBases.map((b, i) => (
                    <div
                      key={`pam-bot-${i}`}
                      className={`w-7 h-9 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isIdentified
                          ? 'bg-amber-950/60 border border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {complement[b]}
                    </div>
                  ))}

                  {/* Sufijo complementaria */}
                  {suffixBases.map((b, i) => (
                    <div
                      key={`suf-bot-${i}`}
                      className="w-7 h-9 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold"
                    >
                      {complement[b]}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 w-10 text-right shrink-0">
                  ← 5&apos;
                </span>
              </div>
            </div>
          </div>

          {/* Calibración visual y estado de reconocimiento */}
          {isIdentified && (
            <div className="mt-3 p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-400/50 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 shadow-lg shadow-cyan-950/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold text-white uppercase tracking-wider block">
                    REGIÓN OBJETIVO IDENTIFICADA
                  </span>
                  <span className="text-cyan-200 text-[11px]">
                    20 nucleótidos diana localizados con motivo PAM (CGG) adyacente para anclaje de Cas9.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-900/40 px-2.5 py-1 rounded border border-cyan-500/30">
                  ΔG = -32.4 kcal/mol
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controles de acción */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {isIdentified
              ? 'La región objetivo ha sido fijada. Ahora el ARN guía se dirigirá hacia esta secuencia.'
              : 'Haz clic en "Identificar Objetivo" para escanear y fijar la secuencia diana y su motivo PAM.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isIdentified ? (
            <button
              onClick={handleIdentify}
              disabled={isScanning}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Search className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'ESCANEANDO LOCUS...' : 'IDENTIFICAR OBJETIVO'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                if (onNext) onNext();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] animate-pulse cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>PASAR AL ARN GUÍA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
