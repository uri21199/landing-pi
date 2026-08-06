'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { PlanCarrera, Materia, ProgresoMateria, EstadoProgreso } from '@/lib/types';
import { mapaPorId, requisitosTransitivos, habilitaDirectas, prerequisitosFaltantesIds } from '@/lib/planUtils';
import NodoMapa, { EstadoNodo, NODE_W, NODE_H } from './NodoMapa';
import BottomPanel from './BottomPanel';

const COL_STRIDE = 306;
const ROW_STRIDE = 96;
const PAD_X = 32;
const PAD_Y_TOP = 38;
const PAD_Y_BOT = 32;
const CBC_COLLAPSED_H = 130;
const CBC_VIRTUAL_ID = '__cbc_virtual__';

type NodeInfo = { materia: Materia; x: number; y: number };
type ArrowInfo = { d: string; fromId: string; toId: string };

interface Props {
  plan: PlanCarrera;
  focusId?: string | null;
  onFocusConsumed?: () => void;
  progreso: Map<string, ProgresoMateria>;
  onSetProgreso: (id: string, entrada: { estado: EstadoProgreso; nota?: number } | null) => void;
}

export default function MapaView({ plan, focusId, onFocusConsumed, progreso, onSetProgreso }: Props) {
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [cbcExpanded, setCbcExpanded] = useState(false);
  const [mostrarElectivas, setMostrarElectivas] = useState(false);
  const [cbcHover, setCbcHover] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const justDragged = useRef(false);
  const dragTimer = useRef<ReturnType<typeof setTimeout>>();
  const stateRef = useRef({ zoom: 0.7, pan: { x: 0, y: 0 } });
  const initialized = useRef(false);
  const lastTouchDist = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = { zoom, pan };
  }, [zoom, pan]);

  const mapa = useMemo(() => mapaPorId(plan), [plan]);
  const cbcIds = useMemo(() => new Set(plan.cbc.materias.map((m) => m.id)), [plan]);
  const cbcVirtualSelected = seleccionId === CBC_VIRTUAL_ID;
  const seleccion = seleccionId && !cbcVirtualSelected ? (mapa.get(seleccionId) ?? null) : null;

  const requisitos = useMemo(
    () => (!seleccionId || cbcVirtualSelected ? new Set<string>() : requisitosTransitivos(plan, seleccionId)),
    [plan, seleccionId, cbcVirtualSelected],
  );
  const cbcAprobado = useMemo(
    () => plan.cbc.materias.length > 0 && plan.cbc.materias.every(m => progreso.has(m.id)),
    [plan, progreso],
  );

  const creditosAcumulados = useMemo(
    () => [...mapa.values()].filter(m => progreso.has(m.id)).reduce((sum, m) => sum + m.creditos, 0),
    [mapa, progreso],
  );

  // Habilitadas al seleccionar una materia: solo las INMEDIATAS donde esa es el único faltante
  const habilitadas = useMemo(
    () => (!seleccionId || cbcVirtualSelected ? new Set<string>() : habilitaDirectas(plan, seleccionId, progreso)),
    [plan, seleccionId, cbcVirtualSelected, progreso],
  );

  const tifMaterias = useMemo(
    () => plan.cuatrimestres.flatMap(c => c.materias.filter(m => m.tipo === 'tif')),
    [plan],
  );

  // Si hay TIF I + TIF II, los fusiona en un único nodo con créditos sumados
  const tifDisplay = useMemo((): Materia[] => {
    if (tifMaterias.length === 0) return [];
    if (tifMaterias.length === 1) return tifMaterias;
    const tifIds = new Set(tifMaterias.map(m => m.id));
    const nombre = tifMaterias[0].nombre.replace(/\s+I{1,2}$/i, '').trim();
    const merged: Materia = {
      ...tifMaterias[tifMaterias.length - 1],
      nombre,
      creditos: tifMaterias.reduce((s, m) => s + m.creditos, 0),
      horasSemanales: tifMaterias.reduce((s, m) => s + m.horasSemanales, 0),
      correlativas: [...new Set(
        tifMaterias.flatMap(m => m.correlativas).filter(id => !tifIds.has(id))
      )],
    };
    return [merged];
  }, [tifMaterias]);

  // IDs de TIF fusionados que no aparecen en el mapa visual (ej: tif-i cuando hay tif-i+tif-ii)
  const tifHiddenIds = useMemo(
    () => new Set(tifMaterias.filter(m => !tifDisplay.some(d => d.id === m.id)).map(m => m.id)),
    [tifMaterias, tifDisplay],
  );

  // Habilitadas globales: lo que está disponible dado el progreso actual
  const habilitadasGlobal = useMemo(() => {
    const result = new Set<string>();
    for (const [id, materia] of mapa.entries()) {
      if (progreso.has(id)) continue;
      if (tifHiddenIds.has(id)) continue;
      const corrMet = materia.correlativas.every(
        cId => progreso.has(cId) || tifHiddenIds.has(cId),
      );
      const cbcMet = !materia.requiereCBC || cbcAprobado;
      const creditsMet = typeof materia.correlativasCreditos !== 'number' || creditosAcumulados >= materia.correlativasCreditos;
      if (corrMet && cbcMet && creditsMet) result.add(id);
    }
    return result;
  }, [mapa, progreso, cbcAprobado, creditosAcumulados, tifHiddenIds]);

  // Prerequisitos faltantes del nodo seleccionado (para validación en BottomPanel)
  const faltantesSeleccion = useMemo(
    () => seleccion ? prerequisitosFaltantesIds(plan, seleccion.id, progreso) : new Set<string>(),
    [seleccion, plan, progreso],
  );

  const electivasColumnas = useMemo(() => {
    if (!mostrarElectivas || plan.electivas.length === 0) return [];
    const porArea = new Map<string, Materia[]>();
    for (const m of plan.electivas) {
      const area = m.area ?? 'Otras';
      if (!porArea.has(area)) porArea.set(area, []);
      porArea.get(area)!.push(m);
    }
    return [...porArea.entries()].map(([area, materias]) => ({ label: area, materias }));
  }, [plan.electivas, mostrarElectivas]);

  const columnas = useMemo(() => {
    const cuatrCols = plan.cuatrimestres
      .map((c) => ({ label: `${c.numero}° cuatr.`, materias: c.materias.filter(m => m.tipo !== 'tif') }))
      .filter(c => c.materias.length > 0);
    return [
      { label: 'CBC', materias: cbcExpanded ? plan.cbc.materias : [] },
      ...cuatrCols,
      ...(tifDisplay.length > 0 ? [{ label: 'TIF', materias: tifDisplay }] : []),
      ...electivasColumnas,
    ];
  }, [plan, cbcExpanded, electivasColumnas, tifDisplay]);

  const { nodeMap, canvasW, canvasH, maxColH } = useMemo(() => {
    const maxRows = Math.max(1, ...columnas.map((c) => c.materias.length));
    const maxColH = maxRows * ROW_STRIDE - (ROW_STRIDE - NODE_H);
    const h = PAD_Y_TOP + maxColH + PAD_Y_BOT;
    const w = PAD_X * 2 + columnas.length * COL_STRIDE - (COL_STRIDE - NODE_W);
    const nm = new Map<string, NodeInfo>();
    columnas.forEach((col, ci) => {
      if (col.materias.length === 0) return;
      const x = PAD_X + ci * COL_STRIDE;
      const colH = col.materias.length * ROW_STRIDE - (ROW_STRIDE - NODE_H);
      const startY = PAD_Y_TOP + (maxColH - colH) / 2;
      col.materias.forEach((m, ri) => {
        nm.set(m.id, { materia: m, x, y: startY + ri * ROW_STRIDE });
      });
    });
    return { nodeMap: nm, canvasW: w, canvasH: h, maxColH };
  }, [columnas]);

  const resetView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const targetColsVisible = 5;
    const initZoom = Math.max(0.3, Math.min(1, rect.width / (targetColsVisible * COL_STRIDE)));
    const initPan = { x: 24, y: Math.max(16, (rect.height - canvasH * initZoom) / 2) };
    stateRef.current = { zoom: initZoom, pan: initPan };
    setZoom(initZoom);
    setPan(initPan);
  }, [canvasH]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      resetView();
    }
  }, [resetView]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const { zoom: z, pan: p } = stateRef.current;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const nz = Math.min(3, Math.max(0.15, z * factor));
      const np = { x: cx - (cx - p.x) * (nz / z), y: cy - (cy - p.y) * (nz / z) };
      stateRef.current = { zoom: nz, pan: np };
      setZoom(nz);
      setPan(np);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Prevent default touch behaviors (scroll/zoom) on the map but NOT inside scrollable panels.
  // touch-action:none on the container would block native scroll in child panels even with touch-action:pan-y,
  // so we use native listeners with preventDefault() and skip panels detected via data-scrollable-panel.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function inPanel(e: TouchEvent) {
      const target = e.target as Element | null;
      return !!target?.closest('[data-scrollable-panel="true"]');
    }
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length >= 2 && !inPanel(e)) e.preventDefault();
    }
    function onTouchMove(e: TouchEvent) {
      if (!inPanel(e)) e.preventDefault();
    }
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    didDrag.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    if (!didDrag.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      didDrag.current = true;
      justDragged.current = true;
      setIsDragging(true);
    }
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const { pan: p } = stateRef.current;
    const np = { x: p.x + dx, y: p.y + dy };
    stateRef.current = { ...stateRef.current, pan: np };
    setPan(np);
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    setIsDragging(false);
    if (didDrag.current) {
      clearTimeout(dragTimer.current);
      dragTimer.current = setTimeout(() => { justDragged.current = false; }, 80);
    }
    didDrag.current = false;
  }, []);

  // Step 1: ensure the focused node is visible (expand CBC/electivas if needed)
  useEffect(() => {
    if (!focusId || focusId === CBC_VIRTUAL_ID) return;
    if (plan.cbc.materias.some(m => m.id === focusId)) setCbcExpanded(true);
    if (plan.electivas.some(m => m.id === focusId)) setMostrarElectivas(true);
  }, [focusId, plan]);

  // Step 2: pan + select once nodeMap contains the node
  useEffect(() => {
    if (!focusId || focusId === CBC_VIRTUAL_ID) return;
    const node = nodeMap.get(focusId);
    if (!node) return;
    setSeleccionId(focusId);
    const el = containerRef.current;
    if (!el) return;
    const { zoom: z } = stateRef.current;
    const nx = el.clientWidth / 2 - (node.x + NODE_W / 2) * z;
    const ny = el.clientHeight / 2 - (node.y + NODE_H / 2) * z;
    stateRef.current = { ...stateRef.current, pan: { x: nx, y: ny } };
    setPan({ x: nx, y: ny });
    onFocusConsumed?.();
  }, [focusId, nodeMap, onFocusConsumed]);

  function toggle(id: string) {
    if (justDragged.current) return;
    setSeleccionId((prev) => (prev === id ? null : id));
  }

  function deselect() {
    if (justDragged.current) return;
    setSeleccionId(null);
  }

  const arrows = useMemo<ArrowInfo[]>(() => {
    const result: ArrowInfo[] = [];
    for (const { materia, x, y } of nodeMap.values()) {
      for (const reqId of materia.correlativas) {
        // Skip arrows between two TIF nodes (same column, would curve back)
        if (materia.tipo === 'tif' && mapa.get(reqId)?.tipo === 'tif') continue;
        const from = nodeMap.get(reqId);
        if (!from) continue;
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = x;
        const y2 = y + NODE_H / 2;
        const cx = (x1 + x2) / 2;
        result.push({ d: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`, fromId: reqId, toId: materia.id });
      }
    }
    return result;
  }, [nodeMap, mapa]);

  const cbcCollapseY = PAD_Y_TOP + (maxColH - CBC_COLLAPSED_H) / 2;

  const cbcVirtualArrows = useMemo(() => {
    if (cbcExpanded || seleccionId !== CBC_VIRTUAL_ID) return [];
    const collapseY = PAD_Y_TOP + (maxColH - CBC_COLLAPSED_H) / 2;
    const fromX = PAD_X + NODE_W;
    const fromY = collapseY + CBC_COLLAPSED_H / 2;
    return [...nodeMap.values()]
      .filter(({ materia }) => materia.requiereCBC)
      .map(({ materia, x, y }) => {
        const toX = x;
        const toY = y + NODE_H / 2;
        const midX = fromX + (toX - fromX) * 0.42;
        return {
          id: materia.id,
          d: `M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}`,
        };
      });
  }, [cbcExpanded, seleccionId, maxColH, nodeMap]);

  function estadoDe(id: string): EstadoNodo {
    if (id === seleccionId) return 'seleccionada';
    const estadoProgreso = progreso.get(id)?.estado;
    if (estadoProgreso === 'aprobada') return 'aprobada';
    if (estadoProgreso === 'regularizada') return 'regularizada';
    if (cbcVirtualSelected) {
      return mapa.get(id)?.requiereCBC ? 'habilitada' : 'neutral';
    }
    if (seleccionId) {
      if (requisitos.has(id)) return 'requisito';
      if (habilitadas.has(id)) return 'habilitada';
      return 'neutral';
    }
    if (habilitadasGlobal.has(id)) return 'habilitada';
    return 'neutral';
  }

  function arrowEstado(fromId: string, toId: string): 'requisito' | 'habilitada' | 'neutral' | 'dim' {
    if (!seleccionId) return 'neutral';
    if (cbcVirtualSelected) return 'dim';
    const fromReq = requisitos.has(fromId);
    const toReq = requisitos.has(toId) || toId === seleccionId;
    const fromHab = habilitadas.has(fromId) || fromId === seleccionId;
    const toHab = habilitadas.has(toId);
    if (fromReq && toReq) return 'requisito';
    if (fromHab && toHab) return 'habilitada';
    return 'dim';
  }

  const zoomAt = useCallback((center: { x: number; y: number }, factor: number) => {
    const { zoom: z, pan: p } = stateRef.current;
    const nz = Math.min(3, Math.max(0.15, z * factor));
    const np = { x: center.x - (center.x - p.x) * (nz / z), y: center.y - (center.y - p.y) * (nz / z) };
    stateRef.current = { zoom: nz, pan: np };
    setZoom(nz);
    setPan(np);
  }, []);

  function centerFromRef() {
    const el = containerRef.current;
    return { x: (el?.clientWidth ?? 900) / 2, y: (el?.clientHeight ?? 600) / 2 };
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      didDrag.current = false;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchDist.current = null;
    } else if (e.touches.length === 2) {
      isPanning.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning.current) {
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      if (!didDrag.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        didDrag.current = true;
        justDragged.current = true;
        setIsDragging(true);
      }
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const { pan: p } = stateRef.current;
      const np = { x: p.x + dx, y: p.y + dy };
      stateRef.current = { ...stateRef.current, pan: np };
      setPan(np);
    } else if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / lastTouchDist.current;
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        zoomAt({ x: cx, y: cy }, factor);
      }
      lastTouchDist.current = dist;
    }
  }, [zoomAt]);

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
    setIsDragging(false);
    if (didDrag.current) {
      clearTimeout(dragTimer.current);
      dragTimer.current = setTimeout(() => { justDragged.current = false; }, 80);
    }
    didDrag.current = false;
    lastTouchDist.current = null;
  }, []);

  const requiereCBCCount = useMemo(
    () => [...nodeMap.values()].filter(({ materia }) => materia.requiereCBC).length,
    [nodeMap],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>

      {/* Mobile: panel de materia encima del canvas */}
      {seleccion && (
        <div className="sm:hidden" style={{ flexShrink: 0 }}>
          <BottomPanel
            key={`mobile-${seleccion.id}`}
            mobileInline
            materia={seleccion}
            plan={plan}
            estadoActual={progreso.get(seleccion.id)?.estado ?? null}
            nota={progreso.get(seleccion.id)?.nota}
            prerequisitosFaltantes={faltantesSeleccion}
            onSetEstado={(estado, nota) =>
              estado === null
                ? onSetProgreso(seleccion.id, null)
                : onSetProgreso(seleccion.id, { estado, nota })
            }
            onClose={() => setSeleccionId(null)}
          />
        </div>
      )}

      {/* Mobile: panel CBC encima del canvas */}
      {cbcVirtualSelected && !cbcExpanded && (
        <div
          className="sm:hidden"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0, position: 'relative',
            background: 'rgba(8,18,26,0.96)',
            borderBottom: '2px solid rgba(193,98,46,0.5)',
            backdropFilter: 'blur(14px)',
            animation: 'slide-down-panel 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
            padding: '12px 44px 14px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C1622E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
              Ciclo Básico Común · {plan.cbc.creditos} cr
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25, margin: 0 }}>
              CBC Completo
            </p>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>
            {requiereCBCCount} materias del plan requieren CBC aprobado.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setCbcExpanded(true); setSeleccionId(null); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(193,98,46,0.12)', border: '1px solid rgba(193,98,46,0.38)',
              borderRadius: 4, padding: '8px 14px',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: '#C1622E',
              cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Ver materias del CBC
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSeleccionId(null); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'none', border: 'none', padding: '4px 6px',
              color: 'rgba(255,255,255,0.28)', fontSize: 22, cursor: 'pointer', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#0d1c24',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={deselect}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Blueprint grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(0deg,rgba(255,255,255,.045) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
        }}
      />

      {/* Canvas */}
      <div
        style={{
          position: 'absolute', transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: canvasW, height: canvasH,
        }}
      >
        {/* SVG arrows */}
        <svg
          style={{
            position: 'absolute', inset: 0,
            width: canvasW, height: canvasH,
            pointerEvents: 'none', overflow: 'visible',
          }}
        >
          <defs>
            <marker id="mq-n" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="rgba(255,255,255,0.3)" />
            </marker>
            <marker id="mq-r" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="#E07040" />
            </marker>
            <marker id="mq-h" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="#7CAB8A" />
            </marker>
            <marker id="mq-cbc" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="#C1622E" />
            </marker>
          </defs>

          {arrows.map(({ d, fromId, toId }) => {
            const est = arrowEstado(fromId, toId);
            if (est === 'dim') return null;
            const color = est === 'requisito' ? '#E07040' : est === 'habilitada' ? '#7CAB8A' : 'rgba(255,255,255,1)';
            const opacity = est === 'neutral' ? 0.11 : 0.88;
            const sw = est === 'neutral' ? 1.5 : 2;
            const marker = est === 'requisito' ? 'url(#mq-r)' : est === 'habilitada' ? 'url(#mq-h)' : 'url(#mq-n)';
            return (
              <path
                key={`${fromId}-${toId}`} d={d} fill="none"
                stroke={color} strokeWidth={sw} opacity={opacity} markerEnd={marker}
              />
            );
          })}

          {/* CBC virtual arrows — shown when CBC hexagon is selected */}
          {cbcVirtualArrows.map(({ id, d }) => (
            <path
              key={`cbc-${id}`} d={d} fill="none"
              stroke="#C1622E" strokeWidth={1.5} opacity={0.55} markerEnd="url(#mq-cbc)"
            />
          ))}
        </svg>

        {/* CBC hexagon node (collapsed state) */}
        {!cbcExpanded && (
          <div
            onClick={(e) => { e.stopPropagation(); toggle(CBC_VIRTUAL_ID); }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setCbcHover(true)}
            onMouseLeave={() => setCbcHover(false)}
            style={{
              position: 'absolute', left: PAD_X, top: cbcCollapseY,
              width: NODE_W, height: CBC_COLLAPSED_H,
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              background: cbcVirtualSelected
                ? 'linear-gradient(155deg, #E07850 0%, #C1622E 100%)'
                : 'linear-gradient(155deg, #C1622E 0%, #8B3218 100%)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              filter: [
                `drop-shadow(0 0 ${cbcVirtualSelected ? 5 : 2}px rgba(193,98,46,${cbcVirtualSelected ? 0.75 : 0.4}))`,
                'drop-shadow(0 5px 16px rgba(0,0,0,0.6))',
                `brightness(${cbcHover ? 1.12 : 1})`,
              ].join(' '),
              transition: 'filter 0.12s, background 0.15s',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
              color: '#fff', letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              CBC
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.4,
            }}>
              {plan.cbc.materias.length} materias · {plan.cbc.creditos} cr
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setCbcExpanded(true); setSeleccionId(null); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                marginTop: 4,
                background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 3, padding: '3px 12px',
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              ↓ ver materias
            </button>
          </div>
        )}

        {/* Colapsar CBC button (expanded state) */}
        {cbcExpanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setCbcExpanded(false); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', left: PAD_X, top: PAD_Y_TOP - 24,
              width: NODE_W, background: 'none', border: 'none', padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(193,98,46,0.6)', cursor: 'pointer', textAlign: 'center',
              transition: 'color 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C1622E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(193,98,46,0.6)')}
          >
            ↑ colapsar CBC
          </button>
        )}

        {/* Subject nodes (non-TIF) */}
        {[...nodeMap.values()]
          .filter(({ materia }) => materia.tipo !== 'tif')
          .map(({ materia, x, y }) => (
            <NodoMapa
              key={materia.id}
              materia={materia} x={x} y={y}
              estado={estadoDe(materia.id)}
              isCBC={cbcIds.has(materia.id)}
              onClick={() => toggle(materia.id)}
            />
          ))}

        {/* TIF nodes rendered as diamonds */}
        {[...nodeMap.values()]
          .filter(({ materia }) => materia.tipo === 'tif')
          .map(({ materia, x, y }) => {
            const tifH = 112;
            const yAdj = y - (tifH - NODE_H) / 2;
            const estado = estadoDe(materia.id);
            const bg =
              estado === 'seleccionada' ? '#FFFFFF' :
              estado === 'aprobada'     ? '#0a1e2c' :
              estado === 'regularizada' ? '#2a1800' :
              'linear-gradient(155deg, #9B3318 0%, #6B1F10 100%)';
            const glowColor =
              estado === 'seleccionada' ? 'rgba(45,82,105,0.55)' :
              estado === 'aprobada'     ? 'rgba(30,80,112,0.5)' :
              estado === 'regularizada' ? 'rgba(176,120,32,0.5)' :
              'rgba(193,98,46,0.55)';
            const textColor = estado === 'seleccionada' ? '#12232C' : '#FFFFFF';
            const textOpacity = (estado === 'aprobada' || estado === 'regularizada') ? 0.5 : 1;
            return (
              <div
                key={materia.id}
                role="button"
                tabIndex={0}
                className="hover:brightness-110"
                style={{
                  position: 'absolute', left: x, top: yAdj,
                  width: NODE_W, height: tifH,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  background: bg,
                  cursor: 'pointer', userSelect: 'none',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3,
                  filter: [
                    `drop-shadow(0 0 ${estado === 'seleccionada' ? 6 : 2}px ${glowColor})`,
                    'drop-shadow(0 4px 14px rgba(0,0,0,0.6))',
                  ].join(' '),
                  transition: 'filter 0.12s ease',
                }}
                onClick={(e) => { e.stopPropagation(); toggle(materia.id); }}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(materia.id); }}
              >
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
                  color: textColor, opacity: textOpacity,
                  textAlign: 'center', lineHeight: 1.25, margin: 0,
                  padding: '0 30%',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {materia.nombre}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, margin: 0,
                  color: textColor, opacity: textOpacity * 0.65,
                }}>
                  {materia.creditos} cr
                </p>
                {estado === 'aprobada' && (
                  <span style={{ position: 'absolute', top: 22, color: '#4a90b8', fontSize: 11, fontWeight: 700 }}>✓</span>
                )}
                {estado === 'regularizada' && (
                  <span style={{ position: 'absolute', top: 22, color: '#c49030', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>FINAL</span>
                )}
              </div>
            );
          })}
      </div>

      {/* Bottom panel — regular materia */}
      {seleccion && (
        <BottomPanel
          key={seleccion.id}
          materia={seleccion}
          plan={plan}
          estadoActual={progreso.get(seleccion.id)?.estado ?? null}
          nota={progreso.get(seleccion.id)?.nota}
          prerequisitosFaltantes={faltantesSeleccion}
          onSetEstado={(estado, nota) =>
            estado === null
              ? onSetProgreso(seleccion.id, null)
              : onSetProgreso(seleccion.id, { estado, nota })
          }
          onClose={() => setSeleccionId(null)}
        />
      )}

      {/* Panel CBC — desktop only (mobile version está encima del canvas) */}
      {cbcVirtualSelected && !cbcExpanded && (
        <div
          className="hidden sm:block"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(8,18,26,0.96)',
            borderTop: '1px solid rgba(193,98,46,0.38)',
            backdropFilter: 'blur(14px)', zIndex: 100,
          }}
        >
          {/* Desktop CBC panel */}
          <div className="hidden sm:flex" style={{ gap: 24, alignItems: 'flex-start', padding: '14px 20px 18px' }}>
            <div style={{ flex: '0 0 auto', minWidth: 180, maxWidth: 240 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C1622E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                Ciclo Básico Común · {plan.cbc.creditos} cr
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
                CBC Completo
              </p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7CAB8A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
                Habilita
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {requiereCBCCount} materias del plan requieren CBC aprobado. Están resaltadas en verde.
              </p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />
            <button
              onClick={(e) => { e.stopPropagation(); setCbcExpanded(true); setSeleccionId(null); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                flexShrink: 0, alignSelf: 'center',
                background: 'rgba(193,98,46,0.12)', border: '1px solid rgba(193,98,46,0.38)',
                borderRadius: 4, padding: '6px 14px',
                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C1622E',
                cursor: 'pointer', transition: 'background 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(193,98,46,0.26)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(193,98,46,0.12)')}
            >
              Ver materias del CBC
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setSeleccionId(null); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'none', border: 'none', padding: '4px 6px',
              color: 'rgba(255,255,255,0.28)', fontSize: 22, cursor: 'pointer',
              lineHeight: 1, transition: 'color 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
          >
            ×
          </button>
        </div>
      )}

      {/* Legend + electivas toggle */}
      {!seleccionId && (
        <div style={{ position: 'absolute', bottom: 'max(12px, env(safe-area-inset-bottom))', left: 'max(12px, env(safe-area-inset-left))', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', maxWidth: 'calc(100% - 80px)' }}>
          <div style={{
            pointerEvents: 'none',
            background: 'rgba(13,28,36,0.88)', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)', borderRadius: 4, padding: '6px 10px',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              Tocá una materia
            </span>
            <span className="hidden sm:block" style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            <LeyendaDot color="#E07040" label="Necesitás" />
            <LeyendaDot color="#7CAB8A" label="Se te abre" />
            {progreso.size > 0 && (
              <>
                <LeyendaDot color="#b07820" label="En final" labelColor="#c49030" />
                <LeyendaDot color="#1e5070" label="Aprobada" labelColor="#4a90b8" />
              </>
            )}
          </div>

          {plan.electivas.length > 0 && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setMostrarElectivas((v) => !v); }}
              style={{
                background: mostrarElectivas ? 'rgba(45,82,105,0.45)' : 'rgba(13,28,36,0.88)',
                border: `1px solid ${mostrarElectivas ? 'rgba(45,82,105,0.75)' : 'rgba(255,255,255,0.1)'}`,
                backdropFilter: 'blur(8px)', borderRadius: 4, padding: '6px 12px',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: mostrarElectivas ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {mostrarElectivas ? '✓ ' : ''}Electivas
            </button>
          )}
        </div>
      )}

      {/* Zoom controls */}
      {!seleccionId && (
        <div style={{ position: 'absolute', bottom: 'max(12px, env(safe-area-inset-bottom))', right: 'max(12px, env(safe-area-inset-right))', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: '+', factor: 1.2, title: 'Acercar' },
            { label: '−', factor: 1 / 1.2, title: 'Alejar' },
          ].map(({ label, factor, title }) => (
            <button
              key={label} title={title}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); zoomAt(centerFromRef(), factor); }}
              className="map-zoom-btn flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-sm font-mono text-[18px] sm:text-[15px] hover:bg-white/20"
              style={{ background: 'rgba(13,28,36,0.88)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}
            >
              {label}
            </button>
          ))}
          <button
            title="Restablecer vista"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            className="map-zoom-btn flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-sm font-mono text-[13px] sm:text-[11px] hover:bg-white/20"
            style={{ background: 'rgba(13,28,36,0.88)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
          >
            ⊡
          </button>
        </div>
      )}
    </div>
    </div>
  );
}

function LeyendaDot({ color, label, labelColor }: { color: string; label: string; labelColor?: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: labelColor ?? color }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}
