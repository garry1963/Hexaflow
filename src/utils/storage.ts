import {
  ActiveGameState,
  Achievement,
  ArchivedPuzzle,
  GameSettings,
  GameStats,
  LevelData,
  PlayerProfile,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'hexaflow_profile_v1',
  STATS: 'hexaflow_stats_v1',
  SETTINGS: 'hexaflow_settings_v1',
  ACTIVE_GAME: 'hexaflow_active_game_v1',
  UNLOCKED_ACHIEVEMENTS: 'hexaflow_achievements_v1',
  PUZZLE_ARCHIVE: 'hexaflow_puzzle_archive_v1',
};

export const INITIAL_PROFILE: PlayerProfile = {
  playerId: 'player_' + Math.random().toString(36).substring(2, 9),
  name: 'Hexa Tactician',
  xp: 0,
  level: 1,
  coins: 250,
  stars: 0,
  completedLevels: {},
  currentLevel: 1,
  dailyStreak: 1,
  lastDailyDate: null,
  weeklyCompleted: false,
  boosters: {
    undo: 5,
    shuffle: 3,
    hammer: 3,
    wild_hex: 2,
    extra_space: 2,
    extra_moves: 2,
  },
  createdAt: new Date().toISOString(),
};

export const INITIAL_STATS: GameStats = {
  totalGamesPlayed: 0,
  totalMoves: 0,
  totalMerges: 0,
  totalCompletedStacks: 0,
  highestCombo: 0,
  highestScore: 0,
  dailyChallengesCompleted: 0,
  currentStreak: 1,
  longestStreak: 1,
  endlessHighScore: 0,
  endlessHighestLevel: 1,
  totalPlayTimeSeconds: 0,
};

export const INITIAL_SETTINGS: GameSettings = {
  musicEnabled: false,
  soundEnabled: true,
  hapticsEnabled: true,
  darkMode: true,
  highContrast: false,
  showAccessibilitySymbols: true,
  showTileCount: true,
  reducedMotion: false,
  confirmRestart: true,
  animationSpeed: 'normal',
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_merge',
    name: 'First Merge',
    description: 'Perform your first hexagonal merge.',
    icon: '✨',
    target: 1,
    current: (stats) => stats.totalMerges,
    rewardCoins: 50,
    rewardXP: 20,
    unlocked: false,
  },
  {
    id: 'stack_builder',
    name: 'Stack Builder',
    description: 'Complete 10 full 10-tile color stacks.',
    icon: '🏗️',
    target: 10,
    current: (stats) => stats.totalCompletedStacks,
    rewardCoins: 100,
    rewardXP: 50,
    unlocked: false,
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Trigger a consecutive combo of 4x or higher.',
    icon: '⚡',
    target: 4,
    current: (stats) => stats.highestCombo,
    rewardCoins: 150,
    rewardXP: 75,
    unlocked: false,
  },
  {
    id: 'puzzle_apprentice',
    name: 'Puzzle Apprentice',
    description: 'Complete 5 campaign levels.',
    icon: '🧩',
    target: 5,
    current: (_, profile) => Object.keys(profile.completedLevels).length,
    rewardCoins: 150,
    rewardXP: 100,
    unlocked: false,
  },
  {
    id: 'star_collector',
    name: 'Star Collector',
    description: 'Earn 15 total stars across campaign levels.',
    icon: '⭐',
    target: 15,
    current: (_, profile) => profile.stars,
    rewardCoins: 200,
    rewardXP: 150,
    unlocked: false,
  },
  {
    id: 'daily_devotee',
    name: 'Daily Devotee',
    description: 'Complete 3 daily challenge puzzles.',
    icon: '📅',
    target: 3,
    current: (stats) => stats.dailyChallengesCompleted,
    rewardCoins: 250,
    rewardXP: 150,
    unlocked: false,
  },
  {
    id: 'color_virtuoso',
    name: 'Color Virtuoso',
    description: 'Complete 50 full hexagonal color stacks.',
    icon: '🎨',
    target: 50,
    current: (stats) => stats.totalCompletedStacks,
    rewardCoins: 300,
    rewardXP: 200,
    unlocked: false,
  },
  {
    id: 'hex_champion',
    name: 'Hex Champion',
    description: 'Complete 20 campaign levels.',
    icon: '👑',
    target: 20,
    current: (_, profile) => Object.keys(profile.completedLevels).length,
    rewardCoins: 500,
    rewardXP: 500,
    unlocked: false,
  },
  {
    id: 'grand_apex_master',
    name: 'Grand Apex Master',
    description: 'Conquer all 35 campaign levels.',
    icon: '🏆',
    target: 35,
    current: (_, profile) => Object.keys(profile.completedLevels).length,
    rewardCoins: 1000,
    rewardXP: 1000,
    unlocked: false,
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Score over 4,000 points in any single level.',
    icon: '💎',
    target: 4000,
    current: (stats) => stats.highestScore,
    rewardCoins: 300,
    rewardXP: 250,
    unlocked: false,
  },
];

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_PROFILE, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load profile from storage', e);
  }
  return INITIAL_PROFILE;
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile', e);
  }
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_STATS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load stats', e);
  }
  return INITIAL_STATS;
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save stats', e);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings', e);
  }
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings', e);
  }
}

export function loadActiveGame(): ActiveGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_GAME);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load active game', e);
  }
  return null;
}

export function saveActiveGame(state: ActiveGameState | null): void {
  try {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_GAME);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(state));
    }
  } catch (e) {
    console.warn('Failed to save active game', e);
  }
}

export function loadUnlockedAchievements(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load achievements', e);
  }
  return [];
}

export function saveUnlockedAchievements(unlockedIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, JSON.stringify(unlockedIds));
  } catch (e) {
    console.warn('Failed to save achievements', e);
  }
}

export function clearAllGameData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function loadPuzzleArchive(): ArchivedPuzzle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PUZZLE_ARCHIVE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load puzzle archive', e);
  }
  return [];
}

export function savePuzzleArchive(archive: ArchivedPuzzle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PUZZLE_ARCHIVE, JSON.stringify(archive));
  } catch (e) {
    console.warn('Failed to save puzzle archive', e);
  }
}

export function addPuzzleToArchive(level: LevelData, seed: number = Date.now()): ArchivedPuzzle {
  const currentArchive = loadPuzzleArchive();
  const puzzleId = `puzzle_${level.difficulty}_${seed}`;

  // Check if a puzzle with same id or same title + difficulty exists
  const existingIdx = currentArchive.findIndex(
    (p) => p.id === puzzleId || (p.title === level.title && p.difficulty === level.difficulty)
  );

  if (existingIdx !== -1) {
    const existing = currentArchive[existingIdx];
    const updated: ArchivedPuzzle = {
      ...existing,
      timesPlayed: (existing.timesPlayed || 1) + 1,
      levelData: level,
    };
    currentArchive[existingIdx] = updated;
    savePuzzleArchive(currentArchive);
    return updated;
  }

  const newEntry: ArchivedPuzzle = {
    id: puzzleId,
    title: level.title,
    subtitle: level.subtitle,
    difficulty: level.difficulty,
    seed,
    levelData: level,
    createdAt: new Date().toISOString(),
    timesPlayed: 1,
  };

  const updatedArchive = [newEntry, ...currentArchive];
  savePuzzleArchive(updatedArchive);
  return newEntry;
}

export function updateArchivedPuzzleResult(
  levelIdOrTitle: string | number,
  score: number,
  stars: number
): void {
  const currentArchive = loadPuzzleArchive();
  let modified = false;

  const updated = currentArchive.map((p) => {
    if (
      p.id === String(levelIdOrTitle) ||
      p.levelData.id === levelIdOrTitle ||
      p.title === String(levelIdOrTitle)
    ) {
      modified = true;
      return {
        ...p,
        isCompleted: true,
        bestScore: Math.max(p.bestScore || 0, score),
        starsEarned: Math.max(p.starsEarned || 0, stars),
      };
    }
    return p;
  });

  if (modified) {
    savePuzzleArchive(updated);
  }
}

export function deleteArchivedPuzzle(puzzleId: string): void {
  const currentArchive = loadPuzzleArchive();
  const updated = currentArchive.filter((p) => p.id !== puzzleId);
  savePuzzleArchive(updated);
}

