/**
 * Configuración de las landings SEO por nivel Cambridge.
 * Cada nivel tiene su propia página en /preparacion-XX-online.
 */

export interface LevelLandingConfig {
  slug: string;
  level: string;
  levelFull: string;
  levelShort: string; // "A2 Key", "B2 First"...
  cefrLevel: string;
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  examParts: Array<{
    name: string;
    duration: string;
    description: string;
  }>;
  totalDuration: string;
  bandScore: { min: number; pass: number; top: number };
  whoIsItFor: string[];
  benefits: string[];
  gradeTable: Array<{ grade: string; score: string; description: string }>;
}

export const LEVEL_LANDINGS: Record<string, LevelLandingConfig> = {
  a2: {
    slug: "preparacion-a2-key-online",
    level: "A2",
    levelFull: "A2 Key (KET)",
    levelShort: "A2 Key",
    cefrLevel: "A2 (elemental)",
    metaTitle: "Preparación A2 Key online — Simulacros oficiales | Acertlio",
    metaDescription:
      "Prepara el examen Cambridge A2 Key online con simulacros oficiales. Interfaz Computer-Based idéntica al examen real. Corrección automática instantánea. Ideal para academias y alumnos.",
    hero: {
      kicker: "A2 Key · KET",
      title: "Prepara tu A2 Key online con simulacros oficiales",
      subtitle:
        "Todo el examen A2 Key Cambridge en un entorno idéntico al oficial: Reading, Writing, Listening y Speaking. Practica cuando quieras, recibe corrección al instante.",
    },
    examParts: [
      {
        name: "Reading & Writing",
        duration: "60 min",
        description: "7 partes de comprensión lectora y expresión escrita.",
      },
      {
        name: "Listening",
        duration: "30 min",
        description: "5 partes de comprensión oral con audios auténticos.",
      },
      {
        name: "Speaking",
        duration: "8-10 min",
        description: "Dos candidatos y dos examinadores. Práctica guiada en Acertlio.",
      },
    ],
    totalDuration: "Aprox. 2 horas total",
    bandScore: { min: 100, pass: 120, top: 150 },
    whoIsItFor: [
      "Alumnos que se preparan para el A2 Key en una academia",
      "Estudiantes que quieren certificar su A2 por su cuenta",
      "Profesores particulares que buscan simulacros oficiales para sus alumnos",
      "Colegios bilingües que preparan a sus estudiantes al A2 Key for Schools",
    ],
    benefits: [
      "Interfaz Computer-Based idéntica al examen oficial de Cambridge",
      "Corrección instantánea de Reading con nota Cambridge English Scale",
      "Rúbrica oficial en el Writing para saber cómo evalúa Cambridge",
      "Simulacros repetibles: practica cada mock las veces que necesites",
      "Estadísticas personalizadas de tu progreso por parte",
      "Sin descargas ni instalaciones: entra desde cualquier ordenador",
    ],
    gradeTable: [
      {
        grade: "Grade A",
        score: "140-150",
        description: "Nivel B1 acreditado (excede el A2)",
      },
      {
        grade: "Grade B",
        score: "133-139",
        description: "Nivel A2 con distinción",
      },
      {
        grade: "Grade C",
        score: "120-132",
        description: "Nivel A2 aprobado",
      },
      {
        grade: "Level A1",
        score: "100-119",
        description: "No aprueba A2, se certifica A1",
      },
    ],
  },
  b1: {
    slug: "preparacion-b1-preliminary-online",
    level: "B1",
    levelFull: "B1 Preliminary (PET)",
    levelShort: "B1 Preliminary",
    cefrLevel: "B1 (intermedio)",
    metaTitle:
      "Preparación B1 Preliminary online — Simulacros oficiales | Acertlio",
    metaDescription:
      "Prepara el examen Cambridge B1 Preliminary (PET) online. Simulacros con la interfaz Computer-Based oficial. Corrección automática con Cambridge English Scale y feedback pedagógico.",
    hero: {
      kicker: "B1 Preliminary · PET",
      title: "Prepara tu B1 Preliminary con simulacros oficiales",
      subtitle:
        "El examen B1 Preliminary completo en interfaz Computer-Based idéntica al oficial. Reading & Writing, Listening y Speaking. Corrección instantánea, sin espera.",
    },
    examParts: [
      {
        name: "Reading",
        duration: "45 min",
        description: "6 partes de comprensión lectora.",
      },
      {
        name: "Writing",
        duration: "45 min",
        description: "2 tareas escritas: email y artículo/relato.",
      },
      {
        name: "Listening",
        duration: "30 min",
        description: "4 partes con distintos formatos de audio.",
      },
      {
        name: "Speaking",
        duration: "12-17 min",
        description: "En parejas con dos examinadores.",
      },
    ],
    totalDuration: "Aprox. 2 horas 20 min",
    bandScore: { min: 120, pass: 140, top: 170 },
    whoIsItFor: [
      "Alumnos que preparan el B1 Preliminary en una academia",
      "Estudiantes de bachillerato que necesitan certificar B1",
      "Adultos que quieren acreditar B1 para trabajo o universidad",
      "Colegios que preparan al B1 Preliminary for Schools",
    ],
    benefits: [
      "Interfaz idéntica al Computer-Based oficial de Cambridge",
      "Corrección instantánea con nota Cambridge English Scale",
      "Rúbrica oficial de Cambridge para el Writing",
      "Feedback pedagógico: sabe dónde estás fallando y qué mejorar",
      "Repite los mocks tantas veces como quieras",
      "Simulacros construidos por profesionales con años de experiencia Cambridge",
    ],
    gradeTable: [
      {
        grade: "Grade A",
        score: "160-170",
        description: "Nivel B2 acreditado (excede el B1)",
      },
      { grade: "Grade B", score: "153-159", description: "Nivel B1 con distinción" },
      { grade: "Grade C", score: "140-152", description: "Nivel B1 aprobado" },
      {
        grade: "Level A2",
        score: "120-139",
        description: "No aprueba B1, se certifica A2",
      },
    ],
  },
  b2: {
    slug: "preparacion-b2-first-online",
    level: "B2",
    levelFull: "B2 First (FCE)",
    levelShort: "B2 First",
    cefrLevel: "B2 (intermedio alto)",
    metaTitle: "Preparación B2 First (FCE) online — Simulacros oficiales | Acertlio",
    metaDescription:
      "Prepara el examen Cambridge B2 First (FCE) online con simulacros oficiales. Reading, Use of English, Writing, Listening y Speaking en interfaz Computer-Based idéntica al examen real.",
    hero: {
      kicker: "B2 First · FCE",
      title: "Prepara tu B2 First online con simulacros oficiales",
      subtitle:
        "El B2 First completo en interfaz Computer-Based idéntica al examen real. 5 partes evaluadas con Cambridge English Scale y corrección instantánea.",
    },
    examParts: [
      {
        name: "Reading & Use of English",
        duration: "75 min",
        description: "7 partes: comprensión lectora + uso del idioma.",
      },
      {
        name: "Writing",
        duration: "80 min",
        description: "2 tareas: essay obligatorio + email/report/review/article.",
      },
      {
        name: "Listening",
        duration: "40 min",
        description: "4 partes con conversaciones y textos auténticos.",
      },
      {
        name: "Speaking",
        duration: "14 min",
        description: "En parejas con dos examinadores.",
      },
    ],
    totalDuration: "Aprox. 3 horas 30 min",
    bandScore: { min: 140, pass: 160, top: 190 },
    whoIsItFor: [
      "Estudiantes que preparan el B2 First para acceso a universidad",
      "Alumnos de academias que necesitan certificar B2",
      "Adultos que quieren certificar su nivel para oposiciones o trabajo",
      "Colegios y bachilleratos con programas B2 First for Schools",
    ],
    benefits: [
      "Interfaz Computer-Based idéntica al examen oficial",
      "Corrección automática con Cambridge English Scale",
      "Rúbrica oficial en el Writing (4 criterios × 5 puntos)",
      "Feedback pedagógico personalizado en Reading y Use of English",
      "Simulacros con dificultad calibrada al examen real",
      "Repite mocks las veces que necesites hasta dominar cada tipo de pregunta",
    ],
    gradeTable: [
      {
        grade: "Grade A",
        score: "180-190",
        description: "Nivel C1 acreditado (excede el B2)",
      },
      { grade: "Grade B", score: "173-179", description: "Nivel B2 con distinción" },
      { grade: "Grade C", score: "160-172", description: "Nivel B2 aprobado" },
      {
        grade: "Level B1",
        score: "140-159",
        description: "No aprueba B2, se certifica B1",
      },
    ],
  },
  c1: {
    slug: "preparacion-c1-advanced-online",
    level: "C1",
    levelFull: "C1 Advanced (CAE)",
    levelShort: "C1 Advanced",
    cefrLevel: "C1 (avanzado)",
    metaTitle:
      "Preparación C1 Advanced (CAE) online — Simulacros oficiales | Acertlio",
    metaDescription:
      "Prepara el examen Cambridge C1 Advanced (CAE) online. Simulacros con la interfaz Computer-Based oficial, corrección automática Cambridge English Scale y feedback pedagógico.",
    hero: {
      kicker: "C1 Advanced · CAE",
      title: "Prepara tu C1 Advanced con simulacros oficiales",
      subtitle:
        "El C1 Advanced completo en interfaz Computer-Based idéntica al examen real. Reading, Use of English, Writing, Listening y Speaking evaluados con Cambridge English Scale.",
    },
    examParts: [
      {
        name: "Reading & Use of English",
        duration: "90 min",
        description: "8 partes: comprensión lectora + uso avanzado del idioma.",
      },
      {
        name: "Writing",
        duration: "90 min",
        description:
          "2 tareas: essay + una entre proposal, report, review o letter.",
      },
      {
        name: "Listening",
        duration: "40 min",
        description: "4 partes con audios auténticos de nivel avanzado.",
      },
      {
        name: "Speaking",
        duration: "15 min",
        description: "En parejas con dos examinadores.",
      },
    ],
    totalDuration: "Aprox. 4 horas total",
    bandScore: { min: 160, pass: 180, top: 210 },
    whoIsItFor: [
      "Estudiantes que necesitan C1 para máster o Erasmus",
      "Profesores en formación que necesitan acreditar C1",
      "Profesionales que quieren certificar nivel avanzado",
      "Alumnos de academias con clases enfocadas al CAE",
    ],
    benefits: [
      "Interfaz Computer-Based idéntica al examen oficial",
      "Corrección automática con Cambridge English Scale (160-210)",
      "Rúbrica oficial Cambridge para el Writing",
      "Feedback pedagógico: sabe qué grammar/vocabulary trabajar",
      "Simulacros calibrados al nivel real del examen C1",
      "Repite los mocks tantas veces como necesites",
    ],
    gradeTable: [
      {
        grade: "Grade A",
        score: "200-210",
        description: "Nivel C2 acreditado (excede el C1)",
      },
      { grade: "Grade B", score: "193-199", description: "Nivel C1 con distinción" },
      { grade: "Grade C", score: "180-192", description: "Nivel C1 aprobado" },
      {
        grade: "Level B2",
        score: "160-179",
        description: "No aprueba C1, se certifica B2",
      },
    ],
  },
  c2: {
    slug: "preparacion-c2-proficiency-online",
    level: "C2",
    levelFull: "C2 Proficiency (CPE)",
    levelShort: "C2 Proficiency",
    cefrLevel: "C2 (dominio)",
    metaTitle:
      "Preparación C2 Proficiency (CPE) online — Simulacros oficiales | Acertlio",
    metaDescription:
      "Prepara el examen Cambridge C2 Proficiency (CPE) online con simulacros oficiales. El nivel más alto de Cambridge en interfaz Computer-Based con corrección automática.",
    hero: {
      kicker: "C2 Proficiency · CPE",
      title: "Prepara tu C2 Proficiency online con simulacros oficiales",
      subtitle:
        "El nivel más alto de Cambridge en interfaz Computer-Based idéntica al examen real. Reading, Use of English, Writing, Listening y Speaking con corrección instantánea.",
    },
    examParts: [
      {
        name: "Reading & Use of English",
        duration: "90 min",
        description: "7 partes de nivel máximo Cambridge.",
      },
      {
        name: "Writing",
        duration: "90 min",
        description: "2 tareas: essay obligatorio + una a elegir.",
      },
      {
        name: "Listening",
        duration: "40 min",
        description: "4 partes con textos auténticos de nivel proficiency.",
      },
      {
        name: "Speaking",
        duration: "16 min",
        description: "En parejas con dos examinadores.",
      },
    ],
    totalDuration: "Aprox. 4 horas total",
    bandScore: { min: 180, pass: 200, top: 230 },
    whoIsItFor: [
      "Traductores e intérpretes que certifican dominio nativo",
      "Profesores de inglés que necesitan CPE",
      "Alumnos que buscan la máxima acreditación Cambridge",
      "Profesionales en entornos internacionales de alto nivel",
    ],
    benefits: [
      "Interfaz Computer-Based idéntica al examen oficial",
      "Corrección automática con Cambridge English Scale (180-230)",
      "Rúbrica oficial Cambridge del Writing",
      "Feedback pedagógico específico para nivel proficiency",
      "Contenido calibrado al nivel más alto del examen real",
      "Repite mocks tantas veces como necesites",
    ],
    gradeTable: [
      { grade: "Grade A", score: "220-230", description: "Nivel C2 con la máxima distinción" },
      { grade: "Grade B", score: "213-219", description: "Nivel C2 con distinción" },
      { grade: "Grade C", score: "200-212", description: "Nivel C2 aprobado" },
      {
        grade: "Level C1",
        score: "180-199",
        description: "No aprueba C2, se certifica C1",
      },
    ],
  },
};

export const LANDING_SLUGS = Object.values(LEVEL_LANDINGS).map((l) => l.slug);
