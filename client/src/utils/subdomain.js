/**
 * subdomain.js
 *
 * Provides utilities for detecting and navigating between the
 * customer storefront and the dedicated admin workspace/subdomain.
 *
 * Environments:
 *   1. Custom Domain / Production Subdomain:
 *        Storefront:      https://shopease.com/
 *        Admin Workspace: https://admin.shopease.com/
 *   2. Local Subdomain:
 *        Storefront:      http://localhost:8000/
 *        Admin Workspace: http://admin.localhost:8000/
 *   3. Single Domain / Free Tier (Render / Railway / localhost zero-DNS):
 *        Storefront:      http://localhost:8000/ (or https://shopease.onrender.com/)
 *        Admin Workspace: http://localhost:8000/admin
 */

/**
 * Detects whether the current browser window is running on a dedicated admin subdomain.
 * Returns true if:
 *   - Hostname starts with 'admin.' or is 'admin' (e.g. admin.shopease.com, admin.localhost)
 *   - Overridden via VITE_IS_ADMIN_SUBDOMAIN='true'
 */
export function isAdminSubdomain() {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith("admin.") || hostname === "admin") {
    return true;
  }

  if (import.meta.env.VITE_IS_ADMIN_SUBDOMAIN === "true") {
    return true;
  }

  return false;
}

/**
 * Returns the URL pointing to the customer storefront.
 * Always appends '?preview=guest' so when opened in a new tab from the admin portal,
 * the storefront renders as a fresh, unauthenticated guest visitor.
 */
export function getStorefrontUrl(path = "/") {
  if (typeof window === "undefined") return `${path}?preview=guest`;

  const { protocol, host } = window.location;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If running on actual subdomain (admin.shopease.com or admin.localhost:8000)
  if (host.toLowerCase().startsWith("admin.")) {
    const mainHost = host.replace(/^admin\./i, "");
    return `${protocol}//${mainHost}${cleanPath}?preview=guest`;
  }

  // Single domain / localhost: open root with guest preview
  return `${cleanPath}?preview=guest`;
}

/**
 * Returns the URL pointing to the admin workspace.
 * On production custom domains, points to admin.<host>.
 * On localhost or single domain hosts, points to distinct '/admin' path.
 */
export function getAdminWorkspaceUrl(path = "/") {
  if (typeof window === "undefined") return "/admin";

  const { protocol, host } = window.location;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If on production custom domain (e.g. shopease.com)
  if (
    !host.toLowerCase().startsWith("admin.") &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1") &&
    !host.includes("onrender.com") &&
    !host.includes("railway.app")
  ) {
    return `${protocol}//admin.${host}${cleanPath}`;
  }

  // On localhost or single-domain hosting, direct path to /admin avoids DNS issues and collision
  return cleanPath === "/"
    ? "/admin"
    : cleanPath.startsWith("/admin")
    ? cleanPath
    : `/admin${cleanPath}`;
}
