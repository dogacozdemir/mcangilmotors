const fs = require('fs');
const path = require('path');

// Hero background placeholder oluşturma scripti
const createHeroBackground = () => {
  const svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#374151;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="200" cy="200" r="100" fill="#D3AF77" opacity="0.1"/>
    <circle cx="1600" cy="300" r="150" fill="#D3AF77" opacity="0.05"/>
    <circle cx="400" cy="800" r="120" fill="#D3AF77" opacity="0.08"/>
    <circle cx="1500" cy="900" r="80" fill="#D3AF77" opacity="0.06"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
          text-anchor="middle" dominant-baseline="middle" fill="#D3AF77" opacity="0.3">
      Mustafa Cangil Auto Trading Ltd.
    </text>
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" 
          text-anchor="middle" dominant-baseline="middle" fill="#ffffff" opacity="0.2">
      Premium Araç Galerisi
    </text>
  </svg>`;
  
  const filePath = path.join(__dirname, 'public', 'hero-bg.jpg');
  fs.writeFileSync(filePath, svg);
  console.log('Hero background oluşturuldu!');
};

createHeroBackground();









