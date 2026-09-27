import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { HexColorId, TileStack, TileStackLayer } from '../types';
import { HEX_COLORS } from '../data/colors';
import {
  SQRT_3,
  getRoundedHexPath,
  getRoundedHexCornerData,
  getRoundedFrontSkirtPath,
  getRoundedFrontRimPath,
} from '../utils/hexMath';
import { Crown, Sparkles } from 'lucide-react';

interface HexTileStackProps {
  stack: TileStack;
  size?: number; // Outer radius of hexagon
  isSelected?: boolean;
  showSymbol?: boolean;
  showCount?: boolean;
  isDraggable?: boolean;
  onSelect?: () => void;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  maxCapacity?: number;
  enableWaterfall?: boolean;
}

export const HexTileStack: React.FC<HexTileStackProps> = React.memo(({
  stack,
  size = 38,
  isSelected = false,
  showSymbol = true,
  showCount = true,
  onClick,
  maxCapacity = 10,
}) => {
  // Normalize multi-colored layers (ordered from bottom: 0 to top: last)
  const normalizedLayers: TileStackLayer[] = useMemo(() => {
    if (stack.layers && stack.layers.length > 0) {
      const cleaned = stack.layers.filter((l) => l.count > 0);
      return cleaned.length > 0 ? cleaned : [{ color: stack.color, count: stack.count }];
    }
    return [{ color: stack.color, count: stack.count }];
  }, [stack.layers, stack.color, stack.count]);

  const topLayer = normalizedLayers[normalizedLayers.length - 1];
  const topColor = topLayer.color;
  const colorDef = HEX_COLORS[topColor] || HEX_COLORS['ruby-red'];

  const count = stack.count;
  const isComplete = count >= maxCapacity || !!stack.isCompleted;
  const isClearing = stack.animating === 'clearing';
  const isRainbow = topColor === 'wild-rainbow';

  // Number of physical tile slices to draw (1 to 7)
  const visibleLayers = Math.min(Math.max(count, 1), 7);
  const layerThickness = size > 50 ? 8.2 : size > 42 ? 7.0 : 5.8;
  const rise = size > 50 ? 6.6 : size > 42 ? 5.6 : 4.6;
  const cornerRadius = size * 0.16; // Smooth modern rounded fillets

  // Allocate which color each of the visible slices represents from bottom to top
  const sliceColors: HexColorId[] = useMemo(() => {
    const numLayers = normalizedLayers.length;
    if (numLayers <= 1) {
      return Array.from({ length: visibleLayers }, () => normalizedLayers[0].color);
    }

    if (visibleLayers <= numLayers) {
      return normalizedLayers.slice(0, visibleLayers).map((l) => l.color);
    }

    // Every layer present gets at least 1 slice, remaining slices distributed proportionally
    const allocations = normalizedLayers.map(() => 1);
    let remaining = visibleLayers - numLayers;
    const totalCount = normalizedLayers.reduce((acc, l) => acc + l.count, 0) || 1;

    while (remaining > 0) {
      let bestIdx = 0;
      let maxDiff = -Infinity;
      for (let i = 0; i < numLayers; i++) {
        const ideal = (normalizedLayers[i].count / totalCount) * visibleLayers;
        const diff = ideal - allocations[i];
        if (diff > maxDiff) {
          maxDiff = diff;
          bestIdx = i;
        }
      }
      allocations[bestIdx]++;
      remaining--;
    }

    const result: HexColorId[] = [];
    normalizedLayers.forEach((layer, idx) => {
      for (let i = 0; i < allocations[idx]; i++) {
        result.push(layer.color);
      }
    });
    return result;
  }, [normalizedLayers, visibleLayers]);

  // Unique colors in this stack for defining gradients in SVG defs
  const uniqueColors = useMemo(() => {
    const set = new Set<HexColorId>();
    normalizedLayers.forEach((l) => set.add(l.color));
    set.add(topColor);
    return Array.from(set);
  }, [normalizedLayers, topColor]);

  // Hexagon geometry calculations
  const hexW = SQRT_3 * size;
  const hexH = 2 * size;
  const cx = hexW / 2;
  const cy = hexH / 2;

  // Unique ID prefix for gradients
  const gradId = `hex-tile-${stack.id}`;

  return (
    <motion.div
      onClick={onClick}
      className={`relative cursor-pointer select-none ${
        isSelected ? 'z-30' : isClearing ? 'z-40' : 'z-10'
      }`}
      animate={
        isSelected
          ? { y: -16, scale: 1.08, opacity: 1 }
          : isClearing
          ? {
              scale: [1, 1.15, 1.18, 0.05],
              y: [0, -10, -16, -26],
              opacity: [1, 1, 1, 0],
            }
          : isComplete
          ? {
              scale: [1, 1.08, 1.04],
              y: [0, -6, -4],
              opacity: 1,
            }
          : stack.animating === 'bounce' || stack.animating === 'waterfall'
          ? { scale: [1, 1.12, 0.96, 1], y: [0, -8, 2, 0], opacity: 1 }
          : { y: 0, scale: 1, opacity: 1 }
      }
      transition={
        isClearing
          ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
          : isComplete
          ? { duration: 0.18, ease: 'easeOut' }
          : stack.animating === 'bounce' || stack.animating === 'waterfall'
          ? { duration: 0.16, ease: 'easeOut' }
          : { duration: 0.12, ease: 'easeOut' }
      }
      style={{
        width: `${hexW}px`,
        height: `${hexH}px`,
      }}
    >
      {/* Floating Celebration +150 MAX Score Banner on Complete or Clearing */}
      {(isComplete || isClearing) && (
        <motion.div
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{ y: -38, opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 0.8] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-display font-black text-[11px] px-2 py-0.5 rounded-full shadow-[0_4px_14px_rgba(245,158,11,0.7)] border border-white whitespace-nowrap"
        >
          <Crown className="w-3 h-3 fill-slate-950 text-slate-950" />
          <span>+150 MAX!</span>
        </motion.div>
      )}

      {/* 3D SVG Render of Physical Stack with Smooth Rounded Corners and Multi-Color Tactile Layers */}
      <svg
        viewBox={`0 0 ${hexW} ${hexH}`}
        className={`w-full h-full overflow-visible pointer-events-none ${
          isRainbow ? 'animate-rainbow' : ''
        }`}
        style={{
          filter: isSelected
            ? `drop-shadow(0 14px 20px ${colorDef.glow}) drop-shadow(0 0 10px #fbbf24)`
            : isComplete || isClearing
            ? `drop-shadow(0 0 16px ${colorDef.glow}) drop-shadow(0 0 22px #F59E0B)`
            : 'drop-shadow(0 8px 14px rgba(0,0,0,0.65))',
        }}
      >
        <defs>
          {/* Render individual color gradients for every color represented in this stack */}
          {uniqueColors.map((colId) => {
            const def = HEX_COLORS[colId] || HEX_COLORS['ruby-red'];
            const rainbow = colId === 'wild-rainbow';
            const cGradId = `${gradId}-${colId}`;

            return (
              <React.Fragment key={colId}>
                {/* Top Cap Gradient */}
                <linearGradient id={`${cGradId}-top`} x1="15%" y1="10%" x2="85%" y2="90%">
                  {rainbow ? (
                    <>
                      <stop offset="0%" stopColor="#ff4d4d" />
                      <stop offset="25%" stopColor="#f9cb28" />
                      <stop offset="50%" stopColor="#79ff79" />
                      <stop offset="75%" stopColor="#4deeea" />
                      <stop offset="100%" stopColor="#b44dff" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor={def.highlight} />
                      <stop offset="55%" stopColor={def.primary} />
                      <stop offset="100%" stopColor={def.shadow} />
                    </>
                  )}
                </linearGradient>

                {/* Front Skirt Gradient */}
                <linearGradient id={`${cGradId}-skirt`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={def.shadow} />
                  <stop offset="20%" stopColor={def.primary} />
                  <stop offset="50%" stopColor={def.highlight} />
                  <stop offset="80%" stopColor={def.primary} />
                  <stop offset="100%" stopColor={def.shadow} />
                </linearGradient>

                {/* Vertical Depth Gradient for Skirt */}
                <linearGradient id={`${cGradId}-skirt-v`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                  <stop offset="40%" stopColor="rgba(255,255,255,0.0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
                </linearGradient>
              </React.Fragment>
            );
          })}

          {/* Top Layer Ambient Specular Highlight */}
          <radialGradient
            id={`${gradId}-top-specular`}
            cx="35%"
            cy="28%"
            r="60%"
            fx="30%"
            fy="25%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </radialGradient>
        </defs>

        {/* 1. Base Drop Shadow on the Socket Floor */}
        <path
          d={getRoundedHexPath(cx, cy + 3, size * 0.94, cornerRadius)}
          fill="rgba(0, 0, 0, 0.45)"
          className="blur-[2px]"
        />

        {/* 2. Stack Layers from Bottom to Top (each styled with its exact layer color) */}
        {Array.from({ length: visibleLayers }).map((_, idx) => {
          const isTop = idx === visibleLayers - 1;
          const dy = -idx * rise;
          const t = layerThickness;

          const sliceColor = sliceColors[idx] || topColor;
          const sliceGradId = `${gradId}-${sliceColor}`;
          const sliceColorDef = HEX_COLORS[sliceColor] || HEX_COLORS['ruby-red'];

          // Get corner vertices at this layer height
          const { corners } = getRoundedHexCornerData(cx, cy + dy, size, cornerRadius);

          return (
            <g key={`layer-${idx}`}>
              {/* Continuous Rounded 3D Front Skirt Extrusion in this layer's color */}
              <path
                d={getRoundedFrontSkirtPath(cx, cy, size, dy, t, cornerRadius)}
                fill={`url(#${sliceGradId}-skirt)`}
              />
              {/* Vertical lighting & contact shade overlay on the skirt */}
              <path
                d={getRoundedFrontSkirtPath(cx, cy, size, dy, t, cornerRadius)}
                fill={`url(#${sliceGradId}-skirt-v)`}
              />

              {/* Vertical Corner Crease Highlights on the 3 front rounded corners */}
              <line
                x1={corners[3].vertex.x}
                y1={corners[3].vertex.y}
                x2={corners[3].vertex.x}
                y2={corners[3].vertex.y + t}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.9"
              />
              <line
                x1={corners[2].vertex.x - 0.5}
                y1={corners[2].vertex.y}
                x2={corners[2].vertex.x - 0.5}
                y2={corners[2].vertex.y + t}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="0.9"
              />
              <line
                x1={corners[1].vertex.x}
                y1={corners[1].vertex.y}
                x2={corners[1].vertex.x}
                y2={corners[1].vertex.y + t}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.9"
              />

              {/* Rounded Front Bottom Rim Lip Highlight */}
              <path
                d={getRoundedFrontRimPath(cx, cy, size, dy, t, cornerRadius)}
                fill="none"
                stroke="rgba(0,0,0,0.55)"
                strokeWidth="0.8"
              />

              {/* Top Face Cap of Layer (renders fully for top slice, subtle rim for inner slices) */}
              {isTop ? (
                <>
                  {/* Top Face Hexagon */}
                  <path
                    d={getRoundedHexPath(cx, cy + dy, size, cornerRadius)}
                    fill={`url(#${sliceGradId}-top)`}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.2"
                  />
                  {/* Top Gloss Specular Highlight */}
                  <path
                    d={getRoundedHexPath(cx, cy + dy, size, cornerRadius)}
                    fill={`url(#${gradId}-top-specular)`}
                  />
                  {/* Golden Victory Halo if Completed */}
                  {isComplete && (
                    <path
                      d={getRoundedHexPath(cx, cy + dy, size * 0.96, cornerRadius * 0.9)}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                    />
                  )}
                  {/* Subtle Inner Tactile Ring */}
                  <path
                    d={getRoundedHexPath(cx, cy + dy, size * 0.58, cornerRadius * 0.5)}
                    fill="none"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.8"
                    strokeDasharray="4 2"
                  />
                </>
              ) : (
                <>
                  {/* Inner layer top face outline */}
                  <path
                    d={getRoundedHexPath(cx, cy + dy, size, cornerRadius)}
                    fill={`url(#${sliceGradId}-top)`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.8"
                  />
                  {/* Shadow from the layer above casting downward */}
                  <path
                    d={getRoundedHexPath(cx, cy + dy, size * 0.98, cornerRadius)}
                    fill="rgba(0, 0, 0, 0.28)"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Embossed Coin Badge on Top of Stack */}
      {(showCount || showSymbol || isComplete) && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          animate={{
            y: -(visibleLayers - 1) * rise - (size > 50 ? 4 : size > 40 ? 3 : 2),
          }}
          transition={{
            y: { type: 'spring', stiffness: 340, damping: 25 },
          }}
        >
          {/* Embossed Tactile Coin Badge */}
          <div
            className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 ${
              isComplete
                ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 ring-2 ring-white shadow-[0_0_18px_rgba(245,158,11,0.95),inset_0_1px_2px_rgba(255,255,255,0.8)] animate-pulse'
                : 'bg-slate-950/90 text-white backdrop-blur-[4px] ring-1.5 ring-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_4px_10px_rgba(0,0,0,0.75)]'
            } ${
              size > 55
                ? 'min-w-[38px] py-1 px-2.5'
                : size > 44
                ? 'min-w-[32px] py-1 px-2'
                : 'min-w-[24px] py-0.5 px-1.5'
            }`}
          >
            {/* Subtle metallic glass sheen */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />

            <div className="relative flex items-center justify-center gap-1.5">
              {/* Accessibility Icon / Color Symbol for active top layer */}
              {showSymbol && !isComplete && (
                <span
                  className={`font-black leading-none drop-shadow-sm select-none ${
                    size > 55 ? 'text-sm' : size > 44 ? 'text-xs' : 'text-[10px]'
                  }`}
                  style={{
                    color: isRainbow ? '#FEF08A' : colorDef.highlight,
                  }}
                >
                  {colorDef.symbol}
                </span>
              )}

              {/* Complete Crown */}
              {isComplete && (
                <Crown
                  className={`${
                    size > 55 ? 'w-4 h-4' : size > 44 ? 'w-3.5 h-3.5' : 'w-3 h-3'
                  } text-amber-950 fill-amber-950 mr-0.5`}
                />
              )}

              {/* Tile Count */}
              {showCount && (
                <span
                  className={`font-display font-black leading-none tracking-tight select-none ${
                    size > 55 ? 'text-base' : size > 44 ? 'text-sm' : 'text-xs'
                  } ${isComplete ? 'text-amber-950' : 'text-white'}`}
                >
                  {count}
                </span>
              )}
            </div>

            {/* Multi-Colored Layer Indicator Dots (Bottom to Top) */}
            {normalizedLayers.length > 1 && !isComplete && (
              <div className="flex items-center justify-center gap-1 mt-0.5 pointer-events-none">
                {normalizedLayers.map((l, i) => {
                  const dotColorDef = HEX_COLORS[l.color] || HEX_COLORS['ruby-red'];
                  const isCurrentTop = i === normalizedLayers.length - 1;
                  return (
                    <span
                      key={`layer-dot-${i}`}
                      className={`rounded-full transition-transform ${
                        isCurrentTop
                          ? size > 50
                            ? 'w-2.5 h-2.5 ring-1.5 ring-white/90 shadow-[0_0_5px_white]'
                            : 'w-2 h-2 ring-1 ring-white/90 shadow-[0_0_4px_white]'
                          : size > 50
                          ? 'w-2 h-2 opacity-85 shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                          : 'w-1.5 h-1.5 opacity-85 shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${dotColorDef.highlight}, ${dotColorDef.primary})`,
                      }}
                      title={`Layer ${i + 1}: ${l.count} tiles (${dotColorDef.name})`}
                    />
                  );
                })}
              </div>
            )}

            {/* Sparkle badge for rainbow tiles */}
            {isRainbow && !isComplete && (
              <div className="absolute -top-1.5 -right-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin fill-yellow-300 drop-shadow" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});
