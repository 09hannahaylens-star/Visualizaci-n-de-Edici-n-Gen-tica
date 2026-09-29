import React, { useState } from 'react';
import { ArrowRight, Sparkles, Scale, Users, Dna, Shield } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface SomaticGermlineViewerProps {
  onNext?: () => void;
}

export const SomaticGermlineViewer: React.FC<SomaticGermlineViewerProps> = ({ onNext }) => {
  const [activeSide, setActiveSide] = useState<'somatic' | 'germline' | 'both'>('both');

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor dividido */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Alcance Biológico & Consideraciones
            </span>
            <h3 className="text-base font-bold text-white">
              Edición Somática vs Edición Germinal: Comparación Visual
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dos destinos biológicos completamente distintos para la edición del genoma.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => {
                sound.playClick();
                setActiveSide('both');
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeSide === 'both' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Comparativa Dual
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveSide('somatic');
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeSide === 'somatic' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solo Somática
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveSide('germline');
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeSide === 'germline' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Solo Germinal
            </button>
          </div>
        </div>

        {/* Pantalla dividida interactiva con dos recorridos visuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. RECORRIDO VISUAL SOMÁTICO */}
          {(activeSide === 'both' || activeSide === 'somatic') && (
            <div className="p-5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#22d3ee]" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Recorrido 1: Edición Somática
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                    No Heredable
                  </span>
                </div>

                {/* Ilustración SVG conceptual: Células del organismo tratado */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 260 110" className="w-56 h-auto select-none">
                    {/* Tejido celular somático diferenciado */}
                    <g fill="#0e7490" fillOpacity="0.25" stroke="#22d3ee" strokeWidth="1.8">
                      <polygon points="50,25 85,38 78,75 42,80 20,48" />
                      <polygon points="85,38 130,28 140,65 100,88 78,75" />
                      <polygon points="130,28 175,38 168,80 140,65" />
                      <polygon points="168,80 215,70 225,32 175,38" />
                    </g>
                    {/* Núcleos celulares con edición */}
                    <circle cx="55" cy="52" r="8" fill="#38bdf8" />
                    <circle cx="110" cy="50" r="8" fill="#38bdf8" />
                    <circle cx="155" cy="54" r="8" fill="#38bdf8" />
                    <circle cx="195" cy="50" r="8" fill="#38bdf8" />
                  </svg>
                  <span className="text-[11px] font-mono text-cyan-300 mt-1">
                    Células corporales diferenciadas (Sangre, Músculo, Hígado)
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    Las modificaciones se realizan en células del cuerpo del individuo tratado. El cambio molecular solo afecta al tejido u órgano seleccionado.
                  </p>
                  <p className="leading-relaxed text-slate-400">
                    Los cambios no se transmiten a los gametos (óvulos o espermatozoides). Por tanto, la modificación no pasará a los hijos ni a las siguientes generaciones.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Alcance:</span>
                <span className="text-emerald-400 font-semibold">Limitado al individuo tratado</span>
              </div>
            </div>
          )}

          {/* 2. RECORRIDO VISUAL GERMINAL */}
          {(activeSide === 'both' || activeSide === 'germline') && (
            <div className="p-5 rounded-xl bg-slate-950/90 border border-purple-500/30 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block shadow-[0_0_8px_#c084fc]" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Recorrido 2: Edición Germinal
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
                    Potencialmente Heredable
                  </span>
                </div>

                {/* Ilustración SVG conceptual: Gameto / Cigoto y Árbol Generacional */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 260 110" className="w-56 h-auto select-none">
                    {/* Cigoto en desarrollo temprano con zona pelúcida */}
                    <circle cx="70" cy="55" r="32" fill="#581c87" fillOpacity="0.3" stroke="#a855f7" strokeWidth="2" strokeDasharray="3,3" />
                    <circle cx="70" cy="55" r="22" fill="#6b21a8" fillOpacity="0.45" stroke="#c084fc" strokeWidth="2" />
                    <circle cx="64" cy="52" r="5" fill="#e9d5ff" />
                    <circle cx="76" cy="56" r="5" fill="#e9d5ff" />

                    {/* Flechas indicando transmisión a descendientes */}
                    <path d="M 115,55 L 145,55" stroke="#c084fc" strokeWidth="2" strokeDasharray="2,2" />
                    <path d="M 145,55 L 175,30" stroke="#c084fc" strokeWidth="1.8" />
                    <path d="M 145,55 L 175,80" stroke="#c084fc" strokeWidth="1.8" />

                    {/* Descendencia Generación 1 y Generación 2 */}
                    <circle cx="190" cy="30" r="10" fill="#7c3aed" stroke="#c084fc" strokeWidth="1.5" />
                    <circle cx="190" cy="80" r="10" fill="#7c3aed" stroke="#c084fc" strokeWidth="1.5" />
                    <circle cx="230" cy="30" r="7" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" />
                    <circle cx="230" cy="80" r="7" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" />
                  </svg>
                  <span className="text-[11px] font-mono text-purple-300 mt-1">
                    Gametos o cigoto temprano → Transmisión a la descendencia
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    Las modificaciones se introducen en células reproductoras (óvulos, espermatozoides) o embriones en etapas iniciales de división.
                  </p>
                  <p className="leading-relaxed text-slate-400">
                    La modificación se copia en todas las células del nuevo ser vivo y se transmitirá a su descendencia y a las generaciones sucesivas.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Alcance:</span>
                <span className="text-amber-400 font-semibold">Generaciones futuras y acervo génico</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navegación al paso final: Los Límites */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            La ciencia nos da la capacidad técnica de modificar el genoma. El reto social es definir hasta dónde utilizar esa posibilidad.
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>REFLEXIÓN FINAL: LOS LÍMITES</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
