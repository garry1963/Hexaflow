import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Calendar,
  Zap,
  Infinity as InfinityIcon,
  Smile,
  Trophy,
  BarChart2,
  Settings,
  Grid,
  Sparkles,
  Flame,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { GameMode, PlayerProfile } from '../types';
import { getTodayDailyStatus } from '../utils/dailyPuzzle';
import { CAMPAIGN_LEVELS } from '../data/levels';

interface MainMenuProps {
  profile: PlayerProfile;
  onStartMode: (mode: GameMode, levelId?: number) => void;
  onOpenLevelSelect: () => void;
  onOpenAchievements: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenDaily: () => void;
  onOpenWeekly: () => void;
  onOpenGenerator: () => void;
  onOpenTutorial: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  onStartMode,
  onOpenLevelSelect,
  onOpenAchievements,
  onOpenStats,
  onOpenSettings,
  onOpenDaily,
  onOpenWeekly,
  onOpenGenerator,
  onOpenTutorial,
}) => {
  const completedCount = Object.keys(profile.completedLevels).length;
  const totalCampaignLevels = CAMPAIGN_LEVELS.length;
  const dailyStatus = getTodayDailyStatus(profile);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between p-4 md:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 overflow-y-auto select-none touch-manipulation">
      {/* Background Animated Ambient Hex Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      {/* Top Tablet Player Profile Header */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-3 z-10 bg-slate-900/80 backdrop-blur-md p-3.5 md:p-4 rounded-3xl border border-slate-700/60 shadow-xl">
        {/* Player Badge */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-display font-black text-lg md:text-xl shadow-md border-2 border-cyan-300">
            {profile.level}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm md:text-base text-white">
                {profile.name}
              </span>
              <span className="text-[11px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
                Lv. {profile.level}
              </span>
            </div>
            {/* XP progress */}
            <div className="w-28 md:w-36 h-2 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((profile.xp % 100) || 15, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Currency & Streak Stats */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs md:text-sm font-bold text-orange-400">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{profile.dailyStreak}d</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs md:text-sm font-bold text-amber-300">
            <span>⭐</span>
            <span>{profile.stars}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-700 text-xs md:text-sm font-bold text-yellow-300">
            <span>🪙</span>
            <span>{profile.coins.toLocaleString()}</span>
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 transition active:scale-95 shadow-sm"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero Section with Original Hexaflow Logo */}
      <main className="w-full max-w-4xl flex flex-col items-center justify-center my-4 md:my-6 z-10 text-center">
        {/* Animated Original Hexagonal Logo Icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="relative mb-3"
        >
          {/* Stack of 3 glossy hex icons */}
          <svg viewBox="0 0 120 110" className="w-24 h-24 md:w-28 md:h-28 overflow-visible filter drop-shadow-[0_12px_24px_rgba(56,189,248,0.35)]">
            <defs>
              <linearGradient id="logo-g1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="logo-g2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="logo-g3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#BE185D" />
              </linearGradient>
            </defs>

            {/* Bottom slice */}
            <polygon points="60,28 86,43 86,73 60,88 34,73 34,43" fill="url(#logo-g3)" opacity="0.8" transform="translate(0, 16)" />
            {/* Middle slice */}
            <polygon points="60,24 86,39 86,69 60,84 34,69 34,39" fill="url(#logo-g2)" opacity="0.9" transform="translate(0, 8)" />
            {/* Top slice */}
            <polygon points="60,20 86,35 86,65 60,80 34,65 34,35" fill="url(#logo-g1)" stroke="#E0F2FE" strokeWidth="2.5" />
            
            {/* Gloss reflection curve */}
            <path d="M 45 42 Q 60 32 75 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <circle cx="60" cy="50" r="4" fill="white" opacity="0.9" />
          </svg>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-amber-200 drop-shadow-sm">
          HEXAFLOW
        </h1>
        <p className="text-sm md:text-base text-slate-300 font-medium tracking-wide mt-1 max-w-md">
          Sort • Stack • Merge • Complete
        </p>

        {/* Primary Play / Continue CTA */}
        <div className="w-full max-w-md mt-6 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartMode('campaign', profile.currentLevel)}
            className="w-full py-4 px-8 rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-display font-black text-xl md:text-2xl shadow-[0_10px_30px_rgba(20,184,166,0.4)] flex items-center justify-center gap-3 border-2 border-emerald-200 transition"
          >
            <Play className="w-6 h-6 md:w-7 md:h-7 fill-slate-950" />
            <span>PLAY LEVEL {profile.currentLevel}</span>
          </motion.button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenLevelSelect}
              className="py-2.5 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 text-cyan-300 border border-slate-700 font-display font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Grid className="w-4 h-4" />
              <span>Levels ({completedCount}/{totalCampaignLevels})</span>
            </button>

            <button
              onClick={onOpenTutorial}
              className="py-2.5 px-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-display font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How to Play</span>
            </button>
          </div>
        </div>

        {/* Game Mode Grid: Tablet Cards */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 mt-6">
          {/* Daily Challenge */}
          <button
            onClick={onOpenDaily}
            className={`flex flex-col items-center text-center p-3.5 md:p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border shadow-md transition active:scale-95 group relative ${
              dailyStatus === 'completed'
                ? 'border-emerald-500/50 hover:border-emerald-400'
                : dailyStatus === 'failed'
                ? 'border-rose-500/50 hover:border-rose-400'
                : 'border-slate-700 hover:border-amber-500/50'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-2 group-hover:scale-110 transition relative ${
                dailyStatus === 'completed'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : dailyStatus === 'failed'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
            >
              <Calendar className="w-5 h-5" />
              {dailyStatus === 'completed' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
              {dailyStatus === 'failed' && (
                <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <span className="font-display font-bold text-sm text-white">Daily</span>
            <span
              className={`text-[11px] font-semibold mt-0.5 ${
                dailyStatus === 'completed'
                  ? 'text-emerald-400'
                  : dailyStatus === 'failed'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {dailyStatus === 'completed'
                ? 'Solved ✓'
                : dailyStatus === 'failed'
                ? 'Attempt Used'
                : '1 Attempt'}
            </span>
          </button>

          {/* Weekly Challenge */}
          <button
            onClick={onOpenWeekly}
            className="flex flex-col items-center text-center p-3.5 md:p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-500/50 shadow-md transition active:scale-95 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-2 group-hover:scale-110 transition">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-sm text-white">Weekly</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Mega Board</span>
          </button>

          {/* Puzzle Generator Mode */}
          <button
            onClick={onOpenGenerator}
            className="flex flex-col items-center text-center p-3.5 md:p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/40 hover:border-cyan-400 shadow-md transition active:scale-95 group relative ring-1 ring-cyan-500/20"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 mb-2 group-hover:scale-110 transition shadow-inner">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-display font-bold text-sm text-white">Generator</span>
            <span className="text-[11px] text-cyan-400 font-semibold mt-0.5">Diff 1 - 5 & Archive</span>
          </button>

          {/* Endless Mode */}
          <button
            onClick={() => onStartMode('endless')}
            className="flex flex-col items-center text-center p-3.5 md:p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-rose-500/50 shadow-md transition active:scale-95 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 mb-2 group-hover:scale-110 transition">
              <InfinityIcon className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-sm text-white">Endless</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Survive & Score</span>
          </button>

          {/* Relax Mode */}
          <button
            onClick={() => onStartMode('relax')}
            className="flex flex-col items-center text-center p-3.5 md:p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500/50 shadow-md transition active:scale-95 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-2 group-hover:scale-110 transition">
              <Smile className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-sm text-white">Relax</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Zen & No Timer</span>
          </button>
        </div>
      </main>

      {/* Bottom Hub: Achievements, Stats, Settings */}
      <footer className="w-full max-w-md flex items-center justify-center gap-4 z-10 py-2">
        <button
          onClick={onOpenAchievements}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs md:text-sm font-display font-bold transition active:scale-95 shadow-sm"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Achievements</span>
        </button>

        <button
          onClick={onOpenStats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs md:text-sm font-display font-bold transition active:scale-95 shadow-sm"
        >
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span>Statistics</span>
        </button>
      </footer>
    </div>
  );
};
