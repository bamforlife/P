// ==========================================
// Paper Maze - Generator & Level Initialization
// ==========================================

function generateMaze(cols, rows) {
    const grid = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({ r, c, walls: { top: true, right: true, bottom: true, left: true }, visited: false });
        }
        grid.push(row);
    }

    const stack = [];
    let current = grid[0][0];
    current.visited = true;
    let unvisitedCount = cols * rows - 1;

    while (unvisitedCount > 0) {
        const neighbors = [];
        const { r, c } = current;

        if (r > 0 && !grid[r - 1][c].visited) neighbors.push({ cell: grid[r - 1][c], dir: 'top' });
        if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push({ cell: grid[r][c + 1], dir: 'right' });
        if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push({ cell: grid[r + 1][c], dir: 'bottom' });
        if (c > 0 && !grid[r][c - 1].visited) neighbors.push({ cell: grid[r][c - 1], dir: 'left' });

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);

            if (next.dir === 'top') { current.walls.top = false; next.cell.walls.bottom = false; }
            else if (next.dir === 'right') { current.walls.right = false; next.cell.walls.left = false; }
            else if (next.dir === 'bottom') { current.walls.bottom = false; next.cell.walls.top = false; }
            else if (next.dir === 'left') { current.walls.left = false; next.cell.walls.right = false; }

            current = next.cell;
            current.visited = true;
            unvisitedCount--;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
    }
    return grid;
}

function initLevel(lvl) {
    currentLevel = lvl;
    gridCols = Math.min(5 + Math.floor((lvl - 1) / 25), 45);
    gridRows = gridCols;
    cellSize = rectSize / gridCols;

    maze = generateMaze(gridCols, gridRows);
    player.x = cellSize / 2;
    player.y = cellSize / 2;
    player.dx = 0;
    player.dy = 0;
    player.r = Math.max(1.2, cellSize * 0.32);
    player.speed = 2.2;

    exit = { r: gridRows - 1, c: gridCols - 1 };
    trail = [{ x: player.x, y: player.y }];

    timeRemaining = Math.min(300, 45 + Math.floor(gridCols * 4.2));
    gameActive = false;
    motionStarted = false;

    document.getElementById('currentLevelDisplay').innerText = lvl;
    document.getElementById('overlayLevelNum').innerText = lvl;
    document.getElementById('timerDisplay').innerText = timeRemaining.toFixed(1) + "s";
    document.getElementById('timerDisplay').classList.remove('text-rose-600', 'animate-pulse');
    document.getElementById('timerDisplay').classList.add('text-amber-600');
    document.getElementById('startOverlay').classList.remove('hidden');
    document.getElementById('completeModal').classList.add('hidden');
    document.getElementById('controlPromptText').innerText = "TAP DIRECTION TO START MOTION";

    stopTimer();
    hideBannerSafely();
    draw();
}

function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (!gameActive || !motionStarted || platformPaused) return;
        timeRemaining -= 0.1;
        if (timeRemaining <= 0) {
            timeRemaining = 0;
            document.getElementById('timerDisplay').innerText = "0.0s";
            handleGameOver();
        } else {
            document.getElementById('timerDisplay').innerText = timeRemaining.toFixed(1) + "s";
            if (timeRemaining <= 10.0) {
                document.getElementById('timerDisplay').classList.remove('text-amber-600');
                document.getElementById('timerDisplay').classList.add('text-rose-600', 'animate-pulse');
            }
        }
    }, 100);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function setDirection(dx, dy) {
    if (!gameActive) return;
    if (!motionStarted) {
        motionStarted = true;
        document.getElementById('controlPromptText').innerText = "INK IN MOTION...";
        startTimer();
    }
    player.dx = dx;
    player.dy = dy;
    playClickSound();
}

function checkWallCollision(newX, newY) {
    const col = Math.floor(newX / cellSize);
    const row = Math.floor(newY / cellSize);

    if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) return true;

    const cell = maze[row][col];
    const localX = newX - col * cellSize;
    const localY = newY - row * cellSize;
    const buffer = player.r + 1;

    if (cell.walls.top && localY < buffer) return true;
    if (cell.walls.right && localX > cellSize - buffer) return true;
    if (cell.walls.bottom && localY > cellSize - buffer) return true;
    if (cell.walls.left && localX < buffer) return true;

    return false;
}
