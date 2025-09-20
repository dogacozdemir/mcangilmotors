import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  next();
};

// Car validation rules
export const validateCar: ValidationChain[] = [
  body('make')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Make must be between 1 and 100 characters'),
  
  body('model')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  
  body('price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Price must be a valid decimal number'),
  
  body('fuelType')
    .optional()
    .trim()
    .escape()
    .isIn(['Benzin', 'Dizel', 'Hibrit', 'Elektrik', 'LPG'])
    .withMessage('Invalid fuel type'),
  
  body('transmission')
    .optional()
    .trim()
    .escape()
    .isIn(['Manuel', 'Otomatik', 'Yarı Otomatik'])
    .withMessage('Invalid transmission type'),
  
  body('color')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Color must be less than 50 characters'),
  
  body('engine')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('Engine must be less than 100 characters'),
  
  body('bodyType')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Body type must be less than 50 characters'),
  
  body('status')
    .optional()
    .trim()
    .escape()
    .isIn(['available', 'sold', 'incoming', 'reserved'])
    .withMessage('Invalid status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value')
];

// Car translation validation rules
export const validateCarTranslation: ValidationChain[] = [
  body('lang')
    .trim()
    .escape()
    .isIn(['tr', 'en', 'ar', 'ru'])
    .withMessage('Language must be tr, en, ar, or ru'),
  
  body('title')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 5000 })
    .withMessage('Description must be less than 5000 characters'),
  
  body('seoTitle')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('SEO title must be less than 255 characters'),
  
  body('seoDescription')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('SEO description must be less than 500 characters'),
  
  body('seoKeywords')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('SEO keywords must be less than 1000 characters')
];

// Blog post validation rules
export const validateBlogPost: ValidationChain[] = [
  body('slug')
    .trim()
    .escape()
    .isLength({ min: 1, max: 255 })
    .withMessage('Slug must be between 1 and 255 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('imgUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL')
];

// Blog translation validation rules
export const validateBlogTranslation: ValidationChain[] = [
  body('lang')
    .trim()
    .escape()
    .isIn(['tr', 'en', 'ar', 'ru'])
    .withMessage('Language must be tr, en, ar, or ru'),
  
  body('title')
    .trim()
    .escape()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('content')
    .trim()
    .escape()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  
  body('seoTitle')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('SEO title must be less than 255 characters'),
  
  body('seoDescription')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('SEO description must be less than 500 characters'),
  
  body('seoKeywords')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('SEO keywords must be less than 1000 characters')
];

// Customer validation rules
export const validateCustomer: ValidationChain[] = [
  body('fullName')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage('Full name must be less than 150 characters'),
  
  body('phone')
    .optional()
    .trim()
    .escape()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Phone number must be valid'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
];

// Offer validation rules
export const validateOffer: ValidationChain[] = [
  body('carId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Car ID must be a positive integer'),
  
  body('customerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  
  body('message')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters'),
  
  body('status')
    .optional()
    .trim()
    .escape()
    .isIn(['pending', 'contacted', 'closed'])
    .withMessage('Status must be pending, contacted, or closed')
];

// Settings validation rules
export const validateSettings: ValidationChain[] = [
  body('instagram')
    .optional()
    .trim()
    .isURL()
    .withMessage('Instagram must be a valid URL'),
  
  body('facebook')
    .optional()
    .trim()
    .isURL()
    .withMessage('Facebook must be a valid URL'),
  
  body('whatsapp')
    .optional()
    .trim()
    .escape()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('WhatsApp number must be valid'),
  
  body('phone')
    .optional()
    .trim()
    .escape()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Phone number must be valid')
];

// Page validation rules
export const validatePage: ValidationChain[] = [
  body('slug')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
];

// Page translation validation rules
export const validatePageTranslation: ValidationChain[] = [
  body('lang')
    .trim()
    .escape()
    .isIn(['tr', 'en', 'ar', 'ru'])
    .withMessage('Language must be tr, en, ar, or ru'),
  
  body('title')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  
  body('content')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
  
  body('seoTitle')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('SEO title must be less than 255 characters'),
  
  body('seoDescription')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('SEO description must be less than 500 characters'),
  
  body('seoKeywords')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('SEO keywords must be less than 1000 characters')
];

// Category validation rules
export const validateCategory: ValidationChain[] = [
  body('name')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
];

// Auth validation rules
export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Query parameter validation
export const validateQueryParams: ValidationChain[] = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  body('sortBy')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Sort by must be less than 50 characters'),
  
  body('sortOrder')
    .optional()
    .trim()
    .escape()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

