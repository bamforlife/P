// ==========================================
// Paper Maze - Achievements System (Playgama Bridge)
// ==========================================

const ACHIEVEMENTS_CONFIG = [
    {
        id: "first_step",
        name: "First Steps",
        description: "Complete your first maze level",
        icon: "fa-shoe-prints"
    },
    {
        id: "maze_runner_5",
        name: "Maze Explorer",
        description: "Reach level 5",
        icon: "fa-compass"
    },
    {
        id: "maze_runner_10",
        name: "Pathfinder",
        description: "Reach level 10",
        icon: "fa-map-location-dot"
    },
    {
        id: "maze_runner_25",
        name: "Labyrinth Master",
        description: "Reach level 25",
        icon: "fa-dungeon"
    },
    {
        id: "maze_runner_50",
        name: "Maze Champion",
        description: "Reach level 50",
        icon: "fa-crown"
    },
    {
        id: "maze_runner_100",
        name: "Centurion",
        description: "Reach level 100",
        icon: "fa-award"
    },
    {
        id: "first_brush",
        name: "Artistic Flair",
        description: "Unlock your first custom brush from the shop",
        icon: "fa-paintbrush"
    },
    {
        id: "brush_collector",
        name: "Brush Collector",
        description: "Unlock 5 different brush styles",
        icon: "fa-palette"
    },
    {
        id: "brush_master",
        name: "Brush Master",
        description: "Unlock 10 different brush styles",
        icon: "fa-wand-magic-sparkles"
    },
    {
        id: "ink_100",
        name: "Ink Apprentice",
        description: "Accumulate 100 total ink points",
        icon: "fa-droplet"
    },
    {
        id: "ink_500",
        name: "Ink Virtuoso",
        description: "Accumulate 500 total ink points",
        icon: "fa-gem"
    },
    {
        id: "ink_1000",
        name: "Ink Legend",
        description: "Accumulate 1,000 total ink points",
        icon: "fa-star"
    },
    {
        id: "first_sketch",
        name: "Doodle Artist",
        description: "Draw a sketch in Free Draw mode",
        icon: "fa-pen-nib"
    },
    {
        id: "daily_devotee",
        name: "Daily Devotee",
        description: "Claim a daily login ink reward",
        icon: "fa-calendar-check"
    }
];

let unlockedAchievements = new Set();

function loadUnlockedAchievements() {
    try {
        const saved = localStorage.getItem('paper_maze_unlocked_achievements');
        if (saved) {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                unlockedAchievements = new Set(arr);
            }
        }
    } catch (_) {}
}

function saveUnlockedAchievements() {
    try {
        localStorage.setItem('paper_maze_unlocked_achievements', JSON.stringify([...unlockedAchievements]));
    } catch (_) {}
}

async function unlockAchievement(id) {
    if (unlockedAchievements.has(id)) return;

    const def = ACHIEVEMENTS_CONFIG.find(a => a.id === id);
    if (!def) return;

    unlockedAchievements.add(id);
    saveUnlockedAchievements();

    // 1. Notify Playgama Bridge Achievements module
    if (bridgeReady && window.bridge && bridge.achievements && typeof bridge.achievements.unlock === 'function') {
        bridge.achievements.unlock(id).catch(err => {
            console.log('Playgama achievement unlock error:', err);
        });
    }

    // 2. Play celebratory sound & in-game notification
    if (typeof playSuccessSound === 'function') {
        playSuccessSound();
    }
    if (typeof showPaperToast === 'function') {
        showPaperToast(`🏆 Achievement Unlocked: ${def.name}!`);
    }
}

// Synchronize platform achievements on startup
async function syncPlatformAchievements() {
    if (!bridgeReady || !window.bridge || !bridge.achievements || typeof bridge.achievements.getAchievements !== 'function') {
        return;
    }
    try {
        const list = await bridge.achievements.getAchievements();
        if (Array.isArray(list)) {
            list.forEach(item => {
                if (item.unlocked && item.id) {
                    unlockedAchievements.add(item.id);
                }
            });
            saveUnlockedAchievements();
        }
    } catch (err) {
        console.log('Syncing platform achievements failed:', err);
    }
}

// Seamless background evaluator checking game progression milestones
function checkGameAchievements() {
    // 1. Level Milestones
    if (typeof unlockedLevels === 'number') {
        if (unlockedLevels >= 2) unlockAchievement('first_step');
        if (unlockedLevels >= 5) unlockAchievement('maze_runner_5');
        if (unlockedLevels >= 10) unlockAchievement('maze_runner_10');
        if (unlockedLevels >= 25) unlockAchievement('maze_runner_25');
        if (unlockedLevels >= 50) unlockAchievement('maze_runner_50');
        if (unlockedLevels >= 100) unlockAchievement('maze_runner_100');
    }

    // 2. Ink Points Milestones
    if (typeof totalInkPoints === 'number') {
        if (totalInkPoints >= 100) unlockAchievement('ink_100');
        if (totalInkPoints >= 500) unlockAchievement('ink_500');
        if (totalInkPoints >= 1000) unlockAchievement('ink_1000');
    }

    // 3. Brush Store Milestones
    if (Array.isArray(purchasedBrushes)) {
        if (purchasedBrushes.length >= 2) unlockAchievement('first_brush');
        if (purchasedBrushes.length >= 5) unlockAchievement('brush_collector');
        if (purchasedBrushes.length >= 10) unlockAchievement('brush_master');
    }

    // 4. Daily Reward Milestone
    if (typeof lastDailyRewardDate === 'string' && lastDailyRewardDate !== null && lastDailyRewardDate.length > 0) {
        unlockAchievement('daily_devotee');
    }

    // 5. Free Sketch Milestone
    if (Array.isArray(freeUserStrokes) && freeUserStrokes.length > 0) {
        unlockAchievement('first_sketch');
    }
}

// Initialize Achievements
function initAchievements() {
    loadUnlockedAchievements();
    syncPlatformAchievements();
    checkGameAchievements();

    // Check periodically as player plays through levels and collects ink
    setInterval(checkGameAchievements, 2000);
}

// Expose globally
window.unlockAchievement = unlockAchievement;
window.checkGameAchievements = checkGameAchievements;
window.ACHIEVEMENTS_CONFIG = ACHIEVEMENTS_CONFIG;

// Bootstrap automatically
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAchievements);
} else {
    initAchievements();
}
