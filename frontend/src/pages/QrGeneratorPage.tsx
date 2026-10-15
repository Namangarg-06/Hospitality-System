import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Sparkles, 
  UtensilsCrossed, 
  Printer, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Coffee, 
  Pizza, 
  Layers, 
  ChefHat, 
  Store, 
  ArrowRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const QrGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [restaurantName, setRestaurantName] = useState('Sharma Ji Ka Dhaba');
  const [cuisinePreset, setCuisinePreset] = useState<'indian' | 'cafe' | 'fast_food' | 'street_food'>('indian');
  const [city, setCity] = useState('Delhi NCR');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [tableNumber, setTableNumber] = useState('1');

  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const cuisineOptions = [
    {
      id: 'indian',
      name: 'Indian & Mughlai',
      desc: 'Paneer Tikka, Dal Makhani, Butter Chicken, Naan & Lassi',
      icon: <UtensilsCrossed className="w-5 h-5 text-amber-600" />,
      badge: 'Most Popular'
    },
    {
      id: 'cafe',
      name: 'Cafe & Bakery',
      desc: 'Cappuccino, Cold Coffee, Paninis, Burgers & Brownie',
      icon: <Coffee className="w-5 h-5 text-emerald-600" />,
      badge: 'Boutique'
    },
    {
      id: 'fast_food',
      name: 'Fast Food & Pizzas',
      desc: 'Farmhouse Pizza, Peri-Peri Fries, Wraps & Mojitos',
      icon: <Pizza className="w-5 h-5 text-red-500" />,
      badge: 'Quick Service'
    },
    {
      id: 'street_food',
      name: 'Street Food & Chaat',
      desc: 'Pani Puri, Dahi Papdi, Pav Bhaji, Chole Bhature & Jalebi',
      icon: <Store className="w-5 h-5 text-purple-600" />,
      badge: 'Heritage'
    }
  ];

  const quickSuggestions = [
    { name: 'Sharma Ji Ka Dhaba', cuisine: 'indian', city: 'Jaipur' },
    { name: 'The Chai & Coffee Club', cuisine: 'cafe', city: 'Bangalore' },
    { name: 'Urban Slice Pizza Co.', cuisine: 'fast_food', city: 'Mumbai' },
    { name: 'Old Delhi Chaat Bhandar', cuisine: 'street_food', city: 'Old Delhi' },
    { name: 'Biryani By Nawabs', cuisine: 'indian', city: 'Hyderabad' }
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!restaurantName.trim()) return;

    setLoading(true);
    try {
      const data = await api.quickCreateRestaurant({
        restaurant_name: restaurantName,
        restaurant_type: cuisinePreset === 'cafe' ? 'Cafe & Bakery' : cuisinePreset === 'fast_food' ? 'Fast Food' : cuisinePreset === 'street_food' ? 'Street Food' : 'Fine Dining & Dhaba',
        cuisine_preset: cuisinePreset,
        city: city || 'Delhi NCR',
        phone: phone || '+91 98765 43210'
      });
      setGeneratedResult(data);
    } catch (err: any) {
      console.error('Failed to create restaurant QR', err);
      // Fallback local simulation if offline
      const slug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setGeneratedResult({
        status: 'success',
        restaurant_name: restaurantName,
        slug: slug,
        public_url: `/m/${slug}`
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSlug = generatedResult ? generatedResult.slug : 'the-royal-saffron';
  const currentName = generatedResult ? generatedResult.restaurant_name : restaurantName;
  const qrTargetUrl = `${window.location.origin}/m/${currentSlug}${tableNumber ? `?table=${tableNumber}` : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManageInDashboard = async () => {
    if (generatedResult?.workspace_id) {
      localStorage.setItem('dineai_workspace_id', generatedResult.workspace_id.toString());
    }
    await loginAsDemo();
    navigate('/dashboard/menu');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#202722] flex flex-col selection:bg-[#173D32] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E4ECE7] text-[#173D32] text-xs font-semibold tracking-wide border border-[#C5D7CC]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66A]" />
            <span>Instant Digital QR Studio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#173D32]">
            Kisi Bhi Restaurant Ka QR Banayein
          </h1>
          <p className="text-sm sm:text-base text-[#737B73]">
            Apne restaurant ka naam dalein, cuisine select karein aur 5 second mein <strong>Printable Table Standee</strong> aur <strong>AI-Powered Digital QR Menu</strong> praapt karein.
          </p>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mb-8 flex items-center justify-center flex-wrap gap-2">
          <span className="text-xs text-stone-500 font-medium">Quick Presets:</span>
          {quickSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => {
                setRestaurantName(sug.name);
                setCuisinePreset(sug.cuisine as any);
                setCity(sug.city);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#E7E4DC] hover:border-[#C6A66A] hover:bg-[#FAF6ED] text-[#173D32] transition-colors shadow-2xs font-medium"
            >
              {sug.name}
            </button>
          ))}
        </div>

        {/* 2-Column Grid: Form Left, Standee Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Generator Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E4DC] shadow-luxury space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#173D32] flex items-center">
              <ChefHat className="w-5 h-5 mr-2 text-[#C6A66A]" />
              Restaurant Details
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Restaurant Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5">
                  Restaurant / Cafe / Dhaba Name *
                </label>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. Sharma Ji Ka Dhaba, Bikanervala, Cafe Mocha"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] focus:border-transparent text-sm bg-[#FAF6ED]/30 font-medium text-[#202722]"
                />
              </div>

              {/* Cuisine & Preset Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-2">
                  Menu Cuisine & Sample Dishes *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cuisineOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setCuisinePreset(opt.id as any)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                        cuisinePreset === opt.id
                          ? 'border-[#C6A66A] bg-[#FAF6ED] shadow-sm'
                          : 'border-[#E7E4DC] hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-[#E7E4DC]">
                          {opt.icon}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {opt.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#173D32]">{opt.name}</h4>
                        <p className="text-[11px] text-[#737B73] mt-0.5 leading-snug line-clamp-2">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* City & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Delhi NCR, Jaipur, Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-[#FAF6ED]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5">
                    Table Number (Optional)
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-white font-medium"
                  >
                    <option value="">Direct Menu (No Table Specified)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                      <option key={num} value={num.toString()}>
                        Table {num < 10 ? `0${num}` : num} (Standee Spec)
                      </option>
                    ))}
                    <option value="Counter">Billing Counter / Takeaway</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl text-base font-bold text-[#102C25] bg-gradient-to-r from-[#C6A66A] to-[#DCB980] hover:brightness-105 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#102C25]" />
                <span>
                  {loading ? 'Creating Restaurant Menu & QR...' : '⚡ Generate Instant QR Menu & Standee'}
                </span>
              </button>

            </form>
          </div>

          {/* RIGHT: Live Table Standee Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* The Luxury Standee Card (Printable) */}
            <div 
              ref={printRef}
              className="bg-white rounded-3xl p-7 border-4 border-[#C6A66A] shadow-2xl text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-white to-[#F8F6F0]"
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-[#C6A66A] text-lg font-serif">✦</div>
              <div className="absolute top-2 right-2 text-[#C6A66A] text-lg font-serif">✦</div>
              <div className="absolute bottom-2 left-2 text-[#C6A66A] text-lg font-serif">✦</div>
              <div className="absolute bottom-2 right-2 text-[#C6A66A] text-lg font-serif">✦</div>

              {/* Table Standee Header */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#C6A66A]">
                  Welcome to
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#173D32] tracking-tight">
                  {currentName}
                </h3>
                <p className="text-[11px] text-[#737B73] font-medium">
                  {city} • Digital Dining Experience
                </p>
              </div>

              {/* QR Code Container */}
              <div className="mx-auto w-fit p-5 rounded-2xl bg-white border-2 border-[#E7E4DC] shadow-inner flex items-center justify-center">
                <QRCodeSVG
                  value={qrTargetUrl}
                  size={190}
                  fgColor="#173D32"
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Table Badge */}
              {tableNumber ? (
                <div className="inline-block px-4 py-1 rounded-full bg-[#173D32] text-[#C6A66A] text-xs font-bold tracking-wider uppercase shadow-xs">
                  {tableNumber === 'Counter' ? 'Counter Order' : `TABLE ${tableNumber}`}
                </div>
              ) : (
                <div className="inline-block px-4 py-1 rounded-full bg-[#173D32] text-[#C6A66A] text-xs font-bold tracking-wider uppercase shadow-xs">
                  Dine-In & Takeaway
                </div>
              )}

              {/* Callouts */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-bold text-[#173D32]">
                  Scan with Camera for Digital Menu & AI Waiter
                </p>
                <p className="text-[10px] text-[#737B73]">
                  No app download needed • Instant mobile ordering
                </p>
              </div>

              {/* Standee Footer */}
              <div className="border-t border-[#E7E4DC] pt-3 flex items-center justify-center space-x-1 text-[10px] text-stone-400">
                <Sparkles className="w-3 h-3 text-[#C6A66A]" />
                <span>Powered by NG DineAI</span>
              </div>
            </div>

            {/* Standee Action Controls */}
            <div className="bg-white p-4 rounded-2xl border border-[#E7E4DC] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#173D32]">
                <span>Standee Controls</span>
                <span className="text-emerald-700 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready to Use
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
                >
                  <Printer className="w-4 h-4 text-[#C6A66A]" />
                  <span>Print Standee</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF6ED] text-[#173D32] border border-[#DCB980] hover:bg-[#F2E8D3] transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#8C6F3B]" />}
                  <span>{copied ? 'Copied!' : 'Copy Menu Link'}</span>
                </button>
              </div>

              {/* Direct Open Buttons */}
              <div className="space-y-2 pt-1 border-t border-[#E7E4DC]">
                <a
                  href={qrTargetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all"
                >
                  <span>📱 Open Live Menu in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleManageInDashboard}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#173D32] hover:bg-stone-50 transition-all text-stone-600 hover:text-[#173D32]"
                >
                  <ChefHat className="w-4 h-4 text-[#C6A66A]" />
                  <span>Manage Dishes & Prices for this Restaurant →</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
