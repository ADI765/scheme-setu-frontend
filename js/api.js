
// ===== Configuration =====
const USE_DUMMY = false; // ← flipped to use real backend
const API_BASE_URL = "http://localhost:5000"; // Flask backend URL
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Match schemes based on profile data.
 * Returns the same shape whether dummy or real API is used.
 *
 * @param {Object} profileData - { age, income, occupation, gender, category, education_level }
 * @returns {Promise<Object>} - { status, match_count, eligible_schemes[] }
 */
async function matchSchemes(profileData) {
    // --- Dummy mode: return mock data instantly
    if (USE_DUMMY) {
        // Simulate network delay for realistic UX testing
        await new Promise((resolve) => setTimeout(resolve, 800));
        return dummyResponse;
    }

    // --- Real API mode ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/match-schemes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                age: parseInt(profileData.age, 10),
                income: parseInt(profileData.income, 10),
                income_min: parseInt(profileData.income_min || 0, 10),
                income_max: parseInt(profileData.income_max || profileData.income, 10),
                occupation: profileData.occupation.trim().toLowerCase(),
                gender: profileData.gender.trim().toLowerCase(),
                category: profileData.category.trim().toLowerCase(),
                education_level: profileData.education_level.trim().toLowerCase(),
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status >= 500) {
                throw new Error("Server error. Please try again later.");
            }
            if (response.status === 400) {
                const err = await response.json();
                throw new Error(err.message || "Invalid input. Please check your details.");
            }
            throw new Error("Something went wrong. Please try again.");
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
            throw new Error("Request timed out. Please check your connection and try again.");
        }

        if (!navigator.onLine) {
            throw new Error("You appear to be offline. Check your internet connection.");
        }

        throw error;
    }
}
