# 🚀 Panduan Setup AI Image Enhancer

## Langkah-langkah Instalasi Lengkap

### 1. Persiapan Environment

```bash
# Install dependencies utama
npm install @supabase/supabase-js @supabase/storage-js

# Install dependencies tambahan (opsional)
npm install react-dropzone lucide-react clsx

# Install dev dependencies
npm install -D @types/node
```

### 2. Setup Supabase

#### A. Buat Proyek Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Buat akun atau login
3. Klik "New Project"
4. Isi nama proyek dan password database
5. Pilih region terdekat
6. Tunggu proyek selesai dibuat

#### B. Dapatkan Kredensial
1. Buka Dashboard proyek Supabase
2. Pergi ke Settings > API
3. Copy `Project URL` dan `anon public key`

#### C. Setup Environment Variables
1. Salin `.env.example` menjadi `.env`
2. Isi dengan kredensial Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Setup Database

#### A. Jalankan SQL Script
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Copy paste seluruh isi file `supabase-setup.sql`
4. Klik "Run" untuk menjalankan script

#### B. Verifikasi Setup
Pastikan terbuat:
- Table: `image_processing`
- Storage buckets: `original-images`, `enhanced-images`
- Policies untuk public access

### 4. Jalankan Aplikasi

```bash
# Development mode
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview
```

### 5. Testing

1. Buka `http://localhost:5173`
2. Pilih model AI
3. Upload gambar test
4. Verifikasi upload ke Supabase Storage
5. Cek database record di Supabase

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env` ada dan berisi kredensial yang benar
- Restart development server setelah menambah env variables

### Error: "Upload failed"
- Cek koneksi internet
- Verifikasi storage policies di Supabase
- Pastikan file size tidak terlalu besar (max 50MB)

### Error: "Database error"
- Pastikan SQL script sudah dijalankan
- Cek table permissions di Supabase
- Verifikasi RLS policies

### Styling Issues
- Clear browser cache
- Pastikan semua CSS classes terdefinisi
- Cek console untuk CSS errors

## Kustomisasi

### Menambah Model AI Baru
Edit file `src/lib/supabase.ts`:

```typescript
export const AI_MODELS: AIModel[] = [
  // Model yang sudah ada...
  {
    key: 'new-model',
    name: 'Model Baru',
    description: 'Deskripsi model baru',
    scale_factor: 4,
    processing_time_estimate: 20
  }
]
```

### Mengubah Styling
Edit file `src/App.css` untuk mengkustomisasi:
- Warna tema
- Layout responsif
- Animasi dan transisi

### Integrasi Image Processing API
Untuk implementasi real image processing, edit:
- `src/components/ProgressBar.tsx` - Update simulateCompletion()
- Tambah API endpoint untuk processing
- Update environment variables

## Deployment

### Vercel
1. Push code ke GitHub
2. Import project di Vercel
3. Tambahkan environment variables
4. Deploy

### Netlify
1. Build project: `npm run build`
2. Upload folder `dist` ke Netlify
3. Konfigurasi environment variables
4. Deploy

## Next Steps

Setelah setup berhasil, Anda dapat:
1. Implementasi real image processing API
2. Tambah authentication
3. Buat history pemrosesan
4. Optimasi performance
5. Tambah fitur batch processing
