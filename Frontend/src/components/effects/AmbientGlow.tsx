import { motion } from "framer-motion";
import { usePlayerStore } from "../../store/playerStore";

/**
 * Ambient glow layer.
 * Uses framer-motion to animate three blurred orbs behind content.
 * Colors react to the current song's extracted palette.
 * Fixed full-viewport, pointer-events-none.
 */
export function AmbientGlow() {
  const ambient = usePlayerStore((s) => s.ambient);

  // Fallback defaults (indigo / fuchsia / sky)
  const colors = ambient ?? {
    a: "rgb(99 102 241)",
    b: "rgb(217 70 239)",
    c: "rgb(56 189 248)",
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* Orb A — top-left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          top: "-15vw",
          left: "-15vw",
          background: `radial-gradient(circle at 30% 30%, ${colors.a} 0%, transparent 70%)`,
          filter: "blur(80px)",
          opacity: 0.55,
          willChange: "transform, background",
          transition: "background 1.2s ease-out",
        }}
        animate={{
          x: [0, 60, -20, 0],
          y: [0, 80, 40, 0],
          scale: [1, 1.15, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb B — bottom-right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "65vw",
          height: "65vw",
          bottom: "-20vw",
          right: "-15vw",
          background: `radial-gradient(circle at 70% 70%, ${colors.b} 0%, transparent 70%)`,
          filter: "blur(90px)",
          opacity: 0.5,
          willChange: "transform, background",
          transition: "background 1.2s ease-out",
        }}
        animate={{
          x: [0, -80, 30, 0],
          y: [0, -60, -20, 0],
          scale: [1, 1.1, 1.05, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb C — center accent */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          top: "35%",
          left: "40%",
          background: `radial-gradient(circle at 50% 50%, ${colors.c} 0%, transparent 70%)`,
          filter: "blur(100px)",
          opacity: 0.3,
          willChange: "transform, background",
          transition: "background 1.2s ease-out",
        }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.2, 1.05, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}