import {
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
} from "lucide-react";

/**
 * CheckoutPaymentStep
 *
 * Step 2 of the Checkout Stepper:
 * - Commercial radio cards for Razorpay (Instant Online) vs Cash on Delivery (COD)
 * - Bank offer highlights
 * - Security & encryption assurance badges
 */
export default function CheckoutPaymentStep({
  paymentMethod = "Razorpay",
  setPaymentMethod,
  onProceed,
  onBack,
  subtotal = 0,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-950">
            2. Payment Method
          </h2>
          <p className="text-xs text-gray-500">
            Select your preferred secure payment method
          </p>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-3.5">
        {/* 1. Razorpay Online Payment */}
        <div
          onClick={() => setPaymentMethod("Razorpay")}
          className={`p-4 sm:p-5 border-2 rounded-2xl flex items-start gap-3.5 cursor-pointer transition-all ${
            paymentMethod === "Razorpay"
              ? "border-brand-500 bg-brand-50/30 shadow-xs ring-2 ring-brand-300"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="mt-0.5">
            {paymentMethod === "Razorpay" ? (
              <CheckCircle2 className="w-5 h-5 fill-brand-500 text-white" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-gray-950 text-sm">
                  Online Payment (Cards / UPI / NetBanking)
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 bg-brand-100 text-brand-900 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-brand-600 text-brand-600" />
                ⚡ Recommended
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pay instantly via Google Pay, PhonePe, Paytm, UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), or NetBanking powered by Razorpay.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-green-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant refund to original source in case of cancellation.</span>
            </div>
          </div>
        </div>

        {/* 2. Cash on Delivery (COD) */}
        <div
          onClick={() => setPaymentMethod("COD")}
          className={`p-4 sm:p-5 border-2 rounded-2xl flex items-start gap-3.5 cursor-pointer transition-all ${
            paymentMethod === "COD"
              ? "border-brand-500 bg-brand-50/30 shadow-xs ring-2 ring-brand-300"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="mt-0.5">
            {paymentMethod === "COD" ? (
              <CheckCircle2 className="w-5 h-5 fill-brand-500 text-white" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-600" />
                <span className="font-bold text-gray-950 text-sm">
                  Cash on Delivery (COD)
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full">
                Pay at Doorstep
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pay conveniently with Cash or UPI directly to our delivery courier when your package arrives.
            </p>
          </div>
        </div>
      </div>

      {/* Security Trust Badges */}
      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500 text-center">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-gray-600" />
          <span className="font-semibold text-gray-700">256-Bit SSL Encrypted</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span className="font-semibold text-gray-700">RBI Compliant Gateway</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Address</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="flex-1 py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <span>Continue to Order Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

