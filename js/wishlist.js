/**
 * Scheme Setu — Wishlist Module (wishlist.js)
 * Reads saved schemes from localStorage and renders them on wishlist.html.
 * Handles remove-single, clear-all, and empty state.
 */

(function () {
    "use strict";

    const wishlistGrid = $("wishlist-grid");
    const emptyState = $("empty-state");
    const clearAllBtn = $("clear-all-btn");
    const wishlistCount = $("wishlist-count");

    if (!wishlistGrid) return; // Not on wishlist page

    // ===== Render Wishlist =====
    function renderWishlist() {
        const list = getWishlist();

        // Update count
        if (wishlistCount) wishlistCount.textContent = list.length.toString();

        // Show/hide clear-all button
        if (clearAllBtn) {
            if (list.length > 0) {
                clearAllBtn.classList.remove("hidden");
                clearAllBtn.classList.add("inline-flex");
            } else {
                clearAllBtn.classList.add("hidden");
                clearAllBtn.classList.remove("inline-flex");
            }
        }

        // Empty state
        if (list.length === 0) {
            wishlistGrid.classList.add("hidden");
            if (emptyState) emptyState.classList.remove("hidden");
            return;
        }

        // Has items
        wishlistGrid.classList.remove("hidden");
        if (emptyState) emptyState.classList.add("hidden");

        // Clear and rebuild cards
        wishlistGrid.innerHTML = "";

        list.forEach((scheme, index) => {
            const card = createSchemeCard(scheme, index);
            wishlistGrid.appendChild(card);
        });
    }

    // ===== Create Scheme Card =====
    function createSchemeCard(scheme, index) {
        const card = document.createElement("div");
        card.className =
            "bg-surface rounded-xl p-6 border border-surface-soft/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group scale-in";
        card.style.animationDelay = `${index * 0.05}s`;
        card.style.opacity = "0";

        card.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          Scheme
        </span>
        <button class="remove-btn p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                title="Remove from wishlist"
                data-name="${escapeAttr(scheme.scheme_name)}">
          <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h3 class="text-lg font-semibold mb-2 leading-snug">${escapeHTML(scheme.scheme_name)}</h3>
      <p class="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">${escapeHTML(scheme.description)}</p>

      <a href="${escapeAttr(scheme.apply_link || "#")}" target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:text-accent transition-colors duration-300">
        Apply Now
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    `;

        // Attach remove listener
        const removeBtn = card.querySelector(".remove-btn");
        removeBtn.addEventListener("click", () => {
            // Animate out
            card.style.transition = "all 0.3s ease-out";
            card.style.opacity = "0";
            card.style.transform = "scale(0.9)";

            setTimeout(() => {
                removeFromWishlist(scheme.scheme_name);
                showToast("Scheme removed from wishlist");
                renderWishlist();
            }, 300);
        });

        return card;
    }

    // ===== HTML Escaping =====
    function escapeHTML(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    // ===== Clear All =====
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", () => {
            if (confirm("Remove all saved schemes from your wishlist?")) {
                clearWishlist();
                showToast("Wishlist cleared");
                renderWishlist();
            }
        });
    }

    // ===== Initialize =====
    document.addEventListener("DOMContentLoaded", renderWishlist);
})();
