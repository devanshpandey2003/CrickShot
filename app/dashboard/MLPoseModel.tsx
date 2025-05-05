"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button"; // Keep this if you have button component

declare global {
  interface Window {
    tmPose: any;
  }
}

export default function MLPoseModel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [scriptsReady, setScriptsReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/9f-aDAH58/";

  const handleScriptsLoaded = () => {
    if (window.tmPose) {
      setScriptsReady(true);
    } else {
      setError("Failed to load ML libraries.");
    }
  };

  const initModel = async () => {
    try {
      if (!window.tmPose) {
        throw new Error("ML libraries not ready.");
      }

      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";

      modelRef.current = await window.tmPose.load(modelURL, metadataURL);

      const size = 300;
      webcamRef.current = new window.tmPose.Webcam(size, size, true);
      await webcamRef.current.setup();
      await webcamRef.current.play();

      if (canvasRef.current) {
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        ctxRef.current = canvasRef.current.getContext("2d");
      }

      setModelLoaded(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Initialization error.");
    }
  };

  const start = async () => {
    setError(null);
    if (!scriptsReady) {
      setError("Scripts not loaded yet.");
      return;
    }
    if (!modelLoaded) {
      await initModel();
    }
    setRunning(true);
    loop();
  };

  const stop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (webcamRef.current) {
      webcamRef.current.stop();
      webcamRef.current = null;
    }
    setRunning(false);
  };

  const loop = async () => {
    if (!running || !webcamRef.current) return;
    webcamRef.current.update();
    await predict();
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const predict = async () => {
    if (!modelRef.current || !webcamRef.current || !ctxRef.current) return;

    const { pose, posenetOutput } = await modelRef.current.estimatePose(webcamRef.current.canvas);
    const prediction = await modelRef.current.predict(posenetOutput);

    const highestPrediction = prediction.reduce(
      (max: any, p: any) => (p.probability > max.probability ? p : max),
      prediction[0]
    );

    if (labelRef.current) {
      labelRef.current.innerText = `${highestPrediction.className}: ${highestPrediction.probability.toFixed(2)}`;
    }

    drawPose(pose);
  };

  const drawPose = (pose: any) => {
    if (!ctxRef.current || !webcamRef.current?.canvas) return;

    ctxRef.current.drawImage(webcamRef.current.canvas, 0, 0);

    if (pose) {
      const minConfidence = 0.5;
      window.tmPose.drawKeypoints(pose.keypoints, minConfidence, ctxRef.current);
      window.tmPose.drawSkeleton(pose.keypoints, minConfidence, ctxRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-gray-900 text-white p-4 rounded-lg">
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log("TensorFlow.js loaded")}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"
        strategy="beforeInteractive"
        onLoad={handleScriptsLoaded}
      />

      {error && (
        <div className="bg-red-500/20 text-red-400 p-2 mb-4 rounded w-full text-center text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <Button
          onClick={start}
          disabled={running || !scriptsReady}
          className="bg-green-600 hover:bg-green-700"
        >
          {scriptsReady ? "Start Camera" : "Loading Scripts..."}
        </Button>
        <Button
          onClick={stop}
          disabled={!running}
          variant="destructive"
        >
          Stop Camera
        </Button>
      </div>

      <div className="border-4 border-primary rounded-lg overflow-hidden mb-4">
        <canvas ref={canvasRef} className="w-[300px] h-[300px] bg-black" />
      </div>

      <div ref={labelRef} className="text-lg font-semibold text-yellow-400 h-8" />

      {!running && (
        <p className="text-xs text-gray-400 mt-4">Click "Start Camera" and allow access to your camera.</p>
      )}
    </div>
  );
}
