import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'blog', 'originals');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Image optimization function
export const optimizeImage = async (inputPath: string, outputDir: string, filename: string) => {
  const baseName = path.parse(filename).name;
  
  // Create output directories
  const sizes = [
    { name: 'thumbnail', width: 400, height: 300 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1200, height: 900 }
  ];

  const optimizedPaths: { [key: string]: string } = {};

  for (const size of sizes) {
    const outputPath = path.join(outputDir, size.name, `${baseName}.webp`);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    optimizedPaths[size.name] = `/uploads/blog/optimized/${size.name}/${baseName}.webp`;
  }

  return optimizedPaths;
};

// Clean up temporary files
export const cleanupTempFiles = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

// Validate image URL
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const pathname = urlObj.pathname.toLowerCase();
    
    return validExtensions.some(ext => pathname.endsWith(ext)) || 
           urlObj.hostname.includes('unsplash.com') ||
           urlObj.hostname.includes('images.unsplash.com') ||
           urlObj.hostname.includes('picsum.photos');
  } catch {
    return false;
  }
};







