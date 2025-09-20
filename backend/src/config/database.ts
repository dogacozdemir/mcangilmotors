import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'], // Sadece uyarı ve hataları göster
});

export default prisma;
