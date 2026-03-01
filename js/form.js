/**
 * Scheme Setu — Form Module (form.js)
 * Handles profile form validation, data collection, and submission.
 * Runs on profile.html.
 */

(function () {
    "use strict";

    const form = $("profile-form");
    if (!form) return; // Not on profile page

    const submitBtn = $("submit-btn");
    const submitText = $("submit-text");
    const submitSpinner = $("submit-spinner");
    const serverError = $("server-error");
    const serverErrorText = $("server-error-text");

    // ===== Validation Rules =====
    const validators = {
        age: (value) => {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 5 || num > 100) return "Please enter a valid age (5–100)";
            return "";
        },
        income: (value) => {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 0) return "Please enter a valid income (≥ 0)";
            return "";
        },
        occupation: (value) => {
            if (!value || !value.trim()) return "Please enter your occupation";
            return "";
        },
        gender: (value) => {
            if (!value) return "Please select your gender";
            return "";
        },
        category: (value) => {
            if (!value) return "Please select your category";
            return "";
        },
        education_level: (value) => {
            if (!value) return "Please select your education level";
            return "";
        },
    };

    /**
     * Validate a single field. Show/hide error message.
     * @param {string} fieldName
     * @returns {boolean} true if valid
     */
    function validateField(fieldName) {
        const field = $(fieldName);
        const errorEl = $(fieldName + "-error");
        if (!field || !errorEl) return true;

        const error = validators[fieldName](field.value);

        if (error) {
            errorEl.textContent = error;
            errorEl.classList.remove("hidden");
            field.classList.add("border-red-400");
            field.classList.remove("border-surface-soft");
            return false;
        } else {
            errorEl.classList.add("hidden");
            field.classList.remove("border-red-400");
            field.classList.add("border-surface-soft");
            return true;
        }
    }

    /**
     * Validate all fields.
     * @returns {boolean}
     */
    function validateAll() {
        let valid = true;
        Object.keys(validators).forEach((field) => {
            if (!validateField(field)) valid = false;
        });
        return valid;
    }

    /**
     * Collect form data into a clean object with correct types.
     * @returns {Object}
     */
    function collectFormData() {
        return {
            age: parseInt($("age").value, 10),
            income: parseInt($("income").value, 10),
            occupation: $("occupation").value.trim().toLowerCase(),
            gender: $("gender").value.trim().toLowerCase(),
            category: $("category").value.trim().toLowerCase(),
            education_level: $("education_level").value.trim().toLowerCase(),
        };
    }

    /**
     * Toggle loading state on submit button.
     * @param {boolean} loading
     */
    function setLoading(loading) {
        submitBtn.disabled = loading;
        if (loading) {
            submitText.textContent = "Searching...";
            submitSpinner.classList.remove("hidden");
        } else {
            submitText.textContent = "Find Eligible Schemes";
            submitSpinner.classList.add("hidden");
        }
    }

    /**
     * Show server/network error below the form.
     * @param {string} message
     */
    function showError(message) {
        serverErrorText.textContent = message;
        serverError.classList.remove("hidden");
    }

    function hideError() {
        serverError.classList.add("hidden");
    }

    // ===== Real-time Validation on Blur =====
    Object.keys(validators).forEach((fieldName) => {
        const field = $(fieldName);
        if (field) {
            field.addEventListener("blur", () => validateField(fieldName));
            // Also clear error on input
            field.addEventListener("input", () => {
                const errorEl = $(fieldName + "-error");
                if (errorEl && !errorEl.classList.contains("hidden")) {
                    validateField(fieldName);
                }
            });
        }
    });

    // ===== Form Submit Handler =====
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        // Validate all fields
        if (!validateAll()) return;

        // Collect data
        const profileData = collectFormData();

        // Show loading
        setLoading(true);

        try {
            // Call API (uses dummy or real based on USE_DUMMY flag)
            const response = await matchSchemes(profileData);

            if (response.status === "success" && response.match_count > 0) {
                // Store schemes in sessionStorage for the swipe page
                storeEligibleSchemes(response.eligible_schemes);
                storeCurrentIndex(0);

                // Redirect to swipe page
                window.location.href = "swipe.html";
            } else {
                // No eligible schemes found
                showError("No schemes found matching your profile. Try adjusting your details.");
            }
        } catch (error) {
            showError(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    });
})();
