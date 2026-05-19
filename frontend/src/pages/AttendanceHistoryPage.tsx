import { useEffect, useState } from 'react';
import { attendanceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AttendanceTimeDisplay from '../components/AttendanceTimeDisplay';

interface Attendance {
  id: string;
  checkInTime: string;
  photoPath: string;
  notes: string;
  latitude?: number | string;
  longitude?: number | string;
  locationLabel?: string;
  employee?: { name: string; email: string };
}

const AttendanceHistoryPage = () => {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceService.getMyHistory();
      setAttendanceList(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📋 Riwayat Absensi
        </h1>
        <p className="text-gray-600 mb-8">Daftar absensi dengan hari, tanggal, dan jam</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {attendanceList.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No attendance records found</p>
        ) : (
          <div className="grid gap-4">
            {attendanceList.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <AttendanceTimeDisplay checkInTime={record.checkInTime} />
                  {record.photoPath && (
                    <a
                      href={`/${record.photoPath.replace(/^\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Photo
                    </a>
                  )}
                </div>
                {record.locationLabel && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Lokasi:</strong> {record.locationLabel}
                    {record.latitude != null && record.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Maps
                      </a>
                    )}
                  </p>
                )}
                {record.notes && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Catatan:</strong> {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;
