import os
import urllib.request

def download_model(url, filename):
    os.makedirs('weights', exist_ok=True)
    filepath = os.path.join('weights', filename)
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, filepath)
    size = os.path.getsize(filepath) / 1024 / 1024
    print(f"✅ {filename} downloaded ({size:.1f} MB)")

# Download main model
download_model(
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
    'RealESRGAN_x4plus.pth'
)

# Download anime model
download_model(
    'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
    'RealESRGAN_x4plus_anime_6B.pth'
)

print("\n✅ Models downloaded successfully!")
print("Run: python inference_realesrgan.py -n RealESRGAN_x4plus -i inputs/00.jpg -o outputs/out.png")
