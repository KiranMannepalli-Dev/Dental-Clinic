require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const servicesCount = await prisma.service.count();
    console.log('Services Count:', servicesCount);
    
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    console.log('Active Services:', services);
  } catch (err) {
    console.error('Error querying services:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
