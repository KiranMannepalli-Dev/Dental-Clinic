require('dotenv').config();
const { Client } = require('pg');

async function testConnection(connectionString, label) {
  const sanitizedString = connectionString.replace(/:[^:@\n]+@/, ':****@');
  console.log(`\n--- Testing ${label} (${sanitizedString}) ---`);
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('SUCCESS! Connected to DB.');
    console.log('Version:', res.rows[0].version);
  } catch (err) {
    console.error('FAILED to connect:');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Full Error:', err);
  } finally {
    await client.end();
  }
}

async function run() {
  // 1. Direct connection
  const directUrl = process.env.DIRECT_URL || "postgresql://postgres.dgtmcdryhpbjhuiofsdc:Hesvitha%40_02@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  await testConnection(directUrl, "Direct connection");

  // 2. Pooler connection
  const poolerUrl = process.env.DATABASE_URL || "postgresql://postgres.dgtmcdryhpbjhuiofsdc:Hesvitha%40_02@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
  await testConnection(poolerUrl, "Pooler connection");
}

run();

