import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, ArrowRight, Dna, Info, Sparkles, CheckCircle2, RotateCw, ZoomIn, ZoomOut, RotateCcw, Target } from 'lucide-react';
import { sound } from '../../audio/soundEffects';

interface GuideRnaViewerProps {
  onNext?: () => void;
}

export const GuideRnaViewer: React.FC<GuideRnaViewerProps> = ({ onNext }) => {
  // Etapas de aproximación:
  // 1: Aproximación (ARN flota y desciende hacia el ADN)
  // 2: Posicionamiento (Alineación con la secuencia diana y PAM)
  // 3: Reconocimiento (Hibridación Watson-Crick, bucle R y destellos)
  const [approachStep, setApproachStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<'spacer' | 'scaffold'>('spacer');
  
  // Controles de cámara 3D con límites estrictos de zoom para evitar que el andamio se pierda
  const [rotY, setRotY] = useState<number>(0.1);
  const [rotX, setRotX] = useState<number>(0.12);
  const [zoom, setZoom] = useState<number>(1.0); // Rango restringido: 0.75 a 1.25
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotYRef = useRef<number>(rotY);
  const rotXRef = useRef<number>(rotX);
  const zoomRef = useRef<number>(zoom);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const approachStepRef = useRef<number>(approachStep);

  // Sincronizar referencias para el render loop
  useEffect(() => { rotYRef.current = rotY; }, [rotY]);
  useEffect(() => { rotXRef.current = rotX; }, [rotX]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);
  useEffect(() => { approachStepRef.current = approachStep; }, [approachStep]);

  // Secuencia real de los 20 nucleótidos del espaciador (5' -> 3')
  const spacerSequence = ['G', 'U', 'C', 'A', 'C', 'C', 'G', 'C', 'U', 'U', 'A', 'G', 'G', 'A', 'U', 'C', 'G', 'A', 'U', 'U'];
  // Complemento de ADN correspondiente para Watson-Crick (A-U, C-G, G-C, T-A)
  const dnaComplement: Record<string, string> = {
    G: 'C',
    U: 'A',
    C: 'G',
    A: 'T',
  };

  const advanceApproach = (stepNum?: number) => {
    sound.playScan();
    const nextStep = stepNum !== undefined ? stepNum : Math.min(3, approachStep + 1);
    setApproachStep(nextStep);
  };

  const resetCamera = () => {
    sound.playClick();
    setRotY(0.1);
    setRotX(0.12);
    setZoom(1.0);
    rotYRef.current = 0.1;
    rotXRef.current = 0.12;
    zoomRef.current = 1.0;
  };

  // Interacción táctil y ratón con rotación orbital 3D
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const newRotY = rotYRef.current + deltaX * 0.009;
    // Limitar el cabeceo vertical (pitch) para mantener la vista orientada y estable
    const newRotX = Math.max(-0.45, Math.min(0.45, rotXRef.current + deltaY * 0.008));

    rotYRef.current = newRotY;
    rotXRef.current = newRotX;
    setRotY(newRotY);
    setRotX(newRotX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    // Límites estrictos de zoom (0.75x a 1.25x) para asegurar que el andamio nunca quede fuera de pantalla
    const newZoom = Math.max(0.75, Math.min(1.25, zoomRef.current - e.deltaY * 0.0012));
    zoomRef.current = newZoom;
    setZoom(newZoom);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Render loop continuo con proyección 3D equilibrada
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let currentYPos = -55; // Posición Y vertical interpolada del ARN
    let currentTargetGap = 65; // Distancia hacia el ADN

    // Partículas moleculares en suspensión
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      radius: Math.random() * 1.5 + 0.8,
      speed: Math.random() * 0.2 + 0.08,
      alpha: Math.random() * 0.4 + 0.15,
      color: Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(192, 132, 252, 0.35)',
    }));

    const render = (currentTime: number) => {
      time = currentTime * 0.001;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      // Auto-rotación suave si no se arrastra
      if (autoRotateRef.current && !isDraggingRef.current) {
        rotYRef.current += 0.005;
        setRotY(rotYRef.current);
      }

      // Parámetros de animación según approachStep
      // 1: Flota a cierta distancia sobre el ADN
      // 2: Se posiciona y alinea exactamente frente a la diana
      // 3: Desciende para hibridación íntima (R-loop)
      const step = approachStepRef.current;
      const targetY = step === 1 ? -45 : step === 2 ? -22 : -12;
      const targetDnaY = step === 1 ? 65 : step === 2 ? 55 : 48;
      currentYPos += (targetY - currentYPos) * 0.08;
      currentTargetGap += (targetDnaY - currentTargetGap) * 0.08;

      // Fondo oscuro espacial/nuclear de alta profundidad
      const grad = ctx.createRadialGradient(cx, cy, 25, cx, cy, Math.max(w, h) * 0.75);
      grad.addColorStop(0, '#0a122c');
      grad.addColorStop(0.65, '#050917');
      grad.addColorStop(1, '#02040b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Partículas flotantes
      particles.forEach((p) => {
        p.y -= p.speed * 25 * 0.016;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc((p.x / 800) * w, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Transformaciones 3D de cámara
      const currentZoom = zoomRef.current;
      const rx = rotXRef.current;
      const ry = rotYRef.current;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const fov = 700;

      // Función de proyección 3D con perspectiva
      const project3D = (x: number, y: number, z: number) => {
        // Rotación Yaw (Y)
        const xRot = x * cosY - z * sinY;
        const zRot = x * sinY + z * cosY;
        // Rotación Pitch (X)
        const yRot = y * cosX - zRot * sinX;
        const zFinal = y * sinX + zRot * cosX;
        // Escala con FOV
        const scale = (fov / (fov + zFinal)) * currentZoom;
        return {
          px: cx + xRot * scale,
          py: cy + yRot * scale,
          z: zFinal,
          scale,
        };
      };

      // =================================================================
      // 1. ADN GENÓMICO (DOBLE HÉLICE OBJETIVO)
      // =================================================================
      const dnaBaseCount = 28;
      const dnaSpacing = 11.5;
      const dnaStartX = -((dnaBaseCount * dnaSpacing) / 2);
      const dnaY = currentTargetGap;

      // El ADN se desenrolla localmente en la región diana durante el reconocimiento (step 3)
      const dnaTargetStart = 4;
      const dnaTargetEnd = 23; // 20 nucleótidos diana
      const pamStart = 24; // Motivo PAM (NGG: CGG)

      const dnaStrand1: { px: number; py: number; z: number }[] = [];
      const dnaStrand2: { px: number; py: number; z: number }[] = [];
      const dnaBasesList: {
        x: number;
        y1: number;
        y2: number;
        isTarget: boolean;
        isPam: boolean;
        baseLetter: string;
      }[] = [];

      for (let i = 0; i < dnaBaseCount; i++) {
        const x = dnaStartX + i * dnaSpacing;
        const isTarget = i >= dnaTargetStart && i <= dnaTargetEnd;
        const isPam = i >= pamStart && i <= pamStart + 2;

        // Desenrollamiento / apertura del R-loop en la región diana
        let unwrap = 0;
        if (step === 3 && isTarget) {
          const tNorm = (i - dnaTargetStart) / (dnaTargetEnd - dnaTargetStart);
          unwrap = Math.sin(tNorm * Math.PI) * 16;
        }

        const angle = i * 0.42 + time * 0.6;
        const radius = 18;
        const y1 = dnaY - radius - unwrap;
        const y2 = dnaY + radius + unwrap * 0.4;
        const z = Math.sin(angle) * 12;

        const p1 = project3D(x, y1, z);
        const p2 = project3D(x, y2, -z);

        dnaStrand1.push(p1);
        dnaStrand2.push(p2);

        // Letra complementaria en la hebra diana
        let letter = 'A';
        if (isTarget) {
          const spacerIdx = i - dnaTargetStart;
          const rnaBase = spacerSequence[spacerIdx] || 'A';
          letter = dnaComplement[rnaBase] || 'T';
        } else if (isPam) {
          letter = i === pamStart ? 'C' : 'G';
        } else {
          letter = (i % 2 === 0) ? 'A' : 'T';
        }

        dnaBasesList.push({
          x,
          y1,
          y2,
          isTarget,
          isPam,
          baseLetter: letter,
        });

        // Peldaños de bases de ADN
        const isAligned = (step >= 2 && isTarget) || isPam;
        ctx.strokeStyle = isPam
          ? 'rgba(245, 158, 11, 0.9)'
          : isTarget && step === 3
          ? 'rgba(34, 211, 238, 0.95)'
          : isTarget && step === 2
          ? 'rgba(34, 211, 238, 0.7)'
          : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = isAligned ? 2.5 * p1.scale : 1.5 * p1.scale;

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        // Esferas de las bases
        ctx.fillStyle = isPam ? '#f59e0b' : isTarget ? '#06b6d4' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(p1.px, p1.py, 3.2 * p1.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isPam ? '#fbbf24' : isTarget ? '#38bdf8' : '#6366f1';
        ctx.beginPath();
        ctx.arc(p2.px, p2.py, 3.2 * p2.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar hebras fosfodiéster de ADN
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.7)';
      ctx.lineWidth = 2.2 * currentZoom;
      ctx.beginPath();
      ctx.moveTo(dnaStrand1[0].px, dnaStrand1[0].py);
      for (let i = 1; i < dnaStrand1.length; i++) {
        ctx.lineTo(dnaStrand1[i].px, dnaStrand1[i].py);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(79, 70, 229, 0.7)';
      ctx.lineWidth = 2.2 * currentZoom;
      ctx.beginPath();
      ctx.moveTo(dnaStrand2[0].px, dnaStrand2[0].py);
      for (let i = 1; i < dnaStrand2.length; i++) {
        ctx.lineTo(dnaStrand2[i].px, dnaStrand2[i].py);
      }
      ctx.stroke();

      // =================================================================
      // 2. ARN GUÍA 3D COMPLETO (ESPACIADOR + ANDAMIO DE HORQUILLAS)
      // =================================================================
      // Dimensiones milimétricas calculadas para caber 100% en la pantalla:
      // Espaciador: de x = -135 a x = -6 (129px, 20 nucleótidos)
      // Andamio: de x = -6 a x = +128 (134px, nexus + 3 horquillas)
      // Ancho total del ARN: 263px (ocupa aprox. 45% del ancho del canvas, nunca se corta)
      const rnaY = currentYPos;
      const tiltAngle = step === 2 ? -0.06 : step === 3 ? -0.03 : 0;

      // A) ESPACIADOR (20 NUCLEÓTIDOS DIANA)
      const spacerNodes: {
        letter: string;
        index: number;
        proj: { px: number; py: number; z: number; scale: number };
        modelX: number;
        modelY: number;
      }[] = [];

      const numSpacer = spacerSequence.length; // 20
      const spacerSpacing = 6.45; // 20 * 6.45 = 129px
      const spacerStartX = -135;

      for (let i = 0; i < numSpacer; i++) {
        const xRaw = spacerStartX + i * spacerSpacing;
        const wave = Math.sin(i * 0.38 + time * 1.5) * 5;
        const yRaw = rnaY + wave + (i * Math.sin(tiltAngle) * 12);
        const zRaw = Math.cos(i * 0.38 + time * 1.5) * 7;

        const proj = project3D(xRaw, yRaw, zRaw);
        spacerNodes.push({
          letter: spacerSequence[i],
          index: i,
          proj,
          modelX: xRaw,
          modelY: yRaw,
        });
      }

      // Dibujar hebra del espaciador
      ctx.save();
      const isSpacerSelected = selectedDomain === 'spacer';
      ctx.strokeStyle = isSpacerSelected ? '#22d3ee' : '#0284c7';
      ctx.lineWidth = (isSpacerSelected ? 4.5 : 3.2) * currentZoom;

      if (isSpacerSelected || step === 3) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#22d3ee';
      }

      ctx.beginPath();
      ctx.moveTo(spacerNodes[0].proj.px, spacerNodes[0].proj.py);
      for (let i = 1; i < numSpacer; i++) {
        ctx.lineTo(spacerNodes[i].proj.px, spacerNodes[i].proj.py);
      }
      ctx.stroke();
      ctx.restore();

      // Dibujar nucleótidos del espaciador con sombreado 3D
      spacerNodes.forEach((node, i) => {
        const p = node.proj;
        const r = (isSpacerSelected ? 4.6 : 3.8) * p.scale;

        // Esfera de nucleótido
        ctx.save();
        const sphereGrad = ctx.createRadialGradient(p.px - r * 0.3, p.py - r * 0.3, 0.5, p.px, p.py, r);
        sphereGrad.addColorStop(0, '#e0f2fe');
        sphereGrad.addColorStop(0.5, '#38bdf8');
        sphereGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Letra cada 2 bases para claridad sin saturar
        if (i % 2 === 0 || i === 0 || i === 19) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(8, 9 * p.scale)}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(node.letter, p.px, p.py - 7 * p.scale);
        }

        // GUÍAS DE ALINEACIÓN (Etapa 2: Posicionamiento)
        if (step === 2) {
          const correspondingDnaIndex = i + dnaTargetStart;
          const dnaNode = dnaStrand1[correspondingDnaIndex];
          if (dnaNode) {
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(p.px, p.py + 4);
            ctx.lineTo(dnaNode.px, dnaNode.py - 4);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // HIBRIDACIÓN WATSON-CRICK (Etapa 3: Reconocimiento)
        if (step === 3) {
          const correspondingDnaIndex = i + dnaTargetStart;
          const dnaNode = dnaStrand1[correspondingDnaIndex];
          if (dnaNode) {
            const pulse = 0.7 + 0.3 * Math.sin(time * 6 + i * 0.4);
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#22d3ee';
            ctx.strokeStyle = `rgba(34, 211, 238, ${pulse})`;
            ctx.lineWidth = 2.2 * p.scale;
            ctx.beginPath();
            ctx.moveTo(p.px, p.py + 3);
            ctx.lineTo(dnaNode.px, dnaNode.py - 3);
            ctx.stroke();

            // Puntos de enlace de hidrógeno (2 o 3 según A-U o G-C)
            const bondCount = (node.letter === 'A' || node.letter === 'U') ? 2 : 3;
            for (let b = 1; b <= bondCount; b++) {
              const bt = b / (bondCount + 1);
              const bx = p.px + (dnaNode.px - p.px) * bt;
              const by = p.py + (dnaNode.py - p.py) * bt;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(bx, by, 1.8 * p.scale, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }
      });

      // B) ANDAMIO DE ARN (TRACRRNA SCAFFOLD CON 3 HORQUILLAS DIFERENCIADAS)
      // Comienza en x = -6, exactamente donde concluye el espaciador (enlace covalente 3' continuo)
      const scaffoldStartX = -6;
      const isScaffoldSelected = selectedDomain === 'scaffold';

      // Definición de las 3 horquillas con puentes ladder (pares de bases intracatenarias)
      interface HairpinDef {
        id: number;
        name: string;
        xStart: number;
        xApex: number;
        xEnd: number;
        yApex: number;
        basePairs: number;
      }

      const hairpins: HairpinDef[] = [
        {
          id: 1,
          name: 'Horquilla 1',
          xStart: scaffoldStartX + 12,
          xApex: scaffoldStartX + 32,
          xEnd: scaffoldStartX + 52,
          yApex: rnaY - 58,
          basePairs: 4,
        },
        {
          id: 2,
          name: 'Horquilla 2',
          xStart: scaffoldStartX + 54,
          xApex: scaffoldStartX + 76,
          xEnd: scaffoldStartX + 96,
          yApex: rnaY - 72, // La más alta y prominente
          basePairs: 5,
        },
        {
          id: 3,
          name: 'Horquilla 3',
          xStart: scaffoldStartX + 98,
          xApex: scaffoldStartX + 118,
          xEnd: scaffoldStartX + 134,
          yApex: rnaY - 48,
          basePairs: 3,
        },
      ];

      ctx.save();
      if (isScaffoldSelected) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#c084fc';
      }

      // 1. Tallo de Unión (Nexus / Repeat:Anti-repeat duplex)
      const nexusStart = project3D(scaffoldStartX, rnaY, 0);
      const nexusEnd = project3D(scaffoldStartX + 12, rnaY - 8, 2);
      ctx.strokeStyle = isScaffoldSelected ? '#e879f9' : '#a855f7';
      ctx.lineWidth = (isScaffoldSelected ? 4.2 : 3.2) * currentZoom;
      ctx.beginPath();
      ctx.moveTo(spacerNodes[19].proj.px, spacerNodes[19].proj.py);
      ctx.lineTo(nexusStart.px, nexusStart.py);
      ctx.lineTo(nexusEnd.px, nexusEnd.py);
      ctx.stroke();

      // 2. Trazado 3D de cada una de las 3 horquillas
      hairpins.forEach((hp) => {
        // Puntos de la curva bezier en 3D
        const pStart = project3D(hp.xStart, rnaY - 8, 0);
        const pCtrl1 = project3D(hp.xStart + 3, hp.yApex, 6);
        const pApex = project3D(hp.xApex, hp.yApex - 4, 10);
        const pCtrl2 = project3D(hp.xEnd - 3, hp.yApex, 6);
        const pEnd = project3D(hp.xEnd, rnaY - 8, 0);

        // Hebra curva de la horquilla
        ctx.strokeStyle = isScaffoldSelected ? '#e879f9' : '#a855f7';
        ctx.lineWidth = (isScaffoldSelected ? 3.8 : 2.8) * currentZoom;
        ctx.beginPath();
        ctx.moveTo(pStart.px, pStart.py);
        ctx.bezierCurveTo(pCtrl1.px, pCtrl1.py, pApex.px - 6, pApex.py, pApex.px, pApex.py);
        ctx.bezierCurveTo(pApex.px + 6, pApex.py, pCtrl2.px, pCtrl2.py, pEnd.px, pEnd.py);
        ctx.stroke();

        // Puentes de hidrógeno intracatenarios en la horquilla (ladder rungs)
        for (let b = 1; b <= hp.basePairs; b++) {
          const t = b / (hp.basePairs + 1);
          const rungY = (rnaY - 8) + (hp.yApex - (rnaY - 8)) * t;
          const rungX1 = hp.xStart + (hp.xApex - hp.xStart) * t;
          const rungX2 = hp.xEnd - (hp.xEnd - hp.xApex) * t;

          const pRung1 = project3D(rungX1, rungY, 3);
          const pRung2 = project3D(rungX2, rungY, 3);

          ctx.strokeStyle = isScaffoldSelected ? 'rgba(245, 208, 254, 0.95)' : 'rgba(216, 180, 254, 0.65)';
          ctx.lineWidth = 1.6 * currentZoom;
          ctx.beginPath();
          ctx.moveTo(pRung1.px, pRung1.py);
          ctx.lineTo(pRung2.px, pRung2.py);
          ctx.stroke();

          // Cuentas de bases en los extremos del par
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(pRung1.px, pRung1.py, 2.2 * currentZoom, 0, Math.PI * 2);
          ctx.arc(pRung2.px, pRung2.py, 2.2 * currentZoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bucle terminal apical (apical loop)
        ctx.fillStyle = '#e879f9';
        ctx.beginPath();
        ctx.arc(pApex.px, pApex.py, 3.8 * currentZoom, 0, Math.PI * 2);
        ctx.fill();

        // Rótulo de la horquilla para reconocimiento educativo directo
        ctx.fillStyle = isScaffoldSelected ? '#f5d0fe' : 'rgba(216, 180, 254, 0.85)';
        ctx.font = `bold ${Math.max(8, 8.5 * currentZoom)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(hp.name, pApex.px, pApex.py - 8 * currentZoom);
      });

      // Extremo 3' terminal del andamio
      const pTerminal = project3D(scaffoldStartX + 138, rnaY, 0);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(pTerminal.px, pTerminal.py, 3.5 * currentZoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `bold 8px 'JetBrains Mono', monospace`;
      ctx.fillText("3'-OH", pTerminal.px + 12, pTerminal.py + 3);

      ctx.restore();

      // Extremo 5' terminal del espaciador
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillText("5'-P", spacerNodes[0].proj.px - 6, spacerNodes[0].proj.py + 3);
      ctx.restore();

      // Indicador PAM resaltado en la doble hélice
      const pamNode = dnaStrand1[pamStart];
      if (pamNode) {
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.font = `bold ${Math.max(9, 9.5 * currentZoom)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('▲ PAM (CGG)', pamNode.px + 10, pamNode.py + 26 * currentZoom);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedDomain]);

  return (
    <div className="flex flex-col gap-4">
      {/* Visor interactivo del ARN Guía 3D */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#070b16] border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Cabecera del visor */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Estructura Molecular 3D Completa
              </span>
              <h3 className="text-base font-bold text-white">
                ARN Guía (sgRNA): Espaciador & Andamio de Horquillas
              </h3>
            </div>
          </div>

          {/* Selector de dominios con diferenciación visual inmediata */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedDomain('spacer');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                selectedDomain === 'spacer'
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span>1. Espaciador (20 nt)</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedDomain('scaffold');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                selectedDomain === 'scaffold'
                  ? 'bg-purple-500/25 text-purple-200 border border-purple-400 shadow-sm shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
              <span>2. Andamio (3 Horquillas)</span>
            </button>
          </div>
        </div>

        {/* Lienzo 3D con controles y encuadre garantizado */}
        <div className="relative w-full h-[330px] sm:h-[360px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden select-none">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block cursor-grab active:cursor-grabbing"
          />

          {/* Controles de cámara 3D (con límites estrictos de zoom integrados) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl z-20">
            <button
              onClick={() => {
                sound.playClick();
                setAutoRotate(!autoRotate);
              }}
              title={autoRotate ? 'Pausar rotación automática' : 'Reanudar rotación automática'}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                const nz = Math.min(1.25, zoom + 0.1); // Máximo 1.25x para no sacar el andamio de pantalla
                setZoom(nz);
                zoomRef.current = nz;
              }}
              title="Acercar (Zoom seguro)"
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                const nz = Math.max(0.75, zoom - 0.1);
                setZoom(nz);
                zoomRef.current = nz;
              }}
              title="Alejar (Zoom general)"
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetCamera}
              title="Restablecer encuadre original"
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Banner de reconocimiento Watson-Crick en etapa 3 */}
          {approachStep === 3 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-100 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-xl shadow-cyan-500/30 animate-in zoom-in-95 z-20">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <span>RECONOCIMIENTO DE LA SECUENCIA: APAREAMIENTO WATSON-CRICK</span>
            </div>
          )}

          {/* Indicador de ayuda y estado cinematográfico */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono z-20">
            <span className="text-slate-400">Cinemática activa:</span>
            <span className="text-cyan-300 font-bold">
              {approachStep === 1 && '1 de 3: Aproximación · El ARN desciende hacia la doble hélice'}
              {approachStep === 2 && '2 de 3: Posicionamiento · Alineación con la secuencia diana y PAM'}
              {approachStep === 3 && '3 de 3: Reconocimiento · Desenrollamiento (bucle R) e hibridación'}
            </span>
          </div>

          {/* Leyenda de colores interactiva */}
          <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 px-2.5 py-1 bg-slate-900/85 backdrop-blur-sm rounded-md border border-slate-800 text-[11px] font-mono pointer-events-none z-20">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" /> Espaciador (5&apos;→3&apos;)
            </span>
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" /> Andamio (3 Horquillas)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" /> PAM
            </span>
          </div>
        </div>

        {/* Selector de las 3 Etapas de Aproximación con Cambio Visual Real */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5">
          <button
            onClick={() => advanceApproach(1)}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              approachStep === 1
                ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md ring-1 ring-cyan-500/40'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${approachStep === 1 ? 'text-cyan-300' : 'text-slate-300'}`}>
                1. Aproximación
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                1 de 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              El complejo de ARN guía completo desciende desde el nucleoplasma hacia la doble hélice de ADN.
            </p>
          </button>

          <button
            onClick={() => advanceApproach(2)}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              approachStep === 2
                ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md ring-1 ring-cyan-500/40'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${approachStep === 2 ? 'text-cyan-300' : 'text-slate-300'}`}>
                2. Posicionamiento
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                2 de 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              El espaciador se orienta y alinea con la región diana (20 nt) adyacente al motivo PAM (CGG).
            </p>
          </button>

          <button
            onClick={() => advanceApproach(3)}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              approachStep === 3
                ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md ring-1 ring-cyan-500/40'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${approachStep === 3 ? 'text-cyan-300' : 'text-slate-300'}`}>
                3. Reconocimiento
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                3 de 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Apertura de hebras (bucle R) y emparejamiento físico Watson-Crick (A-U, G-C).
            </p>
          </button>
        </div>

        {/* Explicación de los dos componentes diferenciados */}
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div
            onClick={() => setSelectedDomain('spacer')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedDomain === 'spacer'
                ? 'bg-cyan-950/35 border-cyan-500/50 text-slate-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-400'
            }`}
          >
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#22d3ee]" />
              Espaciador (20 nucleótidos, 5&apos;→3&apos;)
            </h4>
            <p className="leading-relaxed">
              Secuencia sintetizada diseñada para aparearse con los 20 nucleótidos del gen diana mediante complementariedad física de bases nitrogenadas (A con U, G con C).
            </p>
          </div>

          <div
            onClick={() => setSelectedDomain('scaffold')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedDomain === 'scaffold'
                ? 'bg-purple-950/35 border-purple-500/50 text-slate-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-400'
            }`}
          >
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block shadow-[0_0_6px_#c084fc]" />
              Andamio de ARN (3 Horquillas / Stem-loops)
            </h4>
            <p className="leading-relaxed">
              Estructura tridimensional formada por 3 horquillas con pares de bases intracatenarios que encajan en la hendidura molecular de Cas9 para formar el complejo ribonucleoproteico.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            El ARN guía orienta la endonucleasa Cas9 hacia la secuencia exacta en el genoma; por sí solo no realiza el corte.
          </span>
        </div>
      </div>

      {/* Barra de control y navegación a la siguiente escena */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {approachStep === 3
              ? 'Secuencia reconocida exitosamente. Pasemos a la escena de ensamblaje con la proteína Cas9.'
              : 'Avanza las etapas de aproximación para apreciar la interacción molecular.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {approachStep < 3 && (
            <button
              onClick={() => advanceApproach()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer shadow-sm hover:border-cyan-500/50"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Aproximar al ADN ({approachStep} de 3)</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              if (onNext) onNext();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>DESCUBRIR CAS9 EN 3D</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
