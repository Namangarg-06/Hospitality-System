# NG DineAI

> **Smarter Dining. Smarter Operations.**  
> A luxury hospitality technology SaaS combining AI-powered digital menus, grounded sommelier copilots, customer review intelligence, deterministic sales analytics, kitchen food waste tracking, and a cross-module proactive Action Engine.

---

## 🌟 Executive Summary

NG DineAI provides premium hospitality venues—fine-dining establishments, boutique cafes, hotel restaurants, cloud kitchens, and dining chains—with a single intelligent platform to publish menus, serve diners through grounded AI, analyze operational feedback, dispatch kitchen tickets, monitor sales, and eliminate food waste.

Built with an editorial luxury design system inspired by the visual restraint of fine-dining hospitality:
- **Primary Forest Green**: `#173D32`
- **Deep Velvet Green**: `#102C25`
- **Champagne Accent**: `#C6A66A`
- **Warm Ivory Surface**: `#F8F6F0`
- **Editorial Typography**: *Playfair Display* & *Plus Jakarta Sans*

---

## 🚀 Key Modules & Capabilities

### 1. AI-Powered Digital QR Menu & Sommelier Assistant (`/m/:slug`)
- Mobile-first, ultrafast digital menu with category filtering and instant search.
- Pure Veg, Vegan, Jain, and Chef Special dietary filters.
- **Embedded Grounded AI Dining Host**:
  - Responds to budget queries (e.g., *"What vegetarian dishes cost under ₹500?"*).
  - Recommends food and beverage pairings with verified dish citations.
  - Zero hallucinations: exact prices and allergen constraints checked deterministically against the database.
- Seamless ordering with table number or takeaway options and live status tracking.

### 2. AI Menu Studio & Document Extraction (`/dashboard/menu`)
- Intuitive dish and category portfolio management.
- **PyMuPDF Document Parser**: Upload PDF or image menus to extract dishes and prices with an interactive **verification review screen** before publishing.
- **Multilingual AI Copywriter**: Generates short, long, Hindi (हिंदी), and Hinglish dish descriptions with suggested allergens and keywords.
- Dynamic high-resolution QR code generator with downloadable vector graphics.

### 3. Kitchen Order Display System (`/dashboard/orders`)
- Real-time incoming digital tickets from QR menus.
- Clear state-machine transitions: `Pending Confirmation` ➔ `Accepted` ➔ `Preparing` ➔ `Ready to Serve` ➔ `Fulfilled & Paid`.
- Server-side price calculation prevents browser manipulation.

### 4. Customer Review Intelligence & AI Reply Studio (`/dashboard/reviews`)
- CSV review ingestion and manual review logging.
- Deterministic sentiment scoring and 9-point topic classification (*Food Quality*, *Taste*, *Service Speed*, *Staff Behavior*, *Cleanliness*, *Pricing*, *Ambience*, *Delivery*, *Accuracy*).
- **Complaint Pattern Detection**: Highlights recurring grievances with direct guest quotation evidence.
- **AI Review Reply Studio**: Generates polite replies in English, Hindi, and Hinglish across Professional, Warm, or Concise tones without making unauthorized promises or financial compensation.

### 5. Deterministic Sales Analytics (`/dashboard/analytics`)
- Pure mathematical calculation of gross revenue, net sales, order counts, and Average Order Value (AOV).
- Interactive daily revenue bar cadence chart.
- Best-selling signatures vs slow-moving dish matrices.
- CSV financial import with parsing validation.

### 6. Food-Waste Intelligence (`/dashboard/waste`)
- Kitchen discard logging with quantities, units (kg, portions, liters), reasons (*Over-Preparation*, *Spoilage*, *Plate Waste*, *Preparation Error*, *Expired*), and financial loss estimates.
- Cost summaries, reasons breakdown, and AI reduction directives grounded in shift data.

### 7. AI Restaurant Action Engine (`/dashboard/actions`)
- Central autonomous operational intelligence uniting all modules:
  - Detects repeated service delay complaints on peak days.
  - Flags high recurring food-waste items.
  - Escalates pending kitchen orders.
  - Reminds staff of unreplied negative reviews.
  - Audits menu items missing allergen declarations.
- Severity classification: `CRITICAL`, `WARNING`, `OPTIMIZATION`, and `NOTICE` with one-click resolution.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, QRcode.react |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic |
| **Document AI** | PyMuPDF (`pymupdf`), Regex parsing, Structured Extraction Engine |
| **Generative AI**| Grounded RAG, Google Gemini / OpenAI REST integration, Safe Fallback |
| **Database** | SQLite (Instant zero-friction dev/testing) & PostgreSQL 16 with `pgvector` |
| **Deployment** | Docker, Docker Compose, Nginx, Multi-stage builds |

---

## ⚡ Quickstart Guide

### Option 1: 1-Click Unified Launcher (Vyapar Style — Recommended)

Run everything in a single port with one command (no Node.js required):

```bash
python run_app.py
# or:
.\venv\Scripts\python.exe run_app.py
```

Or simply double-click **`START_APP.bat`** or **`RUN.bat`** in Windows Explorer!

- **Unified Web Application**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Control Center**: Double-click **`RUN_MENU.bat`**
- **Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Live QR Menu**: [http://127.0.0.1:8000/m/the-royal-saffron](http://127.0.0.1:8000/m/the-royal-saffron)

---

### Option 2: Full Dev Mode (With Hot-Reload)

#### 1. Backend Setup
```bash
# In project root:
.\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
*The database automatically initializes and pre-seeds "The Royal Saffron" demo dataset.*
- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option 3: Docker Compose Setup
```bash
cp .env.example .env
docker compose up -d --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

---

## 🔑 Pre-Seeded Demo Credentials

Explore the platform instantly using the 1-click **"Fill Demo"** button on `/login` or enter manually:

| Parameter | Value |
| :--- | :--- |
| **Email** | `owner@dineai.com` |
| **Password** | `DineAI@2026` |
| **Venue** | **The Royal Saffron** (Fine Dining) |
| **Live QR Menu** | `http://localhost:5173/m/the-royal-saffron` |

---

## 🧪 Automated Test Suite

Run the comprehensive pytest suite covering authentication, RBAC, menu retrieval, grounded AI assistant, server-side pricing, review analytics, and the Action Engine:

```bash
cd backend
..\venv\Scripts\pytest.exe -v
```

Expected result:
```
======================= 7 passed in 1.12s =======================
```

To build and verify the frontend production bundle:
```bash
cd frontend
npm run build
```

---

## 📄 License & Intellectual Property
NG DineAI is proprietary software engineered for modern restaurant hospitality management.