const { PrismaClient } = require('@prisma/client');

const url = "postgresql://postgres.pbqozoxttnibpscyqzat:DentalClinic%40_02@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslaccept=accept_invalid_certs";

async function run() {
  console.log('Testing connection to pooler URL with sslaccept=accept_invalid_certs...');
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
