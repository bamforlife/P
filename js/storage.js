// ==========================================
// Paper Maze - Storage & Save/Load System
// ==========================================

function applyProgressValues(rawLvl, rawScore, rawBrush, rawPurchased, rawDaily) {
    unlockedLevels = Math.min(1000, Math.max(1, parseInt(rawLvl, 10) || 1));
    totalInkPoints = Math.max(0, parseInt(rawScore, 10) || 0);
    activeBrushId = typeof rawBrush === 'string' && rawBrush ? rawBrush : 'classic';
    try {
        const parsed = typeof rawPurchased === 'string' ? JSON.parse(rawPurchased) : rawPurchased;
        purchasedBrushes = Array.isArray(parsed) && parsed.length ? parsed : ['classic'];
    } catch (_) {
        purchasedBrushes = ['classic'];
    }
    if (!Array.isArray(purchasedBrushes) || !purchasedBrushes.includes('classic')) purchasedBrushes = ['classic'];
    if (!brushes.some(b => b.id === activeBrushId) || !purchasedBrushes.includes(activeBrushId)) activeBrushId = 'classic';
    if (typeof rawDaily === 'string') lastDailyRewardDate = rawDaily;
}

async function loadProgressData() {
    let loadedFromPlatform = false;

    // 1. Attempt Playgama platform storage first
    if (bridgeReady && window.bridge && bridge.storage && typeof bridge.storage.get === 'function') {
        try {
            const values = await bridge.storage.get(PROGRESS_KEYS);
            if (Array.isArray(values) && values.some(v => v !== null && v !== undefined && v !== '')) {
                applyProgressValues(values[0], values[1], values[2], values[3], values[4]);
                loadedFromPlatform = true;
                // Mirror valid platform save to local storage
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
                        version: 1,
                        unlockedLevels,
                        totalInkPoints,
                        activeBrushId,
                        purchasedBrushes,
                        lastDailyRewardDate,
                        savedAt: Date.now()
                    }));
                } catch (_) {}
            }
        } catch (error) {
            console.warn('Playgama platform storage load error; checking local storage fallback.', error);
        }
    }

    // 2. Fallback to localStorage for standalone browser play
    if (!loadedFromPlatform) {
        try {
            const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localRaw) {
                const parsed = JSON.parse(localRaw);
                if (parsed && typeof parsed === 'object') {
                    applyProgressValues(
                        parsed.unlockedLevels,
                        parsed.totalInkPoints,
                        parsed.activeBrushId,
                        parsed.purchasedBrushes,
                        parsed.lastDailyRewardDate
                    );
                }
            }
        } catch (error) {
            console.warn('Local storage fallback read error.', error);
        }
    }

    // Guard defaults
    if (!Array.isArray(purchasedBrushes) || !purchasedBrushes.includes('classic')) purchasedBrushes = ['classic'];
    if (!brushes.some(b => b.id === activeBrushId) || !purchasedBrushes.includes(activeBrushId)) activeBrushId = 'classic';
}

function saveProgressData() {
    const values = [
        String(unlockedLevels),
        String(totalInkPoints),
        String(activeBrushId),
        JSON.stringify(purchasedBrushes),
        String(lastDailyRewardDate || '')
    ];

    // 1. Maintain local-storage fallback so standalone mode always survives reload
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            version: 1,
            unlockedLevels,
            totalInkPoints,
            activeBrushId,
            purchasedBrushes,
            lastDailyRewardDate,
            savedAt: Date.now()
        }));
    } catch (_) {}

    // 2. Persist to Playgama platform storage
    if (bridgeReady && window.bridge && bridge.storage && typeof bridge.storage.set === 'function') {
        bridge.storage.set(PROGRESS_KEYS, values).catch(error => {
            console.warn('Playgama platform progress save failed; local fallback retained.', error);
        });
    }
}

function updateProgressData(persist = true) {
    document.getElementById('mainMenuScore').innerText = totalInkPoints;
    document.getElementById('storeScoreDisplay').innerText = totalInkPoints + " pts";
    document.getElementById('unlockedCount').innerText = unlockedLevels;
    document.getElementById('currentContinueNum').innerText = unlockedLevels;
    if (persist) saveProgressData();
}
