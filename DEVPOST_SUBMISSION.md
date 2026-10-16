# Devpost Project Submission Draft — Sahayak 3D (सहायक ३डी)

> **Tagline:** An accessible, moving 3D Indian rail corridor and real-time disruption decision assistant empowering passengers with transparent choices, voice interaction, and family peace of mind.

---

## Inspiration

Every year, over 8 billion passengers travel across the Indian Railways. Yet when an unexpected delay, signal failure, or platform reassignment occurs, the experience is often defined by confusion and anxiety:
- *Why has our train stopped in the middle of a section?*
- *Will I miss my connecting train at the next junction?*
- *Should I wait on board, take a detour via a chord line, or rebook immediately?*

Most railway tools present static timetables or uninformative "Late by 45 mins" text updates without offering actionable, passenger-centric options. We built **Sahayak 3D** to transform rail disruptions from moments of stress into moments of empowered, transparent decision-making — with universal accessibility for senior citizens, screen-reader users, and non-English speakers.

---

## What It Does

1. **Continuous Moving 3D Corridor**: A real-time, low-poly 3D rail corridor along the Northern Railway line (New Delhi ➔ Panipat ➔ Ambala). The 5-coach train travels continuously with following camera perspectives (Chase, Side, Map) and day/dusk lighting transitions.
2. **Deterministic Disruption Simulator**: Allows passengers or station managers to simulate common rail incidents:
   - *Signal 104 Trackside Failure (25-minute delay)*
   - *Section Blockage / Cancellation*
   - *Tight Junction Missed Connection*
   - *Platform Reassignment with Footbridge Transfer*
3. **Multi-Criteria Decision Engine**: Rather than recommending trivial choices, the engine evaluates real trade-offs across 5 weighted factors:
   - **Arrival Confidence (%)**
   - **Time Saved (Minutes)**
   - **Comfort Score (1–5 Stars)**
   - **Financial Cost (₹)**
   - **Transfer Complexity**
   - *Example Trade-off*: Short delays (10m) rightfully favor holding on track (₹0, 4/5 comfort, 94% confidence). A long delay recommends a **Bypass Chord Detour** that saves 22 minutes but penalizes comfort (3/5) due to unreserved seating.
4. **Interactive Branch Track Rerouting**: When a reroute is approved, the track switch lights up, Signal 104 flips, and the train seamlessly blends from the main corridor onto the branch line without stopping.
5. **Universal Accessibility (WCAG 2.1 AA)**:
   - **Okabe-Ito Colorblind-Safe Palette**: No status ever relies on color alone; every badge pairs high-contrast hues with geometric SVG glyphs (`CheckCircle2`, `AlertTriangle`, `OctagonAlert`, `GitBranch`) and dual-language text.
   - **Elder Mode (वरिष्ठ मोड)**: Tailored for senior citizens with 18px–24px text, 48px+ touch targets, 2px amber borders, a simplified single-action HUD, and 36% slower 3D motion.
   - **Complete Reduced Motion**: Disables camera bobbing, freezes signal pulsing, and switches 3D reroutes to gentle cross-fades.
   - **Web Speech API Voice Assistant**: Allows hands-free travelers to speak ("my train is 25 minutes late"), mapping voice to simulations and reading recommendations aloud in Hindi or English.
   - **100% HTML Text Alternative (`JourneyTimelineA11y`)**: Complete semantic HTML alternative detailing stations, ETAs, signal aspects, and chosen options for screen readers and non-WebGL devices.
6. **Family Live Share**: A realistic mobile phone frame mockup allowing passengers to share simulated live battery levels, safe transit confirmations, and reroute updates with loved ones at home.

---

## How We Built It

- **Frontend & App Architecture**: Next.js 16 (App Router, Turbopack, TypeScript, Tailwind CSS).
- **3D Graphics & Physics**: React Three Fiber, Three.js, and Drei.
  - *Mutable Physics Engine*: High-frequency train coordinates and bogie sway are managed in a decoupled mutable physics reference (`journeyPhysics.ts`), completely bypassing React/Zustand render trees to maintain 60 FPS without component thrashing.
- **State Management & Persistence**: Zustand with `localStorage` persistence for language preference (`en`/`hi`), Elder Mode, and Reduced Motion.
- **Audio Synthesis**: Web Audio API oscillator synthesizing realistic electric locomotive dual-tone horns and rail track rumble without external audio assets.
- **Auditing & Testing**: Google Lighthouse CLI v13.5.0, Axe-Core engine, and a deterministic 6-test suite.

---

## Verified Test Scores & Performance

- **Google Lighthouse Scores (Production Build)**:
  - **Accessibility: 100 / 100** (Axe-Core verified: 23 passed audits, 0 violations)
  - **Best Practices: 100 / 100**
  - **SEO: 100 / 100**
  - **Desktop Performance: 87 / 100**
- **Headless Container Telemetry (Software SwiftShader)**:
  - Cruise: 36–42 FPS (85 draw calls, 24k triangles)
  - Active Chord Reroute: 32–38 FPS (no draw call spikes)
- **Laptop Hardware GPU Telemetry (User Verified)**:
  - `[USER: add real FPS from your Chrome, e.g., 60 FPS at 16.6 ms]`
- **Low-Power Fallback (Lite Mode)**:
  - If a device averages <40 FPS over the first 3 seconds, Sahayak 3D automatically reduces instanced trees, disables sparks, uses blob shadows, and caps pixel ratio to 1.0.

---

## User Testing & Observation

> **60-Second Friend Observation**:  
> `[USER: add real friend feedback — e.g. "When handed the phone without explanation, my friend immediately understood the train was moving, but upon seeing the red signal they tapped the bypass card asking if it would cost extra fare. This prompted us to highlight the ₹0 unreserved note directly on the card header."]`

---

## Ethical Disclosure & Simulated Data

- **No Impersonation**: Sahayak 3D deliberately avoids claiming official IRCTC endorsement. All status tags read **"Simulated Passenger Status"**.
- **Fictionalized Identifiers**: Train numbers use fictional designations ("Express 00001", "Express Special 00002").
- **Hedged Copy**: Realistic promises ("likely", "seat held if available") replace overclaiming guarantees ("100% seat protection").
- **AI Tool Usage Disclosure**: Built in pair programming with Google Antigravity IDE during the hackathon period, utilizing Next.js, Three.js, and standard web APIs.

---

## What's Next for Sahayak 3D

1. Integration with open Indian Railways GPS feeds (e.g., National Train Enquiry System / CRIS open data APIs).
2. Offline progressive web app (PWA) caching with Service Workers for low-connectivity rural track sections.
3. Multi-language regional audio announcements in Tamil, Bengali, Marathi, and Telugu.

---

# 2-Minute Demo Video Shot List

| Time | Visual Scene | Audio / Voiceover Narrative | On-Screen Action |
| :---: | :--- | :--- | :--- |
| **0:00 – 0:20** | **The Moving Corridor**<br>Chase camera following 5-coach train at sunset. | *"Every day, millions ride Indian Railways. But when unexpected delays hit, passengers are left in the dark. Welcome to Sahayak 3D — a moving rail corridor and disruption decision companion."* | Camera switches to Cinematic Side view; sound loco horn. |
| **0:20 – 0:45** | **The Disruption & Signal 104**<br>Signal 104 turns red; train decelerates with brake sparks. | *"Disruption simulated: Signal 104 ahead turns red. Our train decelerates to a stop. Immediately, the Decision Engine analyzes viable choices with genuine trade-offs."* | Click "Trigger Delay (Signal 104)"; show polite live banner. |
| **0:45 – 1:10** | **The Ethical Decision Cards**<br>Ranked cards appear showing real trade-offs. | *"Notice the options: Holding on track is free with 4/5 comfort, but a chord bypass detour saves 22 minutes with an honest trade-off — 3/5 comfort and unreserved seating."* | Hover/focus on Chord Detour; point out confidence (82%) and time saved. |
| **1:10 – 1:30** | **The Reroute Execution**<br>Train smoothly switches onto the glowing chord branch. | *"We approve the bypass reroute. The switch lights up, and the train smoothly blends onto the chord track at 60 frames per second without stutter."* | Click "Approve Bypass Reroute"; camera follows train through switch frog. |
| **1:30 – 1:40** | **Family Live Share Payoff**<br>Smartphone frame opens. | *"Passengers don't travel in a vacuum. With Family Share, simulated live status, coach number, and safety verification are instantly visible to loved ones at home."* | Open Family Share modal; show battery status and "Simulated Passenger Status". |
| **1:40 – 1:50** | **Hindi Localization (10s)**<br>Toggle to Hindi (हिन्दी). | *"Language inclusivity: With one click, the entire UI, 3D station signboards, and decision intelligence translate into Devanagari Hindi."* | Click "हिन्दी"; show "समय पर", "सिग्नल १०४", and Hindi station board. |
| **1:50 – 2:00** | **Elder Mode & Web Speech Voice (10s)**<br>Activate Elder mode and speak voice command. | *"Elder Mode enhances contrast with 48px targets and calmer motion, while the Web Speech assistant lets anyone speak their situation hands-free. Sahayak 3D: accessible, transparent rail transit for all."* | Toggle Elder mode; show high contrast; tap mic button to show voice modal. |
