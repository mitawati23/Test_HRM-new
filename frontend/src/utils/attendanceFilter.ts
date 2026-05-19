// Filter absensi client-side (nama, tanggal, preset)
export interface AttendanceFilterable {
  checkInTime: string;
  employee?: { name?: string; email?: string };
}

export function isSameCalendarDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function filterAttendanceRecords<T extends AttendanceFilterable>(
  records: T[],
  options: {
    nameQuery?: string;
    dateFrom?: string;
    dateTo?: string;
    presetToday?: boolean;
  },
): T[] {
  let result = records;
  const q = options.nameQuery?.trim().toLowerCase();

  if (q) {
    result = result.filter(
      (r) =>
        r.employee?.name?.toLowerCase().includes(q) ||
        r.employee?.email?.toLowerCase().includes(q),
    );
  }

  if (options.dateFrom) {
    const start = new Date(options.dateFrom);
    start.setHours(0, 0, 0, 0);
    result = result.filter((r) => new Date(r.checkInTime) >= start);
  }

  if (options.dateTo) {
    const end = new Date(options.dateTo);
    end.setHours(23, 59, 59, 999);
    result = result.filter((r) => new Date(r.checkInTime) <= end);
  }

  if (options.presetToday && !options.dateFrom && !options.dateTo) {
    const today = new Date();
    result = result.filter((r) =>
      isSameCalendarDay(new Date(r.checkInTime), today),
    );
  }

  return result;
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
