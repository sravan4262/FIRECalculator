"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  emoji: string;
  x: number;   // end x offset from center (vw-relative %)
  y: number;   // end y offset
  rotate: number;
  scale: number;
  delay: number;
}

const EMOJIS = ["🔥", "💰", "✨", "⭐", "🎉", "💎", "🚀", "🏄", "🥂"];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
    const dist = 120 + Math.random() * 180;
    return {
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 60,  // bias upward
      rotate: (Math.random() - 0.5) * 720,
      scale: 0.6 + Math.random() * 0.8,
      delay: Math.random() * 0.3,
    };
  });
}

interface Props {
  fireAge: number | null;
}

export function FireCelebration({ fireAge }: Props) {
  const [particles] = useState(() => makeParticles(18));
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (fireAge === null) return;
    // Small delay so the stat cards finish animating first
    const t = setTimeout(() => setActive(true), 800);
    // Remove after animation completes
    const t2 = setTimeout(() => setActive(false), 3200);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [fireAge]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute text-xl select-none"
            style={{ fontSize: `${p.scale * 1.4}rem` }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [1, 1, 0],
              rotate: p.rotate,
              scale: [0, p.scale, p.scale * 0.5],
            }}
            transition={{
              duration: 1.8,
              delay: p.delay,
              ease: [0.2, 0.6, 0.4, 1],
              opacity: { times: [0, 0.6, 1] },
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Central flash ring */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border-2 border-primary"
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-gold/20"
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />
    </div>
  );
}
