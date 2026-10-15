import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "NG DineAI"

def test_login_demo_owner(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "owner@dineai.com",
        "password": "DineAI@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["workspace"]["slug"] == "the-royal-saffron"
    assert data["workspace"]["role"] == "OWNER"

def test_public_qr_menu_retrieval(client):
    response = client.get("/api/v1/public/menu/the-royal-saffron")
    assert response.status_code == 200
    data = response.json()
    assert data["restaurant"]["name"] == "The Royal Saffron"
    assert len(data["categories"]) >= 3
    # Verify dishes
    first_cat = data["categories"][0]
    assert len(first_cat["items"]) > 0
    assert "price" in first_cat["items"][0]

def test_customer_ai_menu_assistant(client):
    response = client.post("/api/v1/public/menu/the-royal-saffron/ai-assistant", json={
        "message": "Which vegetarian dishes cost under ₹500?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["grounded_in_menu"] is True
    assert len(data["recommended_dishes"]) > 0
    for dish in data["recommended_dishes"]:
        assert dish["price"] <= 500
        assert "veg" in [b.lower() for b in dish["dietary_badges"]]

def test_customer_order_placement_server_side_pricing(client):
    # First get an item
    menu_resp = client.get("/api/v1/public/menu/the-royal-saffron")
    item = menu_resp.json()["categories"][0]["items"][0]
    item_id = item["id"]
    unit_price = item["price"]

    # Place order for 2 portions
    order_resp = client.post("/api/v1/public/menu/the-royal-saffron/order", json={
        "customer_name": "Arjun Malhotra",
        "customer_phone": "+91 99887 76655",
        "order_type": "DINE_IN",
        "table_number": "Table 12",
        "items": [{"menu_item_id": item_id, "quantity": 2, "notes": "Extra crispy"}]
    })
    assert order_resp.status_code == 200
    order = order_resp.json()
    assert order["status"] == "PENDING"
    assert order["subtotal"] == unit_price * 2
    assert order["total_amount"] > order["subtotal"]  # includes tax / service charge

def test_review_intelligence_summary(client):
    # Login to get auth token
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "owner@dineai.com",
        "password": "DineAI@2026"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    summary_resp = client.get("/api/v1/reviews/intelligence-summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_reviews"] >= 2
    assert "positive_percentage" in summary

def test_action_engine_insights(client):
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "owner@dineai.com",
        "password": "DineAI@2026"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    actions_resp = client.get("/api/v1/actions", headers=headers)
    assert actions_resp.status_code == 200
    insights = actions_resp.json()
    assert len(insights) > 0
    assert any("Service" in i["title"] or "Waste" in i["title"] or "Order" in i["title"] for i in insights)
