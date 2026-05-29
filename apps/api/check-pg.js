const { Client } = require('pg');

async function testConnection(connectionString, label) {
  console.log(`\n--- Testing ${label} ---`);
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
  // 1. Direct connection using IPv6
  const directUrl = "postgresql://postgres:DentalClinic%40_02@db.pbqozoxttnibpscyqzat.supabase.co:5432/postgres";
  await testConnection(directUrl, "Direct connection (IPv6)");

  // 2. Pooler connection in ap-northeast-1 (Tokyo)
  const poolerUrl = "postgresql://postgres.pbqozoxttnibpscyqzat:DentalClinic%40_02@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require";
  await testConnection(poolerUrl, "Pooler connection (IPv4)");
}

run();
