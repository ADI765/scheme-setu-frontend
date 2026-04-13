/**
 * Scheme Setu — Swipe Module (swipe.js)
 * Fanned deck with swipeable flashcards.
 * Uses PointerEvents for unified mouse + touch handling.
 * Runs on swipe.html.
 */

(function () {
    "use strict";

    // ===== DOM References =====
    const cardContainer = $("card-container");
    const progressSection = $("progress-section");
    const progressText = $("progress-text");
    const progressFill = $("progress-fill");
    const actionButtons = $("action-buttons");
    const discardBtn = $("discard-btn");
    const saveBtn = $("save-btn");
    const emptyState = $("empty-state");
    const noSchemesState = $("no-schemes-state");

    if (!cardContainer) return; // Not on swipe page

    // ===== Config =====
    const MAX_VISIBLE = 4; // Max cards visible in the fan at once
    const SWIPE_THRESHOLD = 100; // Pixels required to trigger a swipe
    // Fan rotation angles for background cards (bottom to top before the active card)
    const FAN_ROTATIONS = [18, 8, -8]; // 3 bg cards at most

    // ===== State =====
    let schemes = [];
    let currentIndex = 0;
    let isAnimating = false;

    // ===== Initialization =====
    function init() {
        schemes = getEligibleSchemes();
        currentIndex = getCurrentIndex();

        if (schemes.length === 0) {
            showNoSchemes();
            return;
        }

        if (currentIndex >= schemes.length) {
            showEmptyState();
            return;
        }

        renderDeck();
        updateProgress();
        attachButtonListeners();
    }

    // ===== Render the Fanned Deck =====
    function renderDeck() {
        // Clear the container
        cardContainer.innerHTML = "";

        // How many cards remain
        const remaining = schemes.length - currentIndex;
        if (remaining <= 0) {
            showEmptyState();
            return;
        }

        // Determine how many to show in the fan (up to MAX_VISIBLE)
        const visibleCount = Math.min(remaining, MAX_VISIBLE);

        // Build cards from bottom (lowest z) to top (highest z)
        for (let i = 0; i < visibleCount; i++) {
            const schemeIdx = currentIndex + (visibleCount - 1 - i); // Bottom card first
            const zIndex = i + 1;
            const isTopCard = i === visibleCount - 1;

            const card = createCardElement(schemeIdx, zIndex, isTopCard);
            cardContainer.appendChild(card);
        }

        // Attach pointer listeners to the new top card
        initTopCard();
    }

    // ===== Create a Single Card Element =====
    function createCardElement(schemeIndex, zIndex, isTop) {
        const scheme = schemes[schemeIndex];
        const card = document.createElement("div");

        // Determine rotation
        let rotation = "0deg";
        if (!isTop) {
            // Pick from FAN_ROTATIONS based on position from top
            const bgIndex = MAX_VISIBLE - 1 - zIndex; // 0-based from bottom
            rotation = (FAN_ROTATIONS[bgIndex] || (bgIndex % 2 === 0 ? 12 : -12)) + "deg";
        }

        // Set CSS custom properties
        card.style.setProperty("--rotation", rotation);
        card.style.setProperty("--z", zIndex);

        // Classes
        card.className = "flashcard deck-enter " + (isTop ? "top-card" : "bg-card");

        // Data attribute to track which scheme this card represents
        card.dataset.schemeIndex = schemeIndex;

        // Card inner content
        card.innerHTML = buildCardHTML(scheme, isTop);

        return card;
    }

    // ===== Build Card Inner HTML =====
    function buildCardHTML(scheme, isTop) {
        // Background cards show a simplified version
        if (!isTop) {
            return `
                <div class="mb-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          style="background: rgba(29,78,216,0.06); color: #64748b;">
                        Scheme
                    </span>
                </div>
                <h2 class="text-lg font-bold leading-snug" style="color: #94a3b8;">${scheme.scheme_name}</h2>
            `;
        }

        // Top card has full content with indicators
        return `
            <!-- Swipe Indicators -->
            <div class="save-indicator absolute top-6 right-6 px-3 py-1 rounded-lg border-2 border-green-500 text-green-500 font-bold text-sm uppercase pointer-events-none"
                 style="opacity:0; transform: rotate(12deg); transition: opacity 0.15s;">
                SAVE
            </div>
            <div class="skip-indicator absolute top-6 left-6 px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 font-bold text-sm uppercase pointer-events-none"
                 style="opacity:0; transform: rotate(-12deg); transition: opacity 0.15s;">
                SKIP
            </div>

            <!-- Card Content -->
            <div class="mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Scheme
                </span>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold mb-4 leading-snug">${scheme.scheme_name}</h2>

            <p class="text-text-secondary text-base sm:text-base leading-relaxed mb-6">${scheme.description}</p>

            <!-- Amount & Deadline Row -->
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4 pb-4 border-b border-surface-soft/40">
                <!-- Amount -->
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 8h6M9 12h6M9 8c2.21 0 4 1.79 4 4s-1.79 4-4 4H9l5 4" />
                    </svg>
                    <span class="text-xs sm:text-sm font-semibold text-text-primary">${scheme.amount || 'N/A'}</span>
                </div>
                <!-- Deadline -->
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs sm:text-sm font-semibold text-text-primary">${scheme.deadline || 'TBD'}</span>
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

            <div class="flex items-center gap-3 flex-wrap">
                ${scheme.application_mode === 'online' && scheme.apply_link ? `<a href="${scheme.apply_link}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:text-accent transition-colors duration-300">
                    Apply Online
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>` : `<span class="inline-flex items-center gap-1.5 text-text-secondary text-sm font-medium" style="opacity:0.7;">Offline Application</span>`}
                <button class="more-info-btn swipe-more-info" type="button">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    More Info
                </button>
            </div>
        `;
    }

    // ===== Attach Pointer Listeners to Top Card =====
    function initTopCard() {
        const topCard = cardContainer.querySelector(".top-card");
        if (!topCard) return;

        let isDragging = false;
        let startX = 0;
        let startY = 0;

        const saveIndicator = topCard.querySelector(".save-indicator");
        const skipIndicator = topCard.querySelector(".skip-indicator");

        // More Info button handler
        const moreInfoBtn = topCard.querySelector(".swipe-more-info");
        if (moreInfoBtn) {
            moreInfoBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                const idx = parseInt(topCard.dataset.schemeIndex, 10);
                if (typeof openSchemeModal === "function" && schemes[idx]) {
                    openSchemeModal(schemes[idx]);
                }
            });
        }

        // Prevent links from triggering drag
        topCard.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("pointerdown", function (e) {
                e.stopPropagation();
            });
        });

        topCard.addEventListener("pointerdown", function (e) {
            if (isAnimating) return;
            // Ignore clicks on buttons / links
            if (e.target.closest("a") || e.target.closest("button")) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            topCard.classList.add("dragging");
            topCard.setPointerCapture(e.pointerId);
        });

        topCard.addEventListener("pointermove", function (e) {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Slight tilt proportional to horizontal drag
            const rotation = deltaX * 0.05;

            topCard.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;

            // Show swipe indicators based on direction
            const progress = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);
            if (deltaX > 0) {
                if (saveIndicator) saveIndicator.style.opacity = progress.toString();
                if (skipIndicator) skipIndicator.style.opacity = "0";
            } else if (deltaX < 0) {
                if (skipIndicator) skipIndicator.style.opacity = progress.toString();
                if (saveIndicator) saveIndicator.style.opacity = "0";
            }
        });

        topCard.addEventListener("pointerup", function (e) {
            if (!isDragging) return;
            isDragging = false;
            topCard.classList.remove("dragging");

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
                // Commit the swipe — fly card off-screen
                const direction = deltaX > 0 ? 1 : -1;
                isAnimating = true;
                disableButtons(true);

                // Save scheme if swiped right
                if (direction > 0) {
                    saveCurrentScheme();
                }

                topCard.classList.add("swipe-away");
                topCard.style.transform = `translate(${direction * window.innerWidth}px, ${deltaY}px) rotate(${direction * 30}deg)`;
                topCard.style.opacity = "0";

                // After fly-out animation, promote next card
                setTimeout(function () {
                    topCard.remove();
                    promoteNextCard();
                    isAnimating = false;
                    disableButtons(false);
                }, 400);
            } else {
                // Snap back — didn't drag far enough
                snapBack(topCard, saveIndicator, skipIndicator);
            }
        });

        // Handle pointer leaving / cancel
        topCard.addEventListener("pointercancel", function () {
            if (isDragging) {
                isDragging = false;
                topCard.classList.remove("dragging");
                snapBack(topCard, saveIndicator, skipIndicator);
            }
        });
    }

    // ===== Snap Back to Center =====
    function snapBack(card, saveInd, skipInd) {
        card.classList.add("snap-back");
        card.style.transform = "translate(0px, 0px) rotate(0deg)";

        if (saveInd) saveInd.style.opacity = "0";
        if (skipInd) skipInd.style.opacity = "0";

        setTimeout(function () {
            card.classList.remove("snap-back");
        }, 450);
    }

    // ===== Promote the Next Card =====
    function promoteNextCard() {
        currentIndex++;
        storeCurrentIndex(currentIndex);
        updateProgress();

        // Find remaining bg-cards
        const remainingCards = Array.from(cardContainer.querySelectorAll(".bg-card"));

        if (remainingCards.length === 0) {
            // No more cards — check if we need to add more from the schemes list
            if (currentIndex < schemes.length) {
                // Re-render the deck from the current position
                renderDeck();
            } else {
                showEmptyState();
            }
            return;
        }

        // Find the one with the highest --z value (the one closest to the top)
        const nextCard = remainingCards.reduce(function (highest, card) {
            const z1 = parseInt(card.style.getPropertyValue("--z")) || 0;
            const z2 = parseInt(highest.style.getPropertyValue("--z")) || 0;
            return z1 > z2 ? card : highest;
        }, remainingCards[0]);

        // Convert it to the new top card
        nextCard.classList.remove("bg-card", "deck-enter");
        nextCard.classList.add("top-card", "promoting");

        // Animate it straightening up
        nextCard.style.setProperty("--rotation", "0deg");
        nextCard.style.transform = "translate(0px, 0px) rotate(0deg)";

        // Rebuild inner content with full details
        const schemeIdx = parseInt(nextCard.dataset.schemeIndex, 10);
        nextCard.innerHTML = buildCardHTML(schemes[schemeIdx], true);

        // Update styles for top card
        nextCard.style.background = "#ffffff";
        nextCard.style.color = "#1e293b";
        nextCard.style.borderColor = "#e2e8f0";
        nextCard.style.pointerEvents = "auto";

        // After promotion transition, clean up and re-init listeners
        setTimeout(function () {
            nextCard.classList.remove("promoting");

            // If there are more schemes after the visible fan, add a new bottom card
            addBottomCard();

            // Re-initialize event listeners for the new top card
            initTopCard();
        }, 420);
    }

    // ===== Add a New Bottom Card to the Fan =====
    function addBottomCard() {
        const visibleCards = cardContainer.querySelectorAll(".flashcard");
        const totalVisible = visibleCards.length;

        if (totalVisible >= MAX_VISIBLE) return; // Fan is full

        // Find the index of the next scheme to add at the bottom
        // The bottom-most visible scheme index is currentIndex + (MAX_VISIBLE - 1)
        // But we need to find what's actually the furthest scheme shown
        let maxSchemeIdx = currentIndex;
        visibleCards.forEach(function (c) {
            const idx = parseInt(c.dataset.schemeIndex, 10);
            if (idx > maxSchemeIdx) maxSchemeIdx = idx;
        });

        const nextSchemeIdx = maxSchemeIdx + 1;
        if (nextSchemeIdx >= schemes.length) return; // No more schemes to add

        // Create the new bottom card
        const newCard = createCardElement(nextSchemeIdx, 1, false);
        newCard.classList.remove("deck-enter"); // Don't animate entrance for smooth addition
        newCard.style.opacity = "0";

        // Insert at the beginning (bottom of the visual stack)
        cardContainer.insertBefore(newCard, cardContainer.firstChild);

        // Fade in
        requestAnimationFrame(function () {
            newCard.style.opacity = "1";
        });

        // Re-index z-values for all cards
        reindexZValues();
    }

    // ===== Re-index z-values for Proper Stacking =====
    function reindexZValues() {
        const allCards = Array.from(cardContainer.querySelectorAll(".flashcard"));

        // Sort by scheme index (ascending = bottom to top)
        allCards.sort(function (a, b) {
            return parseInt(a.dataset.schemeIndex) - parseInt(b.dataset.schemeIndex);
        });

        // Assign z-index from high (top) to low (bottom)
        allCards.forEach(function (card, i) {
            const z = allCards.length - i;
            card.style.setProperty("--z", z);

            // Calculate rotation for bg cards
            if (!card.classList.contains("top-card")) {
                const bgPosition = i; // 0 = furthest from top
                const rot = FAN_ROTATIONS[bgPosition] || (bgPosition % 2 === 0 ? 15 : -15);
                card.style.setProperty("--rotation", rot + "deg");
                card.style.transform = "rotate(" + rot + "deg)";
            }
        });
    }

    // ===== Progress =====
    function updateProgress() {
        const total = schemes.length;
        const current = Math.min(currentIndex + 1, total);

        if (progressText) progressText.textContent = `${current} / ${total}`;
        if (progressFill) progressFill.style.width = `${(current / total) * 100}%`;
    }

    // ===== Save Current Scheme =====
    function saveCurrentScheme() {
        if (currentIndex < schemes.length) {
            const scheme = schemes[currentIndex];
            const added = addToWishlist(scheme);

            if (added) {
                showToast("✅ Scheme saved to wishlist!");
            } else {
                showToast("Already in your wishlist");
            }
        }
    }

    // ===== Button Fallbacks (Discard / Save) =====
    function attachButtonListeners() {
        if (discardBtn) {
            discardBtn.addEventListener("click", function () {
                if (isAnimating) return;
                triggerButtonSwipe("left");
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener("click", function () {
                if (isAnimating) return;
                triggerButtonSwipe("right");
            });
        }
    }

    // ===== Programmatic Swipe (via buttons) =====
    function triggerButtonSwipe(direction) {
        const topCard = cardContainer.querySelector(".top-card");
        if (!topCard) return;

        isAnimating = true;
        disableButtons(true);

        const saveIndicator = topCard.querySelector(".save-indicator");
        const skipIndicator = topCard.querySelector(".skip-indicator");

        // Show the appropriate indicator
        if (direction === "right" && saveIndicator) {
            saveIndicator.style.opacity = "1";
            saveCurrentScheme();
        } else if (direction === "left" && skipIndicator) {
            skipIndicator.style.opacity = "1";
        }

        // Fly out
        const dir = direction === "right" ? 1 : -1;
        topCard.classList.add("swipe-away");
        topCard.style.transform = `translate(${dir * window.innerWidth}px, 0px) rotate(${dir * 30}deg)`;
        topCard.style.opacity = "0";

        setTimeout(function () {
            topCard.remove();
            promoteNextCard();
            isAnimating = false;
            disableButtons(false);
        }, 400);
    }

    function disableButtons(disabled) {
        if (discardBtn) discardBtn.disabled = disabled;
        if (saveBtn) saveBtn.disabled = disabled;
    }

    // ===== States =====
    function showEmptyState() {
        if (cardContainer) cardContainer.innerHTML = "";
        if (actionButtons) actionButtons.classList.add("hidden");
        if (progressSection) progressSection.classList.add("hidden");
        if (emptyState) emptyState.classList.remove("hidden");
    }

    function showNoSchemes() {
        if (cardContainer) cardContainer.innerHTML = "";
        if (actionButtons) actionButtons.classList.add("hidden");
        if (progressSection) progressSection.classList.add("hidden");
        if (noSchemesState) noSchemesState.classList.remove("hidden");
    }

    // ===== Start =====
    document.addEventListener("DOMContentLoaded", init);
})();
