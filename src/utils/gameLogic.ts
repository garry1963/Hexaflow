import {
  BoardCell,
  BoardState,
  CascadeTransfer,
  HexColorId,
  TileStack,
  TileStackLayer,
} from '../types';
import { getNeighbors } from './hexMath';

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
  clearedCellIds: string[];
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
 * Supports multi-colored / multi-layered stacks with full-board cascading chain reactions!
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
  const transfers: CascadeTransfer[] = [];
  const clearedCellIdsSet: Set<string> = new Set();

  // 1. Remove from source
  if (sourceTrayIndex !== null) {
    nextTray[sourceTrayIndex] = null;
  } else if (sourceCellId) {
    const srcStack = nextBoard[sourceCellId];
    if (srcStack) {
      const srcLayers = normalizeLayers(srcStack);
      if (srcLayers.length > 1) {
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

  // 2. Place/Combine layers on target cell
  const existing = nextBoard[targetCell.id];
  const sourceLayers = normalizeLayers(sourceStack);
  let targetLayers: TileStackLayer[] = [];

  if (existing) {
    const existingLayers = normalizeLayers(existing);
    mergesCount++;
    scoreGained += 25;

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

  // Consolidate target layers
  targetLayers = normalizeLayers({
    color: targetLayers[targetLayers.length - 1].color,
    count: targetLayers.reduce((s, l) => s + l.count, 0),
    layers: targetLayers,
  });

  const finalTopColor = targetLayers[targetLayers.length - 1].color;
  nextBoard[targetCell.id] = {
    id: `stack_${Date.now()}_${targetCell.id}`,
    color: finalTopColor,
    count: targetLayers.reduce((s, l) => s + l.count, 0),
    layers: targetLayers,
  };

  // Map for fast cell coordinate lookup
  const cellCoordMap = new Map<string, BoardCell>();
  allCells.forEach((c) => cellCoordMap.set(c.id, c));

  // 3. Global Multi-Cell Connected Cascade Engine
  // Allows natural chain reactions across the entire board:
  // - When a matching top layer clears, revealed layers below cascade and merge with adjacent stacks!
  // - Tiles consolidate into the larger stack or target cell, clearing 10-stacks and freeing up space.
  let changed = true;
  let cascadeRound = 0;
  const maxCascadeRounds = 36;

  while (changed && cascadeRound < maxCascadeRounds) {
    changed = false;
    cascadeRound++;

    // --- PHASE A: Check for any stack that has hit capacity (>= maxCapacity) ---
    const currentOccupiedIds = Object.keys(nextBoard).filter((id) => nextBoard[id] !== null);
    for (const cellId of currentOccupiedIds) {
      const st = nextBoard[cellId];
      if (!st) continue;
      const layers = normalizeLayers(st);
      if (layers.length === 0) continue;
      const top = layers[layers.length - 1];

      if (top.count >= maxCapacity) {
        completedColors.push(top.color);
        clearedCellIdsSet.add(cellId);
        mergesCount++;
        scoreGained += 150;

        layers.pop(); // Remove completed 10-stack layer
        if (layers.length === 0) {
          nextBoard[cellId] = null;
        } else {
          const newTop = layers[layers.length - 1];
          nextBoard[cellId] = {
            id: `stack_${Date.now()}_${cellId}`,
            color: newTop.color,
            count: layers.reduce((s, l) => s + l.count, 0),
            layers,
          };
        }
        changed = true;
      }
    }

    if (changed) {
      // Re-evaluate with newly revealed layers
      continue;
    }

    // --- PHASE B: Find adjacent matching pairs and merge tiles ---
    // Sort so targetCell is checked first for immediate placement feedback
    const occupiedForMerge = Object.keys(nextBoard).filter((id) => nextBoard[id] !== null);
    occupiedForMerge.sort((a, b) => (a === targetCell.id ? -1 : b === targetCell.id ? 1 : 0));

    let mergedInThisPass = false;

    for (const cellId of occupiedForMerge) {
      if (mergedInThisPass) break;

      const stackA = nextBoard[cellId];
      if (!stackA) continue;
      const layersA = normalizeLayers(stackA);
      if (layersA.length === 0) continue;
      const topA = layersA[layersA.length - 1];
      if (topA.count >= maxCapacity) continue;

      const cellCoordA = cellCoordMap.get(cellId);
      if (!cellCoordA) continue;
      const neighbors = getNeighbors(cellCoordA.q, cellCoordA.r);

      for (const nbr of neighbors) {
        const stackB = nextBoard[nbr.id];
        if (!stackB) continue;
        const layersB = normalizeLayers(stackB);
        if (layersB.length === 0) continue;
        const topB = layersB[layersB.length - 1];
        if (topB.count >= maxCapacity) continue;

        const colorsMatch =
          topA.color === topB.color ||
          topA.color === 'wild-rainbow' ||
          topB.color === 'wild-rainbow';

        if (!colorsMatch) continue;

        // Determine recipient and donor:
        // Stacks consolidate into the one that has MORE tiles on top,
        // or into the newly placed targetCell if tied.
        let recipientId = cellId;
        let recipientLayers = layersA;
        let recipientTop = topA;
        let donorId = nbr.id;
        let donorLayers = layersB;
        let donorTop = topB;
        let recipientCoord = cellCoordA;
        let donorCoord = nbr;

        if (
          topB.count > topA.count ||
          (topB.count === topA.count && nbr.id === targetCell.id)
        ) {
          recipientId = nbr.id;
          recipientLayers = layersB;
          recipientTop = topB;
          donorId = cellId;
          donorLayers = layersA;
          donorTop = topA;
          recipientCoord = nbr;
          donorCoord = cellCoordA;
        }

        const space = maxCapacity - recipientTop.count;
        if (space <= 0) continue;

        const transferCount = Math.min(space, donorTop.count);
        if (transferCount <= 0) continue;

        const resolvedColor =
          recipientTop.color === 'wild-rainbow'
            ? donorTop.color === 'wild-rainbow'
              ? 'ruby-red'
              : donorTop.color
            : recipientTop.color;

        recipientTop.color = resolvedColor;
        const targetCountBefore = recipientTop.count;
        recipientTop.count += transferCount;
        const targetCountAfter = recipientTop.count;

        donorTop.count -= transferCount;

        transfers.push({
          id: `transfer_${donorId}_to_${recipientId}_${Date.now()}_${transfers.length}`,
          fromCellId: donorId,
          fromQ: donorCoord.q,
          fromR: donorCoord.r,
          toCellId: recipientId,
          toQ: recipientCoord.q,
          toR: recipientCoord.r,
          color: resolvedColor,
          count: transferCount,
          targetCountBefore,
          targetCountAfter,
        });

        mergesCount++;
        scoreGained += 35 * transferCount;

        // Update donor on board
        if (donorTop.count <= 0) {
          donorLayers.pop();
        }
        if (donorLayers.length === 0) {
          nextBoard[donorId] = null;
        } else {
          const newTopD = donorLayers[donorLayers.length - 1];
          nextBoard[donorId] = {
            id: `stack_${Date.now()}_${donorId}`,
            color: newTopD.color,
            count: donorLayers.reduce((s, l) => s + l.count, 0),
            layers: donorLayers,
          };
        }

        // Update recipient on board
        nextBoard[recipientId] = {
          id: `stack_${Date.now()}_${recipientId}`,
          color: recipientTop.color,
          count: recipientLayers.reduce((s, l) => s + l.count, 0),
          layers: recipientLayers,
        };

        changed = true;
        mergedInThisPass = true;
        break; // Break inner loop to re-evaluate connected component
      }
    }
  }

  // Apply cell bonus multiplier if applicable
  if (targetCell.bonusMultiplier && targetCell.bonusMultiplier > 1) {
    scoreGained *= targetCell.bonusMultiplier;
  }

  // Update locks on cells requiring merges
  allCells.forEach((c) => {
    if (c.isLocked && c.lockRequirement?.type === 'merges') {
      const current = (c.lockRequirement.current || 0) + mergesCount;
      c.lockRequirement.current = current;
      if (current >= c.lockRequirement.target && !newlyUnlocked.includes(c.id)) {
        newlyUnlocked.push(c.id);
      }
    }
  });

  const isComplete = completedColors.length > 0;
  const remainingTargetStack = nextBoard[targetCell.id] || null;
  const finalCount = remainingTargetStack ? remainingTargetStack.count : 0;
  const activeTopColor = remainingTargetStack
    ? remainingTargetStack.color
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
    activeColor: activeTopColor,
    finalCount,
    clearedCellIds: Array.from(clearedCellIdsSet),
    remainingTargetStack,
  };
}
