import Link from 'next/link';

export default function Home() {
  return (
    <main className="h-screen bg-[#080f16] flex flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-[#EEF3F5] tracking-tight">
          Proyecto Ingeniería
        </h1>
        <p className="mt-2 text-[#EEF3F5]/50 font-body text-sm">
          FIUBA — Herramientas para estudiantes
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <Link
          href="/planes"
          className="flex-1 flex flex-col gap-2 p-6 rounded-xl border border-[#2d5269]/40 bg-[#0d1c24] hover:border-[#2d5269] hover:bg-[#0d1c24]/80 transition-all group"
        >
          <span className="text-2xl">📋</span>
          <span className="font-display font-semibold text-[#EEF3F5] text-lg">Planes de Estudio</span>
          <span className="text-[#EEF3F5]/40 text-sm font-body">
            Materias, créditos y correlativas de todas las carreras
          </span>
        </Link>

        <Link
          href="/mapa/"
          className="flex-1 flex flex-col gap-2 p-6 rounded-xl border border-[#2d5269]/40 bg-[#0d1c24] hover:border-[#2d5269] hover:bg-[#0d1c24]/80 transition-all group"
        >
          <span className="text-2xl">🗺️</span>
          <span className="font-display font-semibold text-[#EEF3F5] text-lg">Mapa FIUBA</span>
          <span className="text-[#EEF3F5]/40 text-sm font-body">
            Plano interactivo de la sede Paseo Colón
          </span>
        </Link>
      </div>
    </main>
  );
}
