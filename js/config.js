// ==========================================
// Paper Maze - Configuration & Game State
// ==========================================

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

const rectSize = 360;
canvas.width = rectSize * window.devicePixelRatio;
canvas.height = rectSize * window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

// Gameplay state
let currentLevel = 1;
const maxLevels = 1000;
let gridCols = 5;
let gridRows = 5;
let cellSize = rectSize / gridCols;

let maze = [];
let player = { x: 0, y: 0, r: 8, dx: 0, dy: 0, speed: 2.2 };
let exit = { r: 0, c: 0 };
let trail = [];
let timeRemaining = 60.0;
let totalScore = 0;
let timerInterval = null;
let gameActive = false;
let motionStarted = false;
let scratchTimer = 0;

// Player progress and inventory state
let unlockedLevels = 1;
let totalInkPoints = 0;
let activeBrushId = 'classic';
let purchasedBrushes = ['classic'];

// Brushes Catalog
const brushes = [
    { id: 'classic', name: 'Classic Blue Ink', price: 0, color: '#3b82f6', strokeType: 'solid', icon: 'fa-pen' },
    { id: 'chinese', name: 'Chinese Calligraphy', price: 200, color: '#0f172a', strokeType: 'chinese', icon: 'fa-brush' },
    { id: 'charcoal', name: 'Charcoal Stick', price: 300, color: '#334155', strokeType: 'charcoal', icon: 'fa-pencil' },
    { id: 'calligraphy', name: 'Calligraphy Nib', price: 400, color: '#1e3a8a', strokeType: 'calligraphy', icon: 'fa-pen-nib' },
    { id: 'glitter', name: 'Glitter Quill', price: 500, color: '#db2777', strokeType: 'glitter', icon: 'fa-wand-magic-sparkles' },
    { id: 'highlighter', name: 'Neon Highlighter', price: 600, color: '#facc15', strokeType: 'highlighter', icon: 'fa-highlighter' },
    { id: 'pencil', name: 'Drafting Pencil', price: 700, color: '#475569', strokeType: 'pencil', icon: 'fa-pencil-alt' },
    { id: 'paint', name: 'Acrylic Paint', price: 800, color: '#059669', strokeType: 'paint', icon: 'fa-paint-brush' },
    { id: 'glow', name: 'Neon Glow', price: 900, color: '#a855f7', strokeType: 'glow', icon: 'fa-lightbulb' },
    { id: 'rainbow', name: 'Rainbow Ink', price: 1000, color: '#ef4444', strokeType: 'rainbow', icon: 'fa-rainbow' },
    { id: 'watercolor', name: 'Watercolor Splash', price: 1100, color: '#0284c7', strokeType: 'watercolor', icon: 'fa-tint' },
    { id: 'gold', name: 'Gold Leaf Foil', price: 1200, color: '#eab308', strokeType: 'gold', icon: 'fa-crown' },
    { id: 'pastel', name: 'Pastel Crayon', price: 1300, color: '#f472b6', strokeType: 'pastel', icon: 'fa-palette' },
    { id: 'stardust', name: 'Star Dust Trail', price: 1400, color: '#38bdf8', strokeType: 'stardust', icon: 'fa-star' },
    { id: 'coffee', name: 'Coffee Stain', price: 1500, color: '#78350f', strokeType: 'coffee', icon: 'fa-mug-hot' },
    { id: 'emerald', name: 'Emerald Sparkle', price: 1600, color: '#10b981', strokeType: 'emerald', icon: 'fa-gem' },
    { id: 'ruby', name: 'Ruby Marker', price: 1700, color: '#e11d48', strokeType: 'ruby', icon: 'fa-heart' },
    { id: 'matrix', name: 'Matrix Code', price: 1800, color: '#22c55e', strokeType: 'matrix', icon: 'fa-terminal' },
    { id: 'sunset', name: 'Sunset Gradient', price: 1900, color: '#f97316', strokeType: 'sunset', icon: 'fa-sun' },
    { id: 'galaxy', name: 'Deep Galaxy', price: 2000, color: '#6366f1', strokeType: 'galaxy', icon: 'fa-moon' },
    { id: 'bubblegum', name: 'Bubblegum Pop', price: 2100, color: '#ec4899', strokeType: 'bubblegum', icon: 'fa-candy-cane' },
    { id: 'vintage', name: 'Vintage Sepia', price: 2200, color: '#b45309', strokeType: 'vintage', icon: 'fa-scroll' }
];

// Playgama Bridge Configuration & Storage Keys
const LEADERBOARD_ID = 'leaderboard1';
let lastSubmittedScore = -1;

const LOCAL_STORAGE_KEY = 'paper_maze_save_v1';
let lastDailyRewardDate = '';
const PROGRESS_KEYS = [
    'paper_unlocked_lvl_1000',
    'paper_total_ink_1000',
    'paper_active_brush_800',
    'paper_purchased_brushes_800',
    'paper_daily_reward_claim'
];

let bridgeReady = false;
let gameLanguage = 'en';
let inMemoryProgress = null;
