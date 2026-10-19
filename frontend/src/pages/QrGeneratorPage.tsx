import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Sparkles, 
  Printer, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Coffee, 
  UtensilsCrossed,
  Store, 
  Copy, 
  Check,
  FileText,
  Upload,
  Trash2,
  Edit3,
  Phone,
  MessageCircle,
  Star,
  Wifi,
  CreditCard,
  RefreshCw,
  Plus,
  AlertCircle,
  X,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { api } from '../services/api';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const QrGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  // Active Tab: 'create' | 'saved'
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  // Form State for NEW Restaurant QR
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [restaurantType, setRestaurantType] = useState('Restaurant & Cafe');
  const [city, setCity] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Saved Restaurants List
  const [savedQrs, setSavedQrs] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editGoogleReview, setEditGoogleReview] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editUpiId, setEditUpiId] = useState('');
  const [editWifiName, setEditWifiName] = useState('');
  const [editWifiPassword, setEditWifiPassword] = useState('');
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Print Standee Modal State
  const [standeeItem, setStandeeItem] = useState<any>(null);
  const [standeeTableNumber, setStandeeTableNumber] = useState('1');

  // Load Saved Restaurants on Mount
  const fetchSavedQrs = async () => {
    try {
      setLoadingList(true);
      const list = await api.getSmartQrs();
      setSavedQrs(list);
    } catch (err) {
      console.error('Failed to load saved QRs:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSavedQrs();
  }, []);

  // Quick Preset autofill suggestions
  const quickSuggestions = [
    { name: 'Royal Biryani & Kabab', phone: '+91 98765 43210', city: 'Delhi NCR', type: 'Fine Dining' },
    { name: 'Cafe Coffee & Bakes', phone: '+91 98111 22334', city: 'Bangalore', type: 'Cafe & Bakery' },
    { name: 'Sharma Sweets & Chaat', phone: '+91 99887 76655', city: 'Jaipur', type: 'Street Food & Chaat' },
  ];

  // Handle Form Submit to Create Brand-New Smart QR
  const handleCreateSmartQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      alert('Kripya restaurant ka naam dalein');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('restaurant_name', restaurantName.trim());
      formData.append('restaurant_type', restaurantType || 'Restaurant & Cafe');
      formData.append('city', city.trim() || 'India');
      if (phone) formData.append('phone', phone.trim());
      if (whatsappNumber || phone) formData.append('whatsapp_number', (whatsappNumber || phone).trim());
      if (googleReviewUrl) formData.append('google_review_url', googleReviewUrl.trim());
      if (instagramUrl) formData.append('instagram_url', instagramUrl.trim());
      if (upiId) formData.append('upi_id', upiId.trim());
      if (wifiName) formData.append('wifi_name', wifiName.trim());
      if (wifiPassword) formData.append('wifi_password', wifiPassword.trim());
      if (pdfFile) formData.append('pdf_file', pdfFile);

      const result = await api.createSmartQr(formData);
      setSuccessResult(result);
      // Refresh list
      await fetchSavedQrs();
    } catch (err: any) {
      console.error('Failed to create smart QR:', err);
      alert('QR create karne mein samasya aayi: ' + (err.message || 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditName(item.restaurant_name || '');
    setEditPhone(item.phone || '');
    setEditWhatsapp(item.whatsapp_number || '');
    setEditGoogleReview(item.google_review_url || '');
    setEditInstagram(item.instagram_url || '');
    setEditUpiId(item.upi_id || '');
    setEditWifiName(item.wifi_name || '');
    setEditWifiPassword(item.wifi_password || '');
    setEditPdfFile(null);
  };

  // Save Updates (WITHOUT CHANGING QR CODE)
  const handleUpdateSmartQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('restaurant_name', editName.trim());
      formData.append('phone', editPhone.trim());
      formData.append('whatsapp_number', editWhatsapp.trim() || editPhone.trim());
      formData.append('google_review_url', editGoogleReview.trim());
      formData.append('instagram_url', editInstagram.trim());
      formData.append('upi_id', editUpiId.trim());
      formData.append('wifi_name', editWifiName.trim());
      formData.append('wifi_password', editWifiPassword.trim());
      if (editPdfFile) {
        formData.append('pdf_file', editPdfFile);
      }

      await api.updateSmartQr(editingItem.slug, formData);
      setEditingItem(null);
      await fetchSavedQrs();
      alert(`✅ Updated successfully! Aapka QR code bilkul nahi badla hai.`);
    } catch (err: any) {
      console.error('Failed to update QR:', err);
      alert('Update karne mein error: ' + (err.message || 'Error'));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Smart QR
  const handleDelete = async (slug: string, name: string) => {
    if (!window.confirm(`Kya aap "${name}" ko delete karna chahte hain?`)) return;
    try {
      await api.deleteSmartQr(slug);
      await fetchSavedQrs();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Delete karne mein samasya: ' + (err.message || 'Error'));
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/m/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const resetFormForNew = () => {
    setRestaurantName('');
    setPhone('');
    setWhatsappNumber('');
    setGoogleReviewUrl('');
    setInstagramUrl('');
    setUpiId('');
    setWifiName('');
    setWifiPassword('');
    setCity('');
    setPdfFile(null);
    setSuccessResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#202722] flex flex-col selection:bg-[#173D32] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E4ECE7] text-[#173D32] text-xs font-semibold tracking-wide border border-[#C5D7CC]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66A]" />
            <span>Multi-Link Smart QR & PDF Menu Manager</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#173D32]">
            Smart Restaurant QR & Menu Creator
          </h1>
          <p className="text-sm sm:text-base text-[#737B73] leading-relaxed">
            WhatsApp, Google Review, UPI, WiFi aur <strong>Menu PDF</strong> ko ek hi QR code mein jodein. Har restaurant alag save hota hai aur menu ya links badalne par bhi <strong>QR code kabhi nahi badalta</strong>!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#E7E4DC] shadow-sm">
            <button
              onClick={() => { setActiveTab('create'); setSuccessResult(null); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-[#173D32] text-white shadow-sm'
                  : 'text-[#737B73] hover:text-[#173D32]'
              }`}
            >
              <Plus className="w-4 h-4 text-[#C6A66A]" />
              <span>➕ Naya QR Banayein</span>
            </button>

            <button
              onClick={() => { setActiveTab('saved'); fetchSavedQrs(); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#173D32] text-white shadow-sm'
                  : 'text-[#737B73] hover:text-[#173D32]'
              }`}
            >
              <Store className="w-4 h-4 text-[#C6A66A]" />
              <span>📋 Saved Restaurants ({savedQrs.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CREATE NEW SMART QR */}
        {/* ========================================================================= */}
        {activeTab === 'create' && (
          <div>
            {!successResult ? (
              <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E4DC] shadow-luxury space-y-7">
                
                {/* Guarantee Banner */}
                <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[#FAF6ED] border border-[#DCB980]">
                  <CheckCircle2 className="w-5 h-5 text-[#8C6F3B] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#202722] leading-relaxed">
                    <strong className="text-[#173D32] block font-bold text-sm">Dynamic QR Code Guarantee</strong>
                    Yeh QR code permanent hai. Baad mein agar aap apna Menu PDF ya Phone number change bhi karenge, tab bhi table par laga <strong>printed QR code bilkul nahi badlega</strong>!
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                    Quick Sample Presets (Click to autofill):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((sug, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setRestaurantName(sug.name);
                          setPhone(sug.phone);
                          setWhatsappNumber(sug.phone);
                          setCity(sug.city);
                          setRestaurantType(sug.type);
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#FAF6ED]/70 border border-[#DCB980]/60 hover:bg-[#FAF6ED] text-[#173D32] font-medium transition-colors"
                      >
                        ⚡ {sug.name}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleCreateSmartQr} className="space-y-6">
                  
                  {/* Field 1: Restaurant Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5">
                      1. Restaurant / Cafe / Outlet Ka Naam *
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Royal Biryani & Cafe, Sharma Ji Ka Dhaba, Urban Slice"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-sm bg-[#FAF6ED]/30 font-medium text-[#202722]"
                    />
                  </div>

                  {/* Field 2 & 3: Phone & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5 flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1 text-[#C6A66A]" />
                        2. Calling Number (फोन नंबर)
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5 flex items-center">
                        <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        3. WhatsApp Number (ऑर्डर के लिए)
                      </label>
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. 9876543210 (Direct WhatsApp Chat)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Field 4 & 5: Google Review & UPI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5 flex items-center">
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500" />
                        4. Google Review Link (5-Star रेटिंग लिंक)
                      </label>
                      <input
                        type="url"
                        value={googleReviewUrl}
                        onChange={(e) => setGoogleReviewUrl(e.target.value)}
                        placeholder="e.g. https://g.page/r/your-restaurant/review"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-white"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">Customer scan karke 1 click mein 5-star rating de sakega.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5 flex items-center">
                        <CreditCard className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        5. UPI ID (पेमेंट के लिए)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. sharma@okaxis, 9876543210@paytm"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-white"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">Customer direct GPay, PhonePe ya Paytm se pay karega.</span>
                    </div>
                  </div>

                  {/* Field 6 & 7: WiFi & Instagram */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5 flex items-center">
                        <Wifi className="w-3.5 h-3.5 mr-1 text-[#C6A66A]" />
                        6. Restaurant WiFi (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={wifiName}
                          onChange={(e) => setWifiName(e.target.value)}
                          placeholder="WiFi Name"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E4DC]"
                        />
                        <input
                          type="text"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E4DC]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1.5 flex items-center">
                        <InstagramIcon className="w-3.5 h-3.5 mr-1 text-pink-600" />
                        7. Instagram Profile (Optional)
                      </label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/yourcafe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] focus:outline-none focus:ring-2 focus:ring-[#C6A66A] text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Field 8: PDF Menu Upload */}
                  <div className="p-5 rounded-2xl bg-[#FAF6ED]/50 border-2 border-dashed border-[#DCB980] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-[#8C6F3B]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#173D32]">
                          8. Menu PDF Upload Karein (मेनू फाइल)
                        </span>
                      </div>
                      {pdfFile && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ✓ File Selected
                        </span>
                      )}
                    </div>

                    <div className="text-center py-4 bg-white rounded-xl border border-[#E7E4DC]">
                      <input
                        type="file"
                        id="menu-pdf-upload"
                        accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPdfFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="menu-pdf-upload"
                        className="cursor-pointer inline-flex flex-col items-center justify-center space-y-1.5 px-4"
                      >
                        <Upload className="w-7 h-7 text-[#C6A66A]" />
                        <span className="text-xs font-bold text-[#173D32] hover:underline">
                          {pdfFile ? pdfFile.name : 'Apne computer se PDF ya Menu Photo select karein'}
                        </span>
                        <span className="text-[11px] text-[#737B73]">
                          {pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Upload` : 'Supports PDF, JPG, PNG (Max 15MB)'}
                        </span>
                      </label>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      💡 <strong>Note:</strong> Agar abhi PDF nahi hai toh koi baat nahi! Ek delicious default menu apne aap attach ho jayega, aur aap baad mein kabhi bhi apna PDF upload kar sakte hain bina QR code badle!
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl text-base font-bold text-[#102C25] bg-gradient-to-r from-[#C6A66A] to-[#DCB980] hover:brightness-105 shadow-luxury transition-all cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-[#102C25]" />
                    <span>
                      {submitting ? 'Creating Restaurant & QR Code...' : '⚡ Generate Smart QR & Save Restaurant'}
                    </span>
                  </button>

                </form>

              </div>
            ) : (
              /* SUCCESS STATE: SHOW GENERATED QR & STANDEE */
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Success Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900">
                        🎉 "{successResult.restaurant_name}" Ka Smart QR Ban Gaya!
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Yeh restaurant alag se save ho chuka hai. Iska QR code table standee ke liye ready hai.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={resetFormForNew}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#173D32] text-white hover:bg-[#102C25] transition-all flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C6A66A]" />
                    <span>Naya Restaurant QR Banayein</span>
                  </button>
                </div>

                {/* Standee & Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Standee Preview (7 cols) */}
                  <div className="md:col-span-7 bg-white rounded-3xl p-7 border-4 border-[#C6A66A] shadow-2xl text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-white to-[#F8F6F0]">
                    <div className="absolute top-2 left-2 text-[#C6A66A] text-lg font-serif">✦</div>
                    <div className="absolute top-2 right-2 text-[#C6A66A] text-lg font-serif">✦</div>
                    <div className="absolute bottom-2 left-2 text-[#C6A66A] text-lg font-serif">✦</div>
                    <div className="absolute bottom-2 right-2 text-[#C6A66A] text-lg font-serif">✦</div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold tracking-widest uppercase text-[#C6A66A]">
                        Welcome to
                      </p>
                      <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#173D32] tracking-tight">
                        {successResult.restaurant_name}
                      </h3>
                      <p className="text-xs text-[#737B73]">
                        {successResult.city || 'India'} • Digital Dining Experience
                      </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="mx-auto w-fit p-5 rounded-2xl bg-white border-2 border-[#E7E4DC] shadow-inner flex items-center justify-center">
                      <QRCodeSVG
                        value={`${window.location.origin}${successResult.public_url}`}
                        size={190}
                        fgColor="#173D32"
                        bgColor="#FFFFFF"
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <div className="inline-block px-4 py-1 rounded-full bg-[#173D32] text-[#C6A66A] text-xs font-bold tracking-wider uppercase shadow-xs">
                      Table Standee • Scan to Order & View Menu
                    </div>

                    {/* Connected Features Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10px]">
                      {successResult.pdf_menu_url && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          📄 Menu PDF Connected
                        </span>
                      )}
                      {successResult.whatsapp_number && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
                          💬 WhatsApp Ordering
                        </span>
                      )}
                      {successResult.google_review_url && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          ⭐ Google Review
                        </span>
                      )}
                      {successResult.upi_id && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          💳 UPI Pay
                        </span>
                      )}
                    </div>

                    <div className="border-t border-[#E7E4DC] pt-3 flex items-center justify-center space-x-1 text-[10px] text-stone-400">
                      <Sparkles className="w-3 h-3 text-[#C6A66A]" />
                      <span>Powered by NG DineAI</span>
                    </div>
                  </div>

                  {/* Actions Right (5 cols) */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-[#E7E4DC] shadow-sm space-y-4">
                      <h4 className="font-serif text-lg font-bold text-[#173D32]">
                        Quick Standee Actions
                      </h4>

                      <div className="space-y-2.5">
                        <button
                          onClick={() => window.print()}
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
                        >
                          <Printer className="w-4 h-4 text-[#C6A66A]" />
                          <span>Print Table Standee (प्रिंट करें)</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(successResult.slug)}
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#FAF6ED] text-[#173D32] border border-[#DCB980] hover:bg-[#F2E8D3] transition-all"
                        >
                          {copiedSlug === successResult.slug ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-[#8C6F3B]" />
                              <span>Copy Menu Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`${window.location.origin}${successResult.public_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all"
                        >
                          <span>📱 Open Customer View (चेक करें)</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="pt-3 border-t border-[#E7E4DC]">
                        <button
                          onClick={() => { setActiveTab('saved'); fetchSavedQrs(); }}
                          className="w-full py-2.5 text-xs font-bold text-[#737B73] hover:text-[#173D32] transition-colors"
                        >
                          View All Saved Restaurants ({savedQrs.length}) →
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SAVED RESTAURANTS LIST */}
        {/* ========================================================================= */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-[#E7E4DC]">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-[#C6A66A]" />
                <span className="font-bold text-sm text-[#173D32]">
                  Aapke Saved Restaurants ({savedQrs.length})
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchSavedQrs}
                  className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
                  title="Refresh List"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => { setActiveTab('create'); resetFormForNew(); }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
                >
                  <Plus className="w-4 h-4 text-[#C6A66A]" />
                  <span>➕ Create New QR</span>
                </button>
              </div>
            </div>

            {loadingList ? (
              <div className="text-center py-16 text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#C6A66A]" />
                <p className="text-xs">Loading saved restaurants...</p>
              </div>
            ) : savedQrs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E4DC] p-8 space-y-4">
                <Store className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#173D32]">
                  Abhi tak koi restaurant save nahi hai
                </h3>
                <p className="text-xs text-[#737B73] max-w-md mx-auto">
                  Aap apna pehla smart QR code bana sakte hain. WhatsApp number, Google review aur Menu PDF attach karein.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25]"
                >
                  ➕ Pehla Smart QR Banayein
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedQrs.map((item) => {
                  const targetUrl = `${window.location.origin}/m/${item.slug}`;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 border border-[#E7E4DC] hover:border-[#DCB980] transition-all shadow-sm hover:shadow-luxury flex flex-col justify-between space-y-5"
                    >
                      {/* Top Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66A] block">
                              {item.restaurant_type || 'Restaurant'}
                            </span>
                            <h3 className="font-serif text-lg font-bold text-[#173D32] leading-tight">
                              {item.restaurant_name}
                            </h3>
                          </div>

                          {/* Mini QR Code */}
                          <div className="p-1.5 bg-white rounded-xl border border-[#E7E4DC] shadow-2xs shrink-0">
                            <QRCodeSVG
                              value={targetUrl}
                              size={52}
                              fgColor="#173D32"
                              bgColor="#FFFFFF"
                              level="M"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-stone-500">
                          {item.city || 'India'} {item.phone ? `• ${item.phone}` : ''}
                        </p>
                      </div>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {item.pdf_menu_url ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center">
                            📄 PDF: {item.pdf_menu_filename ? item.pdf_menu_filename.slice(0, 15) : 'Uploaded'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                            📄 Default Dishes Menu
                          </span>
                        )}

                        {item.whatsapp_number && (
                          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-800 font-semibold border border-green-200">
                            💬 WhatsApp
                          </span>
                        )}

                        {item.google_review_url && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                            ⭐ Google Review
                          </span>
                        )}

                        {item.upi_id && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                            💳 UPI: {item.upi_id}
                          </span>
                        )}
                      </div>

                      {/* Permanent QR Note */}
                      <div className="p-2.5 rounded-xl bg-[#FAF6ED]/70 border border-[#DCB980]/50 text-[11px] text-[#202722] flex items-center justify-between">
                        <span className="truncate text-stone-600 font-mono text-[10px]">
                          /m/{item.slug}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 ml-2 shrink-0">
                          ✓ Dynamic QR
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-[#E7E4DC] flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1">
                          {/* Open Customer View */}
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl text-stone-600 hover:text-[#173D32] hover:bg-stone-100 transition-colors"
                            title="Open Customer View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(item.slug)}
                            className="p-2 rounded-xl text-stone-600 hover:text-[#173D32] hover:bg-stone-100 transition-colors"
                            title="Copy QR Link"
                          >
                            {copiedSlug === item.slug ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {/* Print Standee */}
                          <button
                            onClick={() => {
                              setStandeeItem(item);
                            }}
                            className="p-2 rounded-xl text-stone-600 hover:text-[#173D32] hover:bg-stone-100 transition-colors"
                            title="Print Table Standee"
                          >
                            <Printer className="w-4 h-4 text-[#C6A66A]" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Edit / Replace PDF */}
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF6ED] text-[#173D32] border border-[#DCB980] hover:bg-[#F2E8D3] transition-all flex items-center space-x-1"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#8C6F3B]" />
                            <span>Edit / PDF</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.slug, item.restaurant_name)}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Restaurant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* EDIT MODAL: UPDATE DETAILS OR REPLACE MENU PDF (QR NEVER CHANGES!) */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#E7E4DC] shadow-2xl space-y-6 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66A]">
                  Edit Restaurant & Links
                </span>
                <h3 className="font-serif text-xl font-bold text-[#173D32]">
                  {editingItem.restaurant_name}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permanent QR Guarantee Notice */}
            <div className="p-3.5 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] flex items-center space-x-3 text-xs text-[#202722]">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <strong className="text-[#173D32] block font-bold">Aapka Printed QR Code KABHI NAHI Badlega!</strong>
                Naya PDF upload karne ya details badalne ke baad bhi table standee aur printed QR code wahi rahega.
              </div>
            </div>

            <form onSubmit={handleUpdateSmartQr} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                    Calling Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                    Google Review Link
                  </label>
                  <input
                    type="url"
                    value={editGoogleReview}
                    onChange={(e) => setEditGoogleReview(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={editUpiId}
                    onChange={(e) => setEditUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                    WiFi Name & Password
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editWifiName}
                      onChange={(e) => setEditWifiName(e.target.value)}
                      placeholder="SSID"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E4DC]"
                    />
                    <input
                      type="text"
                      value={editWifiPassword}
                      onChange={(e) => setEditWifiPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E4DC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D32] mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E4DC] text-xs"
                  />
                </div>
              </div>

              {/* Replace Menu PDF */}
              <div className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#173D32] block">
                  Replace / Upload New Menu PDF
                </span>
                {editingItem.pdf_menu_url && (
                  <p className="text-xs text-[#737B73]">
                    Current PDF: <strong>{editingItem.pdf_menu_filename || 'menu.pdf'}</strong>
                  </p>
                )}

                <input
                  type="file"
                  id="edit-pdf-file"
                  accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditPdfFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="edit-pdf-file"
                  className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCB980] text-xs font-bold text-[#173D32] hover:bg-stone-50"
                >
                  <Upload className="w-4 h-4 text-[#C6A66A]" />
                  <span>
                    {editPdfFile ? editPdfFile.name : 'Nayi Menu PDF Select Karein'}
                  </span>
                </label>
                {editPdfFile && (
                  <span className="text-xs text-emerald-700 block font-semibold">
                    ✓ New file selected: {editPdfFile.name} (Will replace existing on save)
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E7E4DC]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25] shadow-sm flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#C6A66A]" />
                  <span>{editSubmitting ? 'Saving...' : '💾 Save Changes (QR Same Rahega)'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT STANDEE MODAL */}
      {/* ========================================================================= */}
      {standeeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E7E4DC] shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#173D32]">
                Print Table Standee
              </h3>
              <button
                onClick={() => setStandeeItem(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Number Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#173D32]">Table Number on Standee:</span>
              <select
                value={standeeTableNumber}
                onChange={(e) => setStandeeTableNumber(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E7E4DC] bg-white font-medium"
              >
                <option value="">Direct Menu (No Table Specified)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                  <option key={num} value={num.toString()}>
                    Table {num < 10 ? `0${num}` : num}
                  </option>
                ))}
                <option value="Billing Counter">Billing Counter</option>
              </select>
            </div>

            {/* Standee Preview Card */}
            <div 
              ref={printRef}
              className="bg-white rounded-3xl p-6 border-4 border-[#C6A66A] text-center space-y-3 relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-white to-[#F8F6F0]"
            >
              <div className="absolute top-2 left-2 text-[#C6A66A] text-lg font-serif">✦</div>
              <div className="absolute top-2 right-2 text-[#C6A66A] text-lg font-serif">✦</div>
              <div className="absolute bottom-2 left-2 text-[#C6A66A] text-lg font-serif">✦</div>
              <div className="absolute bottom-2 right-2 text-[#C6A66A] text-lg font-serif">✦</div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#C6A66A]">
                  Welcome to
                </p>
                <h3 className="font-serif text-2xl font-extrabold text-[#173D32]">
                  {standeeItem.restaurant_name}
                </h3>
                <p className="text-[11px] text-[#737B73]">
                  {standeeItem.city || 'India'}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="mx-auto w-fit p-4 rounded-2xl bg-white border-2 border-[#E7E4DC] shadow-inner flex items-center justify-center">
                <QRCodeSVG
                  value={`${window.location.origin}/m/${standeeItem.slug}${standeeTableNumber ? `?table=${standeeTableNumber}` : ''}`}
                  size={170}
                  fgColor="#173D32"
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin={true}
                />
              </div>

              {standeeTableNumber ? (
                <div className="inline-block px-3.5 py-0.5 rounded-full bg-[#173D32] text-[#C6A66A] text-xs font-bold tracking-wider uppercase">
                  {standeeTableNumber === 'Billing Counter' ? 'Billing Counter' : `TABLE ${standeeTableNumber}`}
                </div>
              ) : (
                <div className="inline-block px-3.5 py-0.5 rounded-full bg-[#173D32] text-[#C6A66A] text-xs font-bold tracking-wider uppercase">
                  Dine-In & Takeaway
                </div>
              )}

              <p className="text-xs font-bold text-[#173D32] pt-1">
                Scan with Camera for Digital Menu & Services
              </p>

              {standeeItem.wifi_name && (
                <p className="text-[10px] text-stone-500">
                  📶 WiFi: <strong>{standeeItem.wifi_name}</strong> {standeeItem.wifi_password ? `(Pass: ${standeeItem.wifi_password})` : ''}
                </p>
              )}

              <div className="border-t border-[#E7E4DC] pt-2 flex items-center justify-center space-x-1 text-[10px] text-stone-400">
                <Sparkles className="w-3 h-3 text-[#C6A66A]" />
                <span>Powered by NG DineAI</span>
              </div>
            </div>

            {/* Print Button */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setStandeeItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#173D32] text-white hover:bg-[#102C25] flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4 text-[#C6A66A]" />
                <span>Print Standee Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
