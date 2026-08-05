// data.js — Base de datos del Mapa FIUBA (Sede Paseo Colón)

const PISOS = {
  ss: { nombre: "Subsuelo",    svg: "svgs/subsuelo.svg",    orden: 0 },
  pb: { nombre: "Planta Baja", svg: "svgs/planta-baja.svg", orden: 1 },
  p1: { nombre: "1er Piso",    svg: "svgs/piso-1.svg",      orden: 2 },
  p2: { nombre: "2do Piso",    svg: "svgs/piso-2.svg",      orden: 3 },
  p3: { nombre: "3er Piso",    svg: "svgs/piso-3.svg",      orden: 4 },
  p4: { nombre: "4to Piso",    svg: "svgs/piso-4.svg",      orden: 5 },
  p5: { nombre: "5to Piso",    svg: "svgs/piso-5.svg",      orden: 6 },
};

const ESPACIOS = [
  // ─────────────────────────────────────────
  // SUBSUELO
  // ─────────────────────────────────────────
  { svgId: "aula_e1",  nombre: "Aula E1",  tipo: "aula", piso: "ss", sector: "Sur-Oeste",    palabrasClave: ["e1","aula e1"] },
  { svgId: "aula_e3",  nombre: "Aula E3",  tipo: "aula", piso: "ss", sector: "Sur-Oeste",    palabrasClave: ["e3","aula e3"] },
  { svgId: "aula_e5",  nombre: "Aula E5",  tipo: "aula", piso: "ss", sector: "Ala Oeste",    palabrasClave: ["e5","aula e5"] },
  { svgId: "aula_e7",  nombre: "Aula E7",  tipo: "aula", piso: "ss", sector: "Centro-Oeste", palabrasClave: ["e7","aula e7"] },
  { svgId: "aula_e8",  nombre: "Aula E8",  tipo: "aula", piso: "ss", sector: "Sur-Este",     palabrasClave: ["e8","aula e8","electronica","robotica"] },
  { svgId: "aula_e9",  nombre: "Aula E9",  tipo: "aula", piso: "ss", sector: "Sur-Centro",   palabrasClave: ["e9","aula e9"] },
  { svgId: "aula_e10", nombre: "Aula E10", tipo: "aula", piso: "ss", sector: "Sur-Este",     palabrasClave: ["e10","aula e10"] },
  { svgId: "aula_e14", nombre: "Aula E14", tipo: "aula", piso: "ss", sector: "Centro-Este",  palabrasClave: ["e14","aula e14"] },
  { svgId: "aula_e16", nombre: "Aula E16", tipo: "aula", piso: "ss", sector: "Centro-Este",  palabrasClave: ["e16","aula e16"] },
  { svgId: "aula_e29", nombre: "Aula E29", tipo: "aula", piso: "ss", sector: "Centro-Oeste", palabrasClave: ["e29","aula e29"] },
  { svgId: "aula_e32", nombre: "Aula E32", tipo: "aula", piso: "ss", sector: "Norte-Centro", palabrasClave: ["e32","aula e32"] },
  { svgId: "aula_e33", nombre: "Aula E33", tipo: "aula", piso: "ss", sector: "Norte-Este",   palabrasClave: ["e33","aula e33"] },
  { svgId: "espacio_comedor",               nombre: "Comedor",           tipo: "espacio", piso: "ss", sector: "Ala Este",    palabrasClave: ["comedor","buffet","comer","almorzar","comida","cafeteria"] },
  { svgId: "espacio_deptoMecanicaAplicada", nombre: "Mecánica Aplicada", tipo: "espacio", piso: "ss", sector: "Centro-Este", palabrasClave: ["mecanica aplicada","dpto mecanica","fluido","combustion"] },

  // ─────────────────────────────────────────
  // PLANTA BAJA
  // ─────────────────────────────────────────
  { svgId: "entrada",            nombre: "Entrada / Salida Principal",          tipo: "otro",     piso: "pb", sector: "Sur-Centro",  palabrasClave: ["entrada","salida","acceso","ingreso","porteria","hall central"] },
  { svgId: "salon-polideportivo",nombre: "Salón Polideportivo",                 tipo: "otro",     piso: "pb", sector: "Norte-Centro",palabrasClave: ["polideportivo","salon","deporte","deportivo","gimnasio","salon polideportivo"] },
  { svgId: "salon-actos",        nombre: "Salón de Actos",                      tipo: "otro",     piso: "pb", sector: "Centro-Oeste",palabrasClave: ["salon de actos","actos","auditorio","conferencias","eventos"] },
  { svgId: "mesa-entradas",      nombre: "Mesa de Entradas",                    tipo: "tramites", piso: "pb", sector: "Centro-Este", palabrasClave: ["mesa de entradas","entradas","tramites","notas","certificado","constancia","expediente"] },
  { svgId: "mesa-proyecto-ing",  nombre: "Mesa de Proyecto Ingeniería",      tipo: "especial", piso: "pb", sector: "Centro",      palabrasClave: ["mesa de proyecto","proyecto ingenieria","mesa proyecto","pi","proyecto final","tp final"] },
  { svgId: "espacio_SecretariaAdministrativa", nombre: "Secretaría Administrativa",    tipo: "espacio", piso: "pb", sector: "Sur-Centro",  palabrasClave: ["secretaria administrativa","administrativa"] },
  { svgId: "espacio_SecretariaAcademica",     nombre: "Secretaría Académica",          tipo: "espacio", piso: "pb", sector: "Sur-Este",    palabrasClave: ["secretaria academica","secretaria","academica","tramites","equivalencias"] },
  { svgId: "espacio_DeptoDeAlumnos",          nombre: "Admisión / Dpto. de Alumnos",   tipo: "espacio", piso: "pb", sector: "Centro-Este", palabrasClave: ["admision","alumnos","departamento alumnos","inscripcion","ingresantes"] },
  { svgId: "espacio_Fotocopiadora",           nombre: "Fotocopiadora",                 tipo: "espacio", piso: "pb", sector: "Centro-Este", palabrasClave: ["fotocopiadora","fotocopias","copias","impresiones"] },
  { svgId: "espacio_DeptoDeportes",           nombre: "DPTO Deporte",                  tipo: "espacio", piso: "pb", sector: "Centro-Este", palabrasClave: ["deporte","deportes","depto deporte","actividad fisica"] },
  { svgId: "espacio_ConsejoEstudiantil",      nombre: "Consejo Estudiantil",           tipo: "espacio", piso: "pb", sector: "Centro",      palabrasClave: ["consejo","estudiantil","consejo estudiantil","agrupacion"] },
  { svgId: "espacio_SalonDeActos",            nombre: "Salón de Actos",                tipo: "espacio", piso: "pb", sector: "Centro-Oeste",palabrasClave: ["salon de actos","actos","auditorio","conferencias","eventos"] },
  { svgId: "espacio_CEI",                     nombre: "CEI — Centro de Estudiantes",   tipo: "espacio", piso: "pb", sector: "Norte-Oeste", palabrasClave: ["cei","centro estudiantes","agrupacion","centro de estudiantes"] },
  { svgId: "espacio_SalaDePC",                nombre: "Sala de PC",                    tipo: "espacio", piso: "pb", sector: "Norte-Oeste", palabrasClave: ["sala pc","computadoras","sala de computacion"] },
  { svgId: "espacio_SalonPolideportivo",      nombre: "Salón Polideportivo",           tipo: "espacio", piso: "pb", sector: "Norte-Centro",palabrasClave: ["polideportivo","salon","deporte","deportivo","gimnasio"] },
  { svgId: "banio_damas",                     nombre: "Baño Damas — Planta Baja",      tipo: "bano",    piso: "pb", sector: "Centro-Oeste",palabrasClave: ["baño","damas","mujeres","sanitario","planta baja","pb"] },
  { svgId: "banio_caballeros",                nombre: "Baño Caballeros — Planta Baja", tipo: "bano",    piso: "pb", sector: "Centro-Este", palabrasClave: ["baño","hombres","caballeros","sanitario","planta baja","pb"] },

  // ─────────────────────────────────────────
  // PISO 1
  // ─────────────────────────────────────────
  { svgId: "aula_103",  nombre: "Aula 103", tipo: "aula", piso: "p1", sector: "Centro",       palabrasClave: ["103","aula 103"] },
  { svgId: "aula_105",  nombre: "Aula 105", tipo: "aula", piso: "p1", sector: "Centro-Oeste", palabrasClave: ["105","aula 105"] },
  { svgId: "aula_107",  nombre: "Aula 107", tipo: "aula", piso: "p1", sector: "Ala Oeste",    palabrasClave: ["107","aula 107"] },
  { svgId: "aula_l1",   nombre: "Aula L1",  tipo: "aula", piso: "p1", sector: "Sur-Este",     palabrasClave: ["l1","aula l1"] },
  { svgId: "aula_l2",   nombre: "Aula L2",  tipo: "aula", piso: "p1", sector: "Sur-Este",     palabrasClave: ["l2","aula l2"] },
  { svgId: "aula_l3",   nombre: "Aula L3",  tipo: "aula", piso: "p1", sector: "Sur-Este",     palabrasClave: ["l3","aula l3"] },
  { svgId: "aula_l5",   nombre: "Aula L5",  tipo: "aula", piso: "p1", sector: "Ala Este",     palabrasClave: ["l5","aula l5"] },
  { svgId: "aula_l6",   nombre: "Aula L6",  tipo: "aula", piso: "p1", sector: "Ala Este",     palabrasClave: ["l6","aula l6"] },
  { svgId: "aula_l7",   nombre: "Aula L7",  tipo: "aula", piso: "p1", sector: "Ala Este",     palabrasClave: ["l7","aula l7"] },
  { svgId: "aula_l9",   nombre: "Aula L9",  tipo: "aula", piso: "p1", sector: "Ala Este",     palabrasClave: ["l9","aula l9"] },
  { svgId: "aula_l10",  nombre: "Aula L10", tipo: "aula", piso: "p1", sector: "Norte-Este",   palabrasClave: ["l10","aula l10"] },
  { svgId: "aula_l11",  nombre: "Aula L11", tipo: "aula", piso: "p1", sector: "Norte-Este",   palabrasClave: ["l11","aula l11"] },
  { svgId: "aula_l13",  nombre: "Aula L13", tipo: "aula", piso: "p1", sector: "Norte-Este",   palabrasClave: ["l13","aula l13"] },
  { svgId: "aula_l14",  nombre: "Aula L14", tipo: "aula", piso: "p1", sector: "Centro-Este",  palabrasClave: ["l14","aula l14"] },
  { svgId: "laboratorio_labi",                    nombre: "LABI",                           tipo: "laboratorio", piso: "p1", sector: "Centro-Este",  palabrasClave: ["labi","laboratorio integrado"] },
  { svgId: "espacio_DeptoMatematica",             nombre: "DPTO Matemática",                tipo: "espacio",     piso: "p1", sector: "Ala Oeste",    palabrasClave: ["matematica","dpto matematica","departamento matematica","calculo"] },
  { svgId: "espacio_SecretariaExtensionUniversitaria", nombre: "Sec. de Extensión Universitaria", tipo: "espacio", piso: "p1", sector: "Centro-Oeste", palabrasClave: ["extension","universitaria","secretaria extension"] },
  { svgId: "espacio_DeptoElectronica",            nombre: "DPTO Electrónica",               tipo: "espacio",     piso: "p1", sector: "Sur-Este",     palabrasClave: ["electronica","dpto electronica","departamento electronica"] },
  { svgId: "banio_damas",       nombre: "Baño Damas — 1er Piso",     tipo: "bano", piso: "p1", sector: "Centro-Oeste", palabrasClave: ["baño","damas","mujeres","1er piso","p1"] },
  { svgId: "banio_caballeros",  nombre: "Baño Caballeros — 1er Piso", tipo: "bano", piso: "p1", sector: "Norte-Este",  palabrasClave: ["baño","hombres","caballeros","1er piso","p1"] },

  // ─────────────────────────────────────────
  // PISO 2
  // ─────────────────────────────────────────
  { svgId: "aula_201",                     nombre: "Aula 201",              tipo: "aula",        piso: "p2", sector: "Ala Oeste",    palabrasClave: ["201","aula 201"] },
  { svgId: "aula_200",                     nombre: "Aula 200",              tipo: "aula",        piso: "p2", sector: "Sur-Centro",   palabrasClave: ["200","aula 200"] },
  { svgId: "aula_202",                     nombre: "Aula 202",              tipo: "aula",        piso: "p2", sector: "Centro-Este",  palabrasClave: ["202","aula 202"] },
  { svgId: "aula_203",                     nombre: "Aula 203",              tipo: "aula",        piso: "p2", sector: "Sur-Oeste",    palabrasClave: ["203","aula 203"] },
  { svgId: "aula_237",                     nombre: "Aula 237",              tipo: "aula",        piso: "p2", sector: "Centro-Oeste", palabrasClave: ["237","aula 237"] },
  { svgId: "aula_221",                     nombre: "Aula 221",              tipo: "aula",        piso: "p2", sector: "Norte-Centro", palabrasClave: ["221","aula 221"] },
  { svgId: "aula_222",                     nombre: "Aula 222",              tipo: "aula",        piso: "p2", sector: "Norte-Centro", palabrasClave: ["222","aula 222"] },
  { svgId: "aula_211A",                    nombre: "Aula 211A",             tipo: "aula",        piso: "p2", sector: "Norte-Este",   palabrasClave: ["211a","aula 211a","211 a"] },
  { svgId: "aula_211B",                    nombre: "Aula 211B",             tipo: "aula",        piso: "p2", sector: "Norte-Este",   palabrasClave: ["211b","aula 211b","211 b"] },
  { svgId: "aula_211C",                    nombre: "Aula 211C",             tipo: "aula",        piso: "p2", sector: "Norte-Este",   palabrasClave: ["211c","aula 211c","211 c"] },
  { svgId: "laboratorio_LabIFisicaI",      nombre: "Lab Física I (A)",      tipo: "laboratorio", piso: "p2", sector: "Ala Este",     palabrasClave: ["fisica 1","fisica i","laboratorio fisica","lab fisica"] },
  { svgId: "laboratorio_LabIIFisicaI",     nombre: "Lab Física I (B)",      tipo: "laboratorio", piso: "p2", sector: "Ala Este",     palabrasClave: ["fisica 1","fisica i","laboratorio fisica"] },
  { svgId: "laboratorio_LabIFisicaII",     nombre: "Lab Física II (A)",     tipo: "laboratorio", piso: "p2", sector: "Ala Oeste",    palabrasClave: ["fisica 2","fisica ii","laboratorio fisica"] },
  { svgId: "laboratorio_LabIIFisicaII",    nombre: "Lab Física II (B)",     tipo: "laboratorio", piso: "p2", sector: "Ala Oeste",    palabrasClave: ["fisica 2","fisica ii","laboratorio fisica"] },
  { svgId: "laboratorio_LabIIIFisicaII",   nombre: "Lab Física II (C)",     tipo: "laboratorio", piso: "p2", sector: "Ala Oeste",    palabrasClave: ["fisica 2","fisica ii","laboratorio fisica"] },
  { svgId: "laboratorio_LabIFisicaIII",    nombre: "Lab Física III (A)",    tipo: "laboratorio", piso: "p2", sector: "Sur-Oeste",    palabrasClave: ["fisica 3","fisica iii","laboratorio fisica"] },
  { svgId: "laboratorio_LabIIFisicaIII",   nombre: "Lab Física III (B)",    tipo: "laboratorio", piso: "p2", sector: "Sur-Oeste",    palabrasClave: ["fisica 3","fisica iii","laboratorio fisica"] },
  { svgId: "laboratorio_ElectroOptica",    nombre: "Lab Electro-Óptica",    tipo: "laboratorio", piso: "p2", sector: "Centro-Este",  palabrasClave: ["electro optica","optica","laboratorio optica"] },
  { svgId: "laboratorio_laser",            nombre: "Lab Láser",             tipo: "laboratorio", piso: "p2", sector: "Centro",       palabrasClave: ["laser","laboratorio laser"] },
  { svgId: "espacio_DeptoFisica",          nombre: "DPTO Física",           tipo: "espacio",     piso: "p2", sector: "Norte-Este",   palabrasClave: ["fisica","dpto fisica","departamento fisica"] },
  { svgId: "banio_damas",                  nombre: "Baño Damas — 2do Piso", tipo: "bano",        piso: "p2", sector: "Centro",       palabrasClave: ["baño","damas","mujeres","2do piso","p2"] },
  { svgId: "banio_caballeros",             nombre: "Baño Caballeros — 2do Piso", tipo: "bano",   piso: "p2", sector: "Centro-Este",  palabrasClave: ["baño","hombres","caballeros","2do piso","p2"] },

  // ─────────────────────────────────────────
  // PISO 3
  // ─────────────────────────────────────────
  { svgId: "espacio_biblioteca",           nombre: "Biblioteca Central",    tipo: "espacio",     piso: "p3", sector: "Norte",        palabrasClave: ["biblioteca","libros","prestar","estudio","biblioteca central"] },
  { svgId: "aula_301",                     nombre: "Aula 301",              tipo: "aula",        piso: "p3", sector: "Centro-Oeste", palabrasClave: ["301","aula 301"] },
  { svgId: "aula_302",                     nombre: "Aula 302",              tipo: "aula",        piso: "p3", sector: "Ala Este",     palabrasClave: ["302","aula 302"] },
  { svgId: "aula_303",                     nombre: "Aula 303",              tipo: "aula",        piso: "p3", sector: "Ala Oeste",    palabrasClave: ["303","aula 303"] },
  { svgId: "aula_304",                     nombre: "Aula 304",              tipo: "aula",        piso: "p3", sector: "Sur-Este",     palabrasClave: ["304","aula 304"] },
  { svgId: "aula_305",                     nombre: "Aula 305",              tipo: "aula",        piso: "p3", sector: "Ala Oeste",    palabrasClave: ["305","aula 305"] },
  { svgId: "aula_310",                     nombre: "Aula 310",              tipo: "aula",        piso: "p3", sector: "Sur-Este",     palabrasClave: ["310","aula 310"] },
  { svgId: "aula_313",                     nombre: "Aula 313",              tipo: "aula",        piso: "p3", sector: "Sur-Oeste",    palabrasClave: ["313","aula 313"] },
  { svgId: "aula_319",                     nombre: "Aula 319",              tipo: "aula",        piso: "p3", sector: "Sur-Centro",   palabrasClave: ["319","aula 319"] },
  { svgId: "banio_damas",                  nombre: "Baño Damas — 3er Piso", tipo: "bano",        piso: "p3", sector: "Centro",       palabrasClave: ["baño","damas","mujeres","3er piso","p3"] },
  { svgId: "banio_caballeros",             nombre: "Baño Caballeros — 3er Piso", tipo: "bano",   piso: "p3", sector: "Centro-Este",  palabrasClave: ["baño","hombres","caballeros","3er piso","p3"] },

  // ─────────────────────────────────────────
  // PISO 4
  // ─────────────────────────────────────────
  { svgId: "aula_403",                   nombre: "Aula 403",                    tipo: "aula",    piso: "p4", sector: "Ala Oeste",    palabrasClave: ["403","aula 403"] },
  { svgId: "aula_401",                   nombre: "Aula 401",                    tipo: "aula",    piso: "p4", sector: "Centro-Oeste", palabrasClave: ["401","aula 401"] },
  { svgId: "aula_407",                   nombre: "Aula 407",                    tipo: "aula",    piso: "p4", sector: "Centro-Oeste", palabrasClave: ["407","aula 407"] },
  { svgId: "aula_405",                   nombre: "Aula 405",                    tipo: "aula",    piso: "p4", sector: "Ala Oeste",    palabrasClave: ["405","aula 405"] },
  { svgId: "aula_411",                   nombre: "Aula 411",                    tipo: "aula",    piso: "p4", sector: "Sur-Oeste",    palabrasClave: ["411","aula 411"] },
  { svgId: "aula_417",                   nombre: "Aula 417",                    tipo: "aula",    piso: "p4", sector: "Centro",       palabrasClave: ["417","aula 417"] },
  { svgId: "aula_400",                   nombre: "Aula 400",                    tipo: "aula",    piso: "p4", sector: "Sur-Centro",   palabrasClave: ["400","aula 400"] },
  { svgId: "aula_408",                   nombre: "Aula 408",                    tipo: "aula",    piso: "p4", sector: "Sur-Centro",   palabrasClave: ["408","aula 408"] },
  { svgId: "aula_422",                   nombre: "Aula 422",                    tipo: "aula",    piso: "p4", sector: "Centro",       palabrasClave: ["422","aula 422"] },
  { svgId: "aula_412",                   nombre: "Aula 412",                    tipo: "aula",    piso: "p4", sector: "Sur-Este",     palabrasClave: ["412","aula 412"] },
  { svgId: "aula_416",                   nombre: "Aula 416",                    tipo: "aula",    piso: "p4", sector: "Sur-Este",     palabrasClave: ["416","aula 416"] },
  { svgId: "aula_414",                   nombre: "Aula 414",                    tipo: "aula",    piso: "p4", sector: "Sur-Este",     palabrasClave: ["414","aula 414"] },
  { svgId: "aula_402",                   nombre: "Aula 402",                    tipo: "aula",    piso: "p4", sector: "Centro-Este",  palabrasClave: ["402","aula 402"] },
  { svgId: "aula_430",                   nombre: "Aula 430",                    tipo: "aula",    piso: "p4", sector: "Centro-Este",  palabrasClave: ["430","aula 430"] },
  { svgId: "bedelia",                    nombre: "Bedería",                     tipo: "espacio", piso: "p4", sector: "Ala Oeste",    palabrasClave: ["bederia","bedería","constancias","tramites","materias","libretas","regularidades"] },
  { svgId: "espacio_DeptoIngSanitaria",  nombre: "DPTO Ing. Sanitaria",         tipo: "espacio", piso: "p4", sector: "Ala Oeste",    palabrasClave: ["sanitaria","ing sanitaria","departamento sanitaria"] },
  { svgId: "espacio_Inst.Ing.Biomedica", nombre: "Inst. Ing. Biomédica",        tipo: "espacio", piso: "p4", sector: "Ala Oeste",    palabrasClave: ["biomedica","biomedico","ing biomedica","instituto biomedica"] },
  { svgId: "espacio_DeptoNaval",         nombre: "DPTO Naval",                  tipo: "espacio", piso: "p4", sector: "Sur-Este",     palabrasClave: ["naval","dpto naval","departamento naval","ing naval"] },
  { svgId: "espacio_DeptoComputacion",   nombre: "DPTO Computación",            tipo: "espacio", piso: "p4", sector: "Ala Este",     palabrasClave: ["computacion","sistemas","dpto computacion","departamento computacion"] },
  { svgId: "banio_damas",                nombre: "Baño Damas — 4to Piso",       tipo: "bano",    piso: "p4", sector: "Centro-Oeste", palabrasClave: ["baño","damas","mujeres","4to piso","p4"] },
  { svgId: "banio_caballeros",           nombre: "Baño Caballeros — 4to Piso",  tipo: "bano",    piso: "p4", sector: "Centro-Este",  palabrasClave: ["baño","hombres","caballeros","4to piso","p4"] },

  // ─────────────────────────────────────────
  // PISO 5
  // ─────────────────────────────────────────
  { svgId: "aula_500",                     nombre: "Aula 500",               tipo: "aula",        piso: "p5", sector: "Sur-Centro",   palabrasClave: ["500","aula 500"] },
  { svgId: "aula_501",                     nombre: "Aula 501",               tipo: "aula",        piso: "p5", sector: "Norte-Centro", palabrasClave: ["501","aula 501"] },
  { svgId: "aula_502",                     nombre: "Aula 502",               tipo: "aula",        piso: "p5", sector: "Norte-Centro", palabrasClave: ["502","aula 502"] },
  { svgId: "aula_503",                     nombre: "Aula 503",               tipo: "aula",        piso: "p5", sector: "Ala Oeste",    palabrasClave: ["503","aula 503"] },
  { svgId: "aula_504",                     nombre: "Aula 504",               tipo: "aula",        piso: "p5", sector: "Ala Este",     palabrasClave: ["504","aula 504"] },
  { svgId: "aula_505",                     nombre: "Aula 505",               tipo: "aula",        piso: "p5", sector: "Sur-Oeste",    palabrasClave: ["505","aula 505"] },
  { svgId: "aula_506",                     nombre: "Aula 506",               tipo: "aula",        piso: "p5", sector: "Sur-Centro",   palabrasClave: ["506","aula 506"] },
  { svgId: "aula_507",                     nombre: "Aula 507",               tipo: "aula",        piso: "p5", sector: "Sur-Oeste",    palabrasClave: ["507","aula 507"] },
  { svgId: "aula_509",                     nombre: "Aula 509",               tipo: "aula",        piso: "p5", sector: "Sur-Oeste",    palabrasClave: ["509","aula 509"] },
  { svgId: "aula_510",                     nombre: "Aula 510",               tipo: "aula",        piso: "p5", sector: "Sur-Centro",   palabrasClave: ["510","aula 510"] },
  { svgId: "aula_512",                     nombre: "Aula 512",               tipo: "aula",        piso: "p5", sector: "Sur-Este",     palabrasClave: ["512","aula 512"] },
  { svgId: "laboratorio_QuimicaOrganica",  nombre: "Lab Química Orgánica",   tipo: "laboratorio", piso: "p5", sector: "Norte-Oeste",  palabrasClave: ["quimica organica","organica","quimica"] },
  { svgId: "laboratorio_QuimicaAnalitica", nombre: "Lab Química Analítica",  tipo: "laboratorio", piso: "p5", sector: "Norte-Este",   palabrasClave: ["quimica analitica","analitica","quimica"] },
  { svgId: "espacio_DeptoQuimica",         nombre: "DPTO Química",           tipo: "espacio",     piso: "p5", sector: "Ala Este",     palabrasClave: ["dpto quimica","departamento quimica","quimica"] },
  { svgId: "banio_damas",                  nombre: "Baño Damas — 5to Piso",  tipo: "bano",        piso: "p5", sector: "Centro",       palabrasClave: ["baño","damas","mujeres","5to piso","p5"] },
  { svgId: "banio_caballeros",             nombre: "Baño Caballeros — 5to Piso", tipo: "bano",    piso: "p5", sector: "Centro",       palabrasClave: ["baño","hombres","caballeros","5to piso","p5"] },
];

// ─────────────────────────────────────────
// FILTROS RÁPIDOS
// tipo/tipos debe coincidir con campo 'tipo' de ESPACIOS
// ─────────────────────────────────────────
const FILTROS_RAPIDOS = {
  banos:          { label: "🚻 Baños",           tipo:  "bano"      },
  comedor:        { label: "🍽️ Comedor",          tipo:  "comedor"   },
  biblioteca:     { label: "📚 Biblioteca",       tipo:  "biblioteca"},
  tramites:       { label: "📋 Trámites",         tipo:  "tramites"  },
  "mesa-proyecto":{ label: "⚙️ Mesa de Proyecto", tipo:  "especial"  },
};
