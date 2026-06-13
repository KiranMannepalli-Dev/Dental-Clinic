const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const images = [
  'images/hero-dentist.jpg',
  'images/transformations/makeover_before.png',
  'images/transformations/makeover_after.png',
  'images/transformations/whitening_before.png',
  'images/transformations/whitening_after.png',
  'images/transformations/braces_before.png',
  'images/transformations/braces_after.png',
  'images/transformations/implants_before.png',
  'images/transformations/implants_after.png',
];

const publicDir = path.join(__dirname, '../../web/public');

async function run() {
  for (const imgPath of images) {
    const inputPath = path.join(publicDir, imgPath);
    const ext = path.extname(imgPath);
    const webpPath = imgPath.replace(ext, '.webp');
    const outputPath = path.join(publicDir, webpPath);

    if (fs.existsSync(inputPath)) {
      try {
        const info = await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`Converted ${imgPath} -> ${webpPath} (${(info.size / 1024).toFixed(1)} KB)`);
        
        // Delete the original file
        fs.unlinkSync(inputPath);
        console.log(`Deleted original: ${imgPath}`);
      } catch (err) {
        console.error(`Error converting ${imgPath}:`, err.message);
      }
    } else {
      console.log(`File does not exist: ${imgPath}`);
    }
  }
}

run();
