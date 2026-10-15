from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership, RestaurantSettings
from app.models.menu import MenuCategory, MenuItem
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.review import CustomerReview, ReviewReplyDraft
from app.models.sales import SalesRecord
from app.models.inventory import FoodWasteRecord
from app.models.action import ActionInsight

def seed_demo_data(db: Session) -> Workspace:
    """Seeds rich, realistic, luxury synthetic demo data for 'The Royal Saffron' restaurant."""
    
    # 1. Create or retrieve default demo owner
    owner = db.query(User).filter(User.email == "owner@dineai.com").first()
    if not owner:
        owner = User(
            email="owner@dineai.com",
            hashed_password=hash_password("DineAI@2026"),
            full_name="Naman Garg",
            is_active=True,
            is_superuser=True
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)

    # 2. Check if Royal Saffron workspace exists
    workspace = db.query(Workspace).filter(Workspace.slug == "the-royal-saffron").first()
    if workspace:
        return workspace

    workspace = Workspace(
        name="The Royal Saffron",
        slug="the-royal-saffron",
        restaurant_type="Fine Dining & Contemporary Indian",
        description="A distinguished luxury culinary destination celebrating authentic heritage recipes, artisanal tandoor preparations, and royal Indian hospitality.",
        address="18, Diplomatic Enclave, Chanakyapuri",
        city="New Delhi",
        phone="+91 11 4982 7700",
        email="concierge@royalsaffron.com",
        currency="INR",
        timezone="Asia/Kolkata",
        logo_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
        is_active=True
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # 3. Membership & Settings
    membership = WorkspaceMembership(
        user_id=owner.id,
        workspace_id=workspace.id,
        role="OWNER"
    )
    db.add(membership)

    settings = RestaurantSettings(
        workspace_id=workspace.id,
        opening_hours={
            "monday": {"open": "12:00", "close": "23:30"},
            "tuesday": {"open": "12:00", "close": "23:30"},
            "wednesday": {"open": "12:00", "close": "23:30"},
            "thursday": {"open": "12:00", "close": "23:30"},
            "friday": {"open": "12:00", "close": "00:00"},
            "saturday": {"open": "12:00", "close": "00:00"},
            "sunday": {"open": "12:00", "close": "23:30"}
        },
        menu_categories_list=["Royal Starters", "Signature Curries", "Heritage Breads", "Decadent Desserts", "Artisanal Beverages"],
        supported_languages=["en", "hi"],
        ordering_enabled=True,
        table_ordering_enabled=True,
        takeaway_enabled=True,
        tax_rate_percent=5.0,
        service_charge_percent=5.0,
        demo_mode=True
    )
    db.add(settings)
    db.commit()

    # 4. Menu Categories
    cat_starters = MenuCategory(workspace_id=workspace.id, name="Royal Starters", description="Delicately seasoned appetizers from the royal court", display_order=1)
    cat_curries = MenuCategory(workspace_id=workspace.id, name="Signature Curries", description="Slow-simmered rich curries with heritage spice blends", display_order=2)
    cat_breads = MenuCategory(workspace_id=workspace.id, name="Heritage Breads", description="Clay oven baked artisanal breads", display_order=3)
    cat_desserts = MenuCategory(workspace_id=workspace.id, name="Decadent Desserts", description="Opulent Indian confections with pure saffron and silver vark", display_order=4)
    cat_beverages = MenuCategory(workspace_id=workspace.id, name="Artisanal Beverages", description="Cooling elixirs, mocktails, and heritage brews", display_order=5)

    db.add_all([cat_starters, cat_curries, cat_breads, cat_desserts, cat_beverages])
    db.commit()

    # 5. Menu Items
    items = [
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_starters.id,
            name="Truffle Malai Paneer Tikka",
            short_description="Silken cottage cheese infused with black truffle essence and smoked cardamom.",
            long_description="Artisanal cottage cheese marinated for 12 hours in hung organic yogurt, yellow chili, and white truffle oil, gently seared in our copper tandoor.",
            description_hi="काली ट्रफल और इलायची के स्वाद में पका हुआ रेशमी पनीर टिक्का।",
            description_hinglish="Black truffle aur cardamom infusion ke saath bhatti me roast kiya hua soft paneer tikka.",
            price=485.0,
            currency="INR",
            ingredients=["Cottage Cheese", "Hung Curd", "Truffle Oil", "Cardamom", "Yellow Chili"],
            allergens=["dairy"],
            dietary_badges=["veg", "chef-special"],
            spice_level="mild",
            image_url="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=True,
            preparation_time_minutes=18,
            calories=380,
            search_keywords=["paneer", "tikka", "truffle", "starter", "veg"]
        ),
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_starters.id,
            name="Zafrani Murgh Seekh Kebab",
            short_description="Minced country chicken skewers delicately perfumed with Kashmiri saffron.",
            long_description="Succulent country chicken minced with brown onions, crushed coriander seeds, and saffron strands, skewered over fragrant charcoal.",
            description_hi="कश्मीरी केसर और भुने मसालों से तैयार रसीला मुर्ग सीक कबाब।",
            description_hinglish="Kashmiri kesar aur roasted spices me bana hua juicy chicken seekh kebab.",
            price=540.0,
            currency="INR",
            ingredients=["Minced Chicken", "Kashmiri Saffron", "Brown Onions", "Coriander", "Ghee"],
            allergens=["dairy"],
            dietary_badges=["non-veg"],
            spice_level="medium",
            image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=False,
            preparation_time_minutes=20,
            calories=420,
            search_keywords=["chicken", "kebab", "seekh", "saffron", "non-veg"]
        ),
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_curries.id,
            name="Dal Royal Saffron (24-Hour Simmered)",
            short_description="Signature black lentils slow-cooked overnight with vine tomatoes and white churned butter.",
            long_description="Urad lentils slowly simmered on charcoal embers for 24 hours with vine tomatoes, hand-churned dairy butter, and dried fenugreek leaves.",
            description_hi="24 घंटे धीमी आंच पर मक्खन और मेथी के साथ पकाई गई शाही दाल मखनी।",
            description_hinglish="24 ghante tak charcoal par slow-cook ki gayi buttery aur creamy signature black dal.",
            price=420.0,
            currency="INR",
            ingredients=["Black Lentils", "Vine Tomatoes", "White Butter", "Fenugreek", "Ginger"],
            allergens=["dairy"],
            dietary_badges=["veg", "chef-special"],
            spice_level="mild",
            image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=True,
            preparation_time_minutes=15,
            calories=460,
            search_keywords=["dal", "makhani", "lentils", "curry", "veg"]
        ),
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_curries.id,
            name="Nalli Nihari Awadhi",
            short_description="Slow-braised lamb shanks in an aromatic heritage potli masala broth.",
            long_description="Prime lamb shanks cooked in sealed degh with 32 hand-ground whole spices, rose water, and caramel broth until fork tender.",
            description_hi="अवधी शैली में धीमी आंच पर पकी हुई खुशबूदार नल्ली निहारी।",
            description_hinglish="Melt-in-mouth tender lamb shanks cooked in rich heritage potli broth.",
            price=680.0,
            currency="INR",
            ingredients=["Lamb Shanks", "Rose Water", "Potli Masala", "Mustard Oil", "Ginger"],
            allergens=[],
            dietary_badges=["non-veg", "chef-special"],
            spice_level="spicy",
            image_url="https://images.unsplash.com/photo-1545247181-516773cae754?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=True,
            preparation_time_minutes=25,
            calories=580,
            search_keywords=["lamb", "nihari", "curry", "meat", "non-veg"]
        ),
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_breads.id,
            name="Wild Garlic & Rosemary Naan",
            short_description="Clay oven charred leavened flatbread glazed with melted ghee and wild garlic.",
            long_description="Fermented refined wheat flour dough stretched by hand and baked upon the scorching walls of the tandoor, finished with mountain garlic butter.",
            description_hi="मिट्टी के तंदूर में सिका हुआ लहसुन और रोजमेरी नान।",
            description_hinglish="Tandoor baked garlic naan brushed with fresh rosemary and herb butter.",
            price=140.0,
            currency="INR",
            ingredients=["Refined Wheat Flour", "Wild Garlic", "Rosemary", "Ghee", "Milk"],
            allergens=["gluten", "dairy"],
            dietary_badges=["veg"],
            spice_level="mild",
            image_url="https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=False,
            preparation_time_minutes=8,
            calories=210,
            search_keywords=["bread", "naan", "garlic", "roti"]
        ),
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_desserts.id,
            name="Kesari Phirni with 24K Gold Leaf",
            short_description="Chilled rice custard infused with royal saffron and silvered pistachio slivers.",
            long_description="Ground Basmati rice simmered in thickened whole milk with saffron pistils and green cardamom, rested in natural clay shikoras.",
            description_hi="केसर और पिस्ते से सजी हुई पारंपरिक मलाईदार फिरनी।",
            description_hinglish="Authentic mitti ke sakore me serve ki gayi royal saffron phirni with crunchy dry fruits.",
            price=290.0,
            currency="INR",
            ingredients=["Basmati Rice", "Whole Milk", "Kashmiri Saffron", "Pistachio", "Almonds"],
            allergens=["dairy", "nuts"],
            dietary_badges=["veg", "chef-special"],
            spice_level="mild",
            image_url="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=True,
            preparation_time_minutes=5,
            calories=320,
            search_keywords=["phirni", "dessert", "saffron", "sweet", "veg"]
        ),
        MenuItem(
            workspace_id=workspace.id,
            category_id=cat_beverages.id,
            name="Royal Rose & Lychee Shikanji",
            short_description="A sparkling botanical cooler made with crushed rose petals and Himalayan black salt.",
            long_description="Handmade Damascus rose extract infused with sweet lychee nectar, clarified lemon juice, and effervescent spring soda.",
            description_hi="गुलाब की पंखुड़ियों और लीची के रस से बनी ताज़ा शिकंजी।",
            description_hinglish="Rose petals, fresh lemon juice aur lychee ka refreshing sparkling cooler.",
            price=220.0,
            currency="INR",
            ingredients=["Rose Extract", "Lychee Juice", "Lemon", "Black Salt", "Soda"],
            allergens=[],
            dietary_badges=["veg", "vegan"],
            spice_level="mild",
            image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
            is_available=True,
            is_published=True,
            is_chef_special=False,
            preparation_time_minutes=5,
            calories=110,
            search_keywords=["beverage", "mocktail", "rose", "shikanji", "vegan"]
        )
    ]
    db.add_all(items)
    db.commit()

    # 6. Sample Live & Completed Orders
    order_1 = Order(
        workspace_id=workspace.id,
        order_number="ORD-7001",
        customer_name="Vikramaditya Singhania",
        customer_phone="+91 98110 44211",
        order_type="DINE_IN",
        table_number="Table 4 (Courtyard)",
        status="PREPARING",
        subtotal=1785.0,
        tax_amount=89.25,
        service_charge=89.25,
        total_amount=1963.5,
        currency="INR",
        notes="Please keep the spices mild.",
        is_paid=False,
        created_at=datetime.utcnow() - timedelta(minutes=14)
    )
    db.add(order_1)
    db.commit()
    db.refresh(order_1)

    db.add_all([
        OrderItem(order_id=order_1.id, menu_item_id=items[0].id, item_name=items[0].name, unit_price=485.0, quantity=1, item_total=485.0),
        OrderItem(order_id=order_1.id, menu_item_id=items[2].id, item_name=items[2].name, unit_price=420.0, quantity=1, item_total=420.0),
        OrderItem(order_id=order_1.id, menu_item_id=items[3].id, item_name=items[3].name, unit_price=680.0, quantity=1, item_total=680.0),
        OrderItem(order_id=order_1.id, menu_item_id=items[4].id, item_name=items[4].name, unit_price=140.0, quantity=1, item_total=140.0),
        OrderItem(order_id=order_1.id, menu_item_id=items[6].id, item_name=items[6].name, unit_price=220.0, quantity=1, item_total=220.0),
        OrderStatusHistory(order_id=order_1.id, status="PENDING", changed_by="CUSTOMER"),
        OrderStatusHistory(order_id=order_1.id, status="ACCEPTED", changed_by="STAFF"),
        OrderStatusHistory(order_id=order_1.id, status="PREPARING", changed_by="STAFF")
    ])

    order_2 = Order(
        workspace_id=workspace.id,
        order_number="ORD-7002",
        customer_name="Ananya Sharma",
        customer_phone="+91 98234 11200",
        order_type="DINE_IN",
        table_number="Table 8",
        status="PENDING",
        subtotal=905.0,
        tax_amount=45.25,
        service_charge=45.25,
        total_amount=995.5,
        currency="INR",
        notes="Separate water glass please.",
        is_paid=False,
        created_at=datetime.utcnow() - timedelta(minutes=4)
    )
    db.add(order_2)
    db.commit()
    db.refresh(order_2)

    db.add_all([
        OrderItem(order_id=order_2.id, menu_item_id=items[0].id, item_name=items[0].name, unit_price=485.0, quantity=1, item_total=485.0),
        OrderItem(order_id=order_2.id, menu_item_id=items[2].id, item_name=items[2].name, unit_price=420.0, quantity=1, item_total=420.0),
        OrderStatusHistory(order_id=order_2.id, status="PENDING", changed_by="CUSTOMER")
    ])

    order_3 = Order(
        workspace_id=workspace.id,
        order_number="ORD-6998",
        customer_name="Rohan Mehra",
        customer_phone="+91 97112 88300",
        order_type="TAKEAWAY",
        table_number=None,
        status="COMPLETED",
        subtotal=1220.0,
        tax_amount=61.0,
        service_charge=0.0,
        total_amount=1281.0,
        currency="INR",
        notes="Carefully pack curry containers.",
        is_paid=True,
        payment_method="UPI",
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(order_3)
    db.commit()
    db.refresh(order_3)

    db.add_all([
        OrderItem(order_id=order_3.id, menu_item_id=items[1].id, item_name=items[1].name, unit_price=540.0, quantity=1, item_total=540.0),
        OrderItem(order_id=order_3.id, menu_item_id=items[3].id, item_name=items[3].name, unit_price=680.0, quantity=1, item_total=680.0),
        OrderStatusHistory(order_id=order_3.id, status="PENDING", changed_by="CUSTOMER"),
        OrderStatusHistory(order_id=order_3.id, status="COMPLETED", changed_by="STAFF")
    ])

    # 7. Customer Reviews & Reply Drafts
    rev1 = CustomerReview(
        workspace_id=workspace.id,
        source="QR_FEEDBACK",
        customer_name="Pooja Batra",
        rating=5,
        review_text="The Truffle Paneer Tikka and 24-hour Dal are pure poetry on a plate! The royal ambience is unmatched.",
        review_date=datetime.utcnow() - timedelta(days=1),
        sentiment="POSITIVE",
        sentiment_score=0.9,
        topics=["food_quality", "taste", "ambience"],
        status="REPLIED"
    )
    db.add(rev1)
    db.commit()
    db.refresh(rev1)
    db.add(ReviewReplyDraft(
        review_id=rev1.id,
        tone="WARM",
        language="EN",
        draft_text="Dear Pooja, thank you profoundly for your generous praise. Our culinary brigade is honored to have delighted your palate with our 24-hour Dal.",
        is_approved=True,
        is_copied_or_published=True
    ))

    rev2 = CustomerReview(
        workspace_id=workspace.id,
        source="CSV_IMPORT",
        customer_name="Harsh Vardhan",
        rating=2,
        review_text="Food tasted magnificent, but the service speed on Saturday night was unbearably slow. We waited over 45 minutes for our main course.",
        review_date=datetime.utcnow() - timedelta(days=2),
        sentiment="NEGATIVE",
        sentiment_score=-0.75,
        topics=["service_speed", "food_quality"],
        recurring_complaint="Slow table service / extended wait times during peak hours",
        status="REVIEWED"
    )
    db.add(rev2)
    db.commit()
    db.refresh(rev2)
    db.add(ReviewReplyDraft(
        review_id=rev2.id,
        tone="PROFESSIONAL",
        language="EN",
        draft_text="Dear Harsh, thank you for bringing this to our attention. While we are glad the culinary craftsmanship pleased you, we sincerely apologize for the protracted wait times during your Saturday dinner. We have reinforced our kitchen dispatch process.",
        is_approved=False,
        is_copied_or_published=False
    ))

    rev3 = CustomerReview(
        workspace_id=workspace.id,
        source="CSV_IMPORT",
        customer_name="Siddharth Kapoor",
        rating=3,
        review_text="Ambience was opulent and staff was courteous, but waiting 30 minutes for breads felt like a delay.",
        review_date=datetime.utcnow() - timedelta(days=3),
        sentiment="NEUTRAL",
        sentiment_score=0.0,
        topics=["service_speed", "staff_behavior", "ambience"],
        recurring_complaint="Slow table service / extended wait times during peak hours",
        status="NEW"
    )
    db.add(rev3)

    # 8. Sales Records (Daily history)
    today = date.today()
    for i in range(14):
        rec_date = today - timedelta(days=i)
        base_revenue = 42000.0 + (i % 5) * 8500.0 - (i % 2) * 3200.0
        orders_count = int(base_revenue / 1650.0)
        db.add(SalesRecord(
            workspace_id=workspace.id,
            record_date=rec_date,
            gross_sales=base_revenue,
            net_sales=base_revenue * 0.95,
            discount_amount=base_revenue * 0.05,
            refund_amount=0.0,
            tax_collected=base_revenue * 0.05,
            total_orders=orders_count,
            average_order_value=round(base_revenue / orders_count, 2),
            currency="INR",
            source="ORDERS_SYSTEM",
            notes=f"Synthetic sales demo record for {rec_date.strftime('%d %b %Y')}"
        ))

    # 9. Food Waste Records
    db.add_all([
        FoodWasteRecord(
            workspace_id=workspace.id,
            item_name="Dal Royal Saffron (24-Hour Simmered)",
            is_dish=True,
            quantity=3.5,
            unit="kg",
            date_time=datetime.utcnow() - timedelta(days=1),
            reason="OVER_PREPARATION",
            estimated_cost=840.0,
            currency="INR",
            notes="Prepared excess evening batch beyond dinner reservations."
        ),
        FoodWasteRecord(
            workspace_id=workspace.id,
            item_name="Cottage Cheese (Paneer)",
            is_dish=False,
            quantity=1.8,
            unit="kg",
            date_time=datetime.utcnow() - timedelta(days=2),
            reason="SPOILAGE",
            estimated_cost=540.0,
            currency="INR",
            notes="Cold storage temperature fluctuation caused premature curdling."
        ),
        FoodWasteRecord(
            workspace_id=workspace.id,
            item_name="Wild Garlic Naan Dough",
            is_dish=True,
            quantity=2.0,
            unit="kg",
            date_time=datetime.utcnow() - timedelta(days=3),
            reason="EXPIRED",
            estimated_cost=220.0,
            currency="INR",
            notes="Over-fermented dough discarded after morning service."
        )
    ])

    # 10. Action Engine Insights
    db.add_all([
        ActionInsight(
            workspace_id=workspace.id,
            title="Recurring Customer Complaints on Service Speed During Peak Hours",
            category="SERVICE",
            severity="CRITICAL",
            explanation="Multiple guests have reported extended wait times (up to 45 minutes) on weekend evenings.",
            supporting_evidence=[
                "Review by Harsh Vardhan: 'We waited over 45 minutes for our main course.'",
                "Review by Siddharth Kapoor: 'Waiting 30 minutes for breads felt like a delay.'"
            ],
            source_records=[{"entity": "review", "count": 2}],
            recommended_next_step="Deploy an additional floor captain during 8:00 PM – 10:30 PM weekend rush and streamline tandoor queue.",
            status="OPEN",
            confidence_score=0.96
        ),
        ActionInsight(
            workspace_id=workspace.id,
            title="High Food Wastage Pattern Detected: Dal Royal Saffron",
            category="WASTE",
            severity="WARNING",
            explanation="3.5kg of signature Dal Royal Saffron was discarded due to over-preparation exceeding reservations.",
            supporting_evidence=["Logged 3.5kg waste on yesterday's dinner cycle costing ₹840."],
            source_records=[{"entity": "waste_record", "item_name": "Dal Royal Saffron (24-Hour Simmered)"}],
            recommended_next_step="Reduce afternoon production batch by 2.5kg and adopt on-demand simmer holding kettles.",
            status="OPEN",
            confidence_score=0.92
        ),
        ActionInsight(
            workspace_id=workspace.id,
            title="1 Critical Guest Review Without Approved Reply",
            category="REVIEWS",
            severity="WARNING",
            explanation="Harsh Vardhan rated 2 stars citing main course delay; draft response is waiting for GM approval.",
            supporting_evidence=["Guest: Harsh Vardhan (2 Stars)"],
            source_records=[{"entity": "review", "id": rev2.id}],
            recommended_next_step="Review the polite AI draft in Review Reply Studio and approve for copying/dispatch.",
            status="OPEN",
            confidence_score=0.99
        )
    ])

    db.commit()
    return workspace
