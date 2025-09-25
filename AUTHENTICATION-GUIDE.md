# HDESS Authentication System Guide

## Overview

Sistem autentikasi telah berhasil diimplementasikan pada aplikasi HDESS. Sekarang pengguna harus login terlebih dahulu sebelum dapat menggunakan fitur image enhancement.

## Fitur Autentikasi

### 1. **User Registration**
- Pendaftaran akun baru dengan nama, email, dan password
- Validasi email format dan password minimal 6 karakter
- Hash password menggunakan bcrypt untuk keamanan
- Automatic login setelah registrasi berhasil

### 2. **User Login**
- Login menggunakan email dan password
- JWT token untuk session management
- Token disimpan di localStorage
- Auto-redirect ke aplikasi setelah login berhasil

### 3. **Protected Routes**
- Halaman utama aplikasi dilindungi dengan autentikasi
- Redirect otomatis ke login jika belum terautentikasi
- Token verification pada setiap page load

### 4. **User Interface**
- Landing page tetap dapat diakses tanpa login
- Tombol "Get Started" mengarahkan ke halaman login
- Header menampilkan nama user dan tombol logout
- Form login dan register dengan design yang clean dan modern

## Struktur File

### Frontend Components
```
src/
├── components/
│   ├── Login.tsx           # Komponen halaman login
│   ├── Register.tsx        # Komponen halaman register
│   ├── ProtectedRoute.tsx  # HOC untuk melindungi routes
│   └── Header.tsx          # Updated dengan user info dan logout
├── contexts/
│   └── AuthContext.tsx     # Context untuk state management autentikasi
└── App.tsx                 # Updated dengan routing dan auth provider
```

### Backend API
```
api/
├── auth_api.py            # API endpoints untuk autentikasi
├── requirements.txt       # Updated dengan dependencies autentikasi
└── users.db              # SQLite database untuk user data (auto-generated)
```

### Configuration Files
```
├── .env                   # Environment variables untuk JWT secret
├── start-auth-api.py      # Python script untuk menjalankan auth API
└── start-auth-api.bat     # Windows batch script untuk auth API
```

## API Endpoints

### Authentication API (Port 5001)

#### POST `/api/register`
Mendaftarkan user baru
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/verify-token`
Verifikasi JWT token
```
Headers: Authorization: Bearer <token>
```

#### GET `/api/health`
Health check endpoint

## Cara Menjalankan

### 1. **Install Dependencies**
```bash
# Frontend dependencies (sudah terinstall)
npm install react-router-dom @types/react-router-dom

# Backend dependencies
cd api
pip install -r requirements.txt
```

### 2. **Menjalankan Authentication API**
```bash
# Option 1: Menggunakan Python script
python start-auth-api.py

# Option 2: Menggunakan batch file (Windows)
start-auth-api.bat

# Option 3: Manual
cd api
python auth_api.py
```

### 3. **Menjalankan Frontend**
```bash
npm run dev
```

### 4. **Menjalankan Image Processing API**
```bash
# Sesuai dengan dokumentasi yang sudah ada
python start-backend-simple.py
```

## Environment Variables

Pastikan file `.env` memiliki konfigurasi berikut:

```env
# Authentication Configuration
JWT_SECRET=hdess-super-secret-jwt-key-change-in-production-2024
AUTH_PORT=5001
FLASK_ENV=development

# Existing Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key

# Image Processing API
VITE_IMAGE_PROCESSING_API_URL=http://localhost:8080
```

## Routing Structure

```
/                    # Landing Page (Public)
/login              # Login Page (Public)
/register           # Register Page (Public)
/app                # Main Application (Protected)
```

## Security Features

### 1. **Password Security**
- Passwords di-hash menggunakan bcrypt dengan salt
- Tidak ada plain text password yang disimpan

### 2. **JWT Token**
- Token expires dalam 24 jam
- Token verification pada setiap request
- Secure token storage di localStorage

### 3. **Input Validation**
- Email format validation
- Password minimum length (6 characters)
- SQL injection protection dengan parameterized queries

### 4. **CORS Configuration**
- Proper CORS setup untuk cross-origin requests
- Secure headers configuration

## Database Schema

SQLite database `users.db` dengan tabel:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## User Flow

1. **First Time User:**
   - Mengunjungi landing page
   - Klik "Get Started" → redirect ke `/login`
   - Klik "Sign up" → redirect ke `/register`
   - Setelah register → auto login dan redirect ke `/app`

2. **Returning User:**
   - Mengunjungi landing page
   - Klik "Get Started" → redirect ke `/login`
   - Login berhasil → redirect ke `/app`

3. **Authenticated User:**
   - Dapat mengakses `/app` langsung
   - Melihat nama user di header
   - Dapat logout kapan saja

## Troubleshooting

### 1. **Auth API tidak berjalan**
- Pastikan port 5001 tidak digunakan aplikasi lain
- Check dependencies sudah terinstall: `pip install -r requirements.txt`
- Check environment variables di `.env`

### 2. **Token tidak valid**
- Clear localStorage di browser
- Login ulang untuk mendapatkan token baru

### 3. **CORS Error**
- Pastikan auth API berjalan di port 5001
- Check CORS configuration di `auth_api.py`

### 4. **Database Error**
- Database SQLite akan dibuat otomatis saat pertama kali menjalankan auth API
- Jika ada error, hapus file `users.db` dan restart auth API

## Production Considerations

Untuk deployment production, pastikan:

1. **Ganti JWT Secret** di environment variables
2. **Gunakan HTTPS** untuk semua komunikasi
3. **Setup proper database** (PostgreSQL/MySQL instead of SQLite)
4. **Implement rate limiting** untuk API endpoints
5. **Add proper logging** dan monitoring
6. **Setup backup** untuk user database

## Next Steps

Sistem autentikasi sudah siap digunakan. Beberapa enhancement yang bisa ditambahkan:

1. **Password Reset** functionality
2. **Email Verification** untuk registrasi
3. **Social Login** (Google, GitHub, etc.)
4. **User Profile** management
5. **Admin Panel** untuk user management
6. **Audit Logging** untuk security tracking
