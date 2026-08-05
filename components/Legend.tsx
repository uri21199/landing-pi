export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 font-body text-[12px] text-ink/60">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-rust bg-rust-soft" />
        Necesitás aprobarla antes
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-brand bg-brand" />
        Materia seleccionada
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border-2 border-support bg-support/10" />
        Se habilita después de esta
      </span>
    </div>
  );
}
