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


def open_browser(port: int = 8000):
    time.sleep(1.2)
    url = f"http://127.0.0.1:{port}"
    print(f"\n[Browser] Opening {url} in your browser...\n")
    try:
        webbrowser.open(url)
    except Exception as exc:
        print(f"[Warning] Could not automatically open browser: {exc}")


def is_port_in_use(port: int = 8000) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


def free_port(port: int = 8000) -> int:
    """Ensure port is available by terminating any stale process occupying it."""
    if not is_port_in_use(port):
        return port

    print(f"\n[Port Manager] Port {port} is occupied by another application. Reclaiming port {port}...")
    try:
        import subprocess
        output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True, text=True)
        current_pid = os.getpid()
        for line in output.strip().splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pid = int(parts[-1])
                if pid != current_pid and pid > 0:
                    subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
    except Exception as exc:
        print(f"[Port Manager] Notice: {exc}")

    # Wait up to 2.5 seconds for socket to be released by Windows TCP stack
    for _ in range(5):
        time.sleep(0.5)
        if not is_port_in_use(port):
            print(f"[Port Manager] Port {port} successfully freed for NG DineAI.\n")
            return port

    # If port 8000 is still held, find first available alternate port
    for alt in [8000, 8001, 8080, 8088]:
        if not is_port_in_use(alt):
            print(f"[Port Manager] Port {port} could not be freed. Using available port {alt} instead.\n")
            return alt

    return port


def main():
    active_port = free_port(8000)

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
    print(f" -> Unified Web App:      http://127.0.0.1:{active_port}")
    print(f" -> Smart QR & PDF Menu:  http://127.0.0.1:{active_port}/qr-generator")
    print(f" -> Owner Dashboard:      http://127.0.0.1:{active_port}/dashboard")
    print(f" -> Live QR Menu Demo:    http://127.0.0.1:{active_port}/m/the-royal-saffron")
    print(f" -> Interactive API Docs: http://127.0.0.1:{active_port}/docs")
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

    threading.Thread(target=open_browser, args=(active_port,), daemon=True).start()
    try:
        uvicorn.run("app.main:app", host="127.0.0.1", port=active_port, reload=False)
    except Exception as exc:
        print(f"\n[Warning] Could not bind to port {active_port}: {exc}")
        fallback_port = 8001 if active_port == 8000 else 8080
        print(f"[Server] Launching on fallback port {fallback_port}...")
        threading.Thread(target=open_browser, args=(fallback_port,), daemon=True).start()
        uvicorn.run("app.main:app", host="127.0.0.1", port=fallback_port, reload=False)


if __name__ == "__main__":
    main()
