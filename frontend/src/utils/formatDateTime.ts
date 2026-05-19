// Format tanggal, hari, dan jam untuk tampilan absensi (locale Indonesia)
export interface FormattedDateTime {
  tanggal: string;
  hari: string;
  jam: string;
  label: string;
}

export function formatDateTimeId(value: Date | string): FormattedDateTime {
  const d = value instanceof Date ? value : new Date(value);

  const hari = d.toLocaleDateString('id-ID', { weekday: 'long' });
  const tanggal = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const jam = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return {
    tanggal,
    hari,
    jam,
    label: `${hari}, ${tanggal} · ${jam}`,
  };
}
