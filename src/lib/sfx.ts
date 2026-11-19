import type { Player } from "@/lib/game";

/**
 * A tiny Web Audio "sound kit" — no audio files needed.
 * The context is created lazily on the first click, which keeps
 * mobile browsers happy about autoplay policies.
 */
let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!context) {
      context = new AudioContext();
    }

    if (context.state === "suspended") {
      void context.resume();
    }

    return context;
  } catch {
    return null;
  }
}

type ToneOptions = {
  frequency: number;
  delay?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
};

function tone({
  frequency,
  delay = 0,
  duration = 0.16,
  type = "triangle",
  volume = 0.06,
}: ToneOptions) {
  const audio = getContext();
  if (!audio) return;

  try {
    const start = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  } catch {
    // Audio is a nice-to-have; never let it break the game.
  }
}

export const sfx = {
  place(player: Player) {
    tone({
      frequency: player === "X" ? 587.33 : 493.88,
      duration: 0.14,
      type: "triangle",
      volume: 0.07,
    });
    tone({
      frequency: player === "X" ? 880 : 739.99,
      delay: 0.012,
      duration: 0.08,
      type: "sine",
      volume: 0.025,
    });
  },

  win() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      tone({
        frequency,
        delay: 0.12 + index * 0.085,
        duration: 0.4,
        type: "triangle",
        volume: 0.055,
      });
    });
  },

  draw() {
    tone({ frequency: 392, duration: 0.2, type: "sine", volume: 0.05 });
    tone({
      frequency: 329.63,
      delay: 0.16,
      duration: 0.32,
      type: "sine",
      volume: 0.05,
    });
  },

  newGame() {
    tone({ frequency: 440, duration: 0.08, type: "triangle", volume: 0.045 });
    tone({
      frequency: 659.25,
      delay: 0.06,
      duration: 0.12,
      type: "triangle",
      volume: 0.045,
    });
  },

  toggle() {
    tone({ frequency: 784, duration: 0.07, type: "sine", volume: 0.04 });
  },
};
