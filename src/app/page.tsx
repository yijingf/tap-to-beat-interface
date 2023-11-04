"use client";

import { useEffect, useState } from "react";

type KeyPressedState = {
  [key: string]: boolean;
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [keyPresses, setKeyPresses] = useState<number[]>([]);
  const [keyPressed, setKeyPressed] = useState<KeyPressedState>({});
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const recordKeyPress = (event: KeyboardEvent) => {
      if (event.repeat || !isRecording) return;

      const currentTime = performance.now();
      const relativeTime = startTime ? currentTime - startTime : 0;
      setKeyPresses((prevKeyPresses) => [...prevKeyPresses, relativeTime]);
    };

    if (isRecording) {
      window.addEventListener("keydown", recordKeyPress);
    } else {
      window.removeEventListener("keydown", recordKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", recordKeyPress);
    };
  }, [isRecording, startTime]); // Add startTime as a dependency

  const toggleRecording = () => {
    if (isRecording) {
      console.log("Key press times:", keyPresses);
      setKeyPresses([]);
      setKeyPressed({});
      setStartTime(null); // Reset the startTime for the next recording session
    } else {
      setStartTime(performance.now()); // Set the startTime when recording starts
    }
    setIsRecording(!isRecording);
  };

  return (
    <div>
      <h1>KeyPress Recording App</h1>
      <button onClick={toggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <ul>
        {keyPresses.map((time, index) => (
          <li key={index}>Key pressed at {time.toFixed(3)} ms</li>
        ))}
      </ul>
    </div>
  );
}
