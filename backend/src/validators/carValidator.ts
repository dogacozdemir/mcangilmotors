import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { XSSProtection } from '../utils/sanitizer';

const carSchema = Joi.object({
  categoryId: Joi.number().integer().optional(),
  make: Joi.string().max(100).optional(),
  model: Joi.string().max(100).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  mileage: Joi.number().integer().min(0).optional(),
  fuelType: Joi.string().max(50).optional(),
  transmission: Joi.string().max(50).optional(),
  color: Joi.string().max(50).optional(),
  engine: Joi.string().max(100).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  featured: Joi.boolean().optional()
});

const carTranslationSchema = Joi.object({
  lang: Joi.string().valid('tr', 'en', 'ar', 'ru').required(),
  title: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  seoTitle: Joi.string().max(255).optional(),
  seoDescription: Joi.string().optional(),
  seoKeywords: Joi.string().optional()
});

export const validateCar = (req: Request, res: Response, next: NextFunction) => {
  // XSS Protection - Sanitize all string inputs
  if (req.body.make) {
    req.body.make = XSSProtection.sanitizeByContext(req.body.make, 'text');
  }
  if (req.body.model) {
    req.body.model = XSSProtection.sanitizeByContext(req.body.model, 'text');
  }
  if (req.body.fuelType) {
    req.body.fuelType = XSSProtection.sanitizeByContext(req.body.fuelType, 'text');
  }
  if (req.body.transmission) {
    req.body.transmission = XSSProtection.sanitizeByContext(req.body.transmission, 'text');
  }
  if (req.body.color) {
    req.body.color = XSSProtection.sanitizeByContext(req.body.color, 'text');
  }
  if (req.body.engine) {
    req.body.engine = XSSProtection.sanitizeByContext(req.body.engine, 'text');
  }

  // Check for XSS patterns
  const bodyString = JSON.stringify(req.body);
  if (XSSProtection.detectXSS(bodyString)) {
    return res.status(400).json({
      success: false,
      message: 'Security violation - Potentially malicious content detected'
    });
  }

  const { error } = carSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map((detail: any) => detail.message)
    });
  }
  
  next();
};

export const validateCarTranslation = (req: Request, res: Response, next: NextFunction) => {
  // XSS Protection - Sanitize all string inputs
  if (req.body.title) {
    req.body.title = XSSProtection.sanitizeByContext(req.body.title, 'text');
  }
  if (req.body.description) {
    req.body.description = XSSProtection.sanitizeByContext(req.body.description, 'html');
  }
  if (req.body.seoTitle) {
    req.body.seoTitle = XSSProtection.sanitizeByContext(req.body.seoTitle, 'text');
  }
  if (req.body.seoDescription) {
    req.body.seoDescription = XSSProtection.sanitizeByContext(req.body.seoDescription, 'text');
  }
  if (req.body.seoKeywords) {
    req.body.seoKeywords = XSSProtection.sanitizeByContext(req.body.seoKeywords, 'text');
  }

  // Check for XSS patterns
  const bodyString = JSON.stringify(req.body);
  if (XSSProtection.detectXSS(bodyString)) {
    return res.status(400).json({
      success: false,
      message: 'Security violation - Potentially malicious content detected'
    });
  }

  const { error } = carTranslationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map((detail: any) => detail.message)
    });
  }
  
  next();
};

