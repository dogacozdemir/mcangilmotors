import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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

// Basit CORS middleware (tek admin için yeterli)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // Image upload için daha büyük limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Basit routes (güvenlik önlemleri kaldırıldı)
app.use('/api/cars', carsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/blog', blogRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/offers', offersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/car-images', carImagesRouter);

// Additional API endpoints for makes and models
app.use('/api/makes', carsRouter);
app.use('/api/models', carsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mustafa Cangil Auto Trading Ltd. API is running' });
});

// Basit admin endpoint (güvenlik monitoring kaldırıldı)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error middleware triggered:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
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