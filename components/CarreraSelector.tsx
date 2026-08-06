'use client';

const CARRERAS = [
  { slug: 'civil',         nombre: 'Ingeniería Civil' },
  { slug: 'alimentos',     nombre: 'Ing. en Alimentos' },
  { slug: 'electricista',  nombre: 'Ing. en Energía Eléctrica' },
  { slug: 'electronica',   nombre: 'Ing. Electrónica' },
  { slug: 'agrimensura',   nombre: 'Ing. en Agrimensura' },
  { slug: 'informatica',   nombre: 'Ing. en Informática' },
  { slug: 'petroleo',      nombre: 'Ing. en Petróleo' },
  { slug: 'industrial',    nombre: 'Ing. Industrial' },
  { slug: 'mecanica',      nombre: 'Ing. Mecánica' },
  { slug: 'naval',         nombre: 'Ing. Naval' },
  { slug: 'quimica',       nombre: 'Ing. Química' },
  { slug: 'las',           nombre: 'Lic. Análisis de Sistemas' },
  { slug: 'bioingenieria', nombre: 'Bioingeniería' },
];

interface Props {
  onSelect: (slug: string) => void;
}

export default function CarreraSelector({ onSelect }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse 120% 45% at 50% 0%, rgba(45,82,105,0.28) 0%, transparent 65%), #080f16',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '52px 24px 32px',
        animation: 'fade-in-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
          <div style={{
            position: 'absolute', inset: -12,
            background: 'radial-gradient(circle, rgba(45,82,105,0.35) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Proyecto Ingeniería"
            width={40}
            height={49}
            style={{ opacity: 0.9, position: 'relative', display: 'block' }}
          />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 5vw, 28px)',
          fontWeight: 700,
          color: '#EEF3F5',
          letterSpacing: '-0.025em',
          margin: '0 0 8px',
          lineHeight: 1.2,
        }}>
          ¿Qué carrera cursás?
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          margin: 0,
        }}>
          Seleccioná tu carrera para ver el mapa de materias
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full"
        style={{
          maxWidth: 680,
          padding: '0 16px',
          animation: 'fade-in-up 0.5s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        {CARRERAS.map(c => (
          <button
            key={c.slug}
            className="career-card"
            onClick={() => onSelect(c.slug)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(45,82,105,0.3)',
              borderRadius: 10,
              padding: '14px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minHeight: 72,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'rgba(45,82,105,0.25)',
              border: '1px solid rgba(45,82,105,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5h6M5 2l3 3-3 3" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.35,
              display: 'block',
            }}>
              {c.nombre}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        padding: '24px 24px 36px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.18)',
        animation: 'fade-in 0.5s 0.25s both',
        lineHeight: 1.6,
      }}>
        Podés cambiar de carrera en cualquier momento desde la barra superior
      </p>
    </div>
  );
}
