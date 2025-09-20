import express from 'express';
import { upload, optimizeImage, cleanupTempFiles, isValidImageUrl } from '../utils/imageUpload';
import path from 'path';

const router = express.Router();

// Blog image upload endpoint
router.post('/blog', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const originalPath = req.file.path;
    const outputDir = path.join(process.cwd(), 'public', 'uploads', 'blog', 'optimized');
    
    // Optimize the image
    const optimizedPaths = await optimizeImage(originalPath, outputDir, req.file.filename);
    
    // Clean up original file
    cleanupTempFiles(originalPath);

    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      image: {
        original: `/uploads/blog/originals/${req.file.filename}`,
        optimized: optimizedPaths
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Clean up on error
    if (req.file) {
      cleanupTempFiles(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Validate image URL endpoint
router.post('/validate-url', (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const isValid = isValidImageUrl(url);
    
    res.json({
      valid: isValid,
      message: isValid ? 'Valid image URL' : 'Invalid image URL'
    });
  } catch (error) {
    console.error('Error validating URL:', error);
    res.status(500).json({ error: 'Failed to validate URL' });
  }
});

export default router;







