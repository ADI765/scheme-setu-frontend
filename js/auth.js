/**
 * Scheme Setu — Authentication Module
 * ------------------------------------
 * LocalStorage-based login / signup system.
 * Exposed as `window.Auth` via IIFE so it stays out of global scope.
 *
 * Storage key: "schemeSetu_users"
 * Format: { username: { password, phone, address } }
 *
 * Session key: "schemeSetu_currentUser" (sessionStorage)
 */
const Auth = (() => {
    // -------- Constants --------
    const USERS_KEY = "schemeSetu_users";
    const SESSION_KEY = "schemeSetu_currentUser";

    // -------- Helpers --------
    function _getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    }

    function _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // -------- Public API --------

    /** Check if a user is currently logged in */
    function isAuthenticated() {
        return !!sessionStorage.getItem(SESSION_KEY);
    }

    /** Get the current username (or null) */
    function getCurrentUser() {
        return sessionStorage.getItem(SESSION_KEY) || null;
    }

    /**
     * Register a new user.
     * @returns {{ ok: boolean, error?: string }}
     */
    function signup(username, password, phone) {
        username = (username || "").trim();
        password = (password || "").trim();
        phone = (phone || "").trim();

        if (!username || !password) {
            return { ok: false, error: "Username and password are required." };
        }
        if (username.length < 3) {
            return { ok: false, error: "Username must be at least 3 characters." };
        }
        if (password.length < 4) {
            return { ok: false, error: "Password must be at least 4 characters." };
        }

        const users = _getUsers();
        if (users[username]) {
            return { ok: false, error: "Username already exists. Try logging in." };
        }

        users[username] = { password, phone, address: "" };
        _saveUsers(users);

        // Auto-login after signup
        sessionStorage.setItem(SESSION_KEY, username);
        return { ok: true };
    }

    /**
     * Authenticate an existing user.
     * @returns {{ ok: boolean, error?: string }}
     */
    function login(username, password) {
        username = (username || "").trim();
        password = (password || "").trim();

        if (!username || !password) {
            return { ok: false, error: "Please fill in both fields." };
        }

        const users = _getUsers();
        const user = users[username];

        if (!user) {
            return { ok: false, error: "User not found. Please sign up first." };
        }
        if (user.password !== password) {
            return { ok: false, error: "Incorrect password. Try again." };
        }

        sessionStorage.setItem(SESSION_KEY, username);
        return { ok: true };
    }

    /** Log out the current user and reload */
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
    }

    // -------- UI Wiring (called on every page) --------

    /**
     * Builds the login/signup overlay dynamically and wires up events.
     * Should be called once from DOMContentLoaded.
     */
    function init() {
        const overlay = document.getElementById("auth-overlay");
        const appContent = document.getElementById("app-content");
        const userDisplay = document.getElementById("user-display");
        const userDisplayMobile = document.getElementById("user-display-mobile");
        const logoutBtn = document.getElementById("logout-btn");
        const logoutBtnMobile = document.getElementById("logout-btn-mobile");

        // If already authenticated → show app immediately
        if (isAuthenticated()) {
            if (overlay) overlay.classList.add("hidden");
            if (appContent) appContent.classList.remove("hidden");
            _showUsername(userDisplay, userDisplayMobile);
            _bindLogout(logoutBtn, logoutBtnMobile);
            return;
        }

        // Not authenticated → show overlay, hide app
        if (appContent) appContent.classList.add("hidden");
        if (overlay) {
            overlay.classList.remove("hidden");
            _setupOverlay(overlay, appContent, userDisplay, userDisplayMobile, logoutBtn, logoutBtnMobile);
        }
    }

    /** Populate username in navbar and show the badge / logout button */
    function _showUsername(desktopEl, mobileEl) {
        const name = getCurrentUser();
        if (desktopEl) { desktopEl.textContent = name; desktopEl.classList.remove("hidden"); }
        if (mobileEl) { mobileEl.textContent = name; mobileEl.classList.remove("hidden"); }
        // Also show logout buttons
        const lb = document.getElementById("logout-btn");
        const lbm = document.getElementById("logout-btn-mobile");
        if (lb) lb.classList.remove("hidden");
        if (lbm) lbm.classList.remove("hidden");
    }

    /** Bind logout buttons */
    function _bindLogout(btn, btnMobile) {
        if (btn) btn.addEventListener("click", logout);
        if (btnMobile) btnMobile.addEventListener("click", logout);
    }

    /** Wire overlay form logic */
    function _setupOverlay(overlay, appContent, userDisplay, userDisplayMobile, logoutBtn, logoutBtnMobile) {
        // Grab elements inside the overlay
        const loginForm = document.getElementById("auth-login-form");
        const signupForm = document.getElementById("auth-signup-form");
        const showSignup = document.getElementById("auth-show-signup");
        const showLogin = document.getElementById("auth-show-login");
        const loginError = document.getElementById("auth-login-error");
        const signupError = document.getElementById("auth-signup-error");
        const loginCard = document.getElementById("auth-login-card");
        const signupCard = document.getElementById("auth-signup-card");

        // Toggle forms
        if (showSignup) {
            showSignup.addEventListener("click", (e) => {
                e.preventDefault();
                loginCard.classList.add("hidden");
                signupCard.classList.remove("hidden");
                signupError.classList.add("hidden");
            });
        }
        if (showLogin) {
            showLogin.addEventListener("click", (e) => {
                e.preventDefault();
                signupCard.classList.add("hidden");
                loginCard.classList.remove("hidden");
                loginError.classList.add("hidden");
            });
        }

        // Login submit
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const username = loginForm.querySelector("#auth-login-username").value;
                const password = loginForm.querySelector("#auth-login-password").value;
                const result = login(username, password);

                if (result.ok) {
                    overlay.classList.add("hidden");
                    if (appContent) appContent.classList.remove("hidden");
                    _showUsername(userDisplay, userDisplayMobile);
                    _bindLogout(logoutBtn, logoutBtnMobile);
                } else {
                    loginError.textContent = result.error;
                    loginError.classList.remove("hidden");
                    // Shake animation
                    loginCard.classList.remove("shake");
                    void loginCard.offsetWidth; // reflow
                    loginCard.classList.add("shake");
                }
            });
        }

        // Signup submit
        if (signupForm) {
            signupForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const username = signupForm.querySelector("#auth-signup-username").value;
                const password = signupForm.querySelector("#auth-signup-password").value;
                const phone = signupForm.querySelector("#auth-signup-phone").value;
                const result = signup(username, password, phone);

                if (result.ok) {
                    overlay.classList.add("hidden");
                    if (appContent) appContent.classList.remove("hidden");
                    _showUsername(userDisplay, userDisplayMobile);
                    _bindLogout(logoutBtn, logoutBtnMobile);
                } else {
                    signupError.textContent = result.error;
                    signupError.classList.remove("hidden");
                    signupCard.classList.remove("shake");
                    void signupCard.offsetWidth;
                    signupCard.classList.add("shake");
                }
            });
        }
    }

    // -------- Auto-init on DOM ready --------
    document.addEventListener("DOMContentLoaded", init);

    // -------- Expose public API --------
    return { isAuthenticated, getCurrentUser, login, signup, logout, init };
})();
