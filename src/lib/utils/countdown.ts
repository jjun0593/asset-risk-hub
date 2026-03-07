export function formatCountdown(targetDate: string | number | Date): string {
  const targetTime = new Date(targetDate).getTime();
  const now = Date.now();

  const diffMs = targetTime - now;

  if (diffMs <= 0) {
    return "Started";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}
