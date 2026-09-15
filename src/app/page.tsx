"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, AudioLines, FileText, ImageIcon } from "lucide-react";
import { RadarGraphic } from "@/components/radar-graphic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const stats = [
  {
    value: "2.5B+",
    label: "images reposted without credit every year",
  },
  {
    value: "1 in 3",
    label: "songs remixed or sampled without a license",
  },
  {
    value: "60%",
    label: "of online articles contain plagiarized passages",
  },
];

const features = [
  {
    icon: ImageIcon,
    title: "Image Protection",
    body: "Perceptual hashing catches cropped, filtered, and color-graded copies — not just exact pixels.",
  },
  {
    icon: AudioLines,
    title: "Audio Protection",
    body: "Spectrogram fingerprinting surfaces remixed, sped-up, and clipped versions of your tracks.",
  },
  {
    icon: FileText,
    title: "Text Protection",
    body: "NLP embeddings flag paraphrased and translated plagiarism, not only copy-paste theft.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 md:grid-cols-2 md:pt-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300"
          >
            Copyright intelligence
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl font-semibold tracking-tight text-white md:text-6xl"
          >
            Upload. Scan. Protect.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-md text-lg text-zinc-400"
          >
            AI-powered copyright watchdog for images, audio & text
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Button asChild size="lg">
              <Link href="/upload">
                Start Protecting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <RadarGraphic />
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-zinc-500">
          The problem
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full p-6">
                <div className="text-3xl font-semibold text-cyan-300">{s.value}</div>
                <p className="mt-2 text-sm text-zinc-400">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-zinc-500">
          Coverage
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full p-6">
                <f.icon className="mb-4 h-6 w-6 text-cyan-300" />
                <h3 className="text-lg font-medium text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
