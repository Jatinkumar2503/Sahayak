# Sahayak 3D — Submission Notes & Test Log
*Last Updated: 2026-10-18 IST*

---

## 1. Hackathon Rules Check
[USER: fill in from the hackathon Rules tab — video requirement and max length, whether Deployxa is strictly required, and the exact AI disclosure rule]

---

## 2. Link & Repository Check (Automated Verification)
- **Live URL**: `https://sahayak-tan-zeta.vercel.app/`
- **`og:url` & `og:image`**: Verified via `curl.exe` against the live edge deployment:
  - `og:url`: `https://sahayak-tan-zeta.vercel.app`
  - `og:image`: `https://sahayak-tan-zeta.vercel.app/opengraph-image?5d4b7d9cd331602b`
- **Initial Server-Rendered State**: Verified in raw static HTML before hydration:
  - `0 km/h • Stopped at platform` (Status headline & polite live region)
  - `Signal 102: CLEAR (Green)` (Trackside aspect badge & accessible timeline alternative)
- **Git Working Tree**: Clean on `main`.
- **Axe Report & Screenshots**: All 17 states verified via automated Axe-Core test suite (0 violations) in commit `3f2ab65`.

---

## 3. Automated Browser Smoke Test on Live Link (`?quality=full`)
*(Automated browser agent smoke test, not a manual human test)*
- **Environment**: Automated Chromium headless browser running against `https://sahayak-tan-zeta.vercel.app/?quality=full`.
- **Automated Flow Executed**:
  1. Loaded live link; initial HTML contains stationary train state and Signal 102 CLEAR.
  2. Programmatically clicked "Start journey"; train accelerated.
  3. Programmatically clicked "Simulate a problem"; train decelerated towards Signal 102 and decision cards rendered.
  4. Programmatically selected and applied Option 1 (Branch Chord Bypass); switch aligned, signal cleared to GREEN, train advanced onto branch.
  5. Programmatically clicked "Undo"; state restored.
  6. Opened and closed Family Live Share modal.
  7. Toggled Hindi localization and Elder Mode toggles.
- **Automated Smoke Test Result**: Automated script reached completion without unhandled runtime exceptions.

---

## 4. Real FPS & Telemetry (Chrome Desktop with `?quality=full&debug=1`)
[USER: open ?quality=full&debug=1 in your own Chrome on your laptop, note the FPS during cruise and during reroute, and note your display refresh rate]

---

## 5. Mobile & Lite Mode Check (realme Narzo / Android Chrome)
[USER: open the live link on your Narzo phone, open Demo tools, and record whether Lite Mode is ON or OFF]

---

## 6. Friend / Family Test & Real Traveler Quote
[USER: hand your phone to someone for 60 seconds without speaking. Write down what they did and where they hesitated. Ask them "What do you do when your train is delayed?" and record one real quote]

---

## 7. Screen-Reader Pass (Windows Narrator / NVDA)
[USER: run Windows Narrator with Win+Ctrl+Enter, go through Start journey -> Simulate a problem -> a card -> Confirm, and write one honest sentence about what was announced aloud and what was missing]
