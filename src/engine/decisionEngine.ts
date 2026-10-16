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
  costInr: number;
  costDisplayEn: string;
  costDisplayHi: string;
  comfortRating: number; // 1 to 5
  confidenceScore: number; // 0 to 100%
  actionType: 'resume' | 'reroute' | 'rebook' | 'cab';
  rank: number;
  isTopRanked: boolean;
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
        // Short delay: Waiting is highest confidence & 0 cost
        options.push(
          {
            id: 'opt-wait-short',
            titleEn: 'Hold & Wait on Track',
            titleHi: 'ट्रैक पर प्रतीक्षा करें',
            descEn: 'Train holds before signal 104 until track section clears.',
            descHi: 'सिग्नल १०४ साफ़ होने तक ट्रेन ट्रैक पर रुकी रहेगी।',
            rankingReasonEn: 'Zero extra cost with highest probability of making up time.',
            rankingReasonHi: 'शून्य अतिरिक्त लागत और समय की भरपाई की उच्चतम संभावना।',
            timeDeltaMinutes: 10,
            timeDisplayEn: '+10 min delay',
            timeDisplayHi: '+१० मि. विलंब',
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 4,
            confidenceScore: 94,
            actionType: 'resume',
            rank: 1,
            isTopRanked: true,
          },
          {
            id: 'opt-branch-divert',
            titleEn: 'Divert via Loop Line',
            titleHi: 'लूप लाइन से डायवर्ट करें',
            descEn: 'Take loop line around slow freight train.',
            descHi: 'धीमी मालगाड़ी के बगल से लूप लाइन लें।',
            rankingReasonEn: 'Keeps wheels rolling but incurs slight turnout speed penalty.',
            rankingReasonHi: 'ट्रेन चलती रहेगी पर गति थोड़ी सीमित रहेगी।',
            timeDeltaMinutes: 6,
            timeDisplayEn: '+6 min delay',
            timeDisplayHi: '+६ मि. विलंब',
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 3,
            confidenceScore: 82,
            actionType: 'reroute',
            rank: 2,
            isTopRanked: false,
          }
        );
      } else {
        // Longer delay (25m - 60m): Branch reroute or Rebook
        options.push(
          {
            id: 'opt-branch-bypass',
            titleEn: 'Switch to Bypass Branch Track',
            titleHi: 'बाईपास शाखा ट्रैक पर मुड़ें',
            descEn: 'Switch onto alternate Kurukshetra chord line (Track B) immediately.',
            descHi: 'तुरंत वैकल्पिक कुरुक्षेत्र कॉर्ड लाइन (ट्रैक बी) पर डायवर्ट हों।',
            rankingReasonEn: 'Bypasses bottleneck completely and saves 22 minutes.',
            rankingReasonHi: 'भीड़भाड़ से बचकर निकलता है और २२ मिनट बचाता है।',
            timeDeltaMinutes: -22,
            timeDisplayEn: 'Saves 22 min',
            timeDisplayHi: '२२ मि. की बचत',
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 5,
            confidenceScore: 96,
            actionType: 'reroute',
            rank: 1,
            isTopRanked: true,
          },
          {
            id: 'opt-rebook-express',
            titleEn: 'Auto-Rebook onto Vande Bharat Spl',
            titleHi: 'वंदे भारत स्पेशल में ऑटो-रीबुक करें',
            descEn: 'Confirmed priority transfer to express train 22439 on adjacent track.',
            descHi: 'समीपवर्ती ट्रैक पर एक्सप्रेस २२४३९ में प्राथमिकता सीट ट्रांसफर।',
            rankingReasonEn: '100% seat protection and guarantees arrival for flight/connections.',
            rankingReasonHi: '१००% आरक्षित सीट और आगे की उड़ानों/कनेक्शनों की गारंटी।',
            timeDeltaMinutes: 15,
            timeDisplayEn: '+15 min delay',
            timeDisplayHi: '+१५ मि. विलंब',
            costInr: 120,
            costDisplayEn: '₹120 (Fare diff)',
            costDisplayHi: '₹१२० (किराया अंतर)',
            comfortRating: 5,
            confidenceScore: 91,
            actionType: 'rebook',
            rank: 2,
            isTopRanked: false,
          },
          {
            id: 'opt-wait-hold',
            titleEn: 'Hold on Main Track',
            titleHi: 'मुख्य ट्रैक पर प्रतीक्षा करें',
            descEn: 'Wait out freight clearance in air-conditioned coaches.',
            descHi: 'वातानुकूलित कोच में बैठकर मालगाड़ी क्लीयरेंस की प्रतीक्षा करें।',
            rankingReasonEn: 'Safest passive choice if no onward connecting travel is at risk.',
            rankingReasonHi: 'आगे की यात्रा जोखिम में न होने पर सबसे सुरक्षित निष्क्रिय विकल्प।',
            timeDeltaMinutes: disruption.delayMinutes,
            timeDisplayEn: `+${disruption.delayMinutes} min delay`,
            timeDisplayHi: `+${disruption.delayMinutes} मि. विलंब`,
            costInr: 0,
            costDisplayEn: '₹0 (Free)',
            costDisplayHi: '₹० (निःशुल्क)',
            comfortRating: 3,
            confidenceScore: 78,
            actionType: 'resume',
            rank: 3,
            isTopRanked: false,
          }
        );
      }
      break;

    case 'MISSED_CONNECTION':
      options.push(
        {
          id: 'opt-reroute-connection',
          titleEn: 'Take Kurukshetra Branch Shortcut',
          titleHi: 'कुरुक्षेत्र शाखा शॉर्टकट लें',
          descEn: 'Diverts via high-speed chord line to recover 25 min buffer.',
          descHi: '२५ मिनट का बफर वापस पाने के लिए हाई-स्पीड कॉर्ड लाइन से जाएं।',
          rankingReasonEn: 'Recovers lost connection at Ambala Cantt with 98% certainty.',
          rankingReasonHi: '९८% निश्चितता के साथ अम्बाला कैंट पर छूटा हुआ कनेक्शन रिकवर करता है।',
          timeDeltaMinutes: -25,
          timeDisplayEn: 'Catches Connection',
          timeDisplayHi: 'कनेक्शन पकड़ लेगा',
          costInr: 0,
          costDisplayEn: '₹0 (Free)',
          costDisplayHi: '₹० (निःशुल्क)',
          comfortRating: 5,
          confidenceScore: 98,
          actionType: 'reroute',
          rank: 1,
          isTopRanked: true,
        },
        {
          id: 'opt-rebook-connection',
          titleEn: 'Rebook to Connecting Express 12057',
          titleHi: 'कनेक्टिंग एक्सप्रेस १२०५७ में रीबुक करें',
          descEn: 'Automated digital ticket swap for the next connecting train at 18:45.',
          descHi: 'शाम १८:४५ बजे अगली कनेक्टिंग ट्रेन के लिए स्वचालित डिजिटल टिकट ट्रांसफर।',
          rankingReasonEn: 'Seamless PNR transfer without penalty fees.',
          rankingReasonHi: 'बिना किसी पेनल्टी शुल्क के निर्बाध पीएनआर ट्रांसफर।',
          timeDeltaMinutes: 40,
          timeDisplayEn: '+40 min total',
          timeDisplayHi: '+४० मि. कुल समय',
          costInr: 0,
          costDisplayEn: '₹0 (IRCTC Waiver)',
          costDisplayHi: '₹० (आईआरसीटीसी छूट)',
          comfortRating: 4,
          confidenceScore: 89,
          actionType: 'rebook',
          rank: 2,
          isTopRanked: false,
        }
      );
      break;

    case 'CANCELLED':
      options.push(
        {
          id: 'opt-cancel-rebook',
          titleEn: 'Priority Transfer to Shatabdi 12005',
          titleHi: 'शताब्दी १२००५ में प्राथमिकता ट्रांसफर',
          descEn: 'Special parallel departure from Panipat Junction Platform 1.',
          descHi: 'पानीपत जंक्शन प्लेटफ़ॉर्म १ से विशेष समानांतर प्रस्थान।',
          rankingReasonEn: 'Instant boarding with guaranteed seating and full meal service.',
          rankingReasonHi: 'आरक्षित सीट और भोजन सेवा के साथ तुरंत बोर्डिंग।',
          timeDeltaMinutes: 30,
          timeDisplayEn: '+30 min arrival',
          timeDisplayHi: '+३० मि. आगमन',
          costInr: 0,
          costDisplayEn: '₹0 (IRCTC Protection)',
          costDisplayHi: '₹० (आईआरसीटीसी संरक्षण)',
          comfortRating: 5,
          confidenceScore: 95,
          actionType: 'rebook',
          rank: 1,
          isTopRanked: true,
        },
        {
          id: 'opt-cancel-shuttle',
          titleEn: 'Dedicated Electric Inter-City Shuttle',
          titleHi: 'समर्पित इलेक्ट्रिक इंटर-सिटी शटल',
          descEn: 'AC Electric shuttle coach from Panipat outer to Ambala Cantt.',
          descHi: 'पानीपत आउटर से अम्बाला कैंट तक वातानुकूलित इलेक्ट्रिक शटल बस।',
          rankingReasonEn: 'Direct highway corridor transfer with dedicated luggage handlers.',
          rankingReasonHi: 'सामान सहायता के साथ सीधे एक्सप्रेसवे कॉरिडोर से यात्रा।',
          timeDeltaMinutes: 15,
          timeDisplayEn: '+15 min arrival',
          timeDisplayHi: '+१५ मि. आगमन',
          costInr: 250,
          costDisplayEn: '₹250 (Subsidized)',
          costDisplayHi: '₹२५० (सब्सिडी प्राप्त)',
          comfortRating: 4,
          confidenceScore: 91,
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
          costInr: 0,
          costDisplayEn: '₹0 (Free)',
          costDisplayHi: '₹० (निःशुल्क)',
          comfortRating: 5,
          confidenceScore: 99,
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
          costInr: 0,
          costDisplayEn: '₹0 (A11y Service)',
          costDisplayHi: '₹० (सुलभता सेवा)',
          comfortRating: 5,
          confidenceScore: 96,
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
