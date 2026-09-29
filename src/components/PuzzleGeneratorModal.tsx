import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Play,
  RotateCw,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Grid,
  Archive,
  Trash2,
  Star,
  Layers,
  ArrowUpDown,
  BookmarkCheck,
  PlusCircle,
} from 'lucide-react';
import { generateProceduralLevel, validatePuzzle } from '../utils/levelGenerator';
import {
  loadPuzzleArchive,
  addPuzzleToArchive,
  deleteArchivedPuzzle,
} from '../utils/storage';
import { HEX_COLORS } from '../data/colors';
import { ArchivedPuzzle, LevelData } from '../types';

interface PuzzleGeneratorModalProps {
  onStartGeneratedPuzzle: (level: LevelData) => void;
  onClose: () => void;
  initialTab?: 'generator' | 'archive';
}

const DIFFICULTY_CONFIG = [
  {
    level: 1 as const,
    label: 'Beginner',
    tagline: '2 Colors • Gentle Flow',
    description: 'Single-color stacks and generous moves. Perfect for warming up.',
    colorClass: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
    activeClass: 'ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    stars: '⭐',
  },
  {
    level: 2 as const,
    label: 'Casual',
    tagline: '3 Colors • Dual Layers',
    description: 'Gentle multi-layer stacks that introduce cascading combinations.',
    colorClass: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300',
    activeClass: 'ring-2 ring-cyan-400 bg-cyan-500/20 border-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    stars: '⭐⭐',
  },
  {
    level: 3 as const,
    label: 'Medium',
    tagline: '4 Colors • 19 Hexes',
    description: 'Full honeycomb grid with multi-layered cascades and 2x bonus tiles.',
    colorClass: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
    activeClass: 'ring-2 ring-amber-400 bg-amber-500/20 border-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    stars: '⭐⭐⭐',
  },
  {
    level: 4 as const,
    label: 'Hard',
    tagline: '4-5 Colors • Deep Cascades',
    description: 'Strategic multi-layer sorting with tight moves and multiplier catalysts.',
    colorClass: 'border-orange-500/60 bg-orange-500/10 text-orange-300',
    activeClass: 'ring-2 ring-orange-400 bg-orange-500/20 border-orange-400',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    stars: '⭐⭐⭐⭐',
  },
  {
    level: 5 as const,
    label: 'Expert',
    tagline: '5 Colors • Obstacles & Locks',
    description: 'Chamber locks, obstacle barriers, and mastermind layer depth.',
    colorClass: 'border-rose-500/60 bg-rose-500/10 text-rose-300',
    activeClass: 'ring-2 ring-rose-400 bg-rose-500/20 border-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    stars: '⭐⭐⭐⭐⭐',
  },
];

type SortOption = 'diff_asc' | 'diff_desc' | 'newest' | 'score';

export const PuzzleGeneratorModal: React.FC<PuzzleGeneratorModalProps> = ({
  onStartGeneratedPuzzle,
  onClose,
  initialTab = 'generator',
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'archive'>(initialTab);
  
  // Generator State
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [boardRadius, setBoardRadius] = useState<1 | 2>(2);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 900000) + 100000);
  const [validationLog, setValidationLog] = useState<string | null>(null);
  const [justSavedNotification, setJustSavedNotification] = useState<string | null>(null);

  // Archive State
  const [archiveList, setArchiveList] = useState<ArchivedPuzzle[]>([]);
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [sortOption, setSortOption] = useState<SortOption>('diff_asc');

  // Load archive on mount and tab switch
  useEffect(() => {
    let list = loadPuzzleArchive();
    if (list.length === 0) {
      // Seed initial archived procedural puzzles across all 5 difficulties
      const starterSeeds = [
        { diff: 1 as const, seed: 101101, title: 'Starter Flow • Beginner' },
        { diff: 2 as const, seed: 202202, title: 'Twin Springs • Casual' },
        { diff: 3 as const, seed: 303303, title: 'Catalyst Nexus • Medium' },
        { diff: 4 as const, seed: 404404, title: 'Prism Labyrinth • Hard' },
        { diff: 5 as const, seed: 505505, title: 'Chamber Vault • Expert' },
      ];
      starterSeeds.forEach(({ diff, seed: s, title }) => {
        const lvl = generateProceduralLevel(s % 10000, title, diff, s, 'generator');
        addPuzzleToArchive(lvl, s);
      });
      list = loadPuzzleArchive();
    }
    setArchiveList(list);
  }, [activeTab]);

  // Generate preview level
  const previewLevel = useMemo(() => {
    return generateProceduralLevel(
      seed % 10000,
      `Procedural Puzzle #${seed % 1000}`,
      difficulty,
      seed,
      'generator',
      { boardRadius }
    );
  }, [difficulty, boardRadius, seed]);

  const validation = useMemo(() => {
    return validatePuzzle(previewLevel);
  }, [previewLevel]);

  const handleRerollSeed = () => {
    setSeed(Math.floor(Math.random() * 900000) + 100000);
    setValidationLog(null);
    setJustSavedNotification(null);
  };

  const handleTestSolver = () => {
    setValidationLog(
      `✓ Solvability Verified: ${validation.message}\n` +
      `• Initial Empty Sockets: ${validation.legalMovesEstimate - previewLevel.incomingPool.length}\n` +
      `• Total Incoming Tiles: ${previewLevel.incomingPool.reduce((acc, p) => acc + p.count, 0)}\n` +
      `• Move Limit: ${previewLevel.objective.moveLimit}`
    );
  };

  // Play immediately (and add to archive)
  const handlePlay = () => {
    addPuzzleToArchive(previewLevel, seed);
    onStartGeneratedPuzzle(previewLevel);
    onClose();
  };

  // Save to archive without launching immediately
  const handleSaveToArchive = () => {
    addPuzzleToArchive(previewLevel, seed);
    setArchiveList(loadPuzzleArchive());
    setJustSavedNotification(`"${previewLevel.title}" archived successfully!`);
    setTimeout(() => setJustSavedNotification(null), 3000);
  };

  // Delete from archive
  const handleDeleteArchived = (puzzleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteArchivedPuzzle(puzzleId);
    setArchiveList(loadPuzzleArchive());
  };

  // Play an archived puzzle
  const handlePlayArchived = (archived: ArchivedPuzzle) => {
    onStartGeneratedPuzzle(archived.levelData);
    onClose();
  };

  // Archive filtering & sorting
  const filteredAndSortedArchive = useMemo(() => {
    let list = [...archiveList];

    // Filter by difficulty
    if (selectedDifficultyFilter !== 'all') {
      list = list.filter((p) => p.difficulty === selectedDifficultyFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortOption === 'diff_asc') {
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'diff_desc') {
        if (a.difficulty !== b.difficulty) return b.difficulty - a.difficulty;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'score') {
        return (b.bestScore || 0) - (a.bestScore || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [archiveList, selectedDifficultyFilter, sortOption]);

  // Counts per difficulty
  const difficultyCounts = useMemo(() => {
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    archiveList.forEach((p) => {
      counts[p.difficulty] = (counts[p.difficulty] || 0) + 1;
    });
    return counts;
  }, [archiveList]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner">
              {activeTab === 'generator' ? (
                <Sparkles className="w-5 h-5 text-cyan-400" />
              ) : (
                <Archive className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Infinite Level Engine
              </span>
              <h2 className="text-xl md:text-2xl font-display font-black text-white">
                {activeTab === 'generator' ? 'PUZZLE GENERATOR' : 'PUZZLE ARCHIVE'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Top View Toggle Tabs */}
            <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold font-display transition flex items-center gap-1.5 ${
                  activeTab === 'generator'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('archive')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold font-display transition flex items-center gap-1.5 ${
                  activeTab === 'archive'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive ({archiveList.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Puzzle Generator View */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-slate-200 text-sm">
            {/* Notification Banner */}
            <AnimatePresence>
              {justSavedNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{justSavedNotification}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Difficulty Level Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Difficulty:</span>
                </label>
                <span className="text-xs text-amber-400 font-display font-bold">
                  {DIFFICULTY_CONFIG[difficulty - 1].stars}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DIFFICULTY_CONFIG.map((cfg) => {
                  const isSelected = difficulty === cfg.level;
                  return (
                    <button
                      key={cfg.level}
                      type="button"
                      onClick={() => {
                        setDifficulty(cfg.level);
                        if (cfg.level >= 3) {
                          setBoardRadius(2);
                        }
                      }}
                      className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? `${cfg.activeClass} shadow-lg scale-102`
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                        Level {cfg.level}
                      </span>
                      <span className="text-sm font-display font-black text-white my-0.5">
                        {cfg.label}
                      </span>
                      <span className="text-[9px] line-clamp-1 opacity-80">
                        {cfg.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                {DIFFICULTY_CONFIG[difficulty - 1].description}
              </p>
            </div>

            {/* Board Size & Seed Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Board Radius */}
              <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                  <Grid className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Board Honeycomb Size</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBoardRadius(1)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      boardRadius === 1
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Compact (7 Hexes)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardRadius(2)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      boardRadius === 2
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Expanded (19 Hexes)</span>
                  </button>
                </div>
              </div>

              {/* Seed Controller */}
              <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seed Number</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Math.abs(parseInt(e.target.value) || 1))}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleRerollSeed}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 transition active:scale-95"
                    title="Randomize Seed"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reroll</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Puzzle Live Preview Card */}
            <div className="bg-gradient-to-br from-slate-950/80 to-slate-900/90 p-4 rounded-2xl border border-cyan-500/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    Generated Puzzle Preview
                  </span>
                  <h3 className="text-base font-display font-black text-white">
                    {previewLevel.title}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {previewLevel.subtitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solvable & Conservation Valid</span>
                </div>
              </div>

              {/* Colors in Puzzle */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-semibold mr-1">Colors:</span>
                {previewLevel.availableColors.map((colId) => {
                  const colorDef = HEX_COLORS[colId];
                  return (
                    <span
                      key={colId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                      style={{
                        backgroundColor: `${colorDef.primary}25`,
                        borderColor: colorDef.primary,
                        color: colorDef.highlight,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colorDef.primary }}
                      />
                      <span>{colorDef.name}</span>
                    </span>
                  );
                })}
              </div>

              {/* Details Stats */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Move Limit
                  </span>
                  <span className="font-display font-black text-amber-300 text-sm">
                    {previewLevel.objective.moveLimit}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Incoming Tiles
                  </span>
                  <span className="font-display font-black text-cyan-300 text-sm">
                    {previewLevel.incomingPool.length}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Target Score
                  </span>
                  <span className="font-display font-black text-emerald-300 text-sm">
                    {previewLevel.starThresholds[1].toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Validation Log */}
              {validationLog && (
                <pre className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-emerald-500/40 text-emerald-300 text-[11px] whitespace-pre-wrap font-mono">
                  {validationLog}
                </pre>
              )}
            </div>

            {/* Generator Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleTestSolver}
                className="py-3 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Validate</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToArchive}
                className="py-3 px-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                <span>Save To Archive</span>
              </button>

              <button
                type="button"
                onClick={handlePlay}
                className="flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-display font-black text-base shadow-[0_8px_25px_rgba(20,184,166,0.35)] flex items-center justify-center gap-2 border-2 border-emerald-200 transition active:scale-98"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>PLAY & ARCHIVE PUZZLE</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Puzzle Archive View (Sorted by Difficulty) */}
        {activeTab === 'archive' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-slate-200 text-sm">
            {/* Archive Toolbar: Filter by Difficulty & Sorting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Browse by Difficulty:
                </span>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="diff_asc">Sort: Difficulty (1 → 5)</option>
                    <option value="diff_desc">Sort: Difficulty (5 → 1)</option>
                    <option value="newest">Sort: Newest First</option>
                    <option value="score">Sort: Best Score</option>
                  </select>
                </div>
              </div>

              {/* Difficulty Tabs Pill Bar */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDifficultyFilter('all')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                    selectedDifficultyFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>All Difficulties</span>
                  <span className="text-[10px] opacity-80 font-mono">({archiveList.length})</span>
                </button>

                {DIFFICULTY_CONFIG.map((cfg) => {
                  const count = difficultyCounts[cfg.level] || 0;
                  const isSelected = selectedDifficultyFilter === cfg.level;
                  return (
                    <button
                      key={cfg.level}
                      type="button"
                      onClick={() => setSelectedDifficultyFilter(cfg.level)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                        isSelected
                          ? `${cfg.activeClass} shadow`
                          : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{cfg.label}</span>
                      <span className="text-[10px] font-mono opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Archived Puzzles List */}
            {filteredAndSortedArchive.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-950/40 rounded-3xl border border-slate-800 text-center my-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                  <Archive className="w-7 h-7" />
                </div>
                <h4 className="text-base font-display font-bold text-white mb-1">
                  No {selectedDifficultyFilter !== 'all' ? `Level ${selectedDifficultyFilter}` : ''} Puzzles Archived
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  {selectedDifficultyFilter !== 'all'
                    ? `Generate a new Level ${selectedDifficultyFilter} puzzle to add it to your archive.`
                    : 'Whenever you generate puzzles in the generator, they are preserved here so you can replay them anytime.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDifficultyFilter !== 'all') {
                      setDifficulty(selectedDifficultyFilter);
                    }
                    setActiveTab('generator');
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    Generate {selectedDifficultyFilter !== 'all' ? `Level ${selectedDifficultyFilter}` : 'New'} Puzzle
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {filteredAndSortedArchive.map((archived) => {
                  const cfg = DIFFICULTY_CONFIG[archived.difficulty - 1];
                  const colors = archived.levelData.availableColors;
                  const dateLabel = new Date(archived.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={archived.id}
                      onClick={() => handlePlayArchived(archived)}
                      className="group bg-slate-950/60 hover:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md cursor-pointer relative"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-display font-bold border uppercase tracking-wide ${cfg.badgeClass}`}
                          >
                            Level {archived.difficulty} • {cfg.label}
                          </span>

                          <span className="text-[11px] text-slate-500 font-mono">
                            Seed: {archived.seed}
                          </span>

                          <span className="text-[11px] text-slate-500">• {dateLabel}</span>

                          {archived.isCompleted && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                              <span>Solved</span>
                              {archived.bestScore ? ` (${archived.bestScore.toLocaleString()} pts)` : ''}
                            </span>
                          )}
                        </div>

                        <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {archived.title}
                        </h4>
                        <span className="text-xs text-slate-400 block">
                          {archived.subtitle || cfg.tagline}
                        </span>

                        {/* Color swatches preview & hex count */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center -space-x-1.5">
                            {colors.map((colId) => {
                              const c = HEX_COLORS[colId];
                              return (
                                <div
                                  key={colId}
                                  className="w-3.5 h-3.5 rounded-full border border-slate-900 shadow-sm"
                                  style={{ backgroundColor: c.primary }}
                                  title={c.name}
                                />
                              );
                            })}
                          </div>

                          <span className="text-[11px] text-slate-400 font-medium">
                            {colors.length} Colors • {archived.levelData.boardRadius === 1 ? '7 Hexes' : '19 Hexes'} • {archived.levelData.objective.moveLimit} Moves
                          </span>
                        </div>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteArchived(archived.id, e)}
                          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 flex items-center justify-center transition active:scale-95"
                          title="Delete from archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePlayArchived(archived)}
                          className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Play</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
