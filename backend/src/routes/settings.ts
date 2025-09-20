import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validateSettings, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.setting.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          instagram: 'https://www.instagram.com/mcangilmotors',
          facebook: 'https://www.facebook.com/mustafacangilmotors/?locale=tr_TR',
          whatsapp: '+905338551166',
          phone: '+90 533 855 11 66'
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings
router.put('/', validateSettings, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { instagram, facebook, whatsapp, phone } = req.body;

    let settings = await prisma.setting.findFirst();

    if (settings) {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: {
          instagram,
          facebook,
          whatsapp,
          phone
        }
      });
    } else {
      settings = await prisma.setting.create({
        data: {
          instagram,
          facebook,
          whatsapp,
          phone
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;