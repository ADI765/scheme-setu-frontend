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
        if (query.length < 2) {
            showAllSchemes();
            return;
        }

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
                // Try real API first, fallback to local JSON
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/api/search-schemes?q=${encodeURIComponent(query)}`
                    );

                    if (!response.ok) {
                        throw new Error("API error");
                    }

                    const data = await response.json();
                    results = data.results || data.schemes || [];
                } catch (_apiErr) {
                    // Fallback: search local JSON data
                    results = await searchLocalJSON(query);
                }
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

    // ===== Local JSON Fallback Search =====
    let _cachedLocalSchemes = null;
    async function searchLocalJSON(query) {
        if (!_cachedLocalSchemes) {
            try {
                const res = await fetch("data/schemesetu_v5.json");
                const data = await res.json();
                const ageGroups = data.schemeSetu?.ageGroups || [];
                _cachedLocalSchemes = ageGroups.flatMap(g => (g.schemes || []).map(s => ({
                    scheme_name: s.name || s.shortName,
                    description: s.description || "",
                    apply_link: s.apply_link || "#",
                    application_mode: s.application_mode || "offline",
                    category: s.category || "",
                    govtLevel: s.govtLevel || "",
                    amount: s.amount || "N/A",
                    deadline: s.deadline || "TBD",
                    tags: s.tags || [],
                    eligibility: s.eligibility,
                    benefits: s.benefits,
                    how_to_apply: s.how_to_apply || [],
                    required_documents: s.required_documents || [],
                    optional_documents: s.optional_documents || []
                })));
            } catch (err) {
                console.warn("Could not load local scheme data.", err);
                _cachedLocalSchemes = [];
            }
        }
        const keywords = query.toLowerCase().split(/\s+/);
        return _cachedLocalSchemes.filter(scheme => {
            const text = [scheme.scheme_name, scheme.description, scheme.category, scheme.govtLevel, ...(scheme.tags || [])].join(" ").toLowerCase();
            return keywords.every(kw => text.includes(kw));
        });
    }

    // ===== Show All Schemes (no filter) =====
    async function showAllSchemes() {
        if (searchLoading) searchLoading.classList.remove("hidden");
        if (searchResults) searchResults.innerHTML = "";
        if (searchCount) searchCount.classList.add("hidden");
        if (searchEmpty) searchEmpty.classList.add("hidden");
        if (searchInitial) searchInitial.classList.add("hidden");

        try {
            // Ensure local cache is loaded
            if (!_cachedLocalSchemes) {
                await searchLocalJSON("");
            }
            const all = _cachedLocalSchemes || [];

            if (searchLoading) searchLoading.classList.add("hidden");

            if (all.length === 0) {
                if (searchEmpty) {
                    searchEmpty.classList.remove("hidden");
                    const emptyText = searchEmpty.querySelector("p");
                    if (emptyText) emptyText.textContent = "No schemes available.";
                }
            } else {
                if (searchCount) {
                    searchCount.textContent = `${all.length} scheme${all.length > 1 ? "s" : ""} found`;
                    searchCount.classList.remove("hidden");
                }
                renderResults(all, "");
            }
        } catch (err) {
            if (searchLoading) searchLoading.classList.add("hidden");
            if (searchEmpty) {
                searchEmpty.classList.remove("hidden");
                const emptyText = searchEmpty.querySelector("p");
                if (emptyText) emptyText.textContent = "Could not load schemes.";
            }
        }
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
                            ${tag}
                        </span>`
                    ).join('')}
                </div>

                <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                    ${scheme.application_mode === 'online' && scheme.apply_link ? `<a href="${escapeHtml(scheme.apply_link)}" target="_blank" rel="noopener noreferrer" class="search-card-link">
                        Apply Online
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                    </a>` : `<span class="search-card-link" style="opacity:0.7;cursor:default;">Offline Application</span>`}
                    <button class="more-info-btn search-more-info" type="button">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        More Info
                    </button>
                </div>
            `;

            // Attach More Info click handler
            const moreInfoBtn = card.querySelector(".search-more-info");
            if (moreInfoBtn) {
                moreInfoBtn.addEventListener("click", () => {
                    if (typeof openSchemeModal === "function") {
                        openSchemeModal(scheme);
                    }
                });
            }

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

    // escapeHtml is provided by utils.js (alias of escapeHTML)


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

    // ===== All Schemes Button =====
    const allSchemesBtn = document.getElementById("all-schemes-btn");
    if (allSchemesBtn) {
        allSchemesBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            showAllSchemes();
        });
    }
})();
