import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validateOffer, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get all offers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          car: {
            include: {
              images: true,
              category: true
            }
          },
          customer: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.offer.count({ where })
    ]);

    res.json({
      offers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single offer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findUnique({
      where: { id: Number(id) },
      include: {
        car: {
          include: {
            images: true,
            category: true
          }
        },
        customer: true
      }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(offer);
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create offer
router.post('/', validateOffer, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { carId, customerId, message, status = 'pending' } = req.body;

    // Check if customer exists, if not create
    let customer;
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: Number(customerId) }
      });
    }

    if (!customer && req.body.customer) {
      const { fullName, phone, email } = req.body.customer;
      customer = await prisma.customer.create({
        data: { fullName, phone, email }
      });
    }

    const offer = await prisma.offer.create({
      data: {
        carId: carId ? Number(carId) : null,
        customerId: customer ? customer.id : null,
        message,
        status
      },
      include: {
        car: {
          include: {
            images: true,
            category: true
          }
        },
        customer: true
      }
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update offer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const offer = await prisma.offer.update({
      where: { id: Number(id) },
      data: {
        status,
        message
      },
      include: {
        car: {
          include: {
            images: true,
            category: true
          }
        },
        customer: true
      }
    });

    res.json(offer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete offer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.offer.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;