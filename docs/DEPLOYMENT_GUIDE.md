# NG DineAI — Production Deployment Guide

## 1. Prerequisites
- Docker & Docker Compose **OR** Python 3.11+ and Node.js 20+
- PostgreSQL 15+ (with `pgvector` extension for semantic embeddings)
- (Optional) Google Gemini or OpenAI API Key

---

## 2. Docker Compose Deployment (Recommended)

1. **Clone repository**:
   ```bash
   git clone https://github.com/Namangarg-06/Hospitality-System.git
   cd Hospitality-System
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your production secret keys and credentials
   ```

3. **Launch complete container stack**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify container health**:
   ```bash
   docker compose ps
   ```
   - Frontend is accessible at `http://localhost:3000` (or your domain via reverse proxy)
   - Backend API is accessible at `http://localhost:8000`
   - PostgreSQL container runs on internal network with healthchecks

---

## 3. Native / Cloud Host Deployment (AWS EC2 / Render / Fly.io / VPS)

### A. Backend Setup
```bash
cd backend
python -m venv venv
# On Linux/macOS:
source venv/bin/activate
# On Windows:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### B. Frontend Setup
```bash
cd frontend
npm install
npm run build
# Serve the dist/ directory via Nginx, Caddy, Vercel, or Cloudflare Pages
```

### C. Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name dineai.yourdomain.com;

    location / {
        root /var/www/dineai-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Production Checklist
- [x] Rotate `SECRET_KEY` in production `.env`
- [x] Configure HTTPS SSL with Let's Encrypt / Certbot
- [x] Restrict CORS origins to canonical domains
- [x] Run `pytest` test suite before deployment (`pytest -v`)
- [x] Set PostgreSQL automated backup snapshots
