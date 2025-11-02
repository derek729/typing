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
    if (app && typeof app.joinTournament === 'function') {
        app.joinTournament(tournamentId);
    } else {
        alert('토너먼트 참가 기능은 준비중입니다.');
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