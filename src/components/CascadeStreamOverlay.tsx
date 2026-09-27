import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CascadeTransfer } from '../types';
import { hexToPixel } from '../utils/hexMath';
import { HEX_COLORS } from '../data/colors';
import { Sparkles } from 'lucide-react';

interface CascadeStreamOverlayProps {
  transfers: CascadeTransfer[];
  hexSize: number;
  minX: number;
  minY: number;
  showSymbols?: boolean;
  onAllCompleted?: () => void;
}

export const CascadeStreamOverlay: React.FC<CascadeStreamOverlayProps> = React.memo(({
  transfers,
  hexSize,
  minX,
  minY,
  showSymbols = true,
  onAllCompleted,
}) => {
  // Fast, punchy flight duration (24ms per tile stagger + 190ms arrival flight)
  useEffect(() => {
    if (!transfers || transfers.length === 0) return;
    const maxTiles = Math.max(...transfers.map((t) => t.count), 1);
    const durationMs = (maxTiles - 1) * 24 + 190;
    const timer = setTimeout(() => {
      onAllCompleted?.();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [transfers, onAllCompleted]);

  if (!transfers || transfers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {transfers.map((transfer) => {
        const fromPixel = hexToPixel(transfer.fromQ, transfer.fromR, hexSize);
        const toPixel = hexToPixel(transfer.toQ, transfer.toR, hexSize);

        const x1 = fromPixel.x - minX;
        const y1 = fromPixel.y - minY;
        const x2 = toPixel.x - minX;
        const y2 = toPixel.y - minY;

        const colorDef = HEX_COLORS[transfer.color] || HEX_COLORS['ruby-red'];
        const chipRadius = hexSize * 0.42;

        return (
          <React.Fragment key={transfer.id}>
            {/* Rapid Energy Flow Beam between hex sockets */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <defs>
                <linearGradient
                  id={`beam-grad-${transfer.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={colorDef.glow} stopOpacity="0.2" />
                  <stop offset="60%" stopColor={colorDef.highlight} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={colorDef.primary} stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <motion.path
                d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 28} ${x2} ${y2}`}
                fill="none"
                stroke={`url(#beam-grad-${transfer.id})`}
                strokeWidth="3"
                strokeDasharray="5 3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 1], opacity: [0, 0.95, 0] }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
            </svg>

            {/* Snappy Flying Tiles with 120fps GPU Compositing */}
            {Array.from({ length: transfer.count }).map((_, i) => {
              const delay = i * 0.024;
              const midX = (x1 + x2) / 2;
              const midY = Math.min(y1, y2) - 26 - i * 3;

              return (
                <motion.div
                  key={`${transfer.id}-chip-${i}`}
                  initial={{
                    x: x1,
                    y: y1,
                    scale: 0.5,
                    opacity: 0,
                    rotate: 0,
                  }}
                  animate={{
                    x: [x1, midX, x2],
                    y: [y1, midY, y2],
                    scale: [0.7, 1.12, 0.4],
                    opacity: [0, 1, 1, 0],
                    rotate: [0, i % 2 === 0 ? 12 : -12, 0],
                  }}
                  transition={{
                    duration: 0.18,
                    delay,
                    times: [0, 0.4, 0.85, 1],
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute top-0 left-0 -ml-[18px] -mt-[16px] flex items-center justify-center pointer-events-none will-change-transform"
                >
                  {/* Glowing 3D Mini Hex Chip in Flight */}
                  <div
                    className="relative rounded-lg flex items-center justify-center border border-white/70 shadow-md shadow-black/50"
                    style={{
                      width: `${chipRadius * 2}px`,
                      height: `${chipRadius * 1.75}px`,
                      background: `linear-gradient(135deg, ${colorDef.highlight} 0%, ${colorDef.primary} 70%, ${colorDef.shadow} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent via-white/20 to-white/40 pointer-events-none" />
                    {showSymbols && (
                      <span className="text-[11px] font-black text-white drop-shadow select-none">
                        {colorDef.symbol}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
});
