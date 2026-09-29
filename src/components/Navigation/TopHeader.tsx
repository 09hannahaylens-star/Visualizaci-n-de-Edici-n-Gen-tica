import React from 'react';
import { Volume2, VolumeX, HelpCircle, Compass, ListOrdered } from 'lucide-react';
import { sound } from '../../audio/soundEffects';
import { SCENES, SceneId } from '../../types/crispr';
import { PWAInstallButton } from '../PWA/PWAInstallButton';

interface TopHeaderProps {
  currentSceneId: SceneId;
  onSelectScene: (id: SceneId) => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isFreeExplore: boolean;
  onToggleFreeExplore: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentSceneId,
  onSelectScene,
  onOpenHelp,
  isMuted,
  onToggleSound,
  isFreeExplore,
  onToggleFreeExplore,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#050811]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectScene('hero');
          }}
          className="text-left group cursor-pointer"
        >
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">
            CRISPR: Del ADN a la Edición
          </span>
        </button>

        {/* Zone 2: Navigation Links (Discrete chapter jump dropdown or links) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              onSelectScene('organism_to_dna');
            }}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white transition-colors ${
              currentSceneId === 'organism_to_dna' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : ''
            }`}
          >
            Escala
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectScene('target_region');
            }}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white transition-colors ${
              currentSceneId === 'target_region' || currentSceneId === 'guide_rna' || currentSceneId === 'cas9_assembly'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : ''
            }`}
          >
            Complejo
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectScene('cleavage');
            }}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white transition-colors ${
              currentSceneId === 'recognition' || currentSceneId === 'cleavage'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : ''
            }`}
          >
            El Corte
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectScene('repair');
            }}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white transition-colors ${
              currentSceneId === 'repair' || currentSceneId === 'off_target'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : ''
            }`}
          >
            Reparación
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectScene('medical_casgevy');
            }}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white transition-colors ${
              currentSceneId === 'cellular_effect' || currentSceneId === 'medical_casgevy' || currentSceneId === 'somatic_germline'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : ''
            }`}
          >
            Medicina
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectScene('limits');
            }}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white transition-colors ${
              currentSceneId === 'limits' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : ''
            }`}
          >
            Límites
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Botón de instalación PWA (cuando está disponible / iOS) */}
          <PWAInstallButton />

          {/* Selector de modo */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleFreeExplore();
            }}
            title={isFreeExplore ? 'Cambiar a modo guiado' : 'Cambiar a exploración libre'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isFreeExplore
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {isFreeExplore ? <Compass className="w-3.5 h-3.5 text-cyan-400" /> : <ListOrdered className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFreeExplore ? 'Modo Libre' : 'Modo Guiado'}</span>
          </button>

          {/* Toggle de sonido ambiental */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            title={isMuted ? 'Activar sonido ambiental de laboratorio' : 'Silenciar audio'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              !isMuted
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse text-cyan-400" />}
          </button>

          {/* Ayuda "¿Cómo funciona?" */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            title="¿Cómo funciona esta experiencia?"
            aria-label="Ayuda e información de la experiencia"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
