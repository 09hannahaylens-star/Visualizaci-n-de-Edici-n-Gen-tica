/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SceneId, SCENES } from './types/crispr';
import { TopHeader } from './components/Navigation/TopHeader';
import { SceneStepper } from './components/Navigation/SceneStepper';
import { HelpModal } from './components/Navigation/HelpModal';
import { SceneContainer } from './scenes/SceneContainer';
import { sound } from './audio/soundEffects';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';

export default function App() {
  const [currentSceneId, setCurrentSceneId] = useState<SceneId>('hero');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isFreeExplore, setIsFreeExplore] = useState<boolean>(false);

  // Manejo de sonido
  const handleToggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Navegación entre escenas
  const handleSelectScene = useCallback((id: SceneId) => {
    setCurrentSceneId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reiniciar escena activa
  const handleResetScene = () => {
    // Re-triggering de la escena actual
    const current = currentSceneId;
    setCurrentSceneId('hero');
    setTimeout(() => {
      setCurrentSceneId(current);
    }, 50);
  };

  // Atajos de teclado para accesibilidad y navegación fluida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        setIsHelpOpen(false);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (e.key === 'ArrowRight') {
        const curIdx = SCENES.findIndex((s) => s.id === currentSceneId);
        if (curIdx < SCENES.length - 1) {
          sound.playClick();
          handleSelectScene(SCENES[curIdx + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        const curIdx = SCENES.findIndex((s) => s.id === currentSceneId);
        if (curIdx > 0) {
          sound.playClick();
          handleSelectScene(SCENES[curIdx - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneId, handleSelectScene]);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Barra superior según el Top Bar Contract */}
      <TopHeader
        currentSceneId={currentSceneId}
        onSelectScene={handleSelectScene}
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isFreeExplore={isFreeExplore}
        onToggleFreeExplore={() => setIsFreeExplore(!isFreeExplore)}
      />

      {/* Contenedor escénico principal */}
      <SceneContainer
        currentSceneId={currentSceneId}
        onNavigate={handleSelectScene}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Barra de progreso y navegación inferior */}
      <SceneStepper
        currentSceneId={currentSceneId}
        onSelectScene={handleSelectScene}
        onResetScene={handleResetScene}
      />

      {/* Modal explicativo */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Indicador de modo sin conexión */}
      <OfflineIndicator />

      {/* Marca de autoría discreta, elegante y legible */}
      <div
        className="fixed bottom-14 sm:bottom-12 right-3 sm:right-6 pointer-events-none z-30 select-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-md"
        aria-label="Autoría: Hannah Aylen Sanchez Godoy"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
        <span className="text-[10px] sm:text-xs font-mono tracking-wider font-medium text-slate-200/85">
          <span className="hidden sm:inline">Hannah Aylen Sanchez Godoy</span>
          <span className="sm:hidden">Hannah Sanchez</span>
        </span>
      </div>
    </div>
  );
}
