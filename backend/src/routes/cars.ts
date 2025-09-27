import express, { Request, Response } from 'express';
import prisma from '../config/database';
import { validateCar, validateCarTranslation, handleValidationErrors, validateQueryParams } from '../middleware/validation';
import { carsCache, invalidateCache } from '../middleware/cache';
import { timeout } from '../middleware/timeout';

const router = express.Router();

// Get all unique makes
router.get('/makes', async (req, res) => {
  try {
    const makes = await prisma.car.findMany({
      select: {
        make: true
      },
      distinct: ['make'],
      orderBy: {
        make: 'asc'
      }
    });
    
    const uniqueMakes = makes.map(car => car.make).filter(Boolean);
    res.json(uniqueMakes);
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unique models (optionally filtered by make)
router.get('/models', async (req, res) => {
  try {
    const { make } = req.query;
    
    const whereCondition: any = {};
    if (make) {
      whereCondition.make = make as string;
    }
    
    const models = await prisma.car.findMany({
      select: {
        model: true
      },
      distinct: ['model'],
      where: whereCondition,
      orderBy: {
        model: 'asc'
      }
    });
    
    const uniqueModels = models.map(car => car.model).filter(Boolean);
    res.json(uniqueModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all cars with filters
router.get('/', timeout(15000), carsCache, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      make, 
      model, 
      year_min, 
      year_max, 
      yearFrom,
      yearTo,
      price_min, 
      price_max, 
      priceSort,
      mileage_min, 
      mileage_max, 
      fuel_type, 
      transmission, 
      engine,
      color,
      body_type,
      bodyType, // Support both body_type and bodyType
      plate_status,
      category_id,
      featured,
      status = 'available',
      lang = 'tr'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, Number(page) || 1);
    // Check if this is an admin request (no filters, high limit) or public request
    const isAdminRequest = !search && !make && !model && Number(limit) > 100;
    const maxLimit = isAdminRequest ? 2000 : 50; // Admin can get up to 2000, public max 50
    const limitNum = Math.min(maxLimit, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    
    
    const where: any = {};
    
    // Handle search parameter - multi-field search with validation
    if (search) {
      const searchTerm = (search as string).trim();
      
      // Validate search term
      if (searchTerm.length < 2) {
        return res.status(400).json({
          error: 'Invalid search term',
          message: 'Arama terimi en az 2 karakter olmalıdır.'
        });
      }
      
      if (searchTerm.length > 100) {
        return res.status(400).json({
          error: 'Search term too long',
          message: 'Arama terimi çok uzun. Maksimum 100 karakter olmalıdır.'
        });
      }
      
      // Sanitize search term (remove special characters that could cause issues)
      const sanitizedTerm = searchTerm.replace(/[<>]/g, '');
      
      // Case-insensitive search using raw SQL with ILIKE
      where.OR = [
        { make: { contains: sanitizedTerm } },
        { model: { contains: sanitizedTerm } },
        { fuelType: { contains: sanitizedTerm } },
        { color: { contains: sanitizedTerm } },
        { transmission: { contains: sanitizedTerm } },
        { engine: { contains: sanitizedTerm } },
        { bodyType: { contains: sanitizedTerm } }
      ];

      // Check if search term is a year (4 digits)
      const yearMatch = sanitizedTerm.match(/^\d{4}$/);
      if (yearMatch) {
        const year = parseInt(sanitizedTerm);
        if (year >= 1900 && year <= new Date().getFullYear() + 1) {
          where.OR.push({ year: { equals: year } });
        }
      }

      // Check if search term is a price range (numbers only)
      const priceMatch = sanitizedTerm.match(/^\d+$/);
      if (priceMatch) {
        const price = parseInt(sanitizedTerm);
        if (price > 0 && price <= 10000000) { // Reasonable price range
          where.OR.push({ 
            price: { 
              gte: price - 10000, // ±10k range
              lte: price + 10000 
            } 
          });
        }
      }
    }
    
    if (make) where.make = { contains: make as string };
    if (model) where.model = { contains: model as string };
    
    // Handle year filtering (support both old and new parameter names)
    const yearMin = yearFrom || year_min;
    const yearMax = yearTo || year_max;
    if (yearMin || yearMax) {
      where.year = {};
      if (yearMin) where.year.gte = Number(yearMin);
      if (yearMax) where.year.lte = Number(yearMax);
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
    // Support both body_type and bodyType parameters
    const bodyTypeFilter = bodyType || body_type;
    if (bodyTypeFilter) where.bodyType = bodyTypeFilter;
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

    let cars, total;
    
    if (search) {
      // Sanitize search term
      const searchTerm = Array.isArray(search) ? search[0] : search;
      const sanitizedTerm = typeof searchTerm === 'string' ? searchTerm.replace(/[<>]/g, '') : '';
      
      // For search queries, use raw SQL with ILIKE for case-insensitive search
      const searchQuery = `
        SELECT DISTINCT c.*, cat.name as category_name, cat.created_at as category_created_at, cat.updated_at as category_updated_at
        FROM "Car" c
        LEFT JOIN "Category" cat ON c."categoryId" = cat.id
        WHERE (
          LOWER(c.make) LIKE LOWER($1) OR 
          LOWER(c.model) LIKE LOWER($1) OR 
          LOWER(c."fuelType") LIKE LOWER($1) OR 
          LOWER(c.color) LIKE LOWER($1) OR 
          LOWER(c.transmission) LIKE LOWER($1) OR 
          LOWER(c.engine) LIKE LOWER($1) OR 
          LOWER(c."bodyType") LIKE LOWER($1)
        ) 
        AND c.status = 'available' 
        AND c."isSold" = false 
        AND c."isIncoming" = false 
        AND c."isReserved" = false
        ORDER BY c."createdAt" DESC
        LIMIT $2 OFFSET $3
      `;
      
      const countQuery = `
        SELECT COUNT(DISTINCT c.id)
        FROM "Car" c
        WHERE (
          LOWER(c.make) LIKE LOWER($1) OR 
          LOWER(c.model) LIKE LOWER($1) OR 
          LOWER(c."fuelType") LIKE LOWER($1) OR 
          LOWER(c.color) LIKE LOWER($1) OR 
          LOWER(c.transmission) LIKE LOWER($1) OR 
          LOWER(c.engine) LIKE LOWER($1) OR 
          LOWER(c."bodyType") LIKE LOWER($1)
        ) 
        AND c.status = 'available' 
        AND c."isSold" = false 
        AND c."isIncoming" = false 
        AND c."isReserved" = false
      `;
      
      const searchPattern = `%${sanitizedTerm}%`;
      
      const [carsResult, totalResult] = await Promise.all([
        prisma.$queryRawUnsafe(searchQuery, searchPattern, limitNum, skip),
        prisma.$queryRawUnsafe(countQuery, searchPattern)
      ]);
      
      cars = carsResult as any[];
      total = parseInt((totalResult as any)[0].count);
      
      // Get images and translations for the found cars
      if (cars.length > 0) {
        const carIds = cars.map((car: any) => car.id);
        const [images, translations] = await Promise.all([
          prisma.carImage.findMany({ where: { carId: { in: carIds } } }),
          prisma.carTranslation.findMany({ where: { carId: { in: carIds }, lang: lang as string } })
        ]);
        
        // Attach images and translations to cars
        cars = cars.map((car: any) => ({
          ...car,
          images: images.filter(img => img.carId === car.id),
          translations: translations.filter(trans => trans.carId === car.id),
          category: car.category_name ? {
            id: car.categoryId,
            name: car.category_name,
            createdAt: car.category_created_at,
            updatedAt: car.category_updated_at
          } : null
        }));
      }
    } else {
      // For non-search queries, use regular Prisma query
      [cars, total] = await Promise.all([
        prisma.car.findMany({
          where,
          skip,
          take: limitNum,
          include: {
            category: true,
            images: true,
            translations: {
              where: { lang: lang as string }
            }
          },
          orderBy: priceSort === 'asc' ? { price: 'asc' } : 
                   priceSort === 'desc' ? { price: 'desc' } : 
                   { createdAt: 'desc' }
        }),
        prisma.car.count({ where })
      ]);
    }

    res.json({
      cars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
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
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Received car data:', JSON.stringify(req.body, null, 2));
    
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
      coverImage
    } = req.body;

    // Basit car creation - sadece temel alanlar
    const car = await prisma.car.create({
      data: {
        make: make || null,
        model: model || null,
        year: year ? Number(year) : null,
        mileage: mileage ? Number(mileage) : null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        color: color || null,
        engine: engine || null,
        bodyType: bodyType || null,
        plateStatus: plateStatus || null,
        price: price ? Number(price) : null,
        featured: Boolean(featured),
        categoryId: categoryId ? Number(categoryId) : null,
        status: status || 'available',
        isSold: Boolean(isSold),
        isIncoming: Boolean(isIncoming),
        isReserved: Boolean(isReserved),
        soldAt: soldAt ? new Date(soldAt) : null,
        soldPrice: soldPrice ? Number(soldPrice) : null,
        expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
        coverImage: coverImage || null
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
router.put('/:id', async (req: Request, res: Response) => {
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
      coverImage,
      images = [],
      translations = {}
    } = req.body;

    console.log('Updating car with images:', { id, images, coverImage, translations });
    
    // Update car basic info first
    const car = await prisma.car.update({
      where: { id: Number(id) },
      data: {
        make: make || null,
        model: model || null,
        year: year ? Number(year) : null,
        mileage: mileage ? Number(mileage) : null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        color: color || null,
        engine: engine || null,
        bodyType: bodyType || null,
        plateStatus: plateStatus || null,
        price: price ? Number(price) : null,
        featured: Boolean(featured),
        categoryId: categoryId ? Number(categoryId) : null,
        status: status || 'available',
        isSold: Boolean(isSold),
        isIncoming: Boolean(isIncoming),
        isReserved: Boolean(isReserved),
        soldAt: soldAt ? new Date(soldAt) : null,
        soldPrice: soldPrice ? Number(soldPrice) : null,
        expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
        coverImage: coverImage || null
      }
    });

    // Update images if provided
    if (Array.isArray(images)) {
      // Delete existing images
      await prisma.carImage.deleteMany({
        where: { carId: Number(id) }
      });

      // Add new images
      if (images.length > 0) {
        const imageData = images.map((imagePath, index) => ({
          carId: Number(id),
          imagePath: imagePath,
          isMain: index === 0 && coverImage === imagePath, // First image is main if it matches coverImage
          sortOrder: index,
          altText: `Car Image ${index + 1}`
        }));

        await prisma.carImage.createMany({
          data: imageData
        });
      }
    }

    // Update translations if provided
    if (translations && Object.keys(translations).length > 0) {
      for (const [lang, translation] of Object.entries(translations)) {
        const translationData = translation as any;
        
        // Convert snake_case to camelCase for Prisma
        const prismaTranslationData = {
          title: translationData.title,
          description: translationData.description,
          seoTitle: translationData.seo_title,
          seoDescription: translationData.seo_description,
          seoKeywords: translationData.seo_keywords
        };
        
        await prisma.carTranslation.upsert({
          where: {
            carId_lang: {
              carId: Number(id),
              lang: lang
            }
          },
          update: prismaTranslationData,
          create: {
            carId: Number(id),
            lang: lang,
            ...prismaTranslationData
          }
        });
      }
    }

    // Return updated car with relations
    const updatedCar = await prisma.car.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        images: true,
        translations: true
      }
    });
      
    console.log(`Successfully updated car ${id}`);
    
    // Invalidate cars cache
    invalidateCache('cars:');
    
    res.json(updatedCar);
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

    // Invalidate cars cache
    invalidateCache('cars:');
    
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

    res.json(makes.map((car: { make: string | null }) => car.make).filter((make: string | null): make is string => make !== null));
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

    res.json(models.map((car: { model: string | null }) => car.model).filter((model: string | null): model is string => model !== null));
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

    res.json(bodyTypes.map((car: { bodyType: string | null }) => car.bodyType).filter((bodyType: string | null): bodyType is string => bodyType !== null));
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

    res.json(plateStatuses.map((car: { plateStatus: string | null }) => car.plateStatus).filter((plateStatus: string | null): plateStatus is string => plateStatus !== null));
  } catch (error) {
    console.error('Error fetching plate statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk upload cars from Excel/CSV
router.post('/bulk-upload', async (req, res) => {
  try {
    const { cars } = req.body;
    
    if (!cars || !Array.isArray(cars) || cars.length === 0) {
      return res.status(400).json({ 
        error: 'No cars data provided',
        message: 'Please provide an array of cars to upload'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      created: [] as any[]
    };

    // Process each car
    for (let i = 0; i < cars.length; i++) {
      try {
        const carData = cars[i];
        
        // Validate required fields
        if (!carData.make || !carData.model) {
          results.failed++;
          results.errors.push(`Car ${i + 1}: Make and model are required`);
          continue;
        }

        // Create car
        const car = await prisma.car.create({
          data: {
            make: carData.make || null,
            model: carData.model || null,
            year: carData.year ? parseInt(carData.year) : null,
            mileage: carData.mileage ? parseInt(carData.mileage) : null,
            fuelType: carData.fuelType || null,
            transmission: carData.transmission || null,
            color: carData.color || null,
            engine: carData.engine || null,
            bodyType: carData.bodyType || null,
            plateStatus: carData.plateStatus || null,
            price: carData.price ? parseFloat(carData.price) : null,
            featured: carData.featured === 'true' || carData.featured === true,
            categoryId: carData.categoryId ? parseInt(carData.categoryId) : null,
            status: carData.status || 'available',
            isSold: carData.isSold === 'true' || carData.isSold === true,
            isIncoming: carData.isIncoming === 'true' || carData.isIncoming === true,
            isReserved: carData.isReserved === 'true' || carData.isReserved === true,
            soldAt: carData.soldAt ? new Date(carData.soldAt) : null,
            soldPrice: carData.soldPrice ? parseFloat(carData.soldPrice) : null,
            expectedArrival: carData.expectedArrival ? new Date(carData.expectedArrival) : null
          }
        });

        // Create translations if provided
        if (carData.translations) {
          const translations = Array.isArray(carData.translations) 
            ? carData.translations 
            : Object.entries(carData.translations).map(([lang, data]: [string, any]) => ({
                lang,
                title: data.title || '',
                description: data.description || '',
                seoTitle: data.seoTitle || data.seo_title || '',
                seoDescription: data.seoDescription || data.seo_description || '',
                seoKeywords: data.seoKeywords || data.seo_keywords || ''
              }));

          for (const translation of translations) {
            await prisma.carTranslation.create({
              data: {
                carId: car.id,
                lang: translation.lang,
                title: translation.title,
                description: translation.description,
                seoTitle: translation.seoTitle,
                seoDescription: translation.seoDescription,
                seoKeywords: translation.seoKeywords
              }
            });
          }
        }

        results.success++;
        results.created.push({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year
        });

      } catch (error) {
        results.failed++;
        results.errors.push(`Car ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Error creating car ${i + 1}:`, error);
      }
    }

    // Invalidate cache
    invalidateCache('cars');

    res.json({
      success: true,
      message: `Bulk upload completed. ${results.success} cars created, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process bulk upload'
    });
  }
});

export default router;