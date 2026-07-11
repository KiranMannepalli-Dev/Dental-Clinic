require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL || "postgresql://postgres.dgtmcdryhpbjhuiofsdc:CiACp8YnZeUfrgKR@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslaccept=accept_invalid_certs";

async function run() {
  console.log('Testing connection to DB URL:', url.replace(/:[^:@\n]+@/, ':****@')); // Hide password in logs
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('SUCCESS! Connected to the database! Result:', result);
  } catch (error) {
    console.error('FAILED to connect:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();

