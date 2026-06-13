#!/usr/bin/env node
/**
 * Production startup script for Render.com
 * 1. Runs `prisma db push` to ensure the DB schema is up to date.
 * 2. Then starts the Express server.
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('[startup] NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[startup] DATABASE_URL set:', !!process.env.DATABASE_URL);

// Ensure we're in the api directory
process.chdir(__dirname);

if (process.env.DATABASE_URL) {
  console.log('[startup] Running prisma db push to sync schema...');
  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
      cwd: __dirname,
    });
    console.log('[startup] Database schema synced successfully.');
  } catch (err) {
    console.error('[startup] WARNING: prisma db push failed:', err.message);
    console.error('[startup] Continuing startup anyway — DB may be out of sync.');
  }
} else {
  console.warn('[startup] WARNING: DATABASE_URL not set — skipping prisma db push.');
}

console.log('[startup] Starting Express server...');
require('./dist/src/server.js');
