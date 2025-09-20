import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validateBlogPost, validateBlogTranslation, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, lang = 'tr' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        skip,
        take: Number(limit),
        include: {
          translations: {
            where: { lang: lang as string }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.blogPost.count()
    ]);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single blog post
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang = 'tr' } = req.query;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { lang: lang as string }
        },
        images: true
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create blog post
router.post('/', validateBlogPost, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { slug, imgUrl, translations = {}, images = [] } = req.body;

    const post = await prisma.blogPost.create({
      data: {
        slug,
        imgUrl,
        translations: {
          create: Object.entries(translations).map(([lang, data]: [string, any]) => ({
            lang,
            title: data.title,
            content: data.content,
            seoTitle: data.seo_title,
            seoDescription: data.seo_description,
            seoKeywords: data.seo_keywords
          }))
        },
        images: {
          create: images.map((img: any) => ({
            imagePath: img.imagePath,
            isMain: img.isMain || false
          }))
        }
      },
      include: {
        translations: true,
        images: true
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update blog post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, imgUrl, translations = {}, images = [] } = req.body;

    // Delete existing translations and images
    await Promise.all([
      prisma.blogTranslation.deleteMany({
        where: { postId: Number(id) }
      }),
      prisma.blogImage.deleteMany({
        where: { postId: Number(id) }
      })
    ]);

    const post = await prisma.blogPost.update({
      where: { id: Number(id) },
      data: {
        slug,
        imgUrl,
        translations: {
          create: Object.entries(translations).map(([lang, data]: [string, any]) => ({
            lang,
            title: data.title,
            content: data.content,
            seoTitle: data.seo_title,
            seoDescription: data.seo_description,
            seoKeywords: data.seo_keywords
          }))
        },
        images: {
          create: images.map((img: any) => ({
            imagePath: img.imagePath,
            isMain: img.isMain || false
          }))
        }
      },
      include: {
        translations: true,
        images: true
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.blogPost.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;



