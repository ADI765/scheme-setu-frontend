# 🤖 ANTIGRAVITY PROMPT: SchemeSetu Mobile-First UI Improvements

## Project Context

**Project Name:** SchemeSetu  
**Team:** ADI (Frontend), SULIEMAN (Backend), ARSH (JSON Data)  
**Primary Users:** Mobile students (375-414px screens)  
**Goal:** Enhance UI with 4 key improvements while maintaining mobile-first design

---

## 🎯 Your Task (Step-by-Step Implementation)

You will implement **4 UI improvements** to SchemeSetu by modifying HTML, Tailwind CSS, and JavaScript. Work **slowly and carefully** — test after each change.

### Improvement Overview:
1. **Search Results:** Add amount, deadline, category tags to cards
2. **Wishlist Page:** Same card enhancements as search
3. **Swipe Cards:** Display amount & deadline inline (not hidden)
4. **How-to Guide:** NEW step-by-step guide component for applying

---

## 📋 PHASE 1: Mobile Essentials (START HERE)

### Phase 1 Goal
Fix fundamental mobile responsiveness without needing backend changes.

### Task 1.1: Button Sizing
**Objective:** Increase all button heights to 48px minimum (mobile touch-friendly)

**Instructions:**
1. Search project files for all buttons: `<button>` and `<a class="btn-">`
2. Find buttons with height classes like `py-2`, `py-2.5`, `h-10`, `h-12`, etc.
3. **For mobile:** Change to minimum `h-12` or `py-3` (48px)
4. **Add responsive:** `h-12 sm:h-10` (mobile: 48px, desktop: 40px)
5. Test: Screenshot each page at 375px viewport
6. **Before moving on:** Verify all buttons are tappable on 375px screen

**Files to Check:**
- search.html (Apply, Save, Info buttons)
- wishlist.html (Apply, More Info, Remove buttons)
- swipe.html (Save/Discard circular buttons)
- profile.html (Submit button)
- login.html (Login/Signup buttons)

**Example Change:**
```html
<!-- BEFORE -->
<button class="px-6 py-2.5 bg-primary text-white rounded-lg">Apply</button>

<!-- AFTER -->
<button class="px-6 py-3 sm:py-2.5 h-12 sm:h-10 bg-primary text-white rounded-lg">Apply</button>
```

---

### Task 1.2: Typography Fix
**Objective:** Ensure body text is 16px on mobile (currently 14px, too small)

**Instructions:**
1. Open each HTML file and find body text (not headings, not labels)
2. Current: `text-sm` (14px) is used for descriptions
3. **Change to:** `text-base` (16px) for all main content text
4. Keep labels at `text-sm` (12-14px) — those are fine
5. Keep headings as-is (they're already 18px+)
6. Test readability at 375px — no magnifying glass needed
7. **Screenshot proof** at 375px showing readable text

**Example Change:**
```html
<!-- BEFORE -->
<p class="text-sm text-text-secondary">Financial assistance for SC students...</p>

<!-- AFTER -->
<p class="text-base text-text-secondary">Financial assistance for SC students...</p>
```

---

### Task 1.3: Card Padding (Mobile-First)
**Objective:** Reduce card padding on mobile from 24px to 16px (p-6 → p-4)

**Instructions:**
1. Find all cards: `<div class="... p-6 ...">`
2. **Change to:** `p-4 sm:p-6` (16px mobile, 24px desktop)
3. This gives more content space on 375px screens
4. Test at 375px: Cards should have breathing room, not cramped
5. Test at 768px: Padding increases to 24px smoothly
6. **Verify:** Text doesn't touch card edges

**Cards to Update:**
- Search result cards (search.html line 176)
- Wishlist cards (wishlist.html line 118)
- All modal cards
- Profile form card (profile.html line 107)

---

### Task 1.4: Grid Layout Mobile-First
**Objective:** Change grid from `md:grid-cols-2` to `lg:grid-cols-2` (mobile-first)

**Instructions:**
1. Find grid layouts: `<div class="grid grid-cols-1 md:grid-cols-2">`
2. **Change `md:` to `lg:`** — this means:
   - Mobile (375-768px): 1 column
   - Desktop (1024px+): 2 columns
   - Tablet (768px): Still 1 column (smoother transition)
3. **Also update gap:** `gap-6` → `gap-4 sm:gap-6`
4. Test layouts at: 375px, 414px, 768px, 1024px
5. **Document:** Add comment showing expected layout at each breakpoint

**Files to Update:**
- wishlist.html line 118 (grid layout)
- Any search results grid

---

### Task 1.5: Test & Screenshot Phase 1
**Objective:** Verify all Phase 1 changes work correctly

**Instructions:**
1. **Test on Chrome DevTools at these widths:**
   - 375px (iPhone SE)
   - 414px (iPhone 14)
   - 768px (iPad)
   - 1024px (Laptop)

2. **For each screen size, verify:**
   - [ ] All buttons are tappable (48px+ height)
   - [ ] Text is readable (no 14px body text)
   - [ ] Cards have proper padding (not cramped)
   - [ ] Grid layouts stack correctly
   - [ ] No horizontal scrolling

3. **Take 4 screenshots:**
   - One at 375px
   - One at 414px
   - One at 768px
   - One at 1024px

4. **Save screenshots** in a `phase1-results/` folder

5. **Report back:** "Phase 1 complete. All buttons 48px+, text 16px, cards mobile-optimized."

---

## 📋 PHASE 2: Data Enhancement (DEPENDS ON BACKEND)

**🔴 BLOCKER:** Wait for SULIEMAN to provide API with these fields:
- `amount` (e.g., "₹2,500/month")
- `deadline` (e.g., "31 Oct 2026")
- `tags` (array format)

**Once you have the data:**

### Task 2.1: Enhance Search Card Template
**Objective:** Add amount, deadline, category tags to search results

**Current State:**
Search cards show: name + description + Apply button

**New State Should Show:**
- Name ✓
- Government level badge ✓
- Description ✓
- **₹ Amount** ← NEW
- **📅 Deadline** ← NEW
- **Category tags** ← NEW
- Apply button ✓

**Instructions:**
1. Find search card rendering (likely in JavaScript, around line 176)
2. **Add new HTML section after description:**
   ```html
   <!-- Amount & Deadline Row -->
   <div class="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4 pb-4 border-b border-surface-soft/40">
     <!-- Amount -->
     <div class="flex items-center gap-2">
       <svg class="w-4 h-4 text-text-secondary"><!-- rupee icon --></svg>
       <span class="text-sm sm:text-base font-medium">${scheme.amount || 'N/A'}</span>
     </div>
     <!-- Deadline -->
     <div class="flex items-center gap-2">
       <svg class="w-4 h-4 text-text-secondary"><!-- calendar icon --></svg>
       <span class="text-sm sm:text-base font-medium">${scheme.deadline || 'TBD'}</span>
     </div>
   </div>
   ```

3. **Add category tags section:**
   ```html
   <!-- Category Tags -->
   <div class="flex flex-wrap gap-2 mb-4">
     ${(scheme.tags || []).slice(0, 3).map(tag => 
       `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
         ${tag}
       </span>`
     ).join('')}
   </div>
   ```

4. **Test:**
   - [ ] Amount displays correctly
   - [ ] Deadline displays correctly
   - [ ] Tags show (max 3)
   - [ ] Layout looks good at 375px, 414px, 768px, 1024px
   - [ ] Icons render properly
   - [ ] No text overflow

5. **Screenshot:** Show search results with new data at 414px

---

### Task 2.2: Enhance Wishlist Cards
**Objective:** Apply same enhancement as search cards to wishlist

**Instructions:**
1. Find wishlist card template (wishlist.html around line 118)
2. **Apply identical changes** as Task 2.1:
   - Add amount & deadline row
   - Add category tags
   - Use same styling
3. **Additional:** Ensure "Remove" button is still visible and functional
4. **Test grid layout:**
   - [ ] 375px: 1 column, cards full-width
   - [ ] 414px: 1 column, readable
   - [ ] 768px: 2 columns with `gap-4 sm:gap-6`
   - [ ] 1024px: 2 columns, professional spacing

5. **Screenshot:** Show wishlist at 414px with new data

---

### Task 2.3: Enhance Swipe Cards
**Objective:** Show amount & deadline **inline** on flash cards (not hidden)

**Current Problem:**
Swipe cards only show title + description. Users must click "More Info" to see amount/deadline.

**Solution:**
Add amount & deadline INSIDE the swipe card so visible immediately.

**Instructions:**
1. Find swipe card rendering (swipe.html, likely in JavaScript)
2. **Add this section after description:**
   ```html
   <!-- Key Data (Visible on Card) -->
   <div class="space-y-4 mb-6 pb-6 border-b-2 border-surface-soft/40">
     
     <!-- Amount -->
     <div class="flex items-center gap-3">
       <svg class="w-5 h-5 text-primary flex-shrink-0"><!-- rupee icon --></svg>
       <div>
         <p class="text-xs font-semibold text-text-secondary uppercase">Amount</p>
         <p class="text-lg font-bold text-primary">${scheme.amount || 'N/A'}</p>
       </div>
     </div>
     
     <!-- Deadline -->
     <div class="flex items-center gap-3">
       <svg class="w-5 h-5 text-primary flex-shrink-0"><!-- calendar icon --></svg>
       <div>
         <p class="text-xs font-semibold text-text-secondary uppercase">Deadline</p>
         <p class="text-lg font-bold text-primary">${scheme.deadline || 'Ongoing'}</p>
       </div>
     </div>
   </div>
   ```

3. **Ensure card height stays reasonable:**
   - Add `max-height: 70vh` to card
   - Add `overflow-y: auto` (scrollable if needed)

4. **Test:**
   - [ ] Amount visible on card
   - [ ] Deadline visible on card
   - [ ] Icons render
   - [ ] Card doesn't exceed 70% viewport height
   - [ ] Buttons still visible below card
   - [ ] Works at 375px, 414px, 768px

5. **Screenshot:** Show swipe card at 414px with amount/deadline visible

---

## 📋 PHASE 3: How-to Guide (DEPENDS ON DATA)

**🔴 BLOCKER:** Wait for ARSH to provide `how_to_apply` data structure

**Once you have sample data (for 3-5 schemes):**

### Task 3.1: Create How-to Guide HTML Structure
**Objective:** Build the modal/full-screen component

**Instructions:**
1. Add this HTML to **all pages** (index.html, login.html, search.html, etc.):
   ```html
   <!-- How-to Guide Modal -->
   <div id="how-to-modal" class="fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
     <div class="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
       
       <!-- Header -->
       <div class="sticky top-0 bg-white border-b border-surface-soft/60 p-4 sm:p-6 flex items-center justify-between">
         <div>
           <h2 id="how-to-title" class="text-lg sm:text-xl font-bold text-text-primary">How to Apply</h2>
           <p id="how-to-scheme" class="text-sm text-text-secondary">Scheme name</p>
         </div>
         <button id="close-how-to" class="p-2 hover:bg-surface-soft/60 rounded-lg transition-all">
           <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
       
       <!-- Progress -->
       <div class="sticky top-14 bg-white border-b border-surface-soft/60 px-4 sm:px-6 py-3">
         <div class="flex items-center justify-between mb-2">
           <span id="step-counter" class="text-sm font-semibold text-primary">Step 1 of 5</span>
           <span id="estimated-time" class="text-xs text-text-secondary">~15 min</span>
         </div>
         <div class="w-full h-2 bg-surface-soft rounded-full overflow-hidden">
           <div id="progress-bar-how-to" class="h-full bg-primary transition-all" style="width: 20%"></div>
         </div>
       </div>
       
       <!-- Content (Scrollable) -->
       <div class="flex-1 overflow-y-auto p-4 sm:p-6">
         <div id="step-content" class="space-y-4">
           <!-- Content dynamically inserted here -->
         </div>
       </div>
       
       <!-- Footer: Navigation -->
       <div class="border-t border-surface-soft/60 p-4 sm:p-6 flex gap-3 bg-gray-50">
         <button id="prev-step-btn" class="flex-1 px-4 py-3 bg-white text-text-primary font-medium border border-surface-soft rounded-lg hover:bg-surface-soft/50 transition-all text-sm">
           Previous
         </button>
         <button id="next-step-btn" class="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-accent transition-all text-sm">
           Next
         </button>
       </div>
     </div>
   </div>
   
   <!-- Overlay for closing -->
   <div id="how-to-overlay" class="fixed inset-0 z-40 hidden" onclick="closeHowTo()"></div>
   ```

2. **Test HTML:**
   - [ ] Modal appears on page load
   - [ ] Close button works
   - [ ] Overlay exists
   - [ ] Modal styled correctly

---

### Task 3.2: Create How-to Guide JavaScript
**Objective:** Build the logic to navigate steps

**Instructions:**
1. Create file: `js/how-to-guide.js`
2. **Add this code:**
   ```javascript
   class HowToGuide {
     constructor() {
       this.currentStep = 0;
       this.steps = [];
       this.modal = document.getElementById('how-to-modal');
       this.overlay = document.getElementById('how-to-overlay');
       this.contentDiv = document.getElementById('step-content');
       this.currentScheme = null;
       
       this.setupEventListeners();
     }
     
     setupEventListeners() {
       document.getElementById('close-how-to')?.addEventListener('click', () => this.close());
       this.overlay?.addEventListener('click', () => this.close());
       document.getElementById('prev-step-btn')?.addEventListener('click', () => this.previousStep());
       document.getElementById('next-step-btn')?.addEventListener('click', () => this.nextStep());
     }
     
     open(scheme) {
       this.currentScheme = scheme;
       this.steps = scheme.how_to_apply?.steps || [];
       this.currentStep = 0;
       
       if (this.steps.length === 0) {
         console.error('No steps provided for scheme');
         return;
       }
       
       document.getElementById('how-to-title').textContent = `How to Apply for ${scheme.name}`;
       document.getElementById('how-to-scheme').textContent = scheme.ministry || 'Government Scheme';
       document.getElementById('estimated-time').textContent = `~${scheme.how_to_apply?.estimated_time_minutes || 15} min`;
       
       this.modal.classList.remove('hidden');
       this.overlay.classList.remove('hidden');
       
       this.renderStep();
     }
     
     renderStep() {
       if (this.steps.length === 0) return;
       
       const step = this.steps[this.currentStep];
       const stepNum = this.currentStep + 1;
       const totalSteps = this.steps.length;
       
       // Update counter
       document.getElementById('step-counter').textContent = `Step ${stepNum} of ${totalSteps}`;
       
       // Update progress bar
       const progress = (stepNum / totalSteps) * 100;
       document.getElementById('progress-bar-how-to').style.width = progress + '%';
       
       // Update content
       this.contentDiv.innerHTML = `
         <div class="space-y-4">
           <div class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
             Step ${stepNum}
           </div>
           
           <h3 class="text-xl sm:text-2xl font-bold text-text-primary">
             ${step.title || 'Step ' + stepNum}
           </h3>
           
           <p class="text-base text-text-secondary leading-relaxed">
             ${step.instruction || ''}
           </p>
           
           ${step.screenshot_url ? `
             <img src="${step.screenshot_url}" alt="Step screenshot" class="w-full rounded-lg border border-surface-soft/60 mt-4" />
           ` : ''}
         </div>
         
         ${stepNum === totalSteps ? this.getFinalStepHTML() : ''}
       `;
       
       // Update button states
       const prevBtn = document.getElementById('prev-step-btn');
       const nextBtn = document.getElementById('next-step-btn');
       
       prevBtn.disabled = stepNum === 1;
       prevBtn.style.opacity = stepNum === 1 ? '0.5' : '1';
       
       nextBtn.textContent = stepNum === totalSteps ? 'Done' : 'Next';
     }
     
     getFinalStepHTML() {
       const guide = this.currentScheme?.how_to_apply || {};
       
       return `
         <div class="mt-8 space-y-6 border-t border-surface-soft/60 pt-6">
           
           <div>
             <h4 class="font-semibold text-text-primary mb-3">Required Documents</h4>
             <ul class="space-y-2">
               ${(guide.required_documents || []).map(doc => 
                 `<li class="flex items-start gap-2 text-sm text-text-secondary">
                   <span class="text-primary font-bold mt-0.5">•</span>
                   <span>${doc}</span>
                 </li>`
               ).join('')}
             </ul>
           </div>
           
           <div>
             <h4 class="font-semibold text-text-primary mb-3">Need Help?</h4>
             <p class="text-sm text-text-secondary mb-2">
               Email: <a href="mailto:${guide.support_email}" class="text-primary font-medium">${guide.support_email}</a>
             </p>
             <p class="text-sm text-text-secondary">
               Call: <a href="tel:${guide.support_phone}" class="text-primary font-medium">${guide.support_phone}</a>
             </p>
           </div>
         </div>
       `;
     }
     
     nextStep() {
       if (this.currentStep < this.steps.length - 1) {
         this.currentStep++;
         this.renderStep();
       } else {
         this.close();
       }
     }
     
     previousStep() {
       if (this.currentStep > 0) {
         this.currentStep--;
         this.renderStep();
       }
     }
     
     close() {
       this.modal.classList.add('hidden');
       this.overlay.classList.add('hidden');
     }
   }
   
   // Initialize globally
   window.howToGuide = new HowToGuide();
   
   function openHowToGuide(scheme) {
     window.howToGuide.currentScheme = scheme;
     window.howToGuide.open(scheme);
   }
   
   function closeHowTo() {
     window.howToGuide.close();
   }
   ```

3. **Include in HTML:**
   - Add `<script src="js/how-to-guide.js"></script>` to the end of `<body>` in all pages

4. **Test JavaScript:**
   - [ ] No console errors
   - [ ] Modal opens on button click
   - [ ] Steps navigate correctly
   - [ ] Progress bar updates
   - [ ] Close button works

---

### Task 3.3: Integrate with Cards
**Objective:** Hook up "Apply" buttons to open the how-to guide

**Instructions:**
1. Find all "Apply" buttons in search, wishlist, swipe cards
2. **Change from:**
   ```html
   <a href="official_link" target="_blank">Apply Now</a>
   ```

3. **Change to:**
   ```html
   <button onclick="openHowToGuide(schemeData)" class="...">
     Apply Now
   </button>
   ```

4. **Pass scheme data:**
   - When rendering cards, ensure `schemeData` object includes full scheme data with `how_to_apply`
   - Example: `onclick="openHowToGuide({name: 'PM Scholarship', how_to_apply: {...}})"`

5. **Test:**
   - [ ] Clicking Apply opens modal
   - [ ] Guide shows correct scheme name
   - [ ] Steps display correctly
   - [ ] Navigation works
   - [ ] Close works
   - [ ] Works at 375px (full-screen modal)
   - [ ] Works at 1024px (centered modal)

6. **Screenshot:** Show how-to guide open at 414px

---

## 📋 PHASE 4: Polish & Testing

### Task 4.1: Cross-Viewport Testing
**Objective:** Verify everything works at all screen sizes

**Checklist:**
- [ ] **375px (iPhone SE):**
  - All text readable
  - Buttons tappable
  - No horizontal scroll
  - Modals full-screen
  - Cards readable

- [ ] **414px (iPhone 14):**
  - Same as 375px
  - More breathing room

- [ ] **768px (iPad):**
  - 2-column grids active
  - Padding appropriate
  - Layout balanced

- [ ] **1024px (Laptop):**
  - Professional appearance
  - Good spacing
  - Ready for presentation

**Test Script:**
1. Open DevTools → Device Toolbar
2. Test each breakpoint
3. Take screenshots at each size
4. Document any issues

---

### Task 4.2: Feature Testing
**Objective:** Verify all 4 improvements work together

**Search Page:**
- [ ] Cards show amount, deadline, tags
- [ ] Text readable at all sizes
- [ ] Apply button opens how-to guide
- [ ] Layout responsive

**Wishlist Page:**
- [ ] Same as search
- [ ] Remove button works
- [ ] Grid layout correct

**Swipe Page:**
- [ ] Amount, deadline visible on card
- [ ] Save/Discard buttons work
- [ ] Save adds to wishlist
- [ ] How-to guide opens

**How-to Guide:**
- [ ] Opens from any "Apply" button
- [ ] Steps navigate correctly
- [ ] Last step shows documents & contact
- [ ] Works at all screen sizes
- [ ] Closes properly

---

### Task 4.3: Performance Check
**Objective:** Ensure smooth performance

**Checklist:**
- [ ] No console errors (F12 → Console tab)
- [ ] No memory leaks (open/close guide multiple times)
- [ ] Smooth animations
- [ ] No layout shift
- [ ] Images load properly

---

## 📊 Reporting & Documentation

### After Each Phase:
1. **Screenshot proof:** 2-4 screenshots showing the improvements
2. **Test results:** What worked, what needed fixing
3. **Any blockers:** What's waiting on backend/data

### Final Report (After Phase 4):
**Title:** "SchemeSetu Mobile-First Implementation Complete"

**Include:**
- Screenshots at 375px, 414px, 768px, 1024px
- Feature checklist (all items checked)
- Test results (all passed)
- List of files modified
- Lines of code added
- Time spent per phase

---

## 🎯 Success Criteria (You're Done When...)

✅ **All 4 Improvements Working:**
- [ ] Search cards show amount, deadline, tags
- [ ] Wishlist cards show amount, deadline, tags
- [ ] Swipe cards show amount, deadline inline
- [ ] How-to guide works end-to-end

✅ **Mobile-First Design:**
- [ ] All buttons 48px height minimum
- [ ] Body text 16px (readable without zoom)
- [ ] Cards responsive at all sizes
- [ ] No horizontal scrolling
- [ ] Modals full-screen on mobile

✅ **Cross-Platform Testing:**
- [ ] Tested at 375px, 414px, 768px, 1024px
- [ ] All features work at each size
- [ ] Professional appearance at 1024px (presentation-ready)
- [ ] No console errors

✅ **Code Quality:**
- [ ] Clean, readable code
- [ ] Proper Tailwind classes
- [ ] Responsive design patterns
- [ ] No duplicate code

✅ **Documentation:**
- [ ] Screenshots showing improvements
- [ ] List of all files modified
- [ ] Explanation of changes

---

## 🚀 Starting Instructions

**Right Now:**
1. Start with **PHASE 1** — you can do this immediately
2. Don't wait for backend data
3. Focus on: buttons, text size, card padding, grid layout
4. Test at 375px frequently

**When Backend Ready:**
5. Move to **PHASE 2** — data display
6. Same careful testing

**When Data Ready:**
7. Move to **PHASE 3** — how-to guide
8. Most complex, but well-documented

**Final:**
9. **PHASE 4** — Polish & testing

---

## 📞 Questions/Issues

If you encounter problems:
1. Check the console (F12 → Console tab)
2. Review the specific task instructions
3. Take a screenshot of the issue
4. Ask ADI for clarification

**Remember:** Go slowly, test after each change, and document everything!

Good luck! 🎉
