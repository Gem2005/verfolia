/**
 * Format seconds into a human-readable time string
 * Converts to appropriate units: seconds, minutes, hours, days, months
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${Math.round(minutes * 10) / 10}m`;
  }
  
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10}h`;
  }
  
  const days = hours / 24;
  if (days < 30) {
    return `${Math.round(days * 10) / 10}d`;
  }
  
  const months = days / 30;
  return `${Math.round(months * 10) / 10}mo`;
}

/**
 * Format seconds into a detailed human-readable string
 * Examples: "45 seconds", "2.5 minutes", "1.2 hours"
 */
export function formatDurationDetailed(seconds: number): string {
  if (seconds < 60) {
    const rounded = Math.round(seconds);
    return `${rounded} second${rounded !== 1 ? 's' : ''}`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    const rounded = Math.round(minutes * 10) / 10;
    return `${rounded} minute${rounded !== 1 ? 's' : ''}`;
  }
  
  const hours = minutes / 60;
  if (hours < 24) {
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} hour${rounded !== 1 ? 's' : ''}`;
  }
  
  const days = hours / 24;
  if (days < 30) {
    const rounded = Math.round(days * 10) / 10;
    return `${rounded} day${rounded !== 1 ? 's' : ''}`;
  }
  
  const months = days / 30;
  const rounded = Math.round(months * 10) / 10;
  return `${rounded} month${rounded !== 1 ? 's' : ''}`;
}
