import { LevelData } from '../types';

export const CAMPAIGN_LEVELS: LevelData[] = [
  // WORLD 1 — INTRODUCTION (Levels 1 - 5)
  {
    id: 1,
    worldId: 1,
    title: 'First Sort',
    subtitle: 'Learn to stack and merge',
    difficulty: 1,
    boardRadius: 1, // 7 cells
    stackCapacity: 10,
    availableColors: ['ruby-red', 'azure-blue'],
    startingBoard: [
      { cellId: '0_0', color: 'ruby-red', count: 4 },
      { cellId: '1_0', color: 'ruby-red', count: 3 },
      { cellId: '-1_0', color: 'azure-blue', count: 5 },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 3 },
      { color: 'azure-blue', count: 5 },
      { color: 'ruby-red', count: 4 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 1 Red and 1 Blue stack (10/10)',
      targetColors: { 'ruby-red': 1, 'azure-blue': 1 },
      moveLimit: 12,
    },
    starThresholds: [400, 800, 1200],
    tips: 'Tap or drag a stack to an adjacent matching color to merge them!',
  },
  {
    id: 2,
    worldId: 1,
    title: 'Twin Streams',
    subtitle: 'Build stacks to capacity',
    difficulty: 1,
    boardRadius: 1,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'sunburst-yellow'],
    startingBoard: [
      { cellId: '0_-1', color: 'ruby-red', count: 5 },
      { cellId: '0_1', color: 'sunburst-yellow', count: 4 },
      { cellId: '1_-1', color: 'ruby-red', count: 2 },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 3 },
      { color: 'sunburst-yellow', count: 6 },
      { color: 'ruby-red', count: 2 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 1 Red and 1 Yellow stack',
      targetColors: { 'ruby-red': 1, 'sunburst-yellow': 1 },
      moveLimit: 14,
    },
    starThresholds: [500, 950, 1400],
    tips: 'When a stack reaches 10 tiles, it clears the board space automatically!',
  },
  {
    id: 3,
    worldId: 1,
    title: 'Clear the Center',
    subtitle: 'Clear every stack on the board',
    difficulty: 1,
    boardRadius: 1,
    stackCapacity: 10,
    availableColors: ['azure-blue', 'emerald-green'],
    startingBoard: [
      { cellId: '0_0', color: 'azure-blue', count: 6 },
      { cellId: '1_0', color: 'emerald-green', count: 5 },
      { cellId: '-1_1', color: 'azure-blue', count: 2 },
      { cellId: '0_1', color: 'emerald-green', count: 3 },
    ],
    incomingPool: [
      { color: 'azure-blue', count: 2 },
      { color: 'emerald-green', count: 2 },
      { color: 'azure-blue', count: 4 },
      { color: 'emerald-green', count: 4 },
    ],
    objective: {
      type: 'clear_board',
      description: 'Clear all initial tiles from the board',
      moveLimit: 15,
    },
    starThresholds: [600, 1100, 1600],
    tips: 'Adjacent matching stacks cascade into the target stack!',
  },
  {
    id: 4,
    worldId: 1,
    title: 'Cascade Chain',
    subtitle: 'Mastering combo merges',
    difficulty: 1,
    boardRadius: 1,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'emerald-green'],
    startingBoard: [
      { cellId: '-1_0', color: 'ruby-red', count: 4 },
      { cellId: '0_0', color: 'emerald-green', count: 6 },
      { cellId: '1_0', color: 'ruby-red', count: 3 },
      { cellId: '0_-1', color: 'emerald-green', count: 2 },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 3 },
      { color: 'emerald-green', count: 2 },
      { color: 'ruby-red', count: 4 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 1 Red & 1 Green stack',
      targetColors: { 'ruby-red': 1, 'emerald-green': 1 },
      moveLimit: 14,
    },
    starThresholds: [650, 1200, 1800],
  },
  {
    id: 5,
    worldId: 1,
    title: 'World 1 Mastery',
    subtitle: 'Multi-layer stack debut',
    difficulty: 2,
    boardRadius: 1,
    stackCapacity: 10,
    availableColors: ['azure-blue', 'sunburst-yellow', 'ruby-red'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'sunburst-yellow',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 3 },
          { color: 'sunburst-yellow', count: 3 },
        ],
      },
      {
        cellId: '1_-1',
        color: 'azure-blue',
        count: 6,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'azure-blue', count: 4 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'ruby-red',
        count: 4,
        layers: [{ color: 'ruby-red', count: 4 }],
      },
      {
        cellId: '0_1',
        color: 'ruby-red',
        count: 5,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
    ],
    incomingPool: [
      {
        color: 'sunburst-yellow',
        count: 4,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'sunburst-yellow', count: 2 },
        ],
      },
      { color: 'azure-blue', count: 3 },
      { color: 'sunburst-yellow', count: 4 },
      { color: 'ruby-red', count: 3 },
      {
        color: 'ruby-red',
        count: 4,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 2 },
        ],
      },
    ],
    objective: {
      type: 'target_score',
      description: 'Score 1,500 points',
      targetScore: 1500,
      moveLimit: 16,
    },
    starThresholds: [1000, 1500, 2200],
    tips: 'Multi-layer stacks unlocked! Stacks can hold up to 3 colors. Merge the top layer to uncover what lies beneath!',
  },

  // WORLD 2 — FUNDAMENTALS (Levels 6 - 10)
  {
    id: 6,
    worldId: 2,
    title: 'Tricolor Valley',
    subtitle: 'Triple-layer stacks emerge',
    difficulty: 2,
    boardRadius: 2, // 19 cells
    stackCapacity: 10,
    availableColors: ['ruby-red', 'azure-blue', 'sunburst-yellow'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'sunburst-yellow',
        count: 7,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'azure-blue', count: 2 },
          { color: 'sunburst-yellow', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'ruby-red',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 3 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '-1_1',
        color: 'azure-blue',
        count: 5,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      {
        cellId: '0_-1',
        color: 'ruby-red',
        count: 4,
        layers: [{ color: 'ruby-red', count: 4 }],
      },
    ],
    incomingPool: [
      {
        color: 'sunburst-yellow',
        count: 5,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'sunburst-yellow', count: 3 },
        ],
      },
      { color: 'azure-blue', count: 5 },
      {
        color: 'ruby-red',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'ruby-red', count: 4 },
        ],
      },
      { color: 'sunburst-yellow', count: 4 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 1 Red, 1 Blue, and 1 Yellow stack',
      targetColors: { 'ruby-red': 1, 'azure-blue': 1, 'sunburst-yellow': 1 },
      moveLimit: 18,
    },
    starThresholds: [800, 1600, 2400],
    tips: 'The coin badge displays layer dots at the bottom showing each color from bottom to top!',
  },
  {
    id: 7,
    worldId: 2,
    title: 'Honeycomb Flow',
    subtitle: 'Triple-layer coordination',
    difficulty: 2,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['emerald-green', 'azure-blue', 'royal-purple'],
    startingBoard: [
      {
        cellId: '-1_-1',
        color: 'royal-purple',
        count: 7,
        layers: [
          { color: 'emerald-green', count: 2 },
          { color: 'azure-blue', count: 2 },
          { color: 'royal-purple', count: 3 },
        ],
      },
      {
        cellId: '1_1',
        color: 'emerald-green',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 3 },
          { color: 'emerald-green', count: 3 },
        ],
      },
      {
        cellId: '0_0',
        color: 'azure-blue',
        count: 5,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'royal-purple',
        count: 4,
        layers: [{ color: 'royal-purple', count: 4 }],
      },
    ],
    incomingPool: [
      {
        color: 'royal-purple',
        count: 5,
        layers: [
          { color: 'emerald-green', count: 2 },
          { color: 'royal-purple', count: 3 },
        ],
      },
      { color: 'emerald-green', count: 5 },
      { color: 'azure-blue', count: 6 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 1 Purple & 1 Green stack',
      targetColors: { 'royal-purple': 1, 'emerald-green': 1 },
      moveLimit: 16,
    },
    starThresholds: [900, 1750, 2500],
  },
  {
    id: 8,
    worldId: 2,
    title: 'Tight Quarters',
    subtitle: 'Multi-layer clearing',
    difficulty: 2,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['tangerine-orange', 'cyan-breeze', 'emerald-green'],
    startingBoard: [
      {
        cellId: '-1_0',
        color: 'tangerine-orange',
        count: 6,
        layers: [
          { color: 'emerald-green', count: 2 },
          { color: 'cyan-breeze', count: 2 },
          { color: 'tangerine-orange', count: 2 },
        ],
      },
      {
        cellId: '0_0',
        color: 'cyan-breeze',
        count: 6,
        layers: [
          { color: 'tangerine-orange', count: 3 },
          { color: 'cyan-breeze', count: 3 },
        ],
      },
      { cellId: '1_0', color: 'emerald-green', count: 4 },
      { cellId: '0_-1', color: 'tangerine-orange', count: 3 },
      {
        cellId: '0_1',
        color: 'cyan-breeze',
        count: 5,
        layers: [
          { color: 'emerald-green', count: 2 },
          { color: 'cyan-breeze', count: 3 },
        ],
      },
    ],
    incomingPool: [
      { color: 'tangerine-orange', count: 3 },
      { color: 'cyan-breeze', count: 3 },
      { color: 'emerald-green', count: 6 },
    ],
    objective: {
      type: 'clear_board',
      description: 'Clear all initial board stacks',
      moveLimit: 17,
    },
    starThresholds: [1000, 1900, 2800],
  },
  {
    id: 9,
    worldId: 2,
    title: 'Prism Puzzle',
    subtitle: 'Score accelerator',
    difficulty: 3,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['bubblegum-pink', 'azure-blue', 'sunburst-yellow'],
    startingBoard: [
      {
        cellId: '-1_1',
        color: 'bubblegum-pink',
        count: 7,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'sunburst-yellow', count: 2 },
          { color: 'bubblegum-pink', count: 3 },
        ],
      },
      {
        cellId: '1_-1',
        color: 'azure-blue',
        count: 5,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      { cellId: '0_0', color: 'sunburst-yellow', count: 6 },
      { cellId: '-2_1', color: 'bubblegum-pink', count: 2 },
    ],
    incomingPool: [
      { color: 'bubblegum-pink', count: 3 },
      { color: 'azure-blue', count: 6 },
      { color: 'sunburst-yellow', count: 4 },
    ],
    objective: {
      type: 'target_score',
      description: 'Reach 2,200 points',
      targetScore: 2200,
      moveLimit: 18,
    },
    starThresholds: [1500, 2200, 3100],
  },
  {
    id: 10,
    worldId: 2,
    title: 'World 2 Finale',
    subtitle: 'Grand tri-merge',
    difficulty: 3,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'emerald-green', 'royal-purple'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'emerald-green', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'emerald-green',
        count: 6,
        layers: [
          { color: 'royal-purple', count: 3 },
          { color: 'emerald-green', count: 3 },
        ],
      },
      { cellId: '1_0', color: 'royal-purple', count: 4 },
      { cellId: '0_-1', color: 'ruby-red', count: 2 },
      { cellId: '0_1', color: 'royal-purple', count: 3 },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 2 },
      { color: 'emerald-green', count: 5 },
      { color: 'royal-purple', count: 3 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 1 of each colour (Red, Green, Purple)',
      targetColors: { 'ruby-red': 1, 'emerald-green': 1, 'royal-purple': 1 },
      moveLimit: 20,
    },
    starThresholds: [1600, 2500, 3500],
  },

  // WORLD 3 — STRATEGY (Levels 11 - 15)
  {
    id: 11,
    worldId: 3,
    title: 'Four Elements',
    subtitle: 'Introducing 4 vibrant colours',
    difficulty: 3,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'azure-blue', 'emerald-green', 'sunburst-yellow'],
    startingBoard: [
      {
        cellId: '-1_-1',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'emerald-green', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '1_-1',
        color: 'azure-blue',
        count: 6,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'azure-blue', count: 4 },
        ],
      },
      {
        cellId: '-1_1',
        color: 'emerald-green',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 3 },
          { color: 'emerald-green', count: 3 },
        ],
      },
      {
        cellId: '1_1',
        color: 'sunburst-yellow',
        count: 5,
        layers: [
          { color: 'emerald-green', count: 2 },
          { color: 'sunburst-yellow', count: 3 },
        ],
      },
    ],
    incomingPool: [
      {
        color: 'ruby-red',
        count: 5,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      { color: 'azure-blue', count: 6 },
      {
        color: 'emerald-green',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'emerald-green', count: 4 },
        ],
      },
      { color: 'sunburst-yellow', count: 5 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 2 full colour stacks',
      targetColors: { 'ruby-red': 1, 'azure-blue': 1 },
      moveLimit: 19,
    },
    starThresholds: [1400, 2400, 3400],
  },
  {
    id: 12,
    worldId: 3,
    title: 'Move Miser',
    subtitle: 'Limited moves challenge',
    difficulty: 3,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['tangerine-orange', 'cyan-breeze', 'royal-purple', 'lime-spring'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'tangerine-orange',
        count: 7,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'cyan-breeze', count: 2 },
          { color: 'tangerine-orange', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'cyan-breeze',
        count: 6,
        layers: [
          { color: 'lime-spring', count: 2 },
          { color: 'cyan-breeze', count: 4 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'royal-purple',
        count: 5,
        layers: [
          { color: 'tangerine-orange', count: 2 },
          { color: 'royal-purple', count: 3 },
        ],
      },
      {
        cellId: '0_1',
        color: 'lime-spring',
        count: 5,
        layers: [
          { color: 'cyan-breeze', count: 2 },
          { color: 'lime-spring', count: 3 },
        ],
      },
    ],
    incomingPool: [
      {
        color: 'tangerine-orange',
        count: 5,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'tangerine-orange', count: 3 },
        ],
      },
      { color: 'cyan-breeze', count: 5 },
      { color: 'royal-purple', count: 6 },
      { color: 'lime-spring', count: 5 },
    ],
    objective: {
      type: 'limited_moves',
      description: 'Complete 2 stacks within 14 moves',
      targetColors: { 'tangerine-orange': 1, 'cyan-breeze': 1 },
      moveLimit: 14,
    },
    starThresholds: [1500, 2600, 3700],
    tips: 'Every move matters! Plan cascades that merge multiple neighbors.',
  },
  {
    id: 13,
    worldId: 3,
    title: 'Locked Vault',
    subtitle: 'Unlock spaces with successful merges',
    difficulty: 3,
    boardRadius: 2,
    customCells: [
      // Outer cell marked as locked
      { id: '0_2', q: 0, r: 2, isLocked: true, lockRequirement: { type: 'merges', target: 3, current: 0 } },
      { id: '0_-2', q: 0, r: -2, isLocked: true, lockRequirement: { type: 'merges', target: 5, current: 0 } },
    ],
    stackCapacity: 10,
    availableColors: ['ruby-red', 'bubblegum-pink', 'orchid-magenta', 'azure-blue'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'bubblegum-pink', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'bubblegum-pink',
        count: 6,
        layers: [
          { color: 'orchid-magenta', count: 3 },
          { color: 'bubblegum-pink', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'orchid-magenta',
        count: 5,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'orchid-magenta', count: 3 },
        ],
      },
      { cellId: '0_-1', color: 'azure-blue', count: 6 },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 5 },
      {
        color: 'bubblegum-pink',
        count: 5,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'bubblegum-pink', count: 3 },
        ],
      },
      { color: 'orchid-magenta', count: 5 },
      { color: 'azure-blue', count: 4 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 3 stacks to break the vaults',
      targetColors: { 'ruby-red': 1, 'bubblegum-pink': 1, 'orchid-magenta': 1 },
      moveLimit: 22,
    },
    starThresholds: [1800, 2900, 4200],
  },
  {
    id: 14,
    worldId: 3,
    title: 'Color Sanctuary',
    subtitle: 'Color restricted portal cells',
    difficulty: 4,
    boardRadius: 2,
    customCells: [
      { id: '1_0', q: 1, r: 0, restrictedColor: 'azure-blue' },
      { id: '-1_0', q: -1, r: 0, restrictedColor: 'emerald-green' },
    ],
    stackCapacity: 10,
    availableColors: ['azure-blue', 'emerald-green', 'sunburst-yellow', 'tangerine-orange'],
    startingBoard: [
      {
        cellId: '1_0',
        color: 'azure-blue',
        count: 5,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'emerald-green',
        count: 5,
        layers: [
          { color: 'tangerine-orange', count: 2 },
          { color: 'emerald-green', count: 3 },
        ],
      },
      {
        cellId: '0_0',
        color: 'sunburst-yellow',
        count: 6,
        layers: [
          { color: 'emerald-green', count: 2 },
          { color: 'sunburst-yellow', count: 4 },
        ],
      },
      { cellId: '0_-1', color: 'tangerine-orange', count: 6 },
    ],
    incomingPool: [
      { color: 'azure-blue', count: 6 },
      { color: 'emerald-green', count: 6 },
      { color: 'sunburst-yellow', count: 5 },
      { color: 'tangerine-orange', count: 4 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Fill the Azure Blue and Emerald Green portals',
      targetColors: { 'azure-blue': 1, 'emerald-green': 1 },
      moveLimit: 18,
    },
    starThresholds: [1800, 2800, 4000],
  },
  {
    id: 15,
    worldId: 3,
    title: 'World 3 Finale',
    subtitle: 'The 3,500 point grand challenge',
    difficulty: 4,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'royal-purple', 'cyan-breeze', 'sunburst-yellow'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'royal-purple', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'royal-purple',
        count: 6,
        layers: [
          { color: 'cyan-breeze', count: 3 },
          { color: 'royal-purple', count: 3 },
        ],
      },
      {
        cellId: '-1_1',
        color: 'cyan-breeze',
        count: 5,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'cyan-breeze', count: 3 },
        ],
      },
      { cellId: '0_-1', color: 'sunburst-yellow', count: 5 },
      { cellId: '0_1', color: 'ruby-red', count: 2 },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 2 },
      { color: 'royal-purple', count: 5 },
      { color: 'cyan-breeze', count: 6 },
      { color: 'sunburst-yellow', count: 5 },
    ],
    objective: {
      type: 'target_score',
      description: 'Achieve 3,500 points',
      targetScore: 3500,
      moveLimit: 22,
    },
    starThresholds: [2200, 3500, 4800],
  },

  // WORLD 4 — ADVANCED (Levels 16 - 18)
  {
    id: 16,
    worldId: 4,
    title: 'Prismatic Convergence',
    subtitle: '5 vibrant colors combined',
    difficulty: 4,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'azure-blue', 'emerald-green', 'sunburst-yellow', 'orchid-magenta'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'orchid-magenta', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '1_-1',
        color: 'azure-blue',
        count: 6,
        layers: [
          { color: 'emerald-green', count: 3 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'emerald-green',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'emerald-green', count: 4 },
        ],
      },
      { cellId: '0_1', color: 'sunburst-yellow', count: 4 },
      {
        cellId: '1_0',
        color: 'orchid-magenta',
        count: 7,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'azure-blue', count: 2 },
          { color: 'orchid-magenta', count: 3 },
        ],
      },
    ],
    incomingPool: [
      {
        color: 'ruby-red',
        count: 5,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      { color: 'azure-blue', count: 5 },
      { color: 'emerald-green', count: 6 },
      { color: 'sunburst-yellow', count: 6 },
      {
        color: 'orchid-magenta',
        count: 5,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'orchid-magenta', count: 3 },
        ],
      },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 3 distinct colour sets',
      targetColors: { 'ruby-red': 1, 'azure-blue': 1, 'orchid-magenta': 1 },
      moveLimit: 24,
    },
    starThresholds: [2500, 4000, 5600],
  },
  {
    id: 17,
    worldId: 4,
    title: 'Precision Clockwork',
    subtitle: 'Tight moves, high reward',
    difficulty: 4,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['ocean-teal', 'tangerine-orange', 'lime-spring', 'royal-purple'],
    startingBoard: [
      {
        cellId: '-1_-1',
        color: 'ocean-teal',
        count: 7,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'lime-spring', count: 2 },
          { color: 'ocean-teal', count: 3 },
        ],
      },
      {
        cellId: '1_-1',
        color: 'tangerine-orange',
        count: 6,
        layers: [
          { color: 'ocean-teal', count: 3 },
          { color: 'tangerine-orange', count: 3 },
        ],
      },
      {
        cellId: '0_0',
        color: 'lime-spring',
        count: 7,
        layers: [
          { color: 'tangerine-orange', count: 2 },
          { color: 'royal-purple', count: 2 },
          { color: 'lime-spring', count: 3 },
        ],
      },
      { cellId: '-1_1', color: 'royal-purple', count: 5 },
    ],
    incomingPool: [
      {
        color: 'ocean-teal',
        count: 5,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'ocean-teal', count: 3 },
        ],
      },
      { color: 'tangerine-orange', count: 5 },
      { color: 'lime-spring', count: 4 },
      { color: 'royal-purple', count: 5 },
    ],
    objective: {
      type: 'limited_moves',
      description: 'Complete 3 stacks in only 16 moves',
      targetColors: { 'ocean-teal': 1, 'tangerine-orange': 1, 'lime-spring': 1 },
      moveLimit: 16,
    },
    starThresholds: [2600, 4200, 5800],
  },
  {
    id: 18,
    worldId: 4,
    title: 'Double Multipliers',
    subtitle: 'Score boosts on golden cells',
    difficulty: 4,
    boardRadius: 2,
    customCells: [
      { id: '0_0', q: 0, r: 0, bonusMultiplier: 2 },
      { id: '1_0', q: 1, r: 0, bonusMultiplier: 2 },
    ],
    stackCapacity: 10,
    availableColors: ['bubblegum-pink', 'cyan-breeze', 'sunburst-yellow', 'ruby-red'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'bubblegum-pink',
        count: 7,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 2 },
          { color: 'bubblegum-pink', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'cyan-breeze',
        count: 6,
        layers: [
          { color: 'bubblegum-pink', count: 3 },
          { color: 'cyan-breeze', count: 3 },
        ],
      },
      { cellId: '-1_0', color: 'sunburst-yellow', count: 4 },
      {
        cellId: '0_1',
        color: 'ruby-red',
        count: 6,
        layers: [
          { color: 'cyan-breeze', count: 2 },
          { color: 'ruby-red', count: 4 },
        ],
      },
    ],
    incomingPool: [
      { color: 'bubblegum-pink', count: 5 },
      { color: 'cyan-breeze', count: 5 },
      { color: 'sunburst-yellow', count: 6 },
      { color: 'ruby-red', count: 5 },
    ],
    objective: {
      type: 'target_score',
      description: 'Score 4,500 points using 2x tiles',
      targetScore: 4500,
      moveLimit: 22,
    },
    starThresholds: [3000, 4500, 6200],
  },

  // WORLD 5 — EXPERT (Levels 19 - 20)
  {
    id: 19,
    worldId: 5,
    title: 'Master Fortress',
    subtitle: 'Obstacles and locked perimeters',
    difficulty: 5,
    boardRadius: 2,
    customCells: [
      { id: '0_0', q: 0, r: 0, isBlocked: true }, // Central obstacle
      { id: '-1_2', q: -1, r: 2, isLocked: true, lockRequirement: { type: 'merges', target: 4, current: 0 } },
    ],
    stackCapacity: 10,
    availableColors: ['ruby-red', 'azure-blue', 'emerald-green', 'sunburst-yellow', 'royal-purple'],
    startingBoard: [
      {
        cellId: '-1_0',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'royal-purple', count: 2 },
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'azure-blue',
        count: 6,
        layers: [
          { color: 'emerald-green', count: 3 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      {
        cellId: '0_-1',
        color: 'emerald-green',
        count: 6,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'emerald-green', count: 4 },
        ],
      },
      { cellId: '0_1', color: 'sunburst-yellow', count: 4 },
      {
        cellId: '1_-1',
        color: 'royal-purple',
        count: 7,
        layers: [
          { color: 'ruby-red', count: 2 },
          { color: 'sunburst-yellow', count: 2 },
          { color: 'royal-purple', count: 3 },
        ],
      },
    ],
    incomingPool: [
      { color: 'ruby-red', count: 4 },
      { color: 'azure-blue', count: 5 },
      { color: 'emerald-green', count: 5 },
      { color: 'sunburst-yellow', count: 6 },
      { color: 'royal-purple', count: 5 },
    ],
    objective: {
      type: 'complete_colors',
      description: 'Complete 3 stacks around the fortress obstacle',
      targetColors: { 'ruby-red': 1, 'azure-blue': 1, 'emerald-green': 1 },
      moveLimit: 26,
    },
    starThresholds: [3200, 5000, 7000],
  },
  {
    id: 20,
    worldId: 5,
    title: 'Hexaflow Grandmaster',
    subtitle: 'The ultimate sorting symphony',
    difficulty: 5,
    boardRadius: 2,
    stackCapacity: 10,
    availableColors: ['ruby-red', 'azure-blue', 'emerald-green', 'sunburst-yellow', 'orchid-magenta'],
    startingBoard: [
      {
        cellId: '0_0',
        color: 'ruby-red',
        count: 7,
        layers: [
          { color: 'orchid-magenta', count: 2 },
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      {
        cellId: '1_0',
        color: 'azure-blue',
        count: 6,
        layers: [
          { color: 'emerald-green', count: 3 },
          { color: 'azure-blue', count: 3 },
        ],
      },
      {
        cellId: '-1_0',
        color: 'emerald-green',
        count: 7,
        layers: [
          { color: 'azure-blue', count: 2 },
          { color: 'ruby-red', count: 2 },
          { color: 'emerald-green', count: 3 },
        ],
      },
      { cellId: '0_1', color: 'sunburst-yellow', count: 4 },
      {
        cellId: '0_-1',
        color: 'orchid-magenta',
        count: 7,
        layers: [
          { color: 'sunburst-yellow', count: 2 },
          { color: 'ruby-red', count: 2 },
          { color: 'orchid-magenta', count: 3 },
        ],
      },
    ],
    incomingPool: [
      {
        color: 'ruby-red',
        count: 5,
        layers: [
          { color: 'orchid-magenta', count: 2 },
          { color: 'ruby-red', count: 3 },
        ],
      },
      { color: 'azure-blue', count: 6 },
      { color: 'emerald-green', count: 5 },
      { color: 'sunburst-yellow', count: 6 },
      { color: 'orchid-magenta', count: 4 },
    ],
    objective: {
      type: 'target_score',
      description: 'Score 6,000 points to claim the Grandmaster crown',
      targetScore: 6000,
      moveLimit: 28,
    },
    starThresholds: [4000, 6000, 8500],
    tips: 'Trigger chain cascades to multiply combos up to 10x!',
  },
];
