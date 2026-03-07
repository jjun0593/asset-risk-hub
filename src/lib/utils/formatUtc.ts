export function formatUtc(date: string | number | Date): string {
  const value = new Date(date);

  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value) + " UTC"
  );
}
