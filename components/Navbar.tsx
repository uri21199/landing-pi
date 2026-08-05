'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { PlanCarrera } from '@/lib/types';

const carreras = [
  { slug: 'civil', nombre: 'Ingeniería Civil', disponible: true },
  { slug: 'alimentos', nombre: 'Ing. en Alimentos', disponible: true },
  { slug: 'electricista', nombre: 'Ing. en Energía Eléctrica', disponible: true },
  { slug: 'electronica', nombre: 'Ing. Electrónica', disponible: true },
  { slug: 'agrimensura', nombre: 'Ing. en Agrimensura', disponible: true },
  { slug: 'informatica', nombre: 'Ing. en Informática', disponible: true },
  { slug: 'petroleo', nombre: 'Ing. en Petróleo', disponible: true },
  { slug: 'industrial', nombre: 'Ing. Industrial', disponible: true },
  { slug: 'mecanica', nombre: 'Ing. Mecánica', disponible: true },
  { slug: 'naval', nombre: 'Ing. Naval', disponible: true },
  { slug: 'quimica', nombre: 'Ing. Química', disponible: true },
  { slug: 'las', nombre: 'Lic. Análisis de Sistemas', disponible: true },
  { slug: 'bioingenieria', nombre: 'Bioingeniería', disponible: true },
];

interface Props {
  plan: PlanCarrera;
  currentSlug: string;
  onSelectMateria: (id: string) => void;
  onSelectCarrera: (slug: string) => void;
}

export default function Navbar({ plan, currentSlug, onSelectMateria, onSelectCarrera }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allMaterias = useMemo(() => [
    ...plan.cbc.materias.map(m => ({ id: m.id, nombre: m.nombre, grupo: 'CBC' })),
    ...plan.cuatrimestres.flatMap(c =>
      c.materias.map(m => ({ id: m.id, nombre: m.nombre, grupo: `${c.numero}° cuatr.` }))
    ),
    ...plan.electivas.map(m => ({ id: m.id, nombre: m.nombre, grupo: 'Electiva' })),
  ], [plan]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allMaterias.filter(m => m.nombre.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allMaterias]);

  const showDropdown = searchFocused && results.length > 0;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement;
        if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function selectResult(id: string) {
    onSelectMateria(id);
    setQuery('');
    setSearchFocused(false);
    inputRef.current?.blur();
  }

  return (
    <header
      style={{ background: '#0d1c24', borderBottom: '1px solid rgba(45,82,105,0.35)' }}
      className="relative z-50 flex-shrink-0 h-14"
    >
      <div className="flex h-full items-center gap-3 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Proyecto Ingeniería" width={28} height={35} style={{ opacity: 0.9 }} />

        <div className="flex items-center gap-2">
          <span className="font-display text-[14px] font-semibold text-white/90 tracking-tight">
            Proyecto Ingeniería
          </span>
          <span className="hidden sm:flex items-center gap-2">
            <span className="text-white/20 font-mono text-[12px]">/</span>
            <span className="font-mono text-[11px] text-white/40">Planes de estudio</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden sm:block">
          <div style={{
            background: 'rgba(45,82,105,0.1)',
            border: `1px solid ${searchFocused ? 'rgba(45,82,105,0.65)' : 'rgba(45,82,105,0.28)'}`,
            borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 10px', transition: 'border-color 0.15s',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" />
              <path d="M8 8l2.2 2.2" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setQuery(''); setSearchFocused(false); e.currentTarget.blur(); }
                if (e.key === 'Enter' && results.length > 0) selectResult(results[0].id);
              }}
              placeholder="Buscar materia… (/)"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(255,255,255,0.72)', width: 190, padding: '7px 0',
              }}
            />
            {query && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  color: 'rgba(255,255,255,0.25)', fontSize: 16, lineHeight: 1, flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#0a1820', border: '1px solid rgba(45,82,105,0.45)',
              borderRadius: 4, boxShadow: '0 8px 28px rgba(0,0,0,0.65)',
              zIndex: 200, overflow: 'hidden',
            }}>
              {results.map(r => (
                <button
                  key={r.id}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => selectResult(r.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '9px 12px', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    transition: 'background 0.1s', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(45,82,105,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.82)',
                    flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {r.nombre}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.28)',
                    flexShrink: 0, background: 'rgba(255,255,255,0.05)',
                    padding: '2px 6px', borderRadius: 2,
                  }}>
                    {r.grupo}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Career dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            style={{ background: 'rgba(45,82,105,0.2)', border: '1px solid rgba(45,82,105,0.45)' }}
            className="flex items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[12px] text-white/75 transition-colors hover:bg-brand/30"
          >
            {carreras.find(c => c.slug === currentSlug)?.nombre ?? plan.nombre}
            <svg
              width="10" height="6" viewBox="0 0 10 6" fill="none"
              className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            >
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div
                style={{ background: '#0d1c24', border: '1px solid rgba(45,82,105,0.4)' }}
                className="absolute right-0 top-full mt-1.5 rounded-sm shadow-2xl min-w-[220px] z-50 py-1.5"
              >
                {carreras.map((c) => (
                  <div
                    key={c.slug}
                    onClick={() => { if (c.disponible) { onSelectCarrera(c.slug); setOpen(false); } }}
                    className={`flex items-center justify-between px-3 py-2 font-mono text-[12px] transition-colors ${
                      c.disponible
                        ? c.slug === currentSlug
                          ? 'cursor-pointer text-white bg-brand/20'
                          : 'cursor-pointer text-white/80 hover:bg-brand/20'
                        : 'cursor-not-allowed text-white/25'
                    }`}
                  >
                    <span>{c.nombre}</span>
                    {c.disponible ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand flex-shrink-0" />
                    ) : (
                      <span
                        style={{ background: 'rgba(45,82,105,0.15)', border: '1px solid rgba(45,82,105,0.3)' }}
                        className="rounded-sm px-1.5 py-0.5 text-[10px] text-white/25 flex-shrink-0"
                      >
                        próximamente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
