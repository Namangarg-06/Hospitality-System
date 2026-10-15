export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  restaurant_type: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  currency: string;
  timezone: string;
  logo_url?: string;
  is_active: boolean;
  role?: string;
  settings?: RestaurantSettings;
}

export interface RestaurantSettings {
  id?: number;
  workspace_id?: number;
  opening_hours?: Record<string, { open: string; close: string }>;
  menu_categories_list?: string[];
  supported_languages?: string[];
  ordering_enabled: boolean;
  table_ordering_enabled: boolean;
  takeaway_enabled: boolean;
  tax_rate_percent: number;
  service_charge_percent: number;
  demo_mode: boolean;
}

export interface MenuCategory {
  id: number;
  workspace_id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  workspace_id: number;
  category_id: number;
  name: string;
  short_description?: string;
  long_description?: string;
  description_hi?: string;
  description_hinglish?: string;
  price: number;
  currency: string;
  ingredients?: string[];
  allergens?: string[];
  dietary_badges?: string[];
  spice_level: string;
  image_url?: string;
  is_available: boolean;
  is_published: boolean;
  preparation_time_minutes?: number;
  calories?: number;
  is_chef_special: boolean;
  search_keywords?: string[];
}

export interface OrderItem {
  id?: number;
  menu_item_id: number;
  item_name: string;
  unit_price: number;
  quantity: number;
  item_total: number;
  notes?: string;
}

export interface Order {
  id: number;
  workspace_id: number;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  order_type: 'DINE_IN' | 'TAKEAWAY';
  table_number?: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  currency: string;
  notes?: string;
  is_paid: boolean;
  payment_method?: string;
  created_at: string;
  items: OrderItem[];
}

export interface CustomerReview {
  id: number;
  workspace_id: number;
  source: string;
  customer_name?: string;
  rating: number;
  review_text: string;
  review_date: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentiment_score: number;
  topics: string[];
  recurring_complaint?: string;
  status: 'NEW' | 'REVIEWED' | 'REPLIED';
}

export interface ReviewReplyDraft {
  id: number;
  review_id: number;
  tone: string;
  language: string;
  draft_text: string;
  is_approved: boolean;
  approved_at?: string;
  is_copied_or_published: boolean;
}

export interface SentimentIntelligenceSummary {
  total_reviews: number;
  average_rating: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
  recurring_complaints: Array<{
    complaint: string;
    count: number;
    severity: string;
    sample_quotes: string[];
  }>;
  positive_highlights: Array<{
    highlight: string;
    count: number;
    sample_quotes: string[];
  }>;
  topic_distribution: Record<string, number>;
  sample_evidence: Array<{
    customer_name: string;
    rating: number;
    text: string;
    sentiment: string;
    date: string;
  }>;
}

export interface SalesAnalyticsSummary {
  total_revenue: number;
  net_sales: number;
  total_orders: number;
  average_order_value: number;
  total_discounts: number;
  total_refunds: number;
  currency: string;
  period_start: string;
  period_end: string;
  daily_trend: Array<{
    date: string;
    gross_sales: number;
    net_sales: number;
    orders: number;
    aov: number;
  }>;
  top_selling_dishes: Array<{
    item_name: string;
    category_name?: string;
    quantity_sold: number;
    total_revenue: number;
    average_price: number;
  }>;
  slow_moving_dishes: Array<{
    item_name: string;
    category_name?: string;
    quantity_sold: number;
    total_revenue: number;
    average_price: number;
  }>;
  category_breakdown: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface FoodWasteRecord {
  id: number;
  workspace_id: number;
  item_name: string;
  is_dish: boolean;
  quantity: number;
  unit: string;
  date_time: string;
  reason: string;
  estimated_cost: number;
  currency: string;
  notes?: string;
}

export interface WasteSummary {
  total_waste_records: number;
  total_waste_cost: number;
  total_waste_quantity_kg: number;
  currency: string;
  reason_breakdown: Array<{ reason: string; cost: number; percentage: number }>;
  top_wasted_items: Array<{ item_name: string; quantity: number; unit: string }>;
  trend_by_date: Array<{ date: string; cost: number; quantity: number; item: string }>;
  actionable_reduction_recommendations: string[];
}

export interface ActionInsight {
  id: number;
  workspace_id: number;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'WARNING' | 'OPTIMIZATION' | 'NOTICE';
  explanation: string;
  supporting_evidence: any[];
  source_records: any[];
  recommended_next_step: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  confidence_score: number;
  created_at: string;
}
