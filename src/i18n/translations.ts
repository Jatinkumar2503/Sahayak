/**
 * Sahayak 3D Internationalization (Bilingual English / Hindi)
 * All user-facing UI copy, disruption notifications, decision engine options, and accessibility text.
 */

export const translations = {
  en: {
    appTitle: 'Sahayak 3D',
    appSubtitle: 'Express 00001 Corridor • Delhi ➔ Ambala',
    simulatedDataBadge: 'Simulated Data',
    simulatedDataDesc: 'Hackathon real-time simulation sandbox based on Northern Railway corridor',

    // Status badges (Okabe-Ito Colorblind-safe)
    statusOnTime: 'ON TIME',
    statusDelay: 'DELAYED',
    statusCancelled: 'SECTION HALT',
    statusRerouted: 'REROUTED (BRANCH)',
    statusResolved: 'RESOLVED',

    // Train Speedometer & Timeline
    trainSpeed: 'Train Speed',
    nextStation: 'Next Station',
    currentLocation: 'Current Location',
    timelineTitle: 'Journey Timeline (Accessible Text Alternative)',
    timelineDesc: 'Comprehensive real-time journey log covering all stations, track signals, and disruption solutions.',

    // Simulator panel
    simulatorTitle: 'Simulate Rail Disruption',
    simulateDelay: 'Signal Delay',
    delay10m: 'Delay 10m',
    delay25m: 'Delay 25m',
    delay60m: 'Delay 60m',
    simulateCancellation: 'Track Blockade (Halt)',
    simulateMissedConnection: 'Missed Connection',
    simulatePlatformChange: 'Platform Reassignment',
    resetJourney: 'Reset Journey',

    // Signal Heads & Text/Icon Fallbacks
    signalClear: 'Signal 104: CLEAR (Green)',
    signalCaution: 'Signal 104: CAUTION (Yellow)',
    signalDanger: 'Signal 104: STOP (Red)',

    // Plain Language Banners (aria-live)
    bannerNormal: 'Express 00001 is on schedule. Next scheduled stop is Panipat Junction.',
    bannerDelay10: 'Notice: Preceding signal clearance delayed by approx 10 minutes. Reviewing 2 options.',
    bannerDelay25: "You'll likely miss your connecting train at Ambala by about 25 minutes. You have 3 options.",
    bannerDelay60: 'Critical delay: Major freight congestion ahead (+60 min). Rerouting or alternative express transfer recommended.',
    bannerCancellation: 'Track blockade ahead at Km 74. Section halt enforced. Emergency alternative options generated.',
    bannerMissedConnection: 'Connecting departure at Ambala Cantt estimated to be missed by 25 min. Alternative bypass route available.',
    bannerPlatformChange: 'Platform reallocated from Platform 2 to Platform 4 at Panipat Jn. Track diversion in progress.',
    bannerResolved: 'Action confirmed. Journey plan updated and synchronized with Family Share.',

    // Decision Card Metrics & Labels
    decisionCardsHeader: 'Recommended Passenger Actions',
    rankedRecommendation: 'Top Recommendation',
    timeLabel: 'Est. Time',
    costLabel: 'Cost',
    comfortLabel: 'Comfort',
    confidenceLabel: 'AI Confidence',
    selectOptionBtn: 'Apply This Solution',
    selectedBadge: 'Applied',

    // Decision Engine Options (Balanced Trade-offs & Hedged Copy)
    optionWaitShortTitle: 'Hold & Wait on Track',
    optionWaitShortDesc: 'Train waits before signal 104 until the track section clears. No train transfer required.',
    optionWaitShortReason: 'Best choice for short delays: Zero extra cost, full seat retention, and highest chance of schedule recovery.',

    optionBranchShortTitle: 'Divert via Siding Loop Line',
    optionBranchShortDesc: 'Take loop siding around freight train at restricted 30 km/h turnout speed.',
    optionBranchShortReason: 'Keeps train rolling but incurs turnout speed restriction and lower ride comfort.',

    optionBranchTitle: 'Switch to Bypass Branch Chord',
    optionBranchDesc: 'Switch onto single-track Kurukshetra chord line immediately. Bypasses main line freight bottleneck.',
    optionBranchReason: 'Saves 22 min, but involves single-track speed limit and unreserved coach allocation.',

    optionRebookTitle: 'Transfer to Express Special 00002',
    optionRebookDesc: 'Seat held subject to availability on express train departing 20 min later on Platform 4.',
    optionRebookReason: 'High AC comfort and aims to protect onward journey, but requires ₹120 fare difference.',

    optionWaitLongTitle: 'Hold on Main Track',
    optionWaitLongDesc: 'Remain in air-conditioned coaches until maintenance crews clear freight ahead.',
    optionWaitLongReason: 'Zero cost and comfortable seating, but absorbs the full delay if connections are not critical.',

    optionMissedRerouteTitle: 'Take Chord Line Bypass Shortcut',
    optionMissedRerouteDesc: 'Diverts via high-speed chord line to recover 25 minutes toward Ambala Cantt.',
    optionMissedRerouteReason: 'Aims to recover connection buffer with 84% estimated likelihood.',

    optionMissedRebookTitle: 'Rebook to Connecting Express 00003',
    optionMissedRebookDesc: 'Assisted PNR transfer for the next scheduled connecting service at 18:45.',
    optionMissedRebookReason: 'Guaranteed reserved seat on later train with standard ticket protection waiver.',

    optionCancelRebookTitle: 'Priority Transfer to Shatabdi 00004',
    optionCancelRebookDesc: 'Alternative departure arranged from Panipat Junction Platform 1 with meal voucher.',
    optionCancelRebookReason: 'Immediate boarding with reserved AC seating and disruption fee waiver.',

    optionCancelShuttleTitle: 'Dedicated Electric Inter-City Shuttle',
    optionCancelShuttleDesc: 'Highway EV shuttle bus transfer from Panipat outer to Ambala Cantt main gate.',
    optionCancelShuttleReason: 'Fastest door-to-door transit time, but requires coach-to-bus baggage transfer.',

    optionPlatformCrossoverTitle: 'Track Crossover to Platform 4',
    optionPlatformCrossoverDesc: 'Automatic crossover switch routes train directly to newly assigned platform.',
    optionPlatformCrossoverReason: 'Zero passenger stair climbing; train aligns directly with station ramp.',

    optionPlatformPorterTitle: 'Request Station Battery Cart at PF 2',
    optionPlatformPorterDesc: 'Free wheelchair & battery cart service for seniors navigating the footbridge.',
    optionPlatformPorterReason: 'Accessible assistance for passengers with heavy luggage or mobility needs.',

    // Family Share Phone Widget (Neutral Simulated Copy)
    familyShareTitle: 'Family Live Share',
    familyShareSubtitle: 'Simulated tracking with family members',
    familyVerifiedStatus: 'Simulated Passenger Status',
    familyStatusSafe: 'Passenger is safe on board',
    familyStatusDelayed: 'Passenger is safe, delayed by 25 min',
    familyStatusRebooked: 'Passenger is safe, rebooked on Express 00002',
    familyStatusRerouted: 'Passenger is safe, train rerouted via Branch chord',
    familyCoachSeat: 'Express 00001 • Coach C-4, Seat 24 (Window)',
    familyBattery: 'Phone Battery: 84% • Roaming Live',
    familyLastUpdated: 'Updated just now',
    familyOfflineTitle: 'Satellite Link Simulation Dropped',
    familyOfflineRetry: 'Retry Connection',
    familyToggleOffline: 'Toggle Simulated Offline State',
    familyTestSync: 'Test Sync Loading',

    // Voice Assistant (Web Speech API)
    voiceTitle: 'Voice Disruption Assistant',
    voicePrompt: 'Tap to speak your situation (e.g., "my train is 25 minutes late")',
    voiceListening: 'Listening... Speak now',
    voiceRecognized: 'Recognized: ',
    voiceSpeaking: 'Reading recommendation aloud...',
    voiceUnsupported: 'Speech Recognition unavailable in this browser',

    // 3-Step Onboarding Modal
    onboardingTitle: 'Welcome to Sahayak 3D',
    onboardingStep1Title: '1. Continuous 3D Rail Corridor',
    onboardingStep1Desc: 'Observe a 5-coach Indian train moving along a Northern corridor track with following camera perspectives (Chase, Side, Map).',
    onboardingStep2Title: '2. Deterministic Disruption Simulation',
    onboardingStep2Desc: 'Trigger real-world rail delays, halts, or platform diversions to test how our multi-criteria decision engine evaluates realistic trade-offs.',
    onboardingStep3Title: '3. Accessibility & Family Sharing',
    onboardingStep3Desc: 'Includes high-contrast Elder Mode, reduced motion support, screen reader live regions, Voice input, and a phone-frame Family Share preview.',
    onboardingNext: 'Next Step',
    onboardingBack: 'Previous',
    onboardingFinish: 'Start Exploring',
    onboardingSkip: 'Skip Introduction',

    // Audio & Accessibility Controls
    hornTitle: 'Sound Loco Horn (Dual Tone)',
    audioMuted: 'Unmute Track Audio',
    audioUnmuted: 'Mute Track Audio',
    scrollModeOn: 'Scroll: ON',
    scrollModeOff: 'Scroll: OFF',
    elderMode: 'Elder Accessibility Mode',
    elderModeOn: 'Elder Mode: ON (High Contrast, Slower Motion)',
    elderModeOff: 'Elder Mode: OFF',
    reducedMotionLabel: 'Motion: ',
    reducedMotionOn: 'Reduced Motion: ON',
    reducedMotionOff: 'Reduced Motion: OFF',
    dayMode: 'Day Mode',
    duskMode: 'Dusk Mode',
    languageToggle: 'Switch to Hindi (हिन्दी)',
    skipToContent: 'Skip to Main Controls',
    closeModal: 'Close Dialog (Escape)',
  },

  hi: {
    appTitle: 'सहायक ३डी',
    appSubtitle: 'एक्सप्रेस ००००१ कॉरिडोर • नई दिल्ली ➔ अम्बाला',
    simulatedDataBadge: 'काल्पनिक डेटा',
    simulatedDataDesc: 'उत्तर रेलवे कॉरिडोर पर आधारित हैकथॉन रियल-टाइम सिमुलेशन सैंडबॉक्स',

    // Status badges (Okabe-Ito Colorblind-safe)
    statusOnTime: 'समय पर',
    statusDelay: 'विलंबित',
    statusCancelled: 'खंड रोक',
    statusRerouted: 'मार्ग परिवर्तित (शाखा)',
    statusResolved: 'समाधान लागू',

    // Train Speedometer & Timeline
    trainSpeed: 'ट्रेन की गति',
    nextStation: 'अगला स्टेशन',
    currentLocation: 'वर्तमान स्थिति',
    timelineTitle: 'यात्रा समयरेखा (सुलभ पाठ विकल्प)',
    timelineDesc: 'सभी स्टेशनों, सिग्नलों और व्यवधान समाधानों का पूर्ण विवरण।',

    // Simulator panel
    simulatorTitle: 'रेल व्यवधान सिम्युलेटर',
    simulateDelay: 'सिग्नल विलंब',
    delay10m: '१० मि. विलंब',
    delay25m: '२५ मि. विलंब',
    delay60m: '६० मि. विलंब',
    simulateCancellation: 'ट्रैक अवरोध (रोक)',
    simulateMissedConnection: 'कनेक्शन छूटना',
    simulatePlatformChange: 'प्लेटफ़ॉर्म परिवर्तन',
    resetJourney: 'यात्रा रीसेट करें',

    // Signal Heads & Text/Icon Fallbacks
    signalClear: 'सिग्नल १०४: साफ़ (हरा)',
    signalCaution: 'सिग्नल १०४: सावधानी (पीला)',
    signalDanger: 'सिग्नल १०४: ख़तरा / रोकें (लाल)',

    // Plain Language Banners (aria-live)
    bannerNormal: 'एक्सप्रेस ००००१ निर्धारित समय पर है। अगला स्टेशन पानीपत जंक्शन है।',
    bannerDelay10: 'सूचना: आगे लगभग १० मिनट का सिग्नल विलंब। २ विकल्पों की समीक्षा की जा रही है।',
    bannerDelay25: 'अम्बाला में आपकी कनेक्टिंग ट्रेन लगभग २५ मिनट से छूट सकती है। आपके पास ३ विकल्प हैं।',
    bannerDelay60: 'गंभीर विलंब: आगे मालगाड़ी भीड़भाड़ (+६० मि.)। शाखा मार्ग या एक्सप्रेस ट्रांसफर की अनुशंसा है।',
    bannerCancellation: 'किमी ७४ पर ट्रैक अवरोध। खंड रोक लागू। आपातकालीन विकल्प तैयार हैं।',
    bannerMissedConnection: 'अम्बाला कैंट पर कनेक्टिंग ट्रेन २५ मिनट से छूटने का अनुमान है। वैकल्पिक बाईपास उपलब्ध है।',
    bannerPlatformChange: 'पानीपत जं. पर प्लेटफ़ॉर्म २ से ४ में परिवर्तन। ट्रैक डायवर्जन जारी है।',
    bannerResolved: 'कार्यवाही की पुष्टि की गई। यात्रा योजना अद्यतन और फैमिली शेयर के साथ सिंक हुई।',

    // Decision Card Metrics & Labels
    decisionCardsHeader: 'यात्री के लिए अनुशंसित समाधान',
    rankedRecommendation: 'सर्वश्रेष्ठ अनुशंसा',
    timeLabel: 'अनुमानित समय',
    costLabel: 'लागत',
    comfortLabel: 'सुविधा',
    confidenceLabel: 'एआई विश्वास',
    selectOptionBtn: 'यह समाधान चुनें',
    selectedBadge: 'लागू किया गया',

    // Decision Engine Options (Balanced Trade-offs & Hedged Copy)
    optionWaitShortTitle: 'ट्रैक पर प्रतीक्षा करें',
    optionWaitShortDesc: 'सिग्नल १०४ साफ़ होने तक ट्रेन ट्रैक पर रुकी रहेगी। ट्रेन बदलने की आवश्यकता नहीं।',
    optionWaitShortReason: 'कम विलंब के लिए सर्वश्रेष्ठ: शून्य लागत, आरक्षित सीट सुरक्षित और समय भरपाई की उच्चतम संभावना।',

    optionBranchShortTitle: 'साइडिंग लूप लाइन से जाएं',
    optionBranchShortDesc: 'धीमी मालगाड़ी के बगल से ३० किमी/घंटा की सीमित गति पर लूप लाइन लें।',
    optionBranchShortReason: 'ट्रेन चलती रहती है पर गति सीमा और कम सवारी आराम का समझौता करना पड़ता है।',

    optionBranchTitle: 'कुरुक्षेत्र बाईपास शाखा कॉर्ड पर मुड़ें',
    optionBranchDesc: 'तुरंत एकल-ट्रैक कुरुक्षेत्र कॉर्ड लाइन पर डायवर्ट हों। भीड़भाड़ वाले हिस्से से बच निकलें।',
    optionBranchReason: '२२ मिनट की बचत, परंतु एकल-ट्रैक गति सीमा और अनारक्षित सीट व्यवस्था का समझौता है।',

    optionRebookTitle: 'एक्सप्रेस स्पेशल ००००२ में सीट ट्रांसफर',
    optionRebookDesc: '२० मिनट बाद प्लेटफ़ॉर्म ४ से छूटने वाली एक्सप्रेस में उपलब्धता के अधीन सीट आरक्षण।',
    optionRebookReason: 'उच्च वातानुकूलित सुविधा और आगे की यात्रा सुरक्षा, परंतु ₹१२० किराया अंतर लगेगा।',

    optionWaitLongTitle: 'मुख्य ट्रैक पर प्रतीक्षा करें',
    optionWaitLongDesc: 'वातानुकूलित कोच में बैठकर मालगाड़ी क्लीयरेंस की प्रतीक्षा करें।',
    optionWaitLongReason: 'शून्य लागत और आरामदायक सीट, परंतु यदि आगे की कनेक्टिंग ट्रेन न हो तभी उपयुक्त।',

    optionMissedRerouteTitle: 'कॉर्ड लाइन बाईपास शॉर्टकट लें',
    optionMissedRerouteDesc: '२५ मिनट का बफर वापस पाने के लिए हाई-स्पीड कॉर्ड लाइन से जाएं।',
    optionMissedRerouteReason: 'लगभग ८४% अनुमानित संभावना के साथ अम्बाला में कनेक्टिंग ट्रेन पकड़ने का प्रयास।',

    optionMissedRebookTitle: 'कनेक्टिंग एक्सप्रेस ००००३ में रीबुक करें',
    optionMissedRebookDesc: 'शाम १८:४५ बजे अगली कनेक्टिंग ट्रेन के लिए टिकट ट्रांसफर सहायता।',
    optionMissedRebookReason: 'मानक टिकट सुरक्षा छूट के साथ बाद की ट्रेन में आरक्षित सीट।',

    optionCancelRebookTitle: 'शताब्दी ००००४ में प्राथमिकता ट्रांसफर',
    optionCancelRebookDesc: 'पानीपत जंक्शन प्लेटफ़ॉर्म १ से विशेष वैकल्पिक ट्रेन और भोजन वाउचर।',
    optionCancelRebookReason: 'आरक्षित वातानुकूलित सीट और रद्दीकरण शुल्क छूट के साथ तुरंत बोर्डिंग।',

    optionCancelShuttleTitle: 'समर्पित इलेक्ट्रिक इंटर-सिटी शटल',
    optionCancelShuttleDesc: 'पानीपत आउटर से अम्बाला कैंट मुख्य द्वार तक एक्सप्रेसवे ईवी बस सेवा।',
    optionCancelShuttleReason: 'सबसे तेज़ यात्रा समय, परंतु बस में सामान स्थानांतरण की आवश्यकता होगी।',

    optionPlatformCrossoverTitle: 'प्लेटफ़ॉर्म ४ पर ट्रैक क्रॉसओवर',
    optionPlatformCrossoverDesc: 'क्रॉसओवर इंटरलॉकिंग ट्रेन को नए आवंटित प्लेटफ़ॉर्म ४ पर ले जाती है।',
    optionPlatformCrossoverReason: 'यात्रियों को सीढ़ियों या पुल की आवश्यकता नहीं; ट्रेन सीधे रैंप से मिलती है।',

    optionPlatformPorterTitle: 'प्लेटफ़ॉर्म २ पर बैटरी कार्ट का अनुरोध करें',
    optionPlatformPorterDesc: 'वरिष्ठ नागरिकों के लिए फुटब्रिज पार करने हेतु निःशुल्क सहायक व्हीलचेयर व कार्ट।',
    optionPlatformPorterReason: 'भारी सामान या गतिशीलता की आवश्यकता वाले यात्रियों के लिए सुलभ सेवा।',

    // Family Share Phone Widget (Neutral Simulated Copy)
    familyShareTitle: 'फैमिली लाइव शेयर',
    familyShareSubtitle: 'परिजनों के साथ सिम्युलेटेड ट्रैकिंग',
    familyVerifiedStatus: 'काल्पनिक यात्री स्थिति',
    familyStatusSafe: 'यात्री ट्रेन में पूरी तरह सुरक्षित हैं',
    familyStatusDelayed: 'यात्री सुरक्षित हैं, २५ मिनट विलंब',
    familyStatusRebooked: 'यात्री सुरक्षित हैं, एक्सप्रेस ००००२ में रीबुक',
    familyStatusRerouted: 'यात्री सुरक्षित हैं, ट्रेन शाखा कॉर्ड से जा रही है',
    familyCoachSeat: 'एक्सप्रेस ००००१ • कोच C-4, सीट 24 (खिड़की)',
    familyBattery: 'फ़ोन बैटरी: ८४% • लाइव रोमिंग',
    familyLastUpdated: 'अभी-अभी लाइव अपडेट',
    familyOfflineTitle: 'सैटेलाइट लिंक सिग्नल ड्रॉप (सिमुलेशन)',
    familyOfflineRetry: 'पुनः प्रयास करें',
    familyToggleOffline: 'ऑफ़लाइन स्थिति का परीक्षण करें',
    familyTestSync: 'सिंक लोडिंग का परीक्षण करें',

    // Voice Assistant (Web Speech API)
    voiceTitle: 'वॉयस व्यवधान सहायक',
    voicePrompt: 'अपनी स्थिति बोलने के लिए दबाएं (उदा: "मेरी ट्रेन २५ मिनट लेट है")',
    voiceListening: 'सुन रहे हैं... अभी बोलें',
    voiceRecognized: 'पहचाना गया: ',
    voiceSpeaking: 'अनुशंसा सुनाई जा रही है...',
    voiceUnsupported: 'इस ब्राउज़र में वाक् पहचान उपलब्ध नहीं है',

    // 3-Step Onboarding Modal
    onboardingTitle: 'सहायक ३डी में आपका स्वागत है',
    onboardingStep1Title: '१. निरंतर ३डी रेल कॉरिडोर',
    onboardingStep1Desc: 'दिल्ली और अम्बाला के बीच ५-कोच ट्रेन को विभिन्न कैमरा कोणों (पीछे, बगल, ऊपर) से देखें।',
    onboardingStep2Title: '२. यथार्थवादी व्यवधान सिमुलेशन',
    onboardingStep2Desc: 'सिग्नल विलंब, रुकावट या प्लेटफ़ॉर्म डायवर्जन का परीक्षण करें और संतुलित एआई विकल्प प्राप्त करें।',
    onboardingStep3Title: '३. सुलभता और फैमिली शेयर',
    onboardingStep3Desc: 'वरिष्ठ नागरिक मोड, मोशन नियंत्रण, स्क्रीन रीडर लाइव क्षेत्र, वॉयस इनपुट और फैमिली शेयर शामिल हैं।',
    onboardingNext: 'अगला चरण',
    onboardingBack: 'पिछला',
    onboardingFinish: 'शुरू करें',
    onboardingSkip: 'छोड़ें',

    // Audio & Accessibility Controls
    hornTitle: 'इलेक्ट्रिक लोको हॉर्न बजाएं',
    audioMuted: 'ट्रैक ऑडियो चालू करें',
    audioUnmuted: 'ट्रैक ऑडियो म्यूट करें',
    scrollModeOn: 'स्क्रॉल: चालू',
    scrollModeOff: 'स्क्रॉल: बंद',
    elderMode: 'वरिष्ठ नागरिक सुलभ मोड',
    elderModeOn: 'वरिष्ठ नागरिक मोड: चालू (उच्च कंट्रास्ट, धीमी गति)',
    elderModeOff: 'वरिष्ठ नागरिक मोड: बंद',
    reducedMotionLabel: 'मोशन: ',
    reducedMotionOn: 'मोशन नियंत्रण: चालू',
    reducedMotionOff: 'मोशन नियंत्रण: बंद',
    dayMode: 'दिन का दृश्य',
    duskMode: 'गोधूलि दृश्य',
    languageToggle: 'Switch to English',
    skipToContent: 'मुख्य नियंत्रणों पर जाएं',
    closeModal: 'संवाद बंद करें (Escape)',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
