export const GENERADORES = [
  {
    slug: "fichas-matematicas",
    title: "Generador de fichas de matemáticas",
    icon: "🧮",
    description: "Fichas imprimibles para practicar operaciones.",
    variants: [
      { slug: "sumas", title: "Sumas" },
      { slug: "restas", title: "Restas" },
      { slug: "multiplicaciones", title: "Multiplicaciones" },
    ],
  },
  {
    slug: "caligrafia",
    title: "Generador de caligrafía",
    icon: "✍️",
    description: "Plantillas de copia y escritura personalizada.",
    variants: [
      { slug: "trazos", title: "Trazos" },
      { slug: "copiados", title: "Copiados" },
    ],
  },
  /* {
    slug: "silabas",
    title: "Generador de sílabas",
    icon: "🔤",
    description: "Ejercicios de sílabas por dificultad.",
    variants: [
      { slug: "simples", title: "Sílabas simples" },
      { slug: "inversas", title: "Sílabas inversas" },
      { slug: "mixtas", title: "Sílabas mixtas" },
    ],
  },
  {
    slug: "palabras",
    title: "Generador de palabras",
    icon: "📚",
    description: "Listados de lectura por dificultad.",
    variants: [
      { slug: "faciles", title: "Palabras fáciles" },
      { slug: "medias", title: "Palabras medias" },
      { slug: "dificiles", title: "Palabras difíciles" },
    ],
  },
  {
    slug: "frases",
    title: "Generador de frases",
    icon: "📝",
    description: "Frases para copiar, ordenar o completar.",
    variants: [
      { slug: "copiar", title: "Copiar frases" },
      { slug: "ordenar", title: "Ordenar frases" },
      { slug: "completar", title: "Completar frases" },
    ],
  },
  {
    slug: "multiplicaciones",
    title: "Practicador de multiplicaciones",
    icon: "⚡",
    description: "Modos de práctica para tablas de multiplicar.",
    variants: [
      { slug: "modo-lento", title: "Modo lento" },
      { slug: "modo-rapido", title: "Modo rápido" },
      { slug: "examen", title: "Examen" },
    ],
  },
  {
    slug: "adivina-palabra",
    title: "Mini juego tipo adivina palabra",
    icon: "🎮",
    description: "Juego educativo de vocabulario.",
    variants: [
      { slug: "facil", title: "Fácil" },
      { slug: "medio", title: "Medio" },
      { slug: "dificil", title: "Difícil" },
    ],
  },*/
];

export function getGeneratorBySlug(slug) {
  return GENERADORES.find((generator) => generator.slug === slug);
}

export function getVariantBySlug(generator, variantSlug) {
  return generator?.variants?.find((variant) => variant.slug === variantSlug);
}
