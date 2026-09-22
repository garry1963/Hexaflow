import React from 'react';
import { motion } from 'motion/react';
import { TileStack } from '../types';
import { HexTileStack } from './HexTileStack';

interface TraySlotProps {
  index: number;
  stack: TileStack | null;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  onDragStart?: (e: React.PointerEvent, index: number, stack: TileStack) => void;
  showSymbols: boolean;
  maxCapacity: number;
}

export const TraySlot: React.FC<TraySlotProps> = ({
  index,
  stack,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  showSymbols,
  maxCapacity,
}) => {
  return (
    <div
      onClick={stack && !isDragging ? onSelect : undefined}
      onPointerDown={(e) => {
        if (stack && onDragStart) {
          onDragStart(e, index, stack);
        }
      }}
      className={`relative flex items-center justify-center rounded-2xl p-3 transition-all duration-200 cursor-grab active:cursor-grabbing min-w-[88px] min-h-[96px] md:min-w-[104px] md:min-h-[112px] select-none touch-none ${
        isDragging
          ? 'opacity-35 scale-95 border-2 border-dashed border-cyan-400 bg-slate-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          : isSelected
          ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.45)] scale-105'
          : stack
          ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 hover:border-slate-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)] active:scale-95'
          : 'bg-slate-900/40 border border-dashed border-slate-800/80 opacity-50 shadow-inner'
      }`}
    >
      {/* 3D Machined Base Pad with Inset Depth */}
      <div className="absolute inset-2 rounded-xl bg-gradient-to-b from-black/40 to-slate-950/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] pointer-events-none" />

      {/* Center Target Crosshair / Staging Ring */}
      <div className="absolute w-8 h-8 rounded-full border border-white/5 pointer-events-none flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
      </div>

      {stack ? (
        <motion.div
          key={stack.id}
          initial={{ scale: 0.7, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: isDragging ? 0.3 : 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
          <HexTileStack
            stack={stack}
            size={36}
            isSelected={isSelected && !isDragging}
            showSymbol={showSymbols}
            maxCapacity={maxCapacity}
          />
        </motion.div>
      ) : (
        <span className="relative z-10 text-slate-500/80 font-display text-[11px] font-bold tracking-wider uppercase select-none">
          Slot {index + 1}
        </span>
      )}
    </div>
  );
};
