import React from 'react';
import { X, Dna, Eye, ShieldCheck, Keyboard, Sparkles } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#090e1c] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              ¿Cómo funciona esta experiencia?
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana de ayuda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido explicativo */}
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white mb-0.5">Propósito: Ver la edición genética</strong>
              Esta aplicación está diseñada para visualizar de forma interactiva y cinematográfica el mecanismo conceptual de CRISPR-Cas9, desde la escala del organismo completo hasta la separación de hebras a nivel nanométrico.
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Controles de Interacción
            </h4>
            <ul className="space-y-1.5 text-slate-300 ml-4 list-disc">
              <li><strong>Modelos 3D interactivos:</strong> Arrastra con el ratón o dedo para rotar la doble hélice en 3D. Usa la rueda o los botones de lupa para acercar/alejar. Haz clic en un par de bases para inspeccionar su estructura química.</li>
              <li><strong>Barra de navegación inferior:</strong> Puedes avanzar, retroceder, repetir el corte en cualquier momento o saltar directamente a cualquier escena.</li>
              <li><strong>Sonido ambiental:</strong> Totalmente opcional y no invasivo. Puedes activarlo o silenciarlo con el botón de altavoz en la barra superior.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              Atajos de Teclado
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">← / →</span>
                <span className="text-slate-200">Escena anterior / siguiente</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Espacio</span>
                <span className="text-slate-200">Pausar / Reanudar</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">M</span>
                <span className="text-slate-200">Activar / Silenciar audio</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Esc</span>
                <span className="text-slate-200">Cerrar modales</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-300 mb-0.5">Rigor y Seguridad Científica</strong>
              Esta aplicación es una simulación visual con fines exclusivamente educativos. No contiene instrucciones, concentraciones ni protocolos experimentales de laboratorio.
            </div>
          </div>
        </div>

        {/* Pie de acción */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Entendido, volver a la experiencia
          </button>
        </div>
      </div>
    </div>
  );
};
