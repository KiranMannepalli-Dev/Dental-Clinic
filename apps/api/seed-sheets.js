require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const prisma = new PrismaClient();

async function getOrCreateSheet(doc, title, headers) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    console.log(`Creating tab: ${title}`);
    sheet = await doc.addSheet({ title, headerValues: headers });
  }
  return sheet;
}

async function seedTable(sheet, records, label) {
  console.log(`\nSyncing ${records.length} records to [${label}]...`);
  let success = 0;
  for (const record of records) {
    try {
      const stringified = {};
      for (const [k, v] of Object.entries(record)) {
        stringified[k] = v !== null && v !== undefined ? v.toString() : '';
      }
      await sheet.addRow(stringified);
      success++;
    } catch (e) {
      console.error(`  ❌ Failed: ${e.message}`);
    }
  }
  console.log(`  ✅ ${success}/${records.length} synced.`);
}

async function main() {
  console.log("Connecting to Google Sheets...");
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
  await doc.loadInfo();
  console.log(`✅ Connected to: "${doc.title}"`);

  // ── 1. Services ──────────────────────────────────────────────
  const servicesSheet = await getOrCreateSheet(doc, 'Services', ['id', 'name', 'category', 'priceMin', 'priceMax', 'isActive']);
  const existingServiceRows = await servicesSheet.getRows();
  const existingServiceIds = new Set(existingServiceRows.map(r => r.get('id')));
  const services = await prisma.service.findMany();
  const newServices = services.filter(s => !existingServiceIds.has(s.id));
  if (newServices.length === 0) {
    console.log('\n[Services] Already up to date!');
  } else {
    await seedTable(servicesSheet, newServices.map(s => ({
      id: s.id, name: s.name, category: s.category,
      priceMin: s.priceMin, priceMax: s.priceMax, isActive: s.isActive
    })), 'Services');
  }

  // ── 2. Doctors ───────────────────────────────────────────────
  const doctorsSheet = await getOrCreateSheet(doc, 'Doctors', ['id', 'firstName', 'lastName', 'specialization', 'experience', 'consultationFee', 'isActive']);
  await seedTable(doctorsSheet, (await prisma.doctor.findMany()).map(d => ({
    id: d.id, firstName: d.firstName, lastName: d.lastName,
    specialization: d.specialization, experience: d.experience,
    consultationFee: d.consultationFee, isActive: d.isActive
  })), 'Doctors');

  // ── 3. Patients ──────────────────────────────────────────────
  const patientsSheet = await getOrCreateSheet(doc, 'Patients', ['id', 'firstName', 'lastName', 'email', 'phone', 'gender', 'isActive']);
  await seedTable(patientsSheet, (await prisma.patient.findMany()).map(p => ({
    id: p.id, firstName: p.firstName, lastName: p.lastName,
    email: p.email, phone: p.phone, gender: p.gender, isActive: p.isActive
  })), 'Patients');

  // ── 4. Appointments ──────────────────────────────────────────
  const apptSheet = await getOrCreateSheet(doc, 'Appointments', ['id', 'bookingRef', 'patientId', 'doctorId', 'serviceId', 'appointmentDate', 'startTime', 'status', 'paymentStatus']);
  await seedTable(apptSheet, (await prisma.appointment.findMany()).map(a => ({
    id: a.id, bookingRef: a.bookingRef, patientId: a.patientId, doctorId: a.doctorId,
    serviceId: a.serviceId, appointmentDate: a.appointmentDate, startTime: a.startTime,
    status: a.status, paymentStatus: a.paymentStatus
  })), 'Appointments');

  // ── 5. Leads (Contact Submissions) ───────────────────────────
  const leadsSheet = await getOrCreateSheet(doc, 'Leads', ['id', 'name', 'email', 'phone', 'subject', 'isRead', 'isResolved']);
  await seedTable(leadsSheet, (await prisma.contactSubmission.findMany()).map(c => ({
    id: c.id, name: c.name, email: c.email, phone: c.phone,
    subject: c.subject, isRead: c.isRead, isResolved: c.isResolved
  })), 'Leads');

  // ── 6. Blogs ─────────────────────────────────────────────────
  const blogsSheet = await getOrCreateSheet(doc, 'Blogs', ['id', 'title', 'category', 'status', 'viewCount']);
  await seedTable(blogsSheet, (await prisma.blog.findMany()).map(b => ({
    id: b.id, title: b.title, category: b.category, status: b.status, viewCount: b.viewCount
  })), 'Blogs');

  // ── 7. Reviews ───────────────────────────────────────────────
  const reviewsSheet = await getOrCreateSheet(doc, 'Reviews', ['id', 'patientId', 'rating', 'title', 'isPublished']);
  await seedTable(reviewsSheet, (await prisma.review.findMany()).map(r => ({
    id: r.id, patientId: r.patientId, rating: r.rating, title: r.title, isPublished: r.isPublished
  })), 'Reviews');

  console.log('\n🎉 All tables synced to Google Sheets!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
