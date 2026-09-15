"use client";

import { motion } from "framer-motion";
import { RadarGraphic } from "@/components/radar-graphic";

export function ScanGlobe() {
  return (
    <div className="relative mx-auto h-64 w-64">
      <div className="absolute inset-6 rounded-full border border-cyan-400/20 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.15),transparent_55%)]" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 opacity-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse
            key={`e-${i}`}
            cx="100"
            cy="100"
            rx={20 + i * 12}
            ry="78"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.25"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse
            key={`h-${i}`}
            cx="100"
            cy={40 + i * 24}
            rx="78"
            ry="8"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.2"
          />
        ))}
      </svg>
      <div className="absolute inset-0">
        <RadarGraphic />
      </div>
      <motion.div
        className="pointer-events-none absolute inset-8 rounded-full border border-cyan-300/40"
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
    </div>
  );
}
