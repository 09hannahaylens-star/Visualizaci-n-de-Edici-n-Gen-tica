import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { sound } from '../../audio/soundEffects';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Do not display if already running inside installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    sound.playClick();
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow when beforeinstallprompt has fired
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Instalar aplicación en tu dispositivo (PWA)"
        aria-label="Instalar aplicación"
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all cursor-pointer group"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
        <span className="hidden xs:inline">Instalar App</span>
        <span className="xs:hidden">Instalar</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playClick();
            setShowIOSGuide(true);
          }}
          title="Instalar en iPhone o iPad"
          aria-label="Instalar en iOS"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xs:inline">Instalar PWA</span>
          <span className="xs:hidden">Instalar</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instalar en iOS</h3>
                  <p className="text-xs text-slate-400">Safari en iPhone o iPad</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="p-1 rounded bg-slate-700 text-cyan-400 mt-0.5">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">1. Pulsa Compartir</span>
                    <p className="text-slate-400 mt-0.5">Toca el botón Compartir en la barra de Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="p-1 rounded bg-slate-700 text-cyan-400 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">2. Agregar a pantalla de inicio</span>
                    <p className="text-slate-400 mt-0.5">Desplázate hacia abajo y selecciona &quot;Agregar a inicio&quot;.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
