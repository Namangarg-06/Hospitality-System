import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  QrCode, 
  UtensilsCrossed, 
  ChefHat, 
  TrendingUp, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: '1',
      title: '🖨️ Kisi Bhi Restaurant Ka QR Banayein',
      subtitle: 'Printable Table Standee & Direct Digital Link',
      icon: <QrCode className="w-6 h-6 text-[#C6A66A]" />,
      color: 'bg-amber-50 border-amber-200',
      description: 'Aap kisi bhi restaurant ka naam daal kar 5 second mein high-resolution QR Standee bana sakte hain. Ise dining table, billing counter ya entrance par lagayein.',
      points: [
        'Table number selector (Table 1, Table 2, Counter...)',
        'Download PNG / SVG ya direct print karein',
        'Automatic pre-loaded delicious food menu'
      ],
      actionText: 'Abhi QR Banayein',
      actionPath: '/qr-generator'
    },
    {
      step: '2',
      title: '📱 Customer Scan Karega & AI Waiter Se Poochhega',
      subtitle: 'No App Download Required — Works on All Phones',
      icon: <UtensilsCrossed className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200',
      description: 'Customer camera se QR scan karta hai. Khana dekhta hai, veg/non-veg filter lagata hai, aur AI Sommelier se poochh sakta hai (e.g. "₹500 me kya best veg starter hai?").',
      points: [
        'Zero-hallucination AI: sirf menu ke items aur sahi price batata hai',
        'Hindi, English aur Hinglish me baat karta hai',
        'Table se direct cart me add karke order place ho jata hai'
      ],
      actionText: 'Customer Menu Try Karein',
      actionPath: '/m/the-royal-saffron'
    },
    {
      step: '3',
      title: '👨‍🍳 Kitchen Display Par Live Order Aayega',
      subtitle: 'Real-time Kitchen Order Ticketing (KOT)',
      icon: <ChefHat className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      description: 'Jaise hi customer order place karega, kitchen dashboard par live order ticket flash hoga with table number, dish details aur special cooking notes.',
      points: [
        'Pending ➔ Accepted ➔ Preparing ➔ Ready to Serve status buttons',
        'Server-side price verification (fraud prevention)',
        'Customer apne phone par live order tracking dekh sakta hai'
      ],
      actionText: 'Kitchen Orders Dekhein',
      actionPath: '/dashboard/orders'
    },
    {
      step: '4',
      title: '📊 Review AI Studio & Sales Analytics',
      subtitle: 'Automated 5-Star Reputation & Revenue Growth',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      description: 'Customer reviews ka sentiment AI automatically analyse karta hai. Polite AI response generate karta hai aur daily sales, food waste ka hisab rakhta hai.',
      points: [
        'AI review reply generator (English, Hindi, Hinglish tones)',
        'Complaint pattern detection (delayed food, staff behavior)',
        'Action Engine: restaurant ke profit badhane ke daily suggestions'
      ],
      actionText: 'Owner Dashboard Dekhein',
      actionPath: '/dashboard'
    }
  ];

  const current = steps[activeStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E7E4DC] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#102C25] text-white p-5 flex items-center justify-between border-b border-[#173D32]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#173D32] flex items-center justify-center text-[#C6A66A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                NG DineAI — Kaise Kaam Karta Hai?
              </h3>
              <p className="text-xs text-[#C5D7CC]">
                Restaurant Growth & Digital Operations Guide (4 Simple Steps)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Pills */}
        <div className="bg-[#FAF6ED] border-b border-[#E7E4DC] px-4 py-2.5 flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeStep === idx
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-[#737B73] hover:text-[#173D32] hover:bg-white/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === idx ? 'bg-[#C6A66A] text-[#102C25] font-bold' : 'bg-stone-200 text-stone-700'
              }`}>
                {s.step}
              </span>
              <span>Step {s.step}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A66A]">
                Step {current.step} of 4
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#173D32] mt-0.5">
                {current.title}
              </h2>
              <p className="text-xs text-[#737B73] font-medium mt-0.5">
                {current.subtitle}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] flex items-center justify-center shrink-0 shadow-inner">
              {current.icon}
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed bg-[#F8F6F0] p-4 rounded-xl border border-[#E7E4DC]">
            {current.description}
          </p>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#173D32]">
              Key Features in this Step:
            </h3>
            <ul className="space-y-2">
              {current.points.map((pt, i) => (
                <li key={i} className="flex items-start text-xs text-stone-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF6ED] border-t border-[#E7E4DC] p-4 flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737B73] hover:text-[#173D32] disabled:opacity-30 disabled:hover:text-[#737B73]"
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                navigate(current.actionPath);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C6A66A] to-[#DCB980] text-[#102C25] hover:brightness-105 shadow-sm transition-all flex items-center"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>

            {activeStep < 3 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#173D32] text-white hover:bg-[#102C25] transition-all"
              >
                Close Guide ✓
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
