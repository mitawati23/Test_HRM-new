// Halaman monitoring absensi (view only) untuk admin HRD
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { attendanceService, employeeService } from '../services/api';
import AttendanceTimeDisplay from '../components/AttendanceTimeDisplay';
import {
  filterAttendanceRecords,
  todayIsoDate,
} from '../utils/attendanceFilter';

interface AttendanceRecord {
  id: string;
  checkInTime: string;
  photoPath?: string;
  notes?: string;
  latitude?: number | string;
  longitude?: number | string;
  locationLabel?: string;
  employee?: { name: string; email: string };
}

interface Employee {
  id: string;
  name: string;
  email?: string;
}

const AdminAttendancePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState(
    () => searchParams.get('employeeId') ?? '',
  );
  const [nameQuery, setNameQuery] = useState(
    () => searchParams.get('name') ?? '',
  );
  const [dateFrom, setDateFrom] = useState(
    () => searchParams.get('dateFrom') ?? '',
  );
  const [dateTo, setDateTo] = useState(
    () => searchParams.get('dateTo') ?? '',
  );
  const [presetToday, setPresetToday] = useState(
    () => searchParams.get('preset') === 'today',
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const syncUrl = useCallback(
    (next: {
      employeeId?: string;
      name?: string;
      dateFrom?: string;
      dateTo?: string;
      preset?: string;
    }) => {
      const params = new URLSearchParams();
      const emp = next.employeeId ?? filterEmployeeId;
      const name = next.name ?? nameQuery;
      const from = next.dateFrom ?? dateFrom;
      const to = next.dateTo ?? dateTo;
      const preset =
        next.preset !== undefined
          ? next.preset
          : presetToday
            ? 'today'
            : '';

      if (emp) params.set('employeeId', emp);
      if (name.trim()) params.set('name', name.trim());
      if (from) params.set('dateFrom', from);
      if (to) params.set('dateTo', to);
      if (preset === 'today') params.set('preset', 'today');

      setSearchParams(params, { replace: true });
    },
    [filterEmployeeId, nameQuery, dateFrom, dateTo, presetToday, setSearchParams],
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [filterEmployeeId]);

  const loadEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data);
    } catch {
      setEmployees([]);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = filterEmployeeId
        ? await attendanceService.getEmployeeAttendance(filterEmployeeId)
        : await attendanceService.getAll();
      setRecords(res.data.data);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(message || 'Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(
    () =>
      filterAttendanceRecords(records, {
        nameQuery,
        dateFrom,
        dateTo,
        presetToday,
      }),
    [records, nameQuery, dateFrom, dateTo, presetToday],
  );

  const employeesForSelect = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q),
    );
  }, [employees, nameQuery]);

  const applyTodayPreset = () => {
    const today = todayIsoDate();
    setDateFrom(today);
    setDateTo(today);
    setPresetToday(true);
    syncUrl({ dateFrom: today, dateTo: today, preset: 'today' });
  };

  const resetFilters = () => {
    setFilterEmployeeId('');
    setNameQuery('');
    setDateFrom('');
    setDateTo('');
    setPresetToday(false);
    setSearchParams({}, { replace: true });
  };

  const handleEmployeeChange = (id: string) => {
    setFilterEmployeeId(id);
    syncUrl({ employeeId: id });
  };

  const handleNameChange = (value: string) => {
    setNameQuery(value);
    if (presetToday && !dateFrom && !dateTo) {
      /* keep preset */
    }
  };

  const handleNameBlur = () => {
    syncUrl({ name: nameQuery });
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPresetToday(false);
    syncUrl({ dateFrom: value, preset: '' });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPresetToday(false);
    syncUrl({ dateTo: value, preset: '' });
  };

  const photoUrl = (path?: string) =>
    path ? `/${path.replace(/^\//, '')}` : null;

  const activeFilterCount = [
    filterEmployeeId,
    nameQuery.trim(),
    dateFrom,
    dateTo,
    presetToday,
  ].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Monitoring Absensi Karyawan
      </h1>
      <p className="text-slate-600 mb-6">
        View only — data absensi WFH yang disubmit karyawan
      </p>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-5 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Filter data</h2>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-1 rounded-full">
              {activeFilterCount} filter aktif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="filter-name"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Cari nama karyawan
            </label>
            <input
              id="filter-name"
              type="search"
              value={nameQuery}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              placeholder="Ketik nama atau email..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="filter-employee"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Karyawan
            </label>
            <select
              id="filter-employee"
              value={filterEmployeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">Semua karyawan</option>
              {employeesForSelect.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-date-from"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Tanggal dari
            </label>
            <input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="filter-date-to"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Tanggal sampai
            </label>
            <input
              id="filter-date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={applyTodayPreset}
            className="text-sm px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
          >
            Reset filter
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center py-8 text-slate-600">Memuat data...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center py-8 text-slate-600">
          Tidak ada data absensi untuk filter ini
          {records.length > 0 && (
            <span className="block text-sm mt-1 text-slate-500">
              ({records.length} record total — coba ubah filter)
            </span>
          )}
        </p>
      ) : (
        <>
          <p className="text-sm text-slate-600 mb-3">
            Menampilkan <strong>{filteredRecords.length}</strong> dari{' '}
            <strong>{records.length}</strong> record
          </p>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Karyawan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Hari / Tanggal / Jam
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Lokasi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Catatan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Bukti foto
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-slate-800">
                        {row.employee?.name || '-'}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {row.employee?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <AttendanceTimeDisplay checkInTime={row.checkInTime} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                      {row.locationLabel ? (
                        <>
                          <span className="line-clamp-2">{row.locationLabel}</span>
                          {row.latitude != null && row.longitude != null && (
                            <a
                              href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-700 text-xs hover:underline block mt-1"
                            >
                              Maps
                            </a>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {row.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {row.photoPath ? (
                        <a
                          href={photoUrl(row.photoPath) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-700 hover:underline font-medium"
                        >
                          Lihat foto
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAttendancePage;
