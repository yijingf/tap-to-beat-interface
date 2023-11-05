"use client";

import { useEffect, useState } from "react";

type KeyPressedState = {
  [key: string]: boolean;
};

export default function Home() {
  const [isTraining, setIsTraining] = useState(false);
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

  const startTraining = () => {
    setIsTraining(true);
  };

  if (!isTraining) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome to the KeyPress Training App
        </h1>
        <button
          onClick={startTraining}
          className="bg-gray-700 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Start Training
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {!isTraining ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome to the KeyPress Training App
          </h1>
          <button
            onClick={startTraining}
            className="bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-700"
          >
            Start Training
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            KeyPress Recording App
          </h1>
          <button
            onClick={toggleRecording}
            className={`${
              isRecording
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors`}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <ul className="list-disc text-gray-700 mt-4 inline-block text-left">
            {keyPresses.map((time, index) => (
              <li key={index} className="mt-2">
                Key pressed at {time.toFixed(3)} ms
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
