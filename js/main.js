// ==========================================
// Paper Maze - Main Entry Point & Bootstrap
// ==========================================

function initSplashStudioModal() {
    const splash = document.getElementById('splashStudioModal');
    if (!splash) return;

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        if (typeof playClickSound === 'function') {
            playClickSound();
        }
        splash.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        splash.style.opacity = '0';
        splash.style.transform = 'scale(1.03)';
        splash.style.pointerEvents = 'none';
        setTimeout(() => {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 650);
    };

    // Stays indefinitely until user clicks or taps anywhere
    splash.addEventListener('click', dismiss);
    splash.addEventListener('touchend', (e) => {
        e.preventDefault();
        dismiss();
    }, { passive: false });
}

window.onload = async () => {
    // 0. Launch StableStudio splash modal
    initSplashStudioModal();

    // 1. Initialize Playgama Bridge SDK
    await initializePlaygamaBridge();

    // 2. Load cloud/local saved game progress
    await loadProgressData();
    updateProgressData(false);

    // 3. Initialize level & start game loop
    initLevel(1);
    requestAnimationFrame(update);

    // 4. Send game ready signal to host platform
    await sendGameReady();
    showBannerSafely('bottom', 'main_menu');

    // 5. Initialize platform features & UI listeners
    initLocalization();
    updatePlayerProfileUI();
    initPlayerProfileListeners();
    initDailyReward();
    initSocialAndRating();
};
