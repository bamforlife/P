// ==========================================
// Paper Maze - Audio Engine (Web Audio API & BGM)
// ==========================================

let audioCtx = null;
let soundEnabled = true;
let bgmInterval = null;
let isBgmPlaying = false;
let platformAudioEnabled = true;
let platformPaused = false;

// Background Audio Tracks (audio/ folder)
let menuBgmAudio = null;
let gameplayBgmAudio = null;
let currentBgmMode = 'menu'; // 'menu' | 'gameplay'

function initBgmTracks() {
    if (!menuBgmAudio) {
        menuBgmAudio = new Audio('audio/main menu (1).wav');
        menuBgmAudio.loop = true;
        menuBgmAudio.volume = 1.0; // 100% volume
        menuBgmAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play().catch(() => {});
        });
    }
    if (!gameplayBgmAudio) {
        gameplayBgmAudio = new Audio('audio/gameplay.wav');
        gameplayBgmAudio.loop = true;
        gameplayBgmAudio.volume = 1.0; // 100% volume
        gameplayBgmAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play().catch(() => {});
        });
    }
}

function playMenuBGM() {
    currentBgmMode = 'menu';
    if (!soundEnabled || !platformAudioEnabled || platformPaused) {
        pauseAllBgm();
        return;
    }
    initBgmTracks();
    if (gameplayBgmAudio) {
        gameplayBgmAudio.pause();
    }
    if (menuBgmAudio) {
        menuBgmAudio.play().catch(() => {});
    }
}

function playGameplayBGM() {
    currentBgmMode = 'gameplay';
    if (!soundEnabled || !platformAudioEnabled || platformPaused) {
        pauseAllBgm();
        return;
    }
    initBgmTracks();
    if (menuBgmAudio) {
        menuBgmAudio.pause();
    }
    if (gameplayBgmAudio) {
        gameplayBgmAudio.play().catch(() => {});
    }
}

function pauseAllBgm() {
    if (menuBgmAudio) menuBgmAudio.pause();
    if (gameplayBgmAudio) gameplayBgmAudio.pause();
}

function resumeCurrentBgm() {
    if (currentBgmMode === 'gameplay') {
        playGameplayBGM();
    } else {
        playMenuBGM();
    }
}

function initAudio() {
    if (!soundEnabled || !platformAudioEnabled || platformPaused) return null;
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    } catch (error) {
        console.warn('Paper Maze audio is unavailable in this browser.', error);
        return null;
    }
}

function playTone(freq, type, duration, gainVal = 0.1) {
    if (!soundEnabled || !initAudio() || !audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
}

function playScratchSound() {
    if (!soundEnabled || !initAudio() || !audioCtx) return;
    try {
        const bufferSize = audioCtx.sampleRate * 0.05;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        whiteNoise.start();
    } catch (_) {}
}

function playClickSound() {
    playTone(440, 'sine', 0.08, 0.08);
}

function playSuccessSound() {
    if (!soundEnabled || !initAudio()) return;
    setTimeout(() => playTone(523.25, 'triangle', 0.15, 0.1), 0);
    setTimeout(() => playTone(659.25, 'triangle', 0.15, 0.1), 120);
    setTimeout(() => playTone(783.99, 'triangle', 0.3, 0.12), 240);
}

function startBGM() {
    // Play gameplay background track in loop
    playGameplayBGM();

    if (isBgmPlaying || !soundEnabled || !platformAudioEnabled || platformPaused) return;
    isBgmPlaying = true;
    const chords = [
        [261.63, 329.63, 392.00],
        [220.00, 261.63, 329.63],
        [174.61, 220.00, 261.63],
        [196.00, 246.94, 293.66]
    ];
    let chordIdx = 0;
    bgmInterval = setInterval(() => {
        if (!soundEnabled || !isBgmPlaying || !platformAudioEnabled || platformPaused) return;
        if (!initAudio()) return;
        const chord = chords[chordIdx];
        chord.forEach((freq, idx) => {
            setTimeout(() => {
                playTone(freq, 'sine', 1.8, 0.02);
            }, idx * 400);
        });
        chordIdx = (chordIdx + 1) % chords.length;
    }, 3000);
}

function stopBGM() {
    isBgmPlaying = false;
    if (bgmInterval) clearInterval(bgmInterval);
    pauseAllBgm();
}

// Sound toggle UI binding
document.getElementById('soundToggleBtn').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');
    if (soundEnabled) {
        icon.className = "fa-solid fa-volume-high text-sm";
        if (typeof gameActive !== 'undefined' && gameActive) {
            startBGM();
        } else {
            playMenuBGM();
        }
        playClickSound();
    } else {
        icon.className = "fa-solid fa-volume-xmark text-sm";
        stopBGM();
    }
});

// Autoplay unlock helper on first user gesture
function unlockAudioOnFirstGesture() {
    initAudio();
    if (soundEnabled && platformAudioEnabled && !platformPaused) {
        if (typeof gameActive !== 'undefined' && gameActive) {
            playGameplayBGM();
        } else {
            playMenuBGM();
        }
    }
    window.removeEventListener('click', unlockAudioOnFirstGesture);
    window.removeEventListener('keydown', unlockAudioOnFirstGesture);
    window.removeEventListener('touchstart', unlockAudioOnFirstGesture);
}
window.addEventListener('click', unlockAudioOnFirstGesture, { once: true });
window.addEventListener('keydown', unlockAudioOnFirstGesture, { once: true });
window.addEventListener('touchstart', unlockAudioOnFirstGesture, { once: true });

// Expose globally
window.playMenuBGM = playMenuBGM;
window.playGameplayBGM = playGameplayBGM;
window.pauseAllBgm = pauseAllBgm;
window.resumeCurrentBgm = resumeCurrentBgm;
