export interface FlashcardProgress {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastReview: Date | null;
}

export type Quality = 0 | 1 | 2 | 3;

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function calculateNextReview(
  quality: Quality,
  current: FlashcardProgress
): FlashcardProgress {
  let { easeFactor, interval, repetitions } = current;

  if (quality < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReview: new Date(),
  };
}

export function getInitialProgress(): FlashcardProgress {
  return {
    easeFactor: DEFAULT_EASE,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(),
    lastReview: null,
  };
}

export function isDueForReview(progress: FlashcardProgress): boolean {
  return new Date() >= progress.nextReview;
}

export function getMasteryLevel(progress: FlashcardProgress): number {
  if (progress.repetitions < 2) return 0;
  if (progress.repetitions < 4) return 25;
  if (progress.repetitions < 6) return 50;
  if (progress.repetitions < 8) return 75;
  return 100;
}