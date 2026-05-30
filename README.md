# 🌐 Stockation — Backend API Gateway

Microservice Backend berbasis **Express.js** dengan **TypeScript** yang berfungsi sebagai API Gateway untuk aplikasi Stockation. Backend ini menangani autentikasi, logika bisnis utama, komunikasi dengan database (Supabase), caching (Redis), serta menjembatani *request* dari Frontend ke Service Machine Learning.

---

## 🗂️ Struktur Folder

```text
backend/
├── src/
│   ├── adapters/         # Integrasi dengan API eksternal (Yahoo Finance, AI Groq)
│   │   ├── ai.adapter.ts
│   │   └── yahoo.adapter.ts
│   │
│   ├── config/           # Konfigurasi koneksi (Supabase, Redis, Axios instances)
│   │   ├── supabase.ts
│   │   ├── redis.ts
│   │   └── ai-client.ts
│   │
│   ├── controllers/      # Request handlers untuk HTTP layer
│   │   ├── transaction.controller.ts
│   │   ├── user.controller.ts
│   │   └── ...
│   │
│   ├── middleware/       # Express middlewares (Autentikasi, Error Handling)
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── models/           # Data Access Layer untuk interaksi dengan Supabase
│   │   ├── portfolio.model.ts
│   │   ├── transaction.model.ts
│   │   └── user.model.ts
│   │
│   ├── routes/           # Definisi API routes
│   │   ├── transaction.routes.ts
│   │   ├── user.routes.ts
│   │   └── ...
│   │
│   ├── services/         # Business logic utama per fitur
│   │   ├── portfolio.service.ts
│   │   ├── transaction.service.ts
│   │   └── ...
│   │
│   ├── utils/            # Helper functions murni (Math, Date, Error Classes)
│   │   ├── AppError.ts
│   │   ├── catchAsync.ts
│   │   └── calculation.util.ts
│   │
│   └── index.ts          # Entry point aplikasi Express
│
├── .env.example          # Template environment variables
├── package.json          # Node dependencies dan scripts
└── tsconfig.json         # Konfigurasi compiler TypeScript
```

---

## ⚙️ Setup & Instalasi

### 1. Install Dependencies

Pastikan Anda telah menginstal `Node.js` (disarankan v18+).

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env` dan isi dengan konfigurasi Anda:

```bash
cp .env.example .env
```

Contoh isi `.env`:
```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
REDIS_URL=your_redis_url
FASTAPI_URL=http://127.0.0.1:8000
NODE_ENV=development
```

---

## 🚀 Menjalankan Service

### Mode Development (dengan Nodemon)

```bash
npm run dev
```

Server akan otomatis *restart* jika ada perubahan file di folder `src/`. API akan tersedia di `http://localhost:3000`.

### Mode Production

Lakukan *build* terlebih dahulu, kemudian jalankan hasil *build*:

```bash
npm run build
npm start
```

---

## 📡 API Routes Utama

Semua endpoint diawali dengan `/api/`.

| Kategori | Base Route | Deskripsi |
|----------|------------|-----------|
| **User** | `/api/users` | Autentikasi, sinkronisasi Google, manajemen profil pengguna. |
| **Wallet** | `/api/wallets` | Manajemen dompet utama (Global Wallet), *top-up*, dan alokasi dana. |
| **Portfolio** | `/api/portfolios` | Manajemen sub-dompet investasi, optimasi portofolio. |
| **Transaction** | `/api/transactions`| Pencatatan riwayat *Buy* dan *Sell* saham. |
| **Stocks** | `/api/stocks` | Pengambilan data saham *real-time*, integrasi sentimen/anomali. |
| **Explore** | `/api/explore` | Fitur *Watchlist*, *Top Gainers*, dan *Top Losers*. |
| **AI** | `/api/ai` | Integrasi ke Service Machine Learning (Penjelasan istilah). |

---

## 🏗️ Arsitektur Aplikasi

Aplikasi backend ini mengikuti pola **MVC-like Layered Architecture** untuk memastikan *Separation of Concerns* (SoC):

1. **Routes Layer**: Bertanggung jawab menerima HTTP Request dan mengarahkannya ke Controller yang tepat, serta menerapkan *middleware* seperti perlindungan rute (*auth*).
2. **Controller Layer**: Fokus meng-ekstrak parameter dan payload dari request, memanggil *Service* yang sesuai, dan memformat HTTP Response (JSON). Semua controller dibungkus oleh fungsi `catchAsync` untuk menangani error tanpa *repetitive* `try-catch`.
3. **Service Layer**: Tempat berkumpulnya *Business Logic*. Service bertanggung jawab untuk mengeksekusi aturan bisnis aplikasi dan menghubungi Adapter atau Model.
4. **Adapter Layer**: Menangani interaksi dan integrasi dengan API Pihak Ketiga (*Third-party services*) seperti Yahoo Finance API dan Stockation FastAPI Service.
5. **Model Layer (Data Access)**: Berfungsi melakukan *query* langsung ke Database Supabase. Service tidak diizinkan untuk menghubungi database secara langsung.

### Alur Data Global:
```text
React Frontend ↔ [ Routes → Controller → Service ↔ Adapter / Model ] ↔ Database / FastAPI ML
```

---

## 🚨 Error Handling

Sistem ini memiliki **Global Error Handler** tersentralisasi yang mendengarkan setiap *throw error* dari layer Service atau Adapter menggunakan class custom `AppError`.
- **Mode Development**: Response error akan mengembalikan `message` dan `stack trace`.
- **Mode Production**: Response hanya menampilkan `message` khusus jika ditandai sebagai *Operational Error* demi keamanan agar *internal server info* tidak bocor ke publik.

---

## 📦 Dependencies Utama

| Package | Kegunaan |
|---------|----------|
| `express` | Web framework utama untuk Node.js |
| `typescript` | Superset JavaScript untuk type-safety |
| `@supabase/supabase-js`| SDK resmi untuk berinteraksi dengan Supabase |
| `redis` | Caching API respons dari pihak ketiga |
| `axios` | HTTP Client untuk memanggil FastAPI |
| `yahoo-finance2`| Integrasi data pasar *real-time* |
| `nodemon` & `tsx` | *Developer experience* (Live reload TypeScript) |