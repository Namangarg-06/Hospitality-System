import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, workspace } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E7E4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#173D32] flex items-center justify-center text-[#C6A66A] shadow-subtle group-hover:bg-[#102C25] transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#173D32]">
                NG Dine<span className="text-[#C6A66A]">AI</span>
              </span>
              <p className="text-[10px] tracking-widest uppercase text-[#737B73] font-medium -mt-1">
                Hospitality Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#202722]">
            <a href="#platform" className="hover:text-[#173D32] transition-colors">Platform</a>
            <a href="#features" className="hover:text-[#173D32] transition-colors">Features</a>
            <Link to="/qr-generator" className="flex items-center text-[#173D32] hover:text-[#C6A66A] font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FAF6ED] to-[#F5EEDB] border border-[#DCB980] transition-colors shadow-2xs">
              <Sparkles className="w-4 h-4 mr-1.5 text-[#C6A66A]" /> ⚡ Smart QR & PDF Menu
            </Link>
            <Link to="/m/the-royal-saffron" className="flex items-center text-[#173D32] hover:text-[#C6A66A] font-semibold transition-colors">
              <UtensilsCrossed className="w-4 h-4 mr-1.5 text-[#C6A66A]" /> Demo QR
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#173D32] hover:bg-[#102C25] shadow-luxury transition-all"
              >
                Go to Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#202722] hover:text-[#173D32] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#173D32] hover:bg-[#102C25] shadow-luxury transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#202722] hover:bg-[#EFECE2]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7E4DC] bg-[#F8F6F0] px-4 pt-2 pb-6 space-y-3">
          <a
            href="#platform"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-[#202722]"
          >
            Platform
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-[#202722]"
          >
            Features
          </a>
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-[#202722]"
          >
            Solutions
          </a>
          <Link
            to="/m/the-royal-saffron"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-[#173D32] flex items-center"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#C6A66A]" /> Experience Live QR Menu
          </Link>
          <div className="pt-4 border-t border-[#E7E4DC] flex flex-col space-y-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-lg bg-[#173D32] text-white font-medium"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-lg border border-[#E7E4DC] bg-white text-[#202722] font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-[#173D32] text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
