import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HexTileStack } from './HexTileStack';
import { HEX_COLORS } from '../data/colors';
import { soundManager } from '../audio/soundManager';
import { getHexPolygonPoints, SQRT_3 } from '../utils/hexMath';
import { TileStack } from '../types';
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Crown,
  CheckCircle2,
  Lock,
  ShieldAlert,
  HelpCircle,
  PartyPopper,
  Hand,
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
}

type TutorialStepId = 'place' | 'merge' | 'crown' | 'specials' | 'practice';

interface TutorialStepConfig {
  id: TutorialStepId;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  tip: string;
}

const STEPS: TutorialStepConfig[] = [
  {
    id: 'place',
    title: '1. Place Stacks',
    badge: 'Basics',
    subtitle: 'Drag or tap tiles from your tray to open board sockets.',
    description:
      'Tiles arrive in your bottom tray in mixed or single-color stacks. You can either drag them onto an empty socket or tap a stack and tap a target socket to place it.',
    tip: 'Tiles can only be moved from the tray to the board. Once on the board, tiles cannot be moved!',
  },
  {
    id: 'merge',
    title: '2. Auto-Merge',
    badge: 'Core Mechanic',
    subtitle: 'Adjacent stacks of the same color flow together automatically.',
    description:
      'Whenever two or more stacks of the same color sit next to each other on the hex grid, tiles automatically flow across into a single stack.',
    tip: 'Plan placements carefully to create chain reactions across multiple neighboring sockets!',
  },
  {
    id: 'crown',
    title: '3. Stacking to 10 (The Crown)',
    badge: 'Goal & Score',
    subtitle: 'When a stack reaches 10 tiles, it crowns and clears!',
    description:
      'Each stack has a capacity of 10. When 10 matching tiles gather, the stack transforms into a glowing golden crown, scores bonus points, and clears the socket!',
    tip: 'Clearing sockets is how you free up the board and prevent getting stuck!',
  },
  {
    id: 'specials',
    title: '4. Special Elements',
    badge: 'Power-ups & Hazards',
    subtitle: 'Wild Rainbows, Locked Sockets, Obstacles, and Multipliers.',
    description:
      'Discover unique mechanics as you progress through the levels: wild rainbow tiles that match anything, locked sockets that require adjacent clears, and score multipliers.',
    tip: 'Use Rainbow tiles strategically to bridge two different isolated clusters!',
  },
  {
    id: 'practice',
    title: '5. Try It Yourself!',
    badge: 'Interactive',
    subtitle: 'Place the green stack to trigger a 10-tile crown clear!',
    description:
      'Complete this quick hands-on puzzle to test what you learned. Drag or tap the 4-tile green stack into the empty socket next to the 6-tile green stack.',
    tip: 'Tap or drag the tray tile to test out the placement and watch the auto-merge!',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Interactive sandbox state for step 5
  const [sandboxPlaced, setSandboxPlaced] = useState(false);
  const [sandboxCleared, setSandboxCleared] = useState(false);
  const [sandboxSelected, setSandboxSelected] = useState(false);

  const step = STEPS[currentStepIndex];

  // Auto-run animated phases for demo steps 0, 1, 2
  useEffect(() => {
    if (!isOpen) return;
    if (step.id === 'specials' || step.id === 'practice') return;
    if (isPaused) return;

    const phaseMax = step.id === 'place' ? 4 : step.id === 'merge' ? 5 : 4;
    const interval = setInterval(() => {
      setAnimPhase((prev) => {
        const next = prev + 1;
        if (next > phaseMax) {
          return 0; // Loop animation
        }
        return next;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [isOpen, currentStepIndex, step.id, isPaused]);

  // Sound effects on phase transitions
  useEffect(() => {
    if (isPaused) return;
    if (step.id === 'place' && animPhase === 3) {
      soundManager.playPlace();
    } else if (step.id === 'merge' && animPhase === 2) {
      soundManager.playPlace();
    } else if (step.id === 'merge' && animPhase === 4) {
      soundManager.playMerge(0.6);
    } else if (step.id === 'crown' && animPhase === 1) {
      soundManager.playMerge(0.8);
    } else if (step.id === 'crown' && animPhase === 2) {
      soundManager.playCompleteStack();
    }
  }, [animPhase, step.id, isPaused]);

  // Reset phase when changing steps
  const goToStep = (idx: number) => {
    soundManager.playButton();
    setCurrentStepIndex(idx);
    setAnimPhase(0);
    setSandboxPlaced(false);
    setSandboxCleared(false);
    setSandboxSelected(false);
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleRestartStep = () => {
    soundManager.playButton();
    setAnimPhase(0);
    setSandboxPlaced(false);
    setSandboxCleared(false);
    setSandboxSelected(false);
  };

  const handleComplete = () => {
    soundManager.playLevelComplete();
    onClose();
    if (onStartGame) {
      onStartGame();
    }
  };

  // Interactive sandbox trigger
  const handleSandboxPlace = () => {
    if (sandboxPlaced) return;
    soundManager.playPlace();
    setSandboxPlaced(true);
    setSandboxSelected(false);

    // Trigger merge after 500ms
    setTimeout(() => {
      soundManager.playMerge(0.9);
      setTimeout(() => {
        soundManager.playCompleteStack();
        setSandboxCleared(true);
      }, 700);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-5 md:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-slate-100 flex flex-col justify-between max-h-[92vh] overflow-y-auto"
      >
        {/* Header: Title, Step Indicator & Close Button */}
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-display font-black text-white leading-tight">
                    HOW TO PLAY
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {step.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Step {currentStepIndex + 1} of {STEPS.length}</p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Step Pills */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-4 overflow-x-auto pb-1">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  idx === currentStepIndex
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md scale-105'
                    : idx < currentStepIndex
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                {idx < currentStepIndex ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span>{idx + 1}</span>
                )}
                <span>{s.title.split('. ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Animated Presentation Stage */}
        <div className="relative w-full my-2 bg-slate-950/70 rounded-2xl border border-slate-800 p-4 md:p-6 flex flex-col items-center justify-center min-h-[260px] md:min-h-[290px] overflow-hidden shadow-inner">
          {/* Subtle Ambient Stage Background Spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,rgba(15,23,42,0)_70%)] pointer-events-none" />

          {/* Controls: Replay / Pause */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
            {step.id !== 'specials' && step.id !== 'practice' && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold flex items-center gap-1 transition"
              >
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}
            <button
              onClick={handleRestartStep}
              className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Restart Animation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ================= STEP 1: DRAG & PLACE ANIMATION ================= */}
          {step.id === 'place' && (
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              {/* Mini 3-Socket Board */}
              <div className="relative w-64 h-32 flex items-center justify-center">
                {/* Left Socket with Ruby Red (2) */}
                <div className="absolute left-6 top-6">
                  <SocketFrame size={34} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HexTileStack
                      stack={{ id: 'demo-s1', color: 'ruby-red', count: 2 }}
                      size={34}
                    />
                  </div>
                </div>

                {/* Center Socket (Target) */}
                <div className="absolute left-28 top-6">
                  <SocketFrame
                    size={34}
                    isTarget={animPhase >= 2 && animPhase < 3}
                    isHovered={animPhase === 2}
                  />
                  {animPhase >= 3 && (
                    <motion.div
                      initial={{ scale: 0.6, y: -24, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <HexTileStack
                        stack={{ id: 'demo-s2', color: 'sunburst-yellow', count: 3 }}
                        size={34}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Right Socket (Empty) */}
                <div className="absolute right-6 top-6">
                  <SocketFrame size={34} />
                </div>
              </div>

              {/* Lower Staging Tray */}
              <div className="relative mt-2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center justify-center min-w-[120px]">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-xl bg-slate-950/60 border border-dashed border-slate-800">
                  {animPhase < 2 && (
                    <HexTileStack
                      stack={{ id: 'demo-tray', color: 'sunburst-yellow', count: 3 }}
                      size={32}
                    />
                  )}
                  {animPhase >= 2 && (
                    <span className="text-[10px] font-mono text-slate-600">SLOT</span>
                  )}
                </div>
              </div>

              {/* Floating Dragged Stack (follows pointer in phase 1 & 2) */}
              <AnimatePresence>
                {animPhase >= 1 && animPhase < 3 && (
                  <motion.div
                    initial={{ x: 0, y: 55, scale: 1.05 }}
                    animate={
                      animPhase === 1
                        ? { x: 0, y: 30, scale: 1.15 }
                        : { x: 0, y: -45, scale: 1.1 }
                    }
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute z-30 pointer-events-none"
                  >
                    <HexTileStack
                      stack={{ id: 'demo-flying', color: 'sunburst-yellow', count: 3 }}
                      size={34}
                      isSelected={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated Finger Pointer */}
              <motion.div
                animate={
                  animPhase === 0
                    ? { x: 12, y: 70, scale: 1 }
                    : animPhase === 1
                    ? { x: 12, y: 50, scale: 0.92 }
                    : animPhase === 2
                    ? { x: 12, y: -25, scale: 0.92 }
                    : { x: 45, y: -15, scale: 1, opacity: 0 }
                }
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute z-40 pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white shadow-lg">
                  <Hand className="w-4 h-4 fill-white" />
                </div>
              </motion.div>

              {/* Status Banner */}
              <div className="mt-3 text-center">
                <span className="text-xs font-display font-bold text-amber-300">
                  {animPhase === 0
                    ? '1. Tap or Drag stack from tray...'
                    : animPhase === 1
                    ? '2. Lift stack...'
                    : animPhase === 2
                    ? '3. Hover over target socket...'
                    : '4. Placed! Socket filled!'}
                </span>
              </div>
            </div>
          )}

          {/* ================= STEP 2: AUTO-MERGE ANIMATION ================= */}
          {step.id === 'merge' && (
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              {/* Adjacent Sockets */}
              <div className="relative w-72 h-36 flex items-center justify-center gap-6">
                {/* Socket A (Left) */}
                <div className="relative flex flex-col items-center">
                  <SocketFrame size={38} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HexTileStack
                      stack={{
                        id: 'merge-a',
                        color: 'tangerine-orange',
                        count: animPhase >= 4 ? 7 : 3,
                        animating: animPhase === 4 ? 'waterfall' : undefined,
                        cascadeAdded: animPhase === 4 ? 4 : undefined,
                      }}
                      size={38}
                      enableWaterfall={true}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-14">
                    Socket A ({animPhase >= 4 ? '7' : '3'})
                  </span>
                </div>

                {/* Energy Connector Beam */}
                {animPhase >= 3 && animPhase < 5 && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    className="w-10 h-1.5 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full shadow-[0_0_12px_#f97316] z-20"
                  />
                )}

                {/* Socket B (Right) */}
                <div className="relative flex flex-col items-center">
                  <SocketFrame size={38} isTarget={animPhase === 1} />
                  {animPhase >= 2 && animPhase < 4 && (
                    <motion.div
                      initial={{ scale: 0.5, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <HexTileStack
                        stack={{ id: 'merge-b', color: 'tangerine-orange', count: 4 }}
                        size={38}
                      />
                    </motion.div>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 mt-14">
                    Socket B ({animPhase >= 4 ? 'Empty' : animPhase >= 2 ? '4' : 'Empty'})
                  </span>
                </div>
              </div>

              {/* Floating Flying Tiles during Merge */}
              {animPhase === 3 && (
                <motion.div
                  initial={{ x: 50, y: -20 }}
                  animate={{ x: -50, y: -25, scale: 1.15 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="absolute z-40 pointer-events-none"
                >
                  <HexTileStack
                    stack={{ id: 'flying-merge', color: 'tangerine-orange', count: 4 }}
                    size={32}
                  />
                </motion.div>
              )}

              {/* Score Popup on Merge */}
              <AnimatePresence>
                {animPhase >= 4 && (
                  <motion.div
                    initial={{ y: 0, opacity: 0, scale: 0.8 }}
                    animate={{ y: -28, opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-1 left-24 z-30 px-2.5 py-1 rounded-full bg-orange-500 text-slate-950 font-display font-black text-xs shadow-lg border border-yellow-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>+35 MERGE!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Banner */}
              <div className="mt-4 text-center">
                <span className="text-xs font-display font-bold text-orange-400">
                  {animPhase < 2
                    ? '1. Orange stack (4) placed adjacent to Orange stack (3)...'
                    : animPhase === 2
                    ? '2. Same colors touch each other...'
                    : animPhase === 3
                    ? '3. Tiles automatically flow across!'
                    : '4. Merged into 7 tiles! Socket B is now free!'}
                </span>
              </div>
            </div>
          )}

          {/* ================= STEP 3: CROWN & CLEAR ANIMATION ================= */}
          {step.id === 'crown' && (
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              <div className="relative w-56 h-36 flex items-center justify-center">
                <SocketFrame size={42} />

                {/* Stack transforming into 10 */}
                {animPhase < 3 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HexTileStack
                      stack={{
                        id: 'crown-stack',
                        color: 'azure-blue',
                        count: animPhase === 0 ? 9 : 10,
                        animating: animPhase === 1 ? 'bounce' : undefined,
                      }}
                      size={42}
                      maxCapacity={10}
                    />
                  </div>
                )}

                {/* Golden starburst explosion in Phase 2 */}
                {animPhase === 2 && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 1 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute w-28 h-28 rounded-full border-4 border-amber-400 bg-amber-400/30 shadow-[0_0_30px_#f59e0b] pointer-events-none"
                  />
                )}

                {/* Floating Stars Particles */}
                {animPhase >= 2 && animPhase < 4 && (
                  <>
                    <motion.div
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: -45, y: -40, opacity: 0 }}
                      className="absolute text-xl pointer-events-none"
                    >
                      ⭐
                    </motion.div>
                    <motion.div
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: 45, y: -35, opacity: 0 }}
                      className="absolute text-xl pointer-events-none"
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: 0, y: -50, opacity: 0 }}
                      className="absolute text-2xl pointer-events-none"
                    >
                      👑
                    </motion.div>
                  </>
                )}

                {/* Success Banner Popup */}
                {animPhase >= 2 && (
                  <motion.div
                    initial={{ scale: 0.5, y: 0, opacity: 0 }}
                    animate={{ scale: 1.1, y: -35, opacity: 1 }}
                    className="absolute z-30 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-display font-black text-xs shadow-xl border-2 border-white flex items-center gap-1.5"
                  >
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>+100 PTS • CLEARED!</span>
                  </motion.div>
                )}
              </div>

              {/* Status Banner */}
              <div className="mt-4 text-center">
                <span className="text-xs font-display font-bold text-amber-300">
                  {animPhase === 0
                    ? '1. Stack has 9 tiles... adding 1 more!'
                    : animPhase === 1
                    ? '2. Reached 10! Crowns with royal golden aura...'
                    : animPhase === 2
                    ? '3. Explodes in stars & clears the socket!'
                    : '4. Pristine empty socket ready for next move!'}
                </span>
              </div>
            </div>
          )}

          {/* ================= STEP 4: SPECIAL ELEMENTS SHOWCASE ================= */}
          {step.id === 'specials' && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-1">
              {/* Card 1: Wild Rainbow */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow">
                <div className="mb-2">
                  <HexTileStack
                    stack={{ id: 'rainbow-demo', color: 'wild-rainbow', count: 3 }}
                    size={28}
                  />
                </div>
                <span className="font-display font-bold text-xs text-rose-300">Wild Rainbow</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Matches with any color stack!
                </span>
              </div>

              {/* Card 2: Locked Sockets */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow">
                <div className="relative w-14 h-14 flex items-center justify-center mb-2">
                  <SocketFrame size={26} />
                  <div className="absolute p-1.5 rounded-full bg-amber-950/90 border border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    <Lock className="w-4 h-4 text-amber-300" />
                  </div>
                </div>
                <span className="font-display font-bold text-xs text-amber-300">Locked Socket</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Clear adjacent stacks to unlock.
                </span>
              </div>

              {/* Card 3: Obstacle Wall */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow">
                <div className="relative w-14 h-14 flex items-center justify-center mb-2">
                  <SocketFrame size={26} />
                  <div className="absolute p-1.5 rounded-full bg-red-950/90 border border-red-800/80 shadow">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <span className="font-display font-bold text-xs text-red-400">Wall Obstacle</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Cannot be placed on or cleared.
                </span>
              </div>

              {/* Card 4: Multiplier Socket */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow">
                <div className="relative w-14 h-14 flex items-center justify-center mb-2">
                  <SocketFrame size={26} />
                  <div className="absolute px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-display font-black text-[11px] shadow-md border border-white flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>2X</span>
                  </div>
                </div>
                <span className="font-display font-bold text-xs text-yellow-300">Multiplier 2x</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Doubles points when cleared!
                </span>
              </div>
            </div>
          )}

          {/* ================= STEP 5: INTERACTIVE SANDBOX ================= */}
          {step.id === 'practice' && (
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              <div className="flex items-center gap-6 mb-3">
                {/* Socket 1: Emerald Green (6) */}
                <div className="relative flex flex-col items-center">
                  <SocketFrame size={38} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!sandboxCleared ? (
                      <HexTileStack
                        stack={{
                          id: 'sb-target',
                          color: 'emerald-green',
                          count: sandboxPlaced ? 10 : 6,
                          animating: sandboxPlaced ? 'waterfall' : undefined,
                          cascadeAdded: sandboxPlaced ? 4 : undefined,
                        }}
                        size={38}
                        maxCapacity={10}
                        enableWaterfall={true}
                      />
                    ) : (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-emerald-400 font-display font-black text-xs text-center"
                      >
                        CLEARED!
                      </motion.div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-14">
                    Socket 1 ({sandboxCleared ? 'Empty' : sandboxPlaced ? '10' : '6'})
                  </span>
                </div>

                {/* Socket 2: Empty Target Socket */}
                <div
                  onClick={sandboxSelected && !sandboxPlaced ? handleSandboxPlace : undefined}
                  className={`relative flex flex-col items-center cursor-pointer transition ${
                    sandboxSelected && !sandboxPlaced ? 'scale-105' : ''
                  }`}
                >
                  <SocketFrame
                    size={38}
                    isTarget={sandboxSelected && !sandboxPlaced}
                    isHovered={sandboxSelected && !sandboxPlaced}
                  />
                  {sandboxPlaced && !sandboxCleared && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-[10px] text-emerald-300 font-bold">Merging...</span>
                    </motion.div>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 mt-14">
                    Socket 2 (Target)
                  </span>
                </div>
              </div>

              {/* Interactive Tray: Tap/Click the green stack */}
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Tray:
                </span>
                {/* Emerald Green Stack (4) */}
                <div
                  onClick={() => {
                    if (sandboxPlaced) return;
                    soundManager.playSelect();
                    setSandboxSelected(true);
                  }}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    sandboxPlaced
                      ? 'opacity-30 border-slate-800'
                      : sandboxSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <HexTileStack
                    stack={{ id: 'sb-tray-1', color: 'emerald-green', count: 4 }}
                    size={30}
                    isSelected={sandboxSelected && !sandboxPlaced}
                  />
                </div>

                {/* Other dummy stack */}
                <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800 opacity-40 pointer-events-none">
                  <HexTileStack
                    stack={{ id: 'sb-tray-2', color: 'ruby-red', count: 2 }}
                    size={30}
                  />
                </div>
              </div>

              {/* Feedback Message */}
              <div className="mt-3 text-center">
                {!sandboxSelected && !sandboxPlaced && (
                  <span className="text-xs font-display font-bold text-emerald-400 animate-pulse">
                    👉 Tap the Green (4) stack in the tray to pick it up!
                  </span>
                )}
                {sandboxSelected && !sandboxPlaced && (
                  <span className="text-xs font-display font-bold text-amber-300 animate-bounce">
                    👉 Now tap Socket 2 to place it and trigger the merge!
                  </span>
                )}
                {sandboxPlaced && !sandboxCleared && (
                  <span className="text-xs font-display font-bold text-cyan-300">
                    Auto-merging: 6 + 4 = 10!
                  </span>
                )}
                {sandboxCleared && (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-display font-bold text-amber-300">
                    <PartyPopper className="w-4 h-4 text-amber-400" />
                    <span>Brilliant! 10-tile Crown Cleared! You're ready to play!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step Explanation & Pro Tip */}
        <div className="my-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
            {step.description}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold mt-0.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Pro Tip: {step.tip}</span>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs md:text-sm flex items-center gap-1.5 transition ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-display font-black text-xs md:text-sm shadow-md flex items-center gap-1.5 transition"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="py-2.5 px-7 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-display font-black text-xs md:text-sm shadow-[0_4px_16px_rgba(16,185,129,0.4)] flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START PLAYING</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Clean SVG Hex Socket Frame for the tutorial demonstrations
 */
const SocketFrame: React.FC<{
  size: number;
  isTarget?: boolean;
  isHovered?: boolean;
}> = ({ size, isTarget = false, isHovered = false }) => {
  const hexW = SQRT_3 * size;
  const hexH = 2 * size;
  const cx = hexW / 2;
  const cy = hexH / 2;

  return (
    <svg
      viewBox={`0 0 ${hexW} ${hexH}`}
      className={`w-full h-full overflow-visible pointer-events-none transition-all ${
        isHovered ? 'scale-105' : ''
      }`}
      style={{
        width: `${hexW}px`,
        height: `${hexH}px`,
      }}
    >
      {/* Outer socket rim */}
      <polygon
        points={getHexPolygonPoints(cx, cy, size)}
        fill={
          isHovered
            ? 'rgba(52, 211, 153, 0.25)'
            : isTarget
            ? 'rgba(16, 185, 129, 0.15)'
            : '#1e293b'
        }
        stroke={isHovered ? '#34D399' : isTarget ? '#10B981' : '#475569'}
        strokeWidth={isHovered ? 3 : isTarget ? 2.2 : 1.2}
        strokeDasharray={isTarget && !isHovered ? '4 2' : undefined}
      />

      {/* Recessed cavity wall */}
      <polygon
        points={getHexPolygonPoints(cx, cy, size * 0.9)}
        fill="#0b1120"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1"
      />

      {/* Socket floor plate */}
      <polygon
        points={getHexPolygonPoints(cx, cy, size * 0.8)}
        fill="rgba(15, 23, 42, 0.8)"
        stroke={isTarget ? '#10B981' : 'rgba(255,255,255,0.05)'}
        strokeWidth="1"
      />

      {/* Center dot */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.12}
        fill={isTarget ? '#10B981' : 'rgba(255,255,255,0.1)'}
      />
    </svg>
  );
};
