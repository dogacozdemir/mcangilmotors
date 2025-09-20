import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validateCar, validateCarTranslation, handleValidationErrors, validateQueryParams } from '../middleware/validation';
import { carsCache, invalidateCache } from '../middleware/cache';
import { csrfProtection } from '../middleware/security';

const router = express.Router();

// Get all cars with filters
router.get('/', carsCache, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      make, 
      model, 
      year_min, 
      year_max, 
      price_min, 
      price_max, 
      mileage_min, 
      mileage_max, 
      fuel_type, 
      transmission, 
      engine,
      color,
      body_type,
      plate_status,
      category_id,
      featured,
      status = 'available',
      lang = 'tr'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (make) where.make = { contains: make as string };
    if (model) where.model = { contains: model as string };
    if (year_min || year_max) {
      where.year = {};
      if (year_min) where.year.gte = Number(year_min);
      if (year_max) where.year.lte = Number(year_max);
    }
    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price.gte = Number(price_min);
      if (price_max) where.price.lte = Number(price_max);
    }
    if (mileage_min || mileage_max) {
      where.mileage = {};
      if (mileage_min) where.mileage.gte = Number(mileage_min);
      if (mileage_max) where.mileage.lte = Number(mileage_max);
    }
    if (fuel_type) where.fuelType = fuel_type;
    if (transmission) where.transmission = transmission;
    if (engine) where.engine = { contains: engine as string };
    if (color) where.color = { contains: color as string };
    if (body_type) where.bodyType = body_type;
    if (plate_status) where.plateStatus = plate_status;
    if (category_id) where.categoryId = Number(category_id);
    if (featured !== undefined) where.featured = featured === 'true';
    // Handle status filtering using boolean fields
    if (status === 'available') {
      where.status = 'available';
      where.isSold = false;
      where.isIncoming = false;
      where.isReserved = false;
    } else if (status === 'sold') {
      where.isSold = true;
    } else if (status === 'incoming') {
      where.isIncoming = true;
    } else if (status === 'reserved') {
      where.isReserved = true;
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: true,
          images: true,
          translations: {
            where: { lang: lang as string }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.car.count({ where })
    ]);

    res.json({
      cars,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sold cars
router.get('/sold', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      make, 
      model, 
      year_min, 
      year_max, 
      sold_price_min,
      sold_price_max,
      sold_date_from,
      sold_date_to,
      lang = 'tr'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      isSold: true // Only sold cars
    };
    
    if (make) where.make = { contains: make as string };
    if (model) where.model = { contains: model as string };
    if (year_min || year_max) {
      where.year = {};
      if (year_min) where.year.gte = Number(year_min);
      if (year_max) where.year.lte = Number(year_max);
    }
    if (sold_price_min || sold_price_max) {
      where.soldPrice = {};
      if (sold_price_min) where.soldPrice.gte = Number(sold_price_min);
      if (sold_price_max) where.soldPrice.lte = Number(sold_price_max);
    }
    if (sold_date_from || sold_date_to) {
      where.soldAt = {};
      if (sold_date_from) where.soldAt.gte = new Date(sold_date_from as string);
      if (sold_date_to) where.soldAt.lte = new Date(sold_date_to as string);
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: true,
          images: true,
          translations: {
            where: { lang: lang as string }
          }
        },
        orderBy: { soldAt: 'desc' }
      }),
      prisma.car.count({ where })
    ]);

    res.json({
      cars,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching sold cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get incoming cars (status = 'incoming')
router.get('/incoming', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      make, 
      model, 
      year_min, 
      year_max, 
      price_min, 
      price_max, 
      mileage_min, 
      mileage_max, 
      fuel_type, 
      transmission, 
      engine,
      color,
      body_type,
      plate_status,
      category_id,
      featured,
      expected_arrival_from,
      expected_arrival_to,
      lang = 'tr'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      status: 'incoming' // Only incoming cars
    };
    
    if (make) where.make = { contains: make as string };
    if (model) where.model = { contains: model as string };
    if (year_min || year_max) {
      where.year = {};
      if (year_min) where.year.gte = Number(year_min);
      if (year_max) where.year.lte = Number(year_max);
    }
    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price.gte = Number(price_min);
      if (price_max) where.price.lte = Number(price_max);
    }
    if (mileage_min || mileage_max) {
      where.mileage = {};
      if (mileage_min) where.mileage.gte = Number(mileage_min);
      if (mileage_max) where.mileage.lte = Number(mileage_max);
    }
    if (fuel_type) where.fuelType = fuel_type as string;
    if (transmission) where.transmission = transmission as string;
    if (engine) where.engine = { contains: engine as string };
    if (color) where.color = { contains: color as string };
    if (body_type) where.bodyType = body_type as string;
    if (plate_status) where.plateStatus = plate_status as string;
    if (category_id) where.categoryId = Number(category_id);
    if (featured !== undefined) where.featured = featured === 'true';
    
    // Expected arrival date filtering
    if (expected_arrival_from || expected_arrival_to) {
      where.expectedArrival = {};
      if (expected_arrival_from) where.expectedArrival.gte = new Date(expected_arrival_from as string);
      if (expected_arrival_to) where.expectedArrival.lte = new Date(expected_arrival_to as string);
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          translations: {
            where: { lang: lang as string }
          }
        },
        orderBy: { expectedArrival: 'asc' } // Sort by expected arrival date
      }),
      prisma.car.count({ where })
    ]);
    
    res.json({
      cars,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching incoming cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'tr' } = req.query;

    const car = await prisma.car.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        images: true,
        translations: {
          where: { lang: lang as string }
        }
      }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create car
router.post('/', csrfProtection, validateCar, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { 
      make, 
      model, 
      year, 
      mileage, 
      fuelType, 
      transmission, 
      color, 
      engine,
      bodyType,
      plateStatus,
      price, 
      featured, 
      categoryId,
      status = 'available',
      isSold = false,
      isIncoming = false,
      isReserved = false,
      soldAt,
      soldPrice,
      expectedArrival,
      images = [],
      translations = {}
    } = req.body;

    const car = await prisma.car.create({
      data: {
        make,
        model,
        year: Number(year),
        mileage: Number(mileage),
        fuelType,
        transmission,
        color,
        engine,
        bodyType,
        plateStatus,
        price: Number(price),
        featured: Boolean(featured),
        categoryId: Number(categoryId),
        status,
        isSold: Boolean(isSold),
        isIncoming: Boolean(isIncoming),
        isReserved: Boolean(isReserved),
        soldAt: soldAt ? new Date(soldAt) : null,
        soldPrice: soldPrice ? Number(soldPrice) : null,
        expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
        images: {
          create: images.map((imagePath: string, index: number) => ({
            imagePath,
            isMain: index === 0
          }))
        },
        translations: {
          create: Object.entries(translations).map(([lang, data]: [string, any]) => ({
            lang,
            title: data.title,
            description: data.description,
            seoTitle: data.seo_title,
            seoDescription: data.seo_description,
            seoKeywords: data.seo_keywords
          }))
        }
      },
      include: {
        category: true,
        images: true,
        translations: true
      }
    });

    // Invalidate cars cache
    invalidateCache('cars:');
    
    res.status(201).json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update car
router.put('/:id', csrfProtection, validateCar, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Updating car ${id} with data:`, req.body);
    const { 
      make, 
      model, 
      year, 
      mileage, 
      fuelType, 
      transmission, 
      color, 
      engine,
      bodyType,
      plateStatus,
      price, 
      featured, 
      categoryId,
      status,
      isSold,
      isIncoming,
      isReserved,
      soldAt,
      soldPrice,
      expectedArrival,
      images = [],
      translations = {}
    } = req.body;

    // If images are provided, replace all existing images
    if (images && images.length > 0) {
      await prisma.carImage.deleteMany({ where: { carId: Number(id) } });
    }

    try {
      const car = await prisma.car.update({
        where: { id: Number(id) },
        data: {
          make,
          model,
          year: Number(year),
          mileage: Number(mileage),
          fuelType,
          transmission,
          color,
          engine,
          bodyType,
          plateStatus,
          price: Number(price),
          featured: Boolean(featured),
          categoryId: Number(categoryId),
          status,
          isSold: Boolean(isSold),
          isIncoming: Boolean(isIncoming),
          isReserved: Boolean(isReserved),
          soldAt: soldAt ? new Date(soldAt) : null,
          soldPrice: soldPrice ? Number(soldPrice) : null,
          expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
          ...(images && images.length > 0 && {
            images: {
              create: images.map((imagePath: string, index: number) => ({
                imagePath,
                isMain: index === 0,
                sortOrder: index
              }))
            }
          }),
          // Handle translations - update existing or create new
          ...(translations && Object.keys(translations).length > 0 && {
            translations: {
              upsert: Object.entries(translations).map(([lang, data]: [string, any]) => ({
                where: { carId_lang: { carId: Number(id), lang } },
                update: {
                  title: data.title,
                  description: data.description,
                  seoTitle: data.seo_title,
                  seoDescription: data.seo_description,
                  seoKeywords: data.seo_keywords
                },
                create: {
                  lang,
                  title: data.title,
                  description: data.description,
                  seoTitle: data.seo_title,
                  seoDescription: data.seo_description,
                  seoKeywords: data.seo_keywords
                }
              }))
            }
          })
        },
        include: {
          category: true,
          images: true,
          translations: true
        }
      });
      
      console.log(`Successfully updated car ${id}`);
      
      // Invalidate cars cache
      invalidateCache('cars:');
      
      res.json(car);
    } catch (updateError) {
      console.error(`Error updating car ${id}:`, updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete car
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.car.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique makes and models
router.get('/meta/makes', async (req, res) => {
  try {
    const makes = await prisma.car.findMany({
      select: { make: true },
      distinct: ['make'],
      where: { make: { not: null } },
      orderBy: { make: 'asc' }
    });

    res.json(makes.map(car => car.make));
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/meta/models', async (req, res) => {
  try {
    const { make } = req.query;
    
    const models = await prisma.car.findMany({
      select: { model: true },
      distinct: ['model'],
      where: { 
        model: { not: null },
        ...(make && { make: make as string })
      },
      orderBy: { model: 'asc' }
    });

    res.json(models.map(car => car.model));
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique body types
router.get('/meta/body-types', async (req, res) => {
  try {
    const bodyTypes = await prisma.car.findMany({
      select: { bodyType: true },
      distinct: ['bodyType'],
      where: { bodyType: { not: null } },
      orderBy: { bodyType: 'asc' }
    });

    res.json(bodyTypes.map(car => car.bodyType));
  } catch (error) {
    console.error('Error fetching body types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique plate statuses
router.get('/meta/plate-statuses', async (req, res) => {
  try {
    const plateStatuses = await prisma.car.findMany({
      select: { plateStatus: true },
      distinct: ['plateStatus'],
      where: { plateStatus: { not: null } },
      orderBy: { plateStatus: 'asc' }
    });

    res.json(plateStatuses.map(car => car.plateStatus));
  } catch (error) {
    console.error('Error fetching plate statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;