# 🤖 Real-ESRGAN Model Integration Guide

## Saat Ini: Simulasi vs Real Processing

### Current State (Simulasi)
Aplikasi saat ini hanya **mensimulasi** pemrosesan AI:
- Model AI di `src/lib/supabase.ts` hanya untuk UI dropdown
- `ProgressBar.tsx` hanya menduplikasi gambar asli sebagai "enhanced"
- Tidak ada pemrosesan AI yang sebenarnya

### Real Processing Requirements
Untuk pemrosesan AI yang sebenarnya, Anda perlu:

## 1. Model Real-ESRGAN

### Download dari GitHub
```bash
# Clone repository Real-ESRGAN
git clone https://github.com/xinntao/Real-ESRGAN.git
cd Real-ESRGAN

# Install dependencies
pip install basicsr
pip install facexlib
pip install gfpgan
pip install -r requirements.txt
```

### Model Files yang Dibutuhkan
```bash
# Download pre-trained models
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth -P weights
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth -P weights
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/RealESRNet_x4plus.pth -P weights
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth -P weights
```

## 2. Backend API Options

### Option A: Python Flask API
```python
# app.py
from flask import Flask, request, jsonify, send_file
from PIL import Image
import cv2
import numpy as np
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet
import os

app = Flask(__name__)

# Initialize models
models = {
    'RealESRGAN_x4plus': {
        'model': RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4),
        'model_path': 'weights/RealESRGAN_x4plus.pth',
        'scale': 4
    },
    'RealESRGAN_x4plus_anime_6B': {
        'model': RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4),
        'model_path': 'weights/RealESRGAN_x4plus_anime_6B.pth',
        'scale': 4
    }
}

@app.route('/enhance', methods=['POST'])
def enhance_image():
    try:
        # Get uploaded file and model selection
        file = request.files['image']
        model_name = request.form.get('model', 'RealESRGAN_x4plus')
        
        # Load and process image
        img = Image.open(file.stream)
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Initialize Real-ESRGAN
        model_config = models[model_name]
        upsampler = RealESRGANer(
            scale=model_config['scale'],
            model_path=model_config['model_path'],
            model=model_config['model'],
            tile=0,
            tile_pad=10,
            pre_pad=0,
            half=False
        )
        
        # Enhance image
        output, _ = upsampler.enhance(img_cv, outscale=model_config['scale'])
        
        # Save and return enhanced image
        output_path = f'enhanced_{file.filename}'
        cv2.imwrite(output_path, output)
        
        return send_file(output_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Option B: Node.js + Python Child Process
```javascript
// server.js
const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/enhance', upload.single('image'), (req, res) => {
    const { model } = req.body;
    const inputPath = req.file.path;
    const outputPath = `enhanced_${Date.now()}.png`;
    
    // Call Real-ESRGAN Python script
    const python = spawn('python', [
        'inference_realesrgan.py',
        '-n', model,
        '-i', inputPath,
        '-o', outputPath,
        '-s', '4'
    ]);
    
    python.on('close', (code) => {
        if (code === 0) {
            res.sendFile(path.resolve(outputPath));
        } else {
            res.status(500).json({ error: 'Processing failed' });
        }
    });
});

app.listen(3001, () => {
    console.log('Real-ESRGAN API running on port 3001');
});
```

### Option C: Docker Container
```dockerfile
# Dockerfile
FROM python:3.8-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget

# Install Real-ESRGAN
WORKDIR /app
RUN git clone https://github.com/xinntao/Real-ESRGAN.git
WORKDIR /app/Real-ESRGAN

RUN pip install basicsr facexlib gfpgan
RUN pip install -r requirements.txt

# Download models
RUN mkdir -p weights
RUN wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth -P weights

COPY app.py .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 3. Frontend Integration

### Update ProgressBar.tsx
```typescript
const simulateCompletion = async () => {
  if (!processing) return

  try {
    // Call real API instead of simulation
    const formData = new FormData()
    
    // Get original image blob
    const response = await fetch(processing.original_url)
    const blob = await response.blob()
    
    formData.append('image', blob, processing.original_filename)
    formData.append('model', processing.model_used)
    
    // Call Real-ESRGAN API
    const apiResponse = await fetch(`${import.meta.env.VITE_IMAGE_PROCESSING_API_URL}/enhance`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_IMAGE_PROCESSING_API_KEY}`
      }
    })
    
    if (!apiResponse.ok) {
      throw new Error('API processing failed')
    }
    
    const enhancedBlob = await apiResponse.blob()
    
    // Upload enhanced image to Supabase
    const enhancedPath = `enhanced/enhanced_${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('enhanced-images')
      .upload(enhancedPath, enhancedBlob)
    
    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
}
```

## 4. Deployment Options

### Local Development
```bash
# Terminal 1: Start Real-ESRGAN API
cd Real-ESRGAN
python app.py

# Terminal 2: Start React app
cd your-project
npm run dev
```

### Cloud Deployment
1. **Google Colab** - Free GPU untuk testing
2. **Hugging Face Spaces** - Deploy model sebagai API
3. **Replicate** - Serverless AI model hosting
4. **AWS/GCP** - Custom server dengan GPU

## 5. Environment Variables

Update `.env`:
```env
# Existing Supabase config
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Real-ESRGAN API config
VITE_IMAGE_PROCESSING_API_URL=http://localhost:5000
VITE_IMAGE_PROCESSING_API_KEY=your_api_key
```

## 6. Alternative: Third-Party APIs

### Replicate API
```typescript
// Using Replicate's Real-ESRGAN model
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': 'Token your-replicate-token',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc972b7f1e036a8b17d652755",
    input: {
      image: processing.original_url,
      scale: 4
    }
  })
});
```

## Summary

**Untuk real processing, Anda perlu:**
1. ✅ Download Real-ESRGAN dari GitHub
2. ✅ Setup Python environment dengan dependencies
3. ✅ Download pre-trained model files (.pth)
4. ✅ Buat backend API (Flask/Node.js/Docker)
5. ✅ Update frontend untuk call real API
6. ✅ Deploy ke server dengan GPU (opsional tapi recommended)

**Current state:** Simulasi saja (cukup untuk demo UI)
**Next step:** Pilih salah satu option di atas untuk real processing
