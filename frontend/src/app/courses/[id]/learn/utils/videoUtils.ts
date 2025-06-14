export const VideoUtils = {
  formatTime: (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  isVideoCompleted: (currentTime: number, duration: number): boolean => {
    return currentTime / duration > 0.9;
  },

  calculateProgress: (currentTime: number, duration: number): number => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  },
};
