export function formatDateByLocale(dateStr: string, lang: string): string {
  const date = new Date(dateStr);

  return new Intl.DateTimeFormat(lang, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
