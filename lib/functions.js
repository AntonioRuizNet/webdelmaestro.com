export function getSeasonalTerm(month = null) {
  const m = month ? Number(month) : new Date().getMonth() + 1;

  // Función para elegir un término al azar
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Diccionario de términos por mes
  const terms = {
    1: ["multiplicaciones", "cuerpo humano"],
    2: ["solar", "emociones"],
    3: ["figuras", "recicla"],
    4: ["ciclo del agua", "vertebrados"],
    5: ["plantas", "saludable", "electricidad", "aparato"],
    6: ["tabla", "ortografía"],
    7: ["tabla"],
    8: ["escolar"],
    9: ["sumas y restas"],
    10: ["halloween", "sentido", "relieve"],
    11: ["aparato"],
    12: ["navidad"],
  };

  // Si existe el mes en el diccionario → devuelve un término al azar
  if (terms[m]) return pick(terms[m]);

  // Valor por defecto
  return "recursos";
}
