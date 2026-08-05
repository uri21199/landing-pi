import { Materia, PlanCarrera } from './types';

/** Todas las materias del plan en una sola lista plana (CBC + cuatrimestres + electivas). */
export function todasLasMaterias(plan: PlanCarrera): Materia[] {
  return [
    ...plan.cbc.materias,
    ...plan.cuatrimestres.flatMap((c) => c.materias),
    ...plan.electivas,
  ];
}

export function mapaPorId(plan: PlanCarrera): Map<string, Materia> {
  const mapa = new Map<string, Materia>();
  for (const m of todasLasMaterias(plan)) mapa.set(m.id, m);
  return mapa;
}

/** Créditos acumulados de todas las materias obligatorias hasta (e incluyendo) un cuatrimestre dado. */
export function creditosHastaCuatrimestre(plan: PlanCarrera, cuatrimestre: number): number {
  let total = plan.cbc.creditos;
  for (const c of plan.cuatrimestres) {
    if (c.numero <= cuatrimestre) {
      total += c.materias.reduce((acc, m) => acc + m.creditos, 0);
    }
  }
  return total;
}

/**
 * Todas las materias "aguas arriba": lo que hay que tener aprobado, directa
 * o indirectamente, para poder cursar `id`. Es el "camino de carga" hacia atrás.
 */
export function requisitosTransitivos(plan: PlanCarrera, id: string): Set<string> {
  const mapa = mapaPorId(plan);
  const visitados = new Set<string>();
  const pila = [...(mapa.get(id)?.correlativas ?? [])];
  while (pila.length) {
    const actual = pila.pop()!;
    if (visitados.has(actual)) continue;
    visitados.add(actual);
    const materia = mapa.get(actual);
    if (materia) pila.push(...materia.correlativas);
  }
  return visitados;
}

/**
 * Todas las materias "aguas abajo": lo que esta materia habilita a cursar,
 * directa o indirectamente. El "camino de carga" hacia adelante.
 */
export function habilitaTransitivo(plan: PlanCarrera, id: string): Set<string> {
  const todas = todasLasMaterias(plan);
  const visitados = new Set<string>();
  const pila = [id];
  while (pila.length) {
    const actual = pila.pop()!;
    const directas = todas.filter((m) => m.correlativas.includes(actual));
    for (const d of directas) {
      if (!visitados.has(d.id)) {
        visitados.add(d.id);
        pila.push(d.id);
      }
    }
  }
  return visitados;
}

export function nombrePorId(plan: PlanCarrera, id: string): string {
  return mapaPorId(plan).get(id)?.nombre ?? id;
}

/**
 * Materias que quedarían DIRECTAMENTE habilitadas si `seleccionId` fuera aprobada/cursada,
 * dado el progreso actual. Solo muestra las inmediatas: aquellas donde `seleccionId` es el
 * ÚNICO prerequisito faltante (todos los demás ya están en `progreso`).
 */
export function habilitaDirectas(
  plan: PlanCarrera,
  seleccionId: string,
  progreso: Map<string, { estado: string }>,
): Set<string> {
  const result = new Set<string>();
  const todas = todasLasMaterias(plan);
  const cbcMet = plan.cbc.materias.every(m => progreso.has(m.id));
  const credAcum = todas.filter(m => progreso.has(m.id)).reduce((s, m) => s + m.creditos, 0);
  for (const m of todas) {
    if (progreso.has(m.id) || m.id === seleccionId) continue;
    if (!m.correlativas.includes(seleccionId)) continue;
    const otrosMet = m.correlativas.every(cId => cId === seleccionId || progreso.has(cId));
    const cbcOk = !m.requiereCBC || cbcMet;
    const credOk = typeof m.correlativasCreditos !== 'number' || credAcum >= m.correlativasCreditos;
    if (otrosMet && cbcOk && credOk) result.add(m.id);
  }
  return result;
}

/** IDs de los prerequisitos que faltan para poder cursar `id` dado el progreso actual. */
export function prerequisitosFaltantesIds(
  plan: PlanCarrera,
  id: string,
  progreso: Map<string, { estado: string }>,
): Set<string> {
  const mapa = mapaPorId(plan);
  const materia = mapa.get(id);
  if (!materia) return new Set();
  const faltantes = new Set<string>();
  const todas = todasLasMaterias(plan);
  const cbcCompleto = plan.cbc.materias.every(m => progreso.has(m.id));
  const credAcum = todas.filter(m => progreso.has(m.id)).reduce((s, m) => s + m.creditos, 0);
  if (materia.requiereCBC && !cbcCompleto) faltantes.add('__cbc__');
  if (typeof materia.correlativasCreditos === 'number' && credAcum < materia.correlativasCreditos) {
    faltantes.add('__creditos__');
  }
  for (const cId of materia.correlativas) {
    if (!progreso.has(cId)) faltantes.add(cId);
  }
  return faltantes;
}
