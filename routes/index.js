const express = require('express');
const router = express.Router();

// 기본 라우트
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API 서버가 정상적으로 실행 중입니다.',
        version: '1.0.0'
    });
});

module.exports = router; 