import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_smart_qr_lifecycle():
    with TestClient(app) as client:
        # 1. Create a new restaurant Smart QR with PDF upload simulation
        fake_pdf_content = b"%PDF-1.4 Fake PDF Content for Menu"
        files = {
            "pdf_file": ("test_menu.pdf", io.BytesIO(fake_pdf_content), "application/pdf")
        }
        data = {
            "restaurant_name": "Test Biryani Palace",
            "phone": "+91 99999 88888",
            "whatsapp_number": "+91 99999 88888",
            "google_review_url": "https://g.page/r/test-biryani/review",
            "upi_id": "testbiryani@upi",
            "wifi_name": "BiryaniGuestWiFi",
            "wifi_password": "biryanipassword123",
            "restaurant_type": "Mughlai & Biryani",
            "city": "Hyderabad",
        }
        response = client.post("/api/v1/public/menu/smart-qr", data=data, files=files)
        assert response.status_code == 200, response.text
        res_json = response.json()
        assert res_json["status"] == "success"
        assert res_json["restaurant_name"] == "Test Biryani Palace"
        assert "slug" in res_json
        slug = res_json["slug"]
        assert res_json["pdf_menu_url"] is not None
        assert "test_menu.pdf" in res_json["pdf_menu_filename"]

        # 2. Get list of Smart QRs
        list_response = client.get("/api/v1/public/menu/smart-qrs")
        assert list_response.status_code == 200
        all_qrs = list_response.json()
        assert any(q["slug"] == slug for q in all_qrs)

        # 3. Update restaurant details AND replace PDF without changing slug/QR
        new_pdf_content = b"%PDF-1.4 Updated New Seasonal Menu PDF"
        new_files = {
            "pdf_file": ("new_season_menu.pdf", io.BytesIO(new_pdf_content), "application/pdf")
        }
        update_data = {
            "restaurant_name": "Test Biryani Palace & Fine Dining",
            "phone": "+91 77777 66666",
            "whatsapp_number": "+91 77777 66666",
            "google_review_url": "https://g.page/r/updated-biryani/review",
            "upi_id": "newbiryani@upi",
            "wifi_name": "UpdatedWiFi",
            "wifi_password": "newpass",
        }
        update_response = client.put(f"/api/v1/public/menu/smart-qr/{slug}", data=update_data, files=new_files)
        assert update_response.status_code == 200, update_response.text
        upd_json = update_response.json()
        # CRITICAL: slug MUST remain identical!
        assert upd_json["slug"] == slug
        assert upd_json["restaurant_name"] == "Test Biryani Palace & Fine Dining"
        assert upd_json["whatsapp_number"] == "+91 77777 66666"
        assert "new_season_menu.pdf" in upd_json["pdf_menu_filename"]

        # 4. Verify public customer menu view returns updated info
        public_response = client.get(f"/api/v1/public/menu/{slug}")
        assert public_response.status_code == 200
        public_json = public_response.json()
        restro = public_json["restaurant"]
        assert restro["name"] == "Test Biryani Palace & Fine Dining"
        assert restro["whatsapp_number"] == "+91 77777 66666"
        assert restro["google_review_url"] == "https://g.page/r/updated-biryani/review"
        assert restro["upi_id"] == "newbiryani@upi"
        assert restro["wifi_name"] == "UpdatedWiFi"
        assert restro["pdf_menu_url"] is not None

        # 5. Delete test restaurant
        del_response = client.delete(f"/api/v1/public/menu/smart-qr/{slug}")
        assert del_response.status_code == 200
