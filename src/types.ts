/**
 * Core types and data structures for Hexaflow
 */

export type HexColorId = 
  | 'ruby-red'
  | 'tangerine-orange'
  | 'sunburst-yellow'
  | 'emerald-green'
  | 'lime-spring'
  | 'cyan-breeze'
  | 'azure-blue'
  | 'royal-purple'
  | 'bubblegum-pink'
  | 'orchid-magenta'
  | 'ocean-teal'
  | 'wild-rainbow';

export interface ColorDef {
  id: HexColorId;
  name: string;
  primary: string;
  highlight: string;
  shadow: string;
  glow: string;
  textColor: string;
  symbol: string; // Accessibility symbol (e.g., Circle, Star, Diamond, Heart)
  symbolName: string;
}

export interface HexCoord {
  q: number; // axial coordinate q
  r: number; // axial coordinate r
  s: number; // axial coordinate s (q + r + s = 0)
}

export interface BoardCell {
  id: string; // e.g. "q_r"
  q: number;
  r: number;
  isBlocked?: boolean; // Obstacle/wall cell
  isLocked?: boolean; // Unlockable after reaching a goal
  lockRequirement?: { type: 'merges' | 'score'; target: number; current: number };
  restrictedColor?: HexColorId; // Only accepts this color
  bonusMultiplier?: number; // e.g., 2x score for merges on this spot
}

export interface TileStackLayer {
  color: HexColorId;
  count: number;
}

export interface TileStack {
  id: string;
  color: HexColorId; // Active top layer color (for backwards compatibility and direct color access)
  count: number; // Total count of tiles across all layers
  layers?: TileStackLayer[]; // Multi-colored layers ordered from bottom (index 0) to top (last index)
  maxCapacity?: number;
  isCompleted?: boolean;
  animating?: 'spawn' | 'selected' | 'merging' | 'clearing' | 'bounce' | 'waterfall' | null;
  cascadeAdded?: number; // Count of newly arrived tiles falling in waterfall
}

export interface CascadeTransfer {
  id: string;
  fromCellId: string;
  fromQ: number;
  fromR: number;
  toCellId: string;
  toQ: number;
  toR: number;
  color: HexColorId;
  count: number;
  targetCountBefore: number;
  targetCountAfter: number;
}

export interface BoardState {
  [cellId: string]: TileStack | null;
}

export type ObjectiveType = 
  | 'clear_board'
  | 'complete_colors'
  | 'target_score'
  | 'limited_moves'
  | 'timed_challenge';

export interface LevelObjective {
  type: ObjectiveType;
  description: string;
  targetColors?: { [color in HexColorId]?: number }; // Target completed stacks of each color
  targetScore?: number;
  moveLimit?: number;
  timeLimitSeconds?: number;
  requiredClearedCells?: number;
}

export interface LevelData {
  id: number;
  worldId: number;
  title: string;
  subtitle?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  boardRadius: number; // 1 = 7 cells, 2 = 19 cells, 3 = 37 cells
  customCells?: BoardCell[]; // Custom honeycomb layout
  stackCapacity: number; // default 10
  availableColors: HexColorId[];
  startingBoard: { cellId: string; color: HexColorId; count: number; layers?: TileStackLayer[] }[];
  incomingPool: { color: HexColorId; count: number; layers?: TileStackLayer[]; weight?: number }[];
  objective: LevelObjective;
  starThresholds: [number, number, number]; // [1 star score, 2 star score, 3 star score]
  tips?: string;
}

export type GameMode = 'campaign' | 'daily' | 'weekly' | 'endless' | 'relax';

export type BoosterType = 'undo' | 'shuffle' | 'hammer' | 'wild_hex' | 'extra_space' | 'extra_moves';

export interface BoosterInventory {
  undo: number;
  shuffle: number;
  hammer: number;
  wild_hex: number;
  extra_space: number;
  extra_moves: number;
}

export interface PlayerProfile {
  playerId: string;
  name: string;
  xp: number;
  level: number;
  coins: number;
  stars: number;
  completedLevels: { [levelId: number]: { stars: number; bestScore: number; bestMoves: number } };
  currentLevel: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  weeklyCompleted: boolean;
  boosters: BoosterInventory;
  createdAt: string;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalMoves: number;
  totalMerges: number;
  totalCompletedStacks: number;
  highestCombo: number;
  highestScore: number;
  dailyChallengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  endlessHighScore: number;
  endlessHighestLevel: number;
  totalPlayTimeSeconds: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  current: (stats: GameStats, profile: PlayerProfile) => number;
  rewardCoins: number;
  rewardXP: number;
  unlocked: boolean;
}

export interface GameSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkMode: boolean;
  highContrast: boolean;
  showAccessibilitySymbols: boolean;
  reducedMotion: boolean;
  confirmRestart: boolean;
  animationSpeed: 'normal' | 'fast';
}

export interface ActiveGameState {
  mode: GameMode;
  levelId: number;
  levelTitle: string;
  board: BoardState;
  tray: (TileStack | null)[];
  score: number;
  movesRemaining?: number;
  movesMade: number;
  secondsRemaining?: number;
  timeElapsed: number;
  combo: number;
  completedColorCounts: { [color in HexColorId]?: number };
  isComplete: boolean;
  isFailed: boolean;
  bonusCellsUnlocked: string[];
}
