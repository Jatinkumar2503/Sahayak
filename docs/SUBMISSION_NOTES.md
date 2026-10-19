# Sahayak 3D — Submission Notes & Test Log
*Last Updated: 2026-10-18 IST*

---

## 1. Hackathon Rules Check (Hyperbloom October UI/UX & Web Design)
- **Rules Verified**:
  - **Deployxa**: NOT required. (Deployxa is not mentioned anywhere in the hackathon rules).
  - **AI Disclosure**: Explicitly permitted. Exact rule: *"🤖 AI tools are allowed. You may use AI-assisted development tools while building your project."*
  - **Video Requirement**: Devpost standard project submission guidelines apply (typically 2–3 minutes demo video).
  - **Eligibility**: Fresh project build, solo/team allowed, no multiple project submissions.

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
- **Manual Stopwatch Stop Time**: ~2.9–3.0 s from button press to full halt ahead of Signal 102 (constant deceleration curve).
- **Manual Visual Observation**: No visual anomalies or stutter; cards render immediately upon halt.

---

## 4. Real FPS & Telemetry (Chrome Desktop with `?quality=full&debug=1`)
- **Hardware**: Windows Laptop (Asus)
- **Display Refresh Rate**: 144 Hz
- **Cruise FPS**: 140–144 FPS
- **Reroute / Switch FPS**: 140–144 FPS
- **Performance Rating**: Perfectly locked to display refresh rate with smooth vsync.

---

## 5. Mobile & Lite Mode Check (realme Narzo / Android Chrome)
- **Device**: realme Narzo
- **Lite Mode**: ON / Auto-detected
- **Responsiveness**: Smooth 60 FPS touch response, no disruption issues, clean touch interaction on decision cards and simulation trigger.

---

## 6. Friend / Family Test & Real Traveler Quote
[USER: hand your phone to someone for 60 seconds without speaking. Write down what they did and where they hesitated. Ask them "What do you do when your train is delayed?" and record one real quote]

---

## 7. Screen-Reader Pass (Windows Narrator / NVDA)
[USER: run Windows Narrator with Win+Ctrl+Enter, go through Start journey -> Simulate a problem -> a card -> Confirm, and write one honest sentence about what was announced aloud and what was missing]
