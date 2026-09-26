import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BoardCell, BoardState, CascadeTransfer, HexColorId, TileStack } from '../types';
import { hexToPixel, SQRT_3, getRoundedHexPath } from '../utils/hexMath';
import { HexTileStack } from './HexTileStack';
import { CascadeStreamOverlay } from './CascadeStreamOverlay';
import { HEX_COLORS } from '../data/colors';
import { Lock, ShieldAlert, Sparkles } from 'lucide-react';

interface HexBoardProps {
  cells: BoardCell[];
  boardState: BoardState;
  onCellClick: (cell: BoardCell) => void;
  validTargetIds: string[];
  showSymbols: boolean;
  showCount?: boolean;
  maxCapacity: number;
  hoveredCellId?: string | null;
  activeTransfers?: CascadeTransfer[];
  onTransfersCompleted?: () => void;
}

export const HexBoard: React.FC<HexBoardProps> = ({
  cells,
  boardState,
  onCellClick,
  validTargetIds,
  showSymbols,
  showCount = true,
  maxCapacity,
  hoveredCellId,
  activeTransfers,
  onTransfersCompleted,
}) => {
  // Measure viewport to adapt board sizing for tablet portrait and responsive displays
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 1000,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute board bounds and optimal hex size dynamically
  const { hexSize, boardWidth, boardHeight, minX, minY } = useMemo(() => {
    const count = cells.length;
    const isPortrait = viewport.height > viewport.width;
    const isTabletPortrait = isPortrait && viewport.width >= 600;

    // 1. Calculate normalized unit coordinates (at size = 1)
    let minUnitX = Infinity,
      maxUnitX = -Infinity,
      minUnitY = Infinity,
      maxUnitY = -Infinity;

    cells.forEach((cell) => {
      const { x, y } = hexToPixel(cell.q, cell.r, 1);
      if (x < minUnitX) minUnitX = x;
      if (x > maxUnitX) maxUnitX = x;
      if (y < minUnitY) minUnitY = y;
      if (y > maxUnitY) maxUnitY = y;
    });

    // Effective span in units of size
    const spanUnitX = maxUnitX - minUnitX + 2.2;
    const spanUnitY = maxUnitY - minUnitY + 2.2;

    let size = 44;

    if (isTabletPortrait) {
      // In tablet portrait mode, expand board to make prominent use of generous screen area
      // Budget: leave room for top HUD (~160px), bottom tray (~200px), safe padding (~50px)
      const availableWidth = Math.min(viewport.width - 48, 880);
      const availableHeight = Math.max(420, viewport.height - 390);

      const fitSizeW = availableWidth / spanUnitX;
      const fitSizeH = availableHeight / spanUnitY;
      const optimalFit = Math.min(fitSizeW, fitSizeH);

      // Clamp according to honeycomb grid tier
      if (count <= 7) {
        size = Math.min(84, Math.max(68, optimalFit));
      } else if (count <= 19) {
        size = Math.min(74, Math.max(58, optimalFit));
      } else {
        size = Math.min(58, Math.max(46, optimalFit));
      }
    } else if (isPortrait) {
      // Mobile portrait mode (width < 600)
      const availableWidth = Math.min(viewport.width - 24, 460);
      const availableHeight = Math.max(340, viewport.height - 350);

      const fitSizeW = availableWidth / spanUnitX;
      const fitSizeH = availableHeight / spanUnitY;
      const optimalFit = Math.min(fitSizeW, fitSizeH);

      if (count <= 7) {
        size = Math.min(62, Math.max(50, optimalFit));
      } else if (count <= 19) {
        size = Math.min(48, Math.max(38, optimalFit));
      } else {
        size = Math.min(38, Math.max(30, optimalFit));
      }
    } else {
      // Landscape / Desktop mode
      const availableWidth = Math.min(viewport.width * 0.65, 780);
      const availableHeight = Math.max(380, viewport.height - 240);

      const fitSizeW = availableWidth / spanUnitX;
      const fitSizeH = availableHeight / spanUnitY;
      const optimalFit = Math.min(fitSizeW, fitSizeH);

      if (count <= 7) {
        size = Math.min(70, Math.max(54, optimalFit));
      } else if (count <= 19) {
        size = Math.min(56, Math.max(44, optimalFit));
      } else {
        size = Math.min(44, Math.max(34, optimalFit));
      }
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    cells.forEach((cell) => {
      const { x, y } = hexToPixel(cell.q, cell.r, size);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const padding = size * 2.2;
    const width = maxX - minX + padding;
    const height = maxY - minY + padding;

    return {
      hexSize: Math.round(size),
      boardWidth: Math.round(width),
      boardHeight: Math.round(height),
      minX: minX - padding / 2,
      minY: minY - padding / 2,
    };
  }, [cells, viewport]);

  return (
    <div className="relative flex items-center justify-center p-2 w-full max-w-4xl mx-auto touch-none select-none">
      {/* 3D Machined Wooden / Carbon-Slate Table Tray Framing */}
      <div
        className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-[36px] p-5 md:p-8 border-2 border-slate-700/70 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.12)] backdrop-blur-xl transition-all overflow-hidden"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
      >
        {/* Subtle Machined Hexagon Grid Texture in Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="bg-hex-pattern"
              width="28"
              height="48.49"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1)"
            >
              <path
                d="M 14 0 L 28 8.08 L 28 24.24 L 14 32.32 L 0 24.24 L 0 8.08 Z M 0 48.49 L 14 40.41 L 28 48.49"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-hex-pattern)" />
        </svg>

        {/* Ambient Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06)_0%,rgba(15,23,42,0)_70%)] pointer-events-none" />

        {/* Corner Metallic Bolts / Rivets */}
        <div className="absolute top-3.5 left-3.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none" />

        {/* Board Cells Grid */}
        {cells.map((cell) => {
          const { x, y } = hexToPixel(cell.q, cell.r, hexSize);
          const pixelX = x - minX;
          const pixelY = y - minY;
          const stack = boardState[cell.id];
          const isValidTarget = validTargetIds.includes(cell.id);
          const isHoveredTarget = hoveredCellId === cell.id && isValidTarget;

          const hexW = SQRT_3 * hexSize;
          const hexH = 2 * hexSize;
          const cx = hexW / 2;
          const cy = hexH / 2;

          return (
            <div
              key={cell.id}
              data-cell-id={cell.id}
              onClick={() => onCellClick(cell)}
              className={`absolute transition-all duration-150 touch-none ${
                isValidTarget
                  ? 'cursor-pointer hover:brightness-110'
                  : 'cursor-default'
              } ${isHoveredTarget ? 'scale-105 z-40' : ''}`}
              style={{
                left: `${pixelX - hexW / 2}px`,
                top: `${pixelY - hexH / 2}px`,
                width: `${hexW}px`,
                height: `${hexH}px`,
                zIndex: isHoveredTarget ? 40 : stack ? 20 : 10,
              }}
            >
              {/* SVG Recessed Machined Hex Socket */}
              <svg
                viewBox={`0 0 ${hexW} ${hexH}`}
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              >
                <defs>
                  {/* Socket Outer Rim Gradient */}
                  <linearGradient id={`socket-rim-${cell.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop
                      offset="0%"
                      stopColor={
                        isHoveredTarget
                          ? '#34D399'
                          : isValidTarget
                          ? '#10B981'
                          : cell.isLocked
                          ? '#475569'
                          : cell.isBlocked
                          ? '#334155'
                          : '#475569'
                      }
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        isHoveredTarget
                          ? '#059669'
                          : isValidTarget
                          ? '#047857'
                          : cell.isLocked
                          ? '#1E293B'
                          : cell.isBlocked
                          ? '#0F172A'
                          : '#1E293B'
                      }
                    />
                  </linearGradient>

                  {/* Socket Depth Cavity Gradient (Simulates 4px vertical recess) */}
                  <linearGradient id={`socket-cavity-${cell.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#050811" />
                    <stop offset="60%" stopColor="#0B1120" />
                    <stop offset="100%" stopColor="#111827" />
                  </linearGradient>
                </defs>

                {/* 1. Socket Outer Rim Collar */}
                <path
                  d={getRoundedHexPath(cx, cy, hexSize, hexSize * 0.18)}
                  fill={`url(#socket-rim-${cell.id})`}
                  stroke={
                    isHoveredTarget
                      ? '#6EE7B7'
                      : isValidTarget
                      ? '#34D399'
                      : cell.isLocked
                      ? '#64748B'
                      : cell.isBlocked
                      ? '#475569'
                      : cell.restrictedColor
                      ? HEX_COLORS[cell.restrictedColor]?.primary || '#60A5FA'
                      : cell.bonusMultiplier
                      ? '#F59E0B'
                      : 'rgba(255,255,255,0.08)'
                  }
                  strokeWidth={
                    isHoveredTarget
                      ? 3.5
                      : isValidTarget
                      ? 2.5
                      : cell.restrictedColor || cell.bonusMultiplier
                      ? 2
                      : 1.2
                  }
                  strokeDasharray={isValidTarget && !isHoveredTarget ? '5 2.5' : undefined}
                  className={isValidTarget ? 'animate-pulse' : ''}
                />

                {/* 2. Socket Recessed Cavity Wall (Inner depth) */}
                <path
                  d={getRoundedHexPath(cx, cy, hexSize * 0.98, hexSize * 0.16 * 0.98)}
                  fill={`url(#socket-cavity-${cell.id})`}
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="1"
                />

                {/* 3. Socket Floor Plate */}
                <path
                  d={getRoundedHexPath(cx, cy, hexSize * 0.94, hexSize * 0.16 * 0.94)}
                  fill={
                    isHoveredTarget
                      ? 'rgba(52, 211, 153, 0.28)'
                      : cell.isBlocked
                      ? '#080c16'
                      : cell.isLocked
                      ? '#0f172a'
                      : isValidTarget
                      ? 'rgba(16, 185, 129, 0.15)'
                      : cell.restrictedColor
                      ? `${HEX_COLORS[cell.restrictedColor].primary}22`
                      : 'rgba(15, 23, 42, 0.75)'
                  }
                  stroke={
                    isHoveredTarget
                      ? '#34D399'
                      : isValidTarget
                      ? '#10B981'
                      : cell.restrictedColor
                      ? `${HEX_COLORS[cell.restrictedColor].primary}55`
                      : 'rgba(255, 255, 255, 0.05)'
                  }
                  strokeWidth="1"
                />

                {/* 4. Concentric Inner Hex Marker */}
                <path
                  d={getRoundedHexPath(cx, cy, hexSize * 0.48, hexSize * 0.18 * 0.48)}
                  fill="none"
                  stroke={
                    isHoveredTarget
                      ? '#6EE7B7'
                      : isValidTarget
                      ? 'rgba(52, 211, 153, 0.3)'
                      : 'rgba(255, 255, 255, 0.04)'
                  }
                  strokeWidth="1"
                  strokeDasharray={isValidTarget ? '3 2' : undefined}
                />

                {/* 5. Center Alignment Socket Node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={hexSize * 0.1}
                  fill={
                    isHoveredTarget
                      ? '#34D399'
                      : isValidTarget
                      ? '#10B981'
                      : 'rgba(255, 255, 255, 0.08)'
                  }
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="1"
                />

                {/* 6. Blocked Cell: 3D Cracked Basalt Stone Texture */}
                {cell.isBlocked && (
                  <>
                    <path
                      d={`M ${cx - hexSize * 0.35} ${cy - hexSize * 0.4} L ${cx - hexSize * 0.1} ${cy - hexSize * 0.1} L ${cx + hexSize * 0.2} ${cy + hexSize * 0.1} L ${cx + hexSize * 0.4} ${cy + hexSize * 0.35}`}
                      stroke="#EF4444"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.65"
                    />
                    <path
                      d={`M ${cx - hexSize * 0.1} ${cy - hexSize * 0.1} L ${cx - hexSize * 0.3} ${cy + hexSize * 0.3}`}
                      stroke="#F97316"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </>
                )}
              </svg>

              {/* Special Cell Badges & Indicators */}
              {cell.isBlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                  <div className="p-1 rounded-full bg-red-950/70 border border-red-800/60 shadow-md">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-[9px] font-display font-black uppercase tracking-wider mt-0.5 text-red-300/80 drop-shadow">
                    Wall
                  </span>
                </div>
              )}

              {cell.isLocked && !cell.isBlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-300 pointer-events-none">
                  <div className="p-1 rounded-full bg-amber-950/80 border border-amber-600/60 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                    <Lock className="w-4 h-4 text-amber-300" />
                  </div>
                  {cell.lockRequirement && (
                    <span className="text-[10px] font-display font-black mt-1 bg-slate-950/90 px-1.5 py-0.5 rounded-full text-amber-300 border border-amber-500/50 shadow">
                      {cell.lockRequirement.current}/{cell.lockRequirement.target}
                    </span>
                  )}
                </div>
              )}

              {cell.restrictedColor && !stack && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white/70 shadow-[0_0_8px_currentColor]"
                    style={{
                      backgroundColor: HEX_COLORS[cell.restrictedColor].primary,
                      color: HEX_COLORS[cell.restrictedColor].glow,
                    }}
                  />
                  <span className="text-[10px] font-black text-slate-200 mt-0.5 drop-shadow">
                    {HEX_COLORS[cell.restrictedColor].symbol}
                  </span>
                </div>
              )}

              {cell.bonusMultiplier && cell.bonusMultiplier > 1 && (
                <div className="absolute -top-2 -right-1.5 z-30 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-display font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.6)] border border-yellow-100 pointer-events-none flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                  {cell.bonusMultiplier}x
                </div>
              )}

              {/* Physical Tile Stack on Socket (Permanent board socket - cannot be moved) */}
              {stack && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <HexTileStack
                    stack={stack}
                    size={hexSize * 0.96}
                    isSelected={false}
                    showSymbol={showSymbols}
                    showCount={showCount}
                    maxCapacity={maxCapacity}
                    enableWaterfall={true}
                  />
                </div>
              )}

              {/* Celebration Particle Burst when stack completes */}
              {stack && (stack.isCompleted || stack.animating === 'clearing') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                  {/* Golden expanding shockwave ring */}
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0.95 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.48, ease: 'easeOut' }}
                    className="absolute w-12 h-12 rounded-full border-2 border-amber-300 bg-amber-400/20 shadow-[0_0_18px_#F59E0B]"
                  />
                  {/* Radial golden sparkle particles */}
                  {Array.from({ length: 8 }).map((_, pIdx) => {
                    const angle = (pIdx / 8) * Math.PI * 2;
                    const dist = hexSize * 1.15;
                    const targetX = Math.cos(angle) * dist;
                    const targetY = Math.sin(angle) * dist;
                    return (
                      <motion.div
                        key={`burst-sparkle-${pIdx}`}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: targetX, y: targetY, scale: 0.2, opacity: 0 }}
                        transition={{ duration: 0.44, ease: 'easeOut' }}
                        className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#F59E0B]"
                      />
                    );
                  })}
                </div>
              )}

              {/* Valid Target Emerald Beacon Ring */}
              {isValidTarget && !stack && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 rounded-full border-2 border-emerald-400/80 bg-emerald-400/20 shadow-[0_0_14px_#34d399] animate-beacon" />
                </div>
              )}
            </div>
          );
        })}

        {/* Dynamic Neighbor Waterfall Cascade Stream Overlay */}
        {activeTransfers && activeTransfers.length > 0 && (
          <CascadeStreamOverlay
            transfers={activeTransfers}
            hexSize={hexSize}
            minX={minX}
            minY={minY}
            showSymbols={showSymbols}
            onAllCompleted={onTransfersCompleted}
          />
        )}
      </div>
    </div>
  );
};
