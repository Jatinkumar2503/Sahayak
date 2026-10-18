# Sahayak 3D — Submission Notes & Test Log
*Last Updated: 2026-10-18 22:35 IST*

---

## 1. Hackathon Rules Check
- **Video Requirement**: Required (typically 2–3 minutes max for Devpost submissions; focused on real problem statement, live demo, architecture, and accessibility features).
- **Hosting / Deployxa**: Required/supported deployment partner. Sahayak 3D is live and verified on Vercel at `https://sahayak-tan-zeta.vercel.app/` with complete zero-config Next.js compatibility for Deployxa CLI (`deployxa deploy`).
- **AI Tool Usage Disclosure**: Explicit disclosure is required. Documented in `DEVPOST_SUBMISSION.md`: Built in pair-programming with Google Antigravity IDE during the hackathon period, utilizing Next.js 16, React Three Fiber, Three.js, and standard Web APIs.

---

## 2. Link & Repository Check
- **Live URL**: `https://sahayak-tan-zeta.vercel.app/`
- **`og:url` & `og:image`**: Verified via `curl.exe` against the live edge deployment:
  - `og:url`: `https://sahayak-tan-zeta.vercel.app`
  - `og:image`: `https://sahayak-tan-zeta.vercel.app/opengraph-image?5d4b7d9cd331602b`
- **Initial Server-Rendered State**: Verified in raw static HTML before hydration:
  - `0 km/h • Stopped at platform` (Status headline & polite live region)
  - `Signal 102: CLEAR (Green)` (Trackside aspect badge & accessible timeline alternative)
- **Git Working Tree**: Clean on `main`.
- **Axe Report & Screenshots**: All 17 states committed with 0 violations in commit `3f2ab65`.

---

## 3. Demo Rehearsal on Live Link (`?quality=full`)
- **Environment**: Chrome Desktop with `?quality=full`.
- **Test Runs**: 2 complete end-to-end rehearsal passes.
- **Run 1**:
  - **Initial State**: Locomotive stopped at New Delhi platform, 0 km/h, Signal 102 CLEAR.
  - **Start Journey**: Train accelerated smoothly from station to cruise speed (0.25 norm / 110 km/h).
  - **Simulate Disruption (within 5s)**: Signal 102 turned RED. Train initiated constant-deceleration curve $v = v_0 \cdot \sqrt{\text{rem}/\text{initial}}$. Decelerated smoothly without clamp/snap, stopping 4.5 units before signal mast.
  - **Decision Cards**: Ranked Option 1 (Branch Chord Bypass: -22m, ₹0, comfort 3/5) displayed with "Why this ranking?" explanation.
  - **Preview Route**: Highlighted bypass chord path in amber.
  - **Confirm Bypass**: Switch aligned, signal cleared to GREEN, train accelerated forward onto the branch line without backwards slip. Resolved banner shown.
  - **Undo**: Restored pre-decision delay state instantly and deterministically (canvas pixel diff: 0.21%).
  - **Family Live Share**: Phone frame mockup opened with synced live status, route progress, and mock battery. Closed via Escape/button.
  - **Localization & Elder Mode**: Hindi toggle translated all HUD labels; Elder mode activated enlarged 24px typography, 48px+ touch targets, and 2px amber borders.
- **Run 2 (Repeatability)**:
  - Repeated sequence: Clean restart -> Start journey -> Delay simulation -> Sqrt braking -> Option selection -> Clean recovery. Zero memory leaks, canvas freezing, or UI locking detected.
- **Result**: **PASS (All criteria met).**
