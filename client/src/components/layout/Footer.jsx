import { Link } from "react-router-dom";
import {
  ShoppingBag,
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Gift,
  Briefcase,
  Headphones,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * Footer
 *
 * Comprehensive commercial e-commerce footer inspired by Flipkart & Amazon.
 * Features:
 * - 4 Structured navigation columns (About, Help, Consumer Policy, Registered Office)
 * - Trust guarantee badges (100% Genuine, Easy 7-Day Returns, Free Delivery > ₹500)
 * - Commercial sub-footer with seller/admin links, payment partner icons & copyright
 */
export default function Footer() {
  const { isAuthenticated, isAdmin } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-gray-400 mt-auto w-full max-w-full border-t border-slate-900 select-none">
      {/* 1. Value Guarantee Highlights Strip */}
      <div className="border-b border-slate-900 bg-slate-900/60 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Free Delivery</h4>
                <p className="text-[11px] text-gray-400">On all prepaid orders over ₹500</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">100% Genuine</h4>
                <p className="text-[11px] text-gray-400">Directly verified catalog products</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">7 Days Return</h4>
                <p className="text-[11px] text-gray-400">Hassle-free replacement policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Secure Payments</h4>
                <p className="text-[11px] text-gray-400">Razorpay, UPI, Netbanking & COD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Multi-Column Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10 text-xs">
          {/* Column 1: ABOUT */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
              About
            </h5>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-brand-400 transition-colors">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">Careers</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">ShopEase Stories</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">Press & Media</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">Corporate Information</span>
              </li>
            </ul>
          </div>

          {/* Column 2: HELP */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
              Help & Support
            </h5>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:text-brand-400 transition-colors">
                  Payments & Refunds
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-brand-400 transition-colors">
                  Shipping & Tracking
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthenticated ? "/my-orders" : "/login"}
                  className="hover:text-brand-400 transition-colors"
                >
                  Cancellation & Returns
                </Link>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">FAQ & Support</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-not-allowed">Report an Issue</span>
              </li>
            </ul>
          </div>

          {/* Column 3: CONSUMER POLICY */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
              Consumer Policy
            </h5>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">7-Day Replacement Policy</span>
              </li>
              <li>
                <span className="text-gray-400">Terms of Use</span>
              </li>
              <li>
                <span className="text-gray-400">Security & Encryption</span>
              </li>
              <li>
                <span className="text-gray-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gray-400">Grievance Redressal</span>
              </li>
              <li>
                <span className="text-gray-400">EPR Compliance</span>
              </li>
            </ul>
          </div>

          {/* Column 4: MAIL US */}
          <div className="space-y-3 md:border-l md:border-slate-900 md:pl-6">
            <h5 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
              Mail Us
            </h5>
            <div className="text-[11px] text-gray-400 leading-relaxed space-y-1">
              <p className="font-semibold text-gray-300">ShopEase Internet Private Limited,</p>
              <p>Buildings Alyssa, Begonia & Clove,</p>
              <p>Embassy Tech Village, Outer Ring Road,</p>
              <p>Devarabeesanahalli Village,</p>
              <p>Bengaluru, 560103, Karnataka, India</p>
              <p className="pt-2 text-brand-400 font-semibold">support@shopease.com</p>
            </div>
          </div>

          {/* Column 5: REGISTERED OFFICE */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <h5 className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
              Registered Office
            </h5>
            <div className="text-[11px] text-gray-400 leading-relaxed space-y-1">
              <p className="font-semibold text-gray-300">ShopEase Internet Private Limited,</p>
              <p>Outer Ring Road, Bengaluru, 560103,</p>
              <p>Karnataka, India</p>
              <p className="pt-1 text-gray-500 font-mono text-[10px]">CIN: U51109KA2026PTC066107</p>
              <p className="pt-1 text-gray-300 font-medium">Telephone: 044-45614700 / 044-67415800</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Footer Strip (Seller, Advertise, Copyright & Payment Icons) */}
      <div className="border-t border-slate-900 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-400">
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-bold"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Admin Workspace</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-400">
                <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                <span>Become an Admin / Seller</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 text-gray-400">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Gift Cards</span>
            </span>

            <span className="flex items-center gap-1.5 text-gray-400">
              <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
              <span>24x7 Help Center</span>
            </span>
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-[11px] text-center">
            &copy; {year} ShopEase.com — Designed for Commercial Indian E-Commerce.
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-gray-300 font-bold">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-gray-300 font-bold">
              Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-gray-300 font-bold">
              RuPay
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-brand-400 font-bold">
              UPI / COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
