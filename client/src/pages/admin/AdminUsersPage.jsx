import { useEffect, useState, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  User,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Search,
  X,
  Calendar,
  Sparkles,
} from "lucide-react";
import adminApi from "../../api/admin.api.js";
import { useAuth } from "../../hooks/useAuth.js";

const ROLE_TABS = [
  { label: "All Users", value: "" },
  { label: "Customers", value: "user" },
  { label: "Admins", value: "admin" },
];

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getAllUsers(params);
      setUsers(res.data?.users || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleRoleChange = (val) => {
    setRoleFilter(val);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget._id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete user account.");
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Users & Customer Accounts
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review registered customer accounts, view signup dates, and manage privileges
        </p>
      </div>

      {/* 2. Search & Role Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {ROLE_TABS.map((tab) => {
            const active = roleFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleRoleChange(tab.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap select-none shrink-0 cursor-pointer ${
                  active
                    ? "bg-brand-500 text-gray-950 shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search customers by name or email..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Main Content Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
            <p className="text-xs text-gray-400 font-semibold">Loading accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">No users found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search || roleFilter
                ? "Try clearing your search terms or role filters."
                : "No customer accounts registered in the database yet."}
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (hidden on mobile < 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Joined Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isSelf = String(u._id) === String(currentAdmin?._id);
                    const isAdmin = u.role === "admin";
                    const joinDate = u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently";

                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Avatar & Name */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-gray-950 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <p className="font-bold text-xs sm:text-sm text-gray-900">
                                {u.name}
                              </p>
                              {isSelf && (
                                <span className="inline-block text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded">
                                  You (Current)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-6 text-xs text-gray-600 font-medium">
                          {u.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-6">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                              <User className="w-3 h-3 text-gray-400" />
                              Customer
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                          {joinDate}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            disabled={isSelf}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={isSelf ? "You cannot delete your own account" : "Delete Account"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE TABLE-TO-CARD VIEW (shown on screens < 768px, zero horizontal scrolling!) */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = String(u._id) === String(currentAdmin?._id);
                const isAdmin = u.role === "admin";
                const joinDate = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <div key={u._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-gray-950 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                              {u.name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded">
                                (You)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(u)}
                        disabled={isSelf}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-20 shrink-0 cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50">
                      <div>
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <ShieldCheck className="w-3 h-3 text-brand-600" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3 text-gray-400" />
                            Customer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {joinDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 4. Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50 select-none text-xs">
            <span className="text-gray-500 font-medium hidden sm:inline">
              Showing page <strong className="text-gray-900">{pagination.page}</strong> of{" "}
              <strong className="text-gray-900">{pagination.totalPages}</strong> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-bold text-gray-900 px-2 sm:hidden">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Safe Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-gray-900">Confirm Account Deletion</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete account for{" "}
                <strong className="text-gray-900">{deleteTarget.name}</strong> ({deleteTarget.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
