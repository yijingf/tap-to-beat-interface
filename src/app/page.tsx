"use client";

import { useEffect, useRef, useState } from "react";

const fileNames = [
  "03.wav",
  "04.wav",
  "05.wav",
  "06.wav",
  "07.wav",
  "08.wav",
  "10.wav",
  "11.wav",
  "12.wav",
  "16.wav",
  "20.wav",
];

const randomizedFileNames = fileNames.sort(() => Math.random() - 0.5);

const shuffleMTandMASS = () =>
  Math.random() > 0.5 ? ["MT", "MASS"] : ["MASS", "MT"];

const phrases = randomizedFileNames.map((filename) => {
  const [first, second] = shuffleMTandMASS(); // Get a randomized order for 'MT' and 'MASS'
  return [
    `phrases/Reference/${filename}`,
    `phrases/Anchor/${filename}`,
    `phrases/${first}/${filename}`,
    `phrases/${second}/${filename}`,
  ];
});

export default function Home() {
  const [stage, setStage] = useState<"start" | "training" | "end">("start");
  const [isRecording, setIsRecording] = useState(false);
  const [keyPresses, setKeyPresses] = useState<Record<string, number[]>>({});

  const [startTime, setStartTime] = useState<number | null>(null);

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>(phrases[0][0]);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [countdown, setCountdown] = useState(5);

  // Define the order of phases and phrases
  const actions = ["PromptCountdown", "Phrase", "Silence"];
  const phases = ["Reference", "Anchor", "MASS", "MT"];

  const audioRef = useRef<HTMLAudioElement>(null);

  // Function to advance to the next phase or phrase
  const advancePhase = () => {
    const nextActionIndex = currentActionIndex + 1;
    const nextPhaseIndex =
      nextActionIndex >= actions.length
        ? currentPhaseIndex + 1
        : currentPhaseIndex;
    const nextPhraseIndex =
      nextPhaseIndex >= phases.length
        ? currentPhraseIndex + 1
        : currentPhraseIndex;

    if (nextActionIndex >= actions.length) {
      setCurrentActionIndex(0);
    } else {
      setCurrentActionIndex(nextActionIndex);
    }

    if (nextPhaseIndex >= phases.length) {
      setCurrentPhaseIndex(0);
    } else {
      setCurrentPhaseIndex(nextPhaseIndex);
    }

    if (nextPhraseIndex >= phrases.length) {
      setStage("end");
    } else {
      setCurrentPhraseIndex(nextPhraseIndex);
    }

    // Set the audio source for the new phase
    setAudioSrc(phrases[currentPhraseIndex][currentPhaseIndex]);
  };

  useEffect(() => {
    // This effect will play/pause the audio based on the audioPlaying state
    if (audioPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (!audioPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [audioPlaying]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;

    if (!actions[currentActionIndex]) {
      return;
    }

    if (actions[currentActionIndex] === "Phrase") {
      setIsRecording(true);
      setStartTime(performance.now());
      setAudioPlaying(true);
      return;
    }

    setIsRecording(false);

    const timeToWait = actions[currentActionIndex] === "Silence" ? 3 : 5;

    countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          advancePhase();
          return timeToWait;
        } else {
          return prevCountdown - 1;
        }
      });
    }, 1000);

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [currentActionIndex]);

  useEffect(() => {
    // When the audio ends, move to the silence phase
    const handleAudioEnd = () => {
      setStartTime(null);
      setAudioPlaying(false); // Stop audio playback

      advancePhase();
      setCountdown(3); // Reset silence duration
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleAudioEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnd);
      }
    };
  }, [audioRef, currentActionIndex]);

  useEffect(() => {
    const recordKeyPress = (event: KeyboardEvent) => {
      if (event.repeat || !isRecording) return;

      const currentTime = performance.now();

      const relativeTime = startTime ? currentTime - startTime : 0;

      setKeyPresses((prevDict) => {
        const key = phrases[currentPhraseIndex][currentPhaseIndex];
        const existingKeyPresses = prevDict[key] || [];
        return {
          ...prevDict,
          [key]: [...existingKeyPresses, relativeTime],
        };
      });
    };

    if (isRecording) {
      window.addEventListener("keydown", recordKeyPress);
    } else {
      window.removeEventListener("keydown", recordKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", recordKeyPress);
    };
  }, [isRecording, startTime]);

  const startTraining = () => {
    setStage("training");
    advancePhase();
  };

  const exportKeyPresses = () => {
    const json = JSON.stringify(keyPresses);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyPresses.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  switch (stage) {
    case "start":
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome to the Tapping Interface
            </h1>
            <button
              onClick={startTraining}
              className="bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-700"
            >
              Start Tapping
            </button>
          </div>
        </div>
      );
    case "training":
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {phrases[currentPhraseIndex][currentPhaseIndex]} <br />
              {actions[currentActionIndex]}
            </h1>

            <audio ref={audioRef} src={audioSrc} preload="auto" />

            <div className="text-3xl font-bold text-gray-800 mb-6">
              {actions[currentActionIndex] === "Phrase"
                ? "Playing music"
                : `Countdown: ${countdown}`}
            </div>
          </div>
        </div>
      );
    case "end":
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Thank you for participating!
            </h1>
            <button
              onClick={exportKeyPresses}
              className="bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-700"
            >
              Export Key Presses
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-700 ml-4"
            >
              Start New Session
            </button>
          </div>
        </div>
      );
  }
}
