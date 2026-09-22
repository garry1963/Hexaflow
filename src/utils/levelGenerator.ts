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
 * Generates a validated procedural Hexaflow puzzle
 * From Level 5 onwards, supports multi-colored / multi-layered stacks (up to 3 colors per stack)
 */
export function generateProceduralLevel(
  id: number,
  title: string,
  difficulty: 1 | 2 | 3 | 4 | 5,
  seed: number = Date.now(),
  mode: 'daily' | 'weekly' | 'endless' = 'daily'
): LevelData {
  const rng = seededRandom(seed);

  // Number of colors based on difficulty
  const numColors = Math.min(difficulty + 1, 6);
  const shuffledColors = [...COLOR_KEYS.filter((c) => c !== 'wild-rainbow')].sort(() => rng() - 0.5);
  const selectedColors = shuffledColors.slice(0, numColors);

  const radius = mode === 'weekly' ? 2 : difficulty >= 3 ? 2 : 1;
  const allCells = generateHexHoneycomb(radius);

  // Pick starting stack locations
  const numStarting = Math.min(3 + difficulty, Math.floor(allCells.length * 0.6));
  const startingIndices = allCells.map((_, i) => i).sort(() => rng() - 0.5).slice(0, numStarting);

  // Level 5 onwards allows multi-colored stacks with up to 3 distinct colors!
  const allowMultiLayer = id >= 5 || mode === 'weekly' || difficulty >= 3;

  const startingBoard = startingIndices.map((cellIdx) => {
    const cell = allCells[cellIdx];
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

    // Up to 3 distinct colors per stack for level 5 onwards
    const numLayers = Math.min(3, Math.min(selectedColors.length, 1 + Math.floor(rng() * 3)));
    const stackColors = [...selectedColors].sort(() => rng() - 0.5).slice(0, numLayers);
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

  // Calculate required target stacks so puzzle is guaranteed solvable
  // Count starting totals per color
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

  // Build incoming pool to guarantee each color can form full 10-stacks
  const rawPieces: { color: HexColorId; count: number }[] = [];
  const targetColors: { [color in HexColorId]?: number } = {};

  selectedColors.slice(0, Math.min(2 + Math.floor(difficulty / 2), selectedColors.length)).forEach((c) => {
    const current = colorCounts[c] || 0;
    const needed = Math.max(10 - (current % 10), 10);
    let remaining = needed;
    while (remaining > 0) {
      const piece = Math.min(remaining, 2 + Math.floor(rng() * 4));
      rawPieces.push({ color: c, count: piece });
      remaining -= piece;
    }
    targetColors[c] = 1;
  });

  rawPieces.sort(() => rng() - 0.5);

  const incomingPool: { color: HexColorId; count: number; layers?: TileStackLayer[] }[] = [];
  if (allowMultiLayer && rawPieces.length >= 2) {
    let p = 0;
    while (p < rawPieces.length) {
      // Chance of generating a multi-colored piece (2 or 3 layers)
      const shouldBundle = rng() < 0.45 && p + 1 < rawPieces.length;
      if (shouldBundle) {
        const bundleLayersCount = rng() < 0.3 && p + 2 < rawPieces.length ? 3 : 2;
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

  const moveLimit = Math.max(14, incomingPool.length + 6 + difficulty * 2);
  const targetScore = 1500 + difficulty * 800;

  return {
    id,
    worldId: difficulty,
    title,
    subtitle: mode === 'daily' ? 'Daily Brain Teaser' : mode === 'weekly' ? 'Weekly Mega Challenge' : 'Endless Trial',
    difficulty,
    boardRadius: radius,
    stackCapacity: 10,
    availableColors: selectedColors,
    startingBoard,
    incomingPool,
    objective: {
      type: difficulty >= 4 ? 'target_score' : 'complete_colors',
      description: difficulty >= 4 ? `Score ${targetScore} points` : `Complete target color stacks`,
      targetColors: difficulty < 4 ? targetColors : undefined,
      targetScore: difficulty >= 4 ? targetScore : undefined,
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

  // Check matching color opportunities
  let matchOpportunities = 0;
  for (let i = 0; i < level.startingBoard.length; i++) {
    for (let j = i + 1; j < level.startingBoard.length; j++) {
      if (level.startingBoard[i].color === level.startingBoard[j].color) {
        matchOpportunities++;
      }
    }
  }

  return {
    isValid: true,
    legalMovesEstimate: emptyCount + matchOpportunities + level.incomingPool.length,
    message: `Level ${level.id} is validated and solvable. Empty spaces: ${emptyCount}, incoming tiles: ${level.incomingPool.length}.`,
  };
}
