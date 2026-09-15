import { GameProgress } from '../types';

const STORAGE_KEY = 'math_escape_room_progress_v1';

const defaultProgress: GameProgress = {
  unlockedLevels: [1],
  completedLevels: [],
  bestTimes: {},
};

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);
    return {
      unlockedLevels: Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.includes(1) 
        ? parsed.unlockedLevels 
        : [1],
      completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
      bestTimes: typeof parsed.bestTimes === 'object' && parsed.bestTimes !== null ? parsed.bestTimes : {},
    };
  } catch (err) {
    console.error('Failed to load progress from storage', err);
    return defaultProgress;
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to storage', err);
  }
}

export function markLevelCompleted(levelId: number, timeSpentSeconds: number): GameProgress {
  const current = loadProgress();
  const nextLevel = levelId + 1;

  const unlocked = new Set(current.unlockedLevels);
  unlocked.add(levelId);
  if (nextLevel <= 5) {
    unlocked.add(nextLevel);
  }

  const completed = new Set(current.completedLevels);
  completed.add(levelId);

  const bestTimes = { ...current.bestTimes };
  if (!bestTimes[levelId] || timeSpentSeconds < bestTimes[levelId]) {
    bestTimes[levelId] = timeSpentSeconds;
  }

  const updated: GameProgress = {
    unlockedLevels: Array.from(unlocked).sort((a, b) => a - b),
    completedLevels: Array.from(completed).sort((a, b) => a - b),
    bestTimes,
  };

  saveProgress(updated);
  return updated;
}

export function resetProgress(): GameProgress {
  saveProgress(defaultProgress);
  return defaultProgress;
}
