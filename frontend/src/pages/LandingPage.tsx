import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  UtensilsCrossed,
  QrCode,
  MessageSquareQuote,
  BarChart3,
  Trash2,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Coffee,
  Building,
  Store,
  Clock,
  ShieldCheck,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleInstantOwnerLogin = async () => {
    if (user) {
      window.location.href = '/dashboard';
      return;
    }
    setLoadingDemo(true);
    try {
      await loginAsDemo();
      window.location.href = '/dashboard';
    } catch (e) {
      window.location.href = '/login';
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#202722] flex flex-col selection:bg-[#173D32] selection:text-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-5">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E4ECE7] text-[#173D32] text-xs font-semibold tracking-wide border border-[#C5D7CC]">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A66A]" />
              <span>Smarter Dining. Smarter Operations.</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#173D32] leading-tight">
              A Smarter Way to Run <br />
              <span className="italic font-normal text-[#C6A66A]">Your Restaurant.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#737B73] font-normal leading-relaxed max-w-3xl mx-auto">
              Choose your perspective below to explore NG DineAI with pre-loaded demo data:
            </p>

            {/* TWO SIMPLE EXPERIENCE CARDS */}
            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              
              {/* Card 1: Customer View */}
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E7E4DC] hover:border-[#C6A66A] shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] text-[#C6A66A] flex items-center justify-center border border-[#DCB980]/40">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Customer View
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#173D32]">
                      📱 Public QR Menu & AI Waiter
                    </h3>
                    <p className="text-xs text-[#737B73] mt-1 leading-relaxed">
                      Dine at <strong>The Royal Saffron</strong>: browse dishes, filter vegetarian/spicy, and chat with the AI Sommelier for food & drink recommendations.
                    </p>
                  </div>
                </div>
                <div className="pt-5">
                  <Link
                    to="/m/the-royal-saffron"
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-white bg-[#173D32] group-hover:bg-[#102C25] shadow-sm transition-all"
                  >
                    <span>Open Customer QR Menu</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Owner View */}
              <div className="bg-white rounded-2xl p-6 border-2 border-[#DCB980] hover:border-[#C6A66A] shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#C6A66A] text-[#102C25] text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                  Recommended
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#102C25] text-[#C6A66A] flex items-center justify-center shadow-inner">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Owner & Admin View
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#173D32]">
                      👑 Restaurant Operations OS
                    </h3>
                    <p className="text-xs text-[#737B73] mt-1 leading-relaxed">
                      Live kitchen orders, AI review replies in 3 languages, daily revenue metrics, food-waste logs & proactive AI action directives.
                    </p>
                  </div>
                </div>
                <div className="pt-5">
                  <button
                    disabled={loadingDemo}
                    onClick={handleInstantOwnerLogin}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-[#102C25] bg-gradient-to-r from-[#C6A66A] to-[#DCB980] hover:brightness-105 shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-[#102C25]" />
                    <span>{loadingDemo ? 'Logging In...' : '⚡ 1-Click Enter Dashboard'}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Subtle Secondary Links */}
            <div className="pt-2 flex items-center justify-center space-x-6 text-xs text-[#737B73]">
              <Link to="/login" className="hover:text-[#173D32] underline underline-offset-4">
                Manual Sign In
              </Link>
              <span>•</span>
              <Link to="/register" className="hover:text-[#173D32] underline underline-offset-4">
                Register New Restaurant
              </Link>
            </div>

          </div>

          {/* Realistic Luxury Dashboard Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-[#E7E4DC] to-transparent shadow-2xl">
            <div className="rounded-xl overflow-hidden border border-[#E7E4DC] bg-white shadow-luxury">
              
              {/* Mockup Topbar */}
              <div className="bg-[#102C25] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#173D32]">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-xs text-[#C5D7CC] font-mono tracking-wide ml-2">
                    ng-dineai.app/dashboard • The Royal Saffron (Live Operations)
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#C6A66A]/20 text-[#DCB980] border border-[#C6A66A]/40 font-medium">
                    AI Copilot Synchronized
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 bg-[#F8F6F0] grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-xl bg-white border border-[#E7E4DC] shadow-subtle">
                  <span className="text-xs text-[#737B73] font-medium uppercase tracking-wider">Today's Sales</span>
                  <p className="text-2xl font-serif font-bold text-[#173D32] mt-1">₹48,920</p>
                  <div className="mt-2 text-xs text-emerald-700 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    <span>+12.4% vs last Thursday</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#E7E4DC] shadow-subtle">
                  <span className="text-xs text-[#737B73] font-medium uppercase tracking-wider">Customer Sentiment</span>
                  <p className="text-2xl font-serif font-bold text-[#173D32] mt-1">94.2% Positive</p>
                  <p className="mt-2 text-xs text-[#737B73]">Top praised: 24-Hour Dal & Truffle Tikka</p>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF6ED] border border-[#DCB980] shadow-subtle">
                  <span className="text-xs text-[#8C6F3B] font-semibold uppercase tracking-wider flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C6A66A]" /> Active AI Action Alert
                  </span>
                  <p className="text-sm font-semibold text-[#173D32] mt-1">
                    Service delay pattern detected
                  </p>
                  <p className="mt-1 text-xs text-[#737B73]">
                    3 reviews flagged weekend main-course wait times exceeding 40 minutes.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. CORE CAPABILITIES (FEATURES) */}
      <section id="features" className="py-20 bg-white border-y border-[#E7E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
              One Integrated Operating System for Food & Hospitality
            </h2>
            <p className="text-base sm:text-lg text-[#737B73]">
              No more fragmented tools. NG DineAI brings menu publishing, guest interaction, feedback analysis, and food waste reduction under a single architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="card-luxury p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E4ECE7] text-[#173D32] flex items-center justify-center mb-6">
                  <QrCode className="w-6 h-6 text-[#173D32]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">
                  AI-Powered Digital QR Menus
                </h3>
                <p className="text-sm text-[#737B73] leading-relaxed">
                  Mobile-first, ultrafast QR menus with instant search, allergen flags, and an embedded conversational dining assistant grounded in verified dish records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E4DC] text-xs font-semibold text-[#173D32]">
                Verified Prices • Dietary Badges
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-luxury p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#C6A66A] flex items-center justify-center mb-6">
                  <BrainCircuit className="w-6 h-6 text-[#8C6F3B]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">
                  Menu Studio & Extraction
                </h3>
                <p className="text-sm text-[#737B73] leading-relaxed">
                  Upload PDF or image menus with automated PyMuPDF parsing. Generate multilingual dish descriptions (English, Hindi, Hinglish) with mandatory human review.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E4DC] text-xs font-semibold text-[#173D32]">
                Multilingual AI • Human Approval
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-luxury p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E4ECE7] text-[#173D32] flex items-center justify-center mb-6">
                  <MessageSquareQuote className="w-6 h-6 text-[#173D32]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">
                  Customer Review Intelligence
                </h3>
                <p className="text-sm text-[#737B73] leading-relaxed">
                  Ingest customer feedback via CSV or manual entry. Automatically extract sentiment scores, recurring complaints, and positive highlights with quoted evidence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E4DC] text-xs font-semibold text-[#173D32]">
                Thematic Extraction • AI Reply Studio
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card-luxury p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#C6A66A] flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-[#8C6F3B]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">
                  Sales & Revenue Analytics
                </h3>
                <p className="text-sm text-[#737B73] leading-relaxed">
                  Deterministic financial calculations based on verified orders and sales records. Real-time AOV, dish performance matrix, and category breakdowns.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E4DC] text-xs font-semibold text-[#173D32]">
                Deterministic Math • Zero Hallucinations
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card-luxury p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E4ECE7] text-[#173D32] flex items-center justify-center mb-6">
                  <Trash2 className="w-6 h-6 text-[#173D32]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">
                  Food Waste Intelligence
                </h3>
                <p className="text-sm text-[#737B73] leading-relaxed">
                  Log dish and ingredient wastage by reason (over-preparation, spoilage, expiration) to uncover cost drains and receive actionable prep-size adjustments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E4DC] text-xs font-semibold text-[#173D32]">
                Cost Tracking • Waste Prevention
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card-luxury p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] text-[#C6A66A] flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-[#8C6F3B]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">
                  AI Restaurant Action Engine
                </h3>
                <p className="text-sm text-[#737B73] leading-relaxed">
                  A proactive operational nervous system detecting service bottlenecks, menu discrepancies, unreplied critical reviews, and repeated kitchen waste.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E7E4DC] text-xs font-semibold text-[#173D32]">
                Evidence-Based • Actionable Alerts
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
              How NG DineAI Works
            </h2>
            <p className="text-[#737B73]">
              Simple to onboard, robust to scale. Operationalize your dining venue in four steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] relative">
              <span className="font-serif text-3xl font-bold text-[#C6A66A] opacity-60">01</span>
              <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 mb-2">
                Set Up Workspace
              </h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Configure dining venue details, operating hours, currency, table ordering settings, and staff roles with strict tenant isolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] relative">
              <span className="font-serif text-3xl font-bold text-[#C6A66A] opacity-60">02</span>
              <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 mb-2">
                Publish Menu
              </h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Upload your menu PDF or create categories manually. Enrich dish descriptions in English and Hindi, verify allergens, and generate live QR codes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] relative">
              <span className="font-serif text-3xl font-bold text-[#C6A66A] opacity-60">03</span>
              <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 mb-2">
                Connect Business Data
              </h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Capture live QR orders or import past sales and guest review CSVs to establish historical baseline records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] relative">
              <span className="font-serif text-3xl font-bold text-[#C6A66A] opacity-60">04</span>
              <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 mb-2">
                Review Insights & Act
              </h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Inspect AI Action Engine recommendations to fix service delays, curtail dish waste, and approve respectful guest review replies.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. CUSTOMER USE CASES */}
      <section id="solutions" className="py-20 bg-white border-t border-[#E7E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
              Engineered for Every Hospitality Format
            </h2>
            <p className="text-[#737B73]">
              From fine-dining establishments to fast-moving cloud kitchens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-xl border border-[#E7E4DC] bg-[#FAF6ED]/50 hover:bg-[#FAF6ED] transition-colors">
              <ChefHat className="w-8 h-8 text-[#173D32] mb-4" />
              <h4 className="font-serif text-lg font-bold text-[#173D32] mb-2">Fine-Dining & Hotels</h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Elevate table hospitality with sommelier-grade AI recommendations, multilingual storytelling, and polished feedback handling.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E7E4DC] bg-[#FAF6ED]/50 hover:bg-[#FAF6ED] transition-colors">
              <Coffee className="w-8 h-8 text-[#173D32] mb-4" />
              <h4 className="font-serif text-lg font-bold text-[#173D32] mb-2">Boutique Cafes</h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Rapid QR ordering at counters, dietary allergen alerts, and instant morning beverage highlights without cashier bottlenecks.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E7E4DC] bg-[#FAF6ED]/50 hover:bg-[#FAF6ED] transition-colors">
              <Store className="w-8 h-8 text-[#173D32] mb-4" />
              <h4 className="font-serif text-lg font-bold text-[#173D32] mb-2">Cloud Kitchens</h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Tight food waste tracking, menu item profitability analytics, and prompt kitchen ticket dispatch velocity monitoring.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E7E4DC] bg-[#FAF6ED]/50 hover:bg-[#FAF6ED] transition-colors">
              <Building className="w-8 h-8 text-[#173D32] mb-4" />
              <h4 className="font-serif text-lg font-bold text-[#173D32] mb-2">Restaurant Chains</h4>
              <p className="text-xs text-[#737B73] leading-relaxed">
                Unified brand menus with multi-tenant data isolation, staff role hierarchies, and centralized management intelligence.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-20 bg-[#173D32] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Transform Your Restaurant Operations?
          </h2>
          <p className="text-base sm:text-lg text-[#C5D7CC] max-w-2xl mx-auto">
            Experience the intelligence suite trusted by forward-thinking dining businesses. Begin your journey today.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-[#102C25] bg-[#C6A66A] hover:bg-[#DCB980] shadow-luxury transition-all"
            >
              Get Started with NG DineAI
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-semibold text-white border border-[#2A6354] hover:bg-[#102C25] transition-all"
            >
              Sign In to Existing Workspace
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
