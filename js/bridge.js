// ==========================================
// Paper Maze - Playgama Bridge SDK Integration
// ==========================================

// Leaderboard score submission helper
async function submitLeaderboardScore(scoreToSubmit) {
    if (!LEADERBOARD_ID || LEADERBOARD_ID === 'REPLACE_WITH_REAL_LEADERBOARD_ID') {
        console.info('Playgama Leaderboards: Score submission skipped. Configure your leaderboard ID in playgama-bridge-config.json.');
        return;
    }
    if (!bridgeReady || !window.bridge || !bridge.leaderboards || typeof bridge.leaderboards.setScore !== 'function') {
        return;
    }
    const score = Number(scoreToSubmit) || 0;
    if (score === lastSubmittedScore && lastSubmittedScore !== -1) return;

    try {
        await bridge.leaderboards.setScore(LEADERBOARD_ID, score);
        lastSubmittedScore = score;
        console.info(`Playgama Leaderboard: Successfully submitted score ${score} for "${LEADERBOARD_ID}".`);
    } catch (error) {
        console.warn('Playgama Leaderboard: Error submitting score.', error);
    }
}

// Rewarded Ads state management
let isRewardedAdInProgress = false;
let pendingRewardCallback = null;

function initRewardedAdListeners() {
    if (!bridgeReady || !window.bridge || !bridge.advertisement || typeof bridge.advertisement.on !== 'function' || !bridge.EVENT_NAME) return;
    bridge.advertisement.on(bridge.EVENT_NAME.REWARDED_STATE_CHANGED, state => {
        console.log('Playgama Rewarded ad state:', state);
        if (state === 'rewarded') {
            if (typeof pendingRewardCallback === 'function') {
                const cb = pendingRewardCallback;
                pendingRewardCallback = null;
                cb();
            }
        } else if (state === 'closed' || state === 'failed') {
            isRewardedAdInProgress = false;
            pendingRewardCallback = null;
        }
    });
}

function showRewardedSafely(placement = 'store_bonus', onRewarded) {
    if (isRewardedAdInProgress) return;
    if (!bridgeReady || !window.bridge || !bridge.advertisement) {
        console.warn('Playgama Bridge is not initialized. Rewarded ads are unavailable.');
        alert('Rewarded ads require a connected Playgama platform session.');
        return;
    }
    if (!bridge.advertisement.isRewardedSupported || typeof bridge.advertisement.showRewarded !== 'function') {
        console.warn('Playgama Rewarded ads are not supported on this platform.');
        alert('Rewarded ads are not supported on this platform.');
        return;
    }
    try {
        isRewardedAdInProgress = true;
        pendingRewardCallback = onRewarded;
        const result = bridge.advertisement.showRewarded(placement);
        if (result && typeof result.catch === 'function') {
            result.catch(err => {
                console.warn('Rewarded ad request failed.', err);
                isRewardedAdInProgress = false;
                pendingRewardCallback = null;
            });
        }
    } catch (error) {
        console.warn('Rewarded ad invocation error:', error);
        isRewardedAdInProgress = false;
        pendingRewardCallback = null;
    }
}

// Banner Ads safe handling (never displays over active maze gameplay controls)
function showBannerSafely(position = 'bottom', placement = 'main_menu') {
    if (!bridgeReady || !window.bridge || !bridge.advertisement) return;
    if (!bridge.advertisement.isBannerSupported || typeof bridge.advertisement.showBanner !== 'function') return;
    if (gameActive) return; // Preserve active gameplay layout and D-pad controls
    try {
        bridge.advertisement.showBanner(position, placement);
    } catch (err) {
        console.warn('Banner ad request failed:', err);
    }
}

function hideBannerSafely() {
    if (!bridgeReady || !window.bridge || !bridge.advertisement) return;
    if (!bridge.advertisement.isBannerSupported || typeof bridge.advertisement.hideBanner !== 'function') return;
    try {
        bridge.advertisement.hideBanner();
    } catch (err) {
        console.warn('Banner hide failed:', err);
    }
}

// Bridge Initialization
async function initializePlaygamaBridge() {
    if (!window.bridge || typeof window.bridge.initialize !== 'function') {
        console.warn('Playgama Bridge did not load. The game will run in local fallback mode; progress will persist via localStorage.');
        return;
    }
    try {
        await Promise.race([
            window.bridge.initialize({
                configFilePath: './playgama-bridge-config.json?v=' + Date.now()
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Bridge initialization timed out')), 8000))
        ]);
        bridgeReady = true;
        gameLanguage = (bridge.platform && bridge.platform.language) || navigator.language || 'en';
        document.documentElement.lang = gameLanguage;

        if (bridge.platform && typeof bridge.platform.on === 'function' && bridge.EVENT_NAME) {
            bridge.platform.on(bridge.EVENT_NAME.AUDIO_STATE_CHANGED, isEnabled => {
                platformAudioEnabled = Boolean(isEnabled);
                if (!platformAudioEnabled) {
                    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend().catch(() => {});
                    if (typeof pauseAllBgm === 'function') pauseAllBgm();
                } else if (platformAudioEnabled && !platformPaused && soundEnabled) {
                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
                    if (typeof resumeCurrentBgm === 'function') resumeCurrentBgm();
                }
            });
            bridge.platform.on(bridge.EVENT_NAME.PAUSE_STATE_CHANGED, isPaused => {
                platformPaused = Boolean(isPaused);
                if (platformPaused) {
                    stopTimer();
                    stopBGM();
                    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend().catch(() => {});
                } else {
                    if (gameActive && motionStarted) startTimer();
                    if (soundEnabled && platformAudioEnabled) {
                        if (gameActive) startBGM();
                        else if (typeof playMenuBGM === 'function') playMenuBGM();
                    }
                    if (soundEnabled && platformAudioEnabled && audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
                }
            });
            platformAudioEnabled = bridge.platform.isAudioEnabled !== false;
        }

        // Initialize ad event listeners
        if (bridge.advertisement) {
            if (typeof bridge.advertisement.on === 'function' && bridge.EVENT_NAME) {
                bridge.advertisement.on(bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, state => {
                    console.log('Playgama Interstitial ad state:', state);
                });
                initRewardedAdListeners();
            }
        }
    } catch (error) {
        bridgeReady = false;
        console.warn('Playgama Bridge initialization failed; continuing with local storage fallback.', error);
    }
}

async function sendGameReady() {
    if (!bridgeReady || !window.bridge || !bridge.platform || typeof bridge.platform.sendMessage !== 'function') return;
    try {
        await bridge.platform.sendMessage('game_ready');
    } catch (error) {
        console.warn('Playgama game_ready message could not be sent.', error);
    }
}

function showInterstitialSafely(placement = 'level_completed') {
    if (!bridgeReady || !window.bridge || !bridge.advertisement) return;
    try {
        if (bridge.advertisement.isInterstitialSupported && typeof bridge.advertisement.showInterstitial === 'function') {
            const result = bridge.advertisement.showInterstitial(placement);
            if (result && typeof result.catch === 'function') result.catch(error => console.warn('Interstitial request failed.', error));
        }
    } catch (error) {
        console.warn('Interstitial request was unavailable; continuing gameplay.', error);
    }
}

// In-Game Leaderboard Screen Display
async function openLeaderboard() {
    playClickSound();
    const lbScreen = document.getElementById('leaderboardScreen');
    const content = document.getElementById('leaderboardContent');
    const statusText = document.getElementById('leaderboardStatusText');
    const scoreDisplay = document.getElementById('lbScoreDisplay');
    if (scoreDisplay) scoreDisplay.innerText = totalInkPoints + ' pts';

    // Check Bridge Leaderboards Type
    const lbType = (bridgeReady && window.bridge && bridge.leaderboards && bridge.leaderboards.type) 
        ? bridge.leaderboards.type 
        : 'in_game';

    if (lbType === 'native_popup') {
        if (LEADERBOARD_ID && LEADERBOARD_ID !== 'REPLACE_WITH_REAL_LEADERBOARD_ID') {
            try {
                await bridge.leaderboards.showNativePopup(LEADERBOARD_ID);
                return;
            } catch (err) {
                console.warn('Playgama native leaderboard popup error:', err);
            }
        }
    }

    lbScreen.classList.remove('hidden');
    content.innerHTML = `
        <div class="py-8 text-center text-slate-500 font-bold text-sm">
            <i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2 text-blue-600"></i>
            <p>Loading leaderboard entries...</p>
        </div>
    `;

    if (!LEADERBOARD_ID || LEADERBOARD_ID === 'REPLACE_WITH_REAL_LEADERBOARD_ID') {
        content.innerHTML = `
            <div class="paper-card p-4 text-center bg-white space-y-2">
                <div class="w-12 h-12 mx-auto rounded-xl bg-amber-100 border-2 border-amber-600 flex items-center justify-center text-amber-700 text-xl shadow-[2px_2px_0px_#b45309]">
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <h4 class="font-bold text-base text-slate-800 font-['Caveat']">LEADERBOARD SETUP</h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                    Leaderboard ID placeholder is active. In <code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-rose-600">playgama-bridge-config.json</code>, enter your leaderboard ID created in the Playgama Developer Console.
                </p>
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-800 font-bold">
                    Your Current Score: <span class="text-emerald-600">${totalInkPoints} pts</span>
                </div>
            </div>
        `;
        statusText.innerText = "Placeholder detected: REPLACE_WITH_REAL_LEADERBOARD_ID";
        return;
    }

    if (!bridgeReady || !window.bridge || !bridge.leaderboards) {
        content.innerHTML = `
            <div class="paper-card p-4 text-center bg-white space-y-2">
                <i class="fa-solid fa-cloud-arrow-down text-2xl text-slate-400"></i>
                <p class="text-xs text-slate-600">Platform leaderboards are active when running inside a supported platform.</p>
                <div class="bg-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700">
                    Local Ink Score: <span class="text-emerald-600">${totalInkPoints} pts</span>
                </div>
            </div>
        `;
        statusText.innerText = "Standalone browser mode";
        return;
    }

    if (lbType === 'native') {
        content.innerHTML = `
            <div class="paper-card p-4 text-center bg-white space-y-2">
                <i class="fa-solid fa-trophy text-2xl text-amber-500"></i>
                <h4 class="font-bold text-sm text-slate-800">Platform Native Leaderboard</h4>
                <p class="text-xs text-slate-600">Rankings on this platform are shown directly in the host platform's leaderboard overlay.</p>
                <div class="bg-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700">
                    Your Submitted Score: <span class="text-emerald-600">${totalInkPoints} pts</span>
                </div>
            </div>
        `;
        statusText.innerText = "Platform type: native";
        return;
    }

    if (lbType === 'not_available') {
        content.innerHTML = `
            <div class="paper-card p-4 text-center bg-white space-y-2">
                <p class="text-xs text-slate-600">Leaderboards are not supported on this platform.</p>
                <div class="bg-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700">
                    Your Score: <span class="text-emerald-600">${totalInkPoints} pts</span>
                </div>
            </div>
        `;
        statusText.innerText = "Platform type: not_available";
        return;
    }

    if (totalInkPoints > 0) {
        submitLeaderboardScore(totalInkPoints).catch(() => {});
    }

    try {
        const rawEntries = await bridge.leaderboards.getEntries(LEADERBOARD_ID);
        const entries = Array.isArray(rawEntries) 
            ? rawEntries 
            : (rawEntries && Array.isArray(rawEntries.entries) ? rawEntries.entries : []);

        if (!entries || entries.length === 0) {
            content.innerHTML = `
                <div class="paper-card p-4 text-center bg-white space-y-2">
                    <i class="fa-solid fa-ghost text-2xl text-slate-400"></i>
                    <p class="text-xs text-slate-600">No leaderboard entries found yet. Complete levels to set your score!</p>
                    <div class="bg-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700">
                        Your Score: <span class="text-emerald-600">${totalInkPoints} pts</span>
                    </div>
                </div>
            `;
            statusText.innerText = "No entries recorded yet";
            return;
        }

        let html = '';
        entries.forEach((entry, idx) => {
            const rank = entry.rank !== undefined && entry.rank !== null ? entry.rank : (idx + 1);
            const name = entry.name || (entry.player && entry.player.name) || 'Anonymous Player';
            const score = entry.score !== undefined && entry.score !== null ? entry.score : ((entry.player && entry.player.score) !== undefined ? entry.player.score : 0);
            const photo = entry.photo || (entry.player && entry.player.photo) || entry.avatar;
            let rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center">${rank}</span>`;
            if (rank === 1) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-sm">1</span>`;
            else if (rank === 2) rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-sm">2</span>`;
            else if (rank === 3) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-sm">3</span>`;

            const avatar = photo 
                ? `<img src="${photo}" alt="" class="w-8 h-8 rounded-full border border-slate-400 object-cover" />`
                : `<div class="w-8 h-8 rounded-full bg-blue-100 border border-blue-400 flex items-center justify-center text-blue-600 text-xs font-bold"><i class="fa-solid fa-user"></i></div>`;

            html += `
                <div class="paper-card p-2.5 flex items-center justify-between bg-white text-xs">
                    <div class="flex items-center gap-2.5">
                        ${rankBadge}
                        ${avatar}
                        <div>
                            <span class="font-extrabold text-slate-800 text-xs block leading-tight">${name}</span>
                            <span class="text-[10px] text-slate-400 font-semibold">Rank #${rank}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="font-black text-emerald-600 text-sm">${score}</span>
                        <span class="text-[9px] text-slate-400 uppercase font-bold block">pts</span>
                    </div>
                </div>
            `;
        });
        content.innerHTML = html;
        statusText.innerText = `Displaying ${entries.length} entries`;
    } catch (err) {
        console.warn('Playgama getEntries failed:', err);
        content.innerHTML = `
            <div class="paper-card p-4 text-center bg-white space-y-2">
                <i class="fa-solid fa-circle-exclamation text-2xl text-rose-500"></i>
                <p class="text-xs text-slate-600">Could not retrieve entries from platform.</p>
                <div class="bg-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700">
                    Your Local Score: <span class="text-emerald-600">${totalInkPoints} pts</span>
                </div>
            </div>
        `;
        statusText.innerText = "Error retrieving entries";
    }
}
