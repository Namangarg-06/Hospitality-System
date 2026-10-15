import random
import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership, RestaurantSettings
from app.models.menu import MenuCategory, MenuItem
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.schemas.order import OrderCreateRequest, OrderResponse
from app.schemas.ai_chat import CustomerAIChatRequest, CustomerAIChatResponse
from app.services.ai.menu_rag_service import menu_rag_service

router = APIRouter(prefix="/public/menu", tags=["Public Digital QR Menu"])

class QuickCreateRestaurantRequest(BaseModel):
    restaurant_name: str
    restaurant_type: Optional[str] = "Fine Dining"
    cuisine_preset: Optional[str] = "indian"  # "indian" | "cafe" | "fast_food" | "street_food"
    city: Optional[str] = "Delhi NCR"
    phone: Optional[str] = "+91 98765 43210"

PRESET_MENUS = {
    "indian": [
        {
            "category": "Royal Starters",
            "items": [
                {"name": "Paneer Tikka Achari", "price": 280, "short_description": "Cottage cheese marinated in pickling spices roasted in tandoor.", "description_hi": "अचारी मसालों में भुना हुआ पनीर टिक्का।", "dietary_badges": ["veg", "chef-special"], "spice_level": "medium", "ingredients": ["Paneer", "Yogurt", "Pickle Spices", "Mustard Oil"]},
                {"name": "Hara Bhara Kebab", "price": 220, "short_description": "Crispy pan-fried spinach and green pea patties with chaat masala.", "description_hi": "पालक और हरी मटर के कुरकुरे कबाब।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Spinach", "Green Peas", "Potato", "Chaat Masala"]},
                {"name": "Tandoori Chicken Tikka", "price": 340, "short_description": "Succulent boneless chicken morsels charred with Kashmiri chili and mustard.", "description_hi": "तंदूरी मसालों में रोस्ट किया हुआ रसीला चिकन टिक्का।", "dietary_badges": ["non-veg"], "spice_level": "medium", "ingredients": ["Chicken", "Kashmiri Chili", "Yogurt", "Fenugreek"]}
            ]
        },
        {
            "category": "Signature Curries",
            "items": [
                {"name": "Dal Makhani Handi", "price": 260, "short_description": "Slow-simmered black lentils cooked overnight with butter and fresh cream.", "description_hi": "धीमी आंच पर मक्खन और क्रीम के साथ पकी दाल मखनी।", "dietary_badges": ["veg", "chef-special"], "spice_level": "mild", "ingredients": ["Black Lentils", "White Butter", "Tomatoes", "Cream"]},
                {"name": "Paneer Butter Masala", "price": 290, "short_description": "Silken cottage cheese cubes in rich tomato-cashew satin gravy.", "description_hi": "टमाटर और काजू की मलाईदार ग्रेवी में पनीर।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Paneer", "Cashews", "Butter", "Tomatoes"]},
                {"name": "Murgh Butter Masala", "price": 380, "short_description": "Tender chicken cooked in rich buttery tomato sauce scented with kasuri methi.", "description_hi": "शाही बटर चिकन ग्रेवी कसूरी मेथी के साथ।", "dietary_badges": ["non-veg", "chef-special"], "spice_level": "mild", "ingredients": ["Chicken", "Butter", "Tomatoes", "Cream"]}
            ]
        },
        {
            "category": "Tandoori Breads & Rice",
            "items": [
                {"name": "Butter Garlic Naan", "price": 65, "short_description": "Fresh clay-oven baked bread topped with roasted garlic and melted ghee.", "description_hi": "लहसुन और मक्खन लगा हुआ ताजा तंदूरी नान।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Refined Flour", "Garlic", "Butter"]},
                {"name": "Jeera Pulao", "price": 160, "short_description": "Fragrant aged Basmati rice tempered with cumin and pure ghee.", "description_hi": "जीरे के तड़के वाला खुशबूदार बासमती चावल।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Basmati Rice", "Cumin", "Ghee"]}
            ]
        },
        {
            "category": "Desserts & Refreshers",
            "items": [
                {"name": "Kesari Gulab Jamun (2 Pcs)", "price": 95, "short_description": "Golden khoya dumplings steeped in saffron-cardamom honey syrup.", "description_hi": "केसर चाशनी में डूबे हुए गरमा-गरम गुलाब जामुन।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Khoya", "Saffron", "Cardamom", "Rose Water"]},
                {"name": "Kulhad Masala Chaas", "price": 60, "short_description": "Chilled probiotic buttermilk tempered with rock salt, cumin, and mint.", "description_hi": "मिट्टी के कुल्हड़ वाली ठंडी मसाला छाछ।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Curd", "Cumin", "Rock Salt", "Mint"]}
            ]
        }
    ],
    "cafe": [
        {
            "category": "Coffee & Artisan Brews",
            "items": [
                {"name": "Velvet Cappuccino", "price": 140, "short_description": "Double espresso shot topped with dense, velvety microfoam and chocolate dust.", "description_hi": "ताजा एस्प्रेसो और मखमली दूध वाली कैपुचीनो।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Arabica Coffee", "Milk", "Cocoa"]},
                {"name": "Iced Vanilla Caramel Latte", "price": 180, "short_description": "Chilled espresso, Madagascar vanilla bean syrup, whole milk, and gold caramel swirl.", "description_hi": "वनीला और कैरेमल सिरप वाली ठंडी लेटे।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Espresso", "Milk", "Vanilla", "Caramel"]},
                {"name": "Ginger Cardamom Chai", "price": 50, "short_description": "Freshly brewed full-bodied tea infused with crushed ginger and green cardamom.", "description_hi": "अदरक और इलायची वाली कड़क चाय।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Tea Leaves", "Ginger", "Cardamom", "Milk"]}
            ]
        },
        {
            "category": "Artisan Sandwiches & Burgers",
            "items": [
                {"name": "Gourmet Paneer Tikka Panini", "price": 220, "short_description": "Pressed focaccia bread filled with spiced tandoori paneer, peppers, and mozzarella.", "description_hi": "चीज़ और पनीर टिक्का वाला ग्रिल्ड पाणिनी सैंडविच।", "dietary_badges": ["veg"], "spice_level": "medium", "ingredients": ["Bread", "Paneer", "Mozzarella", "Bell Peppers"]},
                {"name": "Crispy Southern Chicken Burger", "price": 260, "short_description": "Herb-crusted fried chicken breast, peri-peri slaw, and melted cheddar on brioche bun.", "description_hi": "कुरकुरा चिकन बर्गर पेरी पेरी सॉस और चीज़ के साथ।", "dietary_badges": ["non-veg", "chef-special"], "spice_level": "medium", "ingredients": ["Chicken Breast", "Brioche", "Cheddar", "Coleslaw"]}
            ]
        },
        {
            "category": "Desserts & Shakes",
            "items": [
                {"name": "Sizzling Chocolate Brownie", "price": 210, "short_description": "Gooey chocolate walnut brownie with a scoop of vanilla ice cream and hot fudge sauce.", "description_hi": "गरम चॉकलेट ब्राउनी ठंडी वनीला आइसक्रीम के साथ।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Dark Chocolate", "Walnuts", "Ice Cream"]},
                {"name": "Belgian Thick Shake", "price": 190, "short_description": "Rich blended milkshake made with 55% Belgian cocoa and dairy cream.", "description_hi": "बेल्जियन चॉकलेट से बना गाढ़ा मिल्कशेक।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Milk", "Belgian Cocoa", "Ice Cream"]}
            ]
        }
    ],
    "fast_food": [
        {
            "category": "Stone Baked Pizzas",
            "items": [
                {"name": "Farmhouse Delight Pizza", "price": 360, "short_description": "Loaded with mushrooms, sweet corn, crisp capsicum, diced onions, and mozzarella.", "description_hi": "ताजी सब्जियों और चीज़ वाला फार्महाउस पिज़्ज़ा।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Pizza Dough", "Mozzarella", "Corn", "Mushrooms", "Capsicum"]},
                {"name": "Peri Peri Paneer Pizza", "price": 390, "short_description": "Spicy peri peri chunks, red paprika, jalapenos, and melted cheese blend.", "description_hi": "चटपटा पेरी पेरी पनीर पिज़्ज़ा।", "dietary_badges": ["veg", "chef-special"], "spice_level": "spicy", "ingredients": ["Paneer", "Jalapenos", "Paprika", "Mozzarella"]}
            ]
        },
        {
            "category": "Burgers, Fries & Wraps",
            "items": [
                {"name": "Classic Veggie Crunch Burger", "price": 130, "short_description": "Golden potato patty topped with tomatoes, onions, lettuce, and Thousand Island mayo.", "description_hi": "कुरकुरा वेज बर्गर ताजी सब्जियों के साथ।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Potato", "Buns", "Mayo", "Lettuce"]},
                {"name": "Peri Peri Curly Fries", "price": 140, "short_description": "Spiraled golden potato fries tossed in piquant peri-peri salt seasoning.", "description_hi": "पेरी पेरी मसाले वाले कुरकुरे फ्रेंच फ्राइज।", "dietary_badges": ["veg"], "spice_level": "medium", "ingredients": ["Potatoes", "Peri Peri Spices", "Oil"]},
                {"name": "Spicy Chicken Wrap", "price": 190, "short_description": "Tortilla flatbread roll packed with roasted chicken, salsa, and cheese spread.", "description_hi": "मसालेदार चिकन और चीज़ वाला रोल्ड रैप।", "dietary_badges": ["non-veg"], "spice_level": "medium", "ingredients": ["Tortilla", "Chicken", "Cheese", "Salsa"]}
            ]
        },
        {
            "category": "Beverages",
            "items": [
                {"name": "Cold Coffee with Choco Chips", "price": 130, "short_description": "Thick blended cold coffee loaded with crunchy chocolate chips.", "description_hi": "चॉकलेट चिप्स वाली चिल्ड कोल्ड कॉफी।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Coffee", "Milk", "Choco Chips"]},
                {"name": "Virgin Mojito", "price": 120, "short_description": "Sparkling soda with crushed fresh mint sprigs, lime wedges, and cane syrup.", "description_hi": "पुदीना और नींबू का ठंडा रिफ्रेशिंग मोजिटो।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Mint", "Lemon", "Soda", "Sugar"]}
            ]
        }
    ],
    "street_food": [
        {
            "category": "Crispy Chaat Specialties",
            "items": [
                {"name": "Pani Puri / Gol Gappe (6 Pcs)", "price": 50, "short_description": "Crisp puris filled with boiled potato-chickpea mash, sweet saunth, and spicy mint water.", "description_hi": "तीखा और खट्टा-मीठा पानी पूरी।", "dietary_badges": ["veg"], "spice_level": "spicy", "ingredients": ["Semolina Puri", "Chickpeas", "Mint Water", "Tamarind"]},
                {"name": "Dahi Bhalla Papdi Chaat", "price": 90, "short_description": "Soft lentil dumplings and crisp wafers in churned sweet curd with pomegranate seeds.", "description_hi": "दही और अनार के दानों से सजी पापड़ी चाट।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Lentils", "Curd", "Papdi", "Pomegranate", "Saunth"]},
                {"name": "Shahi Raj Kachori", "price": 140, "short_description": "Giant crispy kachori stuffed with sprouts, bhallas, sweet yogurt, and savory chutneys.", "description_hi": "दही और चटनी से भरी कुरकुरी राज कचौरी।", "dietary_badges": ["veg", "chef-special"], "spice_level": "medium", "ingredients": ["Flour", "Sprouts", "Curd", "Chutneys"]}
            ]
        },
        {
            "category": "Hot Snacks & Tawa Treats",
            "items": [
                {"name": "Special Pav Bhaji (Amul Butter)", "price": 150, "short_description": "Spicy mixed vegetable mash finished with generous Amul butter and soft toasted pavs.", "description_hi": "अमूल बटर में सिकी पाव और स्वादिष्ट भाजी।", "dietary_badges": ["veg", "chef-special"], "spice_level": "medium", "ingredients": ["Potatoes", "Tomatoes", "Peas", "Butter", "Pav"]},
                {"name": "Paneer Chole Bhature", "price": 170, "short_description": "Puffed fried bhaturas served with spicy Punjabi chickpeas, pickled onions, and cottage cheese.", "description_hi": "मसालेदार पंजाबी छोले और फूले हुए भटूरे।", "dietary_badges": ["veg"], "spice_level": "medium", "ingredients": ["Flour", "Chickpeas", "Paneer", "Spices"]},
                {"name": "Aloo Tikki Chole Chaat", "price": 80, "short_description": "Crispy golden potato patties topped with spicy chole gravy, sweetened yogurt, and sev.", "description_hi": "छोले और कुरकुरी आलू टिक्की चाट।", "dietary_badges": ["veg"], "spice_level": "medium", "ingredients": ["Potatoes", "Chickpeas", "Curd", "Sev"]}
            ]
        },
        {
            "category": "Sweets & Coolers",
            "items": [
                {"name": "Rabri Jalebi (150g)", "price": 120, "short_description": "Crispy coiled jalebis in saffron syrup paired with thickened slow-reduced rabri.", "description_hi": "गाढ़ी मलाईदार रबड़ी के साथ गरमा-गरम जलेबी।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Refined Flour", "Milk", "Saffron", "Sugar"]},
                {"name": "Kesar Pista Lassi", "price": 80, "short_description": "Traditional thick churned yogurt beverage topped with saffron strands and slivered pistachios.", "description_hi": "केसर और पिस्ते से सजी गाढ़ी मलाईदार लस्सी।", "dietary_badges": ["veg"], "spice_level": "mild", "ingredients": ["Curd", "Saffron", "Pistachio", "Cardamom"]}
            ]
        }
    ]
}

def slugify_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text)

@router.post("/quick-create-restaurant")
def quick_create_restaurant(req: QuickCreateRestaurantRequest, db: Session = Depends(get_db)):
    """Instant zero-friction restaurant QR menu generator for any restaurant name & cuisine."""
    clean_name = req.restaurant_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Restaurant name is required")

    base_slug = slugify_text(clean_name) or "restaurant"
    slug = base_slug
    counter = 1
    while db.query(Workspace).filter(Workspace.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # 1. Create Workspace
    workspace = Workspace(
        name=clean_name,
        slug=slug,
        restaurant_type=req.restaurant_type or "Dining & Hospitality",
        city=req.city or "New Delhi",
        phone=req.phone or "+91 98765 43210",
        currency="INR",
        timezone="Asia/Kolkata",
        is_active=True
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # 2. Create Restaurant Settings
    settings = RestaurantSettings(
        workspace_id=workspace.id,
        ordering_enabled=True,
        table_ordering_enabled=True,
        takeaway_enabled=True,
        tax_rate_percent=5.0,
        demo_mode=True
    )
    db.add(settings)

    # 3. Associate with default demo owners so it appears in their dashboard
    owners = db.query(User).filter(User.email.in_(["owner@dineai.com", "owner@royalsaffron.com"])).all()
    for o in owners:
        db.add(WorkspaceMembership(user_id=o.id, workspace_id=workspace.id, role="OWNER"))

    # 4. Populate sample menu from chosen preset
    preset_key = req.cuisine_preset if req.cuisine_preset in PRESET_MENUS else "indian"
    categories_data = PRESET_MENUS[preset_key]

    for cat_order, cat_info in enumerate(categories_data):
        cat = MenuCategory(
            workspace_id=workspace.id,
            name=cat_info["category"],
            display_order=cat_order,
            is_active=True
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)

        for item_data in cat_info["items"]:
            menu_item = MenuItem(
                workspace_id=workspace.id,
                category_id=cat.id,
                name=item_data["name"],
                short_description=item_data.get("short_description", ""),
                long_description=item_data.get("short_description", ""),
                description_hi=item_data.get("description_hi", ""),
                description_hinglish=item_data.get("short_description", ""),
                price=float(item_data["price"]),
                currency="INR",
                dietary_badges=item_data.get("dietary_badges", ["veg"]),
                allergens=[],
                ingredients=item_data.get("ingredients", []),
                spice_level=item_data.get("spice_level", "mild"),
                is_available=True,
                is_published=True,
                is_chef_special=item_data.get("is_chef_special", False)
            )
            db.add(menu_item)

    db.commit()

    return {
        "status": "success",
        "workspace_id": workspace.id,
        "restaurant_name": workspace.name,
        "slug": workspace.slug,
        "restaurant_type": workspace.restaurant_type,
        "city": workspace.city,
        "public_url": f"/m/{workspace.slug}",
        "message": f"QR Menu for '{workspace.name}' successfully generated with delicious dishes!"
    }

@router.get("/{slug}")
def get_public_menu(slug: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug, Workspace.is_active == True).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant menu not found or unpublished")

    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()

    categories = db.query(MenuCategory).filter(
        MenuCategory.workspace_id == workspace.id,
        MenuCategory.is_active == True
    ).order_by(MenuCategory.display_order.asc(), MenuCategory.id.asc()).all()

    items = db.query(MenuItem).filter(
        MenuItem.workspace_id == workspace.id,
        MenuItem.is_published == True
    ).all()

    category_items_map = {}
    for item in items:
        category_items_map.setdefault(item.category_id, []).append({
            "id": item.id,
            "name": item.name,
            "short_description": item.short_description,
            "long_description": item.long_description,
            "description_hi": item.description_hi,
            "description_hinglish": item.description_hinglish,
            "price": item.price,
            "currency": item.currency or workspace.currency or "INR",
            "ingredients": item.ingredients or [],
            "allergens": item.allergens or [],
            "dietary_badges": item.dietary_badges or [],
            "spice_level": item.spice_level or "mild",
            "image_url": item.image_url,
            "is_available": item.is_available,
            "is_chef_special": item.is_chef_special,
            "preparation_time_minutes": item.preparation_time_minutes,
            "calories": item.calories
        })

    structured_categories = []
    for cat in categories:
        cat_items = category_items_map.get(cat.id, [])
        if cat_items:
            structured_categories.append({
                "id": cat.id,
                "name": cat.name,
                "description": cat.description,
                "items": cat_items
            })

    return {
        "restaurant": {
            "name": workspace.name,
            "slug": workspace.slug,
            "type": workspace.restaurant_type,
            "description": workspace.description,
            "address": workspace.address,
            "city": workspace.city,
            "phone": workspace.phone,
            "currency": workspace.currency,
            "logo_url": workspace.logo_url,
            "opening_hours": settings.opening_hours if settings else None,
            "ordering_enabled": settings.ordering_enabled if settings else True,
            "table_ordering_enabled": settings.table_ordering_enabled if settings else True,
            "takeaway_enabled": settings.takeaway_enabled if settings else True,
            "tax_rate_percent": settings.tax_rate_percent if settings else 5.0,
            "demo_mode": settings.demo_mode if settings else False
        },
        "categories": structured_categories
    }

@router.post("/{slug}/ai-assistant", response_model=CustomerAIChatResponse)
async def ask_menu_assistant(slug: str, req: CustomerAIChatRequest, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug, Workspace.is_active == True).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant menu not found")

    return await menu_rag_service.answer_customer_query(db, workspace.id, req)

@router.post("/{slug}/order", response_model=OrderResponse)
def place_customer_order(slug: str, req: OrderCreateRequest, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug, Workspace.is_active == True).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()
    if settings and not settings.ordering_enabled:
        raise HTTPException(status_code=400, detail="Online ordering is currently suspended by the restaurant")

    if not req.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order")

    # Generate sequential unique order number
    rand_suffix = random.randint(1000, 9999)
    order_number = f"ORD-{rand_suffix}"

    # Calculate totals securely on the backend using trusted menu items
    subtotal = 0.0
    order_items_to_create = []

    for item_req in req.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item_req.menu_item_id,
            MenuItem.workspace_id == workspace.id,
            MenuItem.is_published == True
        ).first()

        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Item with ID {item_req.menu_item_id} is invalid or not available")

        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"Dish '{menu_item.name}' is currently marked sold out")

        qty = max(1, item_req.quantity)
        line_total = round(menu_item.price * qty, 2)
        subtotal += line_total

        order_items_to_create.append(OrderItem(
            menu_item_id=menu_item.id,
            item_name=menu_item.name,
            unit_price=menu_item.price,
            quantity=qty,
            item_total=line_total,
            notes=item_req.notes
        ))

    tax_rate = (settings.tax_rate_percent if settings else 5.0) / 100.0
    tax_amount = round(subtotal * tax_rate, 2)
    service_charge = round(subtotal * ((settings.service_charge_percent if settings else 0.0) / 100.0), 2)
    total_amount = round(subtotal + tax_amount + service_charge, 2)

    new_order = Order(
        workspace_id=workspace.id,
        order_number=order_number,
        customer_name=req.customer_name or "Guest",
        customer_phone=req.customer_phone,
        order_type=req.order_type,
        table_number=req.table_number,
        status="PENDING",
        subtotal=subtotal,
        tax_amount=tax_amount,
        service_charge=service_charge,
        total_amount=total_amount,
        currency=workspace.currency or "INR",
        notes=req.notes,
        is_paid=False,
        payment_method="PAY_AT_COUNTER"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Attach items and history
    for oi in order_items_to_create:
        oi.order_id = new_order.id
        db.add(oi)

    history = OrderStatusHistory(
        order_id=new_order.id,
        status="PENDING",
        changed_by="CUSTOMER",
        notes="Order placed via digital QR menu"
    )
    db.add(history)
    db.commit()
    db.refresh(new_order)

    return new_order

@router.get("/{slug}/order-status/{order_number}", response_model=OrderResponse)
def get_order_status(slug: str, order_number: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    order = db.query(Order).filter(
        Order.workspace_id == workspace.id,
        Order.order_number == order_number
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order
