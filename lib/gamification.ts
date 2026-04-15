// Gamification types and utilities

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalCardsStudied: number;
  totalQuizzesTaken: number;
  totalTimeSpent: number; // in minutes
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Study for the first time',
    icon: '🎯',
    xpReward: 10,
    condition: (stats) => stats.totalCardsStudied >= 1,
  },
  {
    id: 'study_streak_3',
    name: 'On Fire',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    xpReward: 50,
    condition: (stats) => stats.streak >= 3,
  },
  {
    id: 'study_streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '⚡',
    xpReward: 100,
    condition: (stats) => stats.streak >= 7,
  },
  {
    id: 'study_streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day study streak',
    icon: '🏆',
    xpReward: 500,
    condition: (stats) => stats.streak >= 30,
  },
  {
    id: 'card_master_100',
    name: 'Century Club',
    description: 'Study 100 flashcards',
    icon: '📚',
    xpReward: 100,
    condition: (stats) => stats.totalCardsStudied >= 100,
  },
  {
    id: 'card_master_500',
    name: 'Flashcard Fanatic',
    description: 'Study 500 flashcards',
    icon: '🧠',
    xpReward: 300,
    condition: (stats) => stats.totalCardsStudied >= 500,
  },
  {
    id: 'quiz_master_10',
    name: 'Quiz Whiz',
    description: 'Complete 10 quizzes',
    icon: '✅',
    xpReward: 100,
    condition: (stats) => stats.totalQuizzesTaken >= 10,
  },
  {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get 100% on a quiz',
    icon: '💯',
    xpReward: 50,
    condition: () => false, // Set when perfect score achieved
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10 PM',
    icon: '🦉',
    xpReward: 25,
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 22 || hour < 5;
    },
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 7 AM',
    icon: '🌅',
    xpReward: 25,
    condition: () => new Date().getHours() < 7,
  },
];

export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 100;

export function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
}

export function xpForNextLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export function getLevelProgress(xp: number): { current: number; required: number; percentage: number } {
  const level = calculateLevel(xp);
  const xpForCurrentLevel = (level - 1) * XP_PER_LEVEL;
  const xpForNext = level * XP_PER_LEVEL;
  const current = xp - xpForCurrentLevel;
  const required = xpForNext - xpForCurrentLevel;
  const percentage = Math.min((current / required) * 100, 100);
  
  return { current, required, percentage };
}

export function checkAndUpdateStreak(lastStudyDate: string | null): { newStreak: number; streakContinued: boolean } {
  if (!lastStudyDate) {
    return { newStreak: 1, streakContinued: true };
  }

  const lastDate = new Date(lastStudyDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare dates only
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (lastDate.getTime() === today.getTime()) {
    // Already studied today
    return { newStreak: -1, streakContinued: false }; // -1 means no change
  }

  if (lastDate.getTime() === yesterday.getTime()) {
    // Streak continues
    return { newStreak: -1, streakContinued: true }; // Will be incremented by caller
  }

  // Streak broken
  return { newStreak: 1, streakContinued: false };
}

export function getUnlockedAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      achievement.condition(stats) && !stats.achievements.includes(achievement.id)
  );
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice Learner',
  5: 'Study Apprentice',
  10: 'Knowledge Seeker',
  20: 'Scholar',
  30: 'Academic',
  40: 'Intellectual',
  50: 'Master Scholar',
  75: 'Grandmaster',
  100: 'Legendary Learner',
};

export function getLevelTitle(level: number): string {
  const levels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const l of levels) {
    if (level >= l) {
      return LEVEL_TITLES[l];
    }
  }
  
  return LEVEL_TITLES[1];
}
