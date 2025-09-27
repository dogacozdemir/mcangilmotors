# Mustafa Cangil Motors - Car Dealership Website

A modern, multi-language car dealership website built with Next.js, Node.js, and MySQL.

## Features

- 🚗 **Car Inventory Management** - Complete CRUD operations for cars
- 🌍 **Multi-language Support** - Turkish, English, Arabic, Russian
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **Advanced Search & Filters** - Find cars by make, model, year, price, etc.
- ❤️ **Wishlist** - Save favorite cars
- ⚖️ **Car Comparison** - Compare up to 3 cars
- 📝 **Blog System** - News and articles
- 👤 **Admin Panel** - Complete management interface
- 🔒 **Secure Authentication** - JWT-based admin system
- 📊 **SEO Optimized** - Meta tags, structured data, sitemap

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui**
- **next-intl** (Internationalization)
- **Framer Motion** (Animations)

### Backend
- **Node.js**
- **Express.js**
- **TypeScript**
- **Prisma ORM**
- **MySQL**
- **JWT Authentication**

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mcangilmotors.git
cd mcangilmotors
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your database credentials
```

4. **Database Setup**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run seed
```

5. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## Project Structure

```
mcangilmotors/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema & migrations
│   └── public/uploads/     # File uploads
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
└── nginx/                 # Nginx configuration
```

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars with filters
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Blog
- `GET /api/blog` - Get blog posts
- `GET /api/blog/:slug` - Get single post

### Admin
- `POST /api/auth/login` - Admin login
- `POST /api/admin/update-translations` - Update translations

## Deployment

### CloudPanel (Recommended)
1. Create new Node.js site in CloudPanel
2. Connect Git repository
3. Set environment variables
4. Configure PM2 processes
5. Enable SSL

### Manual VPS
See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="mysql://user:password@localhost:3306/mcangilmotors"
JWT_SECRET=your_jwt_secret
UPLOAD_PATH=/path/to/uploads
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Contact

**Mustafa Cangil Auto Trading Ltd.**
- Website: [mcangilmotors.com](https://mcangilmotors.com)
- Phone: +90 533 855 11 66
- Email: m.cangilmotors@gmail.com
- Address: Sakarya Sk No:10, Alsancak 2435, KKTC