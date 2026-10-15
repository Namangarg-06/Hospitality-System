# NG DineAI — REST API Documentation

The NG DineAI backend runs on **FastAPI** and provides comprehensive, typed, and authenticated REST endpoints under `/api/v1`.

Interactive Swagger UI is accessible at:
```
http://localhost:8000/docs
```

Interactive ReDoc is accessible at:
```
http://localhost:8000/redoc
```

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Creates a user account and auto-provisions a restaurant workspace.
- **Request Body**:
  ```json
  {
    "email": "gm@restaurant.com",
    "password": "SecurePassword123",
    "full_name": "Arjun Singhania",
    "restaurant_name": "The Saffron Courtyard",
    "restaurant_type": "Fine Dining"
  }
  ```
- **Response**: JWT token, user profile, and active workspace metadata.

### `POST /api/v1/auth/login`
Authenticates user and issues access token.
- **Request Body**:
  ```json
  {
    "email": "owner@dineai.com",
    "password": "DineAI@2026"
  }
  ```
- **Response**: `access_token`, `token_type`, `user`, and `workspace`.

### `GET /api/v1/auth/me`
Returns current user profile and list of associated restaurant workspaces.

---

## 2. Public QR Digital Menu (`/api/v1/public/menu`)

### `GET /api/v1/public/menu/{slug}`
Returns active public menu dishes, categories, restaurant branding, and ordering settings.
- **Slug**: Unique restaurant identifier (e.g., `the-royal-saffron`).

### `POST /api/v1/public/menu/{slug}/ai-assistant`
Grounded conversational AI host assistant.
- **Request Body**:
  ```json
  {
    "message": "Which vegetarian dishes cost under ₹500?",
    "table_number": "Table 4"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "We are delighted to recommend our Truffle Malai Paneer Tikka (₹485) and Dal Royal Saffron (₹420)...",
    "recommended_dishes": [
      {
        "dish_id": 1,
        "name": "Truffle Malai Paneer Tikka",
        "price": 485.0,
        "dietary_badges": ["veg", "chef-special"]
      }
    ],
    "grounded_in_menu": true
  }
  ```

### `POST /api/v1/public/menu/{slug}/order`
Submits a customer order with trusted server-side price computation.
- **Request Body**:
  ```json
  {
    "customer_name": "Pooja Batra",
    "customer_phone": "+91 98110 00000",
    "order_type": "DINE_IN",
    "table_number": "Table 4",
    "notes": "Mild spices please",
    "items": [
      { "menu_item_id": 1, "quantity": 1 }
    ]
  }
  ```

### `GET /api/v1/public/menu/{slug}/order-status/{order_number}`
Returns real-time kitchen status progression (`PENDING` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `COMPLETED`).

---

## 3. Menu Studio (`/api/v1/menus`)
*Requires `Authorization: Bearer <token>` and `X-Workspace-ID` header.*

- `GET /api/v1/menus/categories`: Lists categories.
- `POST /api/v1/menus/categories`: Creates category.
- `GET /api/v1/menus/items`: Lists dishes with optional search and category filters.
- `POST /api/v1/menus/items`: Creates dish.
- `PUT /api/v1/menus/items/{id}`: Updates dish details, availability, or pricing.
- `DELETE /api/v1/menus/items/{id}`: Removes dish.
- `POST /api/v1/menus/generate-description`: Generates descriptions in English, Hindi, and Hinglish.
- `POST /api/v1/menus/upload-pdf`: Parses menu PDF with PyMuPDF and outputs candidate items for review.
- `POST /api/v1/menus/approve-imported`: Converts approved items into database menu records.

---

## 4. Kitchen Order Management (`/api/v1/orders`)
- `GET /api/v1/orders`: Lists orders with optional status filter.
- `PATCH /api/v1/orders/{id}/status`: Transitions order status (`ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`).

---

## 5. Customer Review Intelligence (`/api/v1/reviews`)
- `GET /api/v1/reviews`: Lists reviews with sentiment and rating filters.
- `POST /api/v1/reviews`: Adds guest review.
- `POST /api/v1/reviews/import-csv`: Uploads review CSV.
- `GET /api/v1/reviews/intelligence-summary`: Aggregates sentiment ratio, recurring complaints with quotes, and topic distribution.
- `POST /api/v1/reviews/{id}/generate-reply`: Generates AI draft with selected tone and language.
- `POST /api/v1/reviews/drafts/{id}/approve`: Approves draft and updates status to `REPLIED`.

---

## 6. Sales Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics/summary?days=14`: Revenue, net sales, volume, AOV, top/slow dishes, daily trend.
- `POST /api/v1/analytics/import-csv`: Ingests sales ledger CSV.

---

## 7. Food-Waste Intelligence (`/api/v1/waste`)
- `GET /api/v1/waste`: Shift logs of discarded dishes and ingredients.
- `POST /api/v1/waste`: Logs waste entry with reason and financial loss estimate.
- `GET /api/v1/waste/summary`: Reasons breakdown, cost impact, and AI reduction directives.

---

## 8. AI Action Engine (`/api/v1/actions`)
- `GET /api/v1/actions`: Real-time operational alert insights.
- `PATCH /api/v1/actions/{id}`: Resolves or dismisses alert.
- `POST /api/v1/actions/refresh`: Evaluates venue data and synthesizes updated recommendations.
