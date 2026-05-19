// Tampilan hari, tanggal, jam dari data absensi tersimpan
import { formatDateTimeId } from '../utils/formatDateTime';

interface AttendanceTimeDisplayProps {
  checkInTime: string;
  compact?: boolean;
}

const AttendanceTimeDisplay = ({
  checkInTime,
  compact = false,
}: AttendanceTimeDisplayProps) => {
  const { tanggal, hari, jam } = formatDateTimeId(checkInTime);

  if (compact) {
    return (
      <span className="text-sm text-gray-700">
        <span className="font-medium capitalize">{hari}</span>
        {', '}
        {tanggal}
        {' · '}
        <span className="font-semibold text-gray-900">{jam}</span>
      </span>
    );
  }

  return (
    <div className="text-sm text-gray-700 space-y-1">
      <p>
        <span className="text-gray-500">Hari:</span>{' '}
        <span className="font-medium capitalize">{hari}</span>
      </p>
      <p>
        <span className="text-gray-500">Tanggal:</span>{' '}
        <span className="font-medium">{tanggal}</span>
      </p>
      <p>
        <span className="text-gray-500">Jam:</span>{' '}
        <span className="font-semibold text-gray-900">{jam}</span>
      </p>
    </div>
  );
};

export default AttendanceTimeDisplay;
