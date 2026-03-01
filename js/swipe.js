/**
 * Scheme Setu — Swipe Module (swipe.js)
 * Card rendering, swipe detection (mouse + touch), animations, and save/discard logic.
 * Runs on swipe.html.
 */

(function () {
    "use strict";

    // ===== DOM References =====
    const cardContainer = $("card-container");
    const activeCard = $("active-card");
    const behindCard = $("behind-card");
    const progressSection = $("progress-section");
    const progressText = $("progress-text");
    const progressFill = $("progress-fill");
    const actionButtons = $("action-buttons");
    const discardBtn = $("discard-btn");
    const saveBtn = $("save-btn");
    const emptyState = $("empty-state");
    const noSchemesState = $("no-schemes-state");
    const saveIndicator = $("save-indicator");
    const skipIndicator = $("skip-indicator");

    if (!cardContainer) return; // Not on swipe page

    // ===== State =====
    let schemes = [];
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let isAnimating = false;

    const SWIPE_THRESHOLD = 100; // pixels required to trigger swipe

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

        renderCard(currentIndex);
        updateProgress();
        attachSwipeListeners();
        attachButtonListeners();
    }

    // ===== Render Card =====
    function renderCard(index) {
        if (index >= schemes.length) {
            showEmptyState();
            return;
        }

        const scheme = schemes[index];
        const nameEl = $("scheme-name");
        const descEl = $("scheme-description");
        const linkEl = $("scheme-link");

        if (nameEl) nameEl.textContent = scheme.scheme_name;
        if (descEl) descEl.textContent = scheme.description;
        if (linkEl) linkEl.href = scheme.apply_link || "#";

        // Reset card position
        activeCard.style.transform = "";
        activeCard.style.opacity = "";
        activeCard.classList.remove("swipe-left", "swipe-right", "animating");

        // Reset indicators
        if (saveIndicator) saveIndicator.style.opacity = "0";
        if (skipIndicator) skipIndicator.style.opacity = "0";

        // Show card with entrance animation
        activeCard.classList.remove("hidden");
        activeCard.style.animation = "scaleIn 0.3s ease-out forwards";

        // Show/hide behind card
        if (behindCard) {
            behindCard.classList.toggle("hidden", index + 1 >= schemes.length);
        }
    }

    // ===== Progress =====
    function updateProgress() {
        const total = schemes.length;
        const current = Math.min(currentIndex + 1, total);

        if (progressText) progressText.textContent = `${current} / ${total}`;
        if (progressFill) progressFill.style.width = `${(current / total) * 100}%`;
    }

    // ===== Swipe Detection =====
    function attachSwipeListeners() {
        // Mouse events
        activeCard.addEventListener("mousedown", onDragStart);
        document.addEventListener("mousemove", onDragMove);
        document.addEventListener("mouseup", onDragEnd);

        // Touch events
        activeCard.addEventListener("touchstart", onDragStart, { passive: true });
        document.addEventListener("touchmove", onDragMove, { passive: false });
        document.addEventListener("touchend", onDragEnd);
    }

    function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onDragStart(e) {
        if (isAnimating) return;
        isDragging = true;
        startX = getClientX(e);
        currentX = startX;
        activeCard.style.transition = "none";
    }

    function onDragMove(e) {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        currentX = getClientX(e);
        const deltaX = currentX - startX;

        // Apply transform
        const rotation = deltaX * 0.08; // subtle rotation
        activeCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

        // Show swipe indicators based on direction
        const progress = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);
        if (deltaX > 0 && saveIndicator) {
            saveIndicator.style.opacity = progress.toString();
            if (skipIndicator) skipIndicator.style.opacity = "0";
        } else if (deltaX < 0 && skipIndicator) {
            skipIndicator.style.opacity = progress.toString();
            if (saveIndicator) saveIndicator.style.opacity = "0";
        }
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;

        const deltaX = currentX - startX;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            // Trigger swipe
            if (deltaX > 0) {
                animateSwipe("right");
            } else {
                animateSwipe("left");
            }
        } else {
            // Snap back
            snapBack();
        }
    }

    // ===== Animations =====
    function animateSwipe(direction) {
        isAnimating = true;
        disableButtons(true);

        activeCard.classList.add("animating");

        if (direction === "right") {
            activeCard.classList.add("swipe-right");
            saveCurrentScheme();
        } else {
            activeCard.classList.add("swipe-left");
        }

        // Wait for animation to complete
        activeCard.addEventListener(
            "transitionend",
            function onEnd() {
                activeCard.removeEventListener("transitionend", onEnd);
                advanceToNext();
                isAnimating = false;
                disableButtons(false);
            },
            { once: true }
        );

        // Fallback timeout in case transitionend doesn't fire
        setTimeout(() => {
            if (isAnimating) {
                advanceToNext();
                isAnimating = false;
                disableButtons(false);
            }
        }, 500);
    }

    function snapBack() {
        activeCard.style.transition = "transform 0.2s ease-out";
        activeCard.style.transform = "translateX(0) rotate(0)";

        if (saveIndicator) saveIndicator.style.opacity = "0";
        if (skipIndicator) skipIndicator.style.opacity = "0";

        setTimeout(() => {
            activeCard.style.transition = "";
        }, 200);
    }

    // ===== Actions =====
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

    function advanceToNext() {
        currentIndex++;
        storeCurrentIndex(currentIndex);
        updateProgress();
        renderCard(currentIndex);
    }

    // ===== Button Fallbacks =====
    function attachButtonListeners() {
        if (discardBtn) {
            discardBtn.addEventListener("click", () => {
                if (isAnimating) return;
                animateSwipe("left");
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                if (isAnimating) return;
                animateSwipe("right");
            });
        }
    }

    function disableButtons(disabled) {
        if (discardBtn) discardBtn.disabled = disabled;
        if (saveBtn) saveBtn.disabled = disabled;
    }

    // ===== States =====
    function showEmptyState() {
        if (activeCard) activeCard.classList.add("hidden");
        if (behindCard) behindCard.classList.add("hidden");
        if (actionButtons) actionButtons.classList.add("hidden");
        if (progressSection) progressSection.classList.add("hidden");
        if (emptyState) emptyState.classList.remove("hidden");
    }

    function showNoSchemes() {
        if (activeCard) activeCard.classList.add("hidden");
        if (behindCard) behindCard.classList.add("hidden");
        if (actionButtons) actionButtons.classList.add("hidden");
        if (progressSection) progressSection.classList.add("hidden");
        if (noSchemesState) noSchemesState.classList.remove("hidden");
    }

    // ===== Start =====
    document.addEventListener("DOMContentLoaded", init);
})();
