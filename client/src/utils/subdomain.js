/**
 * subdomain.js
 *
 * Provides utilities for detecting and navigating between the
 * customer storefront and the dedicated admin subdomain/portal.
 *
 * Supported environments:
 *   1. Custom Domain / Production Subdomain:
 *        Storefront:      https://shopease.com/
 *        Admin Workspace: https://admin.shopease.com/
 *   2. Local Subdomain:
 *        Storefront:      http://localhost:8000/
 *        Admin Workspace: http://admin.localhost:8000/
 *   3. Free Tier / Staging Review (Render / Railway / localhost zero-DNS):
 *        Storefront:      https://shopease.onrender.com/
 *        Admin Workspace: https://shopease.onrender.com/?portal=admin
 */

const PORTAL_SESSION_KEY = "shopease_active_portal";

/**
 * Detects whether the current browser window is running in Admin Portal mode.
 * Returns true if:
 *   - Hostname starts with 'admin.' or is 'admin' (e.g. admin.shopease.com, admin.localhost)
 *   - URL query parameter contains ?portal=admin (for free tier / preview review)
 *   - Session storage preserves portal='admin' across page clicks
 *   - Overridden via VITE_IS_ADMIN_SUBDOMAIN='true'
 */
export function isAdminSubdomain() {
  if (typeof window === "undefined") return false;

  // 1. Check URL query param (e.g. ?portal=admin or ?portal=store)
  const urlParams = new URLSearchParams(window.location.search);
  const portalParam = urlParams.get("portal");

  if (portalParam === "admin") {
    try {
      sessionStorage.setItem(PORTAL_SESSION_KEY, "admin");
    } catch {
      // sessionStorage unavailable / restricted
    }
    return true;
  }

  if (portalParam === "store") {
    try {
      sessionStorage.removeItem(PORTAL_SESSION_KEY);
    } catch {
      // ignore
    }
    return false;
  }

  // 2. Check Hostname subdomain prefix (e.g. admin.shopease.com, admin.localhost)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith("admin.") || hostname === "admin") {
    return true;
  }

  // 3. Check preserved staging review session
  try {
    if (sessionStorage.getItem(PORTAL_SESSION_KEY) === "admin") {
      return true;
    }
  } catch {
    // ignore
  }

  // 4. Test / preview build override
  if (import.meta.env.VITE_IS_ADMIN_SUBDOMAIN === "true") {
    return true;
  }

  return false;
}

/**
 * Clears any active admin preview session and returns URL to customer storefront.
 */
export function exitAdminPortalToStorefront() {
  if (typeof window === "undefined") return "/";

  try {
    sessionStorage.removeItem(PORTAL_SESSION_KEY);
  } catch {
    // ignore
  }

  const { protocol, host } = window.location;

  // If running on actual subdomain (admin.shopease.com or admin.localhost)
  if (host.toLowerCase().startsWith("admin.")) {
    const mainHost = host.replace(/^admin\./i, "");
    return `${protocol}//${mainHost}/`;
  }

  // On free tier / single-host, navigate to root with ?portal=store
  return "/?portal=store";
}

/**
 * Returns the URL pointing to the customer storefront.
 */
export function getStorefrontUrl(path = "/") {
  if (typeof window === "undefined") return path;

  const { protocol, host } = window.location;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (host.toLowerCase().startsWith("admin.")) {
    const mainHost = host.replace(/^admin\./i, "");
    return `${protocol}//${mainHost}${cleanPath}`;
  }

  return `${cleanPath}?portal=store`;
}

/**
 * Returns the URL pointing to the admin subdomain workspace.
 */
export function getAdminWorkspaceUrl(path = "/") {
  if (typeof window === "undefined") return path;

  const { protocol, host } = window.location;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If on actual domain, point to admin.<host>
  if (!host.toLowerCase().startsWith("admin.") && !host.includes("onrender.com") && !host.includes("railway.app")) {
    return `${protocol}//admin.${host}${cleanPath}`;
  }

  // Fallback for free tiers
  return `${cleanPath}?portal=admin`;
}
