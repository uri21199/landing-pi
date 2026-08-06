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

  const borderColor =
    estadoActual === 'aprobada'    ? 'rgba(30,80,112,0.75)' :
    estadoActual === 'regularizada'? 'rgba(180,120,32,0.75)' :
                                     'rgba(45,82,105,0.55)';

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
      data-scrollable-panel="true"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,18,26,0.97)',
        borderTop: `2px solid ${borderColor}`,
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        maxHeight: '78vh',
        overflowY: 'auto',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        animation: 'slide-up-panel 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {/* ── Mobile layout ── */}
      <div className="flex flex-col sm:hidden">
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.13)' }} />
        </div>

        <div style={{ padding: '4px 48px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Nombre + meta */}
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              letterSpacing: '0.07em', marginBottom: 5,
            }}>
              {materia.cuatrimestre ? `${materia.cuatrimestre}° cuatrimestre` : 'Electiva'}
              <span style={{ color: 'rgba(255,255,255,0.18)' }}> · </span>
              {materia.creditos} cr
              <span style={{ color: 'rgba(255,255,255,0.18)' }}> · </span>
              {materia.horasSemanales}h/sem
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700,
              color: '#FFFFFF', lineHeight: 1.2, margin: 0,
            }}>
              {materia.nombre}
            </p>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {estadoActual === null && (
              <>
                {hayFaltantes && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(224,112,64,0.1)',
                    border: '1px solid rgba(224,112,64,0.25)',
                    borderRadius: 6, padding: '7px 12px',
                  }}>
                    <span style={{ fontSize: 12 }}>⚠</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#E07040', lineHeight: 1.3 }}>
                      Completá las correlativas primero
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <ActionButton label="En final" disabled={hayFaltantes} color="#b07820" onClick={() => onSetEstado('regularizada')} />
                  <ActionButton label="Aprobada" disabled={hayFaltantes} color="#2a6080" onClick={() => { onSetEstado('aprobada'); setNotaInput(''); }} />
                </div>
              </>
            )}
            {estadoActual === 'regularizada' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#c49030',
                    background: 'rgba(180,120,32,0.15)', border: '1px solid rgba(180,120,32,0.35)',
                    borderRadius: 4, padding: '3px 10px',
                  }}>● En final</span>
                  <button onClick={() => onSetEstado(null)} style={{ background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    quitar
                  </button>
                </div>
                <ActionButton label="Marcar aprobada" color="#2a6080" onClick={() => { onSetEstado('aprobada'); setNotaInput(''); }} />
              </>
            )}
            {estadoActual === 'aprobada' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4a90b8',
                    background: 'rgba(30,80,112,0.2)', border: '1px solid rgba(30,80,112,0.45)',
                    borderRadius: 4, padding: '3px 10px',
                  }}>✓ Aprobada</span>
                  <button onClick={() => { onSetEstado(null); setNotaInput(''); }} style={{ background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    quitar
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Nota:</label>
                  <input
                    type="number" min={1} max={10} step={1}
                    value={notaInput}
                    onChange={(e) => guardarNota(e.target.value)}
                    placeholder="—"
                    style={{
                      width: 56, background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.18)', borderRadius: 4,
                      padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 14,
                      color: '#fff', outline: 'none', textAlign: 'center',
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Correlativas */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            padding: '12px 14px',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E07040',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                display: 'inline-block', width: 3, height: 12,
                background: '#E07040', borderRadius: 2,
              }} />
              Para cursarla
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {materia.requiereCBC && (
                <CorrelativaItem
                  ok={!prerequisitosFaltantes.has('__cbc__')}
                  label="CBC completo aprobado"
                />
              )}
              {tieneUmbral && (
                <CorrelativaItem
                  ok={!prerequisitosFaltantes.has('__creditos__')}
                  label={`${materia.correlativasCreditos} créditos acumulados`}
                />
              )}
              {tieneCorrelativas && materia.correlativas.map((id) => (
                <CorrelativaItem
                  key={id}
                  ok={!prerequisitosFaltantes.has(id)}
                  label={nombrePorId(plan, id)}
                />
              ))}
              {sinRequisitos && (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>
                  Sin correlativas previas
                </span>
              )}
            </div>
            {materia.nota && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 10, lineHeight: 1.5 }}>
                {materia.nota}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div
        className="hidden sm:flex sm:flex-row sm:items-start"
        style={{ gap: 24, padding: '14px 44px 18px 20px' }}
      >
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

        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E07040',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7,
          }}>Para cursarla</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 16px' }}>
            {materia.requiereCBC && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: prerequisitosFaltantes.has('__cbc__') ? '#E07040' : '#7CAB8A' }}>
                {prerequisitosFaltantes.has('__cbc__') ? '✗' : '✓'} CBC completo aprobado
              </span>
            )}
            {tieneUmbral && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: prerequisitosFaltantes.has('__creditos__') ? '#E07040' : '#7CAB8A' }}>
                {prerequisitosFaltantes.has('__creditos__') ? '✗' : '✓'} {materia.correlativasCreditos} créditos acumulados
              </span>
            )}
            {tieneCorrelativas && materia.correlativas.map((id) => (
              <span key={id} style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: prerequisitosFaltantes.has(id) ? '#E07040' : '#7CAB8A' }}>
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
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 7, lineHeight: 1.4 }}>
              {materia.nota}
            </p>
          )}
        </div>

        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />

        <div style={{ flexShrink: 0, alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
          {estadoActual === null && (
            <>
              {hayFaltantes && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#E07040', margin: 0, lineHeight: 1.4 }}>
                  Completá las correlativas primero
                </p>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <ActionButton label="En final" disabled={hayFaltantes} color="#b07820" onClick={() => onSetEstado('regularizada')} />
                <ActionButton label="Aprobada" disabled={hayFaltantes} color="#2a6080" onClick={() => { onSetEstado('aprobada'); setNotaInput(''); }} />
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
                }}>● En final</span>
                <button onClick={() => onSetEstado(null)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', transition: 'color 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                  quitar
                </button>
              </div>
              <ActionButton label="Marcar aprobada" color="#2a6080" onClick={() => { onSetEstado('aprobada'); setNotaInput(''); }} />
            </>
          )}
          {estadoActual === 'aprobada' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4a90b8',
                  background: 'rgba(30,80,112,0.2)', border: '1px solid rgba(30,80,112,0.45)',
                  borderRadius: 3, padding: '2px 8px',
                }}>✓ Aprobada</span>
                <button onClick={() => { onSetEstado(null); setNotaInput(''); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', transition: 'color 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                  quitar
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Nota:</label>
                <input
                  type="number" min={1} max={10} step={1}
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
      </div>

      {/* Cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'none', border: 'none', padding: '6px 8px',
          color: 'rgba(255,255,255,0.25)', fontSize: 22, cursor: 'pointer',
          lineHeight: 1, transition: 'color 0.1s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
      >
        ×
      </button>
    </div>
  );
}

function CorrelativaItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{
        flexShrink: 0,
        width: 18, height: 18, borderRadius: 4,
        background: ok ? 'rgba(92,138,114,0.18)' : 'rgba(224,112,64,0.13)',
        border: `1px solid ${ok ? 'rgba(92,138,114,0.4)' : 'rgba(224,112,64,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
        color: ok ? '#7CAB8A' : '#E07040',
        marginTop: 1,
      }}>
        {ok ? '✓' : '✗'}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: ok ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
        {label}
      </span>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, color }: {
  label: string; onClick: () => void; disabled?: boolean; color: string;
}) {
  return (
    <button
      className="panel-action-btn"
      onClick={disabled ? undefined : onClick}
      style={{
        background: disabled ? 'rgba(255,255,255,0.04)' : `rgba(${hexToRgb(color)},0.14)`,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : `rgba(${hexToRgb(color)},0.45)`}`,
        borderRadius: 6, padding: '11px 16px',
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
        color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
        flex: 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.28)`; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = `rgba(${hexToRgb(color)},0.14)`; }}
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
