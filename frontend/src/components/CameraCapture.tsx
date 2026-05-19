import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const CameraCapture = ({ onCapture, onClear, disabled }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsReady(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Pasang stream ke <video> setelah elemen ada di DOM
  useEffect(() => {
    if (!isActive || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    const onReady = () => setIsReady(true);
    video.addEventListener('loadedmetadata', onReady);

    video.play().catch(() => {
      setCameraError('Gagal menampilkan preview kamera.');
    });

    return () => {
      video.removeEventListener('loadedmetadata', onReady);
    };
  }, [isActive]);

  const requestStream = async (): Promise<MediaStream> => {
    const constraints: MediaStreamConstraints[] = [
      {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      },
      { video: true, audio: false },
    ];

    let lastError: unknown;
    for (const constraint of constraints) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraint);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  };

  const startCamera = async () => {
    setCameraError('');
    setIsReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser tidak mendukung kamera. Gunakan upload file.');
      return;
    }

    try {
      stopCamera();
      const stream = await requestStream();
      streamRef.current = stream;
      setIsActive(true);
    } catch {
      setCameraError(
        'Tidak bisa akses kamera. Izinkan permission kamera di browser (ikon gembok di address bar).',
      );
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !isReady) {
      setCameraError('Tunggu preview kamera siap sebelum mengambil foto.');
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      setCameraError('Preview kamera belum siap. Coba tutup dan buka kamera lagi.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Gagal membuat file foto.');
          return;
        }
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file, canvas.toDataURL('image/jpeg', 0.9));
        setCameraError('');
        stopCamera();
      },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div className="space-y-3">
      {!isActive ? (
        <button
          type="button"
          onClick={startCamera}
          disabled={disabled}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          Buka kamera
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-indigo-300 max-w-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full min-h-[240px] object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm">
                Memuat kamera...
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!isReady}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Ambil foto
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
            >
              Tutup kamera
            </button>
          </div>
        </div>
      )}

      {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}

      <button
        type="button"
        onClick={() => {
          stopCamera();
          onClear();
        }}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Hapus foto
      </button>
    </div>
  );
};

export default CameraCapture;
