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
      background: '#080f16',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      zIndex: 100,
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 680, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Proyecto Ingeniería"
            width={36}
            height={44}
            style={{ opacity: 0.85, margin: '0 auto 20px' }}
          />
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            color: '#EEF3F5',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            ¿Qué carrera cursás?
          </h1>
          <p style={{
            marginTop: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
          }}>
            Seleccioná tu carrera para ver el mapa de materias
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 10,
        }}>
          {CARRERAS.map(c => (
            <button
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              style={{
                background: 'rgba(13,28,36,0.8)',
                border: '1px solid rgba(45,82,105,0.35)',
                borderRadius: 8,
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(45,82,105,0.8)';
                e.currentTarget.style.background = 'rgba(45,82,105,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(45,82,105,0.35)';
                e.currentTarget.style.background = 'rgba(13,28,36,0.8)';
              }}
            >
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: '#2d5269',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.3,
              }}>
                {c.nombre}
              </span>
            </button>
          ))}
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 28,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
        }}>
          Podés cambiar de carrera en cualquier momento desde la barra superior
        </p>
      </div>
    </div>
  );
}
