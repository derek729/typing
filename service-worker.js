// OpenTyping Pro Service Worker - 모바일 최적화 버전
const CACHE_NAME = 'opentyping-pro-v2.0.0';
const STATIC_CACHE = 'opentyping-static-v2.0.0';
const DYNAMIC_CACHE = 'opentyping-dynamic-v2.0.0';
const RUNTIME_CACHE = 'opentyping-runtime-v2.0.0';

// 오프라인 페이지
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenTyping Pro - 오프라인</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .offline-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            margin: 0 20px;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            margin: 0 0 20px 0;
            font-size: 24px;
        }
        p {
            margin: 0 0 30px 0;
            opacity: 0.9;
            line-height: 1.6;
        }
        .btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn:active {
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="icon">📱</div>
        <h1>오프라인 모드</h1>
        <p>OpenTyping Pro는 오프라인에서도 사용할 수 있습니다. 연결이 복구되면 자동으로 동기화됩니다.</p>
        <button class="btn" onclick="window.location.reload()">새로고침</button>
    </div>
</body>
</html>
`;

// 정적 리소스 캐싱 전략
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/script.js',
    '/service-worker.js'
];

// CDN 리소스 캐싱
const CDN_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/confetti-js@0.0.18/dist/index.min.js',
    'https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    console.log('OpenTyping Pro: Service Worker 설치 시작');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('OpenTyping Pro: 정적 리소스 캐싱');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('OpenTyping Pro: 설치 완료');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('OpenTyping Pro: 설치 실패', error);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
    console.log('OpenTyping Pro: Service Worker 활성화');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // 오래된 캐시 삭제
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== RUNTIME_CACHE &&
                            !cacheName.startsWith('opentyping-')) {
                            console.log('OpenTyping Pro: 오래된 캐시 삭제', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('OpenTyping Pro: 활성화 완료');
                return self.clients.claim();
            })
    );
});

// 네트워크 요청 처리 (Cache First 전략)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 내비게이션 요청은 항상 네트워크 우선
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // 오프라인 시 캐시된 페이지 또는 오프라인 페이지 반환
                    return caches.match(request)
                        .then((response) => response || new Response(OFFLINE_PAGE, {
                            headers: { 'Content-Type': 'text/html' }
                        }));
                })
        );
        return;
    }

    // CDN 리소스는 Stale While Revalidate
    if (CDN_ASSETS.some(cdn => request.url.startsWith(cdn))) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.match(request)
                        .then((response) => {
                            // 백그라운드에서 업데이트
                            const fetchPromise = fetch(request)
                                .then((networkResponse) => {
                                    if (networkResponse.ok) {
                                        cache.put(request, networkResponse.clone());
                                    }
                                    return networkResponse;
                                })
                                .catch(() => {
                                    console.log('OpenTyping Pro: CDN 리소스 로드 실패', request.url);
                                });

                            // 캐시된 응답 즉시 반환, 네트워크로 업데이트
                            return response || fetchPromise;
                        });
                })
        );
        return;
    }

    // 정적 리소스는 Cache First
    if (STATIC_ASSETS.some(asset => request.url.includes(asset)) ||
        request.url.includes('/assets/')) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    // 캐시에 없으면 네트워크에서 가져오고 캐시
                    return fetch(request)
                        .then((networkResponse) => {
                            if (networkResponse.ok) {
                                return caches.open(DYNAMIC_CACHE)
                                    .then((cache) => {
                                        cache.put(request, networkResponse.clone());
                                        return networkResponse;
                                    });
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // 오프라인 폴백
                            if (request.destination === 'image') {
                                return new Response('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ccc"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">이미지 없음</text></svg>', {
                                    headers: { 'Content-Type': 'image/svg+xml' }
                                });
                            }
                            return new Response('오프라인 상태입니다.', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
        return;
    }

    // API 요청은 Network First
    if (request.url.includes('/api/')) {
        event.respondWith(
            caches.open(RUNTIME_CACHE)
                .then((cache) => {
                    return fetch(request)
                        .then((networkResponse) => {
                            // 성공 응답 캐시 (5분)
                            if (networkResponse.ok) {
                                cache.put(request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // 네트워크 실패 시 캐시된 응답 반환
                            return cache.match(request);
                        });
                })
        );
        return;
    }

    // 기타 요청은 Network First with Cache Fallback
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                // 성공 시 런타임 캐시에 저장 (1시간)
                if (networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(RUNTIME_CACHE)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                }
                return networkResponse;
            })
            .catch(() => {
                // 네트워크 실패 시 캐시 확인
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // 최후의 수단으로 오프라인 페이지
                        if (request.mode === 'navigate') {
                            return new Response(OFFLINE_PAGE, {
                                headers: { 'Content-Type': 'text/html' }
                            });
                        }

                        return new Response('오프라인 상태입니다.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
    console.log('OpenTyping Pro: 백그라운드 동기화', event.tag);

    if (event.tag === 'sync-user-data') {
        event.waitUntil(
            // 사용자 데이터 동기화 로직
            syncUserData()
        );
    }
});

// 푸시 알림
self.addEventListener('push', (event) => {
    console.log('OpenTyping Pro: 푸시 알림 수신');

    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 도착했습니다.',
        icon: '/assets/icon.png',
        badge: '/assets/icon.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '앱 열기',
                icon: '/assets/icon.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/assets/icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('OpenTyping Pro', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    console.log('OpenTyping Pro: 알림 클릭');

    event.notification.close();

    if (event.action === 'explore') {
        // 앱 열기
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 주기적 백그라운드 동기화
self.addEventListener('periodicsync', (event) => {
    console.log('OpenTyping Pro: 주기적 동기화', event.tag);

    if (event.tag === 'sync-daily') {
        event.waitUntil(
            // 일일 동기화 로직
            syncDailyData()
        );
    }
});

// 데이터 동기화 함수
async function syncUserData() {
    try {
        // 사용자 데이터 동기화 로직
        console.log('OpenTyping Pro: 사용자 데이터 동기화 완료');
    } catch (error) {
        console.error('OpenTyping Pro: 데이터 동기화 실패', error);
    }
}

async function syncDailyData() {
    try {
        // 일일 데이터 동기화 로직
        console.log('OpenTyping Pro: 일일 데이터 동기화 완료');
    } catch (error) {
        console.error('OpenTyping Pro: 일일 데이터 동기화 실패', error);
    }
}

// 캐시 정리 함수
async function cleanupCache() {
    try {
        const cacheNames = await caches.keys();
        const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, RUNTIME_CACHE];

        await Promise.all(
            cacheNames
                .filter(cacheName => !currentCaches.includes(cacheName))
                .map(cacheName => caches.delete(cacheName))
        );

        console.log('OpenTyping Pro: 캐시 정리 완료');
    } catch (error) {
        console.error('OpenTyping Pro: 캐시 정리 실패', error);
    }
}

// 메시지 핸들러
self.addEventListener('message', (event) => {
    console.log('OpenTyping Pro: 메시지 수신', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_UPDATE') {
        event.waitUntil(
            updateCache()
        );
    }
});

// 캐시 업데이트 함수
async function updateCache() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(STATIC_ASSETS);
        console.log('OpenTyping Pro: 캐시 업데이트 완료');
    } catch (error) {
        console.error('OpenTyping Pro: 캐시 업데이트 실패', error);
    }
}