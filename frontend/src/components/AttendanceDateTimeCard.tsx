// Kartu waktu absen real-time (tanggal, hari, jam)
import { useEffect, useState } from 'react';
import { formatDateTimeId } from '../utils/formatDateTime';

interface AttendanceDateTimeCardProps {
  title?: string;
  subtitle?: string;
}

const AttendanceDateTimeCard = ({
  title = 'Waktu absen',
  subtitle = 'Waktu ini akan dicatat saat Anda submit',
}: AttendanceDateTimeCardProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { tanggal, hari, jam } = formatDateTimeId(now);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-semibold text-blue-900 mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg px-4 py-3 border border-blue-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Hari</p>
          <p className="text-lg font-semibold text-gray-800 capitalize">{hari}</p>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 border border-blue-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal</p>
          <p className="text-lg font-semibold text-gray-800">{tanggal}</p>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 border border-blue-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Jam</p>
          <p className="text-2xl font-bold text-blue-700 tabular-nums">{jam}</p>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-blue-700/80 mt-3">{subtitle}</p>
      )}
    </div>
  );
};

export default AttendanceDateTimeCard;
