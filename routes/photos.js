const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 사진 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/photos')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});

// 사진 업로드
router.post('/upload', upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '파일이 업로드되지 않았습니다.'
            });
        }

        res.json({
            success: true,
            message: '사진이 성공적으로 업로드되었습니다.',
            file: {
                filename: req.file.filename,
                path: req.file.path
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '사진 업로드 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 사진 목록 조회
router.get('/list', (req, res) => {
    try {
        // TODO: 데이터베이스에서 사진 목록 조회
        res.json({
            success: true,
            message: '사진 목록을 성공적으로 조회했습니다.',
            photos: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '사진 목록 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 사진 상세 조회
router.get('/:id', (req, res) => {
    try {
        const photoId = req.params.id;
        // TODO: 데이터베이스에서 사진 상세 정보 조회
        res.json({
            success: true,
            message: '사진 상세 정보를 성공적으로 조회했습니다.',
            photo: {
                id: photoId,
                // 추가 정보
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '사진 상세 정보 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router; 