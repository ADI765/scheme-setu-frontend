/**
 * Scheme Setu — Modal Module (modal.js)
 * Reusable modal component to show full scheme details.
 * Used on swipe.html, wishlist.html, and search.html.
 */

(function () {
    "use strict";

    // ===== Create Modal DOM =====
    function ensureModalDOM() {
        if (document.getElementById("scheme-modal-overlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "scheme-modal-overlay";
        overlay.className = "scheme-modal-overlay";
        overlay.innerHTML = `
            <div class="scheme-modal" id="scheme-modal">
                <div class="scheme-modal-header">
                    <span class="scheme-modal-badge">Scheme Details</span>
                    <button class="scheme-modal-close" id="scheme-modal-close-x" title="Close">&times;</button>
                    <h2 id="scheme-modal-title"></h2>
                </div>
                <div class="scheme-modal-body" id="scheme-modal-body"></div>
                <div class="scheme-modal-footer" id="scheme-modal-footer"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Close on X button
        document.getElementById("scheme-modal-close-x").addEventListener("click", closeSchemeModal);

        // Close on overlay click (outside modal)
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeSchemeModal();
        });

        // Close on Escape key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeSchemeModal();
        });
    }

    // ===== Open Modal =====
    function openSchemeModal(scheme) {
        ensureModalDOM();

        const overlay = document.getElementById("scheme-modal-overlay");
        const titleEl = document.getElementById("scheme-modal-title");
        const bodyEl = document.getElementById("scheme-modal-body");
        const footerEl = document.getElementById("scheme-modal-footer");

        // Scheme name
        const name = scheme.scheme_name || scheme.name || "Scheme Details";
        titleEl.textContent = name;

        // Build body sections
        let bodyHTML = "";

        // Description
        const desc = scheme.description || "";
        if (desc) {
            bodyHTML += buildSection("Description", `<p>${escapeHTML(desc)}</p>`);
        }

        // Eligibility
        const elig = scheme.eligibility;
        if (elig) {
            if (typeof elig === "string") {
                bodyHTML += buildSection("Eligibility", `<p>${escapeHTML(elig)}</p>`);
            } else if (typeof elig === "object") {
                let items = [];
                if (elig.ageLimit) items.push("Age: " + elig.ageLimit);
                if (elig.gender && elig.gender !== "All") items.push("Gender: " + elig.gender);
                if (elig.residency) items.push(elig.residency);
                if (elig.otherCriteria) items.push(elig.otherCriteria);
                if (items.length > 0) {
                    bodyHTML += buildSection("Eligibility", buildList(items));
                }
            }
        }

        // Documents
        const docs = scheme.documentsRequired || scheme.documents;
        if (docs) {
            if (Array.isArray(docs) && docs.length > 0) {
                bodyHTML += buildSection("Required Documents", buildList(docs));
            } else if (typeof docs === "string") {
                bodyHTML += buildSection("Required Documents", `<p>${escapeHTML(docs)}</p>`);
            }
        }

        // Last Date
        const lastDate = scheme.last_date;
        if (lastDate) {
            bodyHTML += buildSection("Last Date", `<p>${escapeHTML(lastDate)}</p>`);
        }

        // Benefits
        const benefits = scheme.benefits;
        if (benefits) {
            if (typeof benefits === "string") {
                bodyHTML += buildSection("Benefits", `<p>${escapeHTML(benefits)}</p>`);
            } else if (typeof benefits === "object") {
                let items = [];
                if (Array.isArray(benefits.financial)) {
                    items = items.concat(benefits.financial);
                }
                if (Array.isArray(benefits.nonFinancial)) {
                    items = items.concat(benefits.nonFinancial);
                }
                if (items.length > 0) {
                    bodyHTML += buildSection("Benefits", buildList(items));
                }
            }
        }

        // How to Apply
        const howToApply = scheme.howToApply;
        if (howToApply && Array.isArray(howToApply) && howToApply.length > 0) {
            bodyHTML += buildSection("How to Apply", buildList(howToApply));
        }

        bodyEl.innerHTML = bodyHTML;

        // Footer — Apply link + Close
        const applyLink = scheme.apply_link || scheme.officialWebsite || "#";
        footerEl.innerHTML = `
            <a href="${escapeAttr(applyLink)}" target="_blank" rel="noopener noreferrer" class="scheme-modal-apply">
                Apply Now
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
            </a>
            <button class="scheme-modal-close-btn" id="scheme-modal-close-footer">Close</button>
        `;

        document.getElementById("scheme-modal-close-footer").addEventListener("click", closeSchemeModal);

        // Show modal
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    // ===== Close Modal =====
    function closeSchemeModal() {
        const overlay = document.getElementById("scheme-modal-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
        document.body.style.overflow = "";
    }

    // ===== Helpers =====
    function buildSection(title, contentHTML) {
        return `
            <div class="scheme-modal-section">
                <div class="scheme-modal-section-title">${escapeHTML(title)}</div>
                ${contentHTML}
            </div>
        `;
    }

    function buildList(items) {
        return "<ul>" + items.map(function (item) {
            return "<li>" + escapeHTML(item) + "</li>";
        }).join("") + "</ul>";
    }

    function escapeHTML(str) {
        if (!str) return "";
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        if (!str) return "";
        return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    // ===== Export to global scope =====
    window.openSchemeModal = openSchemeModal;
    window.closeSchemeModal = closeSchemeModal;
})();
