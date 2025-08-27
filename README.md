# ✨ AI Image Enhancer

Aplikasi web modern untuk meningkatkan kualitas gambar menggunakan teknologi Real-ESRGAN dengan React TypeScript dan Supabase.

![AI Image Enhancer](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## 🚀 Fitur Utama

- **AI Image Enhancement**: Menggunakan berbagai model Real-ESRGAN untuk meningkatkan kualitas gambar
- **Before/After Comparison**: Slider interaktif untuk membandingkan gambar asli dan hasil enhancement
- **Multiple AI Models**: Pilihan model AI yang berbeda untuk berbagai jenis gambar
- **Cloud Storage**: Integrasi dengan Supabase Storage untuk penyimpanan gambar
- **Real-time Progress**: Progress bar dengan estimasi waktu pemrosesan
- **Responsive Design**: UI yang modern dan responsif

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Database + Storage + Auth)
- **Styling**: CSS3 dengan gradients dan animations
- **AI Models**: Real-ESRGAN (2x, 4x, Anime, Clean)

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd HDESS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Supabase Dependencies
```bash
npm install @supabase/supabase-js @supabase/storage-js
```

### 4. Setup Environment Variables
Salin file `.env.example` menjadi `.env` dan isi dengan kredensial Supabase Anda:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Setup Supabase Database
Jalankan SQL script yang ada di `supabase-setup.sql` di Supabase SQL Editor:

```sql
-- Buka Supabase Dashboard > SQL Editor
-- Copy paste isi dari supabase-setup.sql
-- Jalankan script
```

### 6. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🎯 Cara Penggunaan

1. **Pilih Model AI**: Pilih model Real-ESRGAN yang sesuai dengan jenis gambar Anda
2. **Upload Gambar**: Pilih file gambar (JPG, PNG, WebP)
3. **Proses Enhancement**: Klik "Enhance Image" dan tunggu proses selesai
4. **Lihat Hasil**: Gunakan slider comparison untuk melihat perbedaan
5. **Download**: Download hasil enhancement

## 🤖 Model AI yang Tersedia

| Model | Scale | Deskripsi | Waktu Estimasi |
|-------|-------|-----------|----------------|
| Real-ESRGAN 2x | 2x | General purpose upscaling | ~10s |
| Real-ESRGAN 4x | 4x | General purpose upscaling | ~20s |
| Real-ESRGAN Anime 4x | 4x | Optimized for anime/illustrations | ~15s |
| Real-ESRNet 4x | 4x | Clean upscaling without artifacts | ~25s |
| Real-ESRGAN v3 | 4x | Latest model with denoise control | ~18s |

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── Alert.tsx           # Komponen notifikasi
│   ├── Header.tsx          # Header aplikasi
│   ├── ImageComparison.tsx # Slider comparison gambar
│   ├── ProgressBar.tsx     # Progress bar pemrosesan
│   └── UploadForm.tsx      # Form upload gambar
├── lib/
│   └── supabase.ts         # Konfigurasi Supabase
├── App.tsx                 # Komponen utama
├── App.css                 # Styling utama
└── main.tsx               # Entry point
```

## 🔧 Konfigurasi Supabase

### Database Tables
- `image_processing`: Menyimpan metadata pemrosesan gambar

### Storage Buckets
- `original-images`: Menyimpan gambar asli
- `enhanced-images`: Menyimpan hasil enhancement

### Policies
- Public read/write access untuk demo
- Dapat dikustomisasi untuk authentication

## 🚀 Deployment

### Vercel
```bash
npm run build
# Deploy ke Vercel
```

### Netlify
```bash
npm run build
# Deploy folder dist ke Netlify
```

## 🔮 Pengembangan Selanjutnya

- [ ] Implementasi real image processing API
- [ ] User authentication
- [ ] History pemrosesan
- [ ] Batch processing
- [ ] More AI models
- [ ] Mobile app version

## 📝 Lisensi

MIT License - Lihat file LICENSE untuk detail lengkap.

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan, silakan buat issue di repository ini.
