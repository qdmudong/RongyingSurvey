export function formatDuration(totalSeconds?: number | null) {
  if (typeof totalSeconds !== "number" || !Number.isFinite(totalSeconds)) {
    return "未记录";
  }

  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}秒`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}分钟`;
  }

  return `${minutes}分钟${remainingSeconds}秒`;
}
