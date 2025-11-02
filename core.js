// OpenTyping Pro - Core Functionality
// Simple and reliable implementation

console.log('OpenTyping Pro: Core script loading...');

// 전역 변수 선언
let app = null;
let typingEngine = null;

// 기본 유틸리티 함수
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

function quickStart(level) {
    console.log('OpenTyping Pro: 빠른 시작 -', level);
    showSection('practice');

    // 연습 카테고리 표시
    const practiceArea = document.getElementById('practiceArea');
    const categoryCards = document.querySelectorAll('.practice-category-card');

    if (categoryCards) {
        categoryCards.forEach(card => card.classList.add('hidden'));
    }
    if (practiceArea) {
        practiceArea.classList.remove('hidden');
    }
}

function showPracticeCategory(category) {
    console.log('OpenTyping Pro: 연습 카테고리 -', category);
    showSection('practice');

    const practiceArea = document.getElementById('practiceArea');
    const categoryCards = document.querySelectorAll('.practice-category-card');

    if (categoryCards) {
        categoryCards.forEach(card => card.classList.add('hidden'));
    }
    if (practiceArea) {
        practiceArea.classList.remove('hidden');
    }
}

function startPracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 시작');
    const input = document.getElementById('practiceInput');
    if (input) {
        input.disabled = false;
        input.focus();
    }
}

function pausePracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 일시정지');
}

function restartPracticeSession() {
    console.log('OpenTyping Pro: 연습 세션 재시작');
    showSection('practice');
}

function joinTournament(tournamentId) {
    console.log('OpenTyping Pro: 토너먼트 참가 -', tournamentId);
    showSection('tournaments');
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
    console.log('OpenTyping Pro: 모바일 메뉴 토글');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

function closeModal() {
    console.log('OpenTyping Pro: 모달 닫기');
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
}

function nextLevel() {
    console.log('OpenTyping Pro: 다음 레벨');
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

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('OpenTyping Pro: Core DOM 로드 완료');

    // 전역 함수 등록
    window.showSection = showSection;
    window.quickStart = quickStart;
    window.showPracticeCategory = showPracticeCategory;
    window.startPracticeSession = startPracticeSession;
    window.pausePracticeSession = pausePracticeSession;
    window.restartPracticeSession = restartPracticeSession;
    window.joinTournament = joinTournament;
    window.toggleNotifications = toggleNotifications;
    window.toggleTheme = toggleTheme;
    window.showUserProfile = showUserProfile;
    window.toggleMobileMenu = toggleMobileMenu;
    window.closeModal = closeModal;
    window.nextLevel = nextLevel;

    console.log('OpenTyping Pro: Core 함수 등록 완료');

    // 기본 이벤트 리스너 설정
    setupEventListeners();

    // 첫 화면은 대시보드
    showSection('dashboard');
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모바일 메뉴
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // 연습 입력
    const practiceInput = document.getElementById('practiceInput');
    if (practiceInput) {
        practiceInput.addEventListener('input', handleTypingInput);
    }
}

// 타이핑 입력 처리
function handleTypingInput(event) {
    // 간단한 타이핑 피드백
    const value = event.target.value;
    const display = document.getElementById('practiceText');

    if (display && value.length > 0) {
        // 입력한 문자에 대해 간단한 시각적 피드백
        const chars = display.textContent.split('');
        const currentIndex = value.length - 1;

        if (currentIndex < chars.length) {
            // 정확한 입력 표시 (간단한 버전)
            display.innerHTML = chars.map((char, index) => {
                if (index < value.length) {
                    return `<span style="color: green; font-weight: bold;">${char}</span>`;
                } else if (index === value.length) {
                    return `<span style="background: yellow; color: black;">${char}</span>`;
                }
                return char;
            }).join('');
        }

        // 입력 필드 비우기
        event.target.value = '';
    }
}

// 콘솔 로그 (디버깅용)
if (typeof window !== 'undefined') {
    console.log('OpenTyping Pro Core initialized successfully!');
}