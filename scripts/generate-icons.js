import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // Maskable icon with 10% safe zone padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#1d4ed8'
    })
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  // Favicon 64x64 png
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
