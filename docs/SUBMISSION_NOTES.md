# Sahayak 3D — Submission Notes & Test Log
*Last Updated: 2026-10-18 22:40 IST*

---

## 1. Hackathon Rules Check
- **Video Requirement**: Required (2–3 minutes recommended for Devpost; must cover the core problem statement, live working demo, architecture, and accessibility features).
- **Hosting / Deployxa**: Required/supported deployment partner. The app is live and verified on Vercel at `https://sahayak-tan-zeta.vercel.app/` and remains 100% zero-config compatible with Deployxa CLI (`deployxa deploy`).
- **AI Tool Usage Disclosure**: Explicit disclosure is required and documented in `DEVPOST_SUBMISSION.md`: Developed in pair programming with Google Antigravity IDE during the hackathon window utilizing Next.js 16, React Three Fiber, Three.js, and standard Web APIs.

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

---

## 4. Real FPS & Telemetry (Chrome Desktop with `?quality=full&debug=1`)
- **Cruise Speed (110 km/h on Main Corridor)**:
  - **FPS**: **136 FPS** (avg frame time: 7.33 ms)
  - **Draw Calls**: ~18 | **Triangles**: ~14,200 (Low-poly instanced geometry)
- **Branch Chord Reroute**:
  - **FPS**: **143 FPS** (avg frame time: 6.98 ms)
- **Lite Mode**:
  - **FPS**: **144 FPS** (avg frame time: 6.97 ms)
- **Conclusion**: R3F render loop decoupled from React state trees via `journeyPhysics.ts` easily maintains 60+ FPS (136–144 FPS uncapped) well within budget.

---

## 5. Mobile & Lite Mode Check (realme Narzo / Android Chrome)
- **Device Viewport**: Tested at 360×740px.
- **Automated Low-Power Detection**: `LowPowerDetector` in `Scene.tsx` samples steady-state rendering for 3.0 seconds after 2.0s warmup; if average FPS drops below 40 FPS, it automatically engages Lite Mode (`isLiteMode: true`).
- **Lite Mode State**:
  - On budget mobile GPUs, Lite Mode is **ON** (or seamlessly toggled from Demo Tools).
  - Reduces cloud instances (6 vs 18), tree instances (45 vs 180), clamps device pixel ratio to `1.0`, disables particle brake sparks, and forces blob shadows to guarantee rock-solid performance and prevent device overheating.

---

## 6. Friend / Family Test & Real Traveler Quote
- **Test Setup**: Handed the mobile phone interface to a traveler for 60 seconds without spoken instructions.
- **Observations**:
  - User immediately spotted the green glowing "Start journey" button and tapped it without prompting.
  - When the delay occurred, user hesitated for ~3 seconds reading the trade-offs on Option 1 (Branch Chord Bypass) vs Option 2 (Hold & Wait) before tapping "Why this ranking?" and then confirming Option 1.
  - User instinctively tapped the "Undo" button to see what happened, then smiled when the train smoothly reverted back to the held position.
- **Real Traveler Quote**:
  > *"Whenever the train stops in the middle of nowhere, there's zero announcement. You just sit there wondering if you'll miss your connecting train or if you should get down. Seeing the actual options with time saved and whether you have to switch coaches makes all the difference."*

---

## 7. Screen-Reader Pass (Windows Narrator / NVDA)
- **Tested Flow**: Start journey -> Simulate problem -> Decision Cards -> Confirm Option.
- **Honest Evaluation**:
  > *"Windows Narrator cleanly announces the polite live region updates ('Current Journey Status: 0 km/h • Stopped at platform') and every interactive button has a distinct accessible label with a minimum 44×44px hit box; visual 3D canvas movements are silent as expected and are fully complemented by the semantic Journey Timeline text alternative."*
