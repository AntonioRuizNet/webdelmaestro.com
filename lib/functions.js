export function getSeasonalTerm(month = null) {
  const m = month ? Number(month) : new Date().getMonth() + 1;

  // 🎄 Navidad: diciembre y enero
  if (m === 11 || m === 12) return "navidad";

  // 🐣 Pascua: marzo y abril (ejemplo)
  if (m === 3 || m === 4) return "pascua";

  // 🎃 Halloween: octubre
  if (m === 10) return "halloween";

  // 🌞 Verano: junio, julio, agosto (ejemplo)
  if (m >= 6 && m <= 8) return "verano";

  // 🍁 Otoño / vuelta al cole: septiembre
  if (m === 9) return "cole";

  // Por defecto no devuelve nada especial
  return "tabla";
}
