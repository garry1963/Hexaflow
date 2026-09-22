import {
  BoardCell,
  BoardState,
  CascadeTransfer,
  HexColorId,
  LevelData,
  TileStack,
  TileStackLayer,
} from '../types';
import { getCellId, getNeighbors } from './hexMath';

export interface MoveResult {
  nextBoard: BoardState;
  nextTray: (TileStack | null)[];
  mergesCount: number;
  completedColors: HexColorId[];
  scoreGained: number;
  unlockedCells: string[];
  transfers: CascadeTransfer[];
  placedCount: number;
  targetCellId: string;
  isComplete: boolean;
  activeColor: HexColorId;
  finalCount: number;
  remainingTargetStack?: TileStack | null;
}

/**
 * Normalizes a stack into an array of layers ordered from bottom (0) to top (last).
 * Merges adjacent layers with the same color and removes zero-count layers.
 */
export function normalizeLayers(
  stack: TileStack | { color: HexColorId; count: number; layers?: TileStackLayer[] }
): TileStackLayer[] {
  if (stack.layers && stack.layers.length > 0) {
    const cleaned: TileStackLayer[] = [];
    for (const l of stack.layers) {
      if (l.count <= 0) continue;
      if (cleaned.length > 0 && cleaned[cleaned.length - 1].color === l.color) {
        cleaned[cleaned.length - 1].count += l.count;
      } else {
        cleaned.push({ color: l.color, count: l.count });
      }
    }
    return cleaned.length > 0 ? cleaned : [{ color: stack.color, count: stack.count }];
  }
  return [{ color: stack.color, count: stack.count }];
}

/**
 * Gets the active top color of a stack.
 */
export function getStackTopColor(stack: TileStack): HexColorId {
  const layers = normalizeLayers(stack);
  return layers[layers.length - 1].color;
}

/**
 * Determines which cells on the board can legally accept the given source stack
 */
export function getValidTargetCells(
  sourceStack: TileStack | null,
  cells: BoardCell[],
  boardState: BoardState,
  maxCapacity: number = 10,
  unlockedCellIds: string[] = [],
  excludeCellId?: string
): string[] {
  if (!sourceStack) return [];

  const sourceLayers = normalizeLayers(sourceStack);
  const sourceBottom = sourceLayers[0];
  const validIds: string[] = [];

  cells.forEach((cell) => {
    // Cannot target the source cell itself
    if (excludeCellId && cell.id === excludeCellId) return;

    // Blocked obstacles never accept stacks
    if (cell.isBlocked) return;

    // Locked cells only accept if unlocked
    const isUnlocked = !cell.isLocked || unlockedCellIds.includes(cell.id);
    if (!isUnlocked) return;

    // Restricted color check (must match source bottom color or wild-rainbow)
    if (
      cell.restrictedColor &&
      cell.restrictedColor !== sourceBottom.color &&
      sourceBottom.color !== 'wild-rainbow'
    ) {
      return;
    }

    const existingStack = boardState[cell.id];

    // Case 1: Empty cell can always accept any stack
    if (!existingStack) {
      validIds.push(cell.id);
      return;
    }

    // Case 2: Placing onto an existing stack
    // The target's top layer must match the source's bottom layer (or either is wild rainbow)
    const targetLayers = normalizeLayers(existingStack);
    const targetTop = targetLayers[targetLayers.length - 1];

    const colorsMatch =
      targetTop.color === sourceBottom.color ||
      targetTop.color === 'wild-rainbow' ||
      sourceBottom.color === 'wild-rainbow';

    // Top layer can accept matching tiles up to maxCapacity (10)
    const spaceInTopLayer = maxCapacity - targetTop.count;
    if (colorsMatch && spaceInTopLayer >= sourceBottom.count) {
      validIds.push(cell.id);
    }
  });

  return validIds;
}

/**
 * Executes a stack placement and cascading neighbor merge logic
 * Supports multi-colored / multi-layered stacks with cascading chain reactions!
 */
export function executeMoveAndCascade(
  sourceStack: TileStack,
  targetCell: BoardCell,
  boardState: BoardState,
  tray: (TileStack | null)[],
  sourceTrayIndex: number | null,
  sourceCellId: string | null,
  allCells: BoardCell[],
  maxCapacity: number = 10,
  unlockedCells: string[] = []
): MoveResult {
  const nextBoard: BoardState = { ...boardState };
  const nextTray = [...tray];
  let mergesCount = 0;
  let scoreGained = 10; // Base score for placement
  const completedColors: HexColorId[] = [];
  const newlyUnlocked: string[] = [...unlockedCells];

  // 1. Remove from source
  if (sourceTrayIndex !== null) {
    nextTray[sourceTrayIndex] = null;
  } else if (sourceCellId) {
    const srcStack = nextBoard[sourceCellId];
    if (srcStack) {
      const srcLayers = normalizeLayers(srcStack);
      if (srcLayers.length > 1) {
        // Multi-layer stack: top layer was moved, remaining layers stay!
        const remainingLayers = srcLayers.slice(0, -1);
        const newTop = remainingLayers[remainingLayers.length - 1];
        nextBoard[sourceCellId] = {
          id: `stack_${Date.now()}_${sourceCellId}`,
          color: newTop.color,
          count: remainingLayers.reduce((s, l) => s + l.count, 0),
          layers: remainingLayers,
        };
      } else {
        nextBoard[sourceCellId] = null;
      }
    }
  }

  // 2. Combine layers on target cell
  const existing = nextBoard[targetCell.id];
  const sourceLayers = normalizeLayers(sourceStack);
  let targetLayers: TileStackLayer[] = [];

  if (existing) {
    const existingLayers = normalizeLayers(existing);
    mergesCount++;
    scoreGained += 25;

    // Merge touching layer boundary if colors match
    const existingTop = existingLayers[existingLayers.length - 1];
    const sourceBottom = sourceLayers[0];

    if (
      existingTop.color === sourceBottom.color ||
      existingTop.color === 'wild-rainbow' ||
      sourceBottom.color === 'wild-rainbow'
    ) {
      const mergedColor =
        existingTop.color === 'wild-rainbow' ? sourceBottom.color : existingTop.color;
      existingTop.color = mergedColor;
      existingTop.count += sourceBottom.count;
      targetLayers = [...existingLayers, ...sourceLayers.slice(1)];
    } else {
      targetLayers = [...existingLayers, ...sourceLayers];
    }
  } else {
    targetLayers = [...sourceLayers];
  }

  // Consolidate any contiguous layers with identical color
  targetLayers = normalizeLayers({
    color: targetLayers[targetLayers.length - 1].color,
    count: targetLayers.reduce((s, l) => s + l.count, 0),
    layers: targetLayers,
  });

  // 3. Cascading Neighbor Transfers Loop
  // Allows chain reactions: when a matching top layer clears, revealed layers below can also cascade!
  const transfers: CascadeTransfer[] = [];
  let changed = true;
  let cascadeRounds = 0;

  while (changed && cascadeRounds < 12) {
    changed = false;
    cascadeRounds++;

    if (targetLayers.length === 0) break;

    // Check if the top layer has reached capacity (10 tiles)
    const currentTop = targetLayers[targetLayers.length - 1];
    if (currentTop.count >= maxCapacity) {
      completedColors.push(currentTop.color);
      scoreGained += 150;
      targetLayers.pop(); // Remove completed 10-stack layer
      changed = true;
      continue;
    }

    // Space available in top layer
    const spaceForTop = maxCapacity - currentTop.count;
    if (spaceForTop <= 0) break;

    const activeColor = currentTop.color;
    const neighbors = getNeighbors(targetCell.q, targetCell.r);

    for (const nbr of neighbors) {
      const nbrStack = nextBoard[nbr.id];
      if (!nbrStack) continue;

      const nbrLayers = normalizeLayers(nbrStack);
      if (nbrLayers.length === 0) continue;

      const nbrTop = nbrLayers[nbrLayers.length - 1];
      const matches =
        nbrTop.color === activeColor ||
        nbrTop.color === 'wild-rainbow' ||
        activeColor === 'wild-rainbow';

      if (!matches) continue;

      const currentSpace = maxCapacity - currentTop.count;
      if (currentSpace <= 0) break;

      const transferAmount = Math.min(currentSpace, nbrTop.count);
      if (transferAmount <= 0) continue;

      const targetCountBefore = currentTop.count;
      currentTop.count += transferAmount;
      const targetCountAfter = currentTop.count;

      transfers.push({
        id: `transfer_${nbr.id}_to_${targetCell.id}_${Date.now()}_${transfers.length}`,
        fromCellId: nbr.id,
        fromQ: nbr.q,
        fromR: nbr.r,
        toCellId: targetCell.id,
        toQ: targetCell.q,
        toR: targetCell.r,
        color: nbrTop.color === 'wild-rainbow' ? activeColor : nbrTop.color,
        count: transferAmount,
        targetCountBefore,
        targetCountAfter,
      });

      mergesCount++;
      scoreGained += 35 * transferAmount;
      changed = true;

      // Deduct from neighbor
      nbrTop.count -= transferAmount;
      if (nbrTop.count <= 0) {
        nbrLayers.pop(); // Top layer depleted, revealing layer below!
      }

      if (nbrLayers.length === 0) {
        nextBoard[nbr.id] = null;
      } else {
        const newTop = nbrLayers[nbrLayers.length - 1];
        nextBoard[nbr.id] = {
          id: `stack_${Date.now()}_${nbr.id}`,
          color: newTop.color,
          count: nbrLayers.reduce((s, l) => s + l.count, 0),
          layers: nbrLayers,
        };
      }
    }

    // Check again if currentTop hit maxCapacity after neighbor transfers
    if (currentTop.count >= maxCapacity) {
      completedColors.push(currentTop.color);
      scoreGained += 150;
      targetLayers.pop();
      changed = true;
    }
  }

  // Apply cell bonus multiplier if applicable
  if (targetCell.bonusMultiplier && targetCell.bonusMultiplier > 1) {
    scoreGained *= targetCell.bonusMultiplier;
  }

  // 4. Determine final target board state & completion handling
  const isComplete = completedColors.length > 0;
  const remainingCount = targetLayers.reduce((s, l) => s + l.count, 0);
  let remainingTargetStack: TileStack | null = null;

  if (remainingCount > 0) {
    const top = targetLayers[targetLayers.length - 1];
    remainingTargetStack = {
      id: `stack_${Date.now()}_${targetCell.id}`,
      color: top.color,
      count: remainingCount,
      layers: targetLayers,
    };
  }

  if (isComplete) {
    // Show completed 10-stack for visual fireworks/crown before dissolving
    const completedColor = completedColors[0];
    nextBoard[targetCell.id] = {
      id: `stack_${Date.now()}_${targetCell.id}`,
      color: completedColor,
      count: maxCapacity,
      isCompleted: true,
      animating: 'waterfall',
      cascadeAdded: sourceStack.count,
      layers: [{ color: completedColor, count: maxCapacity }],
    };
  } else {
    nextBoard[targetCell.id] = remainingTargetStack;
    if (nextBoard[targetCell.id]) {
      nextBoard[targetCell.id]!.animating = 'waterfall';
      nextBoard[targetCell.id]!.cascadeAdded = sourceStack.count;
    }
  }

  // 5. Update locks on cells requiring merges
  allCells.forEach((c) => {
    if (c.isLocked && c.lockRequirement?.type === 'merges') {
      const current = (c.lockRequirement.current || 0) + mergesCount;
      c.lockRequirement.current = current;
      if (current >= c.lockRequirement.target && !newlyUnlocked.includes(c.id)) {
        newlyUnlocked.push(c.id);
      }
    }
  });

  const finalTopColor =
    targetLayers.length > 0
      ? targetLayers[targetLayers.length - 1].color
      : completedColors[0] || sourceStack.color;

  return {
    nextBoard,
    nextTray,
    mergesCount,
    completedColors,
    scoreGained,
    unlockedCells: newlyUnlocked,
    transfers,
    placedCount: sourceStack.count,
    targetCellId: targetCell.id,
    isComplete,
    activeColor: finalTopColor,
    finalCount: remainingCount,
    remainingTargetStack,
  };
}
