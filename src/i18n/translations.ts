/**
 * Sahayak 3D Internationalization (Bilingual English / Hindi)
 * All user-facing UI copy, disruption notifications, decision engine options, and accessibility text.
 */

export const translations = {
  en: {
    appTitle: 'Sahayak 3D',
    appSubtitle: '12001 Vande Bharat Corridor • Delhi ➔ Ambala',
    simulatedDataBadge: 'Simulated Data',
    simulatedDataDesc: 'Hackathon real-time simulation sandbox based on Northern Railway corridor',

    // Status badges
    statusOnTime: 'ON TIME',
    statusDelay: 'DELAYED',
    statusCancelled: 'SECTION HALT',
    statusRerouted: 'REROUTED (BRANCH)',
    statusResolved: 'RESOLVED',

    // Train Speedometer & Timeline
    trainSpeed: 'Train Speed',
    nextStation: 'Next Station',
    currentLocation: 'Current Location',
    timelineTitle: 'Journey Timeline (Accessible Alternative)',

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

    // Signal Heads
    signalClear: 'Signal 104: Clear (Green)',
    signalCaution: 'Signal 104: Caution (Yellow)',
    signalDanger: 'Signal 104: Stop / Danger (Red)',

    // Plain Language Banners (aria-live)
    bannerNormal: 'Train 12001 is on schedule. Next scheduled stop is Panipat Junction.',
    bannerDelay10: 'Caution: Signal clearance delay ahead of approximately 10 minutes. 3 recommended options available.',
    bannerDelay25: "You'll miss your connecting train at Ambala by about 25 minutes. You have 3 options.",
    bannerDelay60: 'Critical delay: Major freight congestion ahead (+60 min). Rerouting or premium express transfer recommended.',
    bannerCancellation: 'Track blockade ahead at Km 74. Section halt enforced. Emergency options generated.',
    bannerMissedConnection: 'Connection at Ambala Cantt will be missed by 25 min. Alternative bypass route available.',
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
    selectedBadge: 'Applied / सक्रिय',

    // Decision Engine Options
    optionWaitTitle: 'Hold & Wait for Signal Clearance',
    optionWaitDesc: 'Train remains on main corridor track. Highest probability of recovering schedule once track opens.',
    optionWaitReason: 'Lowest effort, zero additional ticket cost, ideal if connection has buffer.',

    optionBranchTitle: 'Switch to Kurukshetra Bypass Branch',
    optionBranchDesc: 'Reroute onto alternate chord line (Track B). Bypasses congested freight siding smoothly.',
    optionBranchReason: 'Saves 28 minutes, ensures on-time arrival for connecting passengers.',

    optionRebookTitle: 'Auto-Rebook onto Vande Bharat Spl 22439',
    optionRebookDesc: 'Priority seat transfer to express departing 20 min later from Platform 4.',
    optionRebookReason: 'Guarantees reserved AC Chair Car seating and protects onward connecting itinerary.',

    optionCabTitle: 'Inter-Station EV Shuttle Transfer',
    optionCabDesc: 'Express 4-seater cab from Panipat outer to Ambala Cantt main gate.',
    optionCabReason: 'Fastest transit time, premium convenience with door-to-door luggage escort.',

    // Family Share Phone Widget
    familyShareTitle: 'Family Live Share',
    familyShareSubtitle: 'Shared with Ananya & Rahul',
    familyStatusSafe: 'Mom is safe on board',
    familyStatusDelayed: 'Mom is safe, delayed by 25 min',
    familyStatusRebooked: 'Mom is safe, 40 min late, rebooked',
    familyStatusRerouted: 'Mom is safe, train rerouted via Branch line',
    familyBattery: 'Phone Battery: 84% • Roaming Live',
    familyLastUpdated: 'Live update just now',

    // Audio & Controls
    hornTitle: 'Sound Electric Loco Horn (Dual Tone)',
    audioMuted: 'Unmute Track Audio',
    audioUnmuted: 'Mute Track Audio',
    scrollModeOn: 'Scroll: ON',
    scrollModeOff: 'Scroll: OFF',
    elderMode: 'Elder Accessibility Mode',
    dayMode: 'Day Mode',
    duskMode: 'Dusk Mode',
  },

  hi: {
    appTitle: 'सहायक ३डी',
    appSubtitle: '१२००१ वंदे भारत कॉरिडोर • नई दिल्ली ➔ अम्बाला',
    simulatedDataBadge: 'काल्पनिक डेटा',
    simulatedDataDesc: 'उत्तर रेलवे कॉरिडोर पर आधारित हैकथॉन रियल-टाइम सिमुलेशन सैंडबॉक्स',

    // Status badges
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

    // Signal Heads
    signalClear: 'सिग्नल १०४: साफ़ (हरा)',
    signalCaution: 'सिग्नल १०४: सावधानी (पीला)',
    signalDanger: 'सिग्नल १०४: ख़तरा / रोकें (लाल)',

    // Plain Language Banners (aria-live)
    bannerNormal: 'ट्रेन १२००१ निर्धारित समय पर है। अगला स्टेशन पानीपत जंक्शन है।',
    bannerDelay10: 'सावधानी: आगे लगभग १० मिनट का सिग्नल विलंब। ३ अनुशंसित विकल्प उपलब्ध हैं।',
    bannerDelay25: 'अम्बाला में आपकी कनेक्टिंग ट्रेन लगभग २५ मिनट से छूट जाएगी। आपके पास ३ विकल्प हैं।',
    bannerDelay60: 'गंभीर विलंब: आगे मालगाड़ी भीड़भाड़ (+६० मि.)। शाखा मार्ग या एक्सप्रेस का उपयोग करें।',
    bannerCancellation: 'किमी ७४ पर ट्रैक अवरोध। खंड रोक लागू। आपातकालीन विकल्प तैयार हैं।',
    bannerMissedConnection: 'अम्बाला कैंट पर कनेक्टिंग ट्रेन छूटेगी। वैकल्पिक बाईपास मार्ग उपलब्ध है।',
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

    // Decision Engine Options
    optionWaitTitle: 'रुकें और सिग्नल साफ़ होने की प्रतीक्षा करें',
    optionWaitDesc: 'ट्रेन मुख्य कॉरिडोर पर रुकी रहेगी। सिग्नल साफ़ होते ही सामान्य गति पकड़ेगी।',
    optionWaitReason: 'शून्य अतिरिक्त खर्च, न्यूनतम परेशानी, यदि आगे पर्याप्त समय बफर हो।',

    optionBranchTitle: 'कुरुक्षेत्र बाईपास शाखा मार्ग पर मुड़ें',
    optionBranchDesc: 'वैकल्पिक कॉर्ड लाइन (ट्रैक बी) पर डायवर्ट हों। भीड़भाड़ वाले हिस्से से बचकर निकलें।',
    optionBranchReason: '२८ मिनट की बचत, कनेक्टिंग यात्रियों के लिए समय पर पहुँच सुनिश्चित।',

    optionRebookTitle: 'वंदे भारत स्पेशल २२४३९ में ऑटो-रीबुक करें',
    optionRebookDesc: '२० मिनट बाद प्लेटफ़ॉर्म ४ से छूटने वाली एक्सप्रेस में प्राथमिकता सीट ट्रांसफर।',
    optionRebookReason: 'आरक्षित वातानुकूलित चेयर कार सीट की गारंटी और आगे की कनेक्टिंग यात्रा सुरक्षित।',

    optionCabTitle: 'इंटर-स्टेशन ईवी शटल ट्रांसफर',
    optionCabDesc: 'पानीपत आउटर से अम्बाला कैंट मुख्य द्वार तक ४-सीटर एक्सप्रेस कैब सेवा।',
    optionCabReason: 'सबसे तेज़ यात्रा समय, सामान सुरक्षा और डोर-टू-डोर सुविधा।',

    // Family Share Phone Widget
    familyShareTitle: 'फैमिली लाइव शेयर',
    familyShareSubtitle: 'अनन्या और राहुल के साथ साझा',
    familyStatusSafe: 'माताजी ट्रेन में पूरी तरह सुरक्षित हैं',
    familyStatusDelayed: 'माताजी सुरक्षित हैं, २५ मिनट विलंब',
    familyStatusRebooked: 'माताजी सुरक्षित हैं, ४० मि. देर, रीबुक किया गया',
    familyStatusRerouted: 'माताजी सुरक्षित हैं, ट्रेन शाखा मार्ग से जा रही है',
    familyBattery: 'फ़ोन बैटरी: ८४% • लाइव रोमिंग',
    familyLastUpdated: 'अभी-अभी लाइव अपडेट',

    // Audio & Controls
    hornTitle: 'इलेक्ट्रिक लोको हॉर्न बजाएं',
    audioMuted: 'ट्रैक ऑडियो चालू करें',
    audioUnmuted: 'ट्रैक ऑडियो म्यूट करें',
    scrollModeOn: 'स्क्रॉल: चालू',
    scrollModeOff: 'स्क्रॉल: बंद',
    elderMode: 'वरिष्ठ नागरिक सुलभ मोड',
    dayMode: 'दिन का दृश्य',
    duskMode: 'गोधूलि दृश्य',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
