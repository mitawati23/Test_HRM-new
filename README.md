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
