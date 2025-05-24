export const API_URL = 'http://10.0.2.2:3000/api';  // Android 에뮬레이터에서 localhost 접근을 위한 주소

export const API_ENDPOINTS = {
    SKETCHES: {
        UPLOAD: '/sketches/upload',
        LIST: '/sketches',
        DETAIL: (id) => `/sketches/${id}`,
    },
    PHOTOS: {
        UPLOAD: '/photos/upload',
        LIST: '/photos',
        DETAIL: (id) => `/photos/${id}`,
    },
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
    },
}; 