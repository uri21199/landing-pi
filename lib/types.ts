// Modelo de datos genérico para cualquier plan de estudios de FIUBA.
// Pensado para que sumar una carrera nueva sea solo escribir un JSON
// con esta forma, sin tocar componentes.

export type TipoMateria = 'obligatoria' | 'electiva' | 'tif';

export type EstadoProgreso = 'regularizada' | 'aprobada';

export interface ProgresoMateria {
  estado: EstadoProgreso;
  nota?: number;
}

export interface Materia {
  id: string;
  nombre: string;
  tipo: TipoMateria;
  /** Cuatrimestre sugerido (1 = primero del CBC). Las electivas no tienen uno fijo. */
  cuatrimestre?: number;
  creditos: number;
  horasSemanales: number;
  horasTotales: number;
  /** IDs de materias que hay que tener aprobadas para cursar esta. */
  correlativas: string[];
  /** true si alcanza con tener el CBC completo (sin materia puntual). */
  requiereCBC?: boolean;
  /** Umbral de créditos acumulados requerido (ej: "118 créditos"). */
  correlativasCreditos?: number;
  /** Área temática, útil para agrupar electivas (Estructuras, Hidráulica, etc). */
  area?: string;
  /** Aclaración puntual del plan (ej: recomendaciones no obligatorias). */
  nota?: string;
}

export interface CicloCBC {
  nombreCorto: string;
  creditos: number;
  materias: Materia[];
}

export interface Cuatrimestre {
  numero: number;
  materias: Materia[];
}

export interface PlanCarrera {
  slug: string;
  nombre: string;
  planVigente: string;
  fuente: string;
  totalCreditos: number;
  duracionCuatrimestres: number;
  cbc: CicloCBC;
  cuatrimestres: Cuatrimestre[];
  electivas: Materia[];
  creditosElectivosRequeridos: number;
}
