import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-14 sm:bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-amber-500/90 text-slate-950 font-semibold px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm border border-amber-400"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo sin conexión — Recursos en caché activos</span>
    </div>
  );
};
