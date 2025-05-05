"use client";

import MLPoseModel from "./MLPoseModel";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function CricketShotClassifier() {
  return (
    <Card className="bg-gray-900 p-6 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Shot Detection Camera</CardTitle>
        <CardDescription>Start your webcam and classify cricket shots in real-time!</CardDescription>
      </CardHeader>
      <CardContent>
        <MLPoseModel />
      </CardContent>
    </Card>
  );
}
