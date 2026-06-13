const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const models = [
      'admin',
      'patient',
      'appointment',
      'doctor',
      'service',
      'review',
      'blog',
      'galleryImage',
      'beforeAfterImage',
      'contactSubmission',
      'clinicHoliday',
      'insuranceProvider',
      'medicalTest',
      'billingInvoice',
      'patientReport'
    ];

    console.log('--- Database Table Row Counts ---');
    for (const model of models) {
      try {
        const count = await prisma[model].count();
        console.log(`${model}: ${count} rows`);
      } catch (err) {
        console.log(`${model}: ERROR (${err.message})`);
      }
    }
  } catch (error) {
    console.error('Error running count script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
