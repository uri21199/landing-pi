'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import MapaView from '@/components/MapaView';
import CarreraSelector from '@/components/CarreraSelector';
import { PlanCarrera, ProgresoMateria, EstadoProgreso } from '@/lib/types';
import civil from '@/data/carreras/civil.json';
import alimentos from '@/data/carreras/alimentos.json';
import electricista from '@/data/carreras/electricista.json';
import electronica from '@/data/carreras/electronica.json';
import agrimensura from '@/data/carreras/agrimensura.json';
import informatica from '@/data/carreras/informatica.json';
import petroleo from '@/data/carreras/petroleo.json';
import industrial from '@/data/carreras/industrial.json';
import mecanica from '@/data/carreras/mecanica.json';
import naval from '@/data/carreras/naval.json';
import quimica from '@/data/carreras/quimica.json';
import las from '@/data/carreras/las.json';
import bioingenieria from '@/data/carreras/bioingenieria.json';

const PLANES: Record<string, PlanCarrera> = {
  civil: civil as unknown as PlanCarrera,
  alimentos: alimentos as unknown as PlanCarrera,
  electricista: electricista as unknown as PlanCarrera,
  electronica: electronica as unknown as PlanCarrera,
  agrimensura: agrimensura as unknown as PlanCarrera,
  informatica: informatica as unknown as PlanCarrera,
  petroleo: petroleo as unknown as PlanCarrera,
  industrial: industrial as unknown as PlanCarrera,
  mecanica: mecanica as unknown as PlanCarrera,
  naval: naval as unknown as PlanCarrera,
  quimica: quimica as unknown as PlanCarrera,
  las: las as unknown as PlanCarrera,
  bioingenieria: bioingenieria as unknown as PlanCarrera,
};

const SLUG_KEY = 'fiuba-carrera-activa';
const STORAGE_KEY = (slug: string) => `fiuba-progreso-${slug}`;

function cargarProgreso(slug: string): Map<string, ProgresoMateria> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(slug));
    if (!raw) return new Map();
    const obj = JSON.parse(raw) as Record<string, ProgresoMateria>;
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
}

function guardarProgreso(slug: string, p: Map<string, ProgresoMateria>) {
  const obj = Object.fromEntries(p.entries());
  localStorage.setItem(STORAGE_KEY(slug), JSON.stringify(obj));
}

export default function Home() {
  const [slug, setSlug] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const handleFocusConsumed = useCallback(() => setFocusId(null), []);
  const [progreso, setProgreso] = useState<Map<string, ProgresoMateria>>(new Map());

  useEffect(() => {
    const saved = localStorage.getItem(SLUG_KEY);
    if (saved && PLANES[saved]) {
      setSlug(saved);
      setProgreso(cargarProgreso(saved));
    }
    // si no hay nada guardado, slug queda null → muestra CarreraSelector
  }, []);

  const handleSelectCarrera = useCallback((newSlug: string) => {
    if (!PLANES[newSlug]) return;
    localStorage.setItem(SLUG_KEY, newSlug);
    setSlug(newSlug);
    setFocusId(null);
    setProgreso(cargarProgreso(newSlug));
  }, []);

  const plan = PLANES[slug ?? 'civil'] ?? PLANES.civil;

  const handleSetProgreso = useCallback((
    id: string,
    entrada: { estado: EstadoProgreso; nota?: number } | null,
  ) => {
    setProgreso(prev => {
      const next = new Map(prev);
      if (entrada === null) next.delete(id);
      else next.set(id, entrada);
      guardarProgreso(slug ?? 'civil', next);
      return next;
    });
  }, [slug]);

  const allMaterias = useMemo(() => [
    ...plan.cbc.materias,
    ...plan.cuatrimestres.flatMap(c => c.materias),
    ...plan.electivas,
  ], [plan]);

  const creditosAprobados = useMemo(
    () => allMaterias
      .filter(m => progreso.get(m.id)?.estado === 'aprobada')
      .reduce((sum, m) => sum + m.creditos, 0),
    [allMaterias, progreso],
  );

  const countAprobadas = useMemo(
    () => [...progreso.values()].filter(p => p.estado === 'aprobada').length,
    [progreso],
  );

  const countFinales = useMemo(
    () => [...progreso.values()].filter(p => p.estado === 'regularizada').length,
    [progreso],
  );

  const pct = Math.round((creditosAprobados / plan.totalCreditos) * 100);
  const progressColor = pct < 33 ? '#C1622E' : pct < 67 ? '#c49030' : '#5C8A72';

  if (slug === null) {
    return (
      <CarreraSelector
        onSelect={(s) => {
          localStorage.setItem(SLUG_KEY, s);
          setSlug(s);
          setProgreso(cargarProgreso(s));
        }}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar
        plan={plan}
        currentSlug={slug}
        onSelectMateria={setFocusId}
        onSelectCarrera={handleSelectCarrera}
      />

      {progreso.size > 0 && (
        <div style={{
          flexShrink: 0,
          background: '#080f16',
          borderBottom: '1px solid rgba(45,82,105,0.2)',
          padding: '5px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            flex: 1, height: 3,
            background: 'rgba(45,82,105,0.2)',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: progressColor,
              width: `${pct}%`,
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap',
          }}>
            {creditosAprobados} / {plan.totalCreditos} cr · {pct}%
          </span>
          {countAprobadas > 0 && (
            <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4a90b8', whiteSpace: 'nowrap' }}>
              ✓ {countAprobadas} aprobadas
            </span>
          )}
          {countFinales > 0 && (
            <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#c49030', whiteSpace: 'nowrap' }}>
              ● {countFinales} en final
            </span>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <MapaView
          plan={plan}
          focusId={focusId}
          onFocusConsumed={handleFocusConsumed}
          progreso={progreso}
          onSetProgreso={handleSetProgreso}
        />
      </div>
    </div>
  );
}
