import React, { useState } from 'react';
import { RotateCcw, Compass, ExternalLink, Sparkles, Dna, HelpCircle } from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface ConclusionSceneProps {
  onRestart: () => void;
  onExploreFree: () => void;
}

export const ConclusionScene: React.FC<ConclusionSceneProps> = ({
  onRestart,
  onExploreFree,
}) => {
  const [showCompanionNotice, setShowCompanionNotice] = useState<boolean>(false);

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-8 select-none text-center">
      {/* Fondo con estrellas y partículas sutiles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#050811] to-[#04060d] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Recorrido de síntesis conceptual: ADN -> CRISPR -> CÉLULA -> ORGANISMO */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono text-cyan-400 mb-8 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-full backdrop-blur-md">
          <span>ADN</span>
          <span className="text-slate-600">→</span>
          <span>CRISPR</span>
          <span className="text-slate-600">→</span>
          <span>CÉLULA</span>
          <span className="text-slate-600">→</span>
          <span>ORGANISMO</span>
        </div>

        {/* Textos grandes reflexivos solicitados */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
          PODEMOS EDITAR EL ADN.
        </h2>

        <div className="my-2 h-0.5 w-16 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />

        <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 my-4 tracking-wide max-w-xl leading-snug">
          ¿CÓMO DECIDIMOS HASTA DÓNDE UTILIZAR ESA POSIBILIDAD?
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-8 leading-relaxed">
          La edición genética combina posibilidades científicas con desafíos técnicos, éticos y sociales.
        </p>

        {/* Botones de acción solicitados */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REPETIR EXPERIENCIA</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExploreFree();
            }}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>EXPLORAR NUEVAMENTE</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowCompanionNotice(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>CONOCER MÁS SOBRE CRISPR</span>
          </button>
        </div>

        {/* Modal / Nota sobre la aplicación complementaria "CRISPR: Misión Genética" */}
        {showCompanionNotice && (
          <div className="mt-8 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-left max-w-md animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-cyan-400" />
                Aplicación Complementaria
              </span>
              <button
                onClick={() => setShowCompanionNotice(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Esta experiencia visual fue concebida como la segunda parte del proyecto. Para profundizar en la historia, experimentos guiados y módulos teóricos, regresa a la primera aplicación:
            </p>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-xs text-cyan-400 font-bold border border-slate-800">
              &quot;CRISPR: MISIÓN GENÉTICA&quot;
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
