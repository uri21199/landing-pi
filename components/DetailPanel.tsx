'use client';

import { Materia, PlanCarrera } from '@/lib/types';
import { nombrePorId } from '@/lib/planUtils';

interface Props {
  plan: PlanCarrera;
  materia: Materia | null;
}

export default function DetailPanel({ plan, materia }: Props) {
  if (!materia) {
    return (
      <div className="rounded-sm border border-brand/15 bg-white/60 p-5">
        <p className="font-display text-sm font-medium text-brand">Tocá una materia</p>
        <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink/60">
          Vas a ver en el plano qué materias necesitás tener aprobadas (en{' '}
          <span className="text-rust font-medium">óxido</span>) y qué materias se te abren
          después (en <span className="text-support font-medium">verde</span>).
        </p>
      </div>
    );
  }

  const tieneCorrelativas = materia.correlativas.length > 0;
  const tieneUmbral = typeof materia.correlativasCreditos === 'number';
  const sinRequisitos = !tieneCorrelativas && !tieneUmbral && !materia.requiereCBC;

  return (
    <div className="rounded-sm border-2 border-brand bg-white p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-brand/50">
        {materia.cuatrimestre ? `Cuatrimestre ${materia.cuatrimestre}` : 'Electiva'} ·{' '}
        {materia.creditos} créditos · {materia.horasTotales} hs totales
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink">{materia.nombre}</h3>

      <div className="mt-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-rust">
          Para cursarla necesitás
        </p>
        {materia.requiereCBC && (
          <p className="mt-1 font-body text-[13px] text-ink/80">· Tener aprobado el CBC completo</p>
        )}
        {tieneUmbral && (
          <p className="mt-1 font-body text-[13px] text-ink/80">
            · Tener acumulados al menos {materia.correlativasCreditos} créditos
          </p>
        )}
        {tieneCorrelativas &&
          materia.correlativas.map((id) => (
            <p key={id} className="mt-1 font-body text-[13px] text-ink/80">
              · Tener aprobada <span className="font-medium">{nombrePorId(plan, id)}</span>
            </p>
          ))}
        {sinRequisitos && (
          <p className="mt-1 font-body text-[13px] text-ink/50 italic">
            Sin correlativas: se puede cursar desde el ingreso al segundo ciclo.
          </p>
        )}
        {materia.nota && (
          <p className="mt-2 rounded-sm bg-brand/5 px-2 py-1.5 font-body text-[12px] text-ink/70">
            {materia.nota}
          </p>
        )}
      </div>
    </div>
  );
}
