import React, { useState } from 'react';
import { AlertTriangle, Search, CheckCircle2, XCircle, ArrowRight, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface OffTargetScannerProps {
  onNext?: () => void;
}

interface LocusCandidate {
  id: string;
  name: string;
  badge: string;
  chromosome: string;
  positionMb: number;
  sequence: string[];
  mismatches: number[];
  pam: string;
  type: 'on_target' | 'off_target_risk' | 'off_target_rejected';
  riskScore: string;
  explanation: string;
}

export const OffTargetScanner: React.FC<OffTargetScannerProps> = ({ onNext }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedLocusId, setSelectedLocusId] = useState<string>('locus_1');

  // Secuencia diana programada en el ARN guía
  const gRnaSequence = ['A', 'C', 'G', 'U', 'G', 'C', 'C', 'A', 'U', 'G', 'A', 'C', 'U', 'A', 'G', 'C', 'A', 'A', 'G', 'U'];

  const loci: LocusCandidate[] = [
    {
      id: 'locus_1',
      name: 'Región Objetivo (On-Target)',
      badge: '🎯 Locus Diana',
      chromosome: 'Cromosoma 11 · Locus HBB',
      positionMb: 5.2,
      sequence: ['A', 'C', 'G', 'T', 'G', 'C', 'C', 'A', 'T', 'G', 'A', 'C', 'T', 'A', 'G', 'C', 'A', 'A', 'G', 'T'],
      mismatches: [],
      pam: 'CGG (PAM intacto)',
      type: 'on_target',
      riskScore: '100% afinidad diana',
      explanation: 'Emparejamiento perfecto de los 20 nucleótidos con el motivo PAM adyacente. Corte deseado y altamente eficiente.',
    },
    {
      id: 'locus_2',
      name: 'Posible Región No Deseada (Off-Target)',
      badge: '⚠️ Posible Off-Target',
      chromosome: 'Cromosoma 4 · Locus homólogo',
      positionMb: 84.7,
      sequence: ['A', 'C', 'G', 'T', 'A', 'C', 'C', 'A', 'T', 'G', 'A', 'C', 'T', 'A', 'G', 'C', 'A', 'A', 'G', 'T'],
      mismatches: [4], // 1 error en extremo 5' distal
      pam: 'TGG (PAM intacto)',
      type: 'off_target_risk',
      riskScore: 'Riesgo Potencial de Corte',
      explanation: 'Presenta 19 de 20 nucleótidos idénticos en otra región del genoma. Al estar el error lejos de la región semilla, existe riesgo de escisión inadvertida.',
    },
    {
      id: 'locus_3',
      name: 'Región Descartada por Cas9',
      badge: '🛡️ No Cortado',
      chromosome: 'Cromosoma 7 · Región intergénica',
      positionMb: 112.3,
      sequence: ['A', 'C', 'G', 'T', 'G', 'C', 'C', 'A', 'T', 'G', 'A', 'C', 'T', 'C', 'G', 'T', 'A', 'A', 'G', 'T'],
      mismatches: [13, 15], // 2 errores en región semilla proximal
      pam: 'AGG (PAM)',
      type: 'off_target_rejected',
      riskScore: 'Corte Rechazado',
      explanation: 'Las discrepancias caen en la región semilla contigua a PAM. Cas9 es incapaz de completar el bucle R y se disocia sin escindir.',
    },
  ];

  const currentLocus = loci.find((l) => l.id === selectedLocusId) || loci[0];

  const handleScanAndPan = () => {
    sound.playScan();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Desplazar cámara hacia la región no deseada
      setSelectedLocusId('locus_2');
    }, 700);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor principal de análisis de fidelidad y desplazamiento de cámara */}
      <div className="p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Especificidad y Fidelidad Genómica
            </span>
            <h3 className="text-base font-bold text-white">
              El Desafío de los Sitios Off-Target (Efectos No Deseados)
            </h3>
          </div>

          <button
            onClick={handleScanAndPan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Desplazando cámara por el genoma...' : 'BUSCAR POSIBLE OFF-TARGET'}</span>
          </button>
        </div>

        {/* Simulador de desplazamiento de cámara genómica a lo largo del cromosoma */}
        <div className="p-3.5 rounded-xl bg-[#090d1c] border border-slate-800 mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              Posición cromosómica de la cámara:
            </span>
            <span className="text-cyan-300 font-bold">
              {currentLocus.chromosome} ({currentLocus.positionMb} Mb)
            </span>
          </div>

          {/* Barra de progreso genómico que se desplaza */}
          <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 transition-all duration-700 rounded-full"
              style={{
                width: `${Math.max(10, Math.min(100, (currentLocus.positionMb / 120) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Selector de loci cromosómicos analizados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
          {loci.map((loc) => {
            const isSelected = loc.id === selectedLocusId;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedLocusId(loc.id);
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? loc.type === 'on_target'
                      ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/40'
                      : loc.type === 'off_target_risk'
                      ? 'bg-amber-950/40 border-amber-500/70 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-emerald-950/40 border-emerald-500/70 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white truncate">{loc.badge}</span>
                  {loc.type === 'on_target' && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  {loc.type === 'off_target_risk' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                  {loc.type === 'off_target_rejected' && <XCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <div className="text-[11px] font-mono text-slate-400">{loc.chromosome}</div>
              </button>
            );
          })}
        </div>

        {/* Inspección comparativa nucleótido por nucleótido */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-xs font-semibold text-white">
                Alineamiento: ARN Guía vs {currentLocus.badge}
              </span>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                PAM adyacente: <span className="text-amber-300 font-bold">{currentLocus.pam}</span> · Afinidad estimada:{' '}
                <span
                  className={`font-bold ${
                    currentLocus.type === 'on_target'
                      ? 'text-cyan-400'
                      : currentLocus.type === 'off_target_risk'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {currentLocus.riskScore}
                </span>
              </div>
            </div>
          </div>

          {/* Banda comparativa de bases */}
          <div className="overflow-x-auto py-1">
            <div className="min-w-[680px] flex flex-col gap-1.5 font-mono select-none">
              {/* ARN Guía */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-cyan-400 font-bold w-20 shrink-0">
                  ARN Guía:
                </span>
                <div className="flex items-center gap-1">
                  {gRnaSequence.map((nt, idx) => (
                    <div
                      key={`grna-align-${idx}`}
                      className="w-7 h-8 rounded bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-300 font-semibold"
                    >
                      {nt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores de apareamiento */}
              <div className="flex items-center gap-1">
                <span className="w-20 shrink-0" />
                <div className="flex items-center gap-1">
                  {currentLocus.sequence.map((_, idx) => {
                    const isMismatch = currentLocus.mismatches.includes(idx);
                    return (
                      <div key={`match-col-${idx}`} className="w-7 flex justify-center py-0.5 text-xs">
                        {isMismatch ? (
                          <span className="text-rose-400 font-bold">✕</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">|</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADN Genómico en el locus */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-bold w-20 shrink-0">
                  Genoma:
                </span>
                <div className="flex items-center gap-1">
                  {currentLocus.sequence.map((nt, idx) => {
                    const isMismatch = currentLocus.mismatches.includes(idx);
                    return (
                      <div
                        key={`genome-align-${idx}`}
                        className={`w-7 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${
                          isMismatch
                            ? 'bg-rose-950/70 border-2 border-rose-500 text-rose-300 animate-pulse'
                            : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                        }`}
                      >
                        {nt}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {currentLocus.explanation}
          </div>

          {/* Frase clave solicitada por el usuario */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">
              La precisión y la seguridad son desafíos fundamentales de la edición genética.
            </span>
          </div>
        </div>
      </div>

      {/* Navegación al paso de Efecto Celular */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-400">
          Un cambio molecular en el ADN debe trasladarse a toda la célula. Analicemos cómo ocurre esta ampliación de escala.
        </div>

        <button
          onClick={() => {
            sound.playClick();
            if (onNext) onNext();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>DEL ADN A LA CÉLULA COMPLETA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
