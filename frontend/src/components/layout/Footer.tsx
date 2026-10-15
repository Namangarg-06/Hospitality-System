import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Shield, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102C25] text-[#EFECE2] border-t border-[#1D4A3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#C6A66A] flex items-center justify-center text-[#102C25]">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                NG Dine<span className="text-[#C6A66A]">AI</span>
              </span>
            </div>
            <p className="text-sm text-[#C5D7CC] leading-relaxed">
              Smarter Dining. Smarter Operations. An integrated hospitality intelligence platform combining AI menus, guest feedback, sales analytics, and kitchen waste tracking.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#C6A66A] mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C5D7CC]">
              <li><Link to="/m/the-royal-saffron" className="hover:text-white transition-colors">AI Digital QR Menus</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">AI Menu Studio & Extraction</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Guest Review Intelligence</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sales & Revenue Analytics</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Food Waste Intelligence</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">AI Action Engine</Link></li>
            </ul>
          </div>

          {/* Target Customers */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#C6A66A] mb-4">
              Designed For
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C5D7CC]">
              <li>Fine-Dining Restaurants</li>
              <li>Boutique Cafes & Bistros</li>
              <li>Hotels & Outlets</li>
              <li>Cloud Kitchens</li>
              <li>Multi-location Dining Chains</li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#C6A66A] mb-4">
              Inquiries & Security
            </h4>
            <ul className="space-y-3 text-sm text-[#C5D7CC]">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#C6A66A]" />
                <span>concierge@dineai.in</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#C6A66A]" />
                <span>+91 11 4982 7700</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#C6A66A]" />
                <span>New Delhi, India</span>
              </li>
              <li className="pt-2 flex items-center text-xs text-[#E8D7B0]">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-[#C6A66A]" />
                <span>Enterprise Multi-Tenant Data Isolation</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#1D4A3E] flex flex-col sm:flex-row items-center justify-between text-xs text-[#C5D7CC]">
          <p>© {new Date().getFullYear()} NG DineAI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Standards</span>
            <Link to="/login" className="text-[#C6A66A] hover:underline">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
