# NG DineAI — Technical Architecture Document

## 1. System Overview
**NG DineAI** is a unified hospitality growth and operations software-as-a-service (SaaS) platform built to combine digital customer dining, AI menu copilot services, guest review intelligence, deterministic sales analytics, kitchen food waste tracking, and a cross-module proactive Action Engine into a cohesive, luxury-grade web application.

```
+-----------------------------------------------------------------------------------+
|                                  NG DineAI SaaS                                   |
+-----------------------------------------------------------------------------------+
|  [Public Marketing Web]  |  [Mobile Digital QR Menu]  |  [Staff Management Suite] |
+-----------------------------------------------------------------------------------+
                                         |
                                (REST APIs via JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                          FastAPI Backend Service (:8000)                          |
+-----------------------------------------------------------------------------------+
|  Auth & RBAC   |  AI Menu Studio  |  Order KDS  |  Reviews  |  Sales  |   Waste   |
|   (JWT, Salt)  |  (PyMuPDF/Lang)  | (Workflow)  |  (NLP)    | (Math)  |  (Costs)  |
+-----------------------------------------------------------------------------------+
                                         |
      +----------------------------------+----------------------------------+
      |                                                                     |
      v                                                                     v
+-----------------------------+                       +-----------------------------+
|    AI Services & RAG        |                       |    Multi-Tenant Database    |
+-----------------------------+                       +-----------------------------+
| • LLM Client (Gemini/OpenAI)|                       | • SQLite (Zero-Setup Dev)   |
| • Grounded Menu RAG Host    |                       | • PostgreSQL 16 + pgvector  |
| • Multilingual Copywriting  |                       | • Strict Tenant Foreign Keys|
| • Central Action Engine     |                       | • Alembic Database Migration|
+-----------------------------+                       +-----------------------------+
```

---

## 2. Multi-Tenant Isolation Architecture
1. **Tenant Model**:
   - Every dining establishment operates as an isolated `Workspace` identified by a slug and unique integer `workspace_id`.
   - Access to workspace data requires an explicit `WorkspaceMembership` linking the authenticated `User` with an authorized role (`OWNER`, `MANAGER`, or `STAFF`).
2. **Strict Backend Enforcement**:
   - The API dependency `get_current_workspace` extracts the tenant from header `X-Workspace-ID` and verifies tenant membership against the database before executing any query.
   - All data queries for `MenuItem`, `Order`, `CustomerReview`, `SalesRecord`, `FoodWasteRecord`, and `ActionInsight` are scoped by `workspace_id`.
   - Direct cross-tenant data access attempts return `403 Forbidden` or `404 Not Found`.

---

## 3. Generative AI & Grounded RAG Pipeline
1. **Zero Hallucination Guardrails**:
   - Customer-facing queries concerning prices, dish existence, and dietary attributes are executed deterministically against structured database columns (`price`, `dietary_badges`, `allergens`, `is_available`).
   - The LLM synthesizes natural hospitality dialogue and sommelier recommendations grounded strictly in verified dishes retrieved from the database.
   - Unlisted allergens or medical claims trigger an explicit refusal and recommendation to verify with dining room captains.
2. **Review Reply Studio**:
   - Generates responses adhering to hospitality policies: no unauthorized promises of free food, refunds, or financial compensation.
   - Requires explicit human review and approval before replies are marked completed.
3. **Menu Extraction**:
   - Utilizes `PyMuPDF` (`pymupdf`) to parse raw text from uploaded menu PDFs.
   - Generates structured candidate dishes in an interactive review screen for human approval before persisting to production menu tables.

---

## 4. Central Action Engine
The Action Engine acts as the autonomous operational nervous system of the venue by periodically evaluating:
- **Service Delay Patterns**: Flags repeated negative guest reviews citing wait times.
- **Kitchen Waste Traps**: Detects high recurring discarded quantities for specific dishes.
- **Pending Order Escalation**: Alerts managers when live digital orders await kitchen confirmation.
- **Feedback Backlog**: Identifies unreplied negative reviews requiring managerial attention.
- **Menu Completeness**: Highlights dishes lacking allergen tags to maintain diner safety.

---

## 5. Security & Privacy
- Passwords are encrypted using salted `bcrypt` hashes.
- Session tokens are signed using `HS256` JWTs with 7-day expiration.
- CORS policies restrict cross-origin requests to trusted origins.
- Sensitive financial calculations (AOV, gross sales, net sales, taxes) are computed deterministically in Python/SQL without delegation to LLMs.
