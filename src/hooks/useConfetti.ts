import { useCallback } from "react";
import confetti from "canvas-confetti";

export const useConfetti = () => {
  const fireConfetti = useCallback(() => {
    // Fire from left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#8B4513', '#D4AF37', '#FF6B6B', '#4ECDC4', '#FFE66D']
    });

    // Fire from right
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#8B4513', '#D4AF37', '#FF6B6B', '#4ECDC4', '#FFE66D']
    });

    // Fire from center after a delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#8B4513', '#D4AF37', '#FF6B6B', '#4ECDC4', '#FFE66D']
      });
    }, 200);
  }, []);

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star']
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle']
    });
  }, []);

  return { fireConfetti, fireStars };
};
