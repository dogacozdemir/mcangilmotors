const fs = require('fs');
const path = require('path');

// Placeholder görseller oluşturma scripti
const createPlaceholderImage = (filename, width, height, text, color = '#D3AF77') => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <rect x="0" y="0" width="100%" height="100%" fill="${color}" opacity="0.1"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
          text-anchor="middle" dominant-baseline="middle" fill="${color}">
      ${text}
    </text>
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="14" 
          text-anchor="middle" dominant-baseline="middle" fill="#6b7280">
      Placeholder Image
    </text>
  </svg>`;
  
  const filePath = path.join(__dirname, 'public', 'cars', filename);
  fs.writeFileSync(filePath, svg);
  console.log(`Created: ${filename}`);
};

// Placeholder görseller oluştur
createPlaceholderImage('bmw-x5.jpg', 800, 600, 'BMW X5', '#D3AF77');
createPlaceholderImage('mercedes-sl500.jpg', 800, 600, 'Mercedes SL500', '#D3AF77');
createPlaceholderImage('toyota-corolla.jpg', 800, 600, 'Toyota Corolla', '#D3AF77');

console.log('Placeholder görseller oluşturuldu!');










