#!/usr/bin/env python3
"""
Start the Authentication API server
"""

import os
import sys
import subprocess

def main():
    # Change to API directory
    api_dir = os.path.join(os.path.dirname(__file__), 'api')
    os.chdir(api_dir)
    
    # Install dependencies if needed
    print("Installing Python dependencies...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
    
    # Start the auth API
    print("Starting Authentication API server on port 5001...")
    subprocess.run([sys.executable, 'auth_api.py'], check=True)

if __name__ == '__main__':
    main()
