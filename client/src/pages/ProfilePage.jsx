import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  User,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Phone,
  Home,
  Save,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import authApi from "../api/auth.api.js";
import AccountNav from "../components/features/account/AccountNav.jsx";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const emptyAddress = {
  address: "",
  city: "",
  postalCode: "",
  country: "India",
  phone: "",
  altPhone: "",
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  // 1. Profile fields state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // 2. Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 3. Saved address state
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressFieldErrors, setAddressFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Fetch saved address on mount
  useEffect(() => {
    let isMounted = true;
    authApi
      .getSavedAddress()
      .then((res) => {
        if (!isMounted) return;
        const addr = res?.data?.address;
        if (addr) setAddressForm({ ...emptyAddress, ...addr });
      })
      .catch(() => {
        // silent fallback if user does not have an address yet
      })
      .finally(() => {
        if (isMounted) setAddressLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
    if (addressFieldErrors[name]) {
      setAddressFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (addressError) setAddressError("");
  };

  const validateAddress = () => {
    const errs = {};
    if (!addressForm.address.trim()) errs.address = "Street address is required";
    if (!addressForm.city.trim()) errs.city = "City is required";
    if (!addressForm.postalCode.trim()) {
      errs.postalCode = "Postal code is required";
    } else if (!/^[0-9]{4,10}$/.test(addressForm.postalCode.trim())) {
      errs.postalCode = "Must be 4–10 digits";
    }
    if (!addressForm.country.trim()) errs.country = "Country is required";
    if (!addressForm.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(addressForm.phone.trim())) {
      errs.phone = "Valid 10-digit Indian mobile (starts with 6–9)";
    }
    if (addressForm.altPhone.trim() && !PHONE_REGEX.test(addressForm.altPhone.trim())) {
      errs.altPhone = "Valid 10-digit Indian mobile (starts with 6–9)";
    }
    setAddressFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");
    if (!validateAddress()) return;

    try {
      setAddressSaving(true);
      await authApi.updateSavedAddress(addressForm);
      setAddressSuccess("Delivery address saved successfully!");
      setTimeout(() => setAddressSuccess(""), 4000);
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.errors?.length) {
        setAddressError(errData.errors.join(" · "));
      } else {
        setAddressError(errData?.message || "Failed to save address");
      }
    } finally {
      setAddressSaving(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!name.trim()) {
      setProfileError("Full Name cannot be empty");
      return;
    }
    if (!email.trim()) {
      setProfileError("Email cannot be empty");
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileSuccess("Personal details updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile";
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      await updateProfile({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password";
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Unified Account Hub Navigation Header */}
      <AccountNav activeTab={activeTab} />

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Account Summary Snapshot */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Account Snapshot
            </h3>

            <div className="space-y-3.5 text-xs text-gray-600">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="font-medium text-gray-500">Account Type</span>
                <span className="font-bold text-gray-900 capitalize bg-gray-100 px-2.5 py-0.5 rounded-lg">
                  {user?.role || "Customer"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="font-medium text-gray-500">Email Status</span>
                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-green-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="font-medium text-gray-500">Member Since</span>
                <span className="font-bold text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-gray-500">Fast Deliveries</span>
                <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                  Eligible (₹500+)
                </span>
              </div>
            </div>

            {/* Quick Action Button to Orders */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <Link
                to="/my-orders"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition shadow-2xs cursor-pointer"
              >
                <span>View Recent Orders</span>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tab Body */}
        <div className="lg:col-span-8">
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                  Personal Information
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Manage your display name and registered email address.
                </p>
              </div>

              {profileSuccess && (
                <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-brand-500 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-brand-500 transition shadow-2xs"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used for order receipts and password reset emails.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-gray-950 text-xs sm:text-sm font-black rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SAVED DELIVERY ADDRESS */}
          {activeTab === "address" && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs">
              <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-600" />
                    Saved Delivery Address
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Auto-filled at checkout for express ordering.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
                  <Home className="w-3 h-3 text-green-600" />
                  Default Address
                </span>
              </div>

              {addressSuccess && (
                <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{addressSuccess}</span>
                </div>
              )}

              {addressError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              {addressLoading ? (
                <div className="space-y-4 animate-pulse py-4">
                  <div className="h-10 bg-gray-100 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-100 rounded-xl" />
                    <div className="h-10 bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveAddress} className="space-y-4 sm:space-y-5" noValidate>
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Flat / House No. / Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      placeholder="e.g. 102, Shivalik Residency, 150 Feet Ring Road"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition shadow-2xs ${
                        addressFieldErrors.address
                          ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400"
                          : "border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-brand-500 focus:bg-white"
                      }`}
                    />
                    {addressFieldErrors.address && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">
                        {addressFieldErrors.address}
                      </p>
                    )}
                  </div>

                  {/* City & PIN Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        City / District
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="e.g. Rajkot, Mumbai"
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition shadow-2xs ${
                          addressFieldErrors.city
                            ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400"
                            : "border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-brand-500 focus:bg-white"
                        }`}
                      />
                      {addressFieldErrors.city && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">
                          {addressFieldErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        PIN Code (Postal Code)
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        placeholder="e.g. 360005"
                        maxLength={10}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition shadow-2xs ${
                          addressFieldErrors.postalCode
                            ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400"
                            : "border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-brand-500 focus:bg-white"
                        }`}
                      />
                      {addressFieldErrors.postalCode && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">
                          {addressFieldErrors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Alternate Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Contact Mobile Number</span>
                        <span className="text-[10px] text-brand-600 font-bold">10-Digit (starts 6–9)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition shadow-2xs ${
                            addressFieldErrors.phone
                              ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400"
                              : "border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-brand-500 focus:bg-white"
                          }`}
                        />
                      </div>
                      {addressFieldErrors.phone && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">
                          {addressFieldErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Alternate Mobile</span>
                        <span className="text-[10px] text-gray-400">Optional</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="altPhone"
                          value={addressForm.altPhone}
                          onChange={handleAddressChange}
                          placeholder="9876543211"
                          maxLength={10}
                          className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition shadow-2xs ${
                            addressFieldErrors.altPhone
                              ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400"
                              : "border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-brand-500 focus:bg-white"
                          }`}
                        />
                      </div>
                      {addressFieldErrors.altPhone && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">
                          {addressFieldErrors.altPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-gray-950 text-xs sm:text-sm font-black rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {addressSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Address...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Delivery Address</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-2xs">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  Security & Password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Keep your account secure with regular password updates.
                </p>
              </div>

              {passwordSuccess && (
                <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Re-type new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Security Recommendation:</strong> Always choose a unique password of at least 8 characters with numbers and symbols. Never share your OTP or password.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
