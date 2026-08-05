'use client';

import { Materia, PlanCarrera } from '@/lib/types';
import { nombrePorId } from '@/lib/planUtils';

const TW = 240;
const GAP = 10;
const PAD = 8;

interface Props {
  materia: Materia;
  plan: PlanCarrera;
  nodeScreenX: number;
  nodeScreenY: number;
  nodeScreenW: number;
  nodeScreenH: number;
  containerW: number;
  containerH: number;
  onClose: () => void;
}

export default function TooltipMateria({
  materia,
  plan,
  nodeScreenX,
  nodeScreenY,
  nodeScreenW,
  nodeScreenH,
  containerW,
  containerH,
  onClose,
}: Props) {
  const tieneCorrelativas = materia.correlativas.length > 0;
  const tieneUmbral = typeof materia.correlativasCreditos === 'number';
  const sinRequisitos = !tieneCorrelativas && !tieneUmbral && !materia.requiereCBC;

  let left = nodeScreenX + nodeScreenW + GAP;
  if (left + TW > containerW - PAD) {
    left = nodeScreenX - TW - GAP;
  }
  left = Math.max(PAD, Math.min(containerW - TW - PAD, left));

  const estimatedH = 200 + materia.correlativas.length * 20 + (materia.nota ? 50 : 0);
  let top = nodeScreenY + nodeScreenH / 2 - estimatedH / 2;
  top = Math.max(PAD, Math.min(containerH - estimatedH - PAD, top));

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left,
        top,
        width: TW,
        zIndex: 100,
        background: '#0d1c24',
        border: '1.5px solid rgba(45,82,105,0.7)',
        borderRadius: 5,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        padding: '10px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 3,
          }}>
            {materia.cuatrimestre ? `Cuatrimestre ${materia.cuatrimestre}` : 'Electiva'}
            {' · '}{materia.creditos} cr
          </p>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
            color: '#FFFFFF', lineHeight: 1.3,
          }}>
            {materia.nombre}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            flexShrink: 0, width: 20, height: 20, marginTop: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 2, color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontSize: 16, lineHeight: 1,
            border: 'none', background: 'none', padding: 0,
          }}
        >
          ×
        </button>
      </div>

      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'rgba(255,255,255,0.25)', marginTop: 4, marginBottom: 10,
      }}>
        {materia.horasSemanales}h/sem · {materia.horasTotales}h totales
      </p>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />

      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C1622E',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
      }}>
        Para cursarla
      </p>

      {materia.requiereCBC && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>
          · CBC completo aprobado
        </p>
      )}
      {tieneUmbral && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>
          · {materia.correlativasCreditos} créditos acumulados
        </p>
      )}
      {tieneCorrelativas && materia.correlativas.map((id) => (
        <p key={id} style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>
          · {nombrePorId(plan, id)}
        </p>
      ))}
      {sinRequisitos && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
          Sin correlativas
        </p>
      )}

      {materia.nota && (
        <div style={{ marginTop: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            {materia.nota}
          </p>
        </div>
      )}
    </div>
  );
}
