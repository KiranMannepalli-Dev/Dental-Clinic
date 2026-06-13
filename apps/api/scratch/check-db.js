require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    const res = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection SUCCESS:', res);
  } catch (err) {
    console.error('Database connection FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
