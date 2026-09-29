import React, { useState } from 'react';
import { GitCommit, Sparkles, Check, ArrowRight, RefreshCw, SplitSquareVertical, Sliders } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface RepairSimulatorProps {
  onNext?: () => void;
}

export const RepairSimulator: React.FC<RepairSimulatorProps> = ({ onNext }) => {
  const [selectedPathway, setSelectedPathway] = useState<'NHEJ' | 'HDR'>('NHEJ');
  const [repairState, setRepairState] = useState<'broken' | 'repairing' | 'completed'>('broken');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 (100% Antes) -> 100 (100% Después)

  const handleTriggerRepair = () => {
    sound.playRepair();
    setRepairState('repairing');
    setTimeout(() => {
      setRepairState('completed');
    }, 800);
  };

  const handleReset = () => {
    sound.playClick();
    setRepairState('broken');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de vía de reparación */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Mecanismos Celulares Endógenos
            </span>
            <h3 className="text-base font-bold text-white">
              ¿Qué pasa después? Vías Biológicas de Reparación
            </h3>
          </div>

          {/* Segmented control para alternar de vía */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedPathway('NHEJ');
                setRepairState('broken');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedPathway === 'NHEJ'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vía NHEJ (Unión No Homóloga)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedPathway('HDR');
                setRepairState('broken');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedPathway === 'HDR'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vía HDR (Dirigida por Plantilla)
            </button>
          </div>
        </div>

        {/* Simulación visual de la vía seleccionada: ANTES / DURANTE / DESPUÉS */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedPathway === 'NHEJ' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
                {selectedPathway === 'NHEJ'
                  ? 'NHEJ · Unión Directa de Extremos (Non-Homologous End Joining)'
                  : 'HDR · Reparación Asistida por Plantilla Homóloga (Homology-Directed Repair)'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPathway === 'NHEJ'
                  ? 'Unión rápida y propensa a error. Genera pequeñas inserciones/deleciones (indels) que silencian el gen (Knockout).'
                  : 'Reparación de alta fidelidad. Utiliza una hebra donante para introducir una secuencia deseada (Knock-in).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-white rounded text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
              {repairState !== 'completed' && (
                <button
                  onClick={handleTriggerRepair}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md cursor-pointer animate-pulse ${
                    selectedPathway === 'NHEJ'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simular Reparación</span>
                </button>
              )}
            </div>
          </div>

          {/* Animación Visual Cinemática: Antes / Durante / Después */}
          <div className="p-4 rounded-xl bg-[#090d1c] border border-slate-800 flex flex-col gap-3">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Evolución Cinemática Molecular
            </span>

            {/* Fase 1: ADN Cortado (Antes) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-20 shrink-0 font-bold">1. ANTES:</span>
              <div className="flex-1 p-2 rounded bg-slate-950 font-mono text-xs flex items-center justify-center gap-1 border border-slate-800 select-none">
                <span className="text-cyan-400">A-T-G-G-C-C-A</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40">
                  ✂ CORTE (DSB)
                </span>
                <span className="text-cyan-400">T-C-C-A-A-G</span>
              </div>
            </div>

            {/* Fase 2: Mecanismo de Respuesta (Durante) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-20 shrink-0 font-bold">2. DURANTE:</span>
              <div className="flex-1 p-2 rounded bg-slate-950/80 font-mono text-xs flex items-center justify-center gap-2 border border-slate-800 text-slate-300">
                {selectedPathway === 'NHEJ' ? (
                  <div className="flex items-center gap-2 text-amber-300 animate-pulse">
                    <span>Extremos rotos se acercan sin plantilla</span>
                    <span className="text-slate-500">→</span>
                    <span>Reclutamiento de Ku70/Ku80 & Ligasa IV</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      Plantilla Donante Homóloga
                    </span>
                    <span className="text-slate-500">→</span>
                    <span>Invasión de hebra & Replicación guiada</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fase 3: Secuencia Final Reparada (Después) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-20 shrink-0 font-bold">3. DESPUÉS:</span>
              <div className="flex-1 p-2.5 rounded bg-slate-950 font-mono text-xs flex items-center justify-center gap-1 border border-slate-800">
                {repairState === 'completed' ? (
                  selectedPathway === 'NHEJ' ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-300">
                      <span className="text-cyan-400">A-T-G-G-C-C-A</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-bold border border-amber-500/60 shadow-sm">
                        +T (INDEL / DESFASE)
                      </span>
                      <span className="text-cyan-400">T-C-C-A-A-G</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-300">
                      <span className="text-cyan-400">A-T-G-G-C-C-A</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-400 shadow-sm">
                        G-T-A (CORRECCIÓN DIRIGIDA)
                      </span>
                      <span className="text-cyan-400">T-C-C-A-A-G</span>
                    </div>
                  )
                ) : (
                  <span className="text-slate-500 italic">
                    Presiona &quot;Simular Reparación&quot; para activar la vía celular...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* HERRAMIENTA INTERACTIVA: COMPARACIÓN VISUAL ANTES ← → DESPUÉS */}
          <div className="mt-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Comparativa Interactiva: ANTES ← → DESPUÉS
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Arrastra el control para contrastar la secuencia original vs editada
              </span>
            </div>

            {/* Slider visual de comparación */}
            <div className="relative w-full py-2">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                aria-label="Control deslizante para comparar estado antes y después"
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] font-mono mt-1">
                <span className={`font-semibold ${sliderPosition < 40 ? 'text-cyan-300' : 'text-slate-500'}`}>
                  ◄ 100% ADN ORIGINAL (ANTES)
                </span>
                <span className={`font-semibold ${sliderPosition > 60 ? 'text-emerald-300' : 'text-slate-500'}`}>
                  ADN EDITADO (DESPUÉS) ►
                </span>
              </div>
            </div>

            {/* Vista dividida de bases según la posición del slider */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-xs gap-2 select-none overflow-x-auto">
              {sliderPosition < 50 ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">ANTES:</span>
                  <span className="text-slate-300">5&apos;- A T G G C C A</span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    C T G
                  </span>
                  <span className="text-slate-300">T C C A A G -3&apos;</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">DESPUÉS:</span>
                  <span className="text-slate-300">5&apos;- A T G G C C A</span>
                  <span className="text-emerald-300 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {selectedPathway === 'NHEJ' ? '+T (INDEL MUTADO)' : 'G T A (EDITADO)'}
                  </span>
                  <span className="text-slate-300">T C C A A G -3&apos;</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación al paso de Off-target */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <GitCommit className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {repairState === 'completed'
              ? 'Has visto la reparación. Ahora evaluaremos la fidelidad genómica: ¿ocurren cortes no deseados?'
              : 'Simula la reparación para comparar visualmente los resultados de ambas vías.'}
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>EVALUAR EFECTOS OFF-TARGET</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
