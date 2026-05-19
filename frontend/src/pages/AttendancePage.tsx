import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { attendanceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CameraCapture from '../components/CameraCapture';
import AttendanceDateTimeCard from '../components/AttendanceDateTimeCard';
import { formatDateTimeId } from '../utils/formatDateTime';

interface LocationState {
  latitude: number;
  longitude: number;
  label: string;
}

const AttendancePage = () => {
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung GPS/lokasi.');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        let label = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'id' } },
          );
          const data = await res.json();
          if (data?.display_name) {
            label = data.display_name;
          }
        } catch {
          /* pakai koordinat jika reverse geocode gagal */
        }

        setLocation({ latitude, longitude, label });
        setLocationLoading(false);
      },
      () => {
        setLocationError('Gagal ambil lokasi. Izinkan akses lokasi di browser.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const applyPhoto = (file: File, previewUrl: string) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Ukuran foto maksimal 5MB');
      return;
    }
    setError('');
    setPhoto(file);
    setPreview(previewUrl);
    setFileSize((file.size / 1024).toFixed(2));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Hanya JPG, PNG, atau GIF');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => applyPhoto(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPreview('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = (savedAt: Date = new Date()) => {
    const { label } = formatDateTimeId(savedAt);
    setSuccess(`✅ Absensi berhasil dicatat pada ${label}`);
    setPhoto(null);
    setPreview('');
    setNote('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchLocation();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!photo) {
      setError('Foto wajib diisi (upload atau capture kamera)');
      return;
    }

    if (!location) {
      setError('Lokasi belum terdeteksi. Klik "Ambil ulang lokasi".');
      return;
    }

    if (!user?.id) {
      setError('Sesi login tidak valid. Silakan login ulang.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const checkInTime = new Date();
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('checkInTime', checkInTime.toISOString());
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
      formData.append('locationLabel', location.label);
      if (note.trim()) {
        formData.append('notes', note.trim());
      }

      await attendanceService.markAttendance(formData);
      resetForm(checkInTime);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const raw = axiosErr.response?.data?.message;
      const errorMsg = Array.isArray(raw)
        ? raw.join(', ')
        : raw || 'Gagal mencatat absensi';
      setError(`❌ ${errorMsg}`);
      console.error('Attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const mapsUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : '#';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📍 Absensi WFH</h1>
        <p className="text-gray-600 mb-8">
          Check-in dengan foto, lokasi GPS, dan catatan opsional
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AttendanceDateTimeCard />

          {/* Lokasi */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex justify-between items-start gap-2 mb-2">
              <label className="font-semibold text-gray-800">
                Lokasi absen <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={fetchLocation}
                disabled={locationLoading}
                className="text-sm text-emerald-700 hover:underline disabled:opacity-50"
              >
                {locationLoading ? 'Mendeteksi...' : 'Ambil ulang lokasi'}
              </button>
            </div>
            {locationError && (
              <p className="text-sm text-red-600 mb-2">{locationError}</p>
            )}
            {location ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p>{location.label}</p>
                <p className="text-xs text-gray-500">
                  Koordinat: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 text-xs hover:underline inline-block"
                >
                  Lihat di Google Maps →
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Menunggu lokasi GPS...</p>
            )}
          </div>

          {/* Foto: kamera + upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Bukti foto <span className="text-red-500">*</span>
            </label>

            <CameraCapture
              onCapture={applyPhoto}
              onClear={clearPhoto}
              disabled={loading}
            />

            <p className="text-center text-gray-400 text-sm my-3">atau upload file</p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="cursor-pointer">
                <span className="text-2xl">📁</span>
                <p className="text-gray-600 text-sm mt-1">Pilih dari galeri</p>
              </label>
            </div>

            {photo && (
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  File: <strong>{photo.name}</strong> ({fileSize} KB)
                </p>
              </div>
            )}

            {preview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-xs rounded-lg border-2 border-blue-300 shadow-md"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Catatan <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Contoh: WFH dari rumah, meeting online..."
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !photo || !location}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan absensi...' : '✓ Submit Absensi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AttendancePage;
