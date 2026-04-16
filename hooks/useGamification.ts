'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { UserStats, getUnlockedAchievements, calculateLevel, getLevelProgress, getLevelTitle, XP_PER_LEVEL } from '@/lib/gamification';

const STORAGE_KEY = 'villageprep_stats';

export function useGamification() {
  const [stats, setStats] = useState<UserStats>(() => {
    return {
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      totalCardsStudied: 0,
      totalQuizzesTaken: 0,
      totalTimeSpent: 0,
      achievements: [],
    };
  });

  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const isInitializedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;
    
    isInitializedRef.current = true;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage when stats change
  useEffect(() => {
    if (!isInitializedRef.current || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage errors
    }
  }, [stats]);

  const addXP = useCallback((amount: number) => {
    setStats((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  }, []);

  const recordStudySession = useCallback(() => {
    setStats((prev) => {
      const today = new Date().toISOString().split('T')[0];
      
      if (prev.lastStudyDate === today) {
        return prev; // Already studied today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (prev.lastStudyDate === yesterdayStr) {
        newStreak = prev.streak + 1;
      }

      return {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastStudyDate: today,
      };
    });
  }, []);

  const recordCardsStudied = useCallback((count: number) => {
    setStats((prev) => ({
      ...prev,
      totalCardsStudied: prev.totalCardsStudied + count,
    }));
    addXP(count * 5); // 5 XP per card
  }, [addXP]);

  const recordQuizCompleted = useCallback((score: number, total: number) => {
    setStats((prev) => ({
      ...prev,
      totalQuizzesTaken: prev.totalQuizzesTaken + 1,
    }));
    
    // XP based on score percentage
    const percentage = score / total;
    let xp = Math.floor(percentage * 50); // Max 50 XP per quiz
    if (percentage === 1) xp += 25; // Bonus for perfect score
    
    addXP(xp);
  }, [addXP]);

  const unlockAchievement = useCallback((achievementId: string, xpReward: number) => {
    setStats((prev) => {
      if (prev.achievements.includes(achievementId)) {
        return prev;
      }
      
      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
      };
    });
    
    addXP(xpReward);
    setNewAchievements((prev) => [...prev, achievementId]);
  }, [addXP]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const checkAchievements = useCallback(() => {
    const unlocked = getUnlockedAchievements(stats);
    unlocked.forEach((achievement) => {
      unlockAchievement(achievement.id, achievement.xpReward);
    });
  }, [stats, unlockAchievement]);

  const levelProgress = getLevelProgress(stats.xp);
  const levelTitle = getLevelTitle(stats.level);

  return {
    stats,
    levelProgress,
    levelTitle,
    newAchievements,
    addXP,
    recordStudySession,
    recordCardsStudied,
    recordQuizCompleted,
    unlockAchievement,
    clearNewAchievements,
    checkAchievements,
  };
}
