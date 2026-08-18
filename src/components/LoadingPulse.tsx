"use client";

import { Lottie } from "lottie-react";
import pulseAnimation from "@/lib/lottie/pulse.json";

export function LoadingPulse({ size = 64 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <Lottie src={pulseAnimation} loop autoplay />
    </div>
  );
}
