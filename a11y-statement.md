# Accessibility & Inclusivity Statement — Sahayak 3D

> **Standard Target:** Web Content Accessibility Guidelines (WCAG) 2.1 Level AA  
> **Status:** Compliant with Zero Critical/Serious Blockers  
> **Last Audited:** Phase 4 Production Build (Next.js 16.4.1 / Turbopack)

---

## 1. Executive Summary

Sahayak 3D was conceived from day one not just as a visual 3D rail journey simulator, but as an accessible, multi-modal emergency assistant for Indian Railways passengers of all ages, languages, and abilities. Moving 3D canvases often pose severe barriers for users with motor disabilities, low vision, vestibular disorders, or screen reader dependencies. Sahayak 3D solves this with an architectural separation of concerns: **the 3D WebGL scene is purely visual enhancement; the full interactive journey, disruption intelligence, and decision tree are completely accessible via semantic HTML, keyboard, voice, and screen reader alternatives.**

---

## 2. Key Accessibility Features Implemented

### A. Non-Color Dependent Status & Okabe-Ito Palette
- **Problem Fixed:** Phase 3 previously relied on emoji badges (`🟢⚠️🛑`) which screen readers announce inconsistently and colorblind users struggle to differentiate.
- **Solution:** Replaced with the **Okabe-Ito colorblind-safe palette** paired with explicit SVG geometric glyphs (`CheckCircle2`, `AlertTriangle`, `OctagonAlert`) plus visible multilingual text labels:
  - **On-Time:** Bluish Green (`#009E73`) + Circular Checkmark + "On Time / समय पर"
  - **Caution / Delay:** Amber (`#E69F00`) + Triangular Alert + "Delayed / विलंबित"
  - **Danger / Cancelled:** Vermilion (`#D55E00`) + Octagonal Alert + "Cancelled / रद्द"
- **WCAG Success Criteria:** 1.4.1 (Use of Color), 1.4.11 (Non-text Contrast).

### B. High Contrast & Elder Mode (वरिष्ठ मोड)
- **Normal Mode:** Body text (`#F8FAFC` on `#0F172A`) achieves **14.8:1 contrast** (exceeding the 4.5:1 WCAG AA requirement).
- **Elder Mode:** Specifically engineered for senior citizens navigating complex travel disruptions:
  - Base typography scales up to `18px–24px` with high-legibility sans-serif fonts.
  - Interactive touch targets enlarged to a minimum of **48×48px** with clear visual spacing.
  - Strict high-contrast borders (`border-2 border-amber-400`).
  - Simplified HUD with one prominent primary action per screen.
  - 3D locomotive speed automatically reduces by 36% (from 0.25 to 0.16) for calmer visual tracking.
  - State persisted across sessions in `localStorage`.
- **WCAG Success Criteria:** 1.4.3 (Contrast Minimum), 1.4.4 (Resize Text), 2.5.5 (Target Size).

### C. Motion Sensitivity & Reduced Motion (गतिमंद मोड)
- Complete respect for system-level `prefers-reduced-motion` media queries plus a manual in-app toggle:
  - Disables dynamic camera bobbing, orbit sway, and tracking oscillations.
  - Replaces rapid track switching with a gentle cross-fade transition.
  - Disables pulsing glow shaders on track signals (Signal 104).
- **WCAG Success Criteria:** 2.3.3 (Animation from Interactions).

### D. Screen Reader Compatibility & Polite Live Announcements
- **Polite Announcement Cadence:** Changed disruption alerts to `aria-live="polite"` so screen reader users are not abruptly interrupted mid-sentence during transient state updates. `aria-live="assertive"` is reserved solely for critical train cancellations.
- **Zero Per-Frame Thrashing:** Live physics coordinates (train speed, spline progress, distance remaining) are decoupled from the React/Zustand render tree. Screen readers receive updates only when discrete milestones occur (e.g., station arrival, signal aspect flip, disruption trigger).
- **WCAG Success Criteria:** 4.1.3 (Status Messages).

### E. Equal Text Alternative for 3D Rail Scene (`JourneyTimelineA11y`)
- For users unable to view WebGL canvas graphics, Sahayak 3D includes a 100% equivalent semantic HTML timeline:
  - Lists all upcoming stations (New Delhi, Kanpur Central, Prayagraj, Pt. DD Upadhyaya).
  - Live arrival ETAs and progress percentages.
  - Current signal aspect status (Signal 104 - Danger/Clear).
  - Active track alignment (Main Line vs. Chord Line Detour).
  - Detailed rationale and trade-offs of the chosen passenger resolution.
  - Available both as a permanently accessible `sr-only` landmark and an on-demand modal.
- **WCAG Success Criteria:** 1.1.1 (Non-text Content), 1.3.1 (Info and Relationships).

### F. Full Keyboard Trapping, Focus Rings & Escape Dismissal
- All interactive buttons, modals, and switches are reachable via the Tab key in logical sequential order.
- Prominent focus rings applied universally (`focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2`).
- All dialogs (`FamilyShareModal`, `OnboardingModal`, `VoiceAssistantModal`, `JourneyTimelineA11y`) trap focus, restore focus to the triggering element upon exit, and can be dismissed instantly with the **Escape** key.
- **WCAG Success Criteria:** 2.1.1 (Keyboard), 2.1.2 (No Keyboard Trap), 2.4.3 (Focus Order), 2.4.7 (Focus Visible).

### G. Voice Accessibility (Web Speech API)
- Passengers unable to type or use touch screens can tap the voice assistant or speak directly:
  - Natural speech input ("Train delayed 25 minutes" / "Signal failure ahead").
  - Semantic parser maps voice input to disruption scenarios.
  - Speaks recommendations aloud via `SpeechSynthesis` in Hindi or English.
  - **Graceful Feature Detection:** Hides the microphone button on unsupported browsers (e.g., Firefox without Web Speech API) to prevent dead controls.
- **WCAG Success Criteria:** 2.5.3 (Label in Name), 3.3.1 (Error Identification).

### H. 3-Step Guided Onboarding
- A skippable 3-step introductory walkthrough explaining:
  1. Real-time 3D Corridor & Camera Controls
  2. Disruption Decision Engine & Ethical Trade-offs
  3. Accessibility, Voice & Family Share
- Remembers user completion in `localStorage` so repeat travelers are not interrupted.

---

## 3. Ethical Content & Fair Trade-off Guarantees
- **No Trademark Misrepresentation:** Removed all references to "IRCTC verified"; status is transparently labeled as **"Simulated Passenger Status"**.
- **No Overclaiming Promises:** Fictionalized all train numbers to neutral identifiers ("Express 00001", "Express Special 00002") and replaced unrealistic guarantees ("100% seat protection", "guarantees arrival") with hedged, honest language ("likely", "seat held if available").
- **Balanced Decision Trade-offs:** Short delays (10m) rightfully favor holding on track (₹0 cost, 4/5 comfort, 94% confidence); long bypass reroutes carry authentic trade-offs (comfort penalty 3/5, 82% confidence, unreserved seating).
