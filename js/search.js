/**
 * Scheme Setu — Search Module (search.js)
 * Handles keyword search for schemes.
 * Works with both dummy data and real backend API.
 */

(function () {
    "use strict";

    // ===== DOM References =====
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const searchResults = document.getElementById("search-results");
    const searchCount = document.getElementById("search-count");
    const searchEmpty = document.getElementById("search-empty");
    const searchLoading = document.getElementById("search-loading");
    const searchInitial = document.getElementById("search-initial");

    if (!searchInput) return; // Not on a page with search

    // ===== Search Handler =====
    async function performSearch(query) {
        query = query.trim();
        if (query.length < 2) return;

        // Show loading, hide others
        if (searchLoading) searchLoading.classList.remove("hidden");
        if (searchResults) searchResults.innerHTML = "";
        if (searchCount) searchCount.classList.add("hidden");
        if (searchEmpty) searchEmpty.classList.add("hidden");
        if (searchInitial) searchInitial.classList.add("hidden");

        try {
            let results;

            if (typeof USE_DUMMY !== "undefined" && USE_DUMMY) {
                // Dummy mode: search locally in dummyData
                await new Promise((r) => setTimeout(r, 300));
                results = searchDummyData(query);
            } else {
                // Real API mode
                const response = await fetch(
                    `${API_BASE_URL}/api/search-schemes?q=${encodeURIComponent(query)}`
                );

                if (!response.ok) {
                    throw new Error("Search failed. Please try again.");
                }

                const data = await response.json();
                results = data.results || data.schemes || [];
            }

            // Hide loading
            if (searchLoading) searchLoading.classList.add("hidden");

            // Render results
            if (results.length === 0) {
                if (searchEmpty) {
                    searchEmpty.classList.remove("hidden");
                    const emptyText = searchEmpty.querySelector("p");
                    if (emptyText) {
                        emptyText.textContent = `No schemes found for "${query}". Try different keywords.`;
                    }
                }
                if (searchCount) searchCount.classList.add("hidden");
            } else {
                if (searchCount) {
                    searchCount.textContent = `${results.length} scheme${results.length > 1 ? "s" : ""} found`;
                    searchCount.classList.remove("hidden");
                }
                renderResults(results, query);
            }
        } catch (error) {
            if (searchLoading) searchLoading.classList.add("hidden");
            if (searchEmpty) {
                searchEmpty.classList.remove("hidden");
                const emptyText = searchEmpty.querySelector("p");
                if (emptyText) {
                    emptyText.textContent = error.message || "Something went wrong. Please try again.";
                }
            }
        }
    }

    // ===== Dummy Data Search =====
    function searchDummyData(query) {
        if (typeof dummyResponse === "undefined") return [];
        const keywords = query.toLowerCase().split(/\s+/);
        return dummyResponse.eligible_schemes.filter((scheme) => {
            const text = `${scheme.scheme_name} ${scheme.description}`.toLowerCase();
            return keywords.every((kw) => text.includes(kw));
        });
    }

    // ===== Render Results =====
    function renderResults(results, query) {
        if (!searchResults) return;
        searchResults.innerHTML = "";

        results.forEach((scheme, index) => {
            const card = document.createElement("div");
            card.className = "search-result-card";
            card.style.animationDelay = `${index * 0.05}s`;

            // Highlight matching text
            const highlightedName = highlightText(scheme.scheme_name, query);
            const highlightedDesc = highlightText(
                truncateText(scheme.description, 180),
                query
            );

            const categoryBadge = scheme.category
                ? `<span class="search-badge">${escapeHtml(scheme.category)}</span>`
                : "";
            const govtBadge = scheme.govtLevel
                ? `<span class="search-badge govt">${escapeHtml(scheme.govtLevel)}</span>`
                : "";

            card.innerHTML = `
                <div class="search-card-header">
                    <h3 class="search-card-title">${highlightedName}</h3>
                    <div class="search-card-badges">${categoryBadge}${govtBadge}</div>
                </div>
                <p class="search-card-desc">${highlightedDesc}</p>
                <a href="${escapeHtml(scheme.apply_link || "#")}" target="_blank" rel="noopener noreferrer" class="search-card-link">
                    Apply on Official Portal
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </a>
            `;

            searchResults.appendChild(card);
        });
    }

    // ===== Helpers =====
    function highlightText(text, query) {
        if (!text || !query) return escapeHtml(text || "");
        const escaped = escapeHtml(text);
        const keywords = query.split(/\s+/).filter((k) => k.length >= 2);
        let result = escaped;
        keywords.forEach((kw) => {
            const regex = new RegExp(`(${escapeRegex(kw)})`, "gi");
            result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
        });
        return result;
    }

    function truncateText(text, maxLen) {
        if (!text) return "";
        return text.length > maxLen ? text.substring(0, maxLen) + "…" : text;
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // ===== Event Listeners =====
    let debounceTimer;

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            performSearch(searchInput.value);
        });
    }

    if (searchInput) {
        // Search on Enter key
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                performSearch(searchInput.value);
            }
        });

        // Live search with debounce (300ms after typing stops)
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            const val = searchInput.value.trim();

            if (val.length < 2) {
                // Reset to initial state
                if (searchResults) searchResults.innerHTML = "";
                if (searchCount) searchCount.classList.add("hidden");
                if (searchEmpty) searchEmpty.classList.add("hidden");
                if (searchInitial) searchInitial.classList.remove("hidden");
                return;
            }

            debounceTimer = setTimeout(() => {
                performSearch(val);
            }, 300);
        });

        // Auto-fill from URL query param
        const urlParams = new URLSearchParams(window.location.search);
        const urlQuery = urlParams.get("q");
        if (urlQuery) {
            searchInput.value = urlQuery;
            performSearch(urlQuery);
        }
    }
})();
