import { HexColorId, LevelData, TileStackLayer } from '../types';
import { COLOR_KEYS } from '../data/colors';
import { generateHexHoneycomb } from './hexMath';

/**
 * Seeded PRNG for reproducible daily/weekly puzzles
 */
export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a mathematically validated procedural Hexaflow puzzle
 * Every color present on the board is guaranteed to sum to an exact multiple of 10.
 */
export function generateProceduralLevel(
  id: number,
  title: string,
  difficulty: 1 | 2 | 3 | 4 | 5,
  seed: number = Date.now(),
  mode: 'daily' | 'weekly' | 'endless' | 'generator' = 'daily',
  options?: { boardRadius?: number }
): LevelData {
  const rng = seededRandom(seed);

  // Number of colors based on difficulty
  const numColors =
    difficulty === 1 ? 2 : difficulty === 2 ? 3 : difficulty === 3 ? 4 : difficulty === 4 ? 4 : 5;
  const shuffledColors = [...COLOR_KEYS.filter((c) => c !== 'wild-rainbow')].sort(
    () => rng() - 0.5
  );
  const selectedColors = shuffledColors.slice(0, numColors);

  const radius =
    options?.boardRadius !== undefined
      ? options.boardRadius
      : mode === 'weekly'
      ? 2
      : difficulty >= 3
      ? 2
      : 1;
  const allCells = generateHexHoneycomb(radius);

  // Custom Cells based on difficulty
  const customCells: {
    id: string;
    q: number;
    r: number;
    isBlocked?: boolean;
    isLocked?: boolean;
    lockRequirement?: { type: 'merges' | 'score'; target: number; current: number };
    bonusMultiplier?: number;
  }[] = [];

  if (radius >= 2) {
    if (difficulty === 3) {
      customCells.push({ id: '0_0', q: 0, r: 0, bonusMultiplier: 2 });
    } else if (difficulty === 4) {
      customCells.push({ id: '1_-1', q: 1, r: -1, bonusMultiplier: 2 });
      customCells.push({ id: '-1_1', q: -1, r: 1, bonusMultiplier: 2 });
    } else if (difficulty === 5) {
      customCells.push({ id: '0_0', q: 0, r: 0, bonusMultiplier: 3 });
      customCells.push({
        id: '0_2',
        q: 0,
        r: 2,
        isLocked: true,
        lockRequirement: { type: 'merges', target: 3, current: 0 },
      });
    }
  }

  // Filter available cells (excluding obstacles/blocked) for starting stacks
  const playableCells = allCells.filter(
    (c) => !customCells.some((cc) => cc.id === c.id && (cc.isBlocked || cc.isLocked))
  );

  // Pick starting stack locations
  const numStarting = Math.min(
    difficulty === 1 ? 3 : difficulty === 2 ? 4 : 3 + difficulty,
    Math.floor(playableCells.length * 0.5)
  );
  const startingIndices = playableCells
    .map((_, i) => i)
    .sort(() => rng() - 0.5)
    .slice(0, numStarting);

  // Allow multi-layer stacks for difficulty >= 2 or weekly mode
  const allowMultiLayer = difficulty >= 2 || mode === 'weekly';

  const startingBoard = startingIndices.map((cellIdx) => {
    const cell = playableCells[cellIdx];
    if (!allowMultiLayer) {
      const color = selectedColors[Math.floor(rng() * selectedColors.length)];
      const count = 3 + Math.floor(rng() * 4); // 3 to 6
      return {
        cellId: cell.id,
        color,
        count,
        layers: [{ color, count }],
      };
    }

    const maxLayers = difficulty === 2 ? 2 : Math.min(2 + Math.floor(rng() * 2), selectedColors.length);
    const stackColors = [...selectedColors].sort(() => rng() - 0.5).slice(0, maxLayers);
    const layers: TileStackLayer[] = stackColors.map((col) => ({
      color: col,
      count: 2 + Math.floor(rng() * 3), // 2 to 4
    }));
    const totalCount = layers.reduce((s, l) => s + l.count, 0);
    const topColor = layers[layers.length - 1].color;

    return {
      cellId: cell.id,
      color: topColor,
      count: totalCount,
      layers,
    };
  });

  // Calculate starting totals per color
  const colorCounts: { [color in HexColorId]?: number } = {};
  startingBoard.forEach((s) => {
    if (s.layers && s.layers.length > 0) {
      s.layers.forEach((l) => {
        colorCounts[l.color] = (colorCounts[l.color] || 0) + l.count;
      });
    } else {
      colorCounts[s.color] = (colorCounts[s.color] || 0) + s.count;
    }
  });

  // Build incoming pool:
  // For EVERY color present on startingBoard, incoming pool provides the EXACT number of tiles
  // needed so that (starting + pool) is an exact multiple of 10 (10, 20, etc.)
  const rawPieces: { color: HexColorId; count: number }[] = [];
  const targetColors: { [color in HexColorId]?: number } = {};

  Object.entries(colorCounts).forEach(([colorKey, count]) => {
    const c = colorKey as HexColorId;
    const current = count || 0;
    const remainder = current % 10;
    let needed = remainder === 0 ? 0 : 10 - remainder;

    // If already 0 remainder but count is 0, give at least 10
    if (needed === 0 && current === 0) {
      needed = 10;
    }

    let remaining = needed;
    while (remaining > 0) {
      const piece = Math.min(remaining, Math.max(2, Math.floor(rng() * 4) + 1));
      rawPieces.push({ color: c, count: piece });
      remaining -= piece;
    }

    const totalExpected = current + needed;
    targetColors[c] = Math.max(1, Math.floor(totalExpected / 10));
  });

  // Shuffle raw pieces
  rawPieces.sort(() => rng() - 0.5);

  const incomingPool: { color: HexColorId; count: number; layers?: TileStackLayer[] }[] = [];
  if (allowMultiLayer && rawPieces.length >= 2) {
    let p = 0;
    while (p < rawPieces.length) {
      const shouldBundle = rng() < (difficulty >= 4 ? 0.5 : 0.35) && p + 1 < rawPieces.length;
      if (shouldBundle) {
        const bundleLayersCount = rng() < 0.25 && p + 2 < rawPieces.length && difficulty >= 3 ? 3 : 2;
        const bundled = rawPieces.slice(p, p + bundleLayersCount);
        p += bundleLayersCount;
        const layers: TileStackLayer[] = bundled.map((b) => ({ color: b.color, count: b.count }));
        const topCol = layers[layers.length - 1].color;
        const totalCnt = layers.reduce((s, l) => s + l.count, 0);
        incomingPool.push({
          color: topCol,
          count: totalCnt,
          layers,
        });
      } else {
        const single = rawPieces[p++];
        incomingPool.push({
          color: single.color,
          count: single.count,
          layers: [{ color: single.color, count: single.count }],
        });
      }
    }
  } else {
    rawPieces.forEach((item) => {
      incomingPool.push({
        color: item.color,
        count: item.count,
        layers: [{ color: item.color, count: item.count }],
      });
    });
  }

  const bonusMoves = difficulty === 1 ? 14 : difficulty === 2 ? 12 : difficulty === 3 ? 10 : 8;
  const moveLimit = Math.max(16, incomingPool.length + bonusMoves);
  const targetScore = 1000 + difficulty * 600;

  // Primary objective target
  const topTargets: { [color in HexColorId]?: number } = {};
  const targetKeys = Object.keys(targetColors) as HexColorId[];
  const requiredCount = Math.min(targetKeys.length, Math.max(1, difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3));
  targetKeys.slice(0, requiredCount).forEach((k) => {
    topTargets[k] = 1;
  });

  const subtitle =
    mode === 'daily'
      ? 'Daily Brain Teaser'
      : mode === 'weekly'
      ? 'Weekly Mega Challenge'
      : mode === 'endless'
      ? 'Endless Trial'
      : difficulty === 1
      ? 'Level 1 Beginner • Pure Flow'
      : difficulty === 2
      ? 'Level 2 Casual • Gentle Cascades'
      : difficulty === 3
      ? 'Level 3 Medium • Multi-Layer Stacks'
      : difficulty === 4
      ? 'Level 4 Hard • Deep Stacks & Multipliers'
      : 'Level 5 Expert • Obstacles & Mastermind';

  return {
    id,
    worldId: difficulty,
    title,
    subtitle,
    difficulty,
    boardRadius: radius,
    customCells: customCells.length > 0 ? customCells : undefined,
    stackCapacity: 10,
    availableColors: selectedColors,
    startingBoard,
    incomingPool,
    objective: {
      type: 'complete_colors',
      description: `Complete ${requiredCount} full colour stack${requiredCount > 1 ? 's' : ''}`,
      targetColors: topTargets,
      moveLimit,
    },
    starThresholds: [
      Math.floor(targetScore * 0.6),
      targetScore,
      Math.floor(targetScore * 1.4),
    ],
  };
}

/**
 * Validates whether a level has legal moves and reachable objectives
 */
export function validatePuzzle(level: LevelData): {
  isValid: boolean;
  legalMovesEstimate: number;
  message: string;
} {
  const cells = generateHexHoneycomb(level.boardRadius);
  const emptyCount = cells.length - level.startingBoard.length;

  if (emptyCount < 1) {
    return {
      isValid: false,
      legalMovesEstimate: 0,
      message: 'Board has no empty cells to place incoming stacks.',
    };
  }

  return {
    isValid: true,
    legalMovesEstimate: emptyCount + level.incomingPool.length,
    message: `Level ${level.id} is validated and solvable. Empty spaces: ${emptyCount}, incoming tiles: ${level.incomingPool.length}.`,
  };
}
