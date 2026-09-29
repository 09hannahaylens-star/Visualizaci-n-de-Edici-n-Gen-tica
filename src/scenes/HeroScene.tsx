import React from 'react';
import { ArrowRight, HelpCircle, Dna } from 'lucide-react';
import { InteractiveDnaCanvas } from '../components/Visualizations/InteractiveDnaCanvas';
import { sound } from '../audio/soundEffects';

interface HeroSceneProps {
  onStart: () => void;
  onOpenHelp: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onStart, onOpenHelp }) => {
  return (
    <div className="relative w-full min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Fondo de ADN 3D interactivo a gran escala */}
      <div className="absolute inset-0 z-0 opacity-65">
        <InteractiveDnaCanvas
          interactive={true}
          speedMultiplier={0.8}
          className="w-full h-full min-h-[100%]"
        />
      </div>

      {/* Degradado radial para asegurar legibilidad */}
      <div className="absolute inset-0 z-10 bg-radial from-[#050811]/40 via-[#050811]/75 to-[#050811] pointer-events-none" />

      {/* Tarjeta de impacto central */}
      <div className="relative z-20 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Kicker tipográfico limpio */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4 backdrop-blur-md">
          <Dna className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIMULADOR MOLECULAR INTERACTIVO</span>
        </div>

        {/* Título principal solicitado */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-2 uppercase drop-shadow-2xl">
          CRISPR
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 mb-4 tracking-wide uppercase drop-shadow">
          DEL ADN A LA EDICIÓN
        </h2>

        {/* Subtítulo y Frase secundaria solicitadas */}
        <p className="text-base sm:text-lg text-slate-200 font-medium max-w-xl mb-1 text-balance drop-shadow">
          Una experiencia visual sobre la edición genética
        </p>
        <p className="text-xs sm:text-sm font-mono text-cyan-300/80 mb-8 tracking-wide">
          Del ADN al cambio genético, paso a paso.
        </p>

        {/* Botones solicitados */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playScan();
              onStart();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.03] cursor-pointer"
          >
            <span>COMENZAR EXPERIENCIA</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 backdrop-blur-md transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>¿CÓMO FUNCIONA?</span>
          </button>
        </div>

        {/* Indicador de rigor y propósito */}
        <div className="mt-12 text-[11px] font-mono text-slate-400/80 max-w-md">
          Diseñado para complementar el aprendizaje conceptual: visualiza el mecanismo físico y molecular de CRISPR-Cas9 con rigor científico.
        </div>
      </div>
    </div>
  );
};
