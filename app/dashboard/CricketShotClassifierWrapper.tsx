"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const CricketShotClassifier = dynamic(() => import("./CricketShotClassifier"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
        <p className="text-gray-600">Loading shot classifier...</p>
      </div>
    </div>
  ),
});

export default function CricketShotClassifierWrapper() {
  return <CricketShotClassifier />;
}
