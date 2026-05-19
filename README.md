# HRM WFH System

Sistem absensi Work From Home (WFH) dan manajemen karyawan sederhana. Karyawan dapat check-in dengan foto, lokasi GPS, dan catatan. Admin HRD dapat mengelola karyawan dan memantau absensi.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | NestJS 9, TypeORM, MySQL, JWT |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Database | MySQL 8 / MariaDB |

## Fitur

**Karyawan**
- Login dengan JWT
- Absensi WFH (foto + GPS + catatan)
- Riwayat absensi (hari, tanggal, jam)

**Admin HRD**
- Dashboard statistik (filter in-page)
- CRUD karyawan
- Monitoring absensi (filter nama, tanggal, karyawan)

---

## Prasyarat

Install terlebih dahulu:

1. **Node.js** 18+ — [https://nodejs.org](https://nodejs.org)
2. **MySQL** 8+ atau MariaDB — via Laragon, XAMPP, Wampserver atau MySQL Installer
3. **Git** — [https://git-scm.com](https://git-scm.com)
4. (Opsional) **DBeaver** — untuk kelola database visual

Pastikan perintah ini jalan di terminal:

```bash
node -v
npm -v
mysql --version
```

---

## Struktur Project

```
hrm-wfh-system/
├── backend/          # API NestJS (port 3000)
│   ├── src/
│   ├── .env.example
│   └── uploads/      # foto absensi (auto-created)
├── frontend/         # React Vite (port 3001)
│   ├── src/
│   └── .env.example
├── package.json      # monorepo workspaces
└── README.md
```

---

## Step 1 — Clone Repository

```bash
git clone https://github.com/mitawati23/Test_HRM-new.git
cd Test_HRM-new
```

Ganti `USERNAME` dan nama repo sesuai GitHub Anda.

---

## Step 2 — Install Dependencies

Di **root** project:

```bash
npm install
```

Perintah ini menginstall dependency `backend` dan `frontend` (npm workspaces).

---

## Step 3 — Setup Database MySQL

### 3.1 Jalankan MySQL

Pastikan service MySQL **sudah running** sebelum lanjut.

| Tool | Cara start |
|------|------------|
| **Laragon** | Start All → MySQL hijau |
| **XAMPP** | Start **MySQL** di Control Panel |
| **Windows Service** | Services → MySQL → Start |

Cek port 3306 aktif (PowerShell):

```powershell
netstat -an | findstr ":3306"
```

Harus ada baris `LISTENING` pada port 3306.

### 3.2 Buat Database

**Opsi A — MySQL CLI**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS hrm_wfh_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

SHOW DATABASES LIKE 'hrm_wfh_db';
EXIT;
```

Jika root **tanpa password** (default Laragon):

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS hrm_wfh_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Opsi B — DBeaver / phpMyAdmin**

1. Connect ke `localhost:3306`, user `root`
2. Buat database baru: `hrm_wfh_db`
3. Charset: `utf8mb4`, collation: `utf8mb4_unicode_ci`

### 3.3 Tabel & Data Demo

**Tidak perlu import SQL manual.**

Saat backend pertama kali jalan:
- **TypeORM** membuat tabel otomatis (`synchronize` di mode development)
- **SeedService** membuat user demo (jika `SEED_DEMO_USERS=true`)

---

## Step 4 — Konfigurasi Environment

### Backend

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=              # kosong jika Laragon default
DB_NAME=hrm_wfh_db

PORT=3000
NODE_ENV=development

JWT_SECRET=ganti_dengan_string_rahasia_panjang_min_32_karakter
JWT_EXPIRATION=7d

FRONTEND_URL=http://localhost:3001

SEED_DEMO_USERS=true
SEED_FORCE_RESET=true
ALLOW_PUBLIC_REGISTER=false
```

### Frontend

```bash
cd ../frontend
copy .env.example .env
```

Isi `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

> **Penting:** URL API harus diakhiri `/api` karena route NestJS memakai prefix `/api`.

---

## Step 5 — Jalankan Aplikasi

Buka **2 terminal** terpisah.

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

Tunggu sampai muncul:

```
🚀 Backend running on http://localhost:3000
```

Dan log seed (jika pertama kali):

```
Demo user created: admin@example.com
Demo user created: emp@example.com
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Buka browser: **http://localhost:3001**

---

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin HRD | `admin@example.com` | `admin123` |
| Karyawan | `emp@example.com` | `admin123` |

---

## API Utama

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Profil user (Bearer token) |
| POST | `/api/attendance/mark` | Absensi + foto (multipart) |
| GET | `/api/attendance/my-history` | Riwayat karyawan |
| GET | `/api/attendance` | Semua absensi (admin) |
| GET | `/api/employees` | Daftar karyawan (admin) |

Upload foto tersimpan di folder `backend/uploads/`.

---

## Push ke GitHub (Step by Step)

### 1. Buat repository di GitHub

1. Login [github.com](https://github.com)
2. Klik **New repository**
3. Nama contoh: `hrm-wfh-system`
4. Pilih **Private** atau **Public**
5. **Jangan** centang "Add README" (sudah ada di lokal)
6. Klik **Create repository**

### 2. Inisialisasi Git di project (jika belum)

Di folder root project:

```bash
git init
git branch -M main
```

### 3. Pastikan file sensitif tidak ikut commit

File berikut **otomatis di-ignore** (`.gitignore`):

- `backend/.env`
- `frontend/.env`
- `node_modules/`
- `backend/uploads/`
- `backend/dist/`

Yang **boleh** di-commit: `.env.example`

### 4. Commit pertama

```bash
git add .
git status
git commit -m "Initial commit: HRM WFH attendance system"
```

### 5. Hubungkan ke GitHub & push

Ganti URL dengan repo Anda:

```bash
git remote add origin https://github.com/USERNAME/hrm-wfh-system.git
git push -u origin main
```

Jika diminta login, gunakan **Personal Access Token** (bukan password akun) — Settings → Developer settings → Tokens.

### 6. Clone di mesin lain

```bash
git clone https://github.com/USERNAME/hrm-wfh-system.git
cd hrm-wfh-system
npm install
# ulangi Step 3–5 (database + .env)
```

---

## Troubleshooting

### `ECONNREFUSED` / database connection failed

- MySQL belum di-start
- `DB_HOST`, `DB_PORT`, `DB_PASSWORD` salah di `.env`
- Database `hrm_wfh_db` belum dibuat

### `Connection refused: getsockopt` (DBeaver)

Sama seperti di atas — MySQL service harus jalan dulu.

### Login gagal / user tidak ada

1. Pastikan backend jalan tanpa error
2. Cek `SEED_DEMO_USERS=true` di `backend/.env`
3. Restart backend
4. Atau set `SEED_FORCE_RESET=true` sekali, restart, lalu kembalikan ke `false`

### `Photo proof is required`

- Pastikan `frontend/.env` → `VITE_API_URL=http://localhost:3000/api`
- Upload foto via kamera atau file sebelum submit

### Port 3000 sudah dipakai

```powershell
netstat -ano | findstr ":3000"
taskkill /PID <PID> /F
```

Atau ubah `PORT` di `backend/.env`.

### CORS error di browser

Pastikan `FRONTEND_URL=http://localhost:3001` di `backend/.env` dan frontend jalan di port 3001.

---

## Production (catatan singkat)

Sebelum deploy:

1. Set `NODE_ENV=production`
2. `JWT_SECRET` kuat & unik
3. `SEED_DEMO_USERS=false`
4. Matikan TypeORM `synchronize` — gunakan migration
5. Pakai HTTPS
6. Pertimbangkan httpOnly cookie untuk token (bukan localStorage)

---

## License

MIT
