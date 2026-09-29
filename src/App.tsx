import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ActiveGameState,
  BoardCell,
  BoardState,
  BoosterType,
  CascadeTransfer,
  GameMode,
  HexColorId,
  LevelData,
  PlayerProfile,
  GameSettings,
  GameStats,
  TileStack,
  TileStackLayer,
} from './types';
import { CAMPAIGN_LEVELS } from './data/levels';
import { generateHexHoneycomb } from './utils/hexMath';
import {
  executeMoveAndCascade,
  getValidTargetCells,
} from './utils/gameLogic';
import {
  dateToSeed,
  generateProceduralLevel,
} from './utils/levelGenerator';
import {
  getLocalDateString,
  canAttemptDaily,
  calculateNextWinStreak,
} from './utils/dailyPuzzle';
import {
  clearAllGameData,
  loadActiveGame,
  loadProfile,
  loadSettings,
  loadStats,
  loadUnlockedAchievements,
  saveActiveGame,
  saveProfile,
  saveSettings,
  saveStats,
  saveUnlockedAchievements,
  addPuzzleToArchive,
  updateArchivedPuzzleResult,
} from './utils/storage';
import { soundManager } from './audio/soundManager';

// Components
import { MainMenu } from './components/MainMenu';
import { HexBoard } from './components/HexBoard';
import { TraySlot } from './components/TraySlot';
import { HexTileStack } from './components/HexTileStack';
import { HUD } from './components/HUD';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelFailedModal } from './components/LevelFailedModal';
import { PauseModal } from './components/PauseModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { WeeklyChallengeModal } from './components/WeeklyChallengeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { DevToolsModal } from './components/DevToolsModal';
import { TutorialModal } from './components/TutorialModal';
import { PuzzleGeneratorModal } from './components/PuzzleGeneratorModal';
import { Hammer, Sparkles } from 'lucide-react';

interface UndoSnapshot {
  board: BoardState;
  tray: (TileStack | null)[];
  incomingQueue: { color: HexColorId; count: number; layers?: TileStackLayer[] }[];
  score: number;
  movesMade: number;
  movesRemaining?: number;
  combo: number;
  completedColors: { [color: string]: number };
  unlockedCells: string[];
}

function generateSmartTrayStack(
  boardState: BoardState,
  availableColors: HexColorId[],
  levelId: number,
  slotIndex: number,
  stackCapacity: number = 10
): TileStack {
  // Count how many tiles of each color exist on the board
  const boardCounts: { [c in HexColorId]?: number } = {};
  Object.values(boardState).forEach((stack) => {
    if (!stack) return;
    if (stack.layers && stack.layers.length > 0) {
      stack.layers.forEach((l) => {
        boardCounts[l.color] = (boardCounts[l.color] || 0) + l.count;
      });
    } else {
      boardCounts[stack.color] = (boardCounts[stack.color] || 0) + stack.count;
    }
  });

  const existingColors = (Object.keys(boardCounts) as HexColorId[]).filter(
    (c) => (boardCounts[c] || 0) > 0
  );

  let pickedColor: HexColorId;
  let count: number;

  if (existingColors.length > 0) {
    // Check if any color has incomplete stacks needing tiles
    const candidateColors = existingColors
      .map((c) => {
        const cur = boardCounts[c] || 0;
        const remainder = cur % stackCapacity;
        const needed = remainder === 0 ? stackCapacity : stackCapacity - remainder;
        return { color: c, needed };
      })
      .filter((item) => item.needed > 0);

    const chosen =
      candidateColors.length > 0
        ? candidateColors[Math.floor(Math.random() * candidateColors.length)]
        : { color: existingColors[Math.floor(Math.random() * existingColors.length)], needed: 3 };

    pickedColor = chosen.color;
    count = Math.min(chosen.needed, 2 + Math.floor(Math.random() * 3));
  } else {
    pickedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    count = 2 + Math.floor(Math.random() * 3);
  }

  // Multi-layer chance for level 5+
  if (levelId >= 5 && existingColors.length >= 2 && Math.random() < 0.35) {
    const secondColor = existingColors.find((c) => c !== pickedColor) || availableColors[0];
    const layer1Count = Math.max(1, Math.floor(count / 2));
    const layer2Count = Math.max(1, count - layer1Count);
    const layers = [
      { color: secondColor, count: layer1Count },
      { color: pickedColor, count: layer2Count },
    ];
    return {
      id: `tray_gen_${Date.now()}_${slotIndex}`,
      color: pickedColor,
      count: layer1Count + layer2Count,
      layers,
    };
  }

  return {
    id: `tray_gen_${Date.now()}_${slotIndex}`,
    color: pickedColor,
    count,
    layers: [{ color: pickedColor, count }],
  };
}


export default function App() {
  // Navigation & View States
  const [activeView, setActiveView] = useState<'menu' | 'game'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('campaign');

  // Persistence States
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    loadUnlockedAchievements
  );

  // Active Game Level & Board State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [levelData, setLevelData] = useState<LevelData>(CAMPAIGN_LEVELS[0]);
  const [boardCells, setBoardCells] = useState<BoardCell[]>([]);
  const [boardState, setBoardState] = useState<BoardState>({});
  const [tray, setTray] = useState<(TileStack | null)[]>([null, null, null]);
  const [incomingQueue, setIncomingQueue] = useState<
    { color: HexColorId; count: number; layers?: TileStackLayer[] }[]
  >([]);

  // Selection & Interactivity (Only tray stacks can be moved to board)
  const [selectedSource, setSelectedSource] = useState<{
    type: 'tray';
    index: number;
    stack: TileStack;
  } | null>(null);
  const [dragState, setDragState] = useState<{
    sourceType: 'tray';
    sourceIndex: number;
    stack: TileStack;
    isDragging: boolean;
  } | null>(null);
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);
  const hoveredCellIdRef = useRef<string | null>(null);
  const dragOverlayRef = useRef<HTMLDivElement | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const dragRef = useRef<{
    sourceType: 'tray';
    sourceIndex: number;
    stack: TileStack;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
  } | null>(null);

  const [activeBoosterMode, setActiveBoosterMode] = useState<BoosterType | null>(
    null
  );

  // Dynamic Neighbor Waterfall Cascade Stream & Move Lock
  const [activeTransfers, setActiveTransfers] = useState<CascadeTransfer[]>([]);
  const [isProcessingMove, setIsProcessingMove] = useState<boolean>(false);
  const moveTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearMoveTimeouts = useCallback(() => {
    moveTimeoutsRef.current.forEach(clearTimeout);
    moveTimeoutsRef.current = [];
  }, []);

  // Safety Watchdog: Prevent game from ever freezing on move processing
  useEffect(() => {
    if (!isProcessingMove) return;
    const watchdog = setTimeout(() => {
      setIsProcessingMove(false);
      setActiveTransfers([]);
    }, 2400);
    return () => clearTimeout(watchdog);
  }, [isProcessingMove]);

  // Clean up all pending timeouts and drag animation frame on unmount
  useEffect(() => {
    return () => {
      clearMoveTimeouts();
      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, [clearMoveTimeouts]);

  // Scores & Objectives
  const [score, setScore] = useState<number>(0);
  const [movesMade, setMovesMade] = useState<number>(0);
  const [movesRemaining, setMovesRemaining] = useState<number | undefined>(undefined);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);
  const [combo, setCombo] = useState<number>(1);
  const [completedColorCounts, setCompletedColorCounts] = useState<{
    [color: string]: number;
  }>({});
  const [unlockedCells, setUnlockedCells] = useState<string[]>([]);

  // Modals & Status
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(1);

  // Secondary Dialogs
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  // Undo History
  const [undoHistory, setUndoHistory] = useState<UndoSnapshot[]>([]);

  // Show tutorial on first launch if player has no completed levels
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('hexaflow_tutorial_seen');
      const completedCount = Object.keys(profile.completedLevels).length;
      if (!hasSeen && completedCount === 0 && profile.xp === 0) {
        setShowTutorial(true);
        localStorage.setItem('hexaflow_tutorial_seen', 'true');
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Sync sound settings to sound manager
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setMusicEnabled(settings.musicEnabled);
  }, [settings.soundEnabled, settings.musicEnabled]);

  // Save profile and stats changes
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Load level and initialize board
  const startLevel = useCallback(
    (lvl: LevelData, mode: GameMode = 'campaign') => {
      clearMoveTimeouts();
      setIsProcessingMove(false);
      setActiveTransfers([]);
      soundManager.playButton();
      setLevelData(lvl);
      setGameMode(mode);
      setCurrentLevelId(lvl.id);

      // Generate board cells based on radius or customCells
      const generated = generateHexHoneycomb(lvl.boardRadius);
      const cellsMap = new Map<string, BoardCell>();
      generated.forEach((c) => cellsMap.set(c.id, c));

      // Merge custom cells (blocked, locked, restricted colors, bonus cells)
      if (lvl.customCells) {
        lvl.customCells.forEach((c) => {
          cellsMap.set(c.id, { ...cellsMap.get(c.id), ...c });
        });
      }
      const finalCells = Array.from(cellsMap.values());
      setBoardCells(finalCells);

      // Initialize board stacks
      const initialBoard: BoardState = {};
      finalCells.forEach((c) => (initialBoard[c.id] = null));
      lvl.startingBoard.forEach((s) => {
        const layers =
          s.layers && s.layers.length > 0
            ? s.layers
            : [{ color: s.color, count: s.count }];
        const topColor = layers[layers.length - 1].color;
        const totalCount = layers.reduce((acc, l) => acc + l.count, 0);

        initialBoard[s.cellId] = {
          id: `starting_${s.cellId}`,
          color: topColor,
          count: totalCount,
          layers,
        };
      });
      setBoardState(initialBoard);

      // Queue of incoming pieces
      const pool = [...lvl.incomingPool];
      const initialTray: (TileStack | null)[] = [];
      for (let i = 0; i < 3; i++) {
        if (pool.length > 0) {
          const item = pool.shift()!;
          const layers =
            item.layers && item.layers.length > 0
              ? item.layers
              : [{ color: item.color, count: item.count }];
          const topColor = layers[layers.length - 1].color;
          const totalCount = layers.reduce((acc, l) => acc + l.count, 0);

          initialTray.push({
            id: `tray_${Date.now()}_${i}`,
            color: topColor,
            count: totalCount,
            layers,
          });
        } else {
          initialTray.push(
            generateSmartTrayStack(initialBoard, lvl.availableColors, lvl.id, i, lvl.stackCapacity)
          );
        }
      }
      setTray(initialTray);
      setIncomingQueue(pool);

      // Reset gameplay counters
      setScore(0);
      setMovesMade(0);
      setMovesRemaining(mode === 'relax' ? undefined : lvl.objective.moveLimit);
      setTimeRemaining(lvl.objective.timeLimitSeconds);
      setCombo(1);
      setCompletedColorCounts({});
      setUnlockedCells([]);
      setSelectedSource(null);
      setActiveBoosterMode(null);
      setIsComplete(false);
      setIsFailed(false);
      setIsPaused(false);
      setUndoHistory([]);

      setActiveView('game');
    },
    []
  );

  // Check level completion or failure after moves
  const checkGameRules = useCallback(
    (
      currentScore: number,
      currentMovesRemaining: number | undefined,
      currentCompletedColors: { [color: string]: number },
      currentBoard: BoardState
    ) => {
      const obj = levelData.objective;
      let won = false;

      if (obj.type === 'complete_colors' && obj.targetColors) {
        won = Object.entries(obj.targetColors).every(([color, req]) => {
          return (currentCompletedColors[color] || 0) >= (req || 1);
        });
      } else if (obj.type === 'target_score' && obj.targetScore) {
        won = currentScore >= obj.targetScore;
      } else if (obj.type === 'clear_board') {
        const remainingTiles = Object.values(currentBoard).filter(Boolean);
        won = remainingTiles.length === 0;
      } else if (obj.type === 'limited_moves' && obj.targetColors) {
        won = Object.entries(obj.targetColors).every(([color, req]) => {
          return (currentCompletedColors[color] || 0) >= (req || 1);
        });
      }

      if (won) {
        // Calculate stars
        let stars = 1;
        if (currentScore >= levelData.starThresholds[2]) stars = 3;
        else if (currentScore >= levelData.starThresholds[1]) stars = 2;

        setEarnedStars(stars);
        setIsComplete(true);

        const coinsAwarded = 100 + stars * 25;
        const xpAwarded = 25 + stars * 15;
        const isDailyMode = gameMode === 'daily';
        const todayStr = getLocalDateString();
        const nextStreak = isDailyMode ? calculateNextWinStreak(profile, todayStr) : profile.dailyStreak;

        // Update profile
        setProfile((prev) => {
          const prevCompleted = prev.completedLevels[levelData.id];
          const newBestScore = Math.max(
            prevCompleted?.bestScore || 0,
            currentScore
          );
          const newBestStars = Math.max(prevCompleted?.stars || 0, stars);

          return {
            ...prev,
            coins: prev.coins + coinsAwarded,
            xp: prev.xp + xpAwarded,
            level: Math.floor((prev.xp + xpAwarded) / 100) + 1,
            stars: prev.stars + (newBestStars - (prevCompleted?.stars || 0)),
            currentLevel:
              gameMode === 'campaign' && levelData.id === prev.currentLevel
                ? Math.min(prev.currentLevel + 1, CAMPAIGN_LEVELS.length)
                : prev.currentLevel,
            dailyStreak: isDailyMode ? nextStreak : prev.dailyStreak,
            lastDailyDate: isDailyMode ? todayStr : prev.lastDailyDate,
            dailyHistory: isDailyMode
              ? { ...prev.dailyHistory, [todayStr]: 'completed' }
              : prev.dailyHistory,
            completedLevels: {
              ...prev.completedLevels,
              [levelData.id]: {
                stars: newBestStars,
                bestScore: newBestScore,
                bestMoves: Math.min(
                  prevCompleted?.bestMoves || 999,
                  movesMade + 1
                ),
              },
            },
          };
        });

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalGamesPlayed: prev.totalGamesPlayed + 1,
          highestScore: Math.max(prev.highestScore, currentScore),
          dailyChallengesCompleted: isDailyMode
            ? prev.dailyChallengesCompleted + 1
            : prev.dailyChallengesCompleted,
          currentStreak: isDailyMode ? nextStreak : prev.currentStreak,
          longestStreak: isDailyMode
            ? Math.max(prev.longestStreak, nextStreak)
            : prev.longestStreak,
        }));

        if (gameMode === 'generator') {
          updateArchivedPuzzleResult(levelData.id, currentScore, stars);
        }

        saveActiveGame(null);
        return;
      }

      // Check failure (moves exhausted)
      if (currentMovesRemaining !== undefined && currentMovesRemaining <= 0) {
        soundManager.playInvalid();
        setIsFailed(true);
        saveActiveGame(null);

        if (gameMode === 'daily') {
          const todayStr = getLocalDateString();
          setProfile((prev) => ({
            ...prev,
            dailyStreak: 0, // Failure breaks streak
            lastDailyDate: todayStr,
            dailyHistory: {
              ...prev.dailyHistory,
              [todayStr]: 'failed',
            },
          }));
          setStats((prev) => ({
            ...prev,
            currentStreak: 0,
          }));
        }
      }
    },
    [levelData, gameMode, movesMade, profile]
  );

  // Execute Placement Logic (Only tray stacks can be placed onto board)
  const executePlacement = (
    targetCell: BoardCell,
    source: {
      type: 'tray';
      index: number;
      stack: TileStack;
    }
  ): boolean => {
    const validTargets = getValidTargetCells(
      source.stack,
      boardCells,
      boardState,
      levelData.stackCapacity,
      unlockedCells
    );

    if (!validTargets.includes(targetCell.id)) {
      soundManager.playInvalid();
      return false;
    }

    // Save undo snapshot before applying move
    setUndoHistory((prev) => [
      ...prev.slice(-9), // retain up to 10 undo steps
      {
        board: { ...boardState },
        tray: [...tray],
        incomingQueue: [...incomingQueue],
        score,
        movesMade,
        movesRemaining,
        combo,
        completedColors: { ...completedColorCounts },
        unlockedCells: [...unlockedCells],
      },
    ]);

    // Execute placement and cascading neighbor merge (only from tray)
    const result = executeMoveAndCascade(
      source.stack,
      targetCell,
      boardState,
      tray,
      source.index,
      null,
      boardCells,
      levelData.stackCapacity,
      unlockedCells
    );

    // Audio and transfers feedback
    if (result.mergesCount > 0) {
      soundManager.playMerge(0.6);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      soundManager.playCombo(nextCombo);

      if (result.transfers && result.transfers.length > 0) {
        soundManager.playTileWhoosh();
        setActiveTransfers(result.transfers);
      }
    } else {
      soundManager.playPlace();
      setCombo(1);
    }

    // Refill tray if a tray slot was emptied
    const nextTray = [...result.nextTray];
    const nextQueue = [...incomingQueue];
    if (source.type === 'tray' && source.index !== undefined) {
      if (nextQueue.length > 0) {
        const nextPiece = nextQueue.shift()!;
        const pieceLayers =
          nextPiece.layers && nextPiece.layers.length > 0
            ? nextPiece.layers
            : [{ color: nextPiece.color, count: nextPiece.count }];
        const topColor = pieceLayers[pieceLayers.length - 1].color;
        const totalCount = pieceLayers.reduce((s: number, l: TileStackLayer) => s + l.count, 0);

        nextTray[source.index] = {
          id: `tray_${Date.now()}_${source.index}`,
          color: topColor,
          count: totalCount,
          layers: pieceLayers,
        };
      } else {
        nextTray[source.index] = generateSmartTrayStack(
          result.nextBoard,
          levelData.availableColors,
          levelData.id,
          source.index,
          levelData.stackCapacity
        );
      }
    }

    // Update state
    const nextScore = score + result.scoreGained * (combo > 1 ? combo : 1);
    const nextMovesMade = movesMade + 1;
    const nextMovesRemaining =
      movesRemaining !== undefined ? Math.max(0, movesRemaining - 1) : undefined;

    const nextCompletedColors = { ...completedColorCounts };
    result.completedColors.forEach((c) => {
      nextCompletedColors[c] = (nextCompletedColors[c] || 0) + 1;
    });

    setBoardState(result.nextBoard);
    setTray(nextTray);
    setIncomingQueue(nextQueue);
    setScore(nextScore);
    setMovesMade(nextMovesMade);
    setMovesRemaining(nextMovesRemaining);
    setCompletedColorCounts(nextCompletedColors);
    setUnlockedCells(result.unlockedCells);
    setSelectedSource(null);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalMoves: prev.totalMoves + 1,
      totalMerges: prev.totalMerges + result.mergesCount,
      totalCompletedStacks:
        prev.totalCompletedStacks + result.completedColors.length,
      highestCombo: Math.max(prev.highestCombo, combo + (result.mergesCount > 0 ? 1 : 0)),
      highestScore: Math.max(prev.highestScore, nextScore),
    }));

    // Ultra-snappy GPU cascade duration (88ms flight)
    const hasTransfers = (result.transfers && result.transfers.length > 0) || false;
    const transferFlightDurationMs = hasTransfers ? 88 : 0;

    if (result.isComplete) {
      setIsProcessingMove(true);

      const triggerCompletionDissolve = () => {
        // Play celebratory chime and mark all completed stacks as clearing with crown & burst
        soundManager.playCompleteStack();
        const clearedIds =
          result.clearedCellIds.length > 0 ? result.clearedCellIds : [targetCell.id];
        setBoardState((prev) => {
          const next = { ...prev };
          clearedIds.forEach((cId) => {
            if (next[cId] || result.nextBoard[cId]) {
              next[cId] = {
                ...(next[cId] || result.nextBoard[cId]!),
                isCompleted: true,
                animating: 'clearing',
              };
            }
          });
          return next;
        });
        setActiveTransfers([]);

        // Instant celebratory burst & dissolve (75ms), update to settled board & release lock
        const finishTimer = setTimeout(() => {
          setBoardState(result.nextBoard);
          setIsProcessingMove(false);

          // Check objectives after clearing
          checkGameRules(
            nextScore,
            nextMovesRemaining,
            nextCompletedColors,
            result.nextBoard
          );
        }, 75);
        moveTimeoutsRef.current.push(finishTimer);
      };

      if (hasTransfers) {
        // Wait for cascade chips to fly and land on the stack before triggering completion
        const cascadeTimer = setTimeout(() => {
          triggerCompletionDissolve();
        }, transferFlightDurationMs);
        moveTimeoutsRef.current.push(cascadeTimer);
      } else {
        // Direct complete without waterfall flight (immediate celebration burst)
        triggerCompletionDissolve();
      }
    } else {
      if (hasTransfers) {
        setIsProcessingMove(true);
        const endTransferTimer = setTimeout(() => {
          setActiveTransfers([]);
          setIsProcessingMove(false);
          checkGameRules(
            nextScore,
            nextMovesRemaining,
            nextCompletedColors,
            result.nextBoard
          );
        }, transferFlightDurationMs);
        moveTimeoutsRef.current.push(endTransferTimer);
      } else {
        setIsProcessingMove(false);
        // Immediate check objectives
        checkGameRules(
          nextScore,
          nextMovesRemaining,
          nextCompletedColors,
          result.nextBoard
        );
      }
    }

    return true;
  };

  // Handle Board Cell Click
  const handleCellClick = useCallback(
    (cell: BoardCell) => {
      if (isProcessingMove || isPaused || isFailed || isComplete) return;
      // If in Hammer mode: smash the stack on this cell!
      if (activeBoosterMode === 'hammer') {
        const stack = boardState[cell.id];
        if (stack) {
          soundManager.playBooster();
          setBoardState((prev) => ({ ...prev, [cell.id]: null }));
          setActiveBoosterMode(null);
          setProfile((prev) => ({
            ...prev,
            boosters: { ...prev.boosters, hammer: Math.max(0, prev.boosters.hammer - 1) },
          }));
        }
        return;
      }

      // Normal move: Only allow placing a stack selected from the tray
      if (selectedSource && selectedSource.type === 'tray') {
        executePlacement(cell, selectedSource);
        return;
      }

      // Board tiles cannot be selected or moved!
    },
    [
      isProcessingMove,
      isPaused,
      isFailed,
      isComplete,
      activeBoosterMode,
      boardState,
      selectedSource,
      executePlacement,
    ]
  );

  // Handle Drag & Drop with Pointer Events (from Tray to Board only)
  // Highly optimized for tablets: uses requestAnimationFrame and direct GPU transform
  // to achieve zero-lag, 60fps/120fps fluid movement with no React re-render overhead.
  const handleDragStart = useCallback(
    (e: React.PointerEvent, slotIdx: number, stack: TileStack) => {
      if (isProcessingMove || isPaused || isFailed || isComplete) return;
      if (activeBoosterMode === 'hammer') return;

      const pointerTarget = e.currentTarget as HTMLElement;
      try {
        pointerTarget.setPointerCapture(e.pointerId);
      } catch {}

      // Immediately select source so valid targets highlight
      setSelectedSource({
        type: 'tray',
        index: slotIdx,
        stack,
      });

      // Pre-warm the drag overlay element with this stack immediately!
      setDragState({
        sourceType: 'tray',
        sourceIndex: slotIdx,
        stack,
        isDragging: false,
      });

      const startX = e.clientX;
      const startY = e.clientY;

      dragRef.current = {
        sourceType: 'tray',
        sourceIndex: slotIdx,
        stack,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
        isDragging: false,
      };

      const updateOverlayPosition = (x: number, y: number) => {
        if (dragOverlayRef.current) {
          dragOverlayRef.current.style.transform = `translate3d(${x}px, ${y - 34}px, 0) translate(-50%, -50%) scale(1.15)`;
        }
      };

      // Set initial position
      updateOverlayPosition(startX, startY);

      const onPointerMove = (ev: PointerEvent) => {
        if (!dragRef.current) return;
        ev.preventDefault();

        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        const dist = Math.hypot(dx, dy);

        dragRef.current.currentX = ev.clientX;
        dragRef.current.currentY = ev.clientY;

        if (!dragRef.current.isDragging && dist > 3) {
          dragRef.current.isDragging = true;
          if (dragOverlayRef.current) {
            dragOverlayRef.current.style.display = 'block';
          }
          setDragState((prev) => (prev ? { ...prev, isDragging: true } : null));
        }

        if (dragRef.current.isDragging) {
          // Direct instantaneous GPU update on pointermove (0ms instantaneous tracking!)
          updateOverlayPosition(ev.clientX, ev.clientY);

          // Batch expensive hit testing into requestAnimationFrame
          if (dragRafRef.current === null) {
            dragRafRef.current = requestAnimationFrame(() => {
              dragRafRef.current = null;
              if (!dragRef.current || !dragRef.current.isDragging) return;

              const el = document.elementFromPoint(
                dragRef.current.currentX,
                dragRef.current.currentY
              );
              const cellEl = el?.closest('[data-cell-id]');
              const targetId = cellEl?.getAttribute('data-cell-id') || null;

              if (hoveredCellIdRef.current !== targetId) {
                hoveredCellIdRef.current = targetId;
                setHoveredCellId(targetId);
              }
            });
          }
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        try {
          pointerTarget.releasePointerCapture(ev.pointerId);
        } catch {}

        if (dragRafRef.current !== null) {
          cancelAnimationFrame(dragRafRef.current);
          dragRafRef.current = null;
        }

        if (dragOverlayRef.current) {
          dragOverlayRef.current.style.display = 'none';
        }

        const activeDrag = dragRef.current;
        dragRef.current = null;
        const finalHoveredId = hoveredCellIdRef.current;
        hoveredCellIdRef.current = null;
        setHoveredCellId(null);
        setDragState(null);

        if (!activeDrag) return;

        if (activeDrag.isDragging) {
          // Identify cell under pointer
          let targetId = finalHoveredId;
          if (!targetId) {
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const cellEl = el?.closest('[data-cell-id]');
            targetId = cellEl?.getAttribute('data-cell-id') || null;
          }

          if (targetId) {
            const targetCell = boardCells.find((c) => c.id === targetId);
            if (targetCell) {
              const success = executePlacement(targetCell, {
                type: 'tray',
                index: activeDrag.sourceIndex,
                stack: activeDrag.stack,
              });
              if (success) {
                setSelectedSource(null);
                return;
              }
            }
          }
          // Dropped in invalid area
          soundManager.playButton();
          setSelectedSource(null);
        } else {
          // Was a simple tap/click
          soundManager.playSelect();
        }
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [
      isProcessingMove,
      isPaused,
      isFailed,
      isComplete,
      activeBoosterMode,
      boardCells,
      executePlacement,
    ]
  );

  // Handle Tray Slot Click
  const handleTraySelect = useCallback(
    (index: number) => {
      if (isProcessingMove || isPaused || isFailed || isComplete) return;
      const stack = tray[index];
      if (!stack) return;

      if (
        selectedSource?.type === 'tray' &&
        selectedSource.index === index
      ) {
        // Deselect
        setSelectedSource(null);
      } else {
        soundManager.playSelect();
        setSelectedSource({
          type: 'tray',
          index,
          stack,
        });
      }
    },
    [isProcessingMove, isPaused, isFailed, isComplete, tray, selectedSource]
  );

  // Undo Move
  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    clearMoveTimeouts();
    setIsProcessingMove(false);
    setActiveTransfers([]);
    soundManager.playButton();

    const last = undoHistory[undoHistory.length - 1];
    setBoardState(last.board);
    setTray(last.tray);
    setIncomingQueue(last.incomingQueue);
    setScore(last.score);
    setMovesMade(last.movesMade);
    setMovesRemaining(last.movesRemaining);
    setCombo(last.combo);
    setCompletedColorCounts(last.completedColors);
    setUnlockedCells(last.unlockedCells);
    setSelectedSource(null);
    setIsFailed(false);

    setUndoHistory((prev) => prev.slice(0, -1));

    if (gameMode !== 'relax' && profile.boosters.undo > 0) {
      setProfile((prev) => ({
        ...prev,
        boosters: { ...prev.boosters, undo: Math.max(0, prev.boosters.undo - 1) },
      }));
    }
  };

  // Boosters
  const handleUseBooster = (type: BoosterType) => {
    soundManager.playBooster();

    if (type === 'undo') {
      handleUndo();
    } else if (type === 'shuffle') {
      // Re-roll tray
      const shuffled = tray.map((item, i) => {
        if (!item) return null;
        const col =
          levelData.availableColors[
            Math.floor(Math.random() * levelData.availableColors.length)
          ];
        return {
          id: `tray_shuffled_${Date.now()}_${i}`,
          color: col,
          count: item.count,
        };
      });
      setTray(shuffled);
      setProfile((prev) => ({
        ...prev,
        boosters: { ...prev.boosters, shuffle: Math.max(0, prev.boosters.shuffle - 1) },
      }));
    } else if (type === 'hammer') {
      setActiveBoosterMode('hammer');
    } else if (type === 'wild_hex') {
      // Turn selected stack or first tray stack into Wild Rainbow
      if (selectedSource) {
        selectedSource.stack.color = 'wild-rainbow';
        setSelectedSource({ ...selectedSource });
      } else {
        const nextTray = [...tray];
        const firstIdx = nextTray.findIndex((s) => s !== null);
        if (firstIdx !== -1 && nextTray[firstIdx]) {
          nextTray[firstIdx] = {
            ...nextTray[firstIdx]!,
            color: 'wild-rainbow',
          };
          setTray(nextTray);
        }
      }
      setProfile((prev) => ({
        ...prev,
        boosters: { ...prev.boosters, wild_hex: Math.max(0, prev.boosters.wild_hex - 1) },
      }));
    } else if (type === 'extra_moves') {
      setMovesRemaining((prev) => (prev !== undefined ? prev + 5 : 5));
      setIsFailed(false);
      setProfile((prev) => ({
        ...prev,
        boosters: {
          ...prev.boosters,
          extra_moves: Math.max(0, prev.boosters.extra_moves - 1),
        },
      }));
    }
  };

  // Modes Navigation
  const handleStartMode = (mode: GameMode, levelId: number = 1) => {
    if (mode === 'campaign') {
      const lvl = CAMPAIGN_LEVELS[levelId - 1] || CAMPAIGN_LEVELS[0];
      startLevel(lvl, 'campaign');
    } else if (mode === 'daily') {
      const todayStr = getLocalDateString();
      if (!canAttemptDaily(profile, todayStr)) {
        soundManager.playInvalid();
        setShowDailyModal(true);
        return;
      }
      const seed = dateToSeed(todayStr);
      const lvl = generateProceduralLevel(900, "Today's Daily", 3, seed, 'daily');
      startLevel(lvl, 'daily');
    } else if (mode === 'weekly') {
      const weekSeed = dateToSeed(new Date().getFullYear() + '-W' + Math.ceil(new Date().getDate() / 7));
      const lvl = generateProceduralLevel(950, 'Weekly Mega Challenge', 4, weekSeed, 'weekly');
      startLevel(lvl, 'weekly');
    } else if (mode === 'generator') {
      setShowGeneratorModal(true);
    } else if (mode === 'endless') {
      const lvl = generateProceduralLevel(1, 'Endless Hex', 2, Date.now(), 'endless');
      startLevel(lvl, 'endless');
    } else if (mode === 'relax') {
      const lvl = CAMPAIGN_LEVELS[0];
      startLevel(lvl, 'relax');
    }
  };

  const handleStartGeneratedPuzzle = (lvl: LevelData) => {
    addPuzzleToArchive(lvl);
    startLevel(lvl, 'generator');
  };

  // Valid Drop Target IDs for Board
  const validTargetIds = useMemo(() => {
    return selectedSource
      ? getValidTargetCells(
          selectedSource.stack,
          boardCells,
          boardState,
          levelData.stackCapacity,
          unlockedCells
        )
      : [];
  }, [
    selectedSource,
    boardCells,
    boardState,
    levelData.stackCapacity,
    unlockedCells,
  ]);

  return (
    <div
      className={`relative w-full h-full min-h-screen flex flex-col items-center justify-between ${
        settings.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      } ${settings.highContrast ? 'contrast-125' : ''} select-none overflow-hidden touch-manipulation font-sans`}
    >
      {/* View: Main Home Menu */}
      {activeView === 'menu' && (
        <MainMenu
          profile={profile}
          onStartMode={handleStartMode}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenDaily={() => setShowDailyModal(true)}
          onOpenWeekly={() => setShowWeeklyModal(true)}
          onOpenGenerator={() => setShowGeneratorModal(true)}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      )}

      {/* View: Active Game Board */}
      {activeView === 'game' && (
        <div className="relative w-full h-full min-h-screen flex flex-col justify-between p-3 md:p-6 max-w-5xl mx-auto">
          {/* Top Tablet HUD */}
          <HUD
            level={levelData}
            mode={gameMode}
            score={score}
            movesMade={movesMade}
            movesRemaining={movesRemaining}
            timeRemaining={timeRemaining}
            combo={combo}
            completedColorCounts={completedColorCounts}
            boosters={profile.boosters}
            canUndo={undoHistory.length > 0}
            onUndo={handleUndo}
            onUseBooster={handleUseBooster}
            onOpenPause={() => setIsPaused(true)}
            onOpenTutorial={() => setShowTutorial(true)}
            onOpenDevTools={() => setShowDevTools(true)}
          />

          {/* Active Hammer Mode Banner Notification */}
          {activeBoosterMode === 'hammer' && (
            <div className="w-full flex items-center justify-center py-2 px-4 bg-rose-600/90 text-white font-display font-bold text-xs rounded-xl shadow-lg animate-pulse gap-2">
              <Hammer className="w-4 h-4" />
              <span>HAMMER ACTIVE: Tap any stack on the board to smash it!</span>
              <button
                onClick={() => setActiveBoosterMode(null)}
                className="underline text-[10px] ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Main 3D Hexagonal Honeycomb Board */}
          <main className="flex-1 flex items-center justify-center my-auto py-2 w-full">
            <HexBoard
              cells={boardCells}
              boardState={boardState}
              hoveredCellId={hoveredCellId}
              onCellClick={handleCellClick}
              validTargetIds={validTargetIds}
              showSymbols={settings.showAccessibilitySymbols}
              showCount={settings.showTileCount}
              maxCapacity={levelData.stackCapacity}
              activeTransfers={activeTransfers}
              onTransfersCompleted={() => setActiveTransfers([])}
            />
          </main>

          {/* Bottom Tray Staging Area */}
          <footer className="w-full flex flex-col items-center gap-2 pb-2">
            <div className="flex items-center justify-center gap-3 md:gap-6 bg-slate-900/85 backdrop-blur-md p-3 md:p-4 rounded-3xl border border-slate-700/60 shadow-xl">
              {tray.map((stack, idx) => (
                <TraySlot
                  key={idx}
                  index={idx}
                  stack={stack}
                  isSelected={
                    selectedSource?.type === 'tray' &&
                    selectedSource.index === idx
                  }
                  isDragging={
                    Boolean(dragState?.isDragging &&
                    dragState.sourceType === 'tray' &&
                    dragState.sourceIndex === idx)
                  }
                  onSelect={() => handleTraySelect(idx)}
                  onDragStart={(e, slotIdx, slotStack) =>
                    handleDragStart(e, slotIdx, slotStack)
                  }
                  showSymbols={settings.showAccessibilitySymbols}
                  showCount={settings.showTileCount}
                  maxCapacity={levelData.stackCapacity}
                />
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Tap or drag a stack from the tray to an empty cell or matching stack
            </span>
          </footer>
        </div>
      )}

      {/* Floating Dragged Stack Overlay (Follows finger/pointer with zero React latency) */}
      <div
        ref={dragOverlayRef}
        className="fixed pointer-events-none z-50 select-none will-change-transform"
        style={{
          top: 0,
          left: 0,
          display: dragState && dragState.isDragging ? 'block' : 'none',
          transform: `translate3d(${dragRef.current?.currentX ?? 0}px, ${(dragRef.current?.currentY ?? 0) - 34}px, 0) translate(-50%, -50%) scale(1.15)`,
        }}
      >
        {dragState && (
          <div className="filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <HexTileStack
              stack={dragState.stack}
              size={48}
              isSelected={false}
              showSymbol={settings.showAccessibilitySymbols}
              showCount={settings.showTileCount}
              maxCapacity={levelData.stackCapacity}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isComplete && (
        <LevelCompleteModal
          level={levelData}
          score={score}
          bestScore={profile.completedLevels[levelData.id]?.bestScore || score}
          movesMade={movesMade}
          stars={earnedStars}
          coinsAwarded={100 + earnedStars * 25}
          xpAwarded={25 + earnedStars * 15}
          isDaily={gameMode === 'daily'}
          dailyStreak={profile.dailyStreak}
          onNextLevel={() => {
            if (gameMode === 'generator') {
              const nextSeed = Date.now() + Math.floor(Math.random() * 1000);
              const nextGen = generateProceduralLevel(
                nextSeed % 10000,
                `Procedural Puzzle #${nextSeed % 1000}`,
                levelData.difficulty,
                nextSeed,
                'generator',
                { boardRadius: levelData.boardRadius }
              );
              addPuzzleToArchive(nextGen, nextSeed);
              startLevel(nextGen, 'generator');
            } else {
              const nextLvl = CAMPAIGN_LEVELS[levelData.id] || CAMPAIGN_LEVELS[0];
              startLevel(nextLvl, 'campaign');
            }
          }}
          onReplay={() => startLevel(levelData, gameMode)}
          onLevelSelect={() => {
            setIsComplete(false);
            setShowLevelSelect(true);
          }}
          onQuitToMenu={() => {
            setIsComplete(false);
            setActiveView('menu');
          }}
          hasNextLevel={(gameMode === 'campaign' && levelData.id < CAMPAIGN_LEVELS.length) || gameMode === 'generator'}
        />
      )}

      {isFailed && (
        <LevelFailedModal
          level={levelData}
          score={score}
          boosters={profile.boosters}
          canUndo={undoHistory.length > 0}
          isDaily={gameMode === 'daily'}
          onUndo={handleUndo}
          onUseExtraMoves={() => handleUseBooster('extra_moves')}
          onUseShuffle={() => handleUseBooster('shuffle')}
          onRetry={() => startLevel(levelData, gameMode)}
          onLevelSelect={() => {
            setIsFailed(false);
            setShowLevelSelect(true);
          }}
          onQuitToMenu={() => {
            setIsFailed(false);
            setActiveView('menu');
          }}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            startLevel(levelData, gameMode);
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenTutorial={() => setShowTutorial(true)}
          onQuitToMenu={() => {
            if (gameMode === 'daily' && !isComplete) {
              const todayStr = getLocalDateString();
              setProfile((prev) => ({
                ...prev,
                dailyStreak: 0,
                lastDailyDate: todayStr,
                dailyHistory: {
                  ...prev.dailyHistory,
                  [todayStr]: 'failed',
                },
              }));
              setStats((prev) => ({
                ...prev,
                currentStreak: 0,
              }));
            }
            setIsPaused(false);
            setActiveView('menu');
          }}
          confirmRestart={settings.confirmRestart}
          isDaily={gameMode === 'daily'}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          profile={profile}
          onSelectLevel={(id) => {
            setShowLevelSelect(false);
            const lvl = CAMPAIGN_LEVELS[id - 1];
            if (lvl) startLevel(lvl, 'campaign');
          }}
          onOpenGenerator={() => setShowGeneratorModal(true)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showDailyModal && (
        <DailyChallengeModal
          profile={profile}
          stats={stats}
          onStartDaily={() => {
            setShowDailyModal(false);
            handleStartMode('daily');
          }}
          onClose={() => setShowDailyModal(false)}
        />
      )}

      {showWeeklyModal && (
        <WeeklyChallengeModal
          profile={profile}
          stats={stats}
          onStartWeekly={() => {
            setShowWeeklyModal(false);
            handleStartMode('weekly');
          }}
          onClose={() => setShowWeeklyModal(false)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          profile={profile}
          stats={stats}
          unlockedIds={unlockedAchievements}
          onClaimReward={(id, coins, xp) => {
            soundManager.playBooster();
            const nextUnlocked = [...unlockedAchievements, id];
            setUnlockedAchievements(nextUnlocked);
            saveUnlockedAchievements(nextUnlocked);
            setProfile((prev) => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1,
            }));
          }}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showStats && (
        <StatsModal
          profile={profile}
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          profile={profile}
          onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
          onUpdateProfileName={(name) => setProfile((prev) => ({ ...prev, name }))}
          onResetProgress={() => {
            clearAllGameData();
            window.location.reload();
          }}
          onOpenDevTools={() => setShowDevTools(true)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDevTools && (
        <DevToolsModal
          currentLevelId={levelData.id}
          activeLevelData={levelData}
          onJumpToLevel={(id) => {
            const lvl = CAMPAIGN_LEVELS[id - 1];
            if (lvl) startLevel(lvl, 'campaign');
          }}
          onStartGeneratedLevel={handleStartGeneratedPuzzle}
          onAddCurrency={(coins, xp) => {
            setProfile((prev) => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
            }));
          }}
          onUnlockAllLevels={() => {
            setProfile((prev) => {
              const allCompleted: PlayerProfile['completedLevels'] = {};
              CAMPAIGN_LEVELS.forEach((l) => {
                allCompleted[l.id] = { stars: 3, bestScore: 5000, bestMoves: 10 };
              });
              return {
                ...prev,
                currentLevel: CAMPAIGN_LEVELS.length,
                stars: CAMPAIGN_LEVELS.length * 3,
                completedLevels: allCompleted,
              };
            });
          }}
          onClose={() => setShowDevTools(false)}
        />
      )}

      {showGeneratorModal && (
        <PuzzleGeneratorModal
          onStartGeneratedPuzzle={handleStartGeneratedPuzzle}
          onClose={() => setShowGeneratorModal(false)}
        />
      )}

      {showTutorial && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onStartGame={() => {
            setShowTutorial(false);
            if (activeView !== 'game') {
              handleStartMode('campaign', profile.currentLevel || 1);
            }
          }}
        />
      )}
    </div>
  );
}
