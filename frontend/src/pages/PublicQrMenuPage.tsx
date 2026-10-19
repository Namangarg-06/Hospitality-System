import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  Search,
  Filter,
  Flame,
  Info,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Send,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  FileText,
  Download,
  ExternalLink,
  Star,
  Wifi,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { MenuItem } from '../types';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const PublicQrMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'vegan' | 'special'>('all');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Cart State
  const [cart, setCart] = useState<Record<number, { item: MenuItem; quantity: number; notes?: string }>>({});
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Multi-Link & PDF Menu Modal States
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  // AI Dining Sommelier Assistant State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; dishes?: any[] }>>([
    {
      role: 'assistant',
      text: 'Namaste and welcome. I am your AI dining host. I can assist with wine and food pairings, dietary preferences, or dishes under your budget. How may I guide your dining experience today?',
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await api.getPublicMenu(slug);
        setMenuData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const updateCartQty = (itemId: number, delta: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: newQty },
      };
    });
  };

  const cartItems = Object.values(cart);
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const taxRate = (menuData?.restaurant?.tax_rate_percent || 5.0) / 100;
  const cartTax = Math.round(cartSubtotal * taxRate);
  const cartTotal = cartSubtotal + cartTax;
  const cartTotalItemsCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || cartItems.length === 0) return;
    setSubmittingOrder(true);
    try {
      const orderPayload = {
        customer_name: customerName || 'Guest Diner',
        customer_phone: customerPhone,
        order_type: orderType,
        table_number: orderType === 'DINE_IN' ? tableNumber : undefined,
        notes: orderNotes,
        items: cartItems.map((ci) => ({
          menu_item_id: ci.item.id,
          quantity: ci.quantity,
          notes: ci.notes,
        })),
      };

      const res = await api.placeOrder(slug, orderPayload);
      setCart({});
      setShowCartDrawer(false);
      navigate(`/m/${slug}/order-status/${res.order_number}`);
    } catch (err: any) {
      alert(err.message || 'Failed to place order. Please ask server.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // AI Assistant Ask
  const handleSendAiMessage = async (customPrompt?: string) => {
    const query = customPrompt || aiInput;
    if (!query.trim() || !slug) return;

    setAiInput('');
    setAiChatHistory((prev) => [...prev, { role: 'user', text: query }]);
    setAiLoading(true);

    try {
      const res = await api.askMenuAssistant(slug, {
        message: query,
        table_number: tableNumber,
      });

      setAiChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          dishes: res.recommended_dishes,
        },
      ]);
    } catch (e) {
      setAiChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Our kitchen team recommends verifying specific dietary choices directly with our service captain.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#173D32] border-t-[#C6A66A] animate-spin mb-4"></div>
        <p className="font-serif text-lg font-bold text-[#173D32]">Loading Culinary Collection...</p>
        <p className="text-xs text-[#737B73] mt-1">Connecting to live restaurant digital menu</p>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-6 text-center">
        <UtensilsCrossed className="w-12 h-12 text-[#C6A66A] mb-3" />
        <h2 className="font-serif text-2xl font-bold text-[#173D32]">Menu Currently Unavailable</h2>
        <p className="text-sm text-[#737B73] mt-2 max-w-sm">
          This digital dining menu is temporarily unpublished. Please ask your service captain for assistance.
        </p>
      </div>
    );
  }

  const { restaurant, categories } = menuData;

  // Filtered categories and dishes
  const filteredCategories = categories.map((cat: any) => {
    const matchingItems = cat.items.filter((item: MenuItem) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.short_description && item.short_description.toLowerCase().includes(search.toLowerCase()));

      let matchesDiet = true;
      if (dietaryFilter === 'veg') {
        matchesDiet = Boolean(item.dietary_badges?.includes('veg') || item.dietary_badges?.includes('vegan'));
      } else if (dietaryFilter === 'vegan') {
        matchesDiet = Boolean(item.dietary_badges?.includes('vegan'));
      } else if (dietaryFilter === 'special') {
        matchesDiet = Boolean(item.is_chef_special);
      }

      return matchesSearch && matchesDiet;
    });

    return { ...cat, items: matchingItems };
  }).filter((cat: any) => activeCategory === 'all' || cat.name === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#202722] pb-28 selection:bg-[#173D32] selection:text-white">
      
      {/* 1. RESTAURANT HERO BANNER */}
      <div className="bg-[#102C25] text-white pt-10 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C6A66A_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#C6A66A] flex items-center justify-center text-[#102C25] font-serif font-bold text-3xl shadow-luxury shrink-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <UtensilsCrossed className="w-10 h-10" />
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C6A66A]/20 text-[#DCB980] border border-[#C6A66A]/40">
                {restaurant.type}
              </span>
              {restaurant.demo_mode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Demo Venue
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              {restaurant.name}
            </h1>

            <p className="text-xs text-[#C5D7CC] leading-relaxed max-w-xl">
              {restaurant.description}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-[11px] text-[#DCB980]">
              {restaurant.address && (
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> {restaurant.address}, {restaurant.city}
                </span>
              )}
              {restaurant.phone && (
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1" /> {restaurant.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW: WHATSAPP, CALL, GOOGLE REVIEW, UPI, WIFI */}
      {(restaurant.whatsapp_number || restaurant.phone || restaurant.google_review_url || restaurant.upi_id || restaurant.wifi_name || restaurant.instagram_url) && (
        <div className="bg-[#173D32] border-b border-[#C6A66A]/30 py-3 px-4 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-center sm:justify-start flex-wrap gap-2 text-xs">
            {/* WhatsApp */}
            {(restaurant.whatsapp_number || restaurant.phone) && (
              <a
                href={`https://wa.me/${(restaurant.whatsapp_number || restaurant.phone).replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hello ${restaurant.name}, I want to place an order / get menu assistance.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-semibold transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Order</span>
              </a>
            )}

            {/* Phone Call */}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>Call Us</span>
              </a>
            )}

            {/* Google Review */}
            {restaurant.google_review_url && (
              <a
                href={restaurant.google_review_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-semibold transition-all"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Rate 5★ Google</span>
              </a>
            )}

            {/* Pay via UPI */}
            {restaurant.upi_id && (
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/40 font-semibold transition-all"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>Pay UPI</span>
              </button>
            )}

            {/* WiFi */}
            {restaurant.wifi_name && (
              <button
                type="button"
                onClick={() => setShowWifiModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 font-medium transition-all"
              >
                <Wifi className="w-3.5 h-3.5 text-[#C6A66A]" />
                <span>WiFi Info</span>
              </button>
            )}

            {/* Instagram */}
            {restaurant.instagram_url && (
              <a
                href={restaurant.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/40 font-medium transition-all"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 2. STICKY FILTER & SEARCH BAR */}
      <div className="sticky top-0 z-30 bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#E7E4DC] py-3 px-4 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-3">
          
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737B73] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes, ingredients, or pairings..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
              />
            </div>

            {/* Language Toggle (EN / हिंदी) */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-[#DCB980] bg-[#FAF6ED] text-[#173D32] shrink-0"
            >
              {lang === 'en' ? 'हिंदी में पढ़ें' : 'English Menu'}
            </button>
          </div>

          {/* Dietary Filters & Category Scroll */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                dietaryFilter === 'all'
                  ? 'bg-[#173D32] text-white'
                  : 'bg-white border border-[#E7E4DC] text-[#737B73]'
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-[#E7E4DC] text-emerald-800'
              }`}
            >
              Pure Veg 🌱
            </button>
            <button
              onClick={() => setDietaryFilter('vegan')}
              className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                dietaryFilter === 'vegan'
                  ? 'bg-green-800 text-white'
                  : 'bg-white border border-[#E7E4DC] text-green-900'
              }`}
            >
              Vegan Only
            </button>
            <button
              onClick={() => setDietaryFilter('special')}
              className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                dietaryFilter === 'special'
                  ? 'bg-[#C6A66A] text-[#102C25]'
                  : 'bg-white border border-[#DCB980] text-[#8C6F3B]'
              }`}
            >
              ★ Chef Specials
            </button>
          </div>

        </div>
      </div>

      {/* 2.5. FEATURED MENU PDF SECTION (IF UPLOADED) */}
      {restaurant.pdf_menu_url && (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#C6A66A] shadow-luxury space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] flex items-center justify-center text-[#8C6F3B] shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66A] block">
                    Official Restaurant Menu Card
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#173D32]">
                    {restaurant.pdf_menu_filename || 'Dining Menu (PDF)'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={restaurant.pdf_menu_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF6ED] text-[#173D32] border border-[#DCB980] hover:bg-[#F2E8D3] transition-all"
                >
                  <Download className="w-4 h-4 text-[#8C6F3B]" />
                  <span>Download PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowPdfViewer(!showPdfViewer)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
                >
                  <FileText className="w-4 h-4 text-[#C6A66A]" />
                  <span>{showPdfViewer ? 'Hide PDF' : 'View Full Menu PDF'}</span>
                </button>
              </div>
            </div>

            {showPdfViewer && (
              <div className="rounded-2xl overflow-hidden border border-[#E7E4DC] shadow-inner bg-stone-100">
                <iframe
                  src={`${restaurant.pdf_menu_url}#toolbar=0&navpanes=0`}
                  title="Restaurant Menu PDF"
                  className="w-full h-[550px] sm:h-[650px] border-0"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MENU CATEGORIES & DISHES LIST */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        {filteredCategories.map((cat: any) => {
          if (!cat.items || cat.items.length === 0) return null;

          return (
            <section key={cat.id} className="space-y-4">
              <div className="border-b border-[#E7E4DC] pb-2">
                <h2 className="font-serif text-xl font-bold text-[#173D32]">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-xs text-[#737B73] mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {cat.items.map((dish: MenuItem) => {
                  const inCart = cart[dish.id];

                  return (
                    <div
                      key={dish.id}
                      className="card-luxury p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          {dish.dietary_badges?.includes('veg') ? (
                            <span className="w-3.5 h-3.5 border-2 border-emerald-600 p-0.5 flex items-center justify-center rounded-sm">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 border-2 border-rose-600 p-0.5 flex items-center justify-center rounded-sm">
                              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                            </span>
                          )}

                          <h3 className="font-serif text-base font-bold text-[#173D32]">
                            {dish.name}
                          </h3>

                          {dish.is_chef_special && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C6A66A] text-[#102C25]">
                              SIGNATURE
                            </span>
                          )}
                        </div>

                        <p className="font-serif font-bold text-sm text-[#173D32]">
                          ₹{dish.price}
                        </p>

                        <p className="text-xs text-[#737B73] leading-relaxed">
                          {lang === 'hi' && dish.description_hi
                            ? dish.description_hi
                            : dish.short_description || dish.long_description}
                        </p>

                        {dish.allergens && dish.allergens.length > 0 && (
                          <p className="text-[10px] text-[#737B73]">
                            Contains: <span className="font-medium text-[#202722]">{dish.allergens.join(', ')}</span>
                          </p>
                        )}
                      </div>

                      {/* Right: Dish Photo & Add Button */}
                      <div className="flex sm:flex-col items-center justify-between sm:justify-end gap-3 shrink-0">
                        {dish.image_url && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#E7E4DC] shrink-0">
                            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                          </div>
                        )}

                        {restaurant.ordering_enabled && (
                          <div className="shrink-0">
                            {inCart ? (
                              <div className="inline-flex items-center space-x-2 px-2 py-1 rounded-lg bg-[#173D32] text-white text-xs font-bold">
                                <button
                                  onClick={() => updateCartQty(dish.id, -1)}
                                  className="p-1 hover:text-[#C6A66A]"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span>{inCart.quantity}</span>
                                <button
                                  onClick={() => updateCartQty(dish.id, 1)}
                                  className="p-1 hover:text-[#C6A66A]"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(dish)}
                                disabled={!dish.is_available}
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-[#173D32] text-[#173D32] hover:bg-[#173D32] hover:text-white transition-all shadow-subtle disabled:opacity-40"
                              >
                                {dish.is_available ? 'Add to Cart +' : 'Sold Out'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* 4. FLOATING AI DINING SOMMELIER BUTTON */}
      <button
        onClick={() => setShowAiAssistant(true)}
        className="fixed bottom-20 right-4 sm:right-8 z-40 p-3.5 rounded-full bg-[#173D32] text-[#C6A66A] shadow-2xl hover:bg-[#102C25] border border-[#DCB980] flex items-center space-x-2 group transition-all"
      >
        <Sparkles className="w-5 h-5 text-[#C6A66A] animate-pulse" />
        <span className="hidden sm:inline text-xs font-semibold text-white pr-1">
          Ask Dining Sommelier
        </span>
      </button>

      {/* 5. FLOATING CART STATUS BAR */}
      {cartTotalItemsCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 sm:max-w-md sm:mx-auto z-40">
          <div className="p-3.5 rounded-2xl bg-[#102C25] text-white flex items-center justify-between shadow-2xl border border-[#2A6354]">
            <div>
              <span className="text-xs text-[#C5D7CC] font-mono">
                {cartTotalItemsCount} {cartTotalItemsCount === 1 ? 'dish' : 'dishes'} selected
              </span>
              <p className="font-serif font-bold text-base text-white">
                ₹{cartTotal} <span className="text-[11px] font-normal text-[#C5D7CC]">(incl. tax)</span>
              </p>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-5 py-2.5 rounded-xl bg-[#C6A66A] hover:bg-[#DCB980] text-[#102C25] text-xs font-bold flex items-center space-x-1.5 shadow-subtle transition-all"
            >
              <span>Review Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. CART & CHECKOUT DRAWER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-[#173D32]" />
                  <h3 className="font-serif text-lg font-bold text-[#173D32]">Dining Order Review</h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="text-[#737B73]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#E7E4DC] py-4">
                {cartItems.map((ci) => (
                  <div key={ci.item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-[#173D32]">{ci.item.name}</h4>
                      <span className="text-[#737B73]">₹{ci.item.price} each</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center space-x-2 px-2 py-1 rounded bg-[#F8F6F0] border border-[#E7E4DC]">
                        <button onClick={() => updateCartQty(ci.item.id, -1)} className="hover:text-black">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold">{ci.quantity}</span>
                        <button onClick={() => updateCartQty(ci.item.id, 1)} className="hover:text-black">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-mono font-bold text-[#173D32]">
                        ₹{ci.item.price * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table / Takeaway Options */}
              <div className="space-y-3 pt-3 border-t border-[#E7E4DC]">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      orderType === 'DINE_IN'
                        ? 'bg-[#173D32] text-white border-[#173D32]'
                        : 'bg-white text-[#737B73] border-[#E7E4DC]'
                    }`}
                  >
                    Dine-In Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      orderType === 'TAKEAWAY'
                        ? 'bg-[#173D32] text-white border-[#173D32]'
                        : 'bg-white text-[#737B73] border-[#E7E4DC]'
                    }`}
                  >
                    Takeaway Order
                  </button>
                </div>

                {orderType === 'DINE_IN' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#737B73] mb-1">
                      Table Identification *
                    </label>
                    <input
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 4 or Courtyard 2"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#737B73] mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest Diner"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#737B73] mb-1">
                    Kitchen Prep Notes
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Mild spices, allergy note, etc."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                  />
                </div>
              </div>
            </div>

            {/* Bill Summary & Place Order */}
            <div className="pt-4 border-t border-[#E7E4DC] space-y-3">
              <div className="space-y-1.5 text-xs text-[#737B73]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service ({menuData?.restaurant?.tax_rate_percent || 5}%)</span>
                  <span className="font-mono">₹{cartTax}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#173D32] pt-1 border-t border-[#E7E4DC]">
                  <span>Total Amount</span>
                  <span className="font-serif">₹{cartTotal}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={submittingOrder}
                onClick={handlePlaceOrder}
                className="w-full py-3 rounded-xl bg-[#173D32] hover:bg-[#102C25] text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-luxury transition-all disabled:opacity-50"
              >
                {submittingOrder ? 'Transmitting Order to Kitchen...' : 'Confirm & Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. AI DINING SOMMELIER CONVERSATION DRAWER */}
      {showAiAssistant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between p-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#173D32] text-[#C6A66A] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#173D32]">
                      AI Dining Sommelier
                    </h3>
                    <p className="text-[10px] text-emerald-800 font-semibold">
                      Grounded strictly in verified menu items
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAiAssistant(false)} className="text-[#737B73]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sample Prompts */}
              <div className="flex items-center space-x-1.5 overflow-x-auto py-3">
                <button
                  onClick={() => handleSendAiMessage('What vegetarian dishes cost under ₹500?')}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-[#FAF6ED] border border-[#DCB980] text-[#173D32] whitespace-nowrap hover:bg-[#F4ECD8]"
                >
                  Veg dishes &lt; ₹500
                </button>
                <button
                  onClick={() => handleSendAiMessage('Suggest a light starter and refreshing beverage')}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-[#FAF6ED] border border-[#DCB980] text-[#173D32] whitespace-nowrap hover:bg-[#F4ECD8]"
                >
                  Light pairing
                </button>
                <button
                  onClick={() => handleSendAiMessage('What are your most celebrated chef specials?')}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-[#FAF6ED] border border-[#DCB980] text-[#173D32] whitespace-nowrap hover:bg-[#F4ECD8]"
                >
                  Chef specials
                </button>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {aiChatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#173D32] text-white rounded-br-none'
                        : 'bg-[#F8F6F0] text-[#202722] border border-[#E7E4DC] rounded-bl-none shadow-subtle'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Recommendation Citations / Cards */}
                  {msg.dishes && msg.dishes.length > 0 && (
                    <div className="mt-2 space-y-2 w-full max-w-[90%]">
                      {msg.dishes.map((dish) => (
                        <div
                          key={dish.dish_id}
                          className="p-2.5 rounded-xl bg-white border border-[#DCB980] flex items-center justify-between text-xs shadow-sm"
                        >
                          <div>
                            <span className="font-serif font-bold text-[#173D32]">{dish.name}</span>
                            <p className="text-[10px] text-[#737B73]">
                              ₹{dish.price} • {dish.dietary_badges.join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const found = categories.flatMap((c: any) => c.items).find((i: any) => i.id === dish.dish_id);
                              if (found) addToCart(found);
                            }}
                            className="px-2.5 py-1 rounded bg-[#173D32] text-white font-semibold text-[10px]"
                          >
                            Add +
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-center space-x-2 text-xs text-[#737B73] p-2">
                  <div className="w-2 h-2 rounded-full bg-[#173D32] animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-[#173D32] animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#173D32] animate-bounce [animation-delay:0.4s]"></div>
                  <span>Grounded query in progress...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="pt-3 border-t border-[#E7E4DC]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask about ingredients, allergies, budget..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="p-2 rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* UPI PAYMENT MODAL */}
      {showUpiModal && restaurant.upi_id && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-5 border border-[#E7E4DC] shadow-2xl relative">
            <button
              onClick={() => setShowUpiModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66A]">
                Instant Payment
              </span>
              <h3 className="font-serif text-xl font-bold text-[#173D32]">
                Pay {restaurant.name}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F6F0] border border-[#E7E4DC] space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-400">
                UPI ID (VPA)
              </span>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-sm font-bold text-[#173D32]">
                  {restaurant.upi_id}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(restaurant.upi_id);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="p-1 rounded-lg hover:bg-stone-200 text-stone-600"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copiedUpi && (
                <span className="text-[10px] font-bold text-emerald-600 block">
                  UPI ID Copied!
                </span>
              )}
            </div>

            <a
              href={`upi://pay?pa=${encodeURIComponent(restaurant.upi_id)}&pn=${encodeURIComponent(restaurant.name)}&cu=INR`}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
            >
              <span>Open Google Pay / PhonePe / Paytm</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* WIFI INFO MODAL */}
      {showWifiModal && restaurant.wifi_name && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-5 border border-[#E7E4DC] shadow-2xl relative">
            <button
              onClick={() => setShowWifiModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] text-[#8C6F3B] flex items-center justify-center mx-auto">
              <Wifi className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66A]">
                Guest Connectivity
              </span>
              <h3 className="font-serif text-xl font-bold text-[#173D32]">
                Restaurant WiFi
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E4DC] text-left space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 block">
                  Network Name (SSID)
                </span>
                <span className="font-mono text-xs font-bold text-[#173D32]">
                  {restaurant.wifi_name}
                </span>
              </div>

              {restaurant.wifi_password && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Password
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#173D32]">
                      {restaurant.wifi_password}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(restaurant.wifi_password);
                        setCopiedWifi(true);
                        setTimeout(() => setCopiedWifi(false), 2000);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-[#E7E4DC] text-stone-600 hover:bg-stone-50"
                    >
                      {copiedWifi ? 'Copied!' : 'Copy Pass'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowWifiModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25]"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
