// OpenTyping Pro - Clean Korean Version
// Pure typing practice functionality

console.log('OpenTyping Pro: Clean script loading...');

// 전역 변수
let app = null;
let typingEngine = null;

// 한컴 스타일 타이핑 연습 텍스트
const TYPING_PRACTICE_TEXTS = {
    basic: [
        '가 나 다 라 마 바 사',
        '마 사 다 라 나 가',
        '가을 나라 다라 발발',
        '나랄 발발 다나 가나',
        '가나 발 다 발 나랄',
        '가발 발나 발 다나 발',
        '나랄 발 나 발 다라 발'
    ],
    speed: [
        '가나다라마바사아자차카타파하',
        '다람쥐쥐가바사아자차카',
        '가을 하늘 파란 구름',
        '컴퓨터 프로그래밍 코드',
        '한글 타자 연습 프로그램',
        '키보드 타이핑 속도 훈련',
        '정확한 손가락 위치 중요',
        '규칙적인 연습이 실력 향상'
    ],
    accuracy: [
        '갸낟다라마밧싸',
        '뿌사닿라나가',
        '뻐글뿌라닿다',
        '뼁뽈뿌나가',
        '뿌빠뿜뿐뿤',
        '뻐글뿐뿜나',
        '뿜뿜빠뿌나'
    ],
    numbers: [
        '1234567890',
        '010-1234-5678',
        '2023년 12월 25일',
        '3.141592653589',
        '1000000원',
        '02-123-4567',
        '서울특별시 강남구',
        '대한민국 2024년'
    ],
    programming: [
        'function startPractice() {',
        'const typingText = "Hello World";',
        'if (condition) { console.log("test"); }',
        'let result = data.filter(item => item.active);',
        'import React from "react";',
        'class TypingPractice extends Component {',
        'const [state, setState] = useState();',
        'export default function App() { return <div>App</div>; }'
    ]
};

// 타이핑 엔진 클래스
class SimpleTypingEngine {
    constructor() {
        this.currentText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.errors = 0;
        this.correctChars = 0;
        this.isActive = false;
        this.timerInterval = null;
    }

    initializeSession(category) {
        const texts = TYPING_PRACTICE_TEXTS[category] || TYPING_PRACTICE_TEXTS.basic;
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        this.currentIndex = 0;
        this.startTime = null;
        this.errors = 0;
        this.correctChars = 0;
        this.isActive = false;

        this.updateDisplay();
        this.updateStats();
    }

    startSession() {
        this.startTime = Date.now();
        this.isActive = true;
        const input = document.getElementById('practiceInput');
        if (input) {
            input.disabled = false;
            input.focus();
        }

        // 타이머 시작
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 100);
    }

    updateTimer() {
        if (this.startTime && this.isActive) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    handleInput(input) {
        if (!this.isActive || !this.startTime) return;

        const currentChar = this.currentText[this.currentIndex];
        const typedChar = input[input.length - 1];

        if (typedChar === currentChar) {
            this.correctChars++;
            this.currentIndex++;
            this.showFeedback(true);
        } else if (typedChar) {
            this.errors++;
            this.showFeedback(false);
        }

        input.value = '';
        this.updateDisplay();
        this.updateStats();

        if (this.currentIndex >= this.currentText.length) {
            this.completeSession();
        }
    }

    showFeedback(isCorrect) {
        // 간단한 시각적 피드백
        const feedback = document.getElementById('typingFeedback');
        if (feedback) {
            feedback.textContent = isCorrect ? '✓' : '✗';
            feedback.style.color = isCorrect ? '#10b981' : '#ef4444';
            feedback.style.opacity = '1';
            setTimeout(() => {
                feedback.style.opacity = '0';
            }, 500);
        }
    }

    updateDisplay() {
        const display = document.getElementById('practiceText');
        if (!display) return;

        let html = '';
        for (let i = 0; i < this.currentText.length; i++) {
            if (i < this.currentIndex) {
                html += `<span style="color: #10b981; font-weight: bold;">${this.currentText[i]}</span>`;
            } else if (i === this.currentIndex) {
                html += `<span style="background: #fbbf24; color: #000; padding: 2px;">${this.currentText[i]}</span>`;
            } else {
                html += `<span>${this.currentText[i]}</span>`;
            }
        }
        display.innerHTML = html;
    }

    updateStats() {
        const wpmElement = document.getElementById('wpmDisplay');
        const accuracyElement = document.getElementById('accuracyDisplay');

        if (this.startTime && wpmElement) {
            const elapsed = (Date.now() - this.startTime) / 1000 / 60; // 분
            const wpm = Math.round((this.correctChars / 5) / elapsed) || 0;
            wpmElement.textContent = `WPM: ${wpm}`;
        }

        if (accuracyElement) {
            const totalTyped = this.correctChars + this.errors;
            const accuracy = totalTyped > 0 ? Math.round((this.correctChars / totalTyped) * 100) : 100;
            accuracyElement.textContent = `정확도: ${accuracy}%`;
        }
    }

    completeSession() {
        this.isActive = false;

        // 타이머 정지
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const elapsed = (Date.now() - this.startTime) / 1000 / 60;
        const wpm = Math.round((this.correctChars / 5) / elapsed);
        const accuracy = Math.round((this.correctChars / (this.correctChars + this.errors)) * 100);

        // 성공 메시지 표시
        this.showSuccessMessage(wpm, accuracy);

        // 잠시 후 새로운 텍스트로 재시작
        setTimeout(() => {
            this.initializeSession('basic');
        }, 3000);
    }

    showSuccessMessage(wpm, accuracy) {
        const message = document.createElement('div');
        message.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        message.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 class="text-xl font-bold text-green-600 mb-2">연습 완료!</h3>
                <p class="text-gray-700">속도: ${wpm} WPM</p>
                <p class="text-gray-700">정확도: ${accuracy}%</p>
                <button onclick="this.parentElement.parentElement.remove()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    확인
                </button>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
}

// 전역 함수
function showSection(sectionName) {
    console.log('OpenTyping Pro: 섹션 전환 -', sectionName);

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
    showSection('practice');

    if (typingEngine) {
        typingEngine.initializeSession(category);
    }
}

function startPracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 시작');
    if (typingEngine) {
        typingEngine.startSession();
    }
}

function quickStart(level) {
    console.log('OpenTyping Pro: 빠른 시작 -', level);
    const categoryMap = {
        'beginner': 'basic',
        'intermediate': 'speed',
        'advanced': 'accuracy',
        'expert': 'programming'
    };

    const category = categoryMap[level] || 'basic';
    showPracticeCategory(category);
    startPracticeSession();
}

function toggleTheme() {
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

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('OpenTyping Pro: Clean DOM 로드 완료');

    // 전역 함수 등록
    window.showSection = showSection;
    window.showPracticeCategory = showPracticeCategory;
    window.startPracticeSession = startPracticeSession;
    window.quickStart = quickStart;
    window.toggleTheme = toggleTheme;
    window.toggleMobileMenu = toggleMobileMenu;

    // 타이핑 엔진 초기화
    typingEngine = new SimpleTypingEngine();
    window.typingEngine = typingEngine;

    // 이벤트 리스너 설정
    setupEventListeners();

    // 기본 텍스트 설정
    typingEngine.initializeSession('basic');

    // 첫 화면은 연습 모드
    showSection('practice');

    console.log('OpenTyping Pro: Clean 초기화 완료');
});

function setupEventListeners() {
    // 연습 입력 처리
    const practiceInput = document.getElementById('practiceInput');
    if (practiceInput) {
        practiceInput.addEventListener('input', (e) => {
            if (typingEngine) {
                typingEngine.handleInput(e.target.value);
            }
        });
    }

    // 카테고리 버튼들
    document.querySelectorAll('[onclick*="showPracticeCategory"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const onclick = button.getAttribute('onclick');
            const match = onclick.match(/showPracticeCategory\(['"]([^'"]+)['"])/);
            if (match) {
                showPracticeCategory(match[1]);
            }
        });
    });
}

console.log('OpenTyping Pro Clean version ready!');