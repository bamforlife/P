// ==========================================
// Paper Maze - UI, Navigation & Controls
// ==========================================

function renderLevelRoad() {
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';

    for (let i = 1; i <= maxLevels; i++) {
        const btn = document.createElement('button');
        btn.className = `level-node h-12 flex flex-col items-center justify-center rounded-xl font-extrabold text-sm `;

        if (i <= unlockedLevels) {
            if (i < unlockedLevels) {
                btn.classList.add('completed');
                btn.innerHTML = `<span>${i}</span><i class="fa-solid fa-check text-[10px]"></i>`;
            } else {
                btn.classList.add('unlocked');
                btn.innerHTML = `<span>${i}</span><i class="fa-solid fa-play text-[10px]"></i>`;
            }
            btn.addEventListener('click', () => {
                playClickSound();
                document.getElementById('levelRoadScreen').classList.add('hidden');
                document.getElementById('mainMenuScreen').classList.add('hidden');
                initLevel(i);
            });
        } else {
            btn.classList.add('locked');
            btn.innerHTML = `<span>${i}</span><i class="fa-solid fa-lock text-[10px]"></i>`;
        }
        levelGrid.appendChild(btn);
    }
}

function renderStore() {
    const list = document.getElementById('storeItemsList');
    list.innerHTML = '';

    brushes.forEach(b => {
        const isPurchased = purchasedBrushes.includes(b.id);
        const isActive = activeBrushId === b.id;

        const card = document.createElement('div');
        card.className = "paper-card p-3 flex items-center justify-between bg-white";

        let actionBtn = '';
        if (isActive) {
            actionBtn = `<span class="text-xs font-black text-emerald-600 border border-emerald-600 px-3 py-1 rounded-lg">EQUIPPED</span>`;
        } else if (isPurchased) {
            actionBtn = `<button onclick="equipBrush('${b.id}')" class="px-3 py-1.5 rounded-lg sketch-btn text-xs font-bold uppercase">EQUIP</button>`;
        } else {
            const canAfford = totalInkPoints >= b.price;
            actionBtn = `<button onclick="buyBrush('${b.id}')" class="px-3 py-1.5 rounded-lg ${canAfford ? 'sketch-btn' : 'opacity-50 cursor-not-allowed bg-slate-300 border-slate-400 text-slate-600'} text-xs font-bold uppercase">${b.price} PTS</button>`;
        }

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl border-2 border-slate-800 flex items-center justify-center text-lg" style="color: ${b.color}; background: #f8fafc;">
                    <i class="fa-solid ${b.icon}"></i>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-slate-800">${b.name}</h4>
                    <p class="text-[10px] text-slate-500 uppercase font-semibold">${b.strokeType} trail</p>
                </div>
            </div>
            <div>${actionBtn}</div>
        `;
        list.appendChild(card);
    });
}

window.equipBrush = function(id) {
    playClickSound();
    activeBrushId = id;
    updateProgressData();
    renderStore();
};

window.buyBrush = function(id) {
    const b = brushes.find(x => x.id === id);
    if (!b) return;
    if (totalInkPoints >= b.price && !purchasedBrushes.includes(id)) {
        playSuccessSound();
        totalInkPoints -= b.price;
        purchasedBrushes.push(id);
        activeBrushId = id;
        updateProgressData();
        renderStore();
    } else {
        playTone(150, 'square', 0.1, 0.1);
    }
};

// Main Menu Navigation
document.getElementById('mainPlayBtn').addEventListener('click', () => {
    playClickSound();
    startBGM();
    document.getElementById('mainMenuScreen').classList.add('hidden');
    initLevel(unlockedLevels);
});

document.getElementById('mainLevelRoadBtn').addEventListener('click', () => {
    playClickSound();
    renderLevelRoad();
    document.getElementById('levelRoadScreen').classList.remove('hidden');
});

document.getElementById('roadBackBtn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('levelRoadScreen').classList.add('hidden');
});

document.getElementById('roadPlayCurrentBtn').addEventListener('click', () => {
    playClickSound();
    startBGM();
    document.getElementById('levelRoadScreen').classList.add('hidden');
    document.getElementById('mainMenuScreen').classList.add('hidden');
    initLevel(unlockedLevels);
});

document.getElementById('launchBtn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('startOverlay').classList.add('hidden');
    gameActive = true;
});

document.getElementById('restartLevelBtn').addEventListener('click', () => {
    playClickSound();
    initLevel(currentLevel);
});

document.getElementById('mainStoreBtn').addEventListener('click', () => {
    playClickSound();
    renderStore();
    document.getElementById('storeScreen').classList.remove('hidden');
});

document.getElementById('storeBackBtn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('storeScreen').classList.add('hidden');
    showBannerSafely('bottom', 'main_menu');
});

document.getElementById('leaderboardBackBtn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('leaderboardScreen').classList.add('hidden');
    showBannerSafely('bottom', 'main_menu');
});

document.getElementById('mainLeaderboardBtn').addEventListener('click', openLeaderboard);

document.getElementById('storeRewardAdBtn').addEventListener('click', () => {
    playClickSound();
    showRewardedSafely('store_bonus', () => {
        totalInkPoints += 50;
        updateProgressData();
        submitLeaderboardScore(totalInkPoints);
        renderStore();
    });
});

document.getElementById('rewardAdBonusBtn').addEventListener('click', () => {
    playClickSound();
    showRewardedSafely('store_bonus', () => {
        totalInkPoints += 50;
        updateProgressData();
        submitLeaderboardScore(totalInkPoints);
        document.getElementById('rewardAdBonusBtn').classList.add('hidden');
        document.getElementById('totalScoreVal').innerText = `${parseInt(document.getElementById('totalScoreVal').innerText, 10) + 50 || 150} pts`;
    });
});

document.getElementById('rewardReviveBtn').addEventListener('click', () => {
    playClickSound();
    showRewardedSafely('revive', () => {
        document.getElementById('completeModal').classList.add('hidden');
        timeRemaining = Math.max(timeRemaining, 30.0);
        document.getElementById('timerDisplay').innerText = timeRemaining.toFixed(1) + "s";
        document.getElementById('timerDisplay').classList.remove('text-rose-600', 'animate-pulse');
        document.getElementById('timerDisplay').classList.add('text-amber-600');
        player.dx = 0;
        player.dy = 0;
        gameActive = true;
        motionStarted = false;
        document.getElementById('controlPromptText').innerText = "REVIVED! TAP DIRECTION TO GLIDE";
        startTimer();
        if (soundEnabled && platformAudioEnabled) startBGM();
        hideBannerSafely();
    });
});

document.getElementById('menuHomeBtn').addEventListener('click', () => {
    playClickSound();
    stopTimer();
    gameActive = false;
    updateProgressData();
    document.getElementById('mainMenuScreen').classList.remove('hidden');
    showBannerSafely('bottom', 'main_menu');
});

// D-Pad Controls
document.getElementById('btnUp').addEventListener('click', () => setDirection(0, -1));
document.getElementById('btnDown').addEventListener('click', () => setDirection(0, 1));
document.getElementById('btnLeft').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('btnRight').addEventListener('click', () => setDirection(1, 0));

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') setDirection(0, -1);
    if (e.key === 'ArrowDown' || e.key === 's') setDirection(0, 1);
    if (e.key === 'ArrowLeft' || e.key === 'a') setDirection(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd') setDirection(1, 0);
});

// Touch Swipe Controls
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!gameActive) return;
    let dx = e.changedTouches[0].clientX - touchStartX;
    let dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) setDirection(1, 0);
        else if (dx < -20) setDirection(-1, 0);
    } else {
        if (dy > 20) setDirection(0, 1);
        else if (dy < -20) setDirection(0, -1);
    }
    e.preventDefault();
}, { passive: false });
