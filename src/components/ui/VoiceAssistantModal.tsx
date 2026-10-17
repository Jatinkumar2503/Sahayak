'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, AlertCircle } from 'lucide-react';
import { useJourneyStore } from '@/store/journeyStore';
import { translations } from '@/i18n/translations';
import { getDecisionOptions } from '@/engine/decisionEngine';

export function VoiceAssistantModal() {
  const language = useJourneyStore((s) => s.language);
  const setDisruptionType = useJourneyStore((s) => s.setDisruptionType);
  const isVoiceAssistantOpen = useJourneyStore((s) => s.isVoiceAssistantOpen);
  const setVoiceAssistantOpen = useJourneyStore((s) => s.setVoiceAssistantOpen);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [spokenResponse, setSpokenResponse] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const t = translations[language];
  const isHindi = language === 'hi';

  // Feature detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  // Trap focus and restore focus on close
  useEffect(() => {
    if (!isVoiceAssistantOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    const focusTimer = setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopListening();
        setVoiceAssistantOpen(false);
        previousFocusRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isVoiceAssistantOpen, setVoiceAssistantOpen]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setSpokenResponse('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);

        if (event.results[current].isFinal) {
          processVoiceCommand(text);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase();
    let triggeredType: 'delay' | 'cancellation' | 'missed_connection' | 'platform_change' = 'delay';
    let minutes = 25;

    if (text.includes('cancel') || text.includes('halt') || text.includes('रद्द') || text.includes('रोक')) {
      triggeredType = 'cancellation';
    } else if (text.includes('miss') || text.includes('connection') || text.includes('छूट') || text.includes('कनेक्शन')) {
      triggeredType = 'missed_connection';
    } else if (text.includes('platform') || text.includes('प्लेटफ़ॉर्म') || text.includes('बदल')) {
      triggeredType = 'platform_change';
    } else {
      triggeredType = 'delay';
      if (text.includes('10') || text.includes('१०')) minutes = 10;
      else if (text.includes('60') || text.includes('६०')) minutes = 60;
      else minutes = 25;
    }

    setDisruptionType(triggeredType);

    // Get recommendations from decision engine
    const fsmState = {
      kind: (triggeredType === 'delay'
        ? 'DELAYED'
        : triggeredType === 'cancellation'
        ? 'CANCELLED'
        : triggeredType === 'missed_connection'
        ? 'MISSED_CONNECTION'
        : 'PLATFORM_CHANGE') as any,
      delayMinutes: minutes,
      reasonEn: '',
      reasonHi: '',
      timestamp: 0,
    };

    const options = getDecisionOptions(fsmState);
    if (options.length > 0) {
      const top = options[0];
      const answer = isHindi
        ? `सिम्युलेशन सक्रिय: ${top.titleHi}। कारण: ${top.rankingReasonHi}`
        : `Simulation active: ${top.titleEn}. Recommendation: ${top.rankingReasonEn}`;

      setSpokenResponse(answer);
      speakText(answer);
    }
  };

  if (!isVoiceAssistantOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.voiceTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col justify-between min-h-[380px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-extrabold text-white">{t.voiceTitle}</h2>
          </div>
          <button
            onClick={() => {
              stopListening();
              setVoiceAssistantOpen(false);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            aria-label={t.closeModal}
            title={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-4 my-auto py-4">
          {!isSupported ? (
            <div className="flex flex-col items-center gap-2 text-rose-300">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm font-bold">{t.voiceUnsupported}</p>
            </div>
          ) : (
            <>
              {/* Animated Mic Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl focus-visible:ring-4 focus-visible:ring-amber-400 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse scale-110'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 scale-100 hover:scale-105'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                {isListening ? (
                  <Mic className="w-9 h-9" />
                ) : (
                  <MicOff className="w-9 h-9 opacity-80" />
                )}
                {isListening && (
                  <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-75" />
                )}
              </button>

              <div className="flex flex-col items-center gap-1 max-w-xs">
                <p className="text-xs font-semibold text-slate-300">
                  {isListening ? t.voiceListening : t.voicePrompt}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t.voicePrivacyNote}
                </p>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="w-full bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl text-left text-xs font-mono">
                  <span className="text-amber-400 font-bold">{t.voiceRecognized} </span>
                  <span className="text-slate-200">"{transcript}"</span>
                </div>
              )}

              {/* Spoken AI Recommendation Response */}
              {spokenResponse && (
                <div className="w-full bg-emerald-950/60 border border-emerald-500/60 p-3 rounded-2xl text-left text-xs text-emerald-200 flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">{spokenResponse}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-[10px] text-slate-400">
          <span>Web Speech API • SpeechSynthesis</span>
          <span className="font-mono text-amber-400 font-bold">{t.simulatedDataBadge}</span>
        </div>
      </div>
    </div>
  );
}
