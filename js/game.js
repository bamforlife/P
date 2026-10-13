// ==========================================
// Paper Maze - Game Loop, Physics & Rendering
// ==========================================

function update() {
    if (!platformPaused && gameActive && motionStarted && (player.dx !== 0 || player.dy !== 0)) {
        const nextX = player.x + player.dx * player.speed;
        const nextY = player.y + player.dy * player.speed;

        if (checkWallCollision(nextX, nextY)) {
            player.dx = 0;
            player.dy = 0;
            handleWallHit();
        } else {
            player.x = nextX;
            player.y = nextY;
            trail.push({ x: player.x, y: player.y });

            scratchTimer++;
            if (scratchTimer % 4 === 0) {
                playScratchSound();
            }
        }

        const currentCol = Math.floor(player.x / cellSize);
        const currentRow = Math.floor(player.y / cellSize);
        if (currentCol === exit.c && currentRow === exit.r) {
            const exitCenterX = exit.c * cellSize + cellSize / 2;
            const exitCenterY = exit.r * cellSize + cellSize / 2;
            const dist = Math.hypot(player.x - exitCenterX, player.y - exitCenterY);
            if (dist < cellSize * 0.35) {
                handleLevelComplete();
            }
        }
    }

    if (!freeDrawMode) {
        draw();
    }
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, rectSize, rectSize);

    ctx.fillStyle = '#fffef9';
    ctx.fillRect(0, 0, rectSize, rectSize);

    ctx.strokeStyle = 'rgba(180, 200, 230, 0.3)';
    ctx.lineWidth = 1;
    const gridStep = rectSize / 20;
    for (let x = 0; x <= rectSize; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rectSize); ctx.stroke();
    }
    for (let y = 0; y <= rectSize; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rectSize, y); ctx.stroke();
    }

    const exitX = exit.c * cellSize + cellSize / 2;
    const exitY = exit.r * cellSize + cellSize / 2;
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(exitX, exitY, player.r * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
    ctx.restore();

    const activeBrush = brushes.find(b => b.id === activeBrushId) || brushes[0];

    if (trail.length > 1) {
        ctx.save();
        ctx.lineWidth = player.r * 1.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (activeBrush.strokeType === 'glow') {
            ctx.shadowColor = activeBrush.color;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = activeBrush.color;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else if (activeBrush.strokeType === 'chinese') {
            for (let i = 1; i < trail.length; i++) {
                const p1 = trail[i - 1];
                const p2 = trail[i];
                const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineWidth = Math.max(2, player.r * 2 - dist * 0.15);
                ctx.strokeStyle = activeBrush.color;
                ctx.globalAlpha = 0.85;
                ctx.stroke();
            }
        } else if (activeBrush.strokeType === 'charcoal') {
            ctx.strokeStyle = activeBrush.color;
            ctx.lineWidth = player.r * 1.2;
            ctx.setLineDash([2, 4, 1, 3]);
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else if (activeBrush.strokeType === 'calligraphy') {
            ctx.strokeStyle = activeBrush.color;
            for (let i = 1; i < trail.length; i++) {
                const p1 = trail[i - 1];
                const p2 = trail[i];
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                ctx.lineWidth = Math.abs(Math.sin(angle)) * player.r * 2.2 + 2;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        } else if (activeBrush.strokeType === 'glitter' || activeBrush.strokeType === 'stardust') {
            ctx.strokeStyle = activeBrush.color;
            ctx.lineWidth = player.r * 1.2;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();

            ctx.fillStyle = activeBrush.strokeType === 'stardust' ? '#ffffff' : '#fef08a';
            for (let i = 0; i < trail.length; i += 3) {
                ctx.beginPath();
                ctx.arc(trail[i].x + (Math.sin(i) * 3), trail[i].y + (Math.cos(i) * 3), 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (activeBrush.strokeType === 'highlighter') {
            ctx.strokeStyle = activeBrush.color;
            ctx.lineWidth = player.r * 2.5;
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else if (activeBrush.strokeType === 'pencil') {
            ctx.strokeStyle = activeBrush.color;
            ctx.lineWidth = player.r * 0.9;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else if (activeBrush.strokeType === 'watercolor') {
            ctx.strokeStyle = activeBrush.color;
            ctx.lineWidth = player.r * 2.8;
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else if (activeBrush.strokeType === 'gold') {
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = player.r * 1.6;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else if (activeBrush.strokeType === 'rainbow' || activeBrush.strokeType === 'sunset' || activeBrush.strokeType === 'galaxy') {
            const grad = ctx.createLinearGradient(0, 0, rectSize, rectSize);
            if (activeBrush.strokeType === 'rainbow') {
                grad.addColorStop(0, '#ef4444'); grad.addColorStop(0.3, '#eab308'); grad.addColorStop(0.6, '#10b981'); grad.addColorStop(1, '#3b82f6');
            } else if (activeBrush.strokeType === 'sunset') {
                grad.addColorStop(0, '#f43f5e'); grad.addColorStop(0.5, '#f97316'); grad.addColorStop(1, '#eab308');
            } else {
                grad.addColorStop(0, '#3b82f6'); grad.addColorStop(0.5, '#6366f1'); grad.addColorStop(1, '#a855f7');
            }
            ctx.strokeStyle = grad;
            ctx.lineWidth = player.r * 1.4;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        } else {
            ctx.strokeStyle = activeBrush.color;
            ctx.lineWidth = player.r * 1.3;
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const cell = maze[r][c];
            const x = c * cellSize;
            const y = r * cellSize;

            if (cell.walls.top) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke();
            }
            if (cell.walls.right) {
                ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke();
            }
            if (cell.walls.bottom) {
                ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke();
            }
            if (cell.walls.left) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke();
            }
        }
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = activeBrush.strokeType === 'solid' ? '#2563eb' : activeBrush.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x - player.r * 0.3, player.y - player.r * 0.3, player.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function handleLevelComplete() {
    stopTimer();
    gameActive = false;
    playSuccessSound();

    const earnedScore = 100;
    totalInkPoints += earnedScore;
    if (currentLevel >= unlockedLevels && unlockedLevels < maxLevels) {
        unlockedLevels = currentLevel + 1;
    }
    updateProgressData();
    submitLeaderboardScore(totalInkPoints);

    document.getElementById('timeBonusVal').innerText = `+0 pts`;
    document.getElementById('levelBonusVal').innerText = `+100 pts`;
    document.getElementById('totalScoreVal').innerText = `${earnedScore} pts`;

    document.getElementById('modalIcon').className = "w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-700 flex items-center justify-center text-emerald-600 text-3xl mb-2 shadow-[3px_3px_0px_#065f46]";
    document.getElementById('modalIcon').innerHTML = `<i class="fa-solid fa-award"></i>`;
    document.getElementById('modalTitle').innerText = "LEVEL CLEARED!";
    document.getElementById('modalSubtitle').innerText = "Excellent paper navigation!";

    // Rewarded ad bonus button shown; Revive button hidden
    const bonusBtn = document.getElementById('rewardAdBonusBtn');
    const reviveBtn = document.getElementById('rewardReviveBtn');
    if (bonusBtn) {
        bonusBtn.classList.remove('hidden');
        bonusBtn.disabled = false;
    }
    if (reviveBtn) reviveBtn.classList.add('hidden');

    // Direct to next level on success
    const nextBtn = document.getElementById('nextLevelBtn');
    nextBtn.innerHTML = currentLevel < maxLevels ? `Next Level <i class="fa-solid fa-arrow-right"></i>` : `Replay Game <i class="fa-solid fa-rotate-right"></i>`;
    nextBtn.onclick = () => {
        playClickSound();
        if (currentLevel < maxLevels) {
            initLevel(currentLevel + 1);
        } else {
            initLevel(1);
        }
    };

    document.getElementById('completeModal').classList.remove('hidden');
    if (currentLevel === 5) {
        promptRatingIfSupported();
    }
    showInterstitialSafely('level_completed');
}

function handleGameOver() {
    stopTimer();
    gameActive = false;
    playTone(200, 'sawtooth', 0.4, 0.15);
    submitLeaderboardScore(totalInkPoints);

    document.getElementById('timeBonusVal').innerText = `+0 pts`;
    document.getElementById('levelBonusVal').innerText = `+0 pts`;
    document.getElementById('totalScoreVal').innerText = `0 pts`;

    document.getElementById('modalIcon').className = "w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-700 flex items-center justify-center text-rose-600 text-3xl mb-2 shadow-[3px_3px_0px_#9f1239]";
    document.getElementById('modalIcon').innerHTML = `<i class="fa-solid fa-hourglass-end"></i>`;
    document.getElementById('modalTitle').innerText = "TIME'S UP!";
    document.getElementById('modalSubtitle').innerText = "Out of ink time! Try again or revive.";

    // Revive button shown; Bonus button hidden
    const bonusBtn = document.getElementById('rewardAdBonusBtn');
    const reviveBtn = document.getElementById('rewardReviveBtn');
    if (bonusBtn) bonusBtn.classList.add('hidden');
    if (reviveBtn) {
        reviveBtn.classList.remove('hidden');
        reviveBtn.disabled = false;
    }

    // Retry same level on timeout
    const nextBtn = document.getElementById('nextLevelBtn');
    nextBtn.innerHTML = `Retry Level <i class="fa-solid fa-rotate-right"></i>`;
    nextBtn.onclick = () => {
        playClickSound();
        initLevel(currentLevel);
    };

    document.getElementById('completeModal').classList.remove('hidden');
    showInterstitialSafely('game_over');
}

function handleWallHit() {
    stopTimer();
    gameActive = false;
    playTone(140, 'sawtooth', 0.4, 0.18);
    submitLeaderboardScore(totalInkPoints);

    document.getElementById('timeBonusVal').innerText = `+0 pts`;
    document.getElementById('levelBonusVal').innerText = `+0 pts`;
    document.getElementById('totalScoreVal').innerText = `0 pts`;

    document.getElementById('modalIcon').className = "w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-700 flex items-center justify-center text-rose-600 text-3xl mb-2 shadow-[3px_3px_0px_#9f1239]";
    document.getElementById('modalIcon').innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`;
    document.getElementById('modalTitle').innerText = "WALL HIT!";
    document.getElementById('modalSubtitle').innerText = "You smudged the paper wall! Try again or revive.";

    // Revive button shown; Bonus button hidden
    const bonusBtn = document.getElementById('rewardAdBonusBtn');
    const reviveBtn = document.getElementById('rewardReviveBtn');
    if (bonusBtn) bonusBtn.classList.add('hidden');
    if (reviveBtn) {
        reviveBtn.classList.remove('hidden');
        reviveBtn.disabled = false;
    }

    // Retry same level on wall hit
    const nextBtn = document.getElementById('nextLevelBtn');
    nextBtn.innerHTML = `Retry Level <i class="fa-solid fa-rotate-right"></i>`;
    nextBtn.onclick = () => {
        playClickSound();
        initLevel(currentLevel);
    };

    document.getElementById('completeModal').classList.remove('hidden');
    showInterstitialSafely('game_over');
}
