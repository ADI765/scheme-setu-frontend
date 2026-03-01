/**
 * Scheme Setu — Utility Functions (utils.js)
 * Shared helper functions used across all pages.
 */

// ===== localStorage Helpers =====

/**
 * Get wishlist array from localStorage.
 * @returns {Array} Array of saved scheme objects.
 */
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem("schemeSetu_wishlist")) || [];
    } catch (e) {
        return [];
    }
}

/**
 * Save wishlist array to localStorage.
 * @param {Array} list - Array of scheme objects.
 */
function saveWishlist(list) {
    localStorage.setItem("schemeSetu_wishlist", JSON.stringify(list));
}

/**
 * Check if a scheme is already in the wishlist.
 * @param {string} schemeName - The scheme_name to check.
 * @returns {boolean}
 */
function isInWishlist(schemeName) {
    return getWishlist().some((s) => s.scheme_name === schemeName);
}

/**
 * Add a scheme to the wishlist (prevents duplicates).
 * @param {Object} scheme - { scheme_name, description, apply_link }
 * @returns {boolean} true if added, false if duplicate.
 */
function addToWishlist(scheme) {
    const list = getWishlist();
    if (list.some((s) => s.scheme_name === scheme.scheme_name)) {
        return false; // duplicate
    }
    list.push(scheme);
    saveWishlist(list);
    return true;
}

/**
 * Remove a scheme from the wishlist by name.
 * @param {string} schemeName
 */
function removeFromWishlist(schemeName) {
    const list = getWishlist().filter((s) => s.scheme_name !== schemeName);
    saveWishlist(list);
}

/**
 * Clear the entire wishlist.
 */
function clearWishlist() {
    localStorage.removeItem("schemeSetu_wishlist");
}

// ===== sessionStorage Helpers =====

/**
 * Store eligible schemes in sessionStorage (for page navigation persistence).
 * @param {Array} schemes
 */
function storeEligibleSchemes(schemes) {
    sessionStorage.setItem("schemeSetu_schemes", JSON.stringify(schemes));
}

/**
 * Get eligible schemes from sessionStorage.
 * @returns {Array}
 */
function getEligibleSchemes() {
    try {
        return JSON.parse(sessionStorage.getItem("schemeSetu_schemes")) || [];
    } catch (e) {
        return [];
    }
}

/**
 * Store the current swipe index in sessionStorage.
 * @param {number} index
 */
function storeCurrentIndex(index) {
    sessionStorage.setItem("schemeSetu_index", index.toString());
}

/**
 * Get the current swipe index from sessionStorage.
 * @returns {number}
 */
function getCurrentIndex() {
    return parseInt(sessionStorage.getItem("schemeSetu_index") || "0", 10);
}

/**
 * Clear session data (schemes + index). Does NOT clear wishlist.
 */
function clearSession() {
    sessionStorage.removeItem("schemeSetu_schemes");
    sessionStorage.removeItem("schemeSetu_index");
}

// ===== Toast Notification =====

/**
 * Show a toast notification at the bottom of the screen.
 * @param {string} message
 * @param {number} duration - milliseconds (default 2500)
 */
function showToast(message, duration = 2500) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

// ===== DOM Helpers =====

/**
 * Shortcut for document.getElementById.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function $(id) {
    return document.getElementById(id);
}
