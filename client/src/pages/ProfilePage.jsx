import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import authApi from "../api/auth.api.js";

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

  // Profile fields state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Saved address state
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
    const fetchAddress = async () => {
      try {
        setAddressLoading(true);
        const res = await authApi.getSavedAddress();
        const addr = res?.data?.address;
        if (addr) setAddressForm({ ...emptyAddress, ...addr });
      } catch {
        // silent — user may not have an address yet
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddress();
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
      errs.phone = "Valid 10-digit Indian mobile (starts 6–9)";
    }
    if (addressForm.altPhone.trim() && !PHONE_REGEX.test(addressForm.altPhone.trim())) {
      errs.altPhone = "Valid 10-digit Indian mobile (starts 6–9)";
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
      setProfileError("Name cannot be empty");
      return;
    }
    if (!email.trim()) {
      setProfileError("Email cannot be empty");
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileSuccess("Profile details updated successfully!");
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Account & Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile details, account preferences and security.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            My Orders
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center text-3xl font-bold shadow-md shadow-amber-500/20 mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 text-left text-xs text-slate-600">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Account Role</span>
                <span className="capitalize font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {user?.role || "Customer"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Joined</span>
                <span className="font-medium text-slate-700">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recently"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Update your display name and email address.
            </p>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-rose-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {profileLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Saved Delivery Address Form ── */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Saved Delivery Address
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Your delivery address is auto-filled at checkout. Phone number is required for delivery contact.
            </p>

            {addressSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {addressSuccess}
              </div>
            )}
            {addressError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg">
                {addressError}
              </div>
            )}

            {addressLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-100 rounded-lg" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-100 rounded-lg" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="space-y-4" noValidate>
                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Street Address / Flat / Area *
                  </label>
                  <input
                    name="address"
                    type="text"
                    placeholder="e.g. 123 MG Road, 2nd Floor"
                    value={addressForm.address}
                    onChange={handleAddressChange}
                    disabled={addressSaving}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                      addressFieldErrors.address ? "border-red-300 bg-red-50" : "border-slate-300"
                    }`}
                  />
                  {addressFieldErrors.address && <p className="text-xs text-red-600 mt-1">{addressFieldErrors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">City *</label>
                    <input
                      name="city"
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      disabled={addressSaving}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                        addressFieldErrors.city ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                    />
                    {addressFieldErrors.city && <p className="text-xs text-red-600 mt-1">{addressFieldErrors.city}</p>}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Postal Code / PIN *</label>
                    <input
                      name="postalCode"
                      type="text"
                      placeholder="e.g. 560001"
                      value={addressForm.postalCode}
                      onChange={handleAddressChange}
                      disabled={addressSaving}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                        addressFieldErrors.postalCode ? "border-red-300 bg-red-50" : "border-slate-300"
                      }`}
                    />
                    {addressFieldErrors.postalCode && <p className="text-xs text-red-600 mt-1">{addressFieldErrors.postalCode}</p>}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Country *</label>
                  <input
                    name="country"
                    type="text"
                    value={addressForm.country}
                    onChange={handleAddressChange}
                    disabled={addressSaving}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {addressFieldErrors.country && <p className="text-xs text-red-600 mt-1">{addressFieldErrors.country}</p>}
                </div>

                {/* Phone Numbers */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">📞 Contact for Delivery</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        disabled={addressSaving}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                          addressFieldErrors.phone ? "border-red-300 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {addressFieldErrors.phone && <p className="text-xs text-red-600 mt-1">{addressFieldErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alternate Phone{" "}
                        <span className="text-slate-400 font-normal normal-case">(optional)</span>
                      </label>
                      <input
                        name="altPhone"
                        type="tel"
                        placeholder="e.g. 9123456789"
                        maxLength={10}
                        value={addressForm.altPhone}
                        onChange={handleAddressChange}
                        disabled={addressSaving}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                          addressFieldErrors.altPhone ? "border-red-300 bg-red-50" : "border-slate-300"
                        }`}
                      />
                      {addressFieldErrors.altPhone && <p className="text-xs text-red-600 mt-1">{addressFieldErrors.altPhone}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {addressSaving ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                    ) : (
                      "Save Address"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password Security Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Change Password
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Ensure your account is using a secure and unique password.
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-rose-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    placeholder="Min 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
