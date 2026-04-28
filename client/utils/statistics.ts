import type { DailyLog } from '@/types/bone';

export const STATISTICS_WINDOW_DAYS = 7;

export interface ChartDataPoint {
  label: string;
  value: number;
}

export function getDateTime(date: string): number {
  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return 0;
  }

  return new Date(year, month - 1, day).getTime();
}

export function sortLogsByDateAsc(logs: DailyLog[]): DailyLog[] {
  return [...logs].sort((a, b) => getDateTime(a.date) - getDateTime(b.date));
}

export function sortLogsByDateDesc(logs: DailyLog[]): DailyLog[] {
  return [...logs].sort((a, b) => getDateTime(b.date) - getDateTime(a.date));
}

export function getLatestLogs(logs: DailyLog[], limit = STATISTICS_WINDOW_DAYS): DailyLog[] {
  return sortLogsByDateAsc(logs).slice(-limit);
}

export function getAverageSTZI(logs: DailyLog[]): string | null {
  const values = logs
    .map((log) => log.stzi)
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return (total / values.length).toFixed(2);
}

export function toChartData(logs: DailyLog[]): ChartDataPoint[] {
  return logs.map((log) => ({
    label: log.date.slice(8, 10),
    value: Number.isFinite(log.stzi) ? log.stzi : 0,
  }));
}
