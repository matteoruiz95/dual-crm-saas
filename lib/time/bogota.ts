export function getBogotaDayRangeUtc(date = new Date()) {
  const bogotaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const start = new Date(`${bogotaDate}T00:00:00-05:00`);
  const end = new Date(`${bogotaDate}T23:59:59-05:00`);

  return {
    bogotaDate,
    startUtc: start.toISOString(),
    endUtc: end.toISOString(),
  };
}
