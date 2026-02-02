"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Cat, Trophy, Timer } from "lucide-react";

const funnyPhrases = [
  "No 🙃",
  "Are you sure? 🥺",
  "That would break a kitty's heart 💔🐱",
  "Nice try 😼",
  "Purr-lease say yes! 🐾",
  "Don't be a party pooper 💩",
  "My heart is melting 🫠",
  "Think of the kittens! 🐱",
  "You're making me sad 😿",
  "Last chance! 🎀",
];

type FallingHeart = {
  id: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
};

function FloatingHeart({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute text-2xl pointer-events-none"
      initial={{ y: 100, opacity: 1, x: Math.random() * 100 - 50 }}
      animate={{ y: -200, opacity: 1 }}
      transition={{ duration: 3, delay, ease: "easeOut" }}
      style={{ left: `${Math.random() * 100}%` }}
    >
      💕
    </motion.div>
  );
}

export default function ValentinePage() {
  const [gameState, setGameState] = useState<"intro" | "playing" | "question" | "yes">("intro");
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noRotation, setNoRotation] = useState(0);
  const [showKitty, setShowKitty] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);

  // Game state
  const [fallingHearts, setFallingHearts] = useState<FallingHeart[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetScore] = useState(5);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Start the game
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setFallingHearts([]);
  };

  // Spawn hearts
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = setInterval(() => {
      setFallingHearts((prev) => {
        if (prev.length >= 8) return prev;
        return [...prev, {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          speed: Math.random() * 0.8 + 0.4,
          emoji: ["💖", "💕", "💗", "💓", "💝"][Math.floor(Math.random() * 5)],
        }];
      });
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Animate falling
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = () => {
      setFallingHearts((prev) =>
        prev
          .map((heart) => ({ ...heart, y: heart.y + heart.speed }))
          .filter((heart) => heart.y < 110)
      );
      if (animationRef.current !== null) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("question");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Check win condition
  useEffect(() => {
    if (score >= targetScore && gameState === "playing") {
      setGameState("question");
    }
  }, [score, targetScore, gameState]);

  const catchHeart = (id: number) => {
    setFallingHearts((prev) => prev.filter((h) => h.id !== id));
    setScore((prev) => prev + 1);
  };

  const handleNoHover = useCallback(() => {
    const newAttempts = noAttempts + 1;
    setNoAttempts(newAttempts);

    const width = window.innerWidth - 200;
    const height = window.innerHeight - 200;

    setNoPosition({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
    });

    setNoRotation(Math.random() * 360);

    if (newAttempts > 2 && Math.random() > 0.5) {
      setShowKitty(true);
      setTimeout(() => setShowKitty(false), 1500);
    }
  }, [noAttempts]);

  const handleYesClick = () => {
    setHearts(Array.from({ length: 20 }, (_, i) => Date.now() + i));
    setGameState("yes");
  };

  // Success screen
  if (gameState === "yes") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-8 overflow-hidden relative">
        <AnimatePresence>
          {hearts.map((heart, i) => (
            <FloatingHeart key={heart} delay={i * 0.1} />
          ))}
        </AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="mb-6"
          >
            <span className="text-8xl">💖Nisha Sheraz💖</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-pink-600 mb-4">Yay! 💖</h1>
          <p className="text-2xl md:text-3xl text-pink-500 font-medium">
            You made this kitty so happy!
          </p>
          <p className="text-2xl md:text-3xl text-pink-500 font-medium">
            Thank you, my Janeman!
          </p>
          <motion.div
            className="mt-8"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Heart className="w-24 h-24 text-pink-500 mx-auto fill-pink-400" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Mini-game screen
  if (gameState === "playing") {
    return (
      <div ref={gameAreaRef} className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 overflow-hidden relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center">
          <div className="bg-white/80 backdrop-blur rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-400" />
            <span className="text-2xl font-bold text-pink-600">{score}/{targetScore}</span>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
            <Timer className="w-6 h-6 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">{timeLeft}s</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute top-24 left-0 right-0 text-center z-10">
          <p className="text-xl text-pink-600 font-medium">Catch {targetScore} hearts to unlock the question! 💕</p>
        </div>

        {/* Falling Hearts */}
        <AnimatePresence>
          {fallingHearts.map((heart) => (
            <motion.button
              key={heart.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => catchHeart(heart.id)}
              className="absolute text-4xl cursor-pointer hover:scale-125 transition-transform z-10"
              style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
              }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              {heart.emoji}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Score popup */}
        <AnimatePresence>
          {score > 0 && (
            <motion.div
              key={score}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -50 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-pink-500 pointer-events-none z-30"
            >
              +1 💕
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Intro screen
  if (gameState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-8 overflow-hidden relative">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center max-w-xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🐱💕
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-4">
            Ready to Play?
          </h1>
          <p className="text-xl text-pink-500 mb-8">
            Catch {targetScore} falling hearts before time runs out to unlock a special surprise! 💘
          </p>
          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-2xl font-bold px-12 py-5 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            Start Game 🎮
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main question screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-8 overflow-hidden relative">
      {showKitty && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute text-6xl text-pink-600 pointer-events-none z-20 top-1/2 left-1/2"
        >
          Bobo..? Please
        </motion.div>
      )}

      <div className="text-center max-w-2xl relative z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <motion.div
            className="flex justify-center mb-4"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <p className="text-xl text-pink-500 mb-2">You caught {score} hearts! 🎉</p>
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            💕Nisha Ch💕
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-pink-600 mb-2">
            Will you be my Valentine? 💘
          </h1>
          <motion.div className="flex justify-center gap-2 mt-4" animate={{ x: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}>
            {[...Array(5)].map((_, i) => (
              <Sparkles key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <motion.button
            onClick={handleYesClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
            className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-xl md:text-2xl font-bold px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="flex items-center gap-2">Yes 💖 <Cat className="w-6 h-6" /></span>
          </motion.button>

          <motion.button
            onMouseEnter={handleNoHover}
            onClick={handleNoHover}
            animate={{ x: noPosition.x, y: noPosition.y, scale: 1, rotate: noRotation }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 0.9 }}
            className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 text-lg md:text-xl font-semibold px-8 py-4 rounded-full shadow-md"
          >
            {funnyPhrases[Math.min(noAttempts, funnyPhrases.length - 1)]}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex justify-center gap-4 text-4xl"
        >
          {["🎀", "💝", "🌸", "✨", "💕"].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
