# FINAL PROJECT PEMOGRAMAN WEB

## 📋 Deskripsi Proyek
Proyek ini adalah aplikasi web WordIT yang terdiri dari:
- **Backend**: Node.js dengan Bun runtime, Express, Prisma ORM, dan PostgreSQL
- **Frontend**: React + TypeScript dengan Vite, TailwindCSS, dan Radix UI

## 🚀 Cara Menjalankan Proyek

### Prerequisites
Pastikan sudah terinstall:
- [Bun](https://bun.sh/) (untuk backend)
- [Node.js](https://nodejs.org/) v18+ (untuk frontend)
- PostgreSQL database

---

## 🔧 Backend Setup

### 1. Masuk ke folder Backend
```bash
cd Backend
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Setup Environment Variables
Buat file `.env.development` di folder Backend dengan isi:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/wordit_db"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

### 4. Setup Database
```bash
# Jalankan migrasi database
bun run migrate:dev

# (Opsional) Seed data awal
bun run seed:dev
```

### 5. Jalankan Backend
```bash
# Development mode (auto-reload)
bun run start:dev
```

Backend akan berjalan di `http://localhost:3000`

**Alternatif perintah backend:**
- `bun run start:node` - Jalankan dengan Node.js
- `bun run build` - Build untuk production
- `bun run lint` - Check code quality

---

## 🎨 Frontend Setup

### 1. Masuk ke folder Frontend
```bash
cd Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables (Opsional)
Buat file `.env` di folder Frontend jika perlu konfigurasi API:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Jalankan Frontend
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

**Perintah frontend lainnya:**
- `npm run build` - Build untuk production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality
- `npm run prettier:write` - Format code

---

## 📦 Menjalankan Keduanya Sekaligus

### Opsi 1: Menggunakan 2 Terminal

**Terminal 1 (Backend):**
```bash
cd Backend
bun run start:dev
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

### Opsi 2: Menggunakan Docker (jika tersedia)
```bash
cd Backend
bun run docker:up:dev
```

---

## 🛠️ Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan PostgreSQL sudah running
- Cek `DATABASE_URL` di `.env.development`
- Jalankan `bun run migrate:dev` untuk setup database

### Frontend tidak bisa connect ke backend
- Pastikan backend sudah running di port 3000
- Cek CORS settings di backend
- Periksa `VITE_API_URL` di `.env` frontend

### Port sudah digunakan
- Backend: Ubah `PORT` di `.env.development`
- Frontend: Vite akan otomatis mencari port lain atau edit `vite.config.ts`

---

## 📚 Struktur Project

```
pemweb/
├── Backend/          # Express + Bun + Prisma
│   ├── src/         # Source code
│   ├── prisma/      # Database schema & migrations
│   └── package.json
├── Frontend/        # React + Vite + TailwindCSS
│   ├── src/        # Source code
│   └── package.json
└── README.md       # Dokumentasi ini
```

---

## 👥 Tim Pengembang
Final Project Pemrograman Web 2025
