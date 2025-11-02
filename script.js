// OpenTyping Pro - 전문 타자 연습 플랫폼 JavaScript
// 전역 변수 및 상수
const APP_CONFIG = {
    version: '2.0.0',
    name: 'OpenTyping Pro',
    apiEndpoint: '/api',
    wsEndpoint: 'wss://localhost:8080',
    maxWPM: 300,
    maxAccuracy: 100,
    levels: {
        beginner: { minWPM: 0, maxWPM: 30, name: '초급' },
        intermediate: { minWPM: 30, maxWPM: 60, name: '중급' },
        advanced: { minWPM: 60, maxWPM: 100, name: '고급' },
        master: { minWPM: 100, maxWPM: 300, name: '마스터' }
    }
};

// 애플리케이션 상태
const AppState = {
    currentUser: {
        id: 'user_' + Date.now(),
        username: '사용자',
        level: 15,
        totalScore: 2450,
        stats: {
            avgWPM: 85,
            maxWPM: 120,
            avgAccuracy: 96.5,
            totalTime: 750, // 분 단위
            practiceStreak: 7
        },
        achievements: [],
        settings: {
            soundEnabled: true,
            errorSoundEnabled: true,
            theme: 'light',
            textSize: 'medium',
            keyboardLayout: 'qwerty'
        }
    },
    currentSession: {
        level: null,
        category: null,
        text: '',
        currentIndex: 0,
        startTime: null,
        endTime: null,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
        score: 0,
        isPaused: false,
        timerInterval: null,
        wpmHistory: [],
        accuracyHistory: []
    },
    tournaments: [],
    events: [],
    notifications: []
};

// 확장된 타자 연습 텍스트 데이터
const PRACTICE_TEXTS = {
    basic: [
        'a s d f j k l',
        'f j d k s l a',
        'ask fall salad salad',
        'lad asks sad falls',
        'a lad asks a dad',
        'a sad dad falls',
        'all dads ask lads',
        'sad falls ask all'
    ],
    speed: [
        'the quick brown fox jumps over the lazy dog',
        'pack my box with five dozen liquor jugs',
        'the five boxing wizards jump quickly',
        'sphinx of black quartz judge my vow',
        'how vexingly quick daft zebras jump',
        'two driven jocks help fax my big quiz',
        'five quacking zephyrs jolt my wax bed',
        'the jay, pig, fox, zebra and my wolves quack'
    ],
    accuracy: [
        'Practice makes perfect when typing accurately',
        'Slow and steady wins the race in typing',
        'Focus on accuracy first, then speed will follow',
        'Every mistake is a learning opportunity',
        'Consistent practice builds muscle memory',
        'Take breaks to maintain focus and accuracy',
        'Proper posture prevents typing injuries',
        'Relaxed hands type better than tense ones'
    ],
    numbers: [
        '123 456 789 0',
        '987 654 321 0',
        '2024 is the current year',
        'Phone: 010-1234-5678',
        'Price: $99.99',
        'Temperature: 23.5°C',
        'Time: 14:30:45',
        'Date: 2024-12-25'
    ],
    symbols: [
        '!@#$%^&*()',
        '{}[]|\\:;\"\'<>?,./',
        'JavaScript uses { } for blocks',
        'Python uses : and indentation',
        'HTML uses < > for tags',
        'CSS uses { } for styles',
        'Math: 2 + 2 = 4, 3 * 3 = 9',
        'URL: https://example.com/page?param=value'
    ],
    programming: [
        'function calculateSum(a, b) { return a + b; }',
        'const array = [1, 2, 3, 4, 5];',
        'if (condition) { doSomething(); }',
        'for (let i = 0; i < 10; i++) { console.log(i); }',
        'class Person { constructor(name) { this.name = name; } }',
        'import React from \'react\';',
        'const result = await fetchData();',
        'try { riskyOperation(); } catch (error) { handleError(error); }'
    ]
};

// 사운드 관리
class SoundManager {
    constructor() {
        this.sounds = {
            correct: new Howl({ src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Gy+3fjEoKHm7A7+OZURE'], volume: 0.5 }),
            error: new Howl({ src: ['data:audio/wav;base64,UklGRhwFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUwFAACAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA//uQAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA//uQAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'], volume: 0.7 }),
            complete: new Howl({ src: ['data:audio/wav;base64,UklGRhYFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXIFAACAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA//uQAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA//uQAAA//uQAAAAA//uQAAA//uQAAA//uQAAAAA'], volume: 0.8 }),
            keyPress: new Howl({ src: ['data:audio/wav;base64,UklGRjYFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTQFAACAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA//uQAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA//uQAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAA'], volume: 0.3 })
        };
        this.enabled = true;
    }

    play(soundName) {
        if (this.enabled && this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// 가상 키보드 생성기
class VirtualKeyboard {
    constructor() {
        this.layout = {
            row1: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
            row2: ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
            row3: ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
            row4: ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
            row5: ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
        };
        this.fingerMapping = {
            'q': 'left-pinky', 'w': 'left-ring', 'e': 'left-middle', 'r': 'left-index',
            't': 'left-index', 'y': 'right-index', 'u': 'right-index', 'i': 'right-middle',
            'o': 'right-ring', 'p': 'right-pinky',
            'a': 'left-pinky', 's': 'left-ring', 'd': 'left-middle', 'f': 'left-index',
            'g': 'left-index', 'h': 'right-index', 'j': 'right-index', 'k': 'right-middle',
            'l': 'right-ring', ';': 'right-pinky',
            'z': 'left-pinky', 'x': 'left-ring', 'c': 'left-middle', 'v': 'left-index',
            'b': 'left-index', 'n': 'right-index', 'm': 'right-index'
        };
    }

    render() {
        const container = document.getElementById('virtualKeyboard');
        if (!container) return;

        let html = '';
        Object.values(this.layout).forEach((row, rowIndex) => {
            html += '<div class="flex justify-center space-x-1 mb-1">';
            row.forEach(key => {
                const keyClass = this.getKeyClass(key);
                const fingerClass = this.fingerMapping[key.toLowerCase()] || '';
                html += `<button class="keyboard-key ${keyClass} ${fingerClass}" data-key="${key}" onclick="virtualKeyboard.handleKeyPress('${key}')">${this.formatKeyLabel(key)}</button>`;
            });
            html += '</div>';
        });

        container.innerHTML = html;
        this.setupEventListeners();
    }

    getKeyClass(key) {
        if (key === 'Space') return 'px-32 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg keyboard-key';
        if (key === 'Backspace' || key === 'Tab' || key === 'CapsLock' || key === 'Enter') return 'px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg keyboard-key text-sm font-medium';
        if (key === 'Shift' || key === 'Ctrl' || key === 'Alt') return 'px-8 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg keyboard-key text-sm font-medium';
        return 'px-3 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg keyboard-key font-mono text-sm';
    }

    formatKeyLabel(key) {
        if (key === 'Space') return 'Space';
        if (key === 'Backspace') return '← Backspace';
        if (key === 'CapsLock') return 'Caps Lock';
        if (key === 'Tab') return 'Tab';
        return key.toUpperCase();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const key = this.normalizeKey(e.key);
            const button = document.querySelector(`[data-key="${key}"]`);
            if (button) {
                button.classList.add('active');
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = this.normalizeKey(e.key);
            const button = document.querySelector(`[data-key="${key}"]`);
            if (button) {
                button.classList.remove('active');
            }
        });
    }

    normalizeKey(key) {
        const keyMap = {
            ' ': 'Space',
            'Backspace': 'Backspace',
            'Tab': 'Tab',
            'CapsLock': 'CapsLock',
            'Enter': 'Enter',
            'Shift': 'Shift',
            'Control': 'Ctrl',
            'Alt': 'Alt'
        };
        return keyMap[key] || key.toLowerCase();
    }

    handleKeyPress(key) {
        if (AppState.currentSession.isPaused) return;

        const input = document.getElementById('practiceInput');
        if (input && !input.disabled) {
            if (key === 'Backspace') {
                input.value = input.value.slice(0, -1);
            } else if (key === 'Space') {
                input.value += ' ';
            } else if (key.length === 1) {
                input.value += key;
            }
            input.dispatchEvent(new Event('input'));
        }
    }

    highlightFinger(finger) {
        document.querySelectorAll('.keyboard-key').forEach(key => {
            key.classList.remove('finger-highlight');
        });

        document.querySelectorAll(`.${finger}`).forEach(key => {
            key.classList.add('finger-highlight');
        });
    }
}

// 타자 연습 엔진
class TypingEngine {
    constructor() {
        this.soundManager = new SoundManager();
        this.virtualKeyboard = new VirtualKeyboard();
        this.currentText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.errors = 0;
        this.correctChars = 0;
    }

    initializeSession(category, level) {
        const texts = PRACTICE_TEXTS[category] || PRACTICE_TEXTS.basic;
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        this.currentIndex = 0;
        this.startTime = null;
        this.errors = 0;
        this.correctChars = 0;

        AppState.currentSession = {
            ...AppState.currentSession,
            category,
            level,
            text: this.currentText,
            currentIndex: 0,
            startTime: null,
            correctChars: 0,
            incorrectChars: 0,
            totalChars: this.currentText.length,
            score: 0,
            isPaused: false
        };

        this.updateDisplay();
        this.virtualKeyboard.render();
    }

    startSession() {
        AppState.currentSession.startTime = Date.now();
        AppState.currentSession.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 100);

        const input = document.getElementById('practiceInput');
        input.disabled = false;
        input.focus();

        document.getElementById('startPracticeBtn').classList.add('hidden');
        document.getElementById('pausePracticeBtn').classList.remove('hidden');
    }

    pauseSession() {
        AppState.currentSession.isPaused = !AppState.currentSession.isPaused;

        if (AppState.currentSession.isPaused) {
            clearInterval(AppState.currentSession.timerInterval);
            document.getElementById('practiceInput').disabled = true;
            document.getElementById('pausePracticeBtn').innerHTML = '<i class="fas fa-play mr-2"></i>계속하기';
        } else {
            AppState.currentSession.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 100);
            document.getElementById('practiceInput').disabled = false;
            document.getElementById('practiceInput').focus();
            document.getElementById('pausePracticeBtn').innerHTML = '<i class="fas fa-pause mr-2"></i>일시정지';
        }
    }

    handleInput(input) {
        if (AppState.currentSession.isPaused || !AppState.currentSession.startTime) return;

        const currentChar = this.currentText[this.currentIndex];
        const typedChar = input[input.length - 1];

        if (typedChar === currentChar) {
            this.correctChars++;
            this.currentIndex++;
            this.soundManager.play('correct');
            this.highlightKey(typedChar);
        } else if (typedChar) {
            this.errors++;
            this.soundManager.play('error');
            this.shakeElement(input);
        }

        input.value = '';
        this.updateDisplay();
        this.updateStats();

        if (this.currentIndex >= this.currentText.length) {
            this.completeSession();
        }
    }

    updateDisplay() {
        const display = document.getElementById('practiceText');
        if (!display) return;

        let html = '';
        for (let i = 0; i < this.currentText.length; i++) {
            if (i < this.currentIndex) {
                html += `<span class="correct-char">${this.currentText[i]}</span>`;
            } else if (i === this.currentIndex) {
                html += `<span class="current-char">${this.currentText[i]}</span>`;
            } else {
                html += `<span>${this.currentText[i]}</span>`;
            }
        }
        display.innerHTML = html;

        // 현재 문자에 해당하는 손가락 강조
        if (this.currentIndex < this.currentText.length) {
            const currentChar = this.currentText[this.currentIndex].toLowerCase();
            const finger = this.virtualKeyboard.fingerMapping[currentChar];
            if (finger) {
                this.virtualKeyboard.highlightFinger(finger);
            }
        }
    }

    updateStats() {
        if (!AppState.currentSession.startTime) return;

        const elapsed = (Date.now() - AppState.currentSession.startTime) / 1000 / 60;
        const wpm = elapsed > 0 ? Math.round((this.correctChars / 5) / elapsed) : 0;
        const accuracy = this.correctChars + this.errors > 0 ?
            Math.round((this.correctChars / (this.correctChars + this.errors)) * 100) : 100;

        AppState.currentSession.correctChars = this.correctChars;
        AppState.currentSession.incorrectChars = this.errors;
        AppState.currentSession.score = this.calculateScore(wpm, accuracy);

        // UI 업데이트
        document.getElementById('currentWPM').textContent = wpm;
        document.getElementById('currentAccuracy').textContent = accuracy + '%';
        document.getElementById('currentScore').textContent = AppState.currentSession.score;

        // 진행률 업데이트
        const progress = (this.currentIndex / this.currentText.length) * 100;
        document.getElementById('practiceProgress').textContent = Math.round(progress) + '%';
        document.getElementById('practiceProgressBar').style.width = progress + '%';
    }

    updateTimer() {
        if (!AppState.currentSession.startTime) return;

        const elapsed = Date.now() - AppState.currentSession.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        document.getElementById('currentTime').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    calculateScore(wpm, accuracy) {
        const baseScore = 10;
        const speedBonus = Math.min(wpm, 100);
        const accuracyMultiplier = accuracy / 100;
        const levelMultiplier = this.getLevelMultiplier();

        return Math.round(baseScore * speedBonus * accuracyMultiplier * levelMultiplier);
    }

    getLevelMultiplier() {
        const multipliers = {
            basic: 1,
            speed: 1.5,
            accuracy: 1.3,
            numbers: 1.2,
            symbols: 1.4,
            programming: 2.0
        };
        return multipliers[AppState.currentSession.category] || 1;
    }

    completeSession() {
        clearInterval(AppState.currentSession.timerInterval);

        const elapsed = (Date.now() - AppState.currentSession.startTime) / 1000 / 60;
        const wpm = Math.round((this.correctChars / 5) / elapsed);
        const accuracy = Math.round((this.correctChars / (this.correctChars + this.errors)) * 100);

        // 세션 데이터 저장
        this.saveSessionStats({
            category: AppState.currentSession.category,
            wpm: wpm,
            accuracy: accuracy,
            time: elapsed,
            score: AppState.currentSession.score,
            date: new Date().toISOString()
        });

        // 성공 모달 표시
        this.showSuccessModal(wpm, accuracy);

        // 입력 필드 비활성화
        document.getElementById('practiceInput').disabled = true;
        document.getElementById('pausePracticeBtn').classList.add('hidden');
        document.getElementById('startPracticeBtn').classList.remove('hidden');

        // 완료 사운드
        this.soundManager.play('complete');
    }

    saveSessionStats(sessionData) {
        let stats = JSON.parse(localStorage.getItem('typingStats') || '[]');
        stats.push(sessionData);

        if (stats.length > 100) {
            stats = stats.slice(-100);
        }

        localStorage.setItem('typingStats', JSON.stringify(stats));
        this.updateUserStats();
        this.checkAchievements(sessionData);
    }

    updateUserStats() {
        const stats = this.loadStats();
        if (stats.length === 0) return;

        const avgWPM = Math.round(stats.reduce((sum, s) => sum + s.wpm, 0) / stats.length);
        const maxWPM = Math.max(...stats.map(s => s.wpm));
        const avgAccuracy = Math.round(stats.reduce((sum, s) => sum + s.accuracy, 0) / stats.length);

        AppState.currentUser.stats = {
            ...AppState.currentUser.stats,
            avgWPM,
            maxWPM,
            avgAccuracy
        };
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('typingStats') || '[]');
    }

    checkAchievements(sessionData) {
        const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
        let newAchievement = null;

        // WPM 성취
        if (sessionData.wpm >= 60 && !achievements.speedDemon) {
            achievements.speedDemon = true;
            newAchievement = {
                id: 'speedDemon',
                name: '속도의 악마',
                description: '60 WPM 달성',
                icon: 'fa-tachometer-alt'
            };
        }

        // 정확도 성취
        if (sessionData.accuracy >= 95 && !achievements.perfectionist) {
            achievements.perfectionist = true;
            newAchievement = {
                id: 'perfectionist',
                name: '완벽주의자',
                description: '95% 정확도 달성',
                icon: 'fa-bullseye'
            };
        }

        // 레벨 성취
        if (sessionData.category === 'programming' && !achievements.codeMaster) {
            achievements.codeMaster = true;
            newAchievement = {
                id: 'codeMaster',
                name: '코드 마스터',
                description: '프로그래밍 연습 완료',
                icon: 'fa-code'
            };
        }

        localStorage.setItem('achievements', JSON.stringify(achievements));

        if (newAchievement) {
            this.showAchievementNotification(newAchievement);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg z-50 animate-fade-in';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${achievement.icon} text-2xl text-yellow-600 mr-3"></i>
                <div>
                    <p class="font-semibold">${achievement.name}</p>
                    <p class="text-sm text-gray-600">${achievement.description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showSuccessModal(wpm, accuracy) {
        const modal = document.getElementById('successModal');
        const message = document.getElementById('successMessage');
        const stats = document.getElementById('resultStats');

        message.textContent = `${AppState.currentSession.category} 연습을 완료했습니다!`;

        stats.innerHTML = `
            <div class="grid grid-cols-2 gap-4 text-left">
                <div>
                    <p class="text-sm text-gray-600">타수 (WPM)</p>
                    <p class="text-xl font-bold">${wpm}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">정확도</p>
                    <p class="text-xl font-bold">${accuracy}%</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">점수</p>
                    <p class="text-xl font-bold">${AppState.currentSession.score}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">시간</p>
                    <p class="text-xl font-bold">${Math.floor((Date.now() - AppState.currentSession.startTime) / 1000)}초</p>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    highlightKey(key) {
        const keyElement = document.querySelector(`[data-key="${this.virtualKeyboard.normalizeKey(key)}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
            setTimeout(() => keyElement.classList.remove('active'), 200);
        }
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// 토너먼트 매니저
class TournamentManager {
    constructor() {
        this.tournaments = [
            {
                id: 'weekend-speed',
                name: '주말 스피드 마스터',
                type: 'speed',
                prize: 100000,
                maxParticipants: 500,
                currentParticipants: 256,
                status: 'active',
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                requirements: { minWPM: 30 }
            },
            {
                id: 'rookie-cup',
                name: '신인 월드컵',
                type: 'general',
                prize: 50000,
                maxParticipants: 200,
                currentParticipants: 89,
                status: 'active',
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                requirements: { maxWPM: 60 }
            },
            {
                id: 'accuracy-championship',
                name: '정확도 챔피언십',
                type: 'accuracy',
                prize: 200000,
                maxParticipants: 100,
                currentParticipants: 45,
                status: 'active',
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                requirements: { minAccuracy: 90 }
            }
        ];
    }

    joinTournament(tournamentId) {
        const tournament = this.tournaments.find(t => t.id === tournamentId);
        if (!tournament) return;

        // 자격 확인
        if (!this.checkEligibility(tournament)) {
            alert('참가 자격이 없습니다.');
            return;
        }

        // 참가 처리
        tournament.currentParticipants++;

        // 토너먼트 시작 페이지로 이동
        this.showTournamentArena(tournament);
    }

    checkEligibility(tournament) {
        const userStats = AppState.currentUser.stats;

        if (tournament.requirements.minWPM && userStats.avgWPM < tournament.requirements.minWPM) {
            return false;
        }

        if (tournament.requirements.maxWPM && userStats.avgWPM > tournament.requirements.maxWPM) {
            return false;
        }

        if (tournament.requirements.minAccuracy && userStats.avgAccuracy < tournament.requirements.minAccuracy) {
            return false;
        }

        return true;
    }

    showTournamentArena(tournament) {
        // 토너먼트 경기장 UI 표시
        alert(`${tournament.name} 토너먼트에 참가합니다!`);
    }

    updateTournamentStatus() {
        this.tournaments.forEach(tournament => {
            if (tournament.endTime <= new Date()) {
                tournament.status = 'completed';
                this.distributePrizes(tournament);
            }
        });
    }

    distributePrizes(tournament) {
        // 상금 분배 로직
        console.log(`Distributing prizes for ${tournament.name}`);
    }
}

// 이벤트 매니저
class EventManager {
    constructor() {
        this.events = [
            {
                id: 'year-end-challenge',
                name: '연말 챌린지',
                type: 'challenge',
                duration: 10 * 24 * 60 * 60 * 1000, // 10일
                rewards: {
                    points: 500,
                    badge: 'year-end-champion',
                    vipPass: 1
                },
                currentProgress: 7,
                totalDays: 10
            },
            {
                id: 'referral-event',
                name: '친구 초대 이벤트',
                type: 'referral',
                duration: 7 * 24 * 60 * 60 * 1000, // 7일
                rewards: {
                    '1-friend': 100,
                    '3-friends': 500,
                    '5-friends': { points: 1000, badge: 'social-butterfly' }
                }
            }
        ];
    }

    participateEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        switch (event.type) {
            case 'challenge':
                this.startChallenge(event);
                break;
            case 'referral':
                this.showReferralDialog(event);
                break;
        }
    }

    startChallenge(event) {
        alert(`${event.name} 챌린지를 시작합니다!`);
    }

    showReferralDialog(event) {
        const shareUrl = `${window.location.origin}?ref=${AppState.currentUser.id}`;

        if (navigator.share) {
            navigator.share({
                title: 'OpenTyping Pro',
                text: '함께 타자 실력을 향상시켜요!',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('초대 링크가 복사되었습니다!');
        }
    }
}

// 커뮤니티 매니저
class CommunityManager {
    constructor() {
        this.posts = [
            {
                id: 1,
                author: 'SpeedKing',
                avatar: 'https://picsum.photos/seed/speedking/40/40.jpg',
                title: '타자 속도 150 WPM 돌파 기념!',
                content: '3개월 동안 꾸준히 연습한 결과 드디어 150 WPM을 돌파했습니다. 꾸준함이 정말 중요하네요!',
                likes: 234,
                comments: 45,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                tags: ['성공기', '팁', '동기부여']
            },
            {
                id: 2,
                author: 'AccuracyPro',
                avatar: 'https://picsum.photos/seed/accuracypro/40/40.jpg',
                title: '정확도 향상 팁 공유합니다',
                content: '제가 정확도 98%를 유지하는 비법을 공유해드릴게요. 핵심은 천천히 자세히 타이핑하는 것입니다.',
                likes: 156,
                comments: 23,
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                tags: ['정확도', '팁', '기술']
            }
        ];

        this.leaderboard = [
            { rank: 1, username: 'KeyboardMaster', avatar: 'https://picsum.photos/seed/weekly1/32/32.jpg', wpm: 142, score: 15250 },
            { rank: 2, username: 'SpeedDemon', avatar: 'https://picsum.photos/seed/weekly2/32/32.jpg', wpm: 138, score: 14800 },
            { rank: 3, username: 'TypeNinja', avatar: 'https://picsum.photos/seed/weekly3/32/32.jpg', wpm: 125, score: 13950 },
            { rank: 4, username: '당신', avatar: null, wpm: 85, score: 2450 }
        ];
    }

    createPost(title, content) {
        const newPost = {
            id: this.posts.length + 1,
            author: AppState.currentUser.username,
            avatar: null,
            title,
            content,
            likes: 0,
            comments: 0,
            timestamp: new Date(),
            tags: []
        };

        this.posts.unshift(newPost);
        return newPost;
    }

    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.likes++;
        }
    }

    commentOnPost(postId, comment) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.comments++;
        }
    }
}

// 분석 및 리포트 매니저
class AnalyticsManager {
    constructor() {
        this.charts = {};
    }

    initializeCharts() {
        this.setupProgressChart();
        this.setupFingerChart();
    }

    setupProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const stats = this.loadStats();
        const last7Days = this.getLast7DaysData(stats);

        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.labels,
                datasets: [{
                    label: 'WPM',
                    data: last7Days.wpmData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    yAxisID: 'y'
                }, {
                    label: '정확도 (%)',
                    data: last7Days.accuracyData,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'WPM'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '정확도 (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    setupFingerChart() {
        const ctx = document.getElementById('fingerChart');
        if (!ctx) return;

        const fingerData = this.getFingerStatistics();

        this.charts.finger = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['왼손 새끼', '왼손 약지', '왼손 중지', '왼손 검지', '오른손 검지', '오른손 중지', '오른손 약지', '오른손 새끼'],
                datasets: [{
                    label: '사용 빈도 (%)',
                    data: fingerData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    getLast7DaysData(stats) {
        const labels = [];
        const wpmData = [];
        const accuracyData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));

            // 실제 데이터가 있다면 사용, 없으면 가상 데이터
            const dayStats = this.getStatsForDate(stats, date);
            wpmData.push(dayStats.wpm || Math.floor(Math.random() * 50) + 60);
            accuracyData.push(dayStats.accuracy || Math.floor(Math.random() * 10) + 90);
        }

        return { labels, wpmData, accuracyData };
    }

    getStatsForDate(stats, date) {
        const dateStr = date.toISOString().split('T')[0];
        return stats.find(s => s.date.startsWith(dateStr)) || {};
    }

    getFingerStatistics() {
        // 가상 손가락별 통계 데이터
        return [85, 78, 92, 88, 90, 85, 75, 70];
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('typingStats') || '[]');
    }

    generateAIRecommendations() {
        const userStats = AppState.currentUser.stats;
        const recommendations = [];

        if (userStats.avgWPM < 50) {
            recommendations.push({
                type: 'improvement',
                area: 'speed',
                message: '기초 속도 훈련에 집중해보세요. 짧은 단어부터 시작해 점진적으로 길이를 늘려가세요.',
                priority: 'high'
            });
        }

        if (userStats.avgAccuracy < 95) {
            recommendations.push({
                type: 'improvement',
                area: 'accuracy',
                message: '정확도 향상을 위해 속도보다 정확성에 집중하세요. 느리지만 정확하게 타이핑하는 연습이 효과적입니다.',
                priority: 'high'
            });
        }

        if (userStats.practiceStreak < 7) {
            recommendations.push({
                type: 'consistency',
                area: 'habit',
                message: '매일 꾸준히 연습하는 습관을 들이세요. 하루 15분이라도 정기적으로 연습하면 큰 차이가 생깁니다.',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}

// 메인 애플리케이션 클래스
class OpenTypingApp {
    constructor() {
        this.typingEngine = new TypingEngine();
        this.tournamentManager = new TournamentManager();
        this.eventManager = new EventManager();
        this.communityManager = new CommunityManager();
        this.analyticsManager = new AnalyticsManager();

        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.showSection('dashboard');
        this.initializeRealTimeFeatures();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // 타이핑 입력 이벤트
        const practiceInput = document.getElementById('practiceInput');
        if (practiceInput) {
            practiceInput.addEventListener('input', (e) => {
                this.typingEngine.handleInput(e.target.value);
            });
        }

        // 모바일 메뉴
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.getElementById('mobileMenu')?.classList.toggle('hidden');
        });

        // 알림 패널
        document.addEventListener('click', (e) => {
            const notificationPanel = document.getElementById('notificationPanel');
            if (!notificationPanel?.contains(e.target) && !e.target.closest('#notificationBtn')) {
                notificationPanel?.classList.add('hidden');
            }
        });
    }

    loadUserData() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            AppState.currentUser = { ...AppState.currentUser, ...JSON.parse(savedUser) };
        }
        this.updateUserInterface();
    }

    saveUserData() {
        localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
    }

    updateUserInterface() {
        // 사용자 정보 업데이트
        const userElements = document.querySelectorAll('.user-name, .user-level, .user-score');
        userElements.forEach(el => {
            if (el.classList.contains('user-name')) {
                el.textContent = AppState.currentUser.username;
            } else if (el.classList.contains('user-level')) {
                el.textContent = `레벨 ${AppState.currentUser.level}`;
            } else if (el.classList.contains('user-score')) {
                el.textContent = AppState.currentUser.totalScore.toLocaleString();
            }
        });
    }

    showSection(sectionName) {
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // 선택된 섹션 표시
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // 네비게이션 버튼 활성화 상태 업데이트
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-indigo-600', 'font-bold');
        });

        const activeBtn = document.querySelector(`.nav-btn[onclick="showSection('${sectionName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('text-indigo-600', 'font-bold');
        }

        this.currentSection = sectionName;

        // 섹션별 초기화
        this.initializeSection(sectionName);
    }

    initializeSection(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'analytics':
                this.analyticsManager.initializeCharts();
                break;
            case 'community':
                this.updateCommunityContent();
                break;
        }
    }

    updateDashboardStats() {
        // 대시보드 통계 업데이트
        const stats = AppState.currentUser.stats;

        const wpmElement = document.querySelector('[data-stat="wpm"]');
        const accuracyElement = document.querySelector('[data-stat="accuracy"]');
        const timeElement = document.querySelector('[data-stat="time"]');
        const scoreElement = document.querySelector('[data-stat="score"]');

        if (wpmElement) wpmElement.textContent = stats.avgWPM + ' WPM';
        if (accuracyElement) accuracyElement.textContent = stats.avgAccuracy + '%';
        if (timeElement) timeElement.textContent = Math.floor(stats.totalTime / 60) + '시간';
        if (scoreElement) scoreElement.textContent = stats.totalScore.toLocaleString();
    }

    updateCommunityContent() {
        // 커뮤니티 콘텐츠 업데이트
        // 게시판, 랭킹 등 동적 콘텐츠 로드
    }

    showPracticeCategory(category) {
        const practiceArea = document.getElementById('practiceArea');
        const categoryCards = document.querySelectorAll('.practice-category-card');

        categoryCards.forEach(card => card.classList.add('hidden'));
        practiceArea?.classList.remove('hidden');

        this.typingEngine.initializeSession(category, 'beginner');
    }

    quickStart(level) {
        this.showSection('practice');
        setTimeout(() => {
            this.showPracticeCategory(level);
        }, 100);
    }

    startPracticeSession() {
        this.typingEngine.startSession();
    }

    pausePracticeSession() {
        this.typingEngine.pauseSession();
    }

    restartPracticeSession() {
        const currentCategory = AppState.currentSession.category || 'basic';
        this.showPracticeCategory(currentCategory);
    }

    joinTournament(tournamentId) {
        this.tournamentManager.joinTournament(tournamentId);
    }

    participateEvent(eventId) {
        this.eventManager.participateEvent(eventId);
    }

    toggleNotifications() {
        const panel = document.getElementById('notificationPanel');
        panel?.classList.toggle('hidden');
    }

    toggleTheme() {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');

        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            themeIcon?.classList.remove('fa-moon');
            themeIcon?.classList.add('fa-sun');
            AppState.currentUser.settings.theme = 'dark';
        } else {
            themeIcon?.classList.remove('fa-sun');
            themeIcon?.classList.add('fa-moon');
            AppState.currentUser.settings.theme = 'light';
        }

        this.saveUserData();
    }

    showUserProfile() {
        alert('사용자 프로필 페이지 준비 중...');
    }

    initializeRealTimeFeatures() {
        // 실시간 랭킹 업데이트
        setInterval(() => {
            this.updateRealTimeRanking();
        }, 30000); // 30초마다

        // 실시간 활동 업데이트
        setInterval(() => {
            this.updateRealTimeActivity();
        }, 10000); // 10초마다

        // 토너먼트 상태 업데이트
        setInterval(() => {
            this.tournamentManager.updateTournamentStatus();
        }, 60000); // 1분마다
    }

    updateRealTimeRanking() {
        // 실시간 랭킹 데이터 업데이트
        const leaderboardItems = document.querySelectorAll('.leaderboard-item');
        leaderboardItems.forEach((item, index) => {
            if (Math.random() > 0.7) {
                // 랜덤으로 랭킹 변경 애니메이션
                item.style.animation = 'none';
                setTimeout(() => {
                    item.style.animation = 'rankSlide 0.5s ease-out';
                }, 10);
            }
        });
    }

    updateRealTimeActivity() {
        // 실시간 활동 피드 업데이트
        const activities = [
            { user: 'User123', action: '연습을 시작했습니다', icon: 'play', color: 'green' },
            { user: 'FastTyper', action: '95 WPM을 기록했습니다', icon: 'trophy', color: 'blue' },
            { user: 'Newbie', action: '가입했습니다', icon: 'user-plus', color: 'purple' }
        ];

        const activityContainer = document.querySelector('.real-time-activities');
        if (activityContainer && Math.random() > 0.6) {
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            // 새로운 활동 항목 추가
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: 빠른 검색
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showQuickSearch();
            }

            // Ctrl/Cmd + /: 단축키 도움말
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }

            // ESC: 모달 닫기
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    showQuickSearch() {
        // 빠른 검색 UI 표시
        alert('빠른 검색 기능 준비 중...');
    }

    showKeyboardShortcuts() {
        // 키보드 단축키 도움말 표시
        alert('키보드 단축키 도움말 준비 중...');
    }

    closeAllModals() {
        // 모든 모달 닫기
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    nextLevel() {
        // 다음 레벨로 이동
        this.closeAllModals();
        const currentCategory = AppState.currentSession.category;
        this.showPracticeCategory(currentCategory);
    }

    closeModal() {
        this.closeAllModals();
    }
}

// 글로벌 인스턴스 생성
let app;
let typingEngine;
let virtualKeyboard;

// PWA 설치 관련 변수
let deferredPrompt;
let installButton;

// PWA 설치 이벤트 핸들러
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('OpenTyping Pro: PWA 설치 프롬프트 준비');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

// PWA 설치 성공 이벤트
window.addEventListener('appinstalled', () => {
    console.log('OpenTyping Pro: PWA 설치 완료');
    deferredPrompt = null;
    hideInstallButton();
    showInstallSuccessMessage();
});

// 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('OpenTyping Pro: Service Worker 등록 성공:', registration.scope);

                // Service Worker 업데이트 확인
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('OpenTyping Pro: Service Worker 등록 실패:', error);
            });
    });
}

// 설치 버튼 표시
function showInstallButton() {
    hideInstallButton(); // 기존 버튼이 있으면 제거

    installButton = document.createElement('div');
    installButton.className = 'fixed bottom-4 right-4 z-50 animate-fade-in';
    installButton.innerHTML = `
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3">
            <div class="flex items-center space-x-2">
                <i class="fas fa-download"></i>
                <span class="text-sm font-medium">앱 설치</span>
            </div>
            <div class="flex space-x-2">
                <button onclick="installApp()" class="bg-white text-indigo-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                    설치
                </button>
                <button onclick="hideInstallButton()" class="text-white hover:text-gray-200 transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(installButton);

    // 10초 후 자동 숨김
    setTimeout(() => {
        if (installButton && installButton.parentNode) {
            installButton.style.opacity = '0';
            setTimeout(() => hideInstallButton(), 300);
        }
    }, 10000);
}

// 설치 버튼 숨기기
function hideInstallButton() {
    if (installButton && installButton.parentNode) {
        installButton.parentNode.removeChild(installButton);
        installButton = null;
    }
}

// PWA 설치 실행
async function installApp() {
    if (!deferredPrompt) {
        console.log('OpenTyping Pro: 설치 프롬프트를 사용할 수 없음');
        return;
    }

    console.log('OpenTyping Pro: PWA 설치 시작');
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log('OpenTyping Pro: 사용자 응답:', outcome);

    if (outcome === 'accepted') {
        console.log('OpenTyping Pro: PWA 설치 수락');
    } else {
        console.log('OpenTyping Pro: PWA 설치 거부');
    }

    deferredPrompt = null;
    hideInstallButton();
}

// 설치 성공 메시지
function showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'fixed top-20 right-4 z-50 animate-fade-in';
    message.innerHTML = `
        <div class="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3">
            <i class="fas fa-check-circle"></i>
            <span class="font-medium">OpenTyping Pro가 설치되었습니다!</span>
        </div>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// 업데이트 알림
function showUpdateNotification() {
    const updateNotification = document.createElement('div');
    updateNotification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in';
    updateNotification.innerHTML = `
        <div class="bg-blue-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3">
            <i class="fas fa-sync-alt"></i>
            <span class="font-medium">새 버전이 available합니다!</span>
            <button onclick="updateApp()" class="bg-white text-blue-500 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                업데이트
            </button>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(updateNotification);
}

// 앱 업데이트
function updateApp() {
    window.location.reload();
}

// 모바일 디바이스 감지
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints > 0 && /MacIntel/.test(navigator.platform));
}

// DOM 로드 시 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('OpenTyping Pro: DOM 로드 완료');

    // 모바일 디바이스 감지
    if (isMobileDevice()) {
        console.log('OpenTyping Pro: 모바일 디바이스 감지');
        document.body.classList.add('mobile-device');

        // 모바일 최적화
        optimizeForMobile();
    }

    try {
        app = new OpenTypingApp();
        typingEngine = app.typingEngine;
        virtualKeyboard = typingEngine.virtualKeyboard;
        console.log('OpenTyping Pro: 애플리케이션 초기화 성공');

        // PWA 상태 확인
        if ('standalone' in window.navigator && window.navigator.standalone) {
            console.log('OpenTyping Pro: PWA standalone 모드 실행');
            document.body.classList.add('pwa-standalone');
        }

        // 초기 로드 메시지
        setTimeout(() => {
            console.log('OpenTyping Pro: 모든 기능 준비 완료');

            // 첫 방문 환영 메시지
            if (!localStorage.getItem('visited')) {
                showWelcomeMessage();
                localStorage.setItem('visited', 'true');
            }
        }, 1000);
    } catch (error) {
        console.error('OpenTyping Pro: 초기화 오류', error);
    }
});

// 모바일 최적화 함수
function optimizeForMobile() {
    // 터치 이벤트 최적화
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});

    // 키보드 높이에 따른 뷰포트 조정
    const originalHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        if (window.innerHeight < originalHeight * 0.8) {
            document.body.classList.add('keyboard-open');
        } else {
            document.body.classList.remove('keyboard-open');
        }
    });

    // 가로 모드 처리
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    });
}

// 환영 메시지
function showWelcomeMessage() {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4';
    welcomeMessage.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full animate-float">
            <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    OT
                </div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">OpenTyping Pro에 오신 것을 환영합니다!</h2>
                <p class="text-gray-600 text-sm mb-4">
                    한컴 타자 스타일의 전문 타자 연습 플랫폼입니다.<br>
                    속도와 정확도를 동시에 향상시켜 보세요!
                </p>
                <div class="space-y-2 text-left text-sm text-gray-600 mb-4">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-mobile-alt text-indigo-500"></i>
                        <span>모바일 완벽 지원</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-wifi text-green-500"></i>
                        <span>오프라인 사용 가능</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-chart-line text-purple-500"></i>
                        <span>실시간 통계 분석</span>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                    시작하기
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(welcomeMessage);
}

// 전역 함수 (HTML onclick 핸들러용)
function showSection(sectionName) {
    console.log('OpenTyping Pro: 섹션 전환 요청 -', sectionName);
    try {
        if (app && typeof app.showSection === 'function') {
            app.showSection(sectionName);
            console.log('OpenTyping Pro: 섹션 전환 성공 -', sectionName);
        } else {
            console.error('OpenTyping Pro: 애플리케이션 또는 showSection 함수를 찾을 수 없음');
            // 앱이 초기화되지 않은 경우 대체 처리
            showSectionFallback(sectionName);
        }
    } catch (error) {
        console.error('OpenTyping Pro: 섹션 전환 오류', error);
        showSectionFallback(sectionName);
    }
}

// 대체 섹션 전환 함수
function showSectionFallback(sectionName) {
    console.log('OpenTyping Pro: 대체 섹션 전환 실행 -', sectionName);

    // 모든 섹션 숨기기
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    // 선택된 섹션 표시
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        console.log('OpenTyping Pro: 섹션 표시 성공 -', sectionName);
    } else {
        console.error('OpenTyping Pro: 섹션을 찾을 수 없음 -', sectionName + 'Section');
    }
}

function showPracticeCategory(category) {
    console.log('OpenTyping Pro: 연습 카테고리 -', category);
    if (app && typeof app.showPracticeCategory === 'function') {
        app.showPracticeCategory(category);
    } else {
        console.log('OpenTyping Pro: 연습 카테고리 기능 준비중');
    }
}

function startPracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 시작');
    if (app && typeof app.startPracticeSession === 'function') {
        app.startPracticeSession();
    } else {
        console.log('OpenTyping Pro: 연습 세션 기능 준비중');
    }
}

function pausePracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 일시정지');
    if (app && typeof app.pausePracticeSession === 'function') {
        app.pausePracticeSession();
    } else {
        console.log('OpenTyping Pro: 연습 세션 기능 준비중');
    }
}

function restartPracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 재시작');
    if (app && typeof app.restartPracticeSession === 'function') {
        app.restartPracticeSession();
    } else {
        console.log('OpenTyping Pro: 연습 세션 기능 준비중');
    }
}

function quickStart(level) {
    console.log('OpenTyping Pro: 빠른 시작 -', level);
    if (app && typeof app.quickStart === 'function') {
        app.quickStart(level);
    } else {
        showSection('practice');
        console.log('OpenTyping Pro: 빠른 시작 기능 준비중');
    }
}

function joinTournament(tournamentId) {
    console.log('OpenTyping Pro: 토너먼트 참가 -', tournamentId);
    if (tournamentManager) {
        tournamentManager.joinTournament(tournamentId);
    } else {
        alert('토너먼트 매니저가 초기화되지 않았습니다.');
    }
}

function toggleNotifications() {
    console.log('OpenTyping Pro: 알림 토글');
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

function toggleTheme() {
    console.log('OpenTyping Pro: 테마 토글');
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    if (icon) {
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

function showUserProfile() {
    console.log('OpenTyping Pro: 사용자 프로필');
    alert('사용자 프로필 기능은 준비중입니다.');
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu')?.classList.toggle('hidden');
}

function closeModal() {
    app.closeModal();
}

function nextLevel() {
    app.nextLevel();
}

// 유틸리티 함수
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    return num.toLocaleString('ko-KR');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 콘솔 로그 (디버깅용)
if (typeof window !== 'undefined') {
    window.OpenTypingApp = OpenTypingApp;
    window.typingEngine = typingEngine;
    window.virtualKeyboard = virtualKeyboard;
    console.log('OpenTyping Pro initialized successfully!');
}

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// AI 챗봇 매니저
class ChatBotManager {
    constructor() {
        this.isOpen = false;
        this.messageHistory = [];
        this.quickReplies = [
            '🎯 올바른 자세 알려줘',
            '⚡ 속도 향상 방법',
            '🎮 연습 시작하기',
            '📊 현재 실력 분석',
            '🏆 추천 연습',
            '❓ 자주 묻는 질문'
        ];

        this.responseTemplates = {
            '자세': [
                '👍 좋은 질문입니다! 올바른 자세는 다음과 같습니다:\n\n🪑 허리를 바르게 펴고 의자 깊숙이 앉으세요\n👀 모니터는 눈높이에서 15-20도 아래\n✋ 손목은 자연스럽게 유지\n🦶 발은 바닥에 평평하게 놓으세요\n\n이 자세를 유지하면 장시간 연습해도 피로가 덜합니다!',
                '🪑 자세 교정이 중요합니다:\n\n1. 등과 허리는 의자에 붙이세요\n2. 어깨는 힘 빼고 자연스럽게\n3. 팔꿈치는 90도 각도 유지\n4. 손가락은 키보드 위에서 자연스러운 곡선\n\n30분마다 스트레칭하는 것도 잊지 마세요!'
            ],
            '속도': [
                '⚡ 속도 향상을 위한 팁들입니다:\n\n🎯 정확도부터 확실하게!\n🔤 자음 모음 연습을 꾸준히\n⌨️ 홈키 위치 기억하기\n📈 점진적으로 속도 높이기\n\n현재 속도는 얼마인가요? 맞춤형 조언을 드릴 수 있어요!',
                '🚀 속도 향상의 비결:\n\n1️⃣ 매일 15분 꾸준히 연습\n2️⃣ 암기 타이핑으로 자유로워지기\n3️⃣ 긴 글 연습으로 지구력 키우기\n4️⃣ 손가락 독립성 운동\n\n목표 속도를 설정하시면 구체적인 계획을 세워드릴게요!'
            ],
            '연습': [
                '🎮 지금 바로 연습을 시작해볼까요?\n\n📝 기초 연습: a s d f j k l;\n🔤 알파벳 연습: 영문 단어 타이핑\n📞 숫자 연습: 전화번호 입력 연습\n💻 프로그래밍: 코드 타이핑 연습\n\n어떤 종류의 연습을 원하시나요?',
                '🎯 맞춤형 연습 계획:\n\n🔥 5분 워밍업: 기본 자세 연습\n💪 15분 본 연습: 목표 과제 수행\n🧊 5분 마무리: 복습 및 정리\n\n지금 바로 연습 페이지로 이동할까요?'
            ],
            '분석': [
                '📊 현재 실력을 분석해볼까요?\n\n⌨️ WPM: 현재 분당 타자 속도\n🎯 정확도: 오타율 및 정확도\n📈 추세: 최근 성장 그래프\n🏆 랭킹: 다른 사용자와 비교\n\n통계 페이지에서 자세히 확인해보세요!',
                '📈 개인 맞춤 분석:\n\n✅ 강점: 잘하는 부분 확인\n❌ 약점: 개선이 필요한 부분\n🎯 목표: 다음 달 목표 설정\n📅 계획: 주간 학습 계획\n\n지금 바로 분석을 시작할까요?'
            ],
            '추천': [
                '🏆 현재 실력에 맞는 추천:\n\n🌱 초급: a s d f j k l; 기초 연습\n🌿 중급: 짧은 문장 타이핑\n🌳 고급: 장문과 전문 용어\n🚀 전문가: 코드와 기호 연습\n\n현재 레벨을 알려주시면 더 정확한 추천을 드릴게요!',
                '🎯 오늘의 추천 코스:\n\n📚 [기초] 손가락 위치 익히기 (10분)\n⚡ [속도] 빠른 반복 연습 (15분)\n🎯 [정확도] 집중 타이핑 (10분)\n🔄 [복습] 전체 내용 복습 (5분)\n\n바로 시작해볼까요?'
            ]
        };

        this.initializeChatBot();
    }

    initializeChatBot() {
        // 챗봇 토글 버튼
        const toggleBtn = document.getElementById('chatBotToggle');
        const closeBtn = document.getElementById('closeChatBot');
        const chatWindow = document.getElementById('chatBotWindow');
        const input = document.getElementById('chatBotInput');
        const sendBtn = document.getElementById('chatBotSend');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleChatBot());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChatBot());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // 퀵 리플리 버튼들
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-quick-reply')) {
                const message = e.target.textContent.trim();
                input.value = message;
                this.sendMessage();
            }
        });
    }

    toggleChatBot() {
        const chatWindow = document.getElementById('chatBotWindow');
        const badge = document.getElementById('chatBotBadge');

        if (this.isOpen) {
            this.closeChatBot();
        } else {
            this.openChatBot();
        }
    }

    openChatBot() {
        const chatWindow = document.getElementById('chatBotWindow');
        const badge = document.getElementById('chatBotBadge');

        chatWindow.classList.remove('hidden');
        this.isOpen = true;
        badge.style.display = 'none';

        // 입력 필드에 포커스
        setTimeout(() => {
            document.getElementById('chatBotInput').focus();
        }, 300);
    }

    closeChatBot() {
        const chatWindow = document.getElementById('chatBotWindow');

        chatWindow.classList.add('hidden');
        this.isOpen = false;
    }

    sendMessage() {
        const input = document.getElementById('chatBotInput');
        const message = input.value.trim();

        if (!message) return;

        // 사용자 메시지 추가
        this.addMessage(message, 'user');

        // 입력 필드 비우기
        input.value = '';

        // 챗봇 응답 생성
        this.generateResponse(message);
    }

    addMessage(message, sender = 'bot') {
        const messagesContainer = document.getElementById('chatBotMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-2 ${sender === 'user' ? 'justify-end' : ''}`;

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-3 shadow-sm max-w-[80%]">
                    <p class="text-sm">${message}</p>
                </div>
                <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-gray-600 text-sm"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="bg-white rounded-xl p-3 shadow-sm max-w-[80%]">
                    <p class="text-sm text-gray-800 whitespace-pre-line">${message}</p>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);

        // 스크롤 하단으로
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // 메시지 기록
        this.messageHistory.push({ message, sender, timestamp: Date.now() });
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // 타이핑 상태 분석 후 응답
        const typingStats = this.analyzeTypingStats();
        const contextualResponse = this.getContextualResponse(lowerMessage, typingStats);

        // 응답 지연 (자연스러운 대화를 위해)
        setTimeout(() => {
            this.addMessage(contextualResponse, 'bot');

            // 추가 퀵 리플리 제공
            this.showQuickReplies();
        }, 800 + Math.random() * 700);
    }

    analyzeTypingStats() {
        // 현재 타이핑 세션 상태 분석
        const session = AppState.currentSession;

        return {
            wpm: session.wpm || 0,
            accuracy: session.accuracy || 0,
            errors: session.incorrectChars || 0,
            timeElapsed: session.startTime ? Date.now() - session.startTime : 0,
            isPracticing: session.startTime !== null
        };
    }

    getContextualResponse(message, stats) {
        // 다국어 응답 로직
        const currentLang = window.languageManager ? window.languageManager.getLanguage() : 'ko';

        // 언어별 키워드 매핑
        const keywords = {
            ko: {
                posture: ['자세', '자리'],
                speed: ['속도', '빠르', 'wpm'],
                practice: ['연습', '시작', 'practice'],
                analysis: ['분석', '실력', '통계'],
                recommend: ['추천', '추천']
            },
            en: {
                posture: ['posture', 'sit', 'position'],
                speed: ['speed', 'fast', 'wpm'],
                practice: ['practice', 'start', 'training'],
                analysis: ['analysis', 'skill', 'stats'],
                recommend: ['recommend', 'suggest']
            },
            ja: {
                posture: ['姿勢', '座り', '姿勢'],
                speed: ['スピード', '速い', 'wpm'],
                practice: ['練習', '開始', 'トレーニング'],
                analysis: ['分析', 'スキル', '統計'],
                recommend: ['推奨', 'おすすめ']
            },
            zh: {
                posture: ['姿势', '坐姿', '位置'],
                speed: ['速度', '快速', 'wpm'],
                practice: ['练习', '开始', '训练'],
                analysis: ['分析', '技能', '统计'],
                recommend: ['推荐', '建议']
            },
            vi: {
                posture: ['tư thế', 'ngồi', 'vị trí'],
                speed: ['tốc độ', 'nhanh', 'wpm'],
                practice: ['luyện tập', 'bắt đầu', 'đào tạo'],
                analysis: ['phân tích', 'kỹ năng', 'thống kê'],
                recommend: ['đề xuất', 'gợi ý']
            },
            th: {
                posture: ['ท่าทา', 'นั่ง', 'ท่า'],
                speed: ['ความเร็ว', 'เร็ว', 'wpm'],
                practice: ['ฝึก', 'เริ่ม', 'ฝึกพิมพ์'],
                analysis: ['วิเคราะห์', 'ทักษะะ', 'สถิติ'],
                recommend: ['แนะนำ', 'แนะนำ']
            }
        };

        const langKeywords = keywords[currentLang] || keywords.ko;

        // 키워드 기반 응답
        for (const [category, words] of Object.entries(langKeywords)) {
            if (words.some(word => message.includes(word))) {
                return this.getMultilingualResponse(category, stats, currentLang);
            }
        }

        // 타이핑 중인 상태에 따른 응답
        if (stats.isPracticing) {
            return this.getPracticeResponse(stats, currentLang);
        }

        // 기본 응답
        return this.getDefaultResponse(currentLang);
    }

    getMultilingualResponse(category, stats, language) {
        const responses = {
            ko: {
                자세: [
                    '👍 좋은 질문입니다! 올바른 자세는 다음과 같습니다:\n\n🪑 허리를 바르게 펴고 의자 깊숙이 앉으세요\n👀 모니터는 눈높이에서 15-20도 아래\n✋ 손목은 자연스럽게 유지\n🦶 발은 바닥에 평평하게 놓으세요\n\n이 자세를 유지하면 장시간 연습해도 피로가 덜합니다!',
                    '🪑 자세 교정이 중요합니다:\n\n1. 등과 허리는 의자에 붙이세요\n2. 어깨는 힘 빼고 자연스럽게\n3. 팔꿈치는 90도 각도 유지\n4. 손가락은 키보드 위에서 자연스러운 곡선\n\n30분마다 스트레칭하는 것도 잊지 마세요!'
                ],
                속도: [
                    '⚡ 속도 향상을 위한 팁들입니다:\n\n🎯 정확도부터 확실하게!\n🔤 자음 모음 연습을 꾸준히\n⌨️ 홈키 위치 기억하기\n📈 점진적으로 속도 높이기\n\n현재 속도는 얼마인가요? 맞춤형 조언을 드릴 수 있어요!',
                    '🚀 속도 향상의 비결:\n\n1️⃣ 매일 15분 꾸준히 연습\n2️⃣ 암기 타이핑으로 자유로워지기\n3️⃣ 긴 글 연습으로 지구력 키우기\n4️⃣ 손가락 독립성 운동\n\n목표 속도를 설정하시면 구체적인 계획을 세워드릴게요!'
                ],
                연습: [
                    '🎮 지금 바로 연습을 시작해볼까요?\n\n📝 기초 연습: a s d f j k l;\n🔤 알파벳 연습: 영문 단어 타이핑\n📞 숫자 연습: 전화번호 입력 연습\n💻 프로그래밍: 코드 타이핑 연습\n\n어떤 종류의 연습을 원하시나요?',
                    '🎯 맞춤형 연습 계획:\n\n🔥 5분 워밍업: 기본 자세 연습\n💪 15분 본 연습: 목표 과제 수행\n🧊 5분 마무리: 복습 및 정리\n\n지금 바로 연습 페이지로 이동할까요?'
                ],
                분석: [
                    '📊 현재 실력을 분석해볼까요?\n\n⌨️ WPM: 현재 분당 타자 속도\n🎯 정확도: 오타율 및 정확도\n📈 추세: 최근 성장 그래프\n🏆 랭킹: 다른 사용자와 비교\n\n통계 페이지에서 자세히 확인해보세요!',
                    '📈 개인 맞춤 분석:\n\n✅ 강점: 잘하는 부분 확인\n❌ 약점: 개선이 필요한 부분\n🎯 목표: 다음 달 목표 설정\n📅 계획: 주간 학습 계획\n\n지금 바로 분석을 시작할까요?'
                ],
                추천: [
                    '🏆 현재 실력에 맞는 추천:\n\n🌱 초급: a s d f j k l; 기초 연습\n🌿 중급: 짧은 문장 타이핑\n🌳 고급: 장문과 전문 용어\n🚀 전문가: 코드와 기호 연습\n\n현재 레벨을 알려주시면 더 정확한 추천을 드릴게요!',
                    '🎯 오늘의 추천 코스:\n\n📚 [기초] 손가락 위치 익히기 (10분)\n⚡ [속도] 빠른 반복 연습 (15분)\n🎯 [정확도] 집중 타이핑 (10분)\n🔄 [복습] 전체 내용 복습 (5분)\n\n바로 시작해볼까요?'
                ]
            },
            en: {
                posture: [
                    '👍 Great question! Here\'s the proper typing posture:\n\n🪑 Sit with your back straight and chair pulled in\n👀 Monitor 15-20 degrees below eye level\n✋ Keep wrists naturally positioned\n🦶 Feet flat on the floor\n\nThis posture reduces fatigue during long practice sessions!',
                    '🪑 Posture correction is important:\n\n1. Back and lower back against the chair\n2. Shoulders relaxed and natural\n3. Elbows at 90-degree angles\n4. Fingers in natural curve over keyboard\n\nDon\'t forget to stretch every 30 minutes!'
                ],
                speed: [
                    '⚡ Speed improvement tips:\n\n🎯 Accuracy first and foremost!\n🔤 Consistent consonant/vowel practice\n⌨️ Memorize home key positions\n📈 Gradually increase speed\n\nWhat\'s your current speed? I can give personalized advice!',
                    '🚀 Speed improvement secrets:\n\n1️⃣ Practice 15 minutes daily\n2️⃣ Become comfortable with touch typing\n3️⃣ Build endurance with longer texts\n4️⃣ Finger independence exercises\n\nSet a target speed and I\'ll create a specific plan for you!'
                ],
                practice: [
                    '🎮 Ready to start practicing?\n\n📝 Basic: a s d f j k l; practice\n🔤 Alphabet: English word typing\n📞 Numbers: Phone number entry practice\n💻 Programming: Code typing practice\n\nWhat type of practice would you like?',
                    '🎯 Personalized practice plan:\n\n🔥 5min warm-up: Basic posture practice\n💪 15min main session: Target task completion\n🧊 5min cooldown: Review and organize\n\nReady to go to the practice page?'
                ],
                analysis: [
                    '📊 Let\'s analyze your current skills?\n\n⌨️ WPM: Current words per minute speed\n🎯 Accuracy: Error rate and precision\n📈 Trends: Recent growth graph\n🏆 Rankings: Compare with other users\n\nCheck the analytics page for detailed analysis!',
                    '📈 Personalized analysis:\n\n✅ Strengths: Areas you excel at\n❌ Weaknesses: Areas needing improvement\n🎯 Goals: Next month\'s targets\n📅 Plans: Weekly study schedule\n\nReady to start the analysis?'
                ],
                recommend: [
                    '🏆 Recommendations based on your current level:\n\n🌱 Beginner: a s d f j k l; basic practice\n🌿 Intermediate: Short sentence typing\n🌳 Advanced: Long texts and specialized terms\n🚀 Expert: Code and symbol typing\n\n\nLet me know your current level for more precise recommendations!',
                    '🎯 Today\'s recommended course:\n\n📚 [Basic] Finger position mastery (10min)\n⚡ [Speed] Fast repetition practice (15min)\n🎯 [Accuracy] Focused typing (10min)\n🔄 [Review] Full content review (5min)\n\nReady to start?'
                ]
            ]
        };

        const langResponses = responses[language] || responses.ko;
        const categoryResponses = langResponses[this.getCategoryInLanguage(category, language)];

        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }

    getPracticeResponse(stats, language) {
        const responses = {
            ko: {
                errors: [
                    `💪 현재 오타가 ${stats.errors}개 있네요. 천천히 정확하게 타이핑하는 것에 집중해보세요! 정확도가 속도보다 중요해요.`,
                    `🎯 오타가 ${stats.errors}개 발생했네요. 자세를 다시 확인하고 홈키 위치를 기억하세요.`,
                    `⌨️ ${stats.errors}개의 오타가 있지만 괜찮아요! 다음에는 더 정확하게 타이핑해보세요.`
                ],
                good: [
                    `🚀 현재 ${stats.wpm}WPM으로 잘하고 있어요! 현재 속도를 유지하면서 정확도를 높이는 데 집중해보세요.`,
                    `🎯 ${stats.wpm}WPM, 정확도 ${stats.accuracy}%! 훌륭한 성과입니다. 이대로 꾸준히 하면 더 발전할 수 있어요.`,
                    `🏆 ${stats.wpm}WPM! 이 속도를 유지하면서 다음 단계로 도전해보세요.`
                ],
                normal: [
                    `🎯 현재 ${stats.wpm}WPM, 정확도 ${stats.accuracy}%입니다. 꾸준히 연습하면 분명 발전할 수 있어요!`,
                    `💪 ${stats.wpm}WPM으로 잘하고 있어요. 정확도에 더 집중하면 속도도 자연스럽게 올라갈 거예요.`,
                    `📈 ${stats.accuracy}% 정확도로 좋은 성과입니다. 속도 향상을 위해 꾸준히 연습해보세요.`
                ]
            },
            en: {
                errors: [
                    `💪 You have ${stats.errors} errors. Focus on accuracy first! Precision is more important than speed.`,
                    `🎯 ${stats.errors} errors occurred. Check your posture and home key positions.`,
                    `⌨️ You made ${stats.errors} errors but that\'s okay! Try to type more accurately next time.`
                ],
                good: [
                    `🚀 You\'re doing great at ${stats.wpm}WPM! Maintain this speed while improving accuracy.`,
                    `🎯 ${stats.wpm}WPM with ${stats.accuracy}% accuracy! Excellent results. Keep practicing for more improvement.`,
                    `🏆 ${stats.wpm}WPM! Maintain this speed and challenge yourself to the next level.`
                ],
                normal: [
                    `🎯 Currently ${stats.wpm}WPM, ${stats.accuracy}% accuracy. Consistent practice will definitely lead to improvement!`,
                    `💪 You\'re doing well at ${stats.wpm}WPM. Focus more on accuracy and your speed will naturally increase.`,
                    `📈 ${stats.accuracy}% accuracy is good work. Practice consistently for speed improvement.`
                ]
            },
            ja: {
                姿勢: [
                    '👍 素晴らしい質問です！正しいタイピング姿勢は以下の通りです：\n\n🪑 背筋を伸ばし、椅子に深く座る\n👀 モニターは視線から15-20度下\n✋ 手首は自然な位置を保つ\n🦶 足は床に平らに置く\n\nこの姿勢を保つことで、長時間の練習でも疲れにくくなります！',
                    '🪑 姿勢の矯正が重要です：\n\n1. 背中と腰を椅子につける\n2. 肩は力を抜いて自然に\n3. 肘は90度の角度を保つ\n4. 指はキーボードの上で自然なカーブを\n\n30分ごとのストレッチも忘れないでください！'
                ],
                スピード: [
                    '⚡ スピード向上のためのヒントです：\n\n🎯 まず正確性を確実に！\n🔤 子音母音の練習を継続的に\n⌨️ ホームキーの位置を覚える\n📈 段階的にスピードを上げる\n\n現在のスピードはどのくらいですか？的確なアドバイスを提供できます！',
                    '🚀 スピード向上の秘訣：\n\n1️⃣ 毎日15分継続的に練習\n2️⃣ タッチタイピングで自由になる\n3️⃣ 長文の練習で持久力をつける\n4️⃣ 指の独立性運動\n\n目標スピードを設定すれば、具体的な計画を立てられます！'
                ],
                練習: [
                    '🎮 今すぐ練習を始めてみましょうか？\n\n📝 基本練習：a s d f j k l;\n🔤 アルファベット練習：英単語タイピング\n📞 数字練習：電話番号入力練習\n💻 プログラミング：コードタイピング練習\n\nどの種類の練習をお望みですか？',
                    '🎯 パーソナライズされた練習計画：\n\n🔥 5分ウォームアップ：基本姿勢練習\n💪 15分メイン練習：目標課題遂行\n🧊 5分クールダウン：復習と整理\n\n今すぐ練習ページに移動しますか？'
                ],
                分析: [
                    '📊 現在の実力を分析してみましょうか？\n\n⌨️ WPM：現在の分あたりのタイピング速度\n🎯 正確性：誤字率と正確性\n📈 トレンド：最近の成長グラフ\n🏆 ランキング：他のユーザーとの比較\n\n統計ページで詳細を確認してください！',
                    '📈 個人別分析：\n\n✅ 強み：得意な分野の確認\n❌ 弱み：改善が必要な分野\n🎯 目標：来月の目標設定\n📅 計画：週間学習計画\n\n今すぐ分析を始めますか？'
                ],
                推奨: [
                    '🏆 現在の実力に合った推奨：\n\n🌱 初級：a s d f j k l; 基本練習\n🌿 中級：短文タイピング\n🌳 上級：長文と専門用語\n🚀 専門家：コードと記号の練習\n\n現在のレベルを教えていただければ、より正確な推奨ができます！',
                    '🎯 今日の推奨コース：\n\n📚 [基本] 指の位置マスター（10分）\n⚡ [スピード] 高速反復練習（15分）\n🎯 [正確性] 集中タイピング（10分）\n🔄 [復習] 全体内容復習（5分）\n\n今すぐ始めましょうか？'
                ]
            },
            zh: {
                姿势: [
                    '👍 好问题！正确的打字姿势如下：\n\n🪑 腰背挺直，深坐椅子\n👀 显示器低于视线15-20度\n✋ 保持手腕自然位置\n🦶 双脚平放地面\n\n保持这个姿势，长时间练习也不易疲劳！',
                    '🪑 姿势矫正很重要：\n\n1. 背部和腰部贴紧椅子\n2. 肩膀放松自然\n3. 手肘保持90度角\n4. 手指在键盘上保持自然弧度\n\n每30分钟不要忘记拉伸！'
                ],
                速度: [
                    '⚡ 提高速度的技巧：\n\n🎯 首先确保准确性！\n🔤 坚持练习声母韵母\n⌨️ 记住主键位置\n📈 逐步提高速度\n\n当前速度是多少？我可以提供个性化建议！',
                    '🚀 提高速度的秘诀：\n\n1️⃣ 每天练习15分钟\n2️⃣ 熟练掌握盲打\n3️⃣ 长文练习增强耐力\n4️⃣ 手指独立性训练\n\n设定目标速度，我会为您制定具体计划！'
                ],
                练习: [
                    '🎮 现在开始练习吗？\n\n📝 基础练习：a s d f j k l;\n🔤 字母练习：英文单词打字\n📞 数字练习：电话号码输入练习\n💻 编程：代码打字练习\n\n您想要哪种类型的练习？',
                    '🎯 个性化练习计划：\n\n🔥 5分钟热身：基础姿势练习\n💪 15分钟主练习：目标任务完成\n🧊 5分钟整理：复习和总结\n\n现在前往练习页面吗？'
                ],
                分析: [
                    '📊 分析您当前的技能？\n\n⌨️ WPM：当前每分钟打字速度\n🎯 准确性：错误率和精确度\n📈 趋势：最近成长图表\n🏆 排名：与其他用户比较\n\n在统计页面查看详细分析！',
                    '📈 个人分析：\n\n✅ 优势：您的强项\n❌ 劣势：需要改进的领域\n🎯 目标：下月目标设定\n📅 计划：周学习计划\n\n现在开始分析吗？'
                ],
                推荐: [
                    '🏆 基于当前水平的推荐：\n\n🌱 初级：a s d f j k l; 基础练习\n🌿 中级：短句打字\n🌳 高级：长文和专业术语\n🚀 专家：代码和符号练习\n\n告诉我您的当前水平，我可以提供更准确的推荐！',
                    '🎯 今日推荐课程：\n\n📚 [基础] 指法位置掌握（10分钟）\n⚡ [速度] 快速重复练习（15分钟）\n🎯 [准确性] 集中打字（10分钟）\n🔄 [复习] 全内容复习（5分钟）\n\n现在开始吗？'
                ]
            },
            vi: {
                tư thế: [
                    '👍 Câu hỏi hay! Tư thế gõ đúng như sau:\n\n🪑 Ngồi thẳng lưng, ngồi sâu vào ghế\n👀 Màn hình thấp hơn mắt 15-20 độ\n✋ Giữ cổ tay tự nhiên\n🦶 Chân đặt phẳng trên sàn\n\nTư thế này giúp giảm mệt mỏi khi luyện tập lâu!',
                    '🪑 Chỉnh sửa tư thế rất quan trọng:\n\n1. Lưng và eo áp vào ghế\n2. Vai thả lỏng tự nhiên\n3. Khuỷu tay góc 90 độ\n4. Ngón tay cong tự nhiên trên bàn phím\n\nĐừng quên vận động mỗi 30 phút!'
                ],
                tốc độ: [
                    '⚡ Mẹo cải thiện tốc độ:\n\n🎯 Ưu tiên chính xác trước!\n🔤 Luyện tập phụ âm nguyên âm đều đặn\n⌨️ Nhớ vị trí phím nhà\n📈 Tăng tốc độ từ từ\n\nTốc độ hiện tại của bạn bao nhiêu? Tôi có thể tư vấn cá nhân hóa!',
                    '🚀 Bí quyết cải thiện tốc độ:\n\n1️⃣ Luyện tập 15 phút mỗi ngày\n2️⃣ Thành thạo gõ mù\n3️⃣ Xây dựng sức bền với văn bản dài\n4️⃣ Bài tập độc lập ngón tay\n\nĐặt mục tiêu tốc độ và tôi sẽ lập kế hoạch chi tiết cho bạn!'
                ],
                luyện tập: [
                    '🎮 Bắt đầu luyện tập ngay?\n\n📝 Cơ bản: luyện tập a s d f j k l;\n🔤 Bảng chữ cái: gõ từ tiếng Anh\n📞 Số: luyện tập nhập số điện thoại\n💻 Lập trình: luyện tập gõ mã\n\nBạn muốn loại luyện tập nào?',
                    '🎯 Kế hoạch luyện tập cá nhân:\n\n🔥 5ph khởi động: luyện tập tư thế cơ bản\n💪 15ph chính: hoàn thành mục tiêu\n🧊 5ph thư giãn: ôn tập và tổ chức\n\nĐến trang luyện tập ngay?'
                ],
                phân tích: [
                    '📊 Phân tích kỹ năng hiện tại?\n\n⌨️ WPM: tốc độ gõ mỗi phút hiện tại\n🎯 Chính xác: tỷ lệ lỗi và độ chính xác\n📈 Xu hướng: biểu đồ tăng trưởng gần đây\n🏆 Xếp hạng: so sánh với người dùng khác\n\nKiểm tra trang phân tích để xem chi tiết!',
                    '📈 Phân tích cá nhân:\n\n✅ Điểm mạnh: lĩnh vực bạn giỏi\n❌ Điểm yếu: lĩnh vực cần cải thiện\n🎯 Mục tiêu: mục tiêu tháng tới\n📅 Kế hoạch: lịch học hàng tuần\n\nBắt đầu phân tích ngay?'
                ],
                đề xuất: [
                    '🏆 Đề xuất dựa trên trình độ hiện tại:\n\n🌱 Người mới: luyện tập cơ bản a s d f j k l;\n🌿 Trung cấp: gõ câu ngắn\n🌳 Nâng cao: văn bản dài và thuật ngữ chuyên ngành\n🚀 Chuyên gia: luyện tập mã và ký hiệu\n\nCho tôi biết trình độ hiện tại để nhận đề xuất chính xác hơn!',
                    '🎯 Khóa học đề xuất hôm nay:\n\n📚 [Cơ bản] Làm chủ vị trí ngón tay (10ph)\n⚡ [Tốc độ] Luyện tập lặp nhanh (15ph)\n🎯 [Chính xác] Gõ tập trung (10ph)\n🔄 [Ôn tập] Ôn tập toàn bộ nội dung (5ph)\n\nBắt đầu ngay?'
                ]
            },
            th: {
                ท่าทาง: [
                    '👍 คำถามดีมาก! ท่าทางพิมพ์ที่ถูกต้อง:\n\n🪑 นั่งตรงหลัง นั่นลึกในเก้าอี้\n👀 จอภาพต่ำกว่าสายตา 15-20 องศา\✋ ให้ข้อมืออยู่ในท่าทางเป็นธรรมชาติ\n🦶 เท้าวางแบนบนพื้น\น\nท่าทางนี้ช่วยลดความเมื่อยเมื่อฝึกนานๆ!',
                    '🪑 การแก้ไขท่าทางสำคัญมาก:\n\n1. หลังและเอวชิดเก้าอี้\n2. ไหล่ผ่อนคลายเป็นธรรมชาติ\n3. ข้อศอกมุม 90 องศา\นิ้วมือโค้งเป็นธรรมชาติบนคีย์บอร์ด\นอกจากนี้อย่าลืมยืดกล้ามเนื้อทุก 30 นาที!'
                ],
                ความเร็ว: [
                    '⚡ เคล็ดลับเพิ่มความเร็ว:\n\n🎯 ความแม่นยำก่อนเป็นสำคัญ!\n🔤 ฝึกพยัญชนะสระอย่างสม่ำเสมอ\จำตำแหน่งคีย์หลัก\📈 เพิ่มความเร็วทีละน้อย\ความเร็วปัจจุบันเท่าไหร่? ผมสามารถให้คำแนะนำส่วนตัวได้!',
                    '🚀 ความลับของการเพิ่มความเร็ว:\n\n1️⃣ ฝึกทุกวัน 15 นาที\น2️⃣ ฝึกพิมพ์ไม่ดูคีย์บอร์ด\น3️⃣ สร้างความอึดด้วยข้อความยาวๆ\น4️⃣ ออกกำลังงานนิ้วมือแยกกัน\นตั้งเป้าหมายความเร็วและผมจะวางแผนโดยละเอียดให้!'
                ],
                ฝึก: [
                '🎮 เริ่มฝึกไหม?\n\n📝 พื้นฐาน: ฝึก a s d f j k l;\น🔤 อักษร: พิมพ์คำภาษาอังกฤษ\น📞 ตัวเลข: ฝึกป้อนหมายเลขโทรศัพท์\น💻 การเขียนโปรแกรม: ฝึกพิมพ์โค้ด\นคุณต้องการฝึกประเภทไหน?',
                '🎯 แผนการฝึกแบบส่วนตัว:\n\n🔥 5นาทีอุ่นเครื่อง: ฝึกท่าทางพื้นฐาน\น💪 15นาทีหลัก: ทำภารกิจเป้าหมาย\น🧊 5นาทีผ่อนคลาย: ทบทวนและจัดระเบียบ\นไปหน้าฝึกพิมพ์เลยไหม?'
            ],
            วิเคราะห์: [
                '📊 วิเคราะห์ทักษะปัจจุบัน?\n\n⌨️ WPM: ความเร็วพิมพ์ต่อนาทีปัจจุบัน\น🎯 ความแม่นยำ: อัตราข้อผิดพลาดและความแม่นยำ\น📈 แนวโน้ม: กราฟการเติบโตล่าสุด\น🏆 การจัดอันดับ: เปรียบเทียบกับผู้ใช้อื่น\นดูหน้าสถิติสำหรับการวิเคราะห์ละเอียด!',
                '📈 การวิเคราะห์ส่วนตัว:\n\n✅ จุดแข็ง: สิ่งที่คุณถนัด\น❌ จุดอ่อน: สิ่งที่ต้องปรับปรุง\น🎯 เป้าหมาย: เป้าหมายเดือนหน้า\น📅 แผน: แผนการเรียนรายสัปดาห์\นเริ่มการวิเคราะห์เลยไหม?'
            ],
            แนะนำ: [
                '🏆 คำแนะนำตามระดับปัจจุบัน:\n\n🌱 มือใหม่: ฝึกพื้นฐาน a s d f j k l;\น🌿 ระดับกลาง: พิมพ์ประโยคสั้นๆ\น🌳 ขั้นสูง: ข้อความยาวและคำศัพท์เฉพาะทาง\น🚀 ผู้เชี่ยวชาญ: ฝึกโค้ดและสัญลักษณ์\นบอกระดับปัจจุบันเพื่อรับคำแนะนำที่แม่นยำกว่า!',
                '🎯 คอร์สแนะนำวันนี้:\n\n📚 [พื้นฐาน] การควบคุมตำแหน่งนิ้ว (10นาที)\น⚡ [ความเร็ว] ฝึกซ้ำเร็วๆ (15นาที)\น🎯 [ความแม่นยำ] พิมพ์เข้มข้น (10นาที)\น🔄 [ทบทวน] ทบทวนเนื้อหาทั้งหมด (5นาที)\นเริ่มเลยไหม?'
            ]
        }
    }
};

        const langResponses = responses[language] || responses.ko;

        if (stats.errors > 5) {
            return langResponses.errors[Math.floor(Math.random() * langResponses.errors.length)];
        } else if (stats.wpm > 60) {
            return langResponses.good[Math.floor(Math.random() * langResponses.good.length)];
        } else {
            return langResponses.normal[Math.floor(Math.random() * langResponses.normal.length)];
        }
    }

    getDefaultResponse(language) {
        const responses = {
            ko: [
                '🤔 좋은 질문이에요! 더 구체적으로 말씀해주시면 자세히 도와드릴게요.',
                '📚 타자 연습에 대해 궁금한 점을 알려주세요. 최고의 코칭을 제공해드릴게요!',
                '🎯 목표를 설정하고 그에 맞는 연습을 추천해드릴 수 있어요. 어떤 목표가 있으신가요?',
                '💪 매일 꾸준히 하는 것이 중요해요. 오늘의 목표를 함께 정해볼까요?'
            ],
            en: [
                '🤔 Great question! Tell me more specifically and I\'ll help you in detail.',
                '📚 Ask me anything about typing practice. I\'ll provide the best coaching!',
                '🎯 I can recommend practices based on your goals. What are your objectives?',
                '💪 Consistency is key. Shall we set today\'s goals together?'
            ],
            ja: [
                '🤔 素晴らしい質問ですね！もっと具体的に教えていただければ、詳細にお手伝いします。',
                '📚 タイピング練習について何でも聞いてください。最高のコーチングを提供します！',
                '🎯 目標を設定して、それに合った練習を推薦できます。どのような目標がありますか？',
                '💪 毎日続けることが重要です。今日の目標を一緒に設定しましょうか？'
            ],
            zh: [
                '🤔 很好的问题！如果告诉我更多细节，我可以详细帮助您。',
                '📚 问我任何关于打字练习的问题。我会提供最好的指导！',
                '🎯 我可以根据您的目标推荐练习。您的目标是什么？',
                '💪 每天坚持练习很重要。让我们一起设定今天的目标吧？'
            ],
            vi: [
                '🤔 Câu hỏi hay! Hãy cho tôi biết thêm chi tiết và tôi sẽ giúp bạn chi tiết.',
                '📚 Hỏi tôi bất cứ điều gì về luyện tập gõ. Tôi sẽ cung cấp hướng dẫn tốt nhất!',
                '🎯 Tôi có thể đề xuất luyện tập dựa trên mục tiêu của bạn. Mục tiêu của bạn là gì?',
                '💪 Kiên trì mỗi ngày rất quan trọng. Chúng ta cùng đặt mục tiêu hôm nay nhé?'
            ],
            th: [
                '🤔 คำถามดีครับ! ให้บอกให้เพิ่มเติมและผมจะช่วยเหลือให้ครับอย่างละเอียน',
                '📚 ถามเรื่องอะไรรก็ได้เกี่ยวกับการฝึกพิมพ์ดี้น! ผมจะให้คำแนะนำที่ดีที่สุด!',
                '🎯 ผมสามารถแนะนำการฝึกตามเป้าหมาของคุณ ครับ คำแนะนำที่ดีที่สุด!',
                '💪 การฝึกต่อเนื่อๆ สำคัญมากคือ ครับ ผม จะช่วยเหลือคุณตั้งเป้าหมาของวันนีหรือคะ!'
            ]
        };

        const langResponses = responses[language] || responses.ko;
        return langResponses[Math.floor(Math.random() * langResponses.length)];
    }

    getCategoryInLanguage(category, language) {
        const categoryMap = {
            ko: {
                자세: '자세',
                속도: '속도',
                연습: '연습',
                분석: '분석',
                추천: '추천'
            },
            en: {
                자세: 'posture',
                속도: 'speed',
                연습: 'practice',
                분석: 'analysis',
                추천: 'recommend'
            },
            ja: {
                자세: '姿勢',
                속도: 'スピード',
                연습: '練習',
                분석: '分析',
                추천: '推奨'
            },
            zh: {
                자세: '姿势',
                속도: '速度',
                연습: '练习',
                분석: '分析',
                추천: '推荐'
            },
            vi: {
                자세: 'tư thế',
                속도: 'tốc độ',
                연습: 'luyện tập',
                분석: 'phân tích',
                추천: 'đề xuất'
            },
            th: {
                자세: 'ท่าทา',
                속도: 'ความเร็ว',
                연습: 'ฝึก',
                분석: 'วิเคราะห์',
                추천: 'แนะนำ'
            }
        };

        return categoryMap[language] ? categoryMap[language][category] || category : category;
    }

    updateLanguage(languageCode) {
        this.currentLanguage = languageCode;
        console.log(`OpenTyping ChatBot: 언어 변경됨 - ${languageCode}`);
    }

    getRandomResponse(category) {
        const responses = this.responseTemplates[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    showQuickReplies() {
        const messagesContainer = document.getElementById('chatBotMessages');
        const replies = ['🎮 연습 시작하기', '📊 실력 확인하기', '⚡ 팁 더 보기'];

        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'flex flex-wrap gap-2 mt-3';

        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'chat-quick-reply text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition';
            btn.textContent = reply;
            repliesDiv.appendChild(btn);
        });

        messagesContainer.appendChild(repliesDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 타이핑 코칭 알림
    showTypingTip() {
        const tips = [
            '💡 팁: 손가락을 키보드 위에서 자연스럽게 유지하세요',
            '🎯 목표: 정확도를 먼저 높이고 속도를 높이세요',
            '🔥 집중: 화면을 보지 말고 손가락 움직임에 집중하세요',
            '⚡ 효율: 짧게 자주 연습하는 것보다 길게 집중하는 것이 좋아요',
            '🏆 성공: 어제보다 5%만 나아져도 성공입니다!'
        ];

        const tip = tips[Math.floor(Math.random() * tips.length)];

        // 뱃지 업데이트
        const badge = document.getElementById('chatBotBadge');
        badge.textContent = '💡';
        badge.style.display = 'flex';

        // 챗봇 열린 경우 메시지 표시
        if (this.isOpen) {
            this.addMessage(tip, 'bot');
        }
    }

    // 실시간 타이핑 피드백
    provideRealTimeFeedback(typedChar, expectedChar, isCorrect) {
        if (!this.isOpen) return;

        if (!isCorrect) {
            const feedbacks = [
                '👆 잘못된 키입니다. 홈키 위치를 확인하세요',
                '🎯 천천히 정확하게 타이핑해주세요',
                '💪 손가락 위치를 다시 확인해보세요'
            ];

            // 오타가 연속으로 3개 이상일 때만 피드백
            const recentErrors = this.getRecentErrors();
            if (recentErrors >= 3) {
                const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
                this.addMessage(feedback, 'bot');
            }
        }
    }

    getRecentErrors() {
        // 최근 오타 개수 계산 (구현 필요)
        return 0;
    }
}

// 다국어 지원 시스템
class LanguageManager {
    constructor() {
        this.currentLanguage = 'ko';
        this.languages = {
            ko: {
                name: '한국어',
                flag: '🇰🇷',
                translations: {
                    'app.title': 'OpenTyping Pro',
                    'app.subtitle': '온라인 타자 연습 플랫폼',
                    'nav.dashboard': '대시보드',
                    'nav.practice': '연습 모드',
                    'nav.tournaments': '토너먼트',
                    'nav.events': '이벤트',
                    'nav.community': '커뮤니티',
                    'nav.analytics': '분석',
                    'chat.welcome': '안녕하세요! 👋 OpenTyping 코치입니다.',
                    'chat.subtitle': '타자 연습에 대해 무엇이든 물어보세요!',
                    'chat.posture': '올바른 자세 알려줘',
                    'chat.speed': '속도 향상 방법',
                    'chat.practice': '연습 시작하기',
                    'chat.analysis': '현재 실력 분석',
                    'chat.recommend': '추천 연습',
                    'chat.faq': '자주 묻는 질문',
                    'typing.start': '시작',
                    'typing.pause': '일시정지',
                    'typing.restart': '다시 시작',
                    'typing.accuracy': '정확도',
                    'typing.speed': '속도',
                    'typing.wpm': 'WPM',
                    'typing.errors': '오타',
                    'typing.time': '시간',
                    'user.profile': '사용자',
                    'theme.dark': '다크 모드',
                    'theme.light': '라이트 모드',
                    'welcome.title': 'OpenTyping Pro에 오신 것을 환영합니다!',
                    'welcome.description': '한컴 타자 스타일의 전문 타자 연습 플랫폼입니다.\n속도와 정확도를 동시에 향상시켜 보세요!',
                    'welcome.mobile': '모바일 완벽 지원',
                    'welcome.offline': '오프라인 사용 가능',
                    'welcome.analytics': '실시간 통계 분석'
                }
            },
            en: {
                name: 'English',
                flag: '🇺🇸',
                translations: {
                    'app.title': 'OpenTyping Pro',
                    'app.subtitle': 'Professional Typing Practice Platform',
                    'nav.dashboard': 'Dashboard',
                    'nav.practice': 'Practice Mode',
                    'nav.tournaments': 'Tournaments',
                    'nav.events': 'Events',
                    'nav.community': 'Community',
                    'nav.analytics': 'Analytics',
                    'chat.welcome': 'Hello! 👋 I\'m the OpenTyping coach.',
                    'chat.subtitle': 'Ask me anything about typing practice!',
                    'chat.posture': 'Show proper posture',
                    'chat.speed': 'Speed improvement tips',
                    'chat.practice': 'Start practice',
                    'chat.analysis': 'Current skill analysis',
                    'chat.recommend': 'Recommended practice',
                    'chat.faq': 'Frequently asked questions',
                    'typing.start': 'Start',
                    'typing.pause': 'Pause',
                    'typing.restart': 'Restart',
                    'typing.accuracy': 'Accuracy',
                    'typing.speed': 'Speed',
                    'typing.wpm': 'WPM',
                    'typing.errors': 'Errors',
                    'typing.time': 'Time',
                    'user.profile': 'User Profile',
                    'theme.dark': 'Dark Mode',
                    'theme.light': 'Light Mode',
                    'welcome.title': 'Welcome to OpenTyping Pro!',
                    'welcome.description': 'A professional typing practice platform.\nImprove your speed and accuracy simultaneously!',
                    'welcome.mobile': 'Perfect mobile support',
                    'welcome.offline': 'Available offline',
                    'welcome.analytics': 'Real-time analytics'
                }
            },
            ja: {
                name: '日本語',
                flag: '🇯🇵',
                translations: {
                    'app.title': 'OpenTyping Pro',
                    'app.subtitle': 'プロフェッショナルタイピング練習プラットフォーム',
                    'nav.dashboard': 'ダッシュボード',
                    'nav.practice': '練習モード',
                    'nav.tournaments': 'トーナメント',
                    'nav.events': 'イベント',
                    'nav.community': 'コミュニティ',
                    'nav.analytics': '分析',
                    'chat.welcome': 'こんにちは！👋 OpenTypingコーチです。',
                    'chat.subtitle': 'タイピング練習について何でも聞いてください！',
                    'chat.posture': '正しい姿勢を教えて',
                    'chat.speed': 'スピード向上のヒント',
                    'chat.practice': '練習を開始',
                    'chat.analysis': '現在のスキル分析',
                    'chat.recommend': '推奨練習',
                    'chat.faq': 'よくある質問',
                    'typing.start': '開始',
                    'typing.pause': '一時停止',
                    'typing.restart': '再開',
                    'typing.accuracy': '正確性',
                    'typing.speed': 'スピード',
                    'typing.wpm': 'WPM',
                    'typing.errors': 'エラー',
                    'typing.time': '時間',
                    'user.profile': 'ユーザープロファイル',
                    'theme.dark': 'ダークモード',
                    'theme.light': 'ライトモード',
                    'welcome.title': 'OpenTyping Proへようこそ！',
                    'welcome.description': 'プロフェッショナルタイピング練習プラットフォームです。\n速度と正確性を同時に向上させましょう！',
                    'welcome.mobile': '完璧なモバイル対応',
                    'welcome.offline': 'オフラインで利用可能',
                    'welcome.analytics': 'リアルタイム分析'
                }
            },
            zh: {
                name: '中文',
                flag: '🇨🇳',
                translations: {
                    'app.title': 'OpenTyping Pro',
                    'app.subtitle': '专业打字练习平台',
                    'nav.dashboard': '仪表板',
                    'nav.practice': '练习模式',
                    'nav.tournaments': '锦标赛',
                    'nav.events': '活动',
                    'nav.community': '社区',
                    'nav.analytics': '分析',
                    'chat.welcome': '你好！👋 我是OpenTyping教练。',
                    'chat.subtitle': '关于打字练习的任何问题都可以问我！',
                    'chat.posture': '正确姿势指导',
                    'chat.speed': '速度提升技巧',
                    'chat.practice': '开始练习',
                    'chat.analysis': '当前技能分析',
                    'chat.recommend': '推荐练习',
                    'chat.faq': '常见问题',
                    'typing.start': '开始',
                    'typing.pause': '暂停',
                    'typing.restart': '重新开始',
                    'typing.accuracy': '准确度',
                    'typing.speed': '速度',
                    'typing.wpm': 'WPM',
                    'typing.errors': '错误',
                    'typing.time': '时间',
                    'user.profile': '用户资料',
                    'theme.dark': '深色模式',
                    'theme.light': '浅色模式',
                    'welcome.title': '欢迎来到OpenTyping Pro！',
                    'welcome.description': '专业打字练习平台。\n同时提高您的速度和准确度！',
                    'welcome.mobile': '完美移动端支持',
                    'welcome.offline': '可离线使用',
                    'welcome.analytics': '实时分析'
                }
            },
            vi: {
                name: 'Tiếng Việt',
                flag: '🇻🇳',
                translations: {
                    'app.title': 'OpenTyping Pro',
                    'app.subtitle': 'Nền tảng Luyện tập Gõ chuyên nghiệp',
                    'nav.dashboard': 'Bảng điều khiển',
                    'nav.practice': 'Chế độ Luyện tập',
                    'nav.tournaments': 'Giải đấu',
                    'nav.events': 'Sự kiện',
                    'nav.community': 'Cộng đồng',
                    'nav.analytics': 'Phân tích',
                    'chat.welcome': 'Xin chào! 👋 Tôi là huấn luyện viên OpenTyping.',
                    'chat.subtitle': 'Hỏi tôi bất cứ điều gì về luyện tập gõ!',
                    'chat.posture': 'Hướng dẫn tư thế đúng',
                    'chat.speed': 'Mẹo cải thiện tốc độ',
                    'chat.practice': 'Bắt đầu luyện tập',
                    'chat.analysis': 'Phân tích kỹ năng hiện tại',
                    'chat.recommend': 'Luyện tập được đề xuất',
                    'chat.faq': 'Câu hỏi thường gặp',
                    'typing.start': 'Bắt đầu',
                    'typing.pause': 'Tạm dừng',
                    'typing.restart': 'Bắt đầu lại',
                    'typing.accuracy': 'Độ chính xác',
                    'typing.speed': 'Tốc độ',
                    'typing.wpm': 'WPM',
                    'typing.errors': 'Lỗi',
                    'typing.time': 'Thời gian',
                    'user.profile': 'Hồ sơ người dùng',
                    'theme.dark': 'Chế độ tối',
                    'theme.light': 'Chế độ sáng',
                    'welcome.title': 'Chào mừng đến với OpenTyping Pro!',
                    'welcome.description': 'Nền tảng luyện tập gõ chuyên nghiệp.\nCải thiện tốc độ và độ chính xác cùng lúc!',
                    'welcome.mobile': 'Hỗ trợ di động hoàn hảo',
                    'welcome.offline': 'Có thể sử dụng ngoại tuyến',
                    'welcome.analytics': 'Phân tích thời gian thực'
                }
            },
            th: {
                name: 'ไทย',
                flag: '🇹🇭',
                translations: {
                    'app.title': 'OpenTyping Pro',
                    'app.subtitle': 'แพลตฟอร์มฝึกพิมพ์ดี้นมืออาชีพ',
                    'nav.dashboard': 'แดชบอร์ด',
                    'nav.practice': 'โหมดฝึก',
                    'nav.tournaments': 'ทัวร์นาเมนต์',
                    'nav.events': 'กิจกรรม',
                    'nav.community': 'ชุมชน',
                    'nav.analytics': 'การวิเคราะห์',
                    'chat.welcome': 'สวัสดี! 👋 ฉันเป็นโค้ช OpenTyping',
                    'chat.subtitle': 'ถามอะไรรก็ได้เกี่ยวกับการฝึกพิมพ์ดี้น!',
                    'chat.posture': 'สอนท่าที่ถูกต้อง',
                    'chat.speed': 'เคล็ดลับเพิ่มความเร็ว',
                    'chat.practice': 'เริ่มฝึก',
                    'chat.analysis': 'วิเคราะห์ทักษะะปัจจุบัน',
                    'chat.recommend': 'แนะนำการฝึก',
                    'chat.faq': 'คำถามที่พบบ่อย',
                    'typing.start': 'เริ่ม',
                    'typing.pause': 'หยุดชั่วคราว',
                    'typing.restart': 'เริ่มใหม่',
                    'typing.accuracy': 'ความแม่นยำ',
                    'typing.speed': 'ความเร็ว',
                    'typing.wpm': 'WPM',
                    'typing.errors': 'ข้อผิดพลาด',
                    'typing.time': 'เวลา',
                    'user.profile': 'โปรไฟล์ผู้ใช้',
                    'theme.dark': 'โหมดมืด',
                    'theme.light': 'โหมดสว่าง',
                    'welcome.title': 'ยินดีต้อนรับสู่ OpenTyping Pro!',
                    'welcome.description': 'แพลตฟอร์มฝึกพิมพ์ดี้นมืออาชีพ\nพัฒนาความเร็วและความแม่นยำพร้อมกัน!',
                    'welcome.mobile': 'รองรับมือถืออย่างสมบูรณ์',
                    'welcome.offline': 'สามารถใช้งานออฟไลน์ได้',
                    'welcome.analytics': 'การวิเคราะห์แบบเรียลไทม์'
                }
            }
        };

        this.initializeLanguageSelector();
        this.loadSavedLanguage();
    }

    initializeLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        const dropdown = document.getElementById('languageDropdown');
        const currentLangSpan = document.getElementById('currentLanguage');

        if (!selector || !dropdown || !currentLangSpan) return;

        // 언어 목록 생성
        const languageHTML = Object.entries(this.languages).map(([code, lang]) => `
            <button onclick="languageManager.changeLanguage('${code}')"
                    class="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition text-left ${code === this.currentLanguage ? 'bg-indigo-50' : ''}">
                <span class="text-lg">${lang.flag}</span>
                <span class="font-medium ${code === this.currentLanguage ? 'text-indigo-600' : 'text-gray-700'}">${lang.name}</span>
                ${code === this.currentLanguage ? '<i class="fas fa-check text-indigo-600 ml-auto"></i>' : ''}
            </button>
        `).join('');

        dropdown.innerHTML = languageHTML;

        // 토글 이벤트
        selector.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    changeLanguage(languageCode) {
        if (!this.languages[languageCode]) return;

        this.currentLanguage = languageCode;

        // UI 업데이트
        this.updateUI();

        // 로컬 저장
        localStorage.setItem('selectedLanguage', languageCode);

        // 드롭다운 닫기
        document.getElementById('languageDropdown').classList.add('hidden');

        // 챗봇 언어 변경
        if (window.chatBotManager) {
            chatBotManager.updateLanguage(languageCode);
        }

        console.log(`OpenTyping Pro: 언어 변경됨 - ${this.languages[languageCode].name}`);
    }

    updateUI() {
        const currentLangSpan = document.getElementById('currentLanguage');
        if (currentLangSpan) {
            currentLangSpan.textContent = this.languages[this.currentLanguage].name;
        }

        // 모든 텍스트 요소 업데이트
        this.updateAllTexts();
    }

    updateAllTexts() {
        const translations = this.languages[this.currentLanguage].translations;

        // 앱 제목과 부제목
        this.updateTextIfExists('h1', translations['app.title']);
        this.updateTextIfExists('.text-gray-600', translations['app.subtitle']);

        // 네비게이션
        Object.entries({
            'nav.dashboard': '대시보드',
            'nav.practice': '연습 모드',
            'nav.tournaments': '토너먼트',
            'nav.events': '이벤트',
            'nav.community': '커뮤니티',
            'nav.analytics': '분석'
        }).forEach(([key, defaultText]) => {
            const navBtn = document.querySelector(`[onclick*="${key.split('.')[1]}"]`);
            if (navBtn) {
                const text = translations[key] || defaultText;
                if (navBtn.querySelector('i')) {
                    navBtn.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            node.textContent = text;
                        }
                    });
                }
            }
        });
    }

    updateTextIfExists(selector, text) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.children.length === 0) {
                el.textContent = text;
            }
        });
    }

    loadSavedLanguage() {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && this.languages[savedLanguage]) {
            this.changeLanguage(savedLanguage);
        }
    }

    translate(key, params = {}) {
        const translations = this.languages[this.currentLanguage].translations;
        let text = translations[key] || key;

        // 파라미터 치환
        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(`{{${param}}}`, value);
        });

        return text;
    }

    getLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return Object.entries(this.languages).map(([code, lang]) => ({
            code,
            name: lang.name,
            flag: lang.flag
        }));
    }
}

// 토너먼트 관리 시스템
class TournamentManager {
    constructor() {
        this.tournaments = this.initializeTournaments();
        this.activeTournaments = new Map();
        this.userTournaments = [];
    }

    initializeTournaments() {
        return {
            weekend: {
                id: 'weekend',
                name: '주말 스피드 마스터',
                description: '최고 속도를 겨루는 주말 특별 토너먼트',
                prize: 100000,
                firstPrize: 50000,
                maxParticipants: 500,
                currentParticipants: 256,
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 2시간 15분 후
                difficulty: 'hard',
                type: 'speed',
                status: 'active'
            },
            accuracy: {
                id: 'accuracy',
                name: '정확성 챔피언',
                description: '오타 없이 완벽한 타이핑 실력较量',
                prize: 80000,
                firstPrize: 40000,
                maxParticipants: 300,
                currentParticipants: 189,
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
                difficulty: 'medium',
                type: 'accuracy',
                status: 'active'
            },
            rookie: {
                id: 'rookie',
                name: '초보자 리그',
                description: '초보자들을 위한 친선 대회',
                prize: 50000,
                firstPrize: 25000,
                maxParticipants: 200,
                currentParticipants: 124,
                endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3시간 후
                difficulty: 'easy',
                type: 'beginner',
                status: 'active'
            }
        };
    }

    joinTournament(tournamentId) {
        const tournament = this.tournaments[tournamentId];
        if (!tournament) {
            this.showMessage('존재하지 않는 토너먼트입니다.');
            return;
        }

        if (tournament.status !== 'active') {
            this.showMessage('이미 종료된 토너먼트입니다.');
            return;
        }

        if (tournament.currentParticipants >= tournament.maxParticipants) {
            this.showMessage('참가 인원이 가득 찼습니다.');
            return;
        }

        if (this.userTournaments.includes(tournamentId)) {
            this.showMessage('이미 참가한 토너먼트입니다.');
            return;
        }

        // 참가 처리
        tournament.currentParticipants++;
        this.userTournaments.push(tournamentId);
        this.activeTournaments.set(tournamentId, {
            joinedAt: new Date(),
            progress: 0,
            bestScore: 0,
            attempts: 0
        });

        // 로컬 스토리지에 저장
        this.saveProgress();

        this.showMessage(`${tournament.name}에 성공적으로 참가했습니다!`);
        this.updateTournamentUI();

        // 토너먼트 시작 안내
        setTimeout(() => {
            this.showTournamentStartModal(tournament);
        }, 1000);
    }

    showTournamentStartModal(tournament) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform scale-0 animate-scale-in">
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-trophy text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">토너먼트 참가 성공!</h3>
                    <p class="text-gray-600 mb-6">${tournament.name}에 참가하셨습니다.</p>

                    <div class="bg-gray-50 rounded-xl p-4 mb-6">
                        <h4 class="font-semibold text-gray-800 mb-2">토너먼트 정보</h4>
                        <div class="space-y-2 text-sm text-gray-600">
                            <div class="flex justify-between">
                                <span>참가자 수:</span>
                                <span class="font-semibold">${tournament.currentParticipants}/${tournament.maxParticipants}명</span>
                            </div>
                            <div class="flex justify-between">
                                <span>남은 시간:</span>
                                <span class="font-semibold">${this.formatTimeRemaining(tournament.endTime)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>1위 상금:</span>
                                <span class="font-semibold text-green-600">${tournament.firstPrize.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-3">
                        <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
                            나중에
                        </button>
                        <button onclick="tournamentManager.startTournament('${tournament.id}'); this.closest('.fixed').remove();" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                            바로 시작
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => {
            modal.querySelector('.animate-scale-in').style.transform = 'scale(1)';
        }, 100);
    }

    startTournament(tournamentId) {
        const tournament = this.tournaments[tournamentId];
        if (!tournament) return;

        // 연습 모드로 이동하여 토너먼트 시작
        showSection('practice');

        // 토너먼트 모드로 설정
        setTimeout(() => {
            if (typeof app !== 'undefined' && app.startTournamentMode) {
                app.startTournamentMode(tournamentId, tournament);
            }
        }, 500);
    }

    submitTournamentScore(tournamentId, wpm, accuracy, errors) {
        const tournamentData = this.activeTournaments.get(tournamentId);
        if (!tournamentData) return;

        tournamentData.attempts++;
        const score = this.calculateTournamentScore(wpm, accuracy, errors, tournamentId);

        if (score > tournamentData.bestScore) {
            tournamentData.bestScore = score;
            tournamentData.progress = Math.min(100, (score / 1000) * 100); // 간단한 진행률 계산
        }

        this.saveProgress();
        this.updateTournamentUI();

        // 결과 표시
        this.showTournamentResult(tournamentId, score, wpm, accuracy);
    }

    calculateTournamentScore(wpm, accuracy, errors, tournamentId) {
        const tournament = this.tournaments[tournamentId];
        let baseScore = wpm * 10; // 기본 점수

        // 정확도 보너스
        baseScore *= (accuracy / 100);

        // 토너먼트 타입별 보너스
        switch (tournament.type) {
            case 'speed':
                baseScore *= 1.5;
                break;
            case 'accuracy':
                baseScore *= (accuracy / 95); // 정확도가 높을수록 더 많은 보너스
                break;
            case 'beginner':
                baseScore *= 1.2;
                break;
        }

        // 오류 페널티
        baseScore = Math.max(0, baseScore - (errors * 50));

        return Math.round(baseScore);
    }

    showTournamentResult(tournamentId, score, wpm, accuracy) {
        const tournament = this.tournaments[tournamentId];
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <div class="text-center">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-star text-indigo-600 text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">토너먼트 결과!</h3>
                    <div class="bg-gray-50 rounded-xl p-4 mb-6">
                        <div class="text-3xl font-bold text-indigo-600 mb-2">${score.toLocaleString()}점</div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div class="text-gray-600">속도</div>
                                <div class="font-semibold">${wpm} WPM</div>
                            </div>
                            <div>
                                <div class="text-gray-600">정확도</div>
                                <div class="font-semibold">${accuracy}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 rounded-xl p-4 mb-6">
                        <p class="text-blue-800 text-sm">현재 ${tournament.currentParticipants}명 중 랭킹을 계산 중입니다...</p>
                    </div>

                    <button onclick="this.closest('.fixed').remove()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                        확인
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    formatTimeRemaining(endTime) {
        const now = new Date();
        const remaining = endTime - now;

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        } else {
            return `${minutes}분`;
        }
    }

    updateTournamentUI() {
        // 참가 버튼 업데이트
        Object.keys(this.tournaments).forEach(tournamentId => {
            const tournament = this.tournaments[tournamentId];
            const isJoined = this.userTournaments.includes(tournamentId);

            // 참가 버튼 찾기
            const buttons = document.querySelectorAll(`[onclick="joinTournament('${tournamentId}')"]`);
            buttons.forEach(button => {
                if (isJoined) {
                    button.textContent = '참가 완료';
                    button.classList.add('bg-gray-400', 'cursor-not-allowed');
                    button.classList.remove('bg-white', 'text-orange-500');
                    button.disabled = true;
                }
            });
        });
    }

    saveProgress() {
        const data = {
            userTournaments: this.userTournaments,
            activeTournaments: Array.from(this.activeTournaments.entries()),
            tournaments: this.tournaments
        };
        localStorage.setItem('tournamentData', JSON.stringify(data));
    }

    loadProgress() {
        const saved = localStorage.getItem('tournamentData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userTournaments = data.userTournaments || [];
                this.activeTournaments = new Map(data.activeTournaments || []);
                this.tournaments = data.tournaments || this.tournaments;
                this.updateTournamentUI();
            } catch (e) {
                console.error('Failed to load tournament data:', e);
            }
        }
    }

    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 이벤트 관리 시스템
class EventManager {
    constructor() {
        this.events = this.initializeEvents();
        this.userEvents = [];
        this.eventProgress = new Map();
    }

    initializeEvents() {
        return {
            yearEndChallenge: {
                id: 'yearEndChallenge',
                name: '연말 챌린지',
                description: '10일간 매일 미션 완료하고 특별 보상 받기!',
                rewards: ['골드 배지', '500 포인트', '한정 티켓', 'VIP 1일권'],
                duration: 10,
                endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // 5일 12시간 후
                type: 'daily',
                difficulty: 'medium',
                status: 'active',
                tasks: [
                    { id: 'day1', name: '첫날 도전', description: '기본 연습 완료하기', completed: false },
                    { id: 'day2', name: '속도 도전', description: '60 WPM 달성하기', completed: false },
                    { id: 'day3', name: '정확성 도전', description: '95% 정확도 달성하기', completed: false },
                    { id: 'day4', name: '장문 도전', description: '5분 연속 타이핑하기', completed: false },
                    { id: 'day5', name: '복습 도전', description: '모든 과정 복습하기', completed: false },
                    { id: 'day6', name: '심화 도전', description: '숫자 타이핑 연습하기', completed: false },
                    { id: 'day7', name: '특수문자 도전', description: '특수문자 연습하기', completed: false },
                    { id: 'day8', name: '영문 도전', description: '영문 단어 연습하기', completed: false },
                    { id: 'day9', name: '한글 도전', description: '한글 문장 연습하기', completed: false },
                    { id: 'day10', name: '최종 도전', description: '최고 기록 경신하기', completed: false }
                ]
            },
            speedChallenge: {
                id: 'speedChallenge',
                name: '속도의 신 챌린지',
                description: '속도의 한계를 넘어서세요!',
                rewards: ['속도 마스터 칭호', '1000 포인트', '레어 아이템'],
                duration: 3,
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 3일 8시간 후
                type: 'achievement',
                difficulty: 'hard',
                status: 'active',
                tasks: [
                    { id: 'speed1', name: '초급 속도', description: '40 WPM 달성', completed: false, target: 40 },
                    { id: 'speed2', name: '중급 속도', description: '60 WPM 달성', completed: false, target: 60 },
                    { id: 'speed3', name: '고급 속도', description: '80 WPM 달성', completed: false, target: 80 },
                    { id: 'speed4', name: '전문가 속도', description: '100 WPM 달성', completed: false, target: 100 },
                    { id: 'speed5', name: '레전드 속도', description: '120 WPM 달성', completed: false, target: 120 }
                ]
            },
            accuracyMaster: {
                id: 'accuracyMaster',
                name: '정확성 마스터',
                description: '완벽한 타이핑 실력을 증명하세요!',
                rewards: ['정확성 마스터 칭호', '750 포인트', '정확성 강화 아이템'],
                duration: 7,
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
                type: 'achievement',
                difficulty: 'medium',
                status: 'active',
                tasks: [
                    { id: 'acc1', name: '기본 정확성', description: '90% 정확도 달성', completed: false, target: 90 },
                    { id: 'acc2', name: '중급 정확성', description: '95% 정확도 달성', completed: false, target: 95 },
                    { id: 'acc3', name: '고급 정확성', description: '98% 정확도 달성', completed: false, target: 98 },
                    { id: 'acc4', name: '완벽 정확성', description: '100% 정확도 달성', completed: false, target: 100 }
                ]
            }
        };
    }

    joinEvent(eventId) {
        const event = this.events[eventId];
        if (!event) {
            this.showMessage('존재하지 않는 이벤트입니다.');
            return;
        }

        if (event.status !== 'active') {
            this.showMessage('이미 종료된 이벤트입니다.');
            return;
        }

        if (this.userEvents.includes(eventId)) {
            this.showMessage('이미 참여한 이벤트입니다.');
            return;
        }

        // 참여 처리
        this.userEvents.push(eventId);
        this.eventProgress.set(eventId, {
            joinedAt: new Date(),
            completedTasks: [],
            overallProgress: 0,
            rewardsClaimed: false
        });

        // 로컬 스토리지에 저장
        this.saveProgress();

        this.showMessage(`${event.name}에 참여했습니다!`);
        this.updateEventUI();

        // 이벤트 상세 모달 표시
        setTimeout(() => {
            this.showEventDetailModal(event);
        }, 1000);
    }

    showEventDetailModal(event) {
        const progress = this.eventProgress.get(event.id);
        const completedCount = progress ? progress.completedTasks.length : 0;
        const progressPercentage = (completedCount / event.tasks.length) * 100;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-calendar-star text-white text-3xl"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-2">${event.name}</h3>
                    <p class="text-gray-600">${event.description}</p>
                </div>

                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                        <h4 class="font-semibold text-gray-800 mb-2">보상</h4>
                        <div class="space-y-1">
                            ${event.rewards.map(reward => `
                                <div class="flex items-center text-sm">
                                    <i class="fas fa-gift text-purple-500 mr-2"></i>
                                    <span>${reward}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                        <h4 class="font-semibold text-gray-800 mb-2">진행 정보</h4>
                        <div class="space-y-1 text-sm">
                            <div class="flex justify-between">
                                <span>남은 시간:</span>
                                <span class="font-semibold">${this.formatTimeRemaining(event.endTime)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>진행률:</span>
                                <span class="font-semibold">${completedCount}/${event.tasks.length} 완료</span>
                            </div>
                            <div class="progress-bar h-2 mt-2">
                                <div class="progress-fill bg-gradient-to-r from-purple-500 to-pink-500" style="width: ${progressPercentage}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <h4 class="font-semibold text-gray-800 mb-3">미션 목록</h4>
                    <div class="space-y-2 max-h-60 overflow-y-auto">
                        ${event.tasks.map((task, index) => {
                            const isCompleted = progress && progress.completedTasks.includes(task.id);
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isCompleted ? 'opacity-75' : ''}">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 ${isCompleted ? 'bg-green-100' : 'bg-gray-200'} rounded-full flex items-center justify-center">
                                            ${isCompleted ?
                                                '<i class="fas fa-check text-green-600 text-xs"></i>' :
                                                `<span class="text-xs font-semibold text-gray-600">${index + 1}</span>`
                                            }
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-800 ${isCompleted ? 'line-through' : ''}">${task.name}</div>
                                            <div class="text-sm text-gray-600">${task.description}</div>
                                        </div>
                                    </div>
                                    ${isCompleted ?
                                        '<span class="text-green-600 text-sm font-semibold">완료</span>' :
                                        '<span class="text-gray-400 text-sm">미완료</span>'
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
                        닫기
                    </button>
                    ${completedCount === event.tasks.length && !progress?.rewardsClaimed ?
                        `<button onclick="eventManager.claimRewards('${event.id}'); this.closest('.fixed').remove();" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                            보상 받기
                        </button>` :
                        `<button onclick="showSection('practice'); this.closest('.fixed').remove();" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                            도전하기
                        </button>`
                    }
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    completeTask(eventId, taskId, performanceData = {}) {
        const event = this.events[eventId];
        const progress = this.eventProgress.get(eventId);

        if (!event || !progress) return;

        const task = event.tasks.find(t => t.id === taskId);
        if (!task || progress.completedTasks.includes(taskId)) return;

        // 과제 완료 조건 확인
        let isCompleted = false;

        if (task.target && performanceData.wpm) {
            // 속도 관련 과제
            isCompleted = performanceData.wpm >= task.target;
        } else if (task.target && performanceData.accuracy) {
            // 정확도 관련 과제
            isCompleted = performanceData.accuracy >= task.target;
        } else if (taskId.includes('day')) {
            // 일일 과제 - 기본 연습 완료로 처리
            isCompleted = performanceData.duration >= 300; // 5분 이상 연습
        } else {
            // 기타 과제
            isCompleted = true;
        }

        if (isCompleted) {
            progress.completedTasks.push(taskId);
            progress.overallProgress = (progress.completedTasks.length / event.tasks.length) * 100;

            this.saveProgress();
            this.updateEventUI();

            // 과제 완료 알림
            this.showTaskCompleteNotification(task.name, event.name);
        }
    }

    claimRewards(eventId) {
        const event = this.events[eventId];
        const progress = this.eventProgress.get(eventId);

        if (!event || !progress || progress.rewardsClaimed) return;

        if (progress.completedTasks.length !== event.tasks.length) {
            this.showMessage('모든 미션을 완료해야 보상을 받을 수 있습니다.');
            return;
        }

        progress.rewardsClaimed = true;
        this.saveProgress();

        // 보상 지급 모달
        this.showRewardClaimModal(event);
    }

    showRewardClaimModal(event) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <i class="fas fa-trophy text-white text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">축하합니다!</h3>
                <p class="text-gray-600 mb-6">${event.name}의 모든 미션을 완료했습니다!</p>

                <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
                    <h4 class="font-semibold text-gray-800 mb-3">받은 보상</h4>
                    <div class="space-y-2">
                        ${event.rewards.map(reward => `
                            <div class="flex items-center justify-between text-sm">
                                <span>${reward}</span>
                                <i class="fas fa-check-circle text-green-500"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button onclick="this.closest('.fixed').remove()" class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition">
                    확인
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showTaskCompleteNotification(taskName, eventName) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-check-circle text-2xl"></i>
                <div>
                    <div class="font-semibold">미션 완료!</div>
                    <div class="text-sm opacity-90">${taskName} - ${eventName}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    formatTimeRemaining(endTime) {
        const now = new Date();
        const remaining = endTime - now;

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}일 ${hours}시간`;
        } else if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        } else {
            return `${minutes}분`;
        }
    }

    updateEventUI() {
        // 이벤트 카드 업데이트
        Object.keys(this.events).forEach(eventId => {
            const event = this.events[eventId];
            const progress = this.eventProgress.get(eventId);
            const isJoined = this.userEvents.includes(eventId);

            // 이벤트 참여 버튼 찾기
            const buttons = document.querySelectorAll(`[onclick*="joinEvent('${eventId}')"]`);
            buttons.forEach(button => {
                if (isJoined) {
                    button.textContent = '참여 중';
                    button.classList.add('bg-green-500', 'text-white');
                    button.classList.remove('bg-indigo-600');
                    button.disabled = true;
                }
            });
        });
    }

    saveProgress() {
        const data = {
            userEvents: this.userEvents,
            eventProgress: Array.from(this.eventProgress.entries()),
            events: this.events
        };
        localStorage.setItem('eventData', JSON.stringify(data));
    }

    loadProgress() {
        const saved = localStorage.getItem('eventData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userEvents = data.userEvents || [];
                this.eventProgress = new Map(data.eventProgress || []);
                this.events = data.events || this.events;
                this.updateEventUI();
            } catch (e) {
                console.error('Failed to load event data:', e);
            }
        }
    }

    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 커뮤니티 관리 시스템
class CommunityManager {
    constructor() {
        this.posts = this.initializePosts();
        this.userPosts = [];
        this.comments = new Map();
        this.likes = new Map();
        this.currentUser = {
            id: 'user_' + Date.now(),
            name: '사용자',
            level: 1,
            avatar: 'U'
        };
    }

    initializePosts() {
        return [
            {
                id: 'post_1',
                title: '타자 속도 150 WPM 돌파 기념!',
                author: 'SpeedKing',
                authorLevel: 15,
                content: '3개월 동안 꾸준히 연습한 결과 드디어 150 WPM을 돌파했습니다. 처음에는 60 WPM도 어려웠는데, 매일 30분씩 꾸준히 한 결과가 크네요! 팁을 공유하자면...',
                category: 'achievement',
                likes: 234,
                comments: 45,
                views: 1250,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
                isLiked: false,
                isHot: true
            },
            {
                id: 'post_2',
                title: '정확도 향상 팁 공유합니다',
                author: 'AccuracyPro',
                authorLevel: 12,
                content: '제가 정확도 98%를 유지하는 비법을 공유해드릴게요. 가장 중요한 것은 손목의 각도와 키보드 위치입니다...',
                category: 'tips',
                likes: 156,
                comments: 23,
                views: 890,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
                isLiked: false,
                isHot: false
            },
            {
                id: 'post_3',
                title: '새로운 연습 방법 제안합니다',
                author: 'PracticeMaster',
                authorLevel: 8,
                content: '기존의 연습 방법에 지친 분들을 위해 새로운 접근법을 제안합니다. 게임처럼 즐기면서 실력을 향상시킬 수 있는 방법...',
                category: 'discussion',
                likes: 89,
                comments: 34,
                views: 567,
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8시간 전
                isLiked: false,
                isHot: false
            },
            {
                id: 'post_4',
                title: '토너먼트 같이 참가하실 분?',
                author: 'TeamPlayer',
                authorLevel: 6,
                content: '이번 주말 토너먼트에 같이 참가하실 팀원을 구합니다. 실력은 상관없고, 함께 즐겁게 참여할 분이면 좋겠어요!',
                category: 'recruit',
                likes: 67,
                comments: 18,
                views: 432,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12시간 전
                isLiked: false,
                isHot: false
            },
            {
                id: 'post_5',
                title: '초보자분들을 위한 기본 자세 가이드',
                author: 'BeginnerHelper',
                authorLevel: 20,
                content: '초보자분들이 가장 많이 하는 실수와 올바른 타이핑 자세를 사진과 함께 설명해드리겠습니다...',
                category: 'guide',
                likes: 312,
                comments: 67,
                views: 2100,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
                isLiked: false,
                isHot: true
            }
        ];
    }

    createPost(title, content, category = 'general') {
        const newPost = {
            id: 'post_' + Date.now(),
            title: title,
            author: this.currentUser.name,
            authorLevel: this.currentUser.level,
            content: content,
            category: category,
            likes: 0,
            comments: 0,
            views: 0,
            createdAt: new Date(),
            isLiked: false,
            isHot: false
        };

        this.posts.unshift(newPost);
        this.userPosts.push(newPost.id);
        this.saveCommunityData();

        this.showMessage('게시글이 작성되었습니다!');
        this.refreshCommunityUI();

        return newPost;
    }

    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const userLikes = this.likes.get(this.currentUser.id) || [];

        if (userLikes.includes(postId)) {
            // 좋아요 취소
            post.likes--;
            const index = userLikes.indexOf(postId);
            userLikes.splice(index, 1);
            post.isLiked = false;
        } else {
            // 좋아요 추가
            post.likes++;
            userLikes.push(postId);
            post.isLiked = true;

            // 인기 게시글 판정
            if (post.likes > 200) {
                post.isHot = true;
            }
        }

        this.likes.set(this.currentUser.id, userLikes);
        this.saveCommunityData();
        this.updatePostUI(postId);
    }

    addComment(postId, content) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const newComment = {
            id: 'comment_' + Date.now(),
            postId: postId,
            author: this.currentUser.name,
            authorLevel: this.currentUser.level,
            content: content,
            createdAt: new Date(),
            likes: 0
        };

        if (!this.comments.has(postId)) {
            this.comments.set(postId, []);
        }

        this.comments.get(postId).push(newComment);
        post.comments++;
        this.saveCommunityData();

        this.showMessage('댓글이 작성되었습니다!');
        return newComment;
    }

    showCreatePostModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-800">게시글 작성</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
                        <input type="text" id="postTitle" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="제목을 입력하세요..." maxlength="100">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                        <select id="postCategory" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="general">일반</option>
                            <option value="achievement">성과 공유</option>
                            <option value="tips">꿀팁 공유</option>
                            <option value="discussion">토론</option>
                            <option value="recruit">팀원 모집</option>
                            <option value="guide">가이드</option>
                            <option value="question">질문</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">내용</label>
                        <textarea id="postContent" rows="8" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="내용을 입력하세요..." maxlength="2000"></textarea>
                        <div class="text-right text-sm text-gray-500 mt-1">
                            <span id="contentLength">0</span>/2000자
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <div class="flex items-center space-x-4">
                            <label class="flex items-center">
                                <input type="checkbox" id="allowComments" checked class="mr-2">
                                <span>댓글 허용</span>
                            </label>
                        </div>
                        <div>
                            <span class="text-xs">마크다운 형식 지원</span>
                        </div>
                    </div>
                </div>

                <div class="flex space-x-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
                        취소
                    </button>
                    <button onclick="communityManager.submitPost()" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                        작성하기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 글자 수 카운터
        const contentTextarea = modal.querySelector('#postContent');
        const lengthCounter = modal.querySelector('#contentLength');
        contentTextarea.addEventListener('input', () => {
            lengthCounter.textContent = contentTextarea.value.length;
        });
    }

    submitPost() {
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const category = document.getElementById('postCategory').value;

        if (!title || !content) {
            this.showMessage('제목과 내용을 모두 입력해주세요.');
            return;
        }

        if (title.length < 5) {
            this.showMessage('제목은 최소 5자 이상이어야 합니다.');
            return;
        }

        if (content.length < 20) {
            this.showMessage('내용은 최소 20자 이상이어야 합니다.');
            return;
        }

        const newPost = this.createPost(title, content, category);

        // 모달 닫기
        document.querySelector('.fixed').remove();

        // 작성한 게시글로 이동
        setTimeout(() => {
            this.showPostDetail(newPost.id);
        }, 500);
    }

    showPostDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // 조회수 증가
        post.views++;
        this.saveCommunityData();

        const comments = this.comments.get(postId) || [];

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">${post.title}</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                ${post.author.charAt(0)}
                            </div>
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="font-semibold">${post.author}</span>
                                    <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold">Lv.${post.authorLevel}</span>
                                    ${post.isHot ? '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">🔥 인기</span>' : ''}
                                </div>
                                <div class="text-sm text-gray-500">${this.formatTime(post.createdAt)}</div>
                            </div>
                        </div>

                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                            <span><i class="fas fa-eye mr-1"></i>${post.views}</span>
                            <span><i class="fas fa-heart mr-1"></i>${post.likes}</span>
                            <span><i class="fas fa-comment mr-1"></i>${comments.length}</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6">
                    <div class="prose max-w-none mb-6">
                        <p class="text-gray-700 whitespace-pre-wrap">${post.content}</p>
                    </div>

                    <div class="flex items-center space-x-4 mb-6 pb-6 border-b">
                        <button onclick="communityManager.likePost('${postId}'); communityManager.updatePostUI('${postId}');" class="flex items-center space-x-2 px-4 py-2 rounded-lg ${post.isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-100 hover:text-red-600 transition">
                            <i class="fas fa-heart"></i>
                            <span>${post.likes}</span>
                        </button>
                        <button class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                            <i class="fas fa-share"></i>
                            <span>공유</span>
                        </button>
                        <button class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                            <i class="fas fa-bookmark"></i>
                            <span>저장</span>
                        </button>
                    </div>

                    <div class="mb-6">
                        <h4 class="font-semibold text-gray-800 mb-4">댓글 (${comments.length})</h4>

                        <div class="mb-4">
                            <textarea id="commentContent" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="댓글을 입력하세요..." maxlength="500"></textarea>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-sm text-gray-500">
                                    <span id="commentLength">0</span>/500자
                                </span>
                                <button onclick="communityManager.submitComment('${postId}')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                                    댓글 작성
                                </button>
                            </div>
                        </div>

                        <div class="space-y-4">
                            ${comments.map(comment => `
                                <div class="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                                    <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        ${comment.author.charAt(0)}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center space-x-2 mb-1">
                                            <span class="font-semibold">${comment.author}</span>
                                            <span class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Lv.${comment.authorLevel}</span>
                                            <span class="text-sm text-gray-500">${this.formatTime(comment.createdAt)}</span>
                                        </div>
                                        <p class="text-gray-700">${comment.content}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 댓글 글자 수 카운터
        const commentTextarea = modal.querySelector('#commentContent');
        const lengthCounter = modal.querySelector('#commentLength');
        commentTextarea.addEventListener('input', () => {
            lengthCounter.textContent = commentTextarea.value.length;
        });
    }

    submitComment(postId) {
        const content = document.getElementById('commentContent').value.trim();

        if (!content) {
            this.showMessage('댓글 내용을 입력해주세요.');
            return;
        }

        if (content.length < 5) {
            this.showMessage('댓글은 최소 5자 이상이어야 합니다.');
            return;
        }

        const newComment = this.addComment(postId, content);

        // 댓글 입력창 초기화
        document.getElementById('commentContent').value = '';
        document.getElementById('commentLength').textContent = '0';

        // 댓글 목록 새로고침
        setTimeout(() => {
            this.showPostDetail(postId);
        }, 100);
    }

    updatePostUI(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // 메인 커뮤니티 페이지의 게시글 카드 업데이트
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            const likeButton = postCard.querySelector('.like-button');
            const likeCount = postCard.querySelector('.like-count');

            if (likeButton && likeCount) {
                likeButton.classList.toggle('text-red-500', post.isLiked);
                likeButton.classList.toggle('text-gray-500', !post.isLiked);
                likeCount.textContent = post.likes;
            }
        }
    }

    refreshCommunityUI() {
        // 커뮤니티 섹션 새로고침
        showSection('community');
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString('ko-KR');
    }

    saveCommunityData() {
        const data = {
            posts: this.posts,
            userPosts: this.userPosts,
            comments: Array.from(this.comments.entries()),
            likes: Array.from(this.likes.entries())
        };
        localStorage.setItem('communityData', JSON.stringify(data));
    }

    loadCommunityData() {
        const saved = localStorage.getItem('communityData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.posts = data.posts || this.posts;
                this.userPosts = data.userPosts || [];
                this.comments = new Map(data.comments || []);
                this.likes = new Map(data.likes || []);
            } catch (e) {
                console.error('Failed to load community data:', e);
            }
        }
    }

    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 전역 인스턴스
let languageManager;
let tournamentManager;
let eventManager;
let communityManager;

// 언어 관련 전역 함수
function changeLanguage(languageCode) {
    if (languageManager) {
        languageManager.changeLanguage(languageCode);
    }
}

// 전역 챗봇 인스턴스
let chatBotManager;

// 챗봇 관련 전역 함수
function toggleChatBot() {
    if (chatBotManager) {
        chatBotManager.toggleChatBot();
    }
}

// 이벤트 관련 전역 함수
function joinEvent(eventId) {
    if (eventManager) {
        eventManager.joinEvent(eventId);
    } else {
        alert('이벤트 매니저가 초기화되지 않았습니다.');
    }
}

// 커뮤니티 관련 전역 함수
function createPost() {
    if (communityManager) {
        communityManager.showCreatePostModal();
    } else {
        alert('커뮤니티 매니저가 초기화되지 않았습니다.');
    }
}

function likePost(postId) {
    if (communityManager) {
        communityManager.likePost(postId);
    } else {
        alert('커뮤니티 매니저가 초기화되지 않았습니다.');
    }
}

// DOM 로드 시 모든 시스템 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 다국어 시스템 초기화
    languageManager = new LanguageManager();

    // 토너먼트 시스템 초기화
    tournamentManager = new TournamentManager();
    tournamentManager.loadProgress();

    // 이벤트 시스템 초기화
    eventManager = new EventManager();
    eventManager.loadProgress();

    // 커뮤니티 시스템 초기화
    communityManager = new CommunityManager();
    communityManager.loadCommunityData();

    // 챗봇 초기화
    chatBotManager = new ChatBotManager();

    // 주기적으로 타이핑 팁 보여주기
    setInterval(() => {
        if (chatBotManager && Math.random() < 0.1) { // 10% 확률로 팁 보여주기
            chatBotManager.showTypingTip();
        }
    }, 60000); // 1분마다 확인
});