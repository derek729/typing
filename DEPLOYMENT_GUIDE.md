# 🚀 OpenTyping Pro - Squarespace 도메인 연결 배포 가이드

## 📋 현재 도메인 상태
- **주 도메인**: Squarespace 연결됨
- **DNS 설정**: 정상적으로 구성됨
- **이메일**: Google Workspace 연동됨

## 🎯 배포 전략

### 방법 1: 서브도메인으로 배포 (추천)
```
typing.도메인.com → OpenTyping Pro
```

### 방법 2: 경로 기반으로 배포
```
도메인.com/typing → OpenTyping Pro
```

---

## 🔧 방법 1: 서브도메인 배포 (GitHub Pages)

### 1단계: GitHub Repository 생성
```bash
# 기존 프로젝트를 GitHub에 푸시
git init
git add .
git commit -m "Initial OpenTyping Pro deployment"
git branch -M main
git remote add origin https://github.com/your-username/OpenTyping.git
git push -u origin main
```

### 2단계: GitHub Pages 설정
1. GitHub Repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: /root
5. Save 설정

### 3단계: 서브도메인 CNAME 설정
Squarespace DNS에 다음 레코드 추가:
```
타입: CNAME
이름: typing
데이터: your-username.github.io
TTL: 1시간
```

### 4단계: 프로젝트 파일 설정
프로젝트 루트에 `CNAME` 파일 생성:
```
typing.도메인.com
```

---

## 🔧 방법 2: Vercel 배포 (전문적)

### 1단계: Vercel 가입 및 연결
1. [vercel.com](https://vercel.com) 가입
2. GitHub Repository 연결
3. Import Project 선택

### 2단계: 배포 설정
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 3단계: 도메인 연결
1. Vercel Dashboard → Domain Settings
2. Custom Domain 추가: `typing.도메인.com`
3. DNS 레코드 자동 생성됨

### 4단계: Squarespace DNS 설정
```
타입: CNAME
이름: typing
데이터: cname.vercel-dns.com
TTL: 1시간
```

---

## 🔧 방법 3: Netlify 배포 (간단한 대안)

### 1단계: Netlify 연결
1. [netlify.com](https://netlify.com) 가입
2. GitHub Repository 연결
3. Build settings: 없음 (정적 사이트)

### 2단계: 도메인 설정
```
타입: CNAME
이름: typing
데이터: your-site-name.netlify.app
TTL: 1시간
```

---

## 🔧 방법 4: Squarespace 경로 연결 (고급)

### 1단계: OpenTyping Pro 파일 준비
```
/assets/
  ├── opentyping/
  │   ├── index.html
  │   ├── script.js
  │   ├── manifest.json
  │   └── service-worker.js
```

### 2단계: Squarespace에 파일 업로드
1. Squarespace Admin → Pages
2. Not Linked 페이지 생성
3. Code Block 추가
4. 모든 파일 내용 붙여넣기

### 3단계: URL 경로 설정
```
https://도메인.com/typing
```

---

## 🔒 HTTPS 및 보안 설정

### 1. SSL 인증서
- GitHub Pages: 자동 HTTPS
- Vercel: 자동 HTTPS
- Netlify: 자동 HTTPS

### 2. 보안 헤더 설정
```javascript
// service-worker.js에 추가
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});
```

---

## 📱 PWA 최적화 배포

### 1. Service Worker 등록
```javascript
// script.js에 이미 포함됨
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}
```

### 2. PWA 매니페스트
```json
// manifest.json (이미 설정됨)
{
    "name": "OpenTyping Pro - 온라인 타자 연습",
    "short_name": "OpenTyping",
    "start_url": "https://typing.도메인.com/",
    "display": "standalone"
}
```

---

## 🚀 추천 배포 방법

### 🥇 1순위: Vercel 배포
- **장점**: 전문 CDN, 자동 HTTPS, 빠른 배포
- **설정 시간**: 10분
- **비용**: 무료 (소규모)
- **도메인**: `typing.도메인.com`

### 🥈 2순위: GitHub Pages
- **장점**: 무료, 안정적, GitHub 연동
- **설정 시간**: 15분
- **비용**: 완전 무료
- **도메인**: `typing.도메인.com`

### 🥉 3순위: Netlify 배포
- **장점**: 사용하기 쉬움, 좋은 성능
- **설정 시간**: 10분
- **비용**: 무료 (소규모)
- **도메인**: `typing.도메인.com`

---

## 🔍 배포 후 테스트 체크리스트

### 기능 테스트
- [ ] PWA 설치 가능 여부
- [ ] 오프라인 동작
- [ ] 모바일 반응형
- [ ] HTTPS 접속
- [ ] 도메인 정상 연결

### 성능 테스트
- [ ] 로딩 속도 (< 3초)
- [ ] 모바일 점수 (> 90)
- [ ] PWA 설치 기능
- [ ] 접근성 점수 (> 80)

---

## 📞 기술 지원

### 도메인 연결 시 문제 해결
1. **DNS 전파 시간**: 최대 48시간 소요
2. **CNAME 설정**: 정확한 값 입력 필요
3. **SSL 인증서**: 자동 발급 (배포 플랫폼에 따름)

### 지원 문의
- 기술 지원: GitHub Issues
- 배포 문제: 각 플랫폼 문서 참조

---

## 🎉 다음 단계

1. **배포 방법 선택**: Vercel 또는 GitHub Pages 추천
2. **Repository 생성**: GitHub에 코드 업로드
3. **배포 플랫폼 설정**: 선택한 플랫폼에서 배포
4. **DNS 설정**: Squarespace에서 CNAME 레코드 추가
5. **테스트**: 모든 기능 확인

OpenTyping Pro를 귀사의 도메인에 성공적으로 연결할 수 있습니다!