"""Single-click unified launcher for NG DineAI.

Runs the FastAPI backend and serves the luxury React UI on http://127.0.0.1:8000
and automatically opens your browser.
"""

import os
import sys
import threading
import time
import webbrowser

# Add backend directory to Python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:8000"
    print(f"\n[Browser] Opening {url} in your browser...\n")
    try:
        webbrowser.open(url)
    except Exception as exc:
        print(f"[Warning] Could not automatically open browser: {exc}")


def main():
    print("=" * 70)
    print("      _   _  ____   ____  _             _    ___ ")
    print("     | \\ | |/ ___| |  _ \\(_)_ __   ___ / \\  |_ _|")
    print("     |  \\| | |  _  | | | | | '_ \\ / _ \\ / _ \\  | | ")
    print("     | |\\  | |_| | | |_| | | | | |  __/ ___ \\ | | ")
    print("     |_| \\_|\\____| |____/|_|_| |_|\\___/_/   \\_\\___|")
    print()
    print("        NG DineAI — Smarter Dining. Smarter Operations.")
    print("     Luxury Restaurant Growth & Operations SaaS Platform")
    print("=" * 70)
    print(" -> Unified Web App:     http://127.0.0.1:8000")
    print(" -> Owner Dashboard:     http://127.0.0.1:8000/dashboard")
    print(" -> Live QR Menu Demo:   http://127.0.0.1:8000/m/the-royal-saffron")
    print(" -> Interactive API Docs: http://127.0.0.1:8000/docs")
    print("-" * 70)
    print(" [Pre-configured Demo Credentials]")
    print("   Owner Email:  owner@royalsaffron.com")
    print("   Password:     RoyalPass123!")
    print("   Manager:      manager@royalsaffron.com")
    print("=" * 70)

    try:
        import uvicorn
    except ImportError:
        print("\n[Error] 'uvicorn' is not installed in the active Python environment.")
        print("Please activate your virtual environment or install requirements:")
        print("    pip install -r backend/requirements.txt")
        sys.exit(1)

    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)


if __name__ == "__main__":
    main()
