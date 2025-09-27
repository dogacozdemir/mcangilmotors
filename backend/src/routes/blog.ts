import express, { Request, Response } from 'express';
import prisma from '../config/database';

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
          translations: true, // Get all translations, not just specific language
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
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Received blog data:', JSON.stringify(req.body, null, 2));
    
    const { slug, imgUrl } = req.body;

    // Basit blog creation - sadece temel alanlar
    const post = await prisma.blogPost.create({
      data: {
        slug: slug || null,
        imgUrl: imgUrl || null
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
    console.log(`Updating blog post ${id} with data:`, req.body);
    
    const { slug, imgUrl, translations } = req.body;

    // Start transaction to update blog post and translations
    const result = await prisma.$transaction(async (tx) => {
      // Update blog post
      const post = await tx.blogPost.update({
        where: { id: Number(id) },
        data: {
          slug: slug || null,
          imgUrl: imgUrl || null
        }
      });

      // Update translations if provided
      if (translations) {
        for (const [lang, translationData] of Object.entries(translations)) {
          const data = translationData as any;
          
          await tx.blogTranslation.upsert({
            where: {
              postId_lang: {
                postId: Number(id),
                lang: lang
              }
            },
            update: {
              title: data.title || '',
              content: data.content || '',
              seoTitle: data.seo_title || data.seoTitle || '',
              seoDescription: data.seo_description || data.seoDescription || '',
              seoKeywords: data.seo_keywords || data.seoKeywords || ''
            },
            create: {
              postId: Number(id),
              lang: lang,
              title: data.title || '',
              content: data.content || '',
              seoTitle: data.seo_title || data.seoTitle || '',
              seoDescription: data.seo_description || data.seoDescription || '',
              seoKeywords: data.seo_keywords || data.seoKeywords || ''
            }
          });
        }
      }

      // Return updated post with translations and images
      return await tx.blogPost.findUnique({
        where: { id: Number(id) },
        include: {
          translations: true,
          images: true
        }
      });
    });

    console.log(`Successfully updated blog post ${id}`);
    res.json(result);
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



