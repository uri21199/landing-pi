# Planes de Estudio FIUBA — Proyecto Ingeniería

Herramienta web para explorar el plan de estudios de una carrera de la Facultad de
Ingeniería (UBA): materias por cuatrimestre, créditos y correlativas, pensada para
alguien que recién ingresa y no entiende todavía cómo se arma la carrera.

Arranca con **Ingeniería Civil (Plan 2023, Res. CD 720/23)**, con datos tomados de la
resolución oficial publicada por FIUBA. El resto de las carreras se agregan sumando un
JSON — no hace falta tocar componentes.

## Cómo se usa

Tocás cualquier materia y el plano traza en vivo:
- en **óxido**, todo lo que necesitás tener aprobado (directa o indirectamente) para
  poder cursarla,
- en **verde**, todo lo que esa materia te habilita a cursar después.

El panel de la derecha explica en texto llano los requisitos puntuales (correlativas,
CBC completo, o umbral de créditos acumulados).

## Correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`.

## Build y deploy

Genera un export 100% estático (HTML/CSS/JS, sin backend) en `/out`:

```bash
npm run build
```

- **Vercel**: importar el repo tal cual, detecta Next.js solo.
- **Netlify**: build command `npm run build`, publish directory `out`.
- **Landing de Proyecto Ingeniería**: como es estático, el contenido de `/out` se puede
  servir directamente como una sub-ruta (ej. `proyectoingenieria.com/planes`) de
  cualquier sitio, sin depender de este stack.

> Nota: `next/font/google` descarga las tipografías (Space Grotesk, Inter, IBM Plex
> Mono) durante el build, así que necesita salida a internet en el momento de buildear
> (Vercel/Netlify la tienen sin configuración extra).

## Cómo sumar una carrera nueva

1. Crear `data/carreras/<carrera>.json` con la misma forma que `civil.json` (tipos en
   `lib/types.ts`).
2. Sacar la info de la resolución oficial del plan vigente en
   `fi.uba.ar/grado/carreras/<carrera>/plan-de-estudios` (ojo: varias carreras tienen un
   plan viejo y uno 2020-2023 nuevo; siempre conviene tomar el más reciente y anotar la
   resolución en `planVigente`).
3. Sumar la carrera a la lista `carreras` en `app/page.tsx` y armar la ruta
   correspondiente (por ahora la página principal solo renderiza Civil; con más de una
   carrera conviene mover cada una a `app/<slug>/page.tsx` y usar el nav para navegar
   entre ellas).

## Estructura

```
data/carreras/civil.json   → los datos del plan (única fuente de verdad)
lib/types.ts                → forma de los datos
lib/planUtils.ts            → cálculo del grafo de correlativas (qué pide / qué habilita)
components/PlanView.tsx     → layout del plano + trazado de líneas
components/MateriaCard.tsx  → tarjeta de cada materia
components/DetailPanel.tsx  → panel de texto con el detalle de la materia elegida
```

## Fuera de alcance (a propósito)

- **Versión impresa**: la resuelve el diseño en Illustrator, este proyecto es solo la
  versión digital/web.
- **Planificador de horarios**: es una herramienta aparte del ecosistema; esto es
  únicamente un mapa de correlativas para entender la estructura de la carrera.
