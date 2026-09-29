import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { SCENES, SceneId } from '../../types/crispr';
import { sound } from '../../audio/soundEffects';

interface SceneStepperProps {
  currentSceneId: SceneId;
  onSelectScene: (id: SceneId) => void;
  onResetScene: () => void;
}

export const SceneStepper: React.FC<SceneStepperProps> = ({
  currentSceneId,
  onSelectScene,
  onResetScene,
}) => {
  const currentIndex = SCENES.findIndex((s) => s.id === currentSceneId);
  const currentScene = SCENES[currentIndex] || SCENES[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      sound.playClick();
      onSelectScene(SCENES[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < SCENES.length - 1) {
      sound.playClick();
      onSelectScene(SCENES[currentIndex + 1].id);
    }
  };

  return (
    <div className="w-full bg-[#050811]/95 border-t border-slate-800/80 px-3 sm:px-6 py-2.5 backdrop-blur-md sticky bottom-0 z-30 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Controles de avance rápido y repetición */}
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            title="Escena anterior"
            aria-label="Escena anterior"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onResetScene();
            }}
            title="Reiniciar escena actual"
            aria-label="Reiniciar escena actual"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === SCENES.length - 1}
            title="Siguiente escena"
            aria-label="Siguiente escena"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Información de la escena activa */}
          <div className="flex items-center gap-1.5 ml-2 text-xs">
            <span className="font-mono text-cyan-400 font-bold">
              {currentScene.numberStr}
            </span>
            <span className="text-slate-500">/</span>
            <span className="font-mono text-slate-400">12</span>
            <span className="hidden md:inline text-slate-300 font-medium ml-1 truncate max-w-[200px]">
              {currentScene.shortTitle}
            </span>
          </div>
        </div>

        {/* Barra de puntos / segmentos de progreso discretos */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1 order-1 sm:order-2">
          {SCENES.map((s, idx) => {
            const isCurrent = s.id === currentSceneId;
            const isPast = idx < currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  sound.playClick();
                  onSelectScene(s.id);
                }}
                title={`${s.numberStr}. ${s.fullTitle}`}
                aria-label={`Ir a escena ${s.numberStr}: ${s.shortTitle}`}
                className={`group relative flex items-center justify-center p-1 rounded transition-all cursor-pointer ${
                  isCurrent ? 'scale-110' : ''
                }`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? 'w-7 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : isPast
                      ? 'w-3.5 bg-cyan-700/60 group-hover:bg-cyan-500'
                      : 'w-2 bg-slate-800 group-hover:bg-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
