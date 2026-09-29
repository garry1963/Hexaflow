import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BoosterInventory,
  BoosterType,
  GameMode,
  LevelData,
  LevelObjective,
  TileStack,
} from '../types';
import { HEX_COLORS } from '../data/colors';
import {
  RotateCcw,
  Wand2,
  Hammer,
  Sparkles,
  PlusCircle,
  Menu,
  Shuffle,
  Flame,
  HelpCircle,
} from 'lucide-react';

interface HUDProps {
  level: LevelData;
  mode: GameMode;
  score: number;
  movesMade: number;
  movesRemaining?: number;
  timeRemaining?: number;
  combo: number;
  completedColorCounts: { [color: string]: number };
  boosters: BoosterInventory;
  canUndo: boolean;
  onUndo: () => void;
  onUseBooster: (type: BoosterType) => void;
  onOpenPause: () => void;
  onOpenTutorial?: () => void;
  onOpenDevTools?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  mode,
  score,
  movesMade,
  movesRemaining,
  timeRemaining,
  combo,
  completedColorCounts,
  boosters,
  canUndo,
  onUndo,
  onUseBooster,
  onOpenPause,
  onOpenTutorial,
  onOpenDevTools,
}) => {
  const [showBoosterDrawer, setShowBoosterDrawer] = useState(false);

  const objective = level.objective;

  return (
    <header className="w-full flex flex-col gap-2 z-20 select-none">
      {/* Top Tablet Navigation & Score Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 shadow-lg">
        {/* Left: Level / Mode Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPause}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 flex items-center justify-center text-slate-200 shadow-sm transition"
            title="Pause / Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-cyan-950/60 hover:text-cyan-300 active:scale-95 border border-slate-600 hover:border-cyan-500/50 flex items-center justify-center text-slate-300 shadow-sm transition"
              title="How to Play / Tutorial"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                {mode === 'campaign'
                  ? `World ${level.worldId} • Level ${level.id}`
                  : mode === 'daily'
                  ? 'Daily Challenge'
                  : mode === 'weekly'
                  ? 'Weekly Challenge'
                  : mode === 'endless'
                  ? 'Endless Mode'
                  : mode === 'relax'
                  ? 'Relax Mode'
                  : `Generator • Diff ${level.difficulty}`}
              </span>
              {mode === 'daily' && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                  1 Attempt
                </span>
              )}
              {mode === 'generator' && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/40">
                  Diff {level.difficulty}
                </span>
              )}
              {/* Optional secret Dev tools access */}
              {onOpenDevTools && (
                <button
                  onClick={onOpenDevTools}
                  className="text-[10px] text-slate-500 hover:text-amber-400 font-mono"
                  title="Developer Tools"
                >
                  [DEV]
                </button>
              )}
            </div>
            <h2 className="text-base md:text-lg font-display font-bold text-white leading-tight">
              {level.title}
            </h2>
          </div>
        </div>

        {/* Center: Objective Display */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Goal:</span>
          {objective.type === 'complete_colors' && objective.targetColors && (
            <div className="flex items-center gap-2">
              {Object.entries(objective.targetColors).map(([col, target]) => {
                const colorDef = HEX_COLORS[col as keyof typeof HEX_COLORS];
                const current = completedColorCounts[col] || 0;
                const done = current >= (target || 1);
                return (
                  <div
                    key={col}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border transition-colors ${
                      done
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-white/40"
                      style={{ backgroundColor: colorDef?.primary }}
                    />
                    <span>
                      {current}/{target}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {objective.type === 'target_score' && (
            <div className="text-xs font-bold text-amber-300">
              Score {score} / {objective.targetScore}
            </div>
          )}

          {objective.type === 'clear_board' && (
            <div className="text-xs font-bold text-cyan-300">Clear All Starting Tiles</div>
          )}

          {objective.type === 'limited_moves' && (
            <div className="text-xs font-bold text-orange-300">
              Complete in {movesRemaining ?? 0} moves
            </div>
          )}
        </div>

        {/* Right: Moves / Score & Combo */}
        <div className="flex items-center gap-3">
          {/* Combo Multiplier Badge */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl font-display font-black text-xs shadow-md animate-bounce"
              >
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>COMBO x{combo}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Moves or Timer */}
          {movesRemaining !== undefined && (
            <div className="flex flex-col items-center bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Moves
              </span>
              <span
                className={`text-sm md:text-base font-display font-bold ${
                  movesRemaining <= 3 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
                }`}
              >
                {movesRemaining}
              </span>
            </div>
          )}

          {timeRemaining !== undefined && (
            <div className="flex flex-col items-center bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Time
              </span>
              <span
                className={`text-sm md:text-base font-display font-bold ${
                  timeRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
                }`}
              >
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Score Counter */}
          <div className="flex flex-col items-end bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700 min-w-[76px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Score
            </span>
            <span className="text-sm md:text-base font-display font-bold text-amber-300">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile/Compact Objective Bar when screen is small */}
      <div className="sm:hidden flex items-center justify-between bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium">Goal:</span>
        <span className="text-slate-200 font-bold">{objective.description}</span>
      </div>

      {/* Boosters Row / Drawer Toggle */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Quick Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo && boosters.undo <= 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
            canUndo
              ? 'bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700 shadow'
              : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
          title="Undo previous move"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo</span>
          {boosters.undo > 0 && (
            <span className="bg-slate-700 text-slate-300 text-[10px] px-1 rounded">
              {boosters.undo}
            </span>
          )}
        </button>

        {/* Boosters Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Shuffle */}
          <button
            onClick={() => onUseBooster('shuffle')}
            disabled={boosters.shuffle <= 0}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              boosters.shuffle > 0
                ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700 hover:bg-indigo-900/60'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Shuffle incoming stacks"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Shuffle</span>
            <span className="bg-indigo-950 text-indigo-300 text-[10px] px-1 rounded border border-indigo-800">
              {boosters.shuffle}
            </span>
          </button>

          {/* Quick Hammer */}
          <button
            onClick={() => onUseBooster('hammer')}
            disabled={boosters.hammer <= 0}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              boosters.hammer > 0
                ? 'bg-rose-900/40 text-rose-300 border-rose-700 hover:bg-rose-900/60'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Break a stack on the board"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hammer</span>
            <span className="bg-rose-950 text-rose-300 text-[10px] px-1 rounded border border-rose-800">
              {boosters.hammer}
            </span>
          </button>

          {/* Wild Hex */}
          <button
            onClick={() => onUseBooster('wild_hex')}
            disabled={boosters.wild_hex <= 0}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
              boosters.wild_hex > 0
                ? 'bg-amber-900/40 text-amber-300 border-amber-700 hover:bg-amber-900/60'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Turn selected piece into universal Wild Rainbow Hex"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Wild</span>
            <span className="bg-amber-950 text-amber-300 text-[10px] px-1 rounded border border-amber-800">
              {boosters.wild_hex}
            </span>
          </button>

          {/* Extra Moves (if in limited moves mode) */}
          {movesRemaining !== undefined && (
            <button
              onClick={() => onUseBooster('extra_moves')}
              disabled={boosters.extra_moves <= 0}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
                boosters.extra_moves > 0
                  ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60'
                  : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
              title="+5 Extra Moves"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+5</span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1 rounded border border-emerald-800">
                {boosters.extra_moves}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
