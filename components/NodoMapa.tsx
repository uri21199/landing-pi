'use client';

import { Materia } from '@/lib/types';

export type EstadoNodo = 'neutral' | 'seleccionada' | 'requisito' | 'habilitada' | 'regularizada' | 'aprobada';

export const NODE_W = 192;
export const NODE_H = 80;

interface Props {
  materia: Materia;
  x: number;
  y: number;
  estado: EstadoNodo;
  isCBC?: boolean;
  onClick: () => void;
}

type C = { bg: string; border: string; text: string; sub: string; shadow: string };

function colors(estado: EstadoNodo, isCBC: boolean, isTIF: boolean): C {
  if (estado === 'seleccionada') return {
    bg: '#FFFFFF', border: '2px solid #2d5269',
    text: '#12232C', sub: 'rgba(45,82,105,0.5)',
    shadow: '0 0 0 3px rgba(45,82,105,0.3), 0 6px 20px rgba(0,0,0,0.55)',
  };
  if (estado === 'requisito') return {
    bg: '#9B3318', border: '1.5px solid #E07040',
    text: '#FFFFFF', sub: 'rgba(255,255,255,0.6)',
    shadow: '0 2px 10px rgba(0,0,0,0.5)',
  };
  if (estado === 'habilitada') return {
    bg: '#3A6B52', border: '1.5px solid #7CAB8A',
    text: '#FFFFFF', sub: 'rgba(255,255,255,0.6)',
    shadow: '0 2px 10px rgba(0,0,0,0.5)',
  };
  if (estado === 'regularizada') return {
    bg: '#2a1800', border: '1.5px solid #b07820',
    text: 'rgba(255,255,255,0.65)', sub: 'rgba(255,200,80,0.4)',
    shadow: '0 1px 4px rgba(0,0,0,0.35)',
  };
  if (estado === 'aprobada') return {
    bg: '#0a1e2c', border: '1.5px solid #1e5070',
    text: 'rgba(255,255,255,0.5)', sub: 'rgba(255,255,255,0.25)',
    shadow: '0 1px 4px rgba(0,0,0,0.35)',
  };
  if (isTIF) return {
    bg: '#6B1F10', border: '1.5px solid rgba(193,98,46,0.4)',
    text: '#FFFFFF', sub: 'rgba(255,255,255,0.5)',
    shadow: '0 1px 5px rgba(0,0,0,0.4)',
  };
  if (isCBC) return {
    bg: '#C1622E', border: '1.5px solid rgba(255,255,255,0.15)',
    text: '#FFFFFF', sub: 'rgba(255,255,255,0.65)',
    shadow: '0 1px 5px rgba(0,0,0,0.4)',
  };
  return {
    bg: '#2d5269', border: '1.5px solid rgba(255,255,255,0.1)',
    text: '#FFFFFF', sub: 'rgba(255,255,255,0.55)',
    shadow: '0 1px 5px rgba(0,0,0,0.4)',
  };
}

export default function NodoMapa({ materia, x, y, estado, isCBC = false, onClick }: Props) {
  const isTIF = materia.tipo === 'tif';
  const c = colors(estado, isCBC, isTIF);
  const cornerClr =
    estado === 'seleccionada' ? 'rgba(45,82,105,0.3)' :
    estado === 'aprobada' ? 'rgba(30,80,112,0.6)' :
    estado === 'regularizada' ? 'rgba(176,120,32,0.5)' :
    'rgba(255,255,255,0.22)';

  return (
    <div
      role="button"
      tabIndex={0}
      className="hover:brightness-110"
      style={{
        position: 'absolute', left: x, top: y, width: NODE_W, height: NODE_H,
        background: c.bg, border: c.border, borderRadius: 5,
        padding: '7px 9px', cursor: 'pointer', userSelect: 'none',
        boxShadow: c.shadow, transition: 'filter 0.12s ease, box-shadow 0.12s ease',
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <span style={{ position: 'absolute', left: 0, top: 0, width: 7, height: 7, borderLeft: `1px solid ${cornerClr}`, borderTop: `1px solid ${cornerClr}` }} />
      <span style={{ position: 'absolute', right: 0, bottom: 0, width: 7, height: 7, borderRight: `1px solid ${cornerClr}`, borderBottom: `1px solid ${cornerClr}` }} />
      {estado === 'aprobada' && (
        <span style={{ position: 'absolute', right: 7, top: 5, color: '#4a90b8', fontSize: 11, lineHeight: 1, fontWeight: 700 }}>✓</span>
      )}
      {estado === 'regularizada' && (
        <span style={{ position: 'absolute', right: 7, top: 5, color: '#c49030', fontSize: 9, lineHeight: 1, fontWeight: 700, letterSpacing: '0.05em' }}>FINAL</span>
      )}

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, lineHeight: 1.25,
        color: c.text, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', maxHeight: 50,
      }}>
        {materia.nombre}
      </p>

      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, lineHeight: 1,
        color: c.sub, margin: '4px 0 0',
      }}>
        {materia.creditos} cr
        {isTIF && <span style={{ marginLeft: 6 }}>TIF</span>}
      </p>

      {/* Fix 2: badge para requisito de créditos acumulados */}
      {typeof materia.correlativasCreditos === 'number' && (
        <span style={{
          position: 'absolute', right: 6, bottom: 6,
          fontFamily: 'var(--font-mono)', fontSize: 8, lineHeight: 1,
          color: estado === 'seleccionada' ? 'rgba(45,82,105,0.6)' : 'rgba(255,255,255,0.4)',
          background: estado === 'seleccionada' ? 'rgba(45,82,105,0.1)' : 'rgba(0,0,0,0.25)',
          borderRadius: 2, padding: '2px 4px',
        }}>
          ≥{materia.correlativasCreditos}cr
        </span>
      )}
    </div>
  );
}
