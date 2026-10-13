// ==========================================
// Paper Maze - Platform Features & Localization
// ==========================================

// Notification Toast Helper
function showPaperToast(message) {
    let toast = document.getElementById('paperToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'paperToast';
        toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl border border-slate-700 pointer-events-none transition-all duration-300 opacity-0 transform -translate-y-2';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.remove('opacity-0', '-translate-y-2');
    setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
    }, 2500);
}

// 1. Localization / Multi-Language Support
const I18N = {
    en: {
        hand_drawn: "Hand Drawn",
        total_ink: "Total Ink",
        start_drawing: "START DRAWING",
        sketch: "Sketch",
        levels: "Levels",
        shop: "Shop",
        ranking: "Ranking",
        daily_reward_btn: "Daily +10 Ink",
        daily_reward_title: "DAILY INK REWARD",
        daily_reward_sub: "Welcome back! Here is your daily ink ration:",
        claim_btn: "Claim +10 Ink",
        close: "Close",
        profile_title: "PLAYER PROFILE",
        login_btn: "Log In with Platform",
        rate_thank_you: "Thank you for supporting Paper Maze! ⭐⭐⭐⭐⭐",
        bookmark_tip: "Press Ctrl+D (Cmd+D) to bookmark Paper Maze!"
    },
    ru: {
        hand_drawn: "Ручная работа",
        total_ink: "Чернила",
        start_drawing: "НАЧАТЬ",
        sketch: "Рисовать",
        levels: "Уровни",
        shop: "Магазин",
        ranking: "Рейтинг",
        daily_reward_btn: "+10 Чернил",
        daily_reward_title: "ЕЖЕДНЕВНАЯ НАГРАДА",
        daily_reward_sub: "С возвращением! Ваша ежедневная порция чернил:",
        claim_btn: "Забрать +10",
        close: "Закрыть",
        profile_title: "ПРОФИЛЬ ИГРОКА",
        login_btn: "Войти через платформу",
        rate_thank_you: "Спасибо за поддержку Paper Maze! ⭐⭐⭐⭐⭐",
        bookmark_tip: "Нажмите Ctrl+D, чтобы добавить игру в закладки!"
    },
    es: {
        hand_drawn: "Dibujado a mano",
        total_ink: "Tinta",
        start_drawing: "COMENZAR",
        sketch: "Boceto",
        levels: "Niveles",
        shop: "Tienda",
        ranking: "Ranking",
        daily_reward_btn: "+10 Tinta",
        daily_reward_title: "RECOMPENSA DIARIA",
        daily_reward_sub: "¡Bienvenido! Aquí tienes tu ración diaria de tinta:",
        claim_btn: "Reclamar +10",
        close: "Cerrar",
        profile_title: "PERFIL DE JUGADOR",
        login_btn: "Iniciar sesión",
        rate_thank_you: "¡Gracias por calificar Paper Maze! ⭐⭐⭐⭐⭐",
        bookmark_tip: "¡Presiona Ctrl+D para guardar Paper Maze!"
    },
    tr: {
        hand_drawn: "El Çizimi",
        total_ink: "Mürekkep",
        start_drawing: "BAŞLA",
        sketch: "Çizim",
        levels: "Bölümler",
        shop: "Mağaza",
        ranking: "Sıralama",
        daily_reward_btn: "+10 Mürekkep",
        daily_reward_title: "GÜNLÜK ÖDÜL",
        daily_reward_sub: "Tekrar hoş geldin! Günlük mürekkep ödülün:",
        claim_btn: "+10 Al",
        close: "Kapat",
        profile_title: "OYUNCU PROFİLİ",
        login_btn: "Giriş Yap",
        rate_thank_you: "Paper Maze'i desteklediğin için teşekkürler! ⭐⭐⭐⭐⭐",
        bookmark_tip: "Paper Maze'i yer imlerine eklemek için Ctrl+D tuşlayın!"
    },
    de: {
        hand_drawn: "Handgezeichnet",
        total_ink: "Tinte",
        start_drawing: "STARTEN",
        sketch: "Skizze",
        levels: "Level",
        shop: "Shop",
        ranking: "Rangliste",
        daily_reward_btn: "+10 Tinte",
        daily_reward_title: "TÄGLICHE BELOHNUNG",
        daily_reward_sub: "Willkommen zurück! Deine tägliche Tintenration:",
        claim_btn: "+10 Tinte Einlösen",
        close: "Schließen",
        profile_title: "SPIELERPROFIL",
        login_btn: "Mit Plattform anmelden",
        rate_thank_you: "Vielen Dank für deine Bewertung! ⭐⭐⭐⭐⭐",
        bookmark_tip: "Drücke Strg+D, um ein Lesezeichen zu setzen!"
    }
};

const SUPPORTED_LANGS = ['en', 'ru', 'es', 'tr', 'de'];
let activeLang = 'en';

function setGameLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = 'en';
    activeLang = lang;
    document.documentElement.lang = lang;
    const label = document.getElementById('langCodeLabel');
    if (label) label.innerText = lang.toUpperCase();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[lang] && I18N[lang][key]) {
            el.innerText = I18N[lang][key];
        }
    });

    try {
        localStorage.setItem('paper_maze_lang', lang);
    } catch (_) {}
}

function initLocalization() {
    let saved = null;
    try {
        saved = localStorage.getItem('paper_maze_lang');
    } catch (_) {}

    if (saved && SUPPORTED_LANGS.includes(saved)) {
        setGameLanguage(saved);
    } else {
        const raw = (bridgeReady && window.bridge && bridge.platform && bridge.platform.language) 
            ? bridge.platform.language 
            : (navigator.language || 'en');
        const code = typeof raw === 'string' ? raw.substring(0, 2).toLowerCase() : 'en';
        setGameLanguage(SUPPORTED_LANGS.includes(code) ? code : 'en');
    }

    const toggleBtn = document.getElementById('langToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            playClickSound();
            const nextIdx = (SUPPORTED_LANGS.indexOf(activeLang) + 1) % SUPPORTED_LANGS.length;
            setGameLanguage(SUPPORTED_LANGS[nextIdx]);
        });
    }
}

// 2. Player Profile & Avatar (bridge.player)
function updatePlayerProfileUI() {
    const avatarContainer = document.getElementById('playerAvatarImg');
    const nameEl = document.getElementById('playerNameText');
    const modalAvatar = document.getElementById('profileModalAvatar');
    const modalName = document.getElementById('profileModalName');
    const modalStatus = document.getElementById('profileModalStatus');
    const modalLoginBtn = document.getElementById('profileModalLoginBtn');
    const modalScore = document.getElementById('profileModalScore');
    const modalLevels = document.getElementById('profileModalLevels');

    if (modalScore) modalScore.innerText = `${totalInkPoints} pts`;
    if (modalLevels) modalLevels.innerText = `${unlockedLevels} / 1000`;

    let isAuth = false;
    let authSupported = false;
    let playerName = 'Player';
    let photoUrl = null;

    if (bridgeReady && window.bridge && bridge.player) {
        isAuth = Boolean(bridge.player.isAuthorized);
        authSupported = Boolean(bridge.player.isAuthorizationSupported);
        playerName = bridge.player.name || (isAuth ? 'Player' : 'Guest');
        const photos = bridge.player.photos;
        photoUrl = Array.isArray(photos) && photos.length > 0 ? photos[0] : (bridge.player.photo || null);
    }

    if (nameEl) nameEl.innerText = playerName;
    if (modalName) modalName.innerText = playerName;

    if (photoUrl) {
        const imgMarkup = `<img src="${photoUrl}" alt="" class="w-full h-full object-cover rounded-full" />`;
        if (avatarContainer) avatarContainer.innerHTML = imgMarkup;
        if (modalAvatar) modalAvatar.innerHTML = imgMarkup;
    } else {
        if (avatarContainer) avatarContainer.innerHTML = `<i class="fa-solid fa-user"></i>`;
        if (modalAvatar) modalAvatar.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }

    if (modalStatus) {
        modalStatus.innerText = isAuth ? (I18N[activeLang]?.authorized || "Connected") : (I18N[activeLang]?.guest || "Guest Player");
    }

    if (modalLoginBtn) {
        if (!isAuth && authSupported) {
            modalLoginBtn.classList.remove('hidden');
            modalLoginBtn.onclick = async () => {
                playClickSound();
                try {
                    await bridge.player.authorize();
                    updatePlayerProfileUI();
                } catch (err) {
                    console.log('Player authorization cancelled or not completed:', err);
                }
            };
        } else {
            modalLoginBtn.classList.add('hidden');
        }
    }
}

function initPlayerProfileListeners() {
    const profileBtn = document.getElementById('playerProfileBtn');
    const modal = document.getElementById('playerProfileModal');
    const closeBtn = document.getElementById('closeProfileBtn');

    if (profileBtn && modal) {
        profileBtn.addEventListener('click', () => {
            playClickSound();
            updatePlayerProfileUI();
            modal.classList.remove('hidden');
        });
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            playClickSound();
            modal.classList.add('hidden');
        });
    }
}

// 3. Daily Login Reward (strictly 10 ink points)
function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
}

function checkDailyRewardStatus() {
    const today = getTodayDateString();
    const isClaimedToday = (lastDailyRewardDate === today);
    const btn = document.getElementById('dailyRewardBtn');
    const btnText = document.getElementById('dailyRewardBtnText');
    if (btn && btnText) {
        if (isClaimedToday) {
            btn.classList.remove('bg-amber-50', 'border-amber-600', 'text-amber-900');
            btn.classList.add('bg-slate-100', 'border-slate-400', 'text-slate-500');
            btnText.innerText = "Claimed (10 pts) ✓";
        } else {
            btn.classList.add('bg-amber-50', 'border-amber-600', 'text-amber-900');
            btn.classList.remove('bg-slate-100', 'border-slate-400', 'text-slate-500');
            btnText.innerText = I18N[activeLang]?.daily_reward_btn || "Daily +10 Ink";
        }
    }
    return isClaimedToday;
}

function claimDailyReward() {
    const today = getTodayDateString();
    if (lastDailyRewardDate === today) return false;

    totalInkPoints += 10; // Exactly 10 ink points as requested
    lastDailyRewardDate = today;
    updateProgressData();
    submitLeaderboardScore(totalInkPoints);
    playSuccessSound();
    checkDailyRewardStatus();
    return true;
}

function initDailyReward() {
    const modal = document.getElementById('dailyRewardModal');
    const openBtn = document.getElementById('dailyRewardBtn');
    const claimBtn = document.getElementById('claimDailyBtn');
    const claimLabel = document.getElementById('claimDailyBtnLabel');
    const closeBtn = document.getElementById('closeDailyBtn');
    const subText = document.getElementById('dailyRewardSub');

    const isClaimed = checkDailyRewardStatus();

    function refreshModalContent() {
        const claimed = (lastDailyRewardDate === getTodayDateString());
        if (claimed) {
            if (claimBtn) {
                claimBtn.disabled = true;
                claimBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (claimLabel) claimLabel.innerText = "Claimed for today ✓";
            if (subText) subText.innerText = "Already claimed today! Come back tomorrow for +10 ink.";
        } else {
            if (claimBtn) {
                claimBtn.disabled = false;
                claimBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
            if (claimLabel) claimLabel.innerText = I18N[activeLang]?.claim_btn || "Claim +10 Ink";
            if (subText) subText.innerText = I18N[activeLang]?.daily_reward_sub || "Welcome back! Here is your daily ink ration:";
        }
    }

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            playClickSound();
            refreshModalContent();
            modal.classList.remove('hidden');
        });
    }

    if (claimBtn && modal) {
        claimBtn.addEventListener('click', () => {
            if (claimDailyReward()) {
                refreshModalContent();
                showPaperToast("+10 Ink added to your notebook!");
                setTimeout(() => modal.classList.add('hidden'), 1200);
            }
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            playClickSound();
            modal.classList.add('hidden');
        });
    }

    // Pop up daily reward welcome on first visit of the day if unclaimed
    if (!isClaimed) {
        setTimeout(() => {
            if (!gameActive && modal && modal.classList.contains('hidden')) {
                refreshModalContent();
                modal.classList.remove('hidden');
            }
        }, 800);
    }
}

// 4. Rate / Review & Favorites / Shortcut (bridge.social)
function promptRatingIfSupported() {
    if (bridgeReady && window.bridge && bridge.social && bridge.social.isRateSupported) {
        bridge.social.rate().catch(() => {});
    }
}

function initSocialAndRating() {
    const rateBtn = document.getElementById('rateGameBtn');
    const bookmarkBtn = document.getElementById('bookmarkGameBtn');

    if (rateBtn) {
        rateBtn.addEventListener('click', () => {
            playClickSound();
            if (bridgeReady && window.bridge && bridge.social && bridge.social.isRateSupported) {
                bridge.social.rate().catch(() => {});
            } else {
                showPaperToast(I18N[activeLang]?.rate_thank_you || "Thank you for supporting Paper Maze! ⭐⭐⭐⭐⭐");
            }
        });
    }

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            playClickSound();
            if (bridgeReady && window.bridge && bridge.social) {
                if (bridge.social.isAddToFavoritesSupported) {
                    bridge.social.addToFavorites().catch(() => {});
                    return;
                } else if (bridge.social.isAddToHomeScreenSupported) {
                    bridge.social.addToHomeScreen().catch(() => {});
                    return;
                }
            }
            showPaperToast(I18N[activeLang]?.bookmark_tip || "Press Ctrl+D (Cmd+D) to bookmark Paper Maze!");
        });
    }
}
