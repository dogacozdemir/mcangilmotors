import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validatePage, validatePageTranslation, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
  try {
    const { lang = 'tr' } = req.query;

    const pages = await prisma.page.findMany({
      include: {
        translations: {
          where: { lang: lang as string }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single page
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang = 'tr' } = req.query;

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { lang: lang as string }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get about page sections
router.get('/about/sections', async (req, res) => {
  try {
    const { lang = 'tr' } = req.query;

    const sections = await prisma.page.findMany({
      where: {
        slug: {
          in: ['about-mission', 'about-vision', 'about-values', 'about-experience', 'about-service-area', 'about-team', 'about-cta']
        }
      },
      include: {
        translations: {
          where: { lang: lang as string }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(sections);
  } catch (error) {
    console.error('Error fetching about sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create page
router.post('/', validatePage, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { slug, translations = {} } = req.body;

    const page = await prisma.page.create({
      data: {
        slug,
        translations: {
          create: Object.entries(translations).map(([lang, data]: [string, any]) => ({
            lang,
            title: data.title,
            content: data.content,
            seoTitle: data.seo_title,
            seoDescription: data.seo_description,
            seoKeywords: data.seo_keywords
          }))
        }
      },
      include: {
        translations: true
      }
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update page
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, translations = {} } = req.body;

    // Delete existing translations
    await prisma.pageTranslation.deleteMany({
      where: { pageId: Number(id) }
    });

    const page = await prisma.page.update({
      where: { id: Number(id) },
      data: {
        slug,
        translations: {
          create: Object.entries(translations).map(([lang, data]: [string, any]) => ({
            lang,
            title: data.title,
            content: data.content,
            seoTitle: data.seo_title,
            seoDescription: data.seo_description,
            seoKeywords: data.seo_keywords
          }))
        }
      },
      include: {
        translations: true
      }
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete page
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.page.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;