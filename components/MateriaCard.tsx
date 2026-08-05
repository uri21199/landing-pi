'use client';

import { Materia } from '@/lib/types';
import clsx from 'clsx';

type Estado = 'neutral' | 'seleccionada' | 'requisito' | 'habilitada';

interface Props {
  materia: Materia;
  estado: Estado;
  onClick: () => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}

const estilosPorEstado: Record<Estado, string> = {
  neutral: 'border-brand/15 bg-white hover:border-brand/40 hover:shadow-md',
  seleccionada: 'border-brand bg-brand text-white shadow-lg scale-[1.02]',
  requisito: 'border-rust bg-rust-soft shadow-md',
  habilitada: 'border-support bg-support/10 shadow-md',
};

export default function MateriaCard({ materia, estado, onClick, registerRef }: Props) {
  const esTif = materia.tipo === 'tif';
  const esElectiva = materia.tipo === 'electiva';

  return (
    <div
      ref={(el) => registerRef(materia.id, el)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={clsx(
        'group relative cursor-pointer rounded-sm border-2 px-3 py-2.5 transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2',
        estilosPorEstado[estado]
      )}
    >
      {/* marca de esquina, como un sello de plano */}
      <span
        className={clsx(
          'absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2',
          estado === 'seleccionada' ? 'border-white/70' : 'border-brand/30'
        )}
      />
      <span
        className={clsx(
          'absolute right-0 bottom-0 h-2 w-2 border-r-2 border-b-2',
          estado === 'seleccionada' ? 'border-white/70' : 'border-brand/30'
        )}
      />

      <p
        className={clsx(
          'font-body text-[13px] leading-snug font-medium pr-1',
          estado === 'seleccionada' ? 'text-white' : 'text-ink'
        )}
      >
        {materia.nombre}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        <span
          className={clsx(
            'font-mono text-[11px] tracking-tight rounded-sm px-1 py-0.5',
            estado === 'seleccionada' ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
          )}
        >
          {materia.creditos} cr
        </span>
        {esTif && (
          <span className="font-mono text-[10px] uppercase tracking-wide text-rust">TIF</span>
        )}
        {esElectiva && materia.area && (
          <span
            className={clsx(
              'font-mono text-[10px] uppercase tracking-wide',
              estado === 'seleccionada' ? 'text-white/70' : 'text-brand/50'
            )}
          >
            {materia.area}
          </span>
        )}
      </div>
    </div>
  );
}
