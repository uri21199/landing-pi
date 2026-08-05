'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PlanCarrera } from '@/lib/types';
import {
  mapaPorId,
  requisitosTransitivos,
  habilitaTransitivo,
  creditosHastaCuatrimestre,
} from '@/lib/planUtils';
import MateriaCard from './MateriaCard';
import DetailPanel from './DetailPanel';
import Legend from './Legend';

interface Linea {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tipo: 'requisito' | 'habilitada';
}

export default function PlanView({ plan }: { plan: PlanCarrera }) {
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const refsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const mapa = useMemo(() => mapaPorId(plan), [plan]);
  const seleccion = seleccionId ? mapa.get(seleccionId) ?? null : null;

  const requisitos = useMemo(
    () => (seleccionId ? requisitosTransitivos(plan, seleccionId) : new Set<string>()),
    [plan, seleccionId]
  );
  const habilitadas = useMemo(
    () => (seleccionId ? habilitaTransitivo(plan, seleccionId) : new Set<string>()),
    [plan, seleccionId]
  );

  function registerRef(id: string, el: HTMLDivElement | null) {
    refsRef.current[id] = el;
  }

  function estadoDe(id: string): 'neutral' | 'seleccionada' | 'requisito' | 'habilitada' {
    if (id === seleccionId) return 'seleccionada';
    if (requisitos.has(id)) return 'requisito';
    if (habilitadas.has(id)) return 'habilitada';
    return 'neutral';
  }

  // Traza líneas solo entre la materia elegida y sus correlativas / habilitadas DIRECTAS,
  // para que el plano no se llene de trazos y el ida-y-vuelta se lea con claridad.
  useEffect(() => {
    if (!seleccionId || !contenedorRef.current) {
      setLineas([]);
      return;
    }

    function calcular() {
      const cont = contenedorRef.current;
      if (!cont || !seleccionId) return;
      const contBox = cont.getBoundingClientRect();
      const nodoSel = refsRef.current[seleccionId];
      if (!nodoSel) return;
      const selBox = nodoSel.getBoundingClientRect();
      const centroSel = {
        x: selBox.left + selBox.width / 2 - contBox.left,
        y: selBox.top + selBox.height / 2 - contBox.top,
      };

      const nuevasLineas: Linea[] = [];
      const materiaSel = mapa.get(seleccionId);

      // hacia atrás: correlativas directas -> seleccionada
      materiaSel?.correlativas.forEach((reqId) => {
        const nodo = refsRef.current[reqId];
        if (!nodo) return;
        const box = nodo.getBoundingClientRect();
        nuevasLineas.push({
          x1: box.left + box.width / 2 - contBox.left,
          y1: box.top + box.height / 2 - contBox.top,
          x2: centroSel.x,
          y2: centroSel.y,
          tipo: 'requisito',
        });
      });

      // hacia adelante: seleccionada -> materias que la piden directamente
      Object.entries(refsRef.current).forEach(([id, nodo]) => {
        if (!nodo) return;
        const m = mapa.get(id);
        if (m?.correlativas.includes(seleccionId)) {
          const box = nodo.getBoundingClientRect();
          nuevasLineas.push({
            x1: centroSel.x,
            y1: centroSel.y,
            x2: box.left + box.width / 2 - contBox.left,
            y2: box.top + box.height / 2 - contBox.top,
            tipo: 'habilitada',
          });
        }
      });

      setLineas(nuevasLineas);
    }

    calcular();
    window.addEventListener('resize', calcular);
    window.addEventListener('scroll', calcular, true);
    return () => {
      window.removeEventListener('resize', calcular);
      window.removeEventListener('scroll', calcular, true);
    };
  }, [seleccionId, mapa]);

  function toggleSeleccion(id: string) {
    setSeleccionId((actual) => (actual === id ? null : id));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Legend />
        </div>

        <div ref={contenedorRef} className="relative">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
            {lineas.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.tipo === 'requisito' ? '#C1622E' : '#5C8A72'}
                strokeWidth={2}
                strokeDasharray={l.tipo === 'requisito' ? undefined : '5 4'}
                opacity={0.7}
              />
            ))}
          </svg>

          {/* CBC */}
          <section className="relative mb-8" style={{ zIndex: 2 }}>
            <header className="mb-2 flex items-baseline gap-2">
              <h2 className="font-display text-sm font-semibold text-brand">
                Ciclo Básico Común
              </h2>
              <span className="font-mono text-[11px] text-ink/40">
                {plan.cbc.creditos} créditos · cuatrimestres 1–2
              </span>
            </header>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {plan.cbc.materias.map((m) => (
                <MateriaCard
                  key={m.id}
                  materia={m}
                  estado={estadoDe(m.id)}
                  onClick={() => toggleSeleccion(m.id)}
                  registerRef={registerRef}
                />
              ))}
            </div>
          </section>

          {/* Segundo ciclo, un bloque por cuatrimestre */}
          <div className="relative flex flex-col gap-6" style={{ zIndex: 2 }}>
            {plan.cuatrimestres.map((c) => (
              <section key={c.numero}>
                <header className="mb-2 flex items-baseline gap-2">
                  <h2 className="font-display text-sm font-semibold text-brand">
                    {c.numero}º cuatrimestre
                  </h2>
                  <span className="font-mono text-[11px] text-ink/40">
                    {c.materias.reduce((acc, m) => acc + m.creditos, 0)} créditos ·{' '}
                    {creditosHastaCuatrimestre(plan, c.numero)} acumulados al terminarlo
                  </span>
                </header>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {c.materias.map((m) => (
                    <MateriaCard
                      key={m.id}
                      materia={m}
                      estado={estadoDe(m.id)}
                      onClick={() => toggleSeleccion(m.id)}
                      registerRef={registerRef}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Electivas */}
          <section className="relative mt-8" style={{ zIndex: 2 }}>
            <header className="mb-2 flex items-baseline gap-2">
              <h2 className="font-display text-sm font-semibold text-brand">
                Electivas y optativas
              </h2>
              <span className="font-mono text-[11px] text-ink/40">
                {plan.creditosElectivosRequeridos} créditos a elegir libremente, desde 8º
                cuatrimestre
              </span>
            </header>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {plan.electivas.map((m) => (
                <MateriaCard
                  key={m.id}
                  materia={m}
                  estado={estadoDe(m.id)}
                  onClick={() => toggleSeleccion(m.id)}
                  registerRef={registerRef}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <DetailPanel plan={plan} materia={seleccion} />
      </div>
    </div>
  );
}
