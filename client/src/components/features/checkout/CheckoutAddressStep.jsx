import { useState } from "react";
import {
  MapPin,
  Pencil,
  CheckCircle2,
  Phone,
  Save,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * CheckoutAddressStep
 *
 * Step 1 of the Checkout Stepper:
 * - Displays saved address with 1-click selection
 * - Inline form to enter or edit delivery destination
 * - 10-digit Indian phone regex validation
 * - Optional "Save for future orders" persistence
 */
export default function CheckoutAddressStep({
  shippingAddress,
  setShippingAddress,
  savedAddress,
  addressLoading,
  isEditingAddress,
  setIsEditingAddress,
  saveForFuture,
  setSaveForFuture,
  onProceed,
}) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!shippingAddress.address?.trim()) errs.address = "Street address is required";
    if (!shippingAddress.city?.trim()) errs.city = "City is required";
    if (!shippingAddress.postalCode?.trim()) {
      errs.postalCode = "PIN / Postal code is required";
    } else if (!/^[0-9]{4,10}$/.test(shippingAddress.postalCode.trim())) {
      errs.postalCode = "Enter a valid postal code (4–10 digits)";
    }
    if (!shippingAddress.country?.trim()) errs.country = "Country is required";
    if (!shippingAddress.phone?.trim()) {
      errs.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(shippingAddress.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
    }
    if (
      shippingAddress.altPhone?.trim() &&
      !PHONE_REGEX.test(shippingAddress.altPhone.trim())
    ) {
      errs.altPhone = "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validate()) {
      onProceed();
    }
  };

  const hasSavedAddress = savedAddress && !isEditingAddress;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-950">
              1. Delivery Address
            </h2>
            <p className="text-xs text-gray-500">
              Where should we deliver your order?
            </p>
          </div>
        </div>

        {/* Change address toggle */}
        {!addressLoading && savedAddress && (
          <button
            type="button"
            onClick={() => {
              if (isEditingAddress) {
                setShippingAddress(savedAddress);
                setErrors({});
                setSaveForFuture(false);
              }
              setIsEditingAddress((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors border border-brand-200 hover:border-brand-400 bg-brand-50/50 rounded-xl px-3 py-1.5 cursor-pointer"
          >
            {isEditingAddress ? (
              "Cancel"
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                <span>Change Address</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {addressLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      ) : hasSavedAddress ? (
        /* Saved Address Card */
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-brand-500 bg-brand-50/20 p-5 shadow-xs relative">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-brand-900 bg-brand-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Default Saved Address
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug">
                  {shippingAddress.address}
                </p>
                <p className="text-xs text-gray-600">
                  {shippingAddress.city} — {shippingAddress.postalCode}, {shippingAddress.country}
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>+91 {shippingAddress.phone}</span>
                  {shippingAddress.altPhone && (
                    <span className="text-gray-400">· Alt: +91 {shippingAddress.altPhone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceed}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <span>Deliver to This Address &amp; Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Editable Address Form */
        <form onSubmit={handleContinue} noValidate className="space-y-4">
          {/* Street Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
            >
              Street Address / Flat / Area *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="e.g. 123 MG Road, 2nd Floor, Indiranagar"
              value={shippingAddress.address}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.address
                  ? "border-red-300 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-200 focus:border-brand-500 focus:ring-brand-100"
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
              >
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Bengaluru"
                value={shippingAddress.city}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.city
                    ? "border-red-300 focus:ring-red-200 bg-red-50/20"
                    : "border-gray-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />
              {errors.city && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.city}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label
                htmlFor="postalCode"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
              >
                Postal Code / PIN *
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="e.g. 560001"
                maxLength={6}
                value={shippingAddress.postalCode}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.postalCode
                    ? "border-red-300 focus:ring-red-200 bg-red-50/20"
                    : "border-gray-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
            >
              Country *
            </label>
            <input
              id="country"
              name="country"
              type="text"
              value={shippingAddress.country}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
            />
            {errors.country && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.country}</p>
            )}
          </div>

          {/* Phone Numbers */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-600" />
              Delivery Contact Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Primary Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    +91
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.phone
                        ? "border-red-300 focus:ring-red-200 bg-red-50/20"
                        : "border-gray-200 focus:border-brand-500 focus:ring-brand-100"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Alternate Phone */}
              <div>
                <label
                  htmlFor="altPhone"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Alternate Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    +91
                  </span>
                  <input
                    id="altPhone"
                    name="altPhone"
                    type="tel"
                    placeholder="9123456789"
                    maxLength={10}
                    value={shippingAddress.altPhone}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.altPhone
                        ? "border-red-300 focus:ring-red-200 bg-red-50/20"
                        : "border-gray-200 focus:border-brand-500 focus:ring-brand-100"
                    }`}
                  />
                </div>
                {errors.altPhone && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.altPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save for future checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-2 select-none">
            <input
              type="checkbox"
              id="saveForFuture"
              checked={saveForFuture}
              onChange={(e) => setSaveForFuture(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
            />
            <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-brand-600" />
              Save this address for future orders
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 mt-4"
          >
            <span>Save &amp; Continue to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

