"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessAnimationProps {
  size?: "sm" | "md" | "lg";
  showConfetti?: boolean;
}

export function SuccessAnimation({
  size = "md",
  showConfetti = false,
}: SuccessAnimationProps) {
  const [showCheck, setShowCheck] = useState(false);
  const [confetti, setConfetti] = useState<
    Array<{ id: number; delay: number }>
  >([]);

  useEffect(() => {
    // Show check icon after a short delay
    const timer = setTimeout(() => {
      setShowCheck(true);
    }, 300);

    // Generate confetti particles if enabled
    if (showConfetti) {
      const particles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2000,
      }));
      setConfetti(particles);
    }

    return () => clearTimeout(timer);
  }, [showConfetti]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${particle.delay}ms`,
                animationDuration: `${1000 + Math.random() * 1000}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon Container */}
      <div className="relative">
        <div
          className={`${
            sizeClasses[size]
          } bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ${
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <CheckCircle
            className={`${
              iconSizes[size]
            } text-green-500 transition-all duration-300 ${
              showCheck ? "animate-pulse" : ""
            }`}
          />
        </div>

        {/* Ripple Effects */}
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} bg-green-200 rounded-full animate-ping opacity-20`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} bg-green-100 rounded-full animate-ping opacity-10`}
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
}
