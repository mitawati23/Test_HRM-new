// Dashboard admin — klik kartu memfilter tabel di bawah (in-page)
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService, attendanceService } from '../services/api';
import AttendanceTimeDisplay from '../components/AttendanceTimeDisplay';
import { filterAttendanceRecords, todayIsoDate } from '../utils/attendanceFilter';

interface AttendanceStats {
  totalEmployees: number;
  todayCheckIn: number;
  totalRecords: number;
}

interface AttendanceRecord {
  id: string;
  checkInTime: string;
  locationLabel?: string;
  notes?: string;
  employee?: { name: string; email?: string };
}

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

type CardFilter = 'employees' | 'today' | 'all';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  gradient: string;
  filter: CardFilter;
  isActive: boolean;
  onSelect: (filter: CardFilter) => void;
}

const StatCard = ({
  title,
  value,
  subtitle,
  gradient,
  filter,
  isActive,
  onSelect,
}: StatCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(filter)}
    className={[
      'group w-full text-left rounded-2xl p-6 shadow-lg transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500',
      gradient,
      'text-white',
      isActive
        ? 'ring-4 ring-white scale-[1.02] shadow-xl'
        : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] opacity-95 hover:opacity-100',
    ].join(' ')}
    aria-pressed={isActive}
  >
    <div className="flex justify-between items-start gap-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <span
        className={[
          'text-xs px-2 py-1 rounded-full transition-opacity',
          isActive ? 'bg-white/30 opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100',
        ].join(' ')}
      >
        {isActive ? '✓ Aktif' : 'Klik untuk filter →'}
      </span>
    </div>
    <p className="text-4xl font-bold mt-2">{value}</p>
    <p className="text-sm mt-2 opacity-90">{subtitle}</p>
  </button>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    todayCheckIn: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<CardFilter | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, attendanceRes] = await Promise.all([
        employeeService.getAll(),
        attendanceService.getAll(),
      ]);

      const employees = employeesRes.data.data as EmployeeRow[];
      const attendance = attendanceRes.data.data as AttendanceRecord[];

      const today = new Date().toDateString();
      const todayCheckIn = attendance.filter(
        (a) => new Date(a.checkInTime).toDateString() === today,
      ).length;

      setStats({
        totalEmployees: employees.length,
        todayCheckIn,
        totalRecords: attendance.length,
      });

      setAllEmployees(employees);
      setAllAttendance(attendance);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    if (activeFilter === 'today') {
      return filterAttendanceRecords(allAttendance, {
        dateFrom: todayIsoDate(),
        dateTo: todayIsoDate(),
      });
    }
    if (activeFilter === 'all') {
      return allAttendance;
    }
    return [];
  }, [activeFilter, allAttendance]);

  const sectionMeta = useMemo(() => {
    switch (activeFilter) {
      case 'employees':
        return {
          title: 'Daftar Karyawan',
          description: `${allEmployees.length} karyawan terdaftar`,
          monitoringLink: '/employees',
          linkLabel: 'Kelola karyawan →',
        };
      case 'today':
        return {
          title: 'Absensi Hari Ini',
          description: `${filteredAttendance.length} absensi pada tanggal hari ini`,
          monitoringLink: `/attendance?preset=today&dateFrom=${todayIsoDate()}&dateTo=${todayIsoDate()}`,
          linkLabel: 'Buka Monitoring lengkap →',
        };
      case 'all':
        return {
          title: 'Semua Record Absensi',
          description: `${filteredAttendance.length} total record absensi WFH`,
          monitoringLink: '/attendance',
          linkLabel: 'Buka Monitoring lengkap →',
        };
      default:
        return null;
    }
  }, [activeFilter, allEmployees.length, filteredAttendance.length]);

  if (loading) {
    return <div className="text-center p-8 text-slate-600">Memuat dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">📊 Admin Dashboard</h1>
      <p className="text-slate-600 mb-8">
        Klik kartu statistik — data akan muncul di panel bawah
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Karyawan"
          value={stats.totalEmployees}
          subtitle="Kelola data karyawan"
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          filter="employees"
          isActive={activeFilter === 'employees'}
          onSelect={setActiveFilter}
        />
        <StatCard
          title="Absensi Hari Ini"
          value={stats.todayCheckIn}
          subtitle="Filter absensi tanggal hari ini"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
          filter="today"
          isActive={activeFilter === 'today'}
          onSelect={setActiveFilter}
        />
        <StatCard
          title="Total Record Absensi"
          value={stats.totalRecords}
          subtitle="Semua data absensi WFH"
          gradient="bg-gradient-to-br from-violet-500 to-purple-700"
          filter="all"
          isActive={activeFilter === 'all'}
          onSelect={setActiveFilter}
        />
      </div>

      {!activeFilter ? (
        <div className="bg-white/80 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-lg mb-1">Belum ada data ditampilkan</p>
          <p className="text-slate-400 text-sm">
            Klik salah satu kartu di atas untuk menampilkan tabel
          </p>
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 transition-opacity duration-300"
          key={activeFilter}
        >
          <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {sectionMeta?.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{sectionMeta?.description}</p>
            </div>
            {sectionMeta?.monitoringLink && (
              <Link
                to={sectionMeta.monitoringLink}
                className="text-sm text-cyan-700 font-medium hover:underline shrink-0"
              >
                {sectionMeta.linkLabel}
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            {activeFilter === 'employees' ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Nama
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Departemen
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Posisi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500 text-sm">
                        Belum ada data karyawan
                      </td>
                    </tr>
                  ) : (
                    allEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          {emp.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{emp.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {emp.department || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {emp.position || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Karyawan
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Hari / Tanggal / Jam
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Lokasi
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500 text-sm">
                        Tidak ada data untuk filter ini
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                          {record.employee?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <AttendanceTimeDisplay
                            checkInTime={record.checkInTime}
                            compact
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                          {record.locationLabel || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
