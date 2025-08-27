#!/usr/bin/env python3
"""
Download Real-ESRGAN model files
"""

import os
import requests
from tqdm import tqdm

def download_file(url, filename):
    """Download file with progress bar"""
    print(f"Downloading {filename}...")
    
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    os.makedirs('weights', exist_ok=True)
    filepath = os.path.join('weights', filename)
    
    with open(filepath, 'wb') as file, tqdm(
        desc=filename,
        total=total_size,
        unit='B',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file.write(chunk)
                bar.update(len(chunk))
    
    print(f"✅ Downloaded {filename} ({total_size / 1024 / 1024:.1f} MB)")

def main():
    """Download all Real-ESRGAN models"""
    models = [
        {
            'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
            'filename': 'RealESRGAN_x4plus.pth'
        },
        {
            'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
            'filename': 'RealESRGAN_x4plus_anime_6B.pth'
        },
        {
            'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/RealESRNet_x4plus.pth',
            'filename': 'RealESRNet_x4plus.pth'
        },
        {
            'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
            'filename': 'RealESRGAN_x2plus.pth'
        }
    ]
    
    print("🤖 Downloading Real-ESRGAN Models...")
    print("=" * 50)
    
    for model in models:
        try:
            download_file(model['url'], model['filename'])
        except Exception as e:
            print(f"❌ Error downloading {model['filename']}: {e}")
    
    print("\n✅ Download complete!")
    print("Models saved in 'weights/' folder")
    
    # List downloaded files
    if os.path.exists('weights'):
        print("\nDownloaded models:")
        for file in os.listdir('weights'):
            if file.endswith('.pth'):
                size = os.path.getsize(os.path.join('weights', file)) / 1024 / 1024
                print(f"  📦 {file} ({size:.1f} MB)")

if __name__ == '__main__':
    main()
