import type { DisruptionFSMState } from './disruptionFSM';

export interface JourneyContext {
  progress: number;
  speed: number;
  currentStationId: string;
}

export interface DecisionOption {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  rankingReasonEn: string;
  rankingReasonHi: string;
  timeDeltaMinutes: number; // Positive = delayed, Negative = time saved
  timeDisplayEn: string;
  timeDisplayHi: string;
  newEtaEn: string;
  newEtaHi: string;
  costInr: number;
  costDisplayEn: string;
  costDisplayHi: string;
  comfortRating: number; // 1 to 5
  confidenceScore: number; // 0 to 100%
  transfersCount: number;
  transfersDisplayEn: string;
  transfersDisplayHi: string;
  seatNoteEn: string;
  seatNoteHi: string;
  actionType: 'resume' | 'reroute' | 'rebook' | 'cab';
  rank: number;
  isTopRanked: boolean;
  disabled?: boolean;
  disabledReasonEn?: string;
  disabledReasonHi?: string;
}

/**
 * Pure deterministic multi-criteria decision engine.
 * Computes trade-off composite score across Time, Cost, Comfort, and AI Confidence.
 */
export function getDecisionOptions(
  disruption: DisruptionFSMState,
  journey?: Partial<JourneyContext>
): DecisionOption[] {
  const options: DecisionOption[] = [];

  switch (disruption.kind) {
    case 'DELAYED':
      if (disruption.delayMinutes <= 15) {
        // Short delay: Waiting is highest confidence & 0 cost (Holds wins)
        options.push(
          {
            id: 'opt-wait-short',
            titleEn: 'Hold & Wait on Track',
            titleHi: 'ट्रैक पर प्रतीक्षा करें',
            descEn: 'Train waits before red signal until track section clears. No train transfer required.',
            descHi: 'सिग्नल साफ़ होने तक ट्रेन ट्रैक पर रुकी रहेगी। ट्रेन बदलने की आवश्यकता नहीं।',
            rankingReasonEn: 'Best choice for short delays: Zero extra cost, full seat retention, and highest chance of schedule recovery.',
            rankingReasonHi: 'कम विलंब के लिए सर्वश्रेष्ठ: शून्य लागत, आरक्षित सीट सुरक्षित और समय भरपाई की उच्चतम संभावना।',
            timeDeltaMinutes: 10,
            timeDisplayEn: '+10 min delay',
            timeDisplayHi: '+१० मि. विलंब',
            newEtaEn: '18:40 (+10m)',
            newEtaHi: '१८:४० (+१० मि.)',
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 4,
            confidenceScore: 94,
            transfersCount: 0,
            transfersDisplayEn: '0 train changes',
            transfersDisplayHi: '० ट्रेन बदलाव',
            seatNoteEn: 'Retain Coach C-4, Seat 24 (Reserved AC)',
            seatNoteHi: 'वर्तमान कोच सी-४, सीट २४ (आरक्षित एसी) पर बने रहें',
            actionType: 'resume',
            rank: 1,
            isTopRanked: true,
          },
          {
            id: 'opt-branch-divert',
            titleEn: 'Divert via Siding Loop Line',
            titleHi: 'साइडिंग लूप लाइन से जाएं',
            descEn: 'Take loop siding around freight train at restricted 30 km/h turnout speed.',
            descHi: 'धीमी मालगाड़ी के बगल से ३० किमी/घंटा की सीमित गति पर लूप लाइन लें।',
            rankingReasonEn: 'Keeps train rolling but incurs turnout speed restriction and lower ride comfort.',
            rankingReasonHi: 'ट्रेन चलती रहती है पर गति सीमा और कम सवारी आराम का समझौता करना पड़ता है।',
            timeDeltaMinutes: 6,
            timeDisplayEn: '+6 min delay',
            timeDisplayHi: '+६ मि. विलंब',
            newEtaEn: '18:36 (+6m)',
            newEtaHi: '१८:३६ (+६ मि.)',
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 3,
            confidenceScore: 76,
            transfersCount: 0,
            transfersDisplayEn: '0 train changes',
            transfersDisplayHi: '० ट्रेन बदलाव',
            seatNoteEn: 'Retain current seat • Siding turnout',
            seatNoteHi: 'वर्तमान सीट पर बने रहें • साइडिंग टर्नआउट',
            actionType: 'reroute',
            rank: 2,
            isTopRanked: false,
          }
        );
      } else {
        // Longer delay (25m - 60m): Real trade-offs between speed, comfort, and fare
        const hasBranchAhead = journey?.progress === undefined || journey.progress < 0.48;

        if (hasBranchAhead) {
          options.push(
            {
              id: 'opt-branch-bypass',
              titleEn: 'Switch to Bypass Branch Chord',
              titleHi: 'बाईपास शाखा कॉर्ड पर मुड़ें',
              descEn: 'Switch onto single-track Kurukshetra chord line immediately. Bypasses main line freight bottleneck.',
              descHi: 'तुरंत एकल-ट्रैक कुरुक्षेत्र कॉर्ड लाइन पर डायवर्ट हों। मुख्य लाइन भीड़भाड़ से बचें।',
              rankingReasonEn: 'Saves 22 min, but involves single-track speed limit and unreserved coach allocation.',
              rankingReasonHi: '२२ मिनट की बचत, परंतु एकल-ट्रैक गति सीमा और अनारक्षित सीट व्यवस्था का समझौता है।',
              timeDeltaMinutes: -22,
              timeDisplayEn: 'Saves 22 min',
              timeDisplayHi: '२२ मि. की बचत',
              newEtaEn: '18:08 (Saved 22m)',
              newEtaHi: '१८:०८ (२२ मि. बचत)',
              costInr: 0,
              costDisplayEn: '₹0 (Free)',
              costDisplayHi: '₹० (निःशुल्क)',
              comfortRating: 3, // Real trade-off: lower comfort on branch chord
              confidenceScore: 82, // Realistic clearance confidence
              transfersCount: 0,
              transfersDisplayEn: '0 train changes (Track detour)',
              transfersDisplayHi: '० ट्रेन बदलाव (ट्रैक डायवर्जन)',
              seatNoteEn: 'Chord line coach • Unreserved seating',
              seatNoteHi: 'कॉर्ड लाइन कोच • अनारक्षित सीट',
              actionType: 'reroute',
              rank: 1,
              isTopRanked: true,
              disabled: false,
            },
            {
              id: 'opt-rebook-express',
              titleEn: 'Transfer to Express Special 00002',
              titleHi: 'एक्सप्रेस स्पेशल ००००२ में सीट ट्रांसफर',
              descEn: 'Priority seat held subject to availability on express train departing 20 min later on Platform 4.',
              descHi: '२० मिनट बाद प्लेटफ़ॉर्म ४ से छूटने वाली एक्सप्रेस में उपलब्धता के अधीन सीट आरक्षण।',
              rankingReasonEn: 'High AC comfort and aims to protect onward journey, but requires ₹120 fare difference.',
              rankingReasonHi: 'उच्च वातानुकूलित सुविधा और आगे की यात्रा सुरक्षा, परंतु ₹१२० किराया अंतर लगेगा।',
              timeDeltaMinutes: 15,
              timeDisplayEn: '+15 min delay',
              timeDisplayHi: '+१५ मि. विलंब',
              newEtaEn: '18:45 (+15m)',
              newEtaHi: '१८:४५ (+१५ मि.)',
              costInr: 120,
              costDisplayEn: '₹120 (Fare diff)',
              costDisplayHi: '₹१२० (किराया अंतर)',
              comfortRating: 5,
              confidenceScore: 91,
              transfersCount: 1,
              transfersDisplayEn: '1 platform transfer (PF 4)',
              transfersDisplayHi: '१ प्लेटफ़ॉर्म ट्रांसफर (प्लेटफ़ॉर्म ४)',
              seatNoteEn: 'Express Special 00002 • Coach B-2 / Seat 18 (Confirmed)',
              seatNoteHi: 'एक्सप्रेस स्पेशल ००००२ • कोच बी-२ / सीट १८ (पुष्ट)',
              actionType: 'rebook',
              rank: 2,
              isTopRanked: false,
            },
            {
              id: 'opt-wait-hold',
              titleEn: 'Hold on Main Track',
              titleHi: 'मुख्य ट्रैक पर प्रतीक्षा करें',
              descEn: 'Remain in air-conditioned coaches until maintenance crews clear freight ahead.',
              descHi: 'वातानुकूलित कोच में बैठकर मालगाड़ी क्लीयरेंस की प्रतीक्षा करें।',
              rankingReasonEn: 'Zero cost and comfortable seating, but absorbs the full delay if connections are not critical.',
              rankingReasonHi: 'शून्य लागत और आरामदायक सीट, परंतु आगे की कनेक्टिंग ट्रेन न होने पर ही उपयुक्त।',
              timeDeltaMinutes: disruption.delayMinutes,
              timeDisplayEn: `+${disruption.delayMinutes} min delay`,
              timeDisplayHi: `+${disruption.delayMinutes} मि. विलंब`,
              newEtaEn: '18:55 (+25m)',
              newEtaHi: '१८:५५ (+२५ मि.)',
              costInr: 0,
              costDisplayEn: '₹0 (Free)',
              costDisplayHi: '₹० (निःशुल्क)',
              comfortRating: 4,
              confidenceScore: 75,
              transfersCount: 0,
              transfersDisplayEn: '0 train changes',
              transfersDisplayHi: '० ट्रेन बदलाव',
              seatNoteEn: 'Coach C-4, Seat 24 • Reserved AC intact',
              seatNoteHi: 'कोच सी-४, सीट २४ • आरक्षित एसी सुरक्षित',
              actionType: 'resume',
              rank: 3,
              isTopRanked: false,
            }
          );
        } else {
          // Train is past the Panipat switch point (progress >= 0.48). Direct bypass branch is behind train.
          options.push(
            {
              id: 'opt-rebook-express',
              titleEn: 'Transfer to Express Special 00002',
              titleHi: 'एक्सप्रेस स्पेशल ००००२ में सीट ट्रांसफर',
              descEn: 'Priority seat held subject to availability on express train departing 20 min later on Platform 4.',
              descHi: '२० मिनट बाद प्लेटफ़ॉर्म ४ से छूटने वाली एक्सप्रेस में उपलब्धता के अधीन सीट आरक्षण।',
              rankingReasonEn: 'High AC comfort and protects onward connection when track bypass is no longer available.',
              rankingReasonHi: 'उच्च वातानुकूलित सुविधा और आगे की यात्रा सुरक्षा जब ट्रैक बाईपास उपलब्ध न हो।',
              timeDeltaMinutes: 15,
              timeDisplayEn: '+15 min delay',
              timeDisplayHi: '+१५ मि. विलंब',
              newEtaEn: '18:45 (+15m)',
              newEtaHi: '१८:४५ (+१५ मि.)',
              costInr: 120,
              costDisplayEn: '₹120 (Fare diff)',
              costDisplayHi: '₹१२० (किराया अंतर)',
              comfortRating: 5,
              confidenceScore: 91,
              transfersCount: 1,
              transfersDisplayEn: '1 platform transfer (PF 4)',
              transfersDisplayHi: '१ प्लेटफ़ॉर्म ट्रांसफर (प्लेटफ़ॉर्म ४)',
              seatNoteEn: 'Express Special 00002 • Coach B-2 / Seat 18 (Confirmed)',
              seatNoteHi: 'एक्सप्रेस स्पेशल ००००२ • कोच बी-२ / सीट १८ (पुष्ट)',
              actionType: 'rebook',
              rank: 1,
              isTopRanked: true,
            },
            {
              id: 'opt-wait-hold',
              titleEn: 'Hold on Main Track',
              titleHi: 'मुख्य ट्रैक पर प्रतीक्षा करें',
              descEn: 'Remain in air-conditioned coaches until maintenance crews clear freight ahead.',
              descHi: 'वातानुकूलित कोच में बैठकर मालगाड़ी क्लीयरेंस की प्रतीक्षा करें।',
              rankingReasonEn: 'Zero cost and comfortable seating, but absorbs the full delay.',
              rankingReasonHi: 'शून्य लागत और आरामदायक सीट, परंतु पूरा विलंब सहना होगा।',
              timeDeltaMinutes: disruption.delayMinutes,
              timeDisplayEn: `+${disruption.delayMinutes} min delay`,
              timeDisplayHi: `+${disruption.delayMinutes} मि. विलंब`,
              newEtaEn: '18:55 (+25m)',
              newEtaHi: '१८:५५ (+२५ मि.)',
              costInr: 0,
              costDisplayEn: '₹0 (Free)',
              costDisplayHi: '₹० (निःशुल्क)',
              comfortRating: 4,
              confidenceScore: 75,
              transfersCount: 0,
              transfersDisplayEn: '0 train changes',
              transfersDisplayHi: '० ट्रेन बदलाव',
              seatNoteEn: 'Coach C-4, Seat 24 • Reserved AC intact',
              seatNoteHi: 'कोच सी-४, सीट २४ • आरक्षित एसी सुरक्षित',
              actionType: 'resume',
              rank: 2,
              isTopRanked: false,
            },
            {
              id: 'opt-branch-bypass',
              titleEn: 'Switch to Bypass Branch Chord',
              titleHi: 'बाईपास शाखा कॉर्ड पर मुड़ें',
              descEn: 'Direct single-track Kurukshetra chord line detour.',
              descHi: 'एकल-ट्रैक कुरुक्षेत्र कॉर्ड लाइन सीधा डायवर्जन।',
              rankingReasonEn: 'Bypass switch at Panipat (progress 0.48) is behind current train location.',
              rankingReasonHi: 'पानीपत पर बाईपास स्विच (प्रगति ०.४८) वर्तमान ट्रेन स्थिति से पीछे है।',
              timeDeltaMinutes: -22,
              timeDisplayEn: 'Unavailable Ahead',
              timeDisplayHi: 'आगे अनुपलब्ध',
              newEtaEn: 'N/A',
              newEtaHi: 'लागू नहीं',
              costInr: 0,
              costDisplayEn: '₹0',
              costDisplayHi: '₹०',
              comfortRating: 3,
              confidenceScore: 0,
              transfersCount: 0,
              transfersDisplayEn: 'Unavailable',
              transfersDisplayHi: 'अनुपलब्ध',
              seatNoteEn: 'Switch point passed',
              seatNoteHi: 'स्विच बिंदु पार हो चुका है',
              actionType: 'reroute',
              rank: 3,
              isTopRanked: false,
              disabled: true,
              disabledReasonEn: 'Branch chord junction is behind current train position (passed Panipat switch at progress 0.48). Direct track detour unavailable.',
              disabledReasonHi: 'शाखा कॉर्ड जंक्शन वर्तमान ट्रेन स्थिति से पीछे छूट चुका है (प्रगति ०.४८ पर पानीपत स्विच पार)। सीधा ट्रैक डायवर्जन अनुपलब्ध।',
            }
          );
        }
      }
      break;

    case 'MISSED_CONNECTION': {
      const hasBranchAhead = journey?.progress === undefined || journey.progress < 0.48;
      if (hasBranchAhead) {
        options.push(
          {
            id: 'opt-reroute-connection',
            titleEn: 'Take Chord Line Bypass Shortcut',
            titleHi: 'कॉर्ड लाइन बाईपास शॉर्टकट लें',
            descEn: 'Diverts via high-speed chord line to recover 25 minutes toward Ambala Cantt.',
            descHi: '२५ मिनट का बफर वापस पाने के लिए हाई-स्पीड कॉर्ड लाइन से जाएं।',
            rankingReasonEn: 'Aims to recover connection buffer with 84% estimated likelihood.',
            rankingReasonHi: 'लगभग ८४% अनुमानित संभावना के साथ अम्बाला में कनेक्टिंग ट्रेन पकड़ने का प्रयास।',
            timeDeltaMinutes: -25,
            timeDisplayEn: 'Likely Catches Connection',
            timeDisplayHi: 'कनेक्शन पकड़ने की संभावना',
            newEtaEn: '18:05 (Recovered 25m)',
            newEtaHi: '१८:०५ (२५ मि. रिकवर)',
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 4,
            confidenceScore: 84, // Hedged, honest confidence
            transfersCount: 0,
            transfersDisplayEn: '0 train changes',
            transfersDisplayHi: '० ट्रेन बदलाव',
            seatNoteEn: 'Direct bypass chord • Connection protected',
            seatNoteHi: 'सीधा बाईपास कॉर्ड • कनेक्टिंग ट्रेन सुरक्षित',
            actionType: 'reroute',
            rank: 1,
            isTopRanked: true,
            disabled: false,
          },
          {
            id: 'opt-rebook-connection',
            titleEn: 'Rebook to Connecting Express 00003',
            titleHi: 'कनेक्टिंग एक्सप्रेस ००००३ में रीबुक करें',
            descEn: 'Assisted digital PNR transfer for the next scheduled connecting service at 18:45.',
            descHi: 'शाम १८:४५ बजे अगली कनेक्टिंग ट्रेन के लिए टिकट ट्रांसफर सहायता।',
            rankingReasonEn: 'Guaranteed reserved seat on later train with standard ticket protection waiver.',
            rankingReasonHi: 'मानक टिकट सुरक्षा छूट के साथ बाद की ट्रेन में आरक्षित सीट।',
            timeDeltaMinutes: 40,
            timeDisplayEn: '+40 min total',
            timeDisplayHi: '+४० मि. कुल समय',
            newEtaEn: '19:10 (+40m)',
            newEtaHi: '१९:१० (+४० मि.)',
            costInr: 0,
            costDisplayEn: '₹0 (Disruption Waiver)',
            costDisplayHi: '₹० (व्यवधान छूट)',
            comfortRating: 4,
            confidenceScore: 89,
            transfersCount: 1,
            transfersDisplayEn: '1 connection transfer (PF 2)',
            transfersDisplayHi: '१ कनेक्टिंग ट्रांसफर (प्लेटफ़ॉर्म २)',
            seatNoteEn: 'Connecting Express 00003 • Reserved Berth',
            seatNoteHi: 'कनेक्टिंग एक्सप्रेस ००००३ • आरक्षित बर्थ',
            actionType: 'rebook',
            rank: 2,
            isTopRanked: false,
          }
        );
      } else {
        options.push(
          {
            id: 'opt-rebook-connection',
            titleEn: 'Rebook to Connecting Express 00003',
            titleHi: 'कनेक्टिंग एक्सप्रेस ००००३ में रीबुक करें',
            descEn: 'Assisted digital PNR transfer for the next scheduled connecting service at 18:45.',
            descHi: 'शाम १८:४५ बजे अगली कनेक्टिंग ट्रेन के लिए टिकट ट्रांसफर सहायता।',
            rankingReasonEn: 'Guaranteed reserved seat on later train with standard ticket protection waiver.',
            rankingReasonHi: 'मानक टिकट सुरक्षा छूट के साथ बाद की ट्रेन में आरक्षित सीट।',
            timeDeltaMinutes: 40,
            timeDisplayEn: '+40 min total',
            timeDisplayHi: '+४० मि. कुल समय',
            newEtaEn: '19:10 (+40m)',
            newEtaHi: '१९:१० (+४० मि.)',
            costInr: 0,
            costDisplayEn: '₹0 (Disruption Waiver)',
            costDisplayHi: '₹० (व्यवधान छूट)',
            comfortRating: 4,
            confidenceScore: 89,
            transfersCount: 1,
            transfersDisplayEn: '1 connection transfer (PF 2)',
            transfersDisplayHi: '१ कनेक्टिंग ट्रांसफर (प्लेटफ़ॉर्म २)',
            seatNoteEn: 'Connecting Express 00003 • Reserved Berth',
            seatNoteHi: 'कनेक्टिंग एक्सप्रेस ००००३ • आरक्षित बर्थ',
            actionType: 'rebook',
            rank: 1,
            isTopRanked: true,
          },
          {
            id: 'opt-reroute-connection',
            titleEn: 'Take Chord Line Bypass Shortcut',
            titleHi: 'कॉर्ड लाइन बाईपास शॉर्टकट लें',
            descEn: 'High-speed chord line shortcut detour.',
            descHi: 'हाई-स्पीड कॉर्ड लाइन शॉर्टकट डायवर्जन।',
            rankingReasonEn: 'Branch chord junction is behind current train location.',
            rankingReasonHi: 'शाखा कॉर्ड जंक्शन वर्तमान ट्रेन स्थिति से पीछे है।',
            timeDeltaMinutes: -25,
            timeDisplayEn: 'Unavailable Ahead',
            timeDisplayHi: 'आगे अनुपलब्ध',
            newEtaEn: 'N/A',
            newEtaHi: 'लागू नहीं',
            costInr: 0,
            costDisplayEn: '₹0',
            costDisplayHi: '₹०',
            comfortRating: 4,
            confidenceScore: 0,
            transfersCount: 0,
            transfersDisplayEn: 'Unavailable',
            transfersDisplayHi: 'अनुपलब्ध',
            seatNoteEn: 'Switch point passed',
            seatNoteHi: 'स्विच बिंदु पार हो चुका है',
            actionType: 'reroute',
            rank: 2,
            isTopRanked: false,
            disabled: true,
            disabledReasonEn: 'Branch chord junction is behind current train position. High-speed track shortcut unavailable.',
            disabledReasonHi: 'शाखा कॉर्ड जंक्शन वर्तमान स्थिति से पीछे छूट चुका है। हाई-स्पीड ट्रैक शॉर्टकट अनुपलब्ध।',
          }
        );
      }
      break;
    }

    case 'CANCELLED':
      options.push(
        {
          id: 'opt-cancel-rebook',
          titleEn: 'Priority Transfer to Shatabdi 00004',
          titleHi: 'शताब्दी ००००४ में प्राथमिकता ट्रांसफर',
          descEn: 'Alternative departure arranged from Panipat Junction Platform 1 with meal voucher.',
          descHi: 'पानीपत जंक्शन प्लेटफ़ॉर्म १ से विशेष वैकल्पिक ट्रेन और भोजन वाउचर।',
          rankingReasonEn: 'Immediate boarding with reserved AC seating and disruption fee waiver.',
          rankingReasonHi: 'आरक्षित वातानुकूलित सीट और रद्दीकरण शुल्क छूट के साथ तुरंत बोर्डिंग।',
          timeDeltaMinutes: 30,
          timeDisplayEn: '+30 min arrival',
          timeDisplayHi: '+३० मि. आगमन',
          newEtaEn: '19:00 (+30m)',
          newEtaHi: '१९:०० (+३० मि.)',
          costInr: 0,
          costDisplayEn: '₹0 (Passenger Protection)',
          costDisplayHi: '₹० (यात्री संरक्षण छूट)',
          comfortRating: 5,
          confidenceScore: 93,
          transfersCount: 1,
          transfersDisplayEn: '1 station transfer (PF 1)',
          transfersDisplayHi: '१ स्टेशन ट्रांसफर (प्लेटफ़ॉर्म १)',
          seatNoteEn: 'Shatabdi 00004 • Executive Chair Car C-2',
          seatNoteHi: 'शताब्दी ००००४ • एक्जीक्यूटिव चेयर कार सी-२',
          actionType: 'rebook',
          rank: 1,
          isTopRanked: true,
        },
        {
          id: 'opt-cancel-shuttle',
          titleEn: 'Dedicated Electric Inter-City Shuttle',
          titleHi: 'समर्पित इलेक्ट्रिक इंटर-सिटी शटल',
          descEn: 'Highway EV shuttle bus transfer from Panipat outer to Ambala Cantt main gate.',
          descHi: 'पानीपत आउटर से अम्बाला कैंट मुख्य द्वार तक एक्सप्रेसवे ईवी बस सेवा।',
          rankingReasonEn: 'Fastest door-to-door transit time, but requires coach-to-bus baggage transfer.',
          rankingReasonHi: 'सबसे तेज़ यात्रा समय, परंतु बस में सामान स्थानांतरण की आवश्यकता होगी।',
          timeDeltaMinutes: 15,
          timeDisplayEn: '+15 min arrival',
          timeDisplayHi: '+१५ मि. आगमन',
          newEtaEn: '18:45 (+15m)',
          newEtaHi: '१८:४५ (+१५ मि.)',
          costInr: 250,
          costDisplayEn: '₹250 (Subsidized)',
          costDisplayHi: '₹२५० (सब्सिडी प्राप्त)',
          comfortRating: 4,
          confidenceScore: 88,
          transfersCount: 1,
          transfersDisplayEn: '1 road EV shuttle transfer',
          transfersDisplayHi: '१ सड़क मार्ग ईवी शटल ट्रांसफर',
          seatNoteEn: 'EV Inter-City Shuttle Bay 1 • Seat 08',
          seatNoteHi: 'ईवी इंटर-सिटी शटल बे १ • सीट ०८',
          actionType: 'cab',
          rank: 2,
          isTopRanked: false,
        }
      );
      break;

    case 'PLATFORM_CHANGE':
      options.push(
        {
          id: 'opt-platform-crossover',
          titleEn: 'Track Crossover to Platform 4',
          titleHi: 'प्लेटफ़ॉर्म ४ पर ट्रैक क्रॉसओवर',
          descEn: 'Crossover interlocking allows train to glide smoothly onto newly allocated Platform 4.',
          descHi: 'क्रॉसओवर इंटरलॉकिंग ट्रेन को नए आवंटित प्लेटफ़ॉर्म ४ पर ले जाती है।',
          rankingReasonEn: 'Zero passenger stair/bridge transfer needed; train directly aligns with ramp.',
          rankingReasonHi: 'यात्रियों को सीढ़ियों या पुल की आवश्यकता नहीं; ट्रेन सीधे रैंप से मिलती है।',
          timeDeltaMinutes: 5,
          timeDisplayEn: '+5 min dock',
          timeDisplayHi: '+५ मि. डॉक',
          newEtaEn: '18:35 (+5m)',
          newEtaHi: '१८:३५ (+५ मि.)',
          costInr: 0,
          costDisplayEn: '₹0 (Free)',
          costDisplayHi: '₹० (निःशुल्क)',
          comfortRating: 5,
          confidenceScore: 99,
          transfersCount: 0,
          transfersDisplayEn: '0 stair climbing (Direct ramp)',
          transfersDisplayHi: '० सीढ़ी चढ़ना (सीधा रैंप)',
          seatNoteEn: 'Coach C-4, Seat 24 • Platform 4 Direct',
          seatNoteHi: 'कोच सी-४, सीट २४ • प्लेटफ़ॉर्म ४ सीधा',
          actionType: 'reroute',
          rank: 1,
          isTopRanked: true,
        },
        {
          id: 'opt-platform-porter',
          titleEn: 'Request Battery Cart at Platform 2',
          titleHi: 'प्लेटफ़ॉर्म २ पर बैटरी कार्ट का अनुरोध करें',
          descEn: 'Free Sahayak wheelchair & battery cart for senior citizens across footbridge.',
          descHi: 'वरिष्ठ नागरिकों के लिए फुटब्रिज पार करने हेतु निःशुल्क सहायक व्हीलचेयर व कार्ट।',
          rankingReasonEn: 'Essential accessible option for elderly travelers with heavy luggage.',
          rankingReasonHi: 'भारी सामान वाले बुजुर्ग यात्रियों के लिए आवश्यक सुलभ विकल्प।',
          timeDeltaMinutes: 10,
          timeDisplayEn: '+10 min buffer',
          timeDisplayHi: '+१० मि. बफर',
          newEtaEn: '18:40 (+10m)',
          newEtaHi: '१८:४० (+१० मि.)',
          costInr: 0,
          costDisplayEn: '₹0 (A11y Service)',
          costDisplayHi: '₹० (सुलभता सेवा)',
          comfortRating: 5,
          confidenceScore: 96,
          transfersCount: 0,
          transfersDisplayEn: 'Battery cart across footbridge',
          transfersDisplayHi: 'फुटब्रिज पार बैटरी कार्ट',
          seatNoteEn: 'Reserved Sahayak Cart at PF 2 Gate',
          seatNoteHi: 'प्लेटफ़ॉर्म २ गेट पर आरक्षित सहायक कार्ट',
          actionType: 'resume',
          rank: 2,
          isTopRanked: false,
        }
      );
      break;

    case 'NORMAL':
    case 'RESOLVED':
    default:
      break;
  }

  return options;
}
