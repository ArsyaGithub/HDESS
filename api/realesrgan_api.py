#!/usr/bin/env python3
"""
Flask API for Real-ESRGAN Image Enhancement
"""

import os
import sys
import cv2
import base64
import numpy as np
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import tempfile
import uuid
from datetime import datetime

# Add Real-ESRGAN path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'REAL-ESRGAN'))

from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
from realesrgan.archs.srvgg_arch import SRVGGNetCompact

app = Flask(__name__)
# Simple CORS configuration
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Initialize Real-ESRGAN models
models = {}
current_model = None

# Available models configuration
MODEL_CONFIG = {
    'RealESRGAN_x4plus': {
        'model': lambda: RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4),
        'scale': 4,
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
        'description': 'General purpose 4x upscaling model'
    },
    'RealESRGAN_x4plus_anime_6B': {
        'model': lambda: RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4),
        'scale': 4,
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
        'description': 'Optimized for anime/illustrations (faster)'
    },
    'RealESRNet_x4plus': {
        'model': lambda: RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4),
        'scale': 4,
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/RealESRNet_x4plus.pth',
        'description': 'Clean upscaling without artifacts'
    },
    'realesr-general-x4v3': {
        'model': lambda: SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4, act_type='prelu'),
        'scale': 4,
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth',
        'description': 'Latest model with denoise control (RECOMMENDED)'
    },
    'RealESRGAN_x2plus': {
        'model': lambda: RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2),
        'scale': 2,
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
        'description': '2x upscaling model'
    }
}

def detect_device():
    """Detect best available device for inference"""
    if torch.cuda.is_available():
        device_count = torch.cuda.device_count()
        print(f"🚀 CUDA detected! Available GPUs: {device_count}")
        for i in range(device_count):
            gpu_name = torch.cuda.get_device_name(i)
            print(f"   GPU {i}: {gpu_name}")
        return 0  # Use first GPU
    else:
        print("⚠️  CUDA not available, using CPU (will be slower)")
        return None

def init_realesrgan(model_name='realesr-general-x4v3'):
    """Initialize Real-ESRGAN model with CUDA optimization"""
    global models, current_model
    
    if model_name in models:
        current_model = model_name
        print(f"✅ Switched to model: {model_name}")
        return True
    
    try:
        # Get model configuration
        if model_name not in MODEL_CONFIG:
            print(f"❌ Unknown model: {model_name}")
            return False
            
        config = MODEL_CONFIG[model_name]
        model = config['model']()
        
        # Check for local model file first
        weights_dir = os.path.join(os.path.dirname(__file__), '..', 'Real-ESRGAN', 'weights')
        os.makedirs(weights_dir, exist_ok=True)
        model_path = os.path.join(weights_dir, f'{model_name}.pth')
        
        # Download model if not exists
        if not os.path.exists(model_path):
            print(f"📥 Downloading {model_name} model...")
            import urllib.request
            urllib.request.urlretrieve(config['url'], model_path)
            print(f"✅ Model downloaded: {model_path}")
        
        # Detect best device
        gpu_id = detect_device()
        use_half = gpu_id is not None  # Use fp16 only with GPU
        
        # Initialize upsampler with CUDA optimization
        upsampler = RealESRGANer(
            scale=config['scale'],
            model_path=model_path,
            model=model,
            tile=512 if gpu_id is not None else 256,  # Larger tiles for GPU
            tile_pad=10,
            pre_pad=0,
            half=use_half,  # Use fp16 for GPU, fp32 for CPU
            gpu_id=gpu_id  # Auto-detect GPU or use CPU
        )
        
        models[model_name] = upsampler
        current_model = model_name
        
        device_info = f"GPU {gpu_id}" if gpu_id is not None else "CPU"
        precision = "fp16" if use_half else "fp32"
        print(f"✅ {model_name} initialized successfully on {device_info} ({precision})")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing {model_name}: {e}")
        return False

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def image_to_base64(image_path):
    """Convert image to base64 string"""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

def base64_to_image(base64_string, output_path):
    """Convert base64 string to image file"""
    image_data = base64.b64decode(base64_string)
    with open(output_path, 'wb') as f:
        f.write(image_data)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': len(models) > 0,
        'current_model': current_model,
        'cuda_available': torch.cuda.is_available(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/enhance', methods=['POST'])
@cross_origin()
def enhance_image():
    """Enhance image using Real-ESRGAN"""
    global models, current_model
    
    if not models or current_model not in models:
        return jsonify({'error': 'Model not initialized'}), 500
    
    upsampler = models[current_model]
    
    try:
        # Check if file is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Get enhancement parameters
        requested_model = request.form.get('model', current_model)
        scale = float(request.form.get('scale', MODEL_CONFIG[current_model]['scale']))
        
        # Switch model if requested
        if requested_model != current_model and requested_model in MODEL_CONFIG:
            if not init_realesrgan(requested_model):
                return jsonify({'error': f'Failed to load model: {requested_model}'}), 500
            upsampler = models[current_model]
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        input_filename = f"{unique_id}_input.png"
        output_filename = f"{unique_id}_output.png"
        
        input_path = os.path.join(UPLOAD_FOLDER, input_filename)
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        # Save uploaded file
        file.save(input_path)
        
        # Read and process image
        img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({'error': 'Could not read image file'}), 400
        
        # Enhance image
        print(f"Enhancing image: {input_filename}")
        enhanced_img, _ = upsampler.enhance(img, outscale=scale)
        
        # Save enhanced image
        cv2.imwrite(output_path, enhanced_img)
        
        # Convert to base64 for response
        enhanced_base64 = image_to_base64(output_path)
        
        # Get file sizes
        original_size = os.path.getsize(input_path)
        enhanced_size = os.path.getsize(output_path)
        
        # Clean up files
        os.remove(input_path)
        os.remove(output_path)
        
        return jsonify({
            'success': True,
            'enhanced_image': enhanced_base64,
            'model_used': current_model,
            'scale': scale,
            'original_size': original_size,
            'enhanced_size': enhanced_size,
            'device': 'GPU' if torch.cuda.is_available() else 'CPU',
            'processing_time': 'completed'
        })
        
    except Exception as e:
        print(f"Enhancement error: {e}")
        return jsonify({'error': f'Enhancement failed: {str(e)}'}), 500

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available models"""
    available_models = []
    for name, config in MODEL_CONFIG.items():
        available_models.append({
            'name': name,
            'scale': config['scale'],
            'description': config['description'],
            'loaded': name in models,
            'current': name == current_model
        })
    
    return jsonify({
        'models': available_models,
        'cuda_available': torch.cuda.is_available(),
        'current_model': current_model
    })

@app.route('/api/switch-model', methods=['POST'])
@cross_origin()
def switch_model():
    """Switch to a different model"""
    data = request.get_json()
    model_name = data.get('model')
    
    if not model_name or model_name not in MODEL_CONFIG:
        return jsonify({'error': 'Invalid model name'}), 400
    
    if init_realesrgan(model_name):
        return jsonify({
            'success': True,
            'current_model': current_model,
            'message': f'Switched to {model_name}'
        })
    else:
        return jsonify({'error': f'Failed to load model: {model_name}'}), 500

if __name__ == '__main__':
    print("🚀 Starting Real-ESRGAN API Server...")
    
    # Initialize default model (best performance)
    if init_realesrgan('realesr-general-x4v3'):
        # Try different ports if 5000 is unavailable
        ports_to_try = [8080, 8000, 3000, 5001, 8888]
        port = None
        
        for try_port in ports_to_try:
            try:
                print(f"🌐 Attempting to start server on http://localhost:{try_port}")
                print("📝 API Endpoints:")
                print("  - GET  /api/health      - Health check")
                print("  - POST /api/enhance     - Enhance image")
                print("  - GET  /api/models      - Available models")
                print("  - POST /api/switch-model - Switch AI model")
                print(f"🤖 Current Model: {current_model}")
                print(f"🔧 Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")
                
                app.run(debug=True, host='0.0.0.0', port=try_port)
                break
            except OSError as e:
                if "Address already in use" in str(e) or "access permissions" in str(e).lower():
                    print(f"❌ Port {try_port} is unavailable, trying next port...")
                    continue
                else:
                    raise e
        else:
            print("❌ Could not find an available port. Please check your system configuration.")
            sys.exit(1)
    else:
        print("❌ Failed to initialize Real-ESRGAN model")
        sys.exit(1)
