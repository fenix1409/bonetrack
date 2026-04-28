import { useMemo } from 'react';
import type { DailyLog } from '@/types/bone';
import { getAverageSTZI, getLatestLogs, sortLogsByDateDesc, toChartData } from '@/utils/statistics';

export function useStatistics(history: DailyLog[]) {
  return useMemo(() => {
    const latestLogs = getLatestLogs(history);

    return {
      averageSTZI: getAverageSTZI(history),
      recentLogs: sortLogsByDateDesc(history),
      chartPoints: toChartData(latestLogs),
      hasHistory: history.length > 0,
      hasChartData: latestLogs.length > 0,
    };
  }, [history]);
}
