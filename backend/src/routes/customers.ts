import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validateCustomer, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count()
    ]);

    res.json({
      customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        offers: {
          include: {
            car: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer
router.post('/', validateCustomer, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { fullName, phone, email } = req.body;

    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        email
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, email } = req.body;

    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        fullName,
        phone,
        email
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;