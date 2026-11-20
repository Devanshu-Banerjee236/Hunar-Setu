"""
Hunar Setu - Server Launcher
Runs FastAPI backend on port 8000.
"""

import sys
import os
import uvicorn

# Ensure app package is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    print(f"===========================================================", flush=True)
    print(f"  Hunar Setu - Verified skills. Trusted jobs.", flush=True)
    print(f"  Team The Bridge Coders · Jadavpur University", flush=True)
    print(f"  Server starting at: http://127.0.0.1:{port}", flush=True)
    print(f"  API Documentation:  http://127.0.0.1:{port}/docs", flush=True)
    print(f"===========================================================", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
