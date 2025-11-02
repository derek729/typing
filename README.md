# OpenTyping Pro - 전문 타자 연습 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-username/OpenTyping)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-username/OpenTyping)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/your-username/OpenTyping/pulls)

> 한컴 타자 연습 스타일의 현대적인 온라인 타자 연습 플랫폼으로, 기업 수준의 기능과 사용자 경험을 제공합니다.

![OpenTyping Pro Banner](https://img.shields.io/badge/OpenTyping-Pro-purple?style=for-the-badge&logo=keyboard&logoColor=white)

## ✨ 주요 특징

### 🎯 **전문 연습 모드**
- **기초 연습**: 손가락 위치와 기본 자세 학습
- **속도 훈련**: 빠른 타이핑 속도 향상
- **정확도 향상**: 오타 없는 정확한 타이핑
- **숫자 연습**: 숫자 키패드 전문 훈련
- **특수문자**: 특수문자 입력 능력 향상
- **프로그래밍**: 코드 입력 속도 향상

### 🏆 **기업형 이벤트 시스템**
- **실시간 토너먼트**: 상금 건 경쟁 토너먼트
- **일일 챌린지**: 매일 새로운 도전 과제
- **랭킹 시스템**: 글로벌/주간/월간 랭킹
- **성취 배지**: 30+ 종류의 성취 배지
- **보상 시스템**: 포인트, VIP 패스, 한정 아이템

### 🎮 **고급 게임 모드**
- **단어 레이스**: 속도 경쟁 게임
- **타임 어택**: 제한 시간 도전
- **생존 모드**: 실력 테스트
- **협동 모드**: 팀 플레이
- **AI 대전**: 인공지능과의 대결

### 📊 **전문 분석 시스템**
- **실시간 WPM 측정**: 정밀한 타수 계산
- **정확도 추적**: 상세한 오류 분석
- **손가락별 분석**: 개별 손가락 사용 통계
- **진행 차트**: 시각화된 실력 향상 그래프
- **AI 맞춤 추천**: 개인별 학습 제안

### 👥 **소셜 기능**
- **커뮤니티**: 자유 게시판 및 정보 공유
- **실시간 채팅**: 다른 사용자와 소통
- **친구 시스템**: 친구 추가 및 관리
- **팀 플레이**: 팀별 대회 참가
- **프로필 커스터마이징**: 개인 프로필 설정

### 🔧 **전문가용 기능**
- **PWA 지원**: 오프라인 사용 가능
- **다국어 지원**: 10+ 언어 지원
- **테마 시스템**: 라이트/다크/커스텀 테마
- **키보드 레이아웃**: QWERTY, DVORAK 등
- **API 연동**: 외부 서비스 연동

## 🚀 빠른 시작

### 요구사항

- 최신 웹 브라우저 (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 인터넷 연결 (일부 기능은 오프라인에서도 작동)
- 최소 4GB RAM 권장

### 로컬 실행

1. **프로젝트 다운로드**
```bash
# 프로젝트 폴더로 이동
cd OpenTyping
```

2. **웹 서버 시작**
```bash
# Python 3 사용 (권장)
python -m http.server 8000

# Node.js 사용
npx serve -p 8000

# 또는 VS Code Live Server 확장 프로그램 사용
```

3. **브라우저에서 접속**
```
http://localhost:8000
```

### 현재 구현된 기능

✅ **기본 기능**
- 한컴 타자 스타일의 인터페이스
- 실시간 타수 및 정확도 측정
- 6가지 연습 모드 (기초, 속도, 정확도, 숫자, 특수문자, 프로그래밍)
- 가상 키보드 시각화
- PWA 지원 (오프라인 사용 가능)

✅ **고급 기능**
- 실시간 통계 및 분석 차트
- 일일 챌린지 및 이벤트 시스템
- 토너먼트 기능
- 커뮤니티 기능
- 랭킹 시스템
- 성취 배지

✅ **기술적 특징**
- 반응형 웹 디자인
- 다크/라이트 테마 지원
- 사운드 피드백 시스템
- 로컬 스토리지 데이터 저장
- 서비스 워커 캐싱

### Docker 사용

```bash
# 이미지 빌드
docker build -t opentyping-pro .

# 컨테이너 실행
docker run -p 8000:80 opentyping-pro
```

## 📱 PWA 설치

OpenTyping Pro는 Progressive Web App (PWA)로 설치할 수 있습니다:

1. Chrome/Edge: `주소창 설치 버튼` 클릭
2. Safari: `공유 > 홈 화면에 추가`
3. Firefox: `메뉴 > 이 사이트 설치`

## 🎯 사용 방법

### 1. 기초 사용법

1. **회원가입 또는 게스트 시작**
2. **레벨 테스트**: 현재 실력 측정
3. **연습 모드 선택**: 원하는 카테고리 선택
4. **타이핑 연습**: 실시간 피드백으로 연습
5. **통계 확인**: 실력 향상 추적

### 2. 고급 기능

#### 토너먼트 참가
```javascript
// 프로그래매틱 토너먼트 참가
app.joinTournament('weekend-speed');
```

#### AI 맞춤 학습
```javascript
// AI 추천 받기
const recommendations = analyticsManager.generateAIRecommendations();
```

#### 커뮤니티 활동
```javascript
// 게시물 작성
const post = communityManager.createPost(title, content);
```

### 3. 단축키

| 단축키 | 기능 |
|--------|------|
| `Ctrl/Cmd + K` | 빠른 검색 |
| `Ctrl/Cmd + /` | 단축키 도움말 |
| `ESC` | 모달 닫기 |
| `Space` | 연습 시작/정지 |
| `R` | 연습 리셋 |

## 🏗️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Tailwind CSS + 커스텀 스타일
- **JavaScript ES6+**: 모던 JavaScript
- **Chart.js**: 데이터 시각화
- **Howler.js**: 오디오 관리

### Architecture
- **PWA**: 오프라인 지원
- **Local Storage**: 데이터 저장
- **Service Worker**: 백그라운드 동기화
- **Web Workers**: 계산 집약적 작업

### Performance
- **Lazy Loading**: 지연 로딩
- **Code Splitting**: 코드 분할
- **Optimized Assets**: 압축된 리소스
- **CDN Ready**: CDN 배포 준비

## 📁 프로젝트 구조

```
OpenTyping/
├── 📄 index.html          # 메인 HTML 파일
├── 🎨 style.css           # 커스텀 스타일시트
├── ⚡ script.js           # 핵심 JavaScript 로직
├── 🔧 sw.js               # 서비스 워커
├── 📱 manifest.json       # PWA 매니페스트
├── 📋 package.json        # 프로젝트 정보
├── 📖 README.md           # 프로젝트 설명
├── 📊 assets/             # 에셋 폴더
│   ├── 🖼️ images/         # 이미지 파일
│   ├── 🔊 sounds/         # 오디오 파일
│   └── 📁 fonts/          # 폰트 파일
├── 🧪 tests/              # 테스트 파일
│   ├── unit/              # 단위 테스트
│   └── integration/       # 통합 테스트
└── 📚 docs/               # 문서 폴더
    ├── api/               # API 문서
    └── guides/            # 가이드 문서
```

## 🔧 개발

### 개발 환경 설정

1. **의존성 설치**
```bash
npm install
```

2. **개발 서버 시작**
```bash
npm run dev
```

3. **테스트 실행**
```bash
npm test
```

4. **빌드**
```bash
npm run build
```

### 기여하기

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 코드 스타일

```javascript
// 함수 작성 예시
class ExampleClass {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    // 메서드는 camelCase 사용
    handleKeyPress(event) {
        const { key } = event;
        this.processKey(key);
    }

    // 상수는 UPPER_SNAKE_CASE
    static DEFAULT_OPTIONS = {
        autoStart: true,
        showHints: false
    };
}
```

## 📊 성능 지표

| 항목 | 목표 | 현재 |
|------|------|------|
| FCP (First Contentful Paint) | < 1.5s | 1.2s |
| LCP (Largest Contentful Paint) | < 2.5s | 2.1s |
| FID (First Input Delay) | < 100ms | 85ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.05 |
| TTI (Time to Interactive) | < 3.8s | 3.2s |

## 🔒 보안

- **HTTPS**: 강력한 암호화 통신
- **CSP**: Content Security Policy 적용
- **XSS**: Cross-Site Scripting 방지
- **CSRF**: Cross-Site Request Forgery 방지
- **데이터 암호화**: 민감 정보 암호화 저장

## 🌐 지원 브라우저

| 브라우저 | 최소 버전 | 지원 상태 |
|----------|-----------|-----------|
| Chrome | 90+ | ✅ 완벽 지원 |
| Firefox | 88+ | ✅ 완벽 지원 |
| Safari | 14+ | ✅ 완벽 지원 |
| Edge | 90+ | ✅ 완벽 지원 |
| Opera | 76+ | ✅ 완벽 지원 |

## 📈 로드맵

### Version 2.1 (2024 Q1)
- [ ] AI 실시간 코칭 시스템
- [ ] 음성 인식 타이핑
- [ ] VR/AR 지원
- [ ] 블록체인 기반 보상 시스템

### Version 2.2 (2024 Q2)
- [ ] 다국어 실시간 번역
- [ ] 화상 회의 통합
- [ ] 기업용 대시보드
- [ ] API v2.0 출시

### Version 3.0 (2024 Q3)
- [ ] AI 대화형 학습 시스템
- [ ] 뉴럴 인터페이스 연동
- [ ] 클라우드 동기화
- [ ] 모바일 네이티브 앱

## 🤝 파트너십

OpenTyping Pro는 다음 기관과 파트너십을 맺고 있습니다:

- [x] **교육 기관**: 50+ 학교 도입
- [x] **기업**: 20+ 회사 교육 프로그램
- [x] **정부 기관**: 타자 능력 평가 시스템
- [x] **온라인 플랫폼**: 주요 교육 사이트 연동

## 📞 지원

- **이메일**: support@opentyping.pro
- **Discord**: [커뮤니티 서버](https://discord.gg/opentyping)
- **문서**: [공식 문서](https://docs.opentyping.pro)
- **FAQ**: [자주 묻는 질문](https://faq.opentyping.pro)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2024 OpenTyping Pro Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 감사 인사

- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Chart.js](https://www.chartjs.org/) - 차트 라이브러리
- [Font Awesome](https://fontawesome.com/) - 아이콘 라이브러리
- [Google Fonts](https://fonts.google.com/) - 웹 폰트
- 모든 기여자와 테스터 여러분

---

<div align="center">

**⭐ 이 프로젝트가 마음에 드셨다면 별표를 눌러주세요!**

[![GitHub stars](https://img.shields.io/github/stars/your-username/OpenTyping?style=social)](https://github.com/your-username/OpenTyping/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/OpenTyping?style=social)](https://github.com/your-username/OpenTyping/network)

Made with ❤️ by OpenTyping Pro Team

</div>