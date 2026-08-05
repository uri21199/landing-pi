'use client';

import { useState } from 'react';
import { Materia, PlanCarrera, EstadoProgreso } from '@/lib/types';
import { nombrePorId } from '@/lib/planUtils';

interface Props {
  materia: Materia;
  plan: PlanCarrera;
  estadoActual: EstadoProgreso | null;
  nota?: number;
  prerequisitosFaltantes: Set<string>;
  onSetEstado: (estado: EstadoProgreso | null, nota?: number) => void;
  onClose: () => void;
}

export default function BottomPanel({
  materia, plan, estadoActual, nota, prerequisitosFaltantes, onSetEstado, onClose,
}: Props) {
  const [notaInput, setNotaInput] = useState<string>(nota != null ? String(nota) : '');

  const tieneCorrelativas = materia.correlativas.length > 0;
  const tieneUmbral = typeof materia.correlativasCreditos === 'number';
  const sinRequisitos = !tieneCorrelativas && !tieneUmbral && !materia.requiereCBC;
  const hayFaltantes = prerequisitosFaltantes.size > 0;

  function guardarNota(val: string) {
    setNotaInput(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 1 && n <= 10) {
      onSetEstado('aprobada', n);
    } else if (val === '') {
      onSetEstado('aprobada', undefined);
    }
  }

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 overflow-y-auto"
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,18,26,0.96)',
        borderTop: '1px solid rgba(45,82,105,0.55)',
        backdropFilter: 'blur(14px)', zIndex: 100,
        padding: '14px 44px 18px 20px',
        maxHeight: '60vh',
      }}
    >
      {/* Nombre y meta */}
      <div style={{ flex: '0 0 auto', minWidth: 180, maxWidth: 260 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 5,
        }}>
          {materia.cuatrimestre ? `Cuatrimestre ${materia.cuatrimestre}` : 'Electiva'}
          {' · '}{materia.creditos} cr · {materia.horasSemanales}h/sem
        </p>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          color: '#FFFFFF', lineHeight: 1.25,
        }}>
          {materia.nombre}
        </p>
      </div>

      <div className="hidden sm:block" style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />

      {/* Correlativas — colorea según si están cumplidas o no */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E07040',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7,
        }}>
          Para cursarla
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 16px' }}>
          {materia.requiereCBC && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: prerequisitosFaltantes.has('__cbc__') ? '#E07040' : '#7CAB8A',
            }}>
              {prerequisitosFaltantes.has('__cbc__') ? '✗' : '✓'} CBC completo aprobado
            </span>
          )}
          {tieneUmbral && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: prerequisitosFaltantes.has('__creditos__') ? '#E07040' : '#7CAB8A',
            }}>
              {prerequisitosFaltantes.has('__creditos__') ? '✗' : '✓'} {materia.correlativasCreditos} créditos acumulados
            </span>
          )}
          {tieneCorrelativas && materia.correlativas.map((id) => (
            <span key={id} style={{
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: prerequisitosFaltantes.has(id) ? '#E07040' : '#7CAB8A',
            }}>
              {prerequisitosFaltantes.has(id) ? '✗' : '✓'} {nombrePorId(plan, id)}
            </span>
          ))}
          {sinRequisitos && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>
              Sin correlativas previas
            </span>
          )}
        </div>
        {materia.nota && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11,
            color: 'rgba(255,255,255,0.32)', marginTop: 7, lineHeight: 1.4,
          }}>
            {materia.nota}
          </p>
        )}
      </div>

      <div className="hidden sm:block" style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />

      {/* Acciones de progreso */}
      <div style={{ flexShrink: 0, alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
        {estadoActual === null && (
          <>
            {hayFaltantes && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#E07040', margin: 0, lineHeight: 1.4 }}>
                Completá las correlativas primero
              </p>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <ActionButton
                label="En final"
                disabled={hayFaltantes}
                color="#b07820"
                onClick={() => onSetEstado('regularizada')}
              />
              <ActionButton
                label="Aprobada"
                disabled={hayFaltantes}
                color="#2a6080"
                onClick={() => { onSetEstado('aprobada'); setNotaInput(''); }}
              />
            </div>
          </>
        )}

        {estadoActual === 'regularizada' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: '#c49030',
                background: 'rgba(180,120,32,0.15)', border: '1px solid rgba(180,120,32,0.35)',
                borderRadius: 3, padding: '2px 8px',
              }}>
                ● En final
              </span>
              <button
                onClick={() => onSetEstado(null)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', transition: 'color 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
              >
                quitar
              </button>
            </div>
            <ActionButton
              label="Marcar aprobada"
              color="#2a6080"
              onClick={() => { onSetEstado('aprobada'); setNotaInput(''); }}
            />
          </>
        )}

        {estadoActual === 'aprobada' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4a90b8',
                background: 'rgba(30,80,112,0.2)', border: '1px solid rgba(30,80,112,0.45)',
                borderRadius: 3, padding: '2px 8px',
              }}>
                ✓ Aprobada
              </span>
              <button
                onClick={() => { onSetEstado(null); setNotaInput(''); }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', transition: 'color 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
              >
                quitar
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                Nota:
              </label>
              <input
                type="number"
                min={1} max={10} step={1}
                value={notaInput}
                onChange={(e) => guardarNota(e.target.value)}
                placeholder="—"
                style={{
                  width: 42, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
                  padding: '3px 6px', fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: '#fff', outline: 'none', textAlign: 'center',
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Cerrar — posición absoluta para no afectar el flow en mobile */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none', padding: '2px 4px',
          color: 'rgba(255,255,255,0.28)', fontSize: 22, cursor: 'pointer',
          lineHeight: 1, transition: 'color 0.1s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
      >
        ×
      </button>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, color }: {
  label: string; onClick: () => void; disabled?: boolean; color: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        background: disabled ? 'rgba(255,255,255,0.04)' : `rgba(${hexToRgb(color)},0.12)`,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : `rgba(${hexToRgb(color)},0.4)`}`,
        borderRadius: 4, padding: '5px 12px',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.28)`; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.12)`; }}
    >
      {label}
    </button>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
