#!/usr/bin/env python3
"""
Start Real-ESRGAN API Server
"""

import os
import sys
import subprocess

def start_api():
    """Start the Real-ESRGAN API server"""
    print("🚀 Starting Real-ESRGAN API Server...")
    
    # Change to API directory
    api_dir = os.path.join(os.path.dirname(__file__), 'api')
    os.chdir(api_dir)
    
    # Install requirements if needed
    print("📦 Installing requirements...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
    
    # Start Flask server
    print("🌐 Starting Flask server on http://localhost:5000")
    subprocess.run([sys.executable, 'realesrgan_api.py'])

if __name__ == '__main__':
    start_api()
