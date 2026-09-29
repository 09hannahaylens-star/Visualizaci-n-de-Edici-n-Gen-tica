import React, { useState } from 'react';
import { SCENES, SceneId } from '../types/crispr';
import { HeroScene } from '../scenes/HeroScene';
import { ConclusionScene } from '../scenes/ConclusionScene';
import { CellZoomCanvas } from '../components/Visualizations/CellZoomCanvas';
import { InteractiveDnaCanvas } from '../components/Visualizations/InteractiveDnaCanvas';
import { TargetRegionViewer } from '../components/Visualizations/TargetRegionViewer';
import { GuideRnaViewer } from '../components/Visualizations/GuideRnaViewer';
import { Cas9AssemblyViewer } from '../components/Visualizations/Cas9AssemblyViewer';
import { RecognitionViewer } from '../components/Visualizations/RecognitionViewer';
import { CleavageViewer } from '../components/Visualizations/CleavageViewer';
import { RepairSimulator } from '../components/Visualizations/RepairSimulator';
import { OffTargetScanner } from '../components/Visualizations/OffTargetScanner';
import { CellularEffectViewer } from '../components/Visualizations/CellularEffectViewer';
import { MedicalCasgevyViewer } from '../components/Visualizations/MedicalCasgevyViewer';
import { SomaticGermlineViewer } from '../components/Visualizations/SomaticGermlineViewer';
import { sound } from '../audio/soundEffects';
import { ArrowRight, Compass, RotateCcw } from 'lucide-react';

interface SceneContainerProps {
  currentSceneId: SceneId;
  onNavigate: (id: SceneId) => void;
  onOpenHelp: () => void;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  currentSceneId,
  onNavigate,
  onOpenHelp,
}) => {
  const currentScene = SCENES.find((s) => s.id === currentSceneId) || SCENES[0];
  const [dnaExploreMode, setDnaExploreMode] = useState<boolean>(false);

  // Navegar a la siguiente escena
  const handleGoNext = () => {
    sound.playClick();
    const curIdx = SCENES.findIndex((s) => s.id === currentSceneId);
    if (curIdx < SCENES.length - 1) {
      onNavigate(SCENES[curIdx + 1].id);
    }
  };

  return (
    <main className="w-full flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-center">
      {/* Portada Hero */}
      {currentSceneId === 'hero' && (
        <HeroScene
          onStart={() => onNavigate('organism_to_dna')}
          onOpenHelp={onOpenHelp}
        />
      )}

      {/* Escena Final Reflexiva */}
      {currentSceneId === 'limits' && (
        <ConclusionScene
          onRestart={() => onNavigate('hero')}
          onExploreFree={() => onNavigate('organism_to_dna')}
        />
      )}

      {/* Escenas interactivas 01 a 11 */}
      {currentSceneId !== 'hero' && currentSceneId !== 'limits' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Cabecera de la escena activa */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-cyan-400 font-bold tracking-wider">
                  ESCENA {currentScene.numberStr}
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs font-mono text-slate-400">
                  {currentScene.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentScene.fullTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentScene.tagline}
              </p>
            </div>
          </div>

          {/* ESCENA 1: Del Organismo al ADN */}
          {currentSceneId === 'organism_to_dna' && (
            <div className="flex flex-col gap-4">
              {!dnaExploreMode ? (
                <div>
                  <CellZoomCanvas
                    onReachDna={() => setDnaExploreMode(true)}
                    className="w-full min-h-[480px]"
                  />
                  <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                    <span>
                      La cámara realiza un viaje continuo desde la escala humana (1.7 m) hasta la molécula de ADN (2 nm).
                    </span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setDnaExploreMode(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explorar ADN en 3D</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-cyan-300">EL ADN</h3>
                      <p className="text-xs text-slate-300">
                        El ADN contiene la información genética de las células.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setDnaExploreMode(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ver viaje celular</span>
                    </button>
                  </div>

                  <div className="h-[460px]">
                    <InteractiveDnaCanvas interactive={true} />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleGoNext}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                    >
                      <span>ENCONTRAR REGIÓN OBJETIVO</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ESCENA 2: Región Objetivo */}
          {currentSceneId === 'target_region' && (
            <div className="flex flex-col gap-4">
              <div className="h-[280px]">
                <InteractiveDnaCanvas
                  interactive={true}
                  highlightTarget={true}
                  targetStartIndex={12}
                  targetLength={10}
                  highlightPam={true}
                />
              </div>
              <TargetRegionViewer onNext={handleGoNext} />
            </div>
          )}

          {/* ESCENA 3: Llega el ARN Guía */}
          {currentSceneId === 'guide_rna' && (
            <GuideRnaViewer onNext={handleGoNext} />
          )}

          {/* ESCENA 4: Aparece Cas9 */}
          {currentSceneId === 'cas9_assembly' && (
            <Cas9AssemblyViewer onNext={handleGoNext} />
          )}

          {/* ESCENA 5: Reconocimiento */}
          {currentSceneId === 'recognition' && (
            <RecognitionViewer onNext={handleGoNext} />
          )}

          {/* ESCENA 6: El Corte (Cleavage) */}
          {currentSceneId === 'cleavage' && (
            <CleavageViewer onNext={handleGoNext} />
          )}

          {/* ESCENA 7: Reparación Celular (NHEJ vs HDR) */}
          {currentSceneId === 'repair' && (
            <RepairSimulator onNext={handleGoNext} />
          )}

          {/* ESCENA 8: Fidelidad & Off-target */}
          {currentSceneId === 'off_target' && (
            <OffTargetScanner onNext={handleGoNext} />
          )}

          {/* ESCENA 9: Del ADN a la Célula */}
          {currentSceneId === 'cellular_effect' && (
            <CellularEffectViewer onNext={handleGoNext} />
          )}

          {/* ESCENA 10: Medicina & Caso Casgevy */}
          {currentSceneId === 'medical_casgevy' && (
            <MedicalCasgevyViewer onNext={handleGoNext} />
          )}

          {/* ESCENA 11: Somática vs Germinal */}
          {currentSceneId === 'somatic_germline' && (
            <SomaticGermlineViewer onNext={handleGoNext} />
          )}
        </div>
      )}
    </main>
  );
};
