// ==========================================
// Paper Maze - Freehand Sketch Drawing Mode
// ==========================================

let freeDrawMode = false;
let freeUserStrokes = [];
let currentStroke = [];
let isDrawingFree = false;
let guidedDot = null;

const freeCanvas = document.getElementById('freeCanvas');
const freeCtx = freeCanvas.getContext('2d');
freeCanvas.width = rectSize * window.devicePixelRatio;
freeCanvas.height = rectSize * window.devicePixelRatio;
freeCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

function openFreeDrawMode() {
    freeDrawMode = true;
    freeUserStrokes = [];
    currentStroke = [];
    document.getElementById('freeDrawScreen').classList.remove('hidden');
    drawFreeCanvas();
}

function drawFreeCanvas() {
    freeCtx.clearRect(0, 0, rectSize, rectSize);

    freeCtx.fillStyle = '#fffef9';
    freeCtx.fillRect(0, 0, rectSize, rectSize);

    freeCtx.strokeStyle = 'rgba(180, 200, 230, 0.3)';
    freeCtx.lineWidth = 1;
    const step = 15;
    for (let x = 0; x <= rectSize; x += step) {
        freeCtx.beginPath(); freeCtx.moveTo(x, 0); freeCtx.lineTo(x, rectSize); freeCtx.stroke();
    }
    for (let y = 0; y <= rectSize; y += step) {
        freeCtx.beginPath(); freeCtx.moveTo(0, y); freeCtx.lineTo(rectSize, y); freeCtx.stroke();
    }

    const activeBrush = brushes.find(b => b.id === activeBrushId) || brushes[0];

    freeUserStrokes.forEach(stroke => {
        if (stroke.length < 2) return;
        freeCtx.save();
        freeCtx.strokeStyle = activeBrush.color;
        freeCtx.lineWidth = 4;
        freeCtx.lineCap = 'round';
        freeCtx.lineJoin = 'round';
        freeCtx.beginPath();
        freeCtx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
            freeCtx.lineTo(stroke[i].x, stroke[i].y);
        }
        freeCtx.stroke();
        freeCtx.restore();
    });

    if (currentStroke.length > 1) {
        freeCtx.save();
        freeCtx.strokeStyle = activeBrush.color;
        freeCtx.lineWidth = 4;
        freeCtx.lineCap = 'round';
        freeCtx.lineJoin = 'round';
        freeCtx.beginPath();
        freeCtx.moveTo(currentStroke[0].x, currentStroke[0].y);
        for (let i = 1; i < currentStroke.length; i++) {
            freeCtx.lineTo(currentStroke[i].x, currentStroke[i].y);
        }
        freeCtx.stroke();
        freeCtx.restore();
    }

    if (guidedDot) {
        freeCtx.save();
        freeCtx.fillStyle = '#ef4444';
        freeCtx.beginPath();
        freeCtx.arc(guidedDot.x, guidedDot.y, 8, 0, Math.PI * 2);
        freeCtx.fill();
        freeCtx.fillStyle = '#ffffff';
        freeCtx.beginPath();
        freeCtx.arc(guidedDot.x - 2, guidedDot.y - 2, 3, 0, Math.PI * 2);
        freeCtx.fill();
        freeCtx.restore();
    }
}

function getCanvasPoint(e, canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    return {
        x: (clientX - rect.left) * (rectSize / rect.width),
        y: (clientY - rect.top) * (rectSize / rect.height)
    };
}

// Mouse event handlers
freeCanvas.addEventListener('mousedown', (e) => {
    isDrawingFree = true;
    const pt = getCanvasPoint(e, freeCanvas);
    currentStroke = [pt];
    guidedDot = null;
});

freeCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawingFree) return;
    const pt = getCanvasPoint(e, freeCanvas);
    currentStroke.push(pt);
    drawFreeCanvas();
    playScratchSound();
});

window.addEventListener('mouseup', () => {
    if (isDrawingFree && currentStroke.length > 1) {
        freeUserStrokes.push(currentStroke);
        currentStroke = [];
        document.getElementById('strokeCountDisplay').innerText = freeUserStrokes.length + " Strokes";
    }
    isDrawingFree = false;
    drawFreeCanvas();
});

// Touch event handlers
freeCanvas.addEventListener('touchstart', (e) => {
    isDrawingFree = true;
    const pt = getCanvasPoint(e, freeCanvas);
    currentStroke = [pt];
    guidedDot = null;
    e.preventDefault();
}, { passive: false });

freeCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawingFree) return;
    const pt = getCanvasPoint(e, freeCanvas);
    currentStroke.push(pt);
    drawFreeCanvas();
    playScratchSound();
    e.preventDefault();
}, { passive: false });

freeCanvas.addEventListener('touchend', (e) => {
    if (isDrawingFree && currentStroke.length > 1) {
        freeUserStrokes.push(currentStroke);
        currentStroke = [];
        document.getElementById('strokeCountDisplay').innerText = freeUserStrokes.length + " Strokes";
    }
    isDrawingFree = false;
    drawFreeCanvas();
    e.preventDefault();
}, { passive: false });

// Free draw controls
document.getElementById('mainFreeDrawBtn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('mainMenuScreen').classList.add('hidden');
    openFreeDrawMode();
});

document.getElementById('freeDrawBackBtn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('freeDrawScreen').classList.add('hidden');
    document.getElementById('mainMenuScreen').classList.remove('hidden');
});

document.getElementById('clearCanvasBtn').addEventListener('click', () => {
    playClickSound();
    freeUserStrokes = [];
    currentStroke = [];
    drawFreeCanvas();
    document.getElementById('strokeCountDisplay').innerText = "0 Strokes";
});

document.getElementById('playOnSketchBtn').addEventListener('click', () => {
    if (freeUserStrokes.length === 0) return;
    playClickSound();
    const fullPath = [];
    freeUserStrokes.forEach(stroke => {
        fullPath.push(...stroke);
    });

    if (fullPath.length < 2) return;

    let pathIndex = 0;
    function animateDot() {
        if (pathIndex < fullPath.length) {
            guidedDot = fullPath[pathIndex];
            pathIndex += Math.max(1, Math.floor(fullPath.length / 150));
            drawFreeCanvas();
            requestAnimationFrame(animateDot);
        } else {
            guidedDot = fullPath[fullPath.length - 1];
            drawFreeCanvas();
        }
    }
    animateDot();
});

document.getElementById('saveSketchGalleryBtn').addEventListener('click', () => {
    playClickSound();
    const dataUrl = freeCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'paper-sketch.png';
    link.href = dataUrl;
    link.click();
});
