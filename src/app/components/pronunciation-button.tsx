"use client";

import { useEffect, useState } from "react";

export function PronunciationButton() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const britishFemale = voices.find(
        (v) =>
          v.lang === "en-GB" &&
          (v.name.toLowerCase().includes("female") ||
            v.name.includes("Hazel") ||
            v.name.includes("Kate") ||
            v.name.includes("Serena") ||
            v.name.includes("Martha") ||
            v.name.includes("Stephanie"))
      ) || voices.find((v) => v.lang === "en-GB");

      if (britishFemale) {
        setVoice(britishFemale);
      }
    };

    loadVoice();
    speechSynthesis.addEventListener("voiceschanged", loadVoice);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoice);
  }, []);

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance("regolith");
    utterance.rate = 0.8;
    utterance.pitch = 1;
    if (voice) {
      utterance.voice = voice;
    }
    speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      className="inline-block px-3 py-1 text-base text-[#1A1A1A] border border-[#1A1A1A]/20 rounded-full cursor-pointer hover:bg-[#1A1A1A]/5 transition-colors"
    >
      &#x2C8;re-g&#x259;-&#x2CC;lith
    </button>
  );
}
