import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import './types/session'; // Import session types
import { generalRateLimit, authRateLimit, apiRateLimit, uploadRateLimit } from './middleware/rateLimiter';
import { securityHeaders, csrfProtection, generateCSRFToken, requestSizeLimiter, adminIPWhitelist, rateLimitPerIP } from './middleware/security';
import { sqlInjectionProtection, validateNumericInput, validateStringInput, suspiciousQueryRateLimit } from './middleware/sqlInjectionProtection';

// Import routes
import carsRouter from './routes/cars';
import categoriesRouter from './routes/categories';
import blogRouter from './routes/blog';
import pagesRouter from './routes/pages';
import customersRouter from './routes/customers';
import offersRouter from './routes/offers';
import settingsRouter from './routes/settings';
import uploadRouter from './routes/upload';
import carImagesRouter from './routes/car-images';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware (must be first)
app.use(securityHeaders);
app.use(requestSizeLimiter(10 * 1024 * 1024)); // 10MB limit

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// CORS middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-CSRF-Token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF protection for all routes except public ones
app.use(generateCSRFToken);

// SQL Injection protection
app.use(sqlInjectionProtection);
app.use(validateNumericInput);
app.use(validateStringInput);
app.use(suspiciousQueryRateLimit);

// Rate limiting
app.use(generalRateLimit);

// Static file serving
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes with specific rate limiting and security
app.use('/api/cars', apiRateLimit, carsRouter);
app.use('/api/categories', apiRateLimit, categoriesRouter);
app.use('/api/blog', apiRateLimit, blogRouter);
app.use('/api/pages', apiRateLimit, pagesRouter);
app.use('/api/customers', apiRateLimit, customersRouter);
app.use('/api/offers', apiRateLimit, offersRouter);
app.use('/api/settings', apiRateLimit, settingsRouter);
app.use('/api/upload', uploadRateLimit, uploadRouter);
app.use('/api/car-images', uploadRateLimit, carImagesRouter);

// Admin routes with enhanced security
app.use('/api/admin', adminIPWhitelist(), rateLimitPerIP(15 * 60 * 1000, 50)); // 50 requests per 15 minutes for admin

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mustafa Cangil Auto Trading Ltd. API is running' });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session?.csrfToken || '' });
});

// Security monitoring endpoint (admin only)
app.get('/api/admin/security/queries', (req, res) => {
  // This would require admin authentication in production
  const { QueryLogger } = require('./utils/queryLogger');
  const queryLogger = QueryLogger.getInstance();
  
  res.json({
    suspiciousQueries: queryLogger.getSuspiciousQueries(),
    statistics: queryLogger.getStatistics()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🚗 Cars API: http://localhost:${PORT}/api/cars`);
  console.log(`📝 Blog API: http://localhost:${PORT}/api/blog`);
  console.log(`⚙️ Settings API: http://localhost:${PORT}/api/settings`);
});