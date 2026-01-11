export interface PeriodInfo {
  label: string; // e.g., "1 Ιαν - 10 Ιαν 2024"
  startDay: number;
  endDay: number;
  month: number;
  year: number;
  periodNumber: number;
}

export function getCurrentPeriod(): PeriodInfo {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  let startDay = 1;
  let endDay = 10;
  let periodNumber = 1;

  if (day > 10 && day <= 20) {
    startDay = 11;
    endDay = 20;
    periodNumber = 2;
  } else if (day > 20) {
    startDay = 21;
    // Last day of month
    endDay = new Date(year, month + 1, 0).getDate();
    periodNumber = 3;
  }

  const startDate = new Date(year, month, startDay);
  const endDate = new Date(year, month, endDay);

  const formatter = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'short' });

  return {
    label: `${formatter.format(startDate)} - ${formatter.format(endDate)} ${year}`,
    startDay,
    endDay,
    month: month + 1, // 1-12
    year,
    periodNumber
  };
}

export function getLastCompletedPeriod(): PeriodInfo {
  const current = getCurrentPeriod();
  let { periodNumber, month, year } = current;

  // Go back one period
  periodNumber--;

  if (periodNumber < 1) {
    periodNumber = 3;
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
  }

  // Calculate start/end days
  let startDay = 1;
  let endDay = 10;
  if (periodNumber === 2) {
    startDay = 11;
    endDay = 20;
  } else if (periodNumber === 3) {
    startDay = 21;
    endDay = new Date(year, month, 0).getDate(); // Last day of that month
  }

  // Month is 1-12, Date uses 0-11
  const startDate = new Date(year, month - 1, startDay);
  const endDate = new Date(year, month - 1, endDay);
  const formatter = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'short' });

  return {
    label: `${formatter.format(startDate)} - ${formatter.format(endDate)} ${year}`,
    startDay,
    endDay,
    month: month,
    year,
    periodNumber
  };
}
