// scripts/check-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const count = await prisma.admin.count();
    console.log('Admin count:', count);
  } catch (e) {
    console.error('CONNECTION ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
