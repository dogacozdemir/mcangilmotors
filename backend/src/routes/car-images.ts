import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for car images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'cars', 'originals');
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to optimize images
async function optimizeCarImage(inputPath: string, outputDir: string, filename: string) {
  const baseName = path.parse(filename).name;
  
  // Create output directories
  await fs.mkdir(path.join(outputDir, 'thumbnail'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'medium'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'large'), { recursive: true });

  const thumbnailPath = path.join(outputDir, 'thumbnail', `${baseName}.webp`);
  const mediumPath = path.join(outputDir, 'medium', `${baseName}.webp`);
  const largePath = path.join(outputDir, 'large', `${baseName}.webp`);

  // Generate different sizes
  await Promise.all([
    // Thumbnail (300x200)
    sharp(inputPath)
      .resize(300, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(thumbnailPath),
    
    // Medium (800x600)
    sharp(inputPath)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(mediumPath),
    
    // Large (1200x900)
    sharp(inputPath)
      .resize(1200, 900, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(largePath)
  ]);

  return {
    thumbnail: `/uploads/cars/optimized/thumbnail/${baseName}.webp`,
    medium: `/uploads/cars/optimized/medium/${baseName}.webp`,
    large: `/uploads/cars/optimized/large/${baseName}.webp`
  };
}

// Helper function to cleanup temp files
async function cleanupTempFiles(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
}

// Upload cover image for a car
router.post('/:carId/cover-image', upload.single('image'), async (req, res) => {
  try {
    const { carId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: parseInt(carId) }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const originalPath = req.file.path;
    const outputDir = path.join(process.cwd(), 'public', 'uploads', 'cars', 'optimized');
    const optimizedPaths = await optimizeCarImage(originalPath, outputDir, req.file.filename);

    // Update car with cover image
    await prisma.car.update({
      where: { id: parseInt(carId) },
      data: { coverImage: optimizedPaths.large }
    });

    // Also add to car_images table
    await prisma.carImage.create({
      data: {
        carId: parseInt(carId),
        imagePath: optimizedPaths.large,
        isMain: true,
        sortOrder: 0
      }
    });

    // Clean up original file
    cleanupTempFiles(originalPath);

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      image: {
        original: `/uploads/cars/originals/${req.file.filename}`,
        optimized: optimizedPaths
      }
    });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Upload gallery images for a car
router.post('/:carId/gallery-images', upload.array('images', 10), async (req, res) => {
  try {
    const { carId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: parseInt(carId) }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const originalPath = file.path;
      const outputDir = path.join(process.cwd(), 'public', 'uploads', 'cars', 'optimized');
      const optimizedPaths = await optimizeCarImage(originalPath, outputDir, file.filename);

      // Create car image record
      const carImage = await prisma.carImage.create({
        data: {
          carId: parseInt(carId),
          imagePath: optimizedPaths.large,
          isMain: false,
          sortOrder: i,
          altText: `${car.make} ${car.model} - Image ${i + 1}`
        }
      });

      uploadedImages.push({
        id: carImage.id,
        imagePath: optimizedPaths.large,
        sortOrder: carImage.sortOrder
      });

      // Clean up original file
      cleanupTempFiles(originalPath);
    }

    res.json({
      success: true,
      message: 'Gallery images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    res.status(500).json({ error: 'Failed to upload gallery images' });
  }
});

// Batch upload gallery images
router.post('/:carId/gallery/batch', upload.array('images', 20), async (req, res) => {
  try {
    const { carId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: parseInt(carId) }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const originalPath = file.path;
      const outputDir = path.join(process.cwd(), 'public', 'uploads', 'cars', 'optimized');
      const optimizedPaths = await optimizeCarImage(originalPath, outputDir, file.filename);

      // Create car image record
      const carImage = await prisma.carImage.create({
        data: {
          carId: parseInt(carId),
          imagePath: optimizedPaths.large,
          isMain: false,
          sortOrder: i,
          altText: `${car.make} ${car.model} - Gallery Image ${i + 1}`
        }
      });

      uploadedImages.push({
        id: carImage.id,
        imagePath: optimizedPaths.large,
        sortOrder: carImage.sortOrder,
        altText: carImage.altText
      });

      // Clean up original file
      cleanupTempFiles(originalPath);
    }

    res.json({
      success: true,
      message: 'Gallery images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading gallery images batch:', error);
    res.status(500).json({ error: 'Failed to upload gallery images' });
  }
});

// Reorder gallery images
router.put('/:carId/reorder', async (req, res) => {
  try {
    const { carId } = req.params;
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }

    // Update sort order for each image
    const updatePromises = imageIds.map((imageId, index) => 
      prisma.carImage.update({
        where: { id: imageId },
        data: { sortOrder: index }
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Images reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ error: 'Failed to reorder images' });
  }
});

// Delete a car image
router.delete('/:carId/images/:imageId', async (req, res) => {
  try {
    const { carId, imageId } = req.params;

    // Check if image exists and belongs to the car
    const carImage = await prisma.carImage.findFirst({
      where: {
        id: parseInt(imageId),
        carId: parseInt(carId)
      }
    });

    if (!carImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from database
    await prisma.carImage.delete({
      where: { id: parseInt(imageId) }
    });

    // TODO: Delete physical files (optional)

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get car images
router.get('/:carId/images', async (req, res) => {
  try {
    const { carId } = req.params;

    const images = await prisma.carImage.findMany({
      where: { carId: parseInt(carId) },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching car images:', error);
    res.status(500).json({ error: 'Failed to fetch car images' });
  }
});

export default router;
