// ==========================================
// Paper Maze - Main Entry Point & Bootstrap
// ==========================================

window.onload = async () => {
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
