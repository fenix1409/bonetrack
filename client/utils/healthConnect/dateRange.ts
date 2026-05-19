export interface TimeRange {
  startTime: string;
  endTime: string;
}

export const getTodayTimeRange = (now = new Date()): TimeRange => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return {
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
};
