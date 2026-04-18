'use client';

import { UserStats, ACHIEVEMENTS } from '@/lib/gamification';

interface GamificationPanelProps {
  stats: UserStats;
  levelProgress: { current: number; required: number; percentage: number };
  levelTitle: string;
  newAchievements: string[];
  onClearNewAchievements: () => void;
}

export function GamificationPanel({
  stats,
  levelProgress,
  levelTitle,
  newAchievements,
  onClearNewAchievements,
}: GamificationPanelProps) {
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    stats.achievements.includes(a.id)
  );

  const lockedAchievements = ACHIEVEMENTS.filter(
    (a) => !stats.achievements.includes(a.id)
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Level & XP */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0d9488] mb-3">
          <span className="text-3xl font-bold text-white">{stats.level}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">{levelTitle}</h3>
        <p className="text-gray-400 text-sm">{stats.xp.toLocaleString()} XP</p>
      </div>

      {/* Level Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Level {stats.level}</span>
          <span className="text-gray-400">
            {levelProgress.current} / {levelProgress.required} XP
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] transition-all duration-500"
            style={{ width: `${levelProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-white font-semibold">{stats.streak} Day Streak</p>
            <p className="text-gray-400 text-sm">
              Longest: {stats.longestStreak} days
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#14b8a6]">
            {stats.totalCardsStudied}
          </p>
          <p className="text-gray-400 text-xs">Cards Studied</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#14b8a6]">
            {stats.totalQuizzesTaken}
          </p>
          <p className="text-gray-400 text-xs">Quizzes Taken</p>
        </div>
      </div>

      {/* New Achievements Alert */}
      {newAchievements.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-[#14b8a6]/20 to-[#0d9488]/20 border border-[#14b8a6]/30 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <span className="text-white font-semibold">New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!</span>
          </div>
          <div className="space-y-1">
            {newAchievements.map((id) => {
              const achievement = ACHIEVEMENTS.find((a) => a.id === id);
              return achievement ? (
                <p key={id} className="text-gray-300 text-sm">
                  {achievement.icon} {achievement.name} (+{achievement.xpReward} XP)
                </p>
              ) : null;
            })}
          </div>
          <button
            onClick={onClearNewAchievements}
            className="mt-3 text-xs text-[#14b8a6] hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Achievements */}
      <div>
        <h4 className="text-white font-medium mb-3">
          Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {unlockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-3 bg-[#14b8a6]/10 border border-[#14b8a6]/20 rounded-lg"
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {achievement.name}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {achievement.description}
                </p>
              </div>
              <span className="text-[#14b8a6] text-xs font-medium">
                +{achievement.xpReward} XP
              </span>
            </div>
          ))}
          {lockedAchievements.slice(0, 3).map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg opacity-50"
            >
              <span className="text-2xl grayscale">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-sm font-medium truncate">
                  {achievement.name}
                </p>
                <p className="text-gray-500 text-xs truncate">Locked</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
