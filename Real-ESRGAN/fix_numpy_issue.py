#!/usr/bin/env python3
"""
Fix NumPy compatibility issue for Real-ESRGAN
"""

import subprocess
import sys

def run_command(cmd):
    """Run command and print output"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    return result.returncode == 0

def fix_numpy():
    """Fix NumPy version compatibility"""
    print("🔧 Fixing NumPy compatibility issue...")
    
    # Check current NumPy version
    try:
        import numpy
        print(f"Current NumPy version: {numpy.__version__}")
    except ImportError:
        print("NumPy not installed")
    
    # Uninstall current NumPy
    print("\n1. Uninstalling current NumPy...")
    run_command("pip uninstall numpy -y")
    
    # Install compatible NumPy version
    print("\n2. Installing compatible NumPy version...")
    success = run_command("pip install numpy==1.24.3")
    
    if success:
        print("\n✅ NumPy downgrade successful!")
        
        # Verify installation
        try:
            import numpy
            print(f"New NumPy version: {numpy.__version__}")
        except ImportError as e:
            print(f"❌ Error importing NumPy: {e}")
            return False
            
        return True
    else:
        print("❌ Failed to install NumPy 1.24.3")
        return False

def test_realesrgan():
    """Test Real-ESRGAN import"""
    print("\n🧪 Testing Real-ESRGAN imports...")
    
    try:
        from basicsr.archs.rrdbnet_arch import RRDBNet
        print("✅ basicsr import successful")
        
        import torch
        print("✅ torch import successful")
        
        print("✅ All imports working!")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

if __name__ == '__main__':
    if fix_numpy():
        if test_realesrgan():
            print("\n🎉 Real-ESRGAN is ready to use!")
            print("Run: python inference_realesrgan.py -n RealESRGAN_x4plus -i inputs/00003.png -o outputs/out.png")
        else:
            print("\n⚠️ NumPy fixed but Real-ESRGAN imports still failing")
    else:
        print("\n❌ Failed to fix NumPy compatibility")
