import { useEffect, useRef, useState } from 'react';

export default function useSpeechRecognition({ lang = 'ta-IN', continuous = true } = {}) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const stopRequestedRef = useRef(false); // 👈 Add this

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition API not supported");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = lang;
    recognitionRef.current.continuous = continuous;

    recognitionRef.current.onresult = (event) => {
      let result = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        result += event.results[i][0].transcript;
      }
      setTranscript((prev) => prev + result);
    };

    recognitionRef.current.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
      if (!stopRequestedRef.current && continuous) {
        recognitionRef.current.start(); // only restart if not user-stopped
      }
    };

    return () => {
      recognitionRef.current?.stop();
    };
  }, [lang, continuous]);

  const startListening = () => {
    stopRequestedRef.current = false; // 👈 reset stop flag
    setTranscript('');
    setListening(true);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    stopRequestedRef.current = true; // 👈 set stop flag
    setListening(false);
    recognitionRef.current?.stop();
  };

  const resetTranscript = () => setTranscript('');

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript
  };
}
