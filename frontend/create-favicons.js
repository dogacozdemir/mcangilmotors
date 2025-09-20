const fs = require('fs');
const path = require('path');

// Basit favicon oluşturma scripti
// Bu script sadece mevcut logo dosyasını kopyalayacak
// Gerçek uygulamada ImageMagick veya başka bir resim işleme kütüphanesi kullanılmalı

const logoPath = path.join(__dirname, 'public', 'logo.png');
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
const favicon16Path = path.join(__dirname, 'public', 'favicon-16x16.png');
const appleTouchPath = path.join(__dirname, 'public', 'apple-touch-icon.png');

try {
  // Logo dosyasını favicon olarak kopyala
  fs.copyFileSync(logoPath, faviconPath);
  fs.copyFileSync(logoPath, favicon16Path);
  fs.copyFileSync(logoPath, appleTouchPath);
  
  console.log('Favicon dosyaları oluşturuldu!');
  console.log('- favicon.ico');
  console.log('- favicon-16x16.png');
  console.log('- apple-touch-icon.png');
} catch (error) {
  console.error('Favicon oluşturma hatası:', error);
}










