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
        <button class="remove-btn p-3 sm:p-1.5 w-12 h-12 sm:w-auto sm:h-auto rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                title="Remove from wishlist"
                data-name="${escapeAttr(scheme.scheme_name)}">
          <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h3 class="text-lg font-semibold mb-2 leading-snug">${escapeHTML(scheme.scheme_name)}</h3>
      <p class="text-text-secondary text-base leading-relaxed mb-4 line-clamp-3">${escapeHTML(scheme.description)}</p>

      <!-- Amount & Deadline Row -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4 pb-4 border-b border-surface-soft/40">
        <!-- Amount -->
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 8h6M9 12h6M9 8c2.21 0 4 1.79 4 4s-1.79 4-4 4H9l5 4" />
          </svg>
          <span class="text-sm sm:text-base font-medium">${scheme.amount || 'N/A'}</span>
        </div>
        <!-- Deadline -->
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm sm:text-base font-medium">${scheme.deadline || 'TBD'}</span>
        </div>
      </div>

      <!-- Category Tags -->
      <div class="flex flex-wrap gap-2 mb-4">
        ${(scheme.tags || []).slice(0, 3).map(tag => 
          `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            ${escapeHTML(tag)}
          </span>`
        ).join('')}
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        ${scheme.application_mode === 'online' && scheme.apply_link ? `<a href="${escapeAttr(scheme.apply_link)}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:text-accent transition-colors duration-300">
            Apply Online
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>` : `<span class="inline-flex items-center gap-1.5 text-text-secondary text-sm font-medium" style="opacity:0.7;">Offline Application</span>`}
        <button class="more-info-btn wishlist-more-info" type="button">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            More Info
        </button>
      </div>
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

        // Attach More Info listener
        const moreInfoBtn = card.querySelector(".wishlist-more-info");
        if (moreInfoBtn) {
            moreInfoBtn.addEventListener("click", () => {
                if (typeof openSchemeModal === "function") {
                    openSchemeModal(scheme);
                }
            });
        }

        return card;
    }

    // escapeHTML and escapeAttr are provided by utils.js


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
