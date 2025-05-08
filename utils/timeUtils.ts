export function formatTimeFromSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export function formatPace(secondsPer100m: number): string {
  const minutes = Math.floor(secondsPer100m / 60);
  const seconds = Math.floor(secondsPer100m % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
}

export function formatRunPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

export function parseTimeString(timeString: string): number {
  // Handles formats like "1:30:45" (1h 30m 45s) or "30:45" (30m 45s)
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // Hours, minutes, seconds
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Minutes, seconds
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    // Just seconds
    return parts[0];
  }
  
  return 0;
}

export function isValidTimeFormat(timeString: string): boolean {
  // Check if the string matches the format "MM:SS" or "H:MM:SS"
  return /^(\d+:)?[0-5]?\d:[0-5]\d$/.test(timeString);
}