/**
 * Redirect service for handling legacy URL redirects
 * This service maps old URLs to new URLs according to the VARAi URL schema
 */

// Legacy domain patterns that need to be redirected
const LEGACY_DOMAINS = {
  MAIN: /^(https?:\/\/)?(www\.)?eyewear-ml\.com(\/.*)?$/,
  API: /^(https?:\/\/)?api\.eyewear-ml\.com\/v1(\/.*)?$/,
  DOCS: /^(https?:\/\/)?(www\.)?docs\.eyewear-ml\.com(\/.*)?$/,
  APP: /^(https?:\/\/)?app\.eyewear-ml\.com(\/.*)?$/,
};

// New domain patterns
const NEW_DOMAINS = {
  MAIN: 'https://varai.ai',
  API: 'https://api.varai.ai/v1',
  DOCS: 'https://docs.varai.ai',
  APP: 'https://app.varai.ai',
};

// Cloud Run URL pattern (assuming this is the current deployment URL)
const CLOUD_RUN_URL = /^(https?:\/\/)?[a-z0-9-]+\.run\.app(\/.*)?$/;

/**
 * Check if the current URL is a legacy URL that needs to be redirected
 * @returns The new URL to redirect to, or null if no redirect is needed
 */
export const checkForRedirect = (): { url: string; isPermanent: boolean } | null => {
  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  
  // Check if we're on a legacy domain
  if (LEGACY_DOMAINS.MAIN.test(currentUrl)) {
    // Extract the path from the legacy URL
    const path = currentUrl.replace(LEGACY_DOMAINS.MAIN, '$3') || '/';
    return { url: `${NEW_DOMAINS.MAIN}${path}`, isPermanent: true };
  }
  
  if (LEGACY_DOMAINS.API.test(currentUrl)) {
    // Extract the path from the legacy URL
    const path = currentUrl.replace(LEGACY_DOMAINS.API, '$2') || '/';
    return { url: `${NEW_DOMAINS.API}${path}`, isPermanent: true };
  }
  
  if (LEGACY_DOMAINS.DOCS.test(currentUrl)) {
    // Extract the path from the legacy URL
    const path = currentUrl.replace(LEGACY_DOMAINS.DOCS, '$3') || '/';
    return { url: `${NEW_DOMAINS.DOCS}${path}`, isPermanent: true };
  }
  
  if (LEGACY_DOMAINS.APP.test(currentUrl)) {
    // Extract the path from the legacy URL
    const path = currentUrl.replace(LEGACY_DOMAINS.APP, '$3') || '/';
    // Ensure the path is properly formatted
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return { url: `${NEW_DOMAINS.APP}${formattedPath}`, isPermanent: true };
  }
  
  // Check if we're on a Cloud Run URL
  if (CLOUD_RUN_URL.test(currentUrl)) {
    // For Cloud Run URLs, we need to determine if it's an admin route or a customer route
    if (currentPath.startsWith('/admin')) {
      // Admin routes go to app.varai.ai
      const adminPath = currentPath.replace('/admin', '');
      // If the path is empty after removing /admin, use / instead
      const finalPath = adminPath || '/';
      return {
        url: `${NEW_DOMAINS.APP}${finalPath}`,
        isPermanent: true
      };
    } else {
      // Customer routes go to varai.ai
      return { url: `${NEW_DOMAINS.MAIN}${currentPath}`, isPermanent: true };
    }
  }
  
  // No redirect needed
  return null;
};

/**
 * Perform a redirect to the new URL
 * @param url The URL to redirect to
 * @param isPermanent Whether the redirect is permanent (301) or temporary (302)
 */
export const performRedirect = (url: string): void => {
  // In a real application, we would set the appropriate status code (301 for permanent, 302 for temporary)
  // However, in a client-side application, we can't set HTTP status codes directly
  // We would need server-side support for this
  
  // For now, we'll just redirect the user
  window.location.href = url;
};

/**
 * Check if the current URL needs to be redirected and perform the redirect if needed
 * @returns true if a redirect was performed, false otherwise
 */
export const handleRedirectIfNeeded = (): boolean => {
  const redirect = checkForRedirect();
  
  if (redirect) {
    performRedirect(redirect.url);
    return true;
  }
  
  return false;
};

export default {
  checkForRedirect,
  performRedirect,
  handleRedirectIfNeeded,
};