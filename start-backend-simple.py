#!/usr/bin/env python3
"""
Simple backend starter without problematic dependencies
"""

import os
import sys
import cv2
import base64
import numpy as np
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import uuid
from datetime import datetime

# Add Real-ESRGAN path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Real-ESRGAN'))

from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
from realesrgan.archs.srvgg_arch import SRVGGNetCompact

app = Flask(__name__)
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
    'realesr-general-x4v3': {
        'model': lambda: SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4, act_type='prelu'),
        'scale': 4,
        'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth',
        'description': 'Latest general model with denoise control (RECOMMENDED)'
    }
}

def detect_device():
    """Detect best available device for inference"""
    if torch.cuda.is_available():
        print(f"🚀 CUDA detected! Available GPUs: {torch.cuda.device_count()}")
        return 0
    else:
        print("⚠️  CUDA not available, using CPU")
        return None

def init_realesrgan(model_name='realesr-general-x4v3'):
    """Initialize Real-ESRGAN model"""
    global models, current_model
    
    if model_name in models:
        current_model = model_name
        print(f"✅ Switched to model: {model_name}")
        return True
    
    try:
        if model_name not in MODEL_CONFIG:
            print(f"❌ Unknown model: {model_name}")
            return False
            
        config = MODEL_CONFIG[model_name]
        model = config['model']()
        
        # Check for local model file
        weights_dir = os.path.join(os.path.dirname(__file__), 'Real-ESRGAN', 'weights')
        os.makedirs(weights_dir, exist_ok=True)
        model_path = os.path.join(weights_dir, f'{model_name}.pth')
        
        # Download model if not exists
        if not os.path.exists(model_path):
            print(f"📥 Downloading {model_name} model...")
            import urllib.request
            urllib.request.urlretrieve(config['url'], model_path)
            print(f"✅ Model downloaded: {model_path}")
        
        # Detect device
        gpu_id = detect_device()
        use_half = gpu_id is not None
        
        # Initialize upsampler
        upsampler = RealESRGANer(
            scale=config['scale'],
            model_path=model_path,
            model=model,
            tile=512 if gpu_id is not None else 256,
            tile_pad=10,
            pre_pad=0,
            half=use_half,
            gpu_id=gpu_id
        )
        
        models[model_name] = upsampler
        current_model = model_name
        
        device_info = f"GPU {gpu_id}" if gpu_id is not None else "CPU"
        print(f"✅ {model_name} initialized on {device_info}")
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
        
        # Basic file validation
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({'error': 'File too large. Maximum size is 10MB'}), 400
        
        if file_size == 0:
            return jsonify({'error': 'Empty file'}), 400
        
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
        enhanced_img, _ = upsampler.enhance(img, outscale=4)
        
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
            'scale': 4,
            'original_size': original_size,
            'enhanced_size': enhanced_size,
            'device': 'GPU' if torch.cuda.is_available() else 'CPU'
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

if __name__ == '__main__':
    print("🚀 Starting Simple Real-ESRGAN API Server...")
    
    # Initialize default model
    if init_realesrgan('realesr-general-x4v3'):
        print("🌐 Starting server on http://localhost:8080")
        print("📝 API Endpoints:")
        print("  - GET  /api/health      - Health check")
        print("  - POST /api/enhance     - Enhance image")
        print("  - GET  /api/models      - Available models")
        print(f"🤖 Current Model: {current_model}")
        print(f"🔧 Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")
        
        app.run(debug=True, host='0.0.0.0', port=8080)
    else:
        print("❌ Failed to initialize Real-ESRGAN model")
        sys.exit(1)
