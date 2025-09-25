# Running HDESS Optimizations Without Docker

## Quick Start

### 1. Install Backend Dependencies
```bash
cd api
pip install -r requirements.txt
```

### 2. Start Backend (Optimized)
```bash
cd api
python realesrgan_api.py
```

### 3. Start Frontend
```bash
npm run dev
```

## Alternative: Install Docker Desktop

1. **Download Docker Desktop**: https://www.docker.com/products/docker-desktop/
2. **Install and restart** your computer
3. **Run with Docker**:
   ```bash
   docker-compose up --build
   ```

## Redis Setup (Optional for Caching)

### Option 1: Windows Redis
```bash
# Download Redis for Windows
# https://github.com/microsoftarchive/redis/releases
```

### Option 2: Redis via WSL
```bash
wsl --install
wsl
sudo apt update
sudo apt install redis-server
redis-server
```

### Option 3: Skip Redis (Fallback Mode)
The optimized backend will work without Redis, using in-memory caching instead.

## Testing Optimizations

1. **Backend Features**:
   - Rate limiting (5 requests/minute for enhancement)
   - Enhanced file validation
   - System monitoring
   - Improved logging

2. **Frontend Features**:
   - Error boundaries
   - Loading spinners with progress
   - Lazy loading components
   - Code splitting

## Environment Variables

Create `.env` file in root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_IMAGE_PROCESSING_API_URL=http://localhost:8080
REDIS_HOST=localhost
REDIS_PORT=6379
```
