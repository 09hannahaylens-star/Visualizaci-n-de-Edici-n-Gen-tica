import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles, Target } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface InteractiveDnaCanvasProps {
  highlightTarget?: boolean;
  targetStartIndex?: number;
  targetLength?: number;
  highlightPam?: boolean;
  cutSiteIndex?: number;
  isCut?: boolean;
  separationDistance?: number;
  interactive?: boolean;
  className?: string;
  speedMultiplier?: number;
  onTargetSelect?: () => void;
  showTargetButton?: boolean;
}

interface DnaNode3D {
  base1: 'A' | 'T' | 'C' | 'G';
  base2: 'T' | 'A' | 'G' | 'C';
  index: number;
  y: number;
  angle: number;
}

export const InteractiveDnaCanvas: React.FC<InteractiveDnaCanvasProps> = ({
  highlightTarget = false,
  targetStartIndex = 12,
  targetLength = 10,
  highlightPam = false,
  cutSiteIndex,
  isCut = false,
  separationDistance = 0,
  interactive = true,
  className = 'w-full h-full min-h-[420px]',
  speedMultiplier = 1.0,
  onTargetSelect,
  showTargetButton = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados de rotación y zoom 3D
  const [rotX, setRotX] = useState<number>(0.25);
  const [rotY, setRotY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.15);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedBase, setSelectedBase] = useState<{
    index: number;
    base1: string;
    base2: string;
    bonds: number;
    isTarget: boolean;
    isPam: boolean;
  } | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotYRef = useRef<number>(rotY);
  const rotXRef = useRef<number>(rotX);
  const zoomRef = useRef<number>(zoom);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    rotYRef.current = rotY;
  }, [rotY]);
  useEffect(() => {
    rotXRef.current = rotX;
  }, [rotX]);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Generación fija de pares de bases para realismo biológico
  const sequenceRef = useRef<DnaNode3D[]>([]);
  if (sequenceRef.current.length === 0) {
    const bases1: ('A' | 'T' | 'C' | 'G')[] = [
      'A', 'T', 'G', 'C', 'C', 'A', 'T', 'G', 'A', 'C',
      'T', 'A', 'G', 'C', 'A', 'A', 'G', 'T', 'C', 'G',
      'C', 'C', 'T', 'A', 'G', 'C', 'T', 'A', 'G', 'A',
      'G', 'G', 'C', 'T', 'A', 'T'
    ];
    const complement: Record<'A' | 'T' | 'C' | 'G', 'T' | 'A' | 'G' | 'C'> = {
      A: 'T',
      T: 'A',
      C: 'G',
      G: 'C',
    };

    const count = bases1.length;
    const spacing = 28;
    const startY = -((count * spacing) / 2);

    for (let i = 0; i < count; i++) {
      const b1 = bases1[i];
      sequenceRef.current.push({
        base1: b1,
        base2: complement[b1],
        index: i,
        y: startY + i * spacing,
        angle: i * 0.42, // ~10.5 pares de bases por vuelta helicoidal completa
      });
    }
  }

  // Interacción táctil y ratón con inercia
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !interactive) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    velocityRef.current = { x: deltaX * 0.007, y: deltaY * 0.007 };

    const newY = rotYRef.current + deltaX * 0.009;
    const newX = Math.max(-1.3, Math.min(1.3, rotXRef.current + deltaY * 0.009));

    rotYRef.current = newY;
    rotXRef.current = newX;
    setRotY(newY);
    setRotX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const newZoom = Math.max(0.65, Math.min(2.5, zoomRef.current - e.deltaY * 0.0016));
    zoomRef.current = newZoom;
    setZoom(newZoom);
  }, [interactive]);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Color de base con iluminación volumétrica por profundidad
  const getBaseColor = (base: 'A' | 'T' | 'C' | 'G', isTarget: boolean, isPam: boolean, depthAlpha: number) => {
    if (isPam) {
      return {
        fill: `rgba(245, 158, 11, ${depthAlpha})`,
        glow: 'rgba(245, 158, 11, 0.9)',
        core: '#fef3c7'
      };
    }
    if (isTarget) {
      return {
        fill: `rgba(34, 211, 238, ${depthAlpha})`,
        glow: 'rgba(34, 211, 238, 0.95)',
        core: '#e0f2fe'
      };
    }
    switch (base) {
      case 'A':
        return { fill: `rgba(59, 130, 246, ${depthAlpha})`, glow: 'rgba(59, 130, 246, 0.7)', core: '#dbeafe' };
      case 'T':
        return { fill: `rgba(99, 102, 241, ${depthAlpha})`, glow: 'rgba(99, 102, 241, 0.7)', core: '#e0e7ff' };
      case 'G':
        return { fill: `rgba(16, 185, 129, ${depthAlpha})`, glow: 'rgba(16, 185, 129, 0.7)', core: '#d1fae5' };
      case 'C':
        return { fill: `rgba(168, 85, 247, ${depthAlpha})`, glow: 'rgba(168, 85, 247, 0.7)', core: '#f3e8ff' };
    }
  };

  // Render loop continuo con simulación física y volumetría 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    // Partículas biológicas flotantes en el espacio nuclear
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * 900,
      y: Math.random() * 900,
      z: Math.random() * 400 - 200,
      radius: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.45 + 0.15,
      speed: Math.random() * 0.25 + 0.08,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Inercia o auto-rotación suave
      if (autoRotateRef.current && !isDraggingRef.current) {
        const delta = dt * 0.42 * speedMultiplier;
        rotYRef.current += delta;
        setRotY(rotYRef.current);
      } else if (!isDraggingRef.current && (Math.abs(velocityRef.current.x) > 0.0001 || Math.abs(velocityRef.current.y) > 0.0001)) {
        rotYRef.current += velocityRef.current.x;
        rotXRef.current = Math.max(-1.3, Math.min(1.3, rotXRef.current + velocityRef.current.y));
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        setRotY(rotYRef.current);
        setRotX(rotXRef.current);
      }

      // Dimensionamiento del Canvas
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Fondo oscuro con atmósfera nuclear azulada
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, '#091124');
      bgGrad.addColorStop(0.65, '#050914');
      bgGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Dibujar partículas biológicas
      particles.forEach((p) => {
        p.y -= p.speed * 40 * dt;
        p.phase += dt * 0.8;
        if (p.y < 0) p.y = height;
        const pulse = 0.8 + 0.2 * Math.sin(p.phase);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc((p.x / 900) * width, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      const centerX = width / 2;
      const centerY = height / 2;
      const radiusHelix = 72 * zoomRef.current;
      const rx = rotXRef.current;
      const ry = rotYRef.current;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);

      interface ProjectedNode {
        item: DnaNode3D;
        x1: number;
        y1: number;
        z1: number;
        x2: number;
        y2: number;
        z2: number;
        scale1: number;
        scale2: number;
        cx: number;
        cy: number;
        avgZ: number;
        isTarget: boolean;
        isPam: boolean;
      }

      const projected: ProjectedNode[] = [];

      sequenceRef.current.forEach((item) => {
        let separationOffset = 0;
        if (isCut && cutSiteIndex !== undefined) {
          if (item.index < cutSiteIndex) {
            separationOffset = -separationDistance;
          } else {
            separationOffset = separationDistance;
          }
        }

        const theta = item.angle;
        const base1_x0 = radiusHelix * Math.cos(theta);
        const base1_z0 = radiusHelix * Math.sin(theta);
        const base1_y0 = (item.y + separationOffset) * zoomRef.current;

        const base2_x0 = -base1_x0;
        const base2_z0 = -base1_z0;
        const base2_y0 = base1_y0;

        // Rotación Yaw (Y)
        const x1_r = base1_x0 * cosY - base1_z0 * sinY;
        const z1_r = base1_x0 * sinY + base1_z0 * cosY;
        const x2_r = base2_x0 * cosY - base2_z0 * sinY;
        const z2_r = base2_x0 * sinY + base2_z0 * cosY;

        // Rotación Pitch (X)
        const y1_f = base1_y0 * cosX - z1_r * sinX;
        const z1_f = base1_y0 * sinX + z1_r * cosX;
        const y2_f = base2_y0 * cosX - z2_r * sinX;
        const z2_f = base2_y0 * sinX + z2_r * cosX;

        // Proyección en perspectiva
        const fov = 800;
        const scale1 = fov / (fov + z1_f);
        const scale2 = fov / (fov + z2_f);

        const scrX1 = centerX + x1_r * scale1;
        const scrY1 = centerY + y1_f * scale1;
        const scrX2 = centerX + x2_r * scale2;
        const scrY2 = centerY + y2_f * scale2;

        const isTarget = highlightTarget && item.index >= targetStartIndex && item.index < targetStartIndex + targetLength;
        const isPam = highlightPam && (item.index === targetStartIndex + targetLength || item.index === targetStartIndex + targetLength + 1);

        projected.push({
          item,
          x1: scrX1,
          y1: scrY1,
          z1: z1_f,
          x2: scrX2,
          y2: scrY2,
          z2: z2_f,
          scale1,
          scale2,
          cx: (scrX1 + scrX2) / 2,
          cy: (scrY1 + scrY2) / 2,
          avgZ: (z1_f + z2_f) / 2,
          isTarget,
          isPam,
        });
      });

      // Ordenar por Z (Painter's algorithm para oclusión correcta)
      projected.sort((a, b) => a.avgZ - b.avgZ);

      // Resplandor difuso detrás del sitio diana cuando está activado
      if (highlightTarget) {
        const targetNodes = projected.filter((p) => p.isTarget);
        if (targetNodes.length > 0) {
          const avgTargetX = targetNodes.reduce((acc, n) => acc + n.cx, 0) / targetNodes.length;
          const avgTargetY = targetNodes.reduce((acc, n) => acc + n.cy, 0) / targetNodes.length;
          ctx.save();
          const haloGrad = ctx.createRadialGradient(avgTargetX, avgTargetY, 20, avgTargetX, avgTargetY, 130 * zoomRef.current);
          haloGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
          haloGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.08)');
          haloGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(avgTargetX, avgTargetY, 130 * zoomRef.current, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 1. Dibujar puentes de hidrógeno y peldaños de bases
      projected.forEach((p) => {
        const depthNorm = Math.max(0.18, Math.min(1.0, (p.avgZ + 190) / 380));
        let alpha = 0.35 + depthNorm * 0.65;

        // Si hay una región objetivo resaltada, atenuar sutilmente el resto del ADN
        if (highlightTarget && !p.isTarget && !p.isPam) {
          alpha *= 0.55;
        }

        // Línea del peldaño / enlace covalente
        ctx.beginPath();
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);

        if (p.isPam) {
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.95})`;
          ctx.lineWidth = 4 * zoomRef.current;
        } else if (p.isTarget) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.98})`;
          ctx.lineWidth = 3.8 * zoomRef.current;
        } else {
          ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.45})`;
          ctx.lineWidth = 2.2 * zoomRef.current;
        }
        ctx.stroke();

        // Si es sitio diana o PAM, agregar halo resplandeciente
        if (p.isTarget || p.isPam) {
          ctx.save();
          ctx.shadowBlur = p.isPam ? 14 : 16;
          ctx.shadowColor = p.isPam ? 'rgba(245, 158, 11, 0.85)' : 'rgba(34, 211, 238, 0.85)';
          ctx.strokeStyle = p.isPam ? 'rgba(245, 158, 11, 0.7)' : 'rgba(34, 211, 238, 0.7)';
          ctx.lineWidth = 2 * zoomRef.current;
          ctx.stroke();
          ctx.restore();
        }

        // Puentes de hidrógeno en el centro (2 para A-T, 3 para G-C)
        const bondCount = (p.item.base1 === 'A' || p.item.base1 === 'T') ? 2 : 3;
        for (let b = 1; b <= bondCount; b++) {
          const bondT = 0.38 + (b / (bondCount + 1)) * 0.24;
          const bx = p.x1 + (p.x2 - p.x1) * bondT;
          const by = p.y1 + (p.y2 - p.y1) * bondT;
          ctx.fillStyle = p.isTarget ? '#ffffff' : `rgba(255, 255, 255, ${alpha * 0.75})`;
          ctx.beginPath();
          ctx.arc(bx, by, 2 * zoomRef.current, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Esferas de los nucleótidos en ambos extremos con sombreado 3D
        const rSphere1 = 7.5 * zoomRef.current * (0.8 + depthNorm * 0.35);
        const rSphere2 = 7.5 * zoomRef.current * (0.8 + depthNorm * 0.35);

        const col1 = getBaseColor(p.item.base1, p.isTarget, p.isPam, alpha);
        const col2 = getBaseColor(p.item.base2, p.isTarget, p.isPam, alpha);

        // Extremo Hebra 1
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x1, p.y1, rSphere1, 0, Math.PI * 2);
        const sphereGrad1 = ctx.createRadialGradient(p.x1 - rSphere1 * 0.3, p.y1 - rSphere1 * 0.3, 1, p.x1, p.y1, rSphere1);
        sphereGrad1.addColorStop(0, col1.core);
        sphereGrad1.addColorStop(0.6, col1.fill);
        sphereGrad1.addColorStop(1, '#050914');
        ctx.fillStyle = sphereGrad1;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Extremo Hebra 2
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x2, p.y2, rSphere2, 0, Math.PI * 2);
        const sphereGrad2 = ctx.createRadialGradient(p.x2 - rSphere2 * 0.3, p.y2 - rSphere2 * 0.3, 1, p.x2, p.y2, rSphere2);
        sphereGrad2.addColorStop(0, col2.core);
        sphereGrad2.addColorStop(0.6, col2.fill);
        sphereGrad2.addColorStop(1, '#050914');
        ctx.fillStyle = sphereGrad2;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Letras de las bases en zoom adecuado
        if (zoomRef.current > 0.85) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(8, 9.5 * zoomRef.current)}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.item.base1, p.x1, p.y1);
          ctx.fillText(p.item.base2, p.x2, p.y2);
        }
      });

      // 3. Conectar hebras del esqueleto fosfodiéster
      const sortedByIndex = [...projected].sort((a, b) => a.item.index - b.item.index);
      for (let i = 0; i < sortedByIndex.length - 1; i++) {
        const cur = sortedByIndex[i];
        const next = sortedByIndex[i + 1];

        if (isCut && cutSiteIndex !== undefined && cur.item.index === cutSiteIndex - 1) {
          continue; // Ruptura física del esqueleto fosfodiéster
        }

        const avgDepth = (cur.avgZ + next.avgZ) / 2;
        const norm = Math.max(0.2, Math.min(1.0, (avgDepth + 190) / 380));
        let strandAlpha = 0.45 + norm * 0.55;
        if (highlightTarget && !cur.isTarget && !next.isTarget && !cur.isPam && !next.isPam) {
          strandAlpha *= 0.55;
        }

        // Hebra 1
        ctx.beginPath();
        ctx.moveTo(cur.x1, cur.y1);
        ctx.lineTo(next.x1, next.y1);
        ctx.strokeStyle = (cur.isTarget && next.isTarget)
          ? `rgba(6, 182, 212, ${strandAlpha * 0.98})`
          : `rgba(59, 130, 246, ${strandAlpha * 0.75})`;
        ctx.lineWidth = (cur.isTarget && next.isTarget ? 4 : 2.6) * zoomRef.current;
        ctx.stroke();

        // Hebra 2
        ctx.beginPath();
        ctx.moveTo(cur.x2, cur.y2);
        ctx.lineTo(next.x2, next.y2);
        ctx.strokeStyle = (cur.isTarget && next.isTarget)
          ? `rgba(6, 182, 212, ${strandAlpha * 0.98})`
          : `rgba(99, 102, 241, ${strandAlpha * 0.75})`;
        ctx.lineWidth = (cur.isTarget && next.isTarget ? 4 : 2.6) * zoomRef.current;
        ctx.stroke();
      }

      // Si hay un corte activo, dibujar el indicador de doble rotura (DSB)
      if (isCut && cutSiteIndex !== undefined) {
        const cutNode = sortedByIndex.find((n) => n.item.index === cutSiteIndex);
        if (cutNode) {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#f43f5e';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cutNode.cx - 55 * zoomRef.current, cutNode.cy);
          ctx.lineTo(cutNode.cx + 55 * zoomRef.current, cutNode.cy);
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    highlightTarget,
    targetStartIndex,
    targetLength,
    highlightPam,
    cutSiteIndex,
    isCut,
    separationDistance,
    speedMultiplier,
  ]);

  // Selección de base por clic interactivo
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvasRef.current!.width;
    const height = canvasRef.current!.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusHelix = 72 * zoom;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    let closestDist = 9999;
    let closestItem: DnaNode3D | null = null;

    for (const item of sequenceRef.current) {
      const theta = item.angle;
      const b1x = radiusHelix * Math.cos(theta);
      const b1z = radiusHelix * Math.sin(theta);
      const b1y = item.y * zoom;

      const xr = b1x * cosY - b1z * sinY;
      const zr = b1x * sinY + b1z * cosY;
      const yf = b1y * cosX - zr * sinX;

      const fov = 800;
      const scale = fov / (fov + (b1y * sinX + zr * cosX));
      const sx = centerX + xr * scale;
      const sy = centerY + yf * scale;

      const d = Math.hypot(sx - x, sy - y);
      if (d < closestDist) {
        closestDist = d;
        closestItem = item;
      }
    }

    if (closestItem !== null && closestDist < 40) {
      sound.playClick();
      const selected: DnaNode3D = closestItem;
      const target = highlightTarget && selected.index >= targetStartIndex && selected.index < targetStartIndex + targetLength;
      const pam = highlightPam && (selected.index === targetStartIndex + targetLength || selected.index === targetStartIndex + targetLength + 1);
      setSelectedBase({
        index: selected.index,
        base1: selected.base1,
        base2: selected.base2,
        bonds: (selected.base1 === 'A' || selected.base1 === 'T') ? 2 : 3,
        isTarget: target,
        isPam: pam,
      });
    } else {
      setSelectedBase(null);
    }
  };

  const resetView = () => {
    sound.playClick();
    setRotX(0.25);
    setRotY(0);
    setZoom(1.15);
    rotXRef.current = 0.25;
    rotYRef.current = 0;
    zoomRef.current = 1.15;
    velocityRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden bg-[#050914] border border-slate-800/80 select-none shadow-2xl ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCanvasClick}
      />

      {/* Controles de cámara 3D */}
      {interactive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl z-20">
          <button
            onClick={() => {
              sound.playClick();
              setAutoRotate(!autoRotate);
            }}
            title={autoRotate ? 'Pausar rotación continua' : 'Reanudar rotación continua'}
            className={`p-1.5 rounded text-xs font-medium transition-colors ${
              autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              const nz = Math.min(2.5, zoom + 0.2);
              setZoom(nz);
              zoomRef.current = nz;
            }}
            title="Acercar (Zoom In)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              const nz = Math.max(0.65, zoom - 0.2);
              setZoom(nz);
              zoomRef.current = nz;
            }}
            title="Alejar (Zoom Out)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Restablecer vista centrada"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors text-xs"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Botón interactivo de selección de región diana cuando se solicita */}
      {showTargetButton && onTargetSelect && (
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={() => {
              sound.playScan();
              onTargetSelect();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-semibold backdrop-blur-md hover:bg-cyan-500/30 transition-all shadow-lg shadow-cyan-500/20 animate-pulse"
          >
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Focalizar Región Diana</span>
          </button>
        </div>
      )}

      {/* Indicador de ayuda al usuario */}
      {interactive && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm rounded-md border border-slate-800/80 text-[11px] text-slate-400 pointer-events-none">
          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Arrastra para rotar · Rueda para zoom · Clic en nucleótido</span>
        </div>
      )}

      {/* Panel emergente de inspección molecular */}
      {selectedBase && (
        <div className="absolute top-12 left-3 p-3 bg-slate-900/95 backdrop-blur-md rounded-lg border border-cyan-500/40 shadow-2xl max-w-[240px] z-30 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-800 pb-1">
            <span className="text-xs font-semibold text-cyan-400">
              Par de Bases #{selectedBase.index + 1}
            </span>
            <button
              onClick={() => setSelectedBase(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-200 font-mono">
              <span>Hebra 5&apos;→3&apos;:</span>
              <span className="font-bold text-cyan-300">{selectedBase.base1}</span>
            </div>
            <div className="flex justify-between items-center text-slate-200 font-mono">
              <span>Hebra 3&apos;→5&apos;:</span>
              <span className="font-bold text-indigo-300">{selectedBase.base2}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Puentes de H:</span>
              <span className="font-mono text-slate-300">{selectedBase.bonds} enlaces</span>
            </div>
            {selectedBase.isTarget && (
              <div className="pt-1 text-[11px] text-cyan-400 font-medium border-t border-slate-800/80">
                ● Dentro de la región objetivo (20 nt)
              </div>
            )}
            {selectedBase.isPam && (
              <div className="pt-1 text-[11px] text-amber-400 font-medium border-t border-slate-800/80">
                ▲ Motivo PAM adyacente (NGG)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leyenda de bases */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-2.5 px-2.5 py-1 bg-slate-900/85 backdrop-blur-sm rounded-md border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-[0_0_6px_#3b82f6]" /> A
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block shadow-[0_0_6px_#6366f1]" /> T
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" /> G
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block shadow-[0_0_6px_#a855f7]" /> C
        </span>
      </div>
    </div>
  );
};
