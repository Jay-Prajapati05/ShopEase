import { useState } from "react";
import { Truck, RotateCcw, ShieldCheck, CreditCard, MapPin, CheckCircle2 } from "lucide-react";

/**
 * ProductPolicyCard
 *
 * Flipkart / Amazon trust badges & interactive delivery pincode checker.
 * Supports variants:
 * - "all": renders both pincode checker and trust badges
 * - "badges": renders only commercial trust badges grid
 * - "pincode": renders only interactive pincode checker
 */
export default function ProductPolicyCard({ variant = "all" }) {
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setPincodeChecked(true);
    }
  };

  const showPincode = variant === "all" || variant === "pincode";
  const showBadges = variant === "all" || variant === "badges";

  return (
    <div className="space-y-4">
      {/* 1. Delivery Pincode Checker */}
      {showPincode && (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Delivery Options & Pincode</span>
          </label>
          <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-sm">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                setPincodeChecked(false);
              }}
              placeholder="Enter 6-digit Pincode"
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-brand-500 bg-white"
            />
            <button
              type="submit"
              disabled={pincode.length < 6}
              className="px-4 py-2 bg-gray-900 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
            >
              Check
            </button>
          </form>

          {pincodeChecked && (
            <p className="text-xs font-bold text-green-700 flex items-center gap-1.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span>Fast Delivery available to {pincode} in 2–3 business days!</span>
            </p>
          )}
        </div>
      )}

      {/* 2. Commercial Trust Badges Grid */}
      {showBadges && (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong className="text-gray-900 block font-bold">Free Delivery</strong>
              <span className="text-gray-500">Orders over ₹500</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <RotateCcw className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong className="text-gray-900 block font-bold">7-Day Returns</strong>
              <span className="text-gray-500">Hassle-free replacement</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <CreditCard className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong className="text-gray-900 block font-bold">Pay on Delivery</strong>
              <span className="text-gray-500">Cash or UPI accepted</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong className="text-gray-900 block font-bold">100% Genuine</strong>
              <span className="text-gray-500">Brand warranty</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
