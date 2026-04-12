# Scheme Setu — Frontend

**Government Scheme Discovery Platform**
Find, filter, and save government schemes you're eligible for — powered by a smart matching engine.

---

## Features

- **Landing Page** — Public hero section with preview search across 55+ schemes (no login required)
- **Dashboard** — Logged-in home with quick actions: Find My Schemes, Find for Someone Else, How It Works
- **Authentication** — LocalStorage-based login/signup with split-screen auth overlay on every protected page
- **Profile Matching** — Fill your profile (age, income, category, etc.) and get matched schemes via Flask API
- **Find for Someone Else** — Dedicated form to match schemes for another person without saving to your own profile
- **Swipe Interface** — Tinder-style swipeable cards to browse matched schemes (save or skip)
- **Wishlist** — Save schemes and manage your shortlist
- **Search** — Keyword search with debounced live results, text highlighting, and quick-tag filters
- **Scheme Detail Modal** — Expandable modal with eligibility, documents, benefits, and apply links
- **Robust Data Fetching** — Local JSON fallback ensures the app works even when the API is unreachable

---

## Tech Stack

- **HTML** — Semantic markup across 8 pages
- **Tailwind CSS** (CDN) — Utility-first styling with bento grid layout
- **Vanilla JavaScript** — Modular JS (auth, api, utils, form, modal, search, swipe, wishlist)
- **Custom CSS** (`css/styles.css`) — Animations, auth overlay, flashcard deck, modal, and component styles
- **Flask Backend** — API for scheme matching (`POST /api/match-schemes`)

---

## Project Structure

```
├── index.html              Landing page (public hero + preview search)
├── login.html              Standalone authentication page (split-screen login/signup)
├── dashboard.html          Logged-in home (hub for navigation + quick actions)
├── profile.html            Profile form → API matching (saves to user profile)
├── find.html               Find schemes for someone else (ephemeral, no profile save)
├── swipe.html              Swipeable scheme cards
├── search.html             Keyword search with bento grid results
├── wishlist.html           Saved schemes
├── css/
│   └── styles.css          Custom styles & animations
├── js/
│   ├── auth.js             Auth module (IIFE, localStorage, auth overlay)
│   ├── api.js              API layer (dummy/real toggle, JSON fallback)
│   ├── utils.js            Shared helpers (wishlist, session, toast, escapeHTML)
│   ├── dummyData.js        Mock API response
│   ├── form.js             Profile form validation
│   ├── modal.js            Scheme detail modal
│   ├── search.js           Search logic with debounce
│   ├── swipe.js            Swipe deck with pointer events
│   └── wishlist.js         Wishlist rendering
├── data/
│   └── schemes_schemesetu_v3.json   55 schemes (Central + Punjab)
├── DATA_CONTRACT.md        API request/response contract
├── app.py                  Flask backend
└── requirements.txt        Python dependencies (flask, flask-cors)
```

---

## User Flow

1. **New visitor** → `index.html` (landing page) → preview search or CTA → redirected to `login.html` or auth overlay
2. **Logged-in user** → `dashboard.html` (home) → navigate to Profile, Search, Wishlist, or Find for Someone Else
3. **Returning user** → any protected page auto-shows auth overlay if not logged in

---

## How to Run

### Frontend Only (Dummy Data)
1. Open `js/api.js` and set `const USE_DUMMY = true;`
2. Open `index.html` with Live Server (VS Code) or directly in browser

### With Flask Backend
1. Install dependencies: `pip install -r requirements.txt`
2. Run backend: `python app.py`
3. Open `js/api.js` and set `const USE_DUMMY = false;`
4. Open `index.html` in browser

---

## Future Improvements

- [ ] Server-side authentication (replace localStorage)
- [ ] How-to-apply step-by-step guide for each scheme
- [ ] Dark mode toggle
- [ ] PWA support for offline access
- [ ] Pagination for search results

