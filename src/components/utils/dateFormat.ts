const DATE_MONTH = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

export function parseDateTime(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")} de ${DATE_MONTH[date.getMonth()]}, ${date.getFullYear()}`;
}

export default {
  parseDateTime,
}
