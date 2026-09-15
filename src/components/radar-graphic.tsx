"use client";

import { motion } from "framer-motion";

export function RadarGraphic({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square w-full max-w-md ${className}`}>
      <div className="absolute inset-0 rounded-full bg-cyan-400/5 blur-3xl" />
      <svg viewBox="0 0 200 200" className="relative h-full w-full">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#radarGlow)" />
        {[30, 55, 80].map((r) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.25"
            strokeWidth="0.8"
          />
        ))}
        <line x1="100" y1="12" x2="100" y2="188" stroke="#22d3ee" strokeOpacity="0.15" />
        <line x1="12" y1="100" x2="188" y2="100" stroke="#22d3ee" strokeOpacity="0.15" />
        <motion.g
          style={{ transformOrigin: "100px 100px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <path d="M100 100 L100 20 A80 80 0 0 1 168 68 Z" fill="url(#sweep)" opacity="0.55" />
          <line x1="100" y1="100" x2="100" y2="18" stroke="#67e8f9" strokeWidth="1.5" />
        </motion.g>
        <circle cx="100" cy="100" r="4" fill="#22d3ee" />
        {[
          [132, 64],
          [70, 118],
          [148, 128],
          [58, 62],
        ].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="#22d3ee"
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.4, 1] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
}
