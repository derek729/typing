const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// assets 디렉토리가 없으면 생성
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 기본 이미지 생성 함수
async function createImage(width, height, outputPath) {
    await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 122, b: 255, alpha: 1 }
        }
    })
    .png()
    .toFile(outputPath);
}

// 필요한 이미지들 생성
async function generateImages() {
    try {
        // icon.png (512x512)
        await createImage(512, 512, path.join(assetsDir, 'icon.png'));
        
        // splash.png (1242x2436)
        await createImage(1242, 2436, path.join(assetsDir, 'splash.png'));
        
        // adaptive-icon.png (432x432)
        await createImage(432, 432, path.join(assetsDir, 'adaptive-icon.png'));
        
        console.log('이미지 생성 완료!');
    } catch (error) {
        console.error('이미지 생성 중 오류 발생:', error);
    }
}

generateImages(); 