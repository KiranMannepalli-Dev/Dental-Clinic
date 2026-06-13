import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DOCTORS = [
  {
    slug: "dr-arjun-mehta",
    firstName: "Arjun",
    lastName: "Mehta",
    email: "arjun.mehta@heshvithadental.com",
    qualification: "BDS, MDS (Orthodontics), FICD",
    specialization: "Orthodontist",
    experience: 14,
    bio: "Dr. Arjun Mehta is a renowned orthodontist with over 14 years of experience transforming smiles with precision. He trained at Manipal College of Dental Sciences and completed his MDS with a gold medal. He specializes in invisible aligners, ceramic braces, and complex bite corrections.",
    rating: 4.9,
    reviewCount: 312,
    consultationFee: 500,
    languages: ["English", "Hindi", "Telugu"],
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  },
  {
    slug: "dr-priya-reddy",
    firstName: "Priya",
    lastName: "Reddy",
    email: "priya.reddy@heshvithadental.com",
    qualification: "BDS, MDS (Cosmetic Dentistry)",
    specialization: "Cosmetic Dentist",
    experience: 10,
    rating: 4.8,
    reviewCount: 284,
    consultationFee: 600,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    bio: "Dr. Priya Reddy is Hyderabad's most sought-after cosmetic dentist, known for creating naturally beautiful smiles through veneers, whitening, and smile makeovers. She completed her advanced training in aesthetic dentistry from Thailand.",
  },
  {
    slug: "dr-rohan-sharma",
    firstName: "Rohan",
    lastName: "Sharma",
    email: "rohan.sharma@heshvithadental.com",
    qualification: "BDS, MDS (Oral & Maxillofacial Surgery)",
    specialization: "Oral Surgeon",
    experience: 12,
    rating: 4.9,
    reviewCount: 196,
    consultationFee: 700,
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
    bio: "Dr. Rohan Sharma handles complex surgical procedures, including wisdom tooth extractions, dental implants, and jaw surgeries. With a focus on patient comfort and pain management, he ensures safe and successful surgical outcomes.",
  },
  {
    slug: "dr-ananya-patel",
    firstName: "Ananya",
    lastName: "Patel",
    email: "ananya.patel@heshvithadental.com",
    qualification: "BDS, MDS (Pedodontics)",
    specialization: "Pediatric Dentist",
    experience: 8,
    rating: 4.7,
    reviewCount: 154,
    consultationFee: 400,
    avatarUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400",
    bio: "Dr. Ananya Patel is passionate about making dental visits fun for children. She specializes in child-friendly preventive care, dental sealants, and early interceptive orthodontics.",
  },
  {
    slug: "dr-vikram-rao",
    firstName: "Vikram",
    lastName: "Rao",
    email: "vikram.rao@heshvithadental.com",
    qualification: "BDS, MDS (Conservative Dentistry & Endodontics)",
    specialization: "Endodontist",
    experience: 11,
    rating: 4.8,
    reviewCount: 210,
    consultationFee: 500,
    avatarUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
    bio: "Dr. Vikram Rao is a root canal specialist using advanced rotary instruments and microscopes. Known for painless treatments and saving severely damaged teeth.",
  },
  {
    slug: "dr-sneha-iyer",
    firstName: "Sneha",
    lastName: "Iyer",
    email: "sneha.iyer@heshvithadental.com",
    qualification: "BDS, MDS (Periodontics)",
    specialization: "Periodontist",
    experience: 9,
    rating: 4.6,
    reviewCount: 128,
    consultationFee: 450,
    avatarUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400",
    bio: "Dr. Sneha Iyer is a gum disease specialist with expertise in laser gum therapy, bone grafting, and cosmetic gum reshaping for both health and aesthetics.",
  }
];

const categoryMap: Record<string, string> = {
  "Cosmetic": "COSMETIC",
  "General": "GENERAL",
  "Surgical": "ORAL_SURGERY",
  "Emergency": "EMERGENCY",
  "Preventive": "PREVENTIVE",
  "Diagnostics": "GENERAL",
  "Orthodontics": "ORTHODONTICS",
  "Advanced": "GENERAL",
  "Implants": "IMPLANTS",
  "Pediatric": "PEDIATRIC"
};

const MOCK_PATIENTS = [
  { firstName: "Rajesh", lastName: "Kumar", email: "rajesh.kumar@gmail.com", phone: "9876543201", gender: "MALE", bloodGroup: "O+" },
  { firstName: "Amit", lastName: "Patel", email: "amit.patel@gmail.com", phone: "9876543202", gender: "MALE", bloodGroup: "A+" },
  { firstName: "Sneha", lastName: "Reddy", email: "sneha.reddy@gmail.com", phone: "9876543203", gender: "FEMALE", bloodGroup: "B+" },
  { firstName: "Lakshmi", lastName: "Prasad", email: "lakshmi.prasad@gmail.com", phone: "9876543204", gender: "FEMALE", bloodGroup: "O-" },
  { firstName: "Vikranth", lastName: "Sen", email: "vikranth.sen@gmail.com", phone: "9876543205", gender: "MALE", bloodGroup: "AB+" },
  { firstName: "Divya", lastName: "Naidu", email: "divya.naidu@gmail.com", phone: "9876543206", gender: "FEMALE", bloodGroup: "A-" },
  { firstName: "Sai", lastName: "Kiran", email: "sai.kiran@gmail.com", phone: "9876543207", gender: "MALE", bloodGroup: "O+" },
  { firstName: "Venkat", lastName: "Rao", email: "venkat.rao@gmail.com", phone: "9876543208", gender: "MALE", bloodGroup: "B-" },
  { firstName: "Madhavi", lastName: "Latha", email: "madhavi.latha@gmail.com", phone: "9876543209", gender: "FEMALE", bloodGroup: "AB-" },
  { firstName: "Sandeep", lastName: "Sharma", email: "sandeep.sharma@gmail.com", phone: "9876543210", gender: "MALE", bloodGroup: "O+" },
  { firstName: "Rahul", lastName: "Varma", email: "rahul.varma@gmail.com", phone: "9876543211", gender: "MALE", bloodGroup: "A+" },
  { firstName: "Neha", lastName: "Gupta", email: "neha.gupta@gmail.com", phone: "9876543212", gender: "FEMALE", bloodGroup: "B+" },
  { firstName: "Kavitha", lastName: "Krishnan", email: "kavitha.krishnan@gmail.com", phone: "9876543213", gender: "FEMALE", bloodGroup: "O+" },
  { firstName: "Pavan", lastName: "Kalyan", email: "pavan.kalyan@gmail.com", phone: "9876543214", gender: "MALE", bloodGroup: "A+" },
  { firstName: "Anjali", lastName: "Devi", email: "anjali.devi@gmail.com", phone: "9876543215", gender: "FEMALE", bloodGroup: "O-" },
  { firstName: "Karthik", lastName: "Raj", email: "karthik.raj@gmail.com", phone: "9876543216", gender: "MALE", bloodGroup: "B+" },
  { firstName: "Swapna", lastName: "Rani", email: "swapna.rani@gmail.com", phone: "9876543217", gender: "FEMALE", bloodGroup: "AB+" },
  { firstName: "Naresh", lastName: "Babu", email: "naresh.babu@gmail.com", phone: "9876543218", gender: "MALE", bloodGroup: "O+" },
  { firstName: "Sunitha", lastName: "Murthy", email: "sunitha.murthy@gmail.com", phone: "9876543219", gender: "FEMALE", bloodGroup: "A-" },
  { firstName: "Suresh", lastName: "Goud", email: "suresh.goud@gmail.com", phone: "9876543220", gender: "MALE", bloodGroup: "B-" }
];

async function main() {
  console.log('Start seeding...');

  // 1. Seed Site Settings with working hours
  const workingHours = [
    { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: true },
    { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: true },
    { dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: true },
    { dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: true },
    { dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: true },
    { dayOfWeek: "SATURDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: true },
    { dayOfWeek: "SUNDAY", startTime: "09:00", endTime: "17:00", slotMinutes: 30, isAvailable: false }
  ];

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      workingHours: workingHours
    },
    create: {
      id: "singleton",
      clinicName: "BrightSmile Dental Hospital",
      tagline: "Advanced Dental Care for Your Perfect Smile",
      phone: "+91 98765 43210",
      emergencyPhone: "+91 98765 43211",
      email: "hello@brightsmile.com",
      address: "123 Jubilee Hills, Road No 36",
      city: "Hyderabad",
      mapLat: 17.4300,
      mapLng: 78.4069,
      socialLinks: { whatsapp: "", instagram: "", facebook: "", youtube: "" },
      workingHours: workingHours
    }
  });
  console.log('Site settings seeded.');

  // 2. Seed Doctors
  const dbDoctors = [];
  for (const doc of DOCTORS) {
    const dbDoc = await prisma.doctor.upsert({
      where: { slug: doc.slug },
      update: doc,
      create: doc,
    });
    dbDoctors.push(dbDoc);
  }
  console.log(`Seeded ${dbDoctors.length} doctors.`);

  // 3. Load and Seed Services from website-data.json
  let staticServices: any[] = [];
  try {
    const websiteDataPath = path.join(__dirname, '../../web/src/data/website-data.json');
    if (fs.existsSync(websiteDataPath)) {
      const websiteData = JSON.parse(fs.readFileSync(websiteDataPath, 'utf-8'));
      if (websiteData && Array.isArray(websiteData.services)) {
        staticServices = websiteData.services;
      }
    }
  } catch (err) {
    console.error('Could not read services from website-data.json:', err);
  }

  // Fallback if website-data.json cannot be read or is empty
  if (staticServices.length === 0) {
    staticServices = [
      {
        id: "dental-implants",
        slug: "dental-implants",
        name: "Dental Implants",
        title: "Dental Implants",
        shortDesc: "Permanent tooth replacement that looks, feels, and functions exactly like your natural teeth.",
        description: "Dental implants are titanium posts surgically placed into the jawbone beneath your gums. Once in place, they allow your dentist to mount replacement teeth onto them.",
        category: "Surgical",
        image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  const dbServices = [];
  for (const svc of staticServices) {
    const categoryEnum = (categoryMap[svc.category] || "GENERAL") as any;
    
    let priceMin = 1000;
    let priceMax = 3000;
    if (svc.id === 'dental-implants') {
      priceMin = 25000;
      priceMax = 45000;
    } else if (svc.category === 'Surgical') {
      priceMin = 5000;
      priceMax = 15000;
    } else if (svc.category === 'Orthodontics') {
      priceMin = 15000;
      priceMax = 40000;
    } else if (svc.category === 'Cosmetic') {
      priceMin = 3000;
      priceMax = 10000;
    } else if (svc.id === 'check-ups' || svc.id === 'teeth-cleaning') {
      priceMin = 500;
      priceMax = 1500;
    }

    const dbSvc = await prisma.service.upsert({
      where: { slug: svc.slug || svc.id },
      update: {
        name: svc.name || svc.title,
        shortDescription: svc.shortDesc || svc.description.substring(0, 150),
        fullDescription: svc.description || "",
        category: categoryEnum,
        imageUrl: svc.image || null,
        iconName: svc.icon || "Smile",
        priceMin: priceMin,
        priceMax: priceMax,
        isActive: true,
        symptoms: svc.symptoms || [],
        benefits: svc.benefits || [],
        recoveryTime: svc.recoveryTime || "1-2 days",
      },
      create: {
        slug: svc.slug || svc.id,
        name: svc.name || svc.title,
        shortDescription: svc.shortDesc || svc.description.substring(0, 150),
        fullDescription: svc.description || "",
        category: categoryEnum,
        imageUrl: svc.image || null,
        iconName: svc.icon || "Smile",
        duration: svc.duration || (svc.category === 'Surgical' ? 60 : 30),
        priceMin: priceMin,
        priceMax: priceMax,
        isActive: true,
        symptoms: svc.symptoms || [],
        benefits: svc.benefits || [],
        recoveryTime: svc.recoveryTime || "1-2 days",
      },
    });
    dbServices.push(dbSvc);
  }
  console.log(`Seeded ${dbServices.length} services.`);

  // 4. Seed Doctor Availabilities
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  for (const doctor of dbDoctors) {
    for (const day of daysOfWeek) {
      await prisma.doctorAvailability.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: doctor.id,
            dayOfWeek: day
          }
        },
        update: {
          startTime: "09:00",
          endTime: "17:00",
          slotMinutes: 30,
          isAvailable: true
        },
        create: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          slotMinutes: 30,
          isAvailable: true
        }
      });
    }
  }
  console.log('Seeded doctor availabilities (Mon-Sat, 9:00 AM - 5:00 PM).');

  // 5. Link Doctors to Services (DoctorService)
  for (const doc of dbDoctors) {
    const spec = doc.specialization.toLowerCase();
    let matched = dbServices.filter(s => {
      const cat = s.category;
      if (spec.includes('orthodontist')) return cat === 'ORTHODONTICS';
      if (spec.includes('cosmetic')) return cat === 'COSMETIC';
      if (spec.includes('oral surgeon')) return cat === 'ORAL_SURGERY' || s.slug === 'dental-implants';
      if (spec.includes('pediatric')) return cat === 'PEDIATRIC' || s.slug === 'paediatrics';
      if (spec.includes('endodontist')) return s.slug.includes('root-canal');
      if (spec.includes('periodontist')) return s.slug.includes('gum-treatment') || s.slug === 'teeth-cleaning';
      return false;
    });

    if (matched.length === 0) {
      matched = dbServices.filter(s => s.category === 'GENERAL').slice(0, 3);
    }

    for (const svc of matched) {
      await prisma.doctorService.upsert({
        where: {
          doctorId_serviceId: {
            doctorId: doc.id,
            serviceId: svc.id
          }
        },
        update: {},
        create: {
          doctorId: doc.id,
          serviceId: svc.id
        }
      });
    }
  }
  console.log('Linked doctors to their specialized services.');

  // 6. Upsert Admin
  console.log('Cleaning existing billing, appointments, reviews, contacts, patients, gallery...');
  await prisma.billingInvoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.beforeAfterImage.deleteMany();
  console.log('Database cleaned.');

  const dbPatients = [];
  for (const pat of MOCK_PATIENTS) {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - Math.floor(18 + Math.random() * 50));
    dob.setMonth(Math.floor(Math.random() * 12));
    dob.setDate(Math.floor(Math.random() * 28) + 1);

    const dbPat = await prisma.patient.create({
      data: {
        firstName: pat.firstName,
        lastName: pat.lastName,
        email: pat.email,
        phone: pat.phone,
        gender: pat.gender as any,
        bloodGroup: pat.bloodGroup,
        dateOfBirth: dob,
        allergies: Math.random() > 0.8 ? ["Penicillin"] : [],
        notes: Math.random() > 0.7 ? "Regular dental checkup patient." : null,
      }
    });
    dbPatients.push(dbPat);
  }
  console.log(`Seeded ${dbPatients.length} patients.`);

  console.log('Seeding historical completed appointments...');
  let invoiceCounter = 1;

  // Generate completed appointments for last 6 months (Dec to May) plus current month
  const todayDate = new Date();
  for (let m = 5; m >= 0; m--) {
    const targetMonthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - m, 1);
    
    // We want 10 completed appointments per month
    const apptsCount = 10;
    for (let i = 0; i < apptsCount; i++) {
      const patient = dbPatients[i % dbPatients.length];
      const doctor = dbDoctors[(i + m) % dbDoctors.length];
      
      const doctorServices = await prisma.doctorService.findMany({
        where: { doctorId: doctor.id },
        include: { service: true }
      });
      const service = doctorServices.length > 0 
        ? doctorServices[Math.floor(Math.random() * doctorServices.length)].service
        : dbServices[Math.floor(Math.random() * dbServices.length)];

      const apptDay = Math.floor(Math.random() * 25) + 1; // 1 to 25
      const apptDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), apptDay);
      apptDate.setHours(9 + Math.floor(Math.random() * 8), Math.random() > 0.5 ? 30 : 0, 0, 0);

      const bookingRef = `BS-${apptDate.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const price = Number(service.priceMin || 1000);

      const appt = await prisma.appointment.create({
        data: {
          bookingRef,
          patientId: patient.id,
          doctorId: doctor.id,
          serviceId: service.id,
          appointmentDate: apptDate,
          startTime: apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: new Date(apptDate.getTime() + 30 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'COMPLETED',
          notes: "Completed treatment successfully.",
          paymentStatus: 'PAID',
          paymentMethod: ['UPI', 'CARD', 'CASH'][Math.floor(Math.random() * 3)],
          createdAt: apptDate,
        }
      });

      await prisma.billingInvoice.create({
        data: {
          patientId: patient.id,
          invoiceNumber: `INV-${apptDate.getFullYear()}-${String(invoiceCounter++).padStart(4, '0')}`,
          items: [
            { description: service.name, amount: price }
          ],
          total: price,
          paymentStatus: 'PAID',
          paymentMethod: appt.paymentMethod,
          createdAt: apptDate,
        }
      });
    }
  }
  console.log(`Seeded historical completed appointments and invoices.`);

  console.log('Seeding recent weekly appointments...');
  for (let i = 1; i <= 7; i++) {
    const apptDate = new Date(todayDate);
    apptDate.setDate(todayDate.getDate() - i);
    apptDate.setHours(9 + Math.floor(Math.random() * 6), Math.random() > 0.5 ? 30 : 0, 0, 0);

    const patient = dbPatients[i % dbPatients.length];
    const doctor = dbDoctors[i % dbDoctors.length];
    
    const doctorServices = await prisma.doctorService.findMany({
      where: { doctorId: doctor.id },
      include: { service: true }
    });
    const service = doctorServices.length > 0 
      ? doctorServices[0].service
      : dbServices[0];

    const bookingRef = `BS-${apptDate.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const status = i % 4 === 0 ? 'CANCELLED' : (i % 3 === 0 ? 'PENDING' : 'CONFIRMED');

    await prisma.appointment.create({
      data: {
        bookingRef,
        patientId: patient.id,
        doctorId: doctor.id,
        serviceId: service.id,
        appointmentDate: apptDate,
        startTime: apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(apptDate.getTime() + 30 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: status as any,
        notes: status === 'CANCELLED' ? "Patient had a schedule conflict." : "Follow-up visit.",
        createdAt: apptDate,
      }
    });
  }
  console.log('Seeded recent weekly appointments.');

  console.log("Seeding today's schedule...");
  const todayTimes = [
    { start: "09:30", end: "10:00", status: "COMPLETED" },
    { start: "10:30", end: "11:00", status: "CONFIRMED" },
    { start: "11:30", end: "12:00", status: "CONFIRMED" },
    { start: "12:00", end: "12:30", status: "PENDING" },
    { start: "14:30", end: "15:00", status: "PENDING" },
    { start: "16:00", end: "16:30", status: "CANCELLED" }
  ];

  for (let i = 0; i < todayTimes.length; i++) {
    const timeInfo = todayTimes[i];
    const apptDate = new Date(todayDate);
    const [h, m] = timeInfo.start.split(':').map(Number);
    apptDate.setHours(h, m, 0, 0);

    const patient = dbPatients[(i + 3) % dbPatients.length];
    const doctor = dbDoctors[i % dbDoctors.length];
    const doctorServices = await prisma.doctorService.findMany({
      where: { doctorId: doctor.id },
      include: { service: true }
    });
    const service = doctorServices.length > 0 
      ? doctorServices[0].service
      : dbServices[0];

    const bookingRef = `BS-${apptDate.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    await prisma.appointment.create({
      data: {
        bookingRef,
        patientId: patient.id,
        doctorId: doctor.id,
        serviceId: service.id,
        appointmentDate: apptDate,
        startTime: timeInfo.start,
        endTime: timeInfo.end,
        status: timeInfo.status as any,
        notes: "Routine patient visit for today.",
        createdAt: apptDate,
      }
    });
  }
  console.log("Seeded today's schedule.");

  console.log('Seeding reviews...');
  const reviewsData = [
    { rating: 5, title: "Amazing Service!", content: "The doctors were incredibly gentle and explaining every step. Highly recommended!", isPublished: true, isVerified: true },
    { rating: 5, title: "Painless Root Canal", content: "I was terrified of root canal, but Dr. Vikram Rao made it completely painless and quick.", isPublished: true, isVerified: true },
    { rating: 4, title: "Great Experience", content: "Very neat clinic and professional staff. The wait time was slightly long, but the doctor was excellent.", isPublished: true, isVerified: true },
    { rating: 5, title: "Perfect aligners!", content: "Got clear aligners here. The progress has been fantastic and the doctors are very caring.", isPublished: false, isVerified: false },
    { rating: 5, title: "Wonderful kids dentist", content: "Dr. Ananya Patel is so good with children! My daughter didn't cry at all during her cavity filling.", isPublished: false, isVerified: true }
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    const rev = reviewsData[i];
    const patient = dbPatients[(i + 2) % dbPatients.length];
    const doctor = dbDoctors[i % dbDoctors.length];

    await prisma.review.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        rating: rev.rating,
        title: rev.title,
        content: rev.content,
        isPublished: rev.isPublished,
        isVerified: rev.isVerified,
        source: 'website',
        createdAt: new Date(todayDate.getTime() - i * 2 * 24 * 60 * 60 * 1000),
      }
    });
  }
  console.log('Seeded reviews.');

  console.log('Seeding contact submissions...');
  const contactsData = [
    { name: "John Doe", email: "john.doe@gmail.com", subject: "Inquiry about Invisalign Cost", message: "Hi, I wanted to know the price range and EMI options for Invisalign braces at your clinic. Thanks.", isRead: false },
    { name: "Meena Gupta", email: "meena.gupta@outlook.com", subject: "Emergency appointment request", message: "I have a severe toothache since last night. Do you have any slots open today morning?", isRead: false },
    { name: "Karan Johar", email: "karan.johar@yahoo.com", subject: "Do you accept HDFC insurance?", message: "I want to get a crown done and wanted to know if HDFC Ergo insurance is cashless or reimbursement.", isRead: true, isResolved: true },
    { name: "Rithvik Roy", email: "rithvik.roy@gmail.com", subject: "Teeth whitening duration", message: "How long does a typical professional whitening session take? Can I get it done in a lunch break?", isRead: true }
  ];

  for (let i = 0; i < contactsData.length; i++) {
    const contact = contactsData[i];
    await prisma.contactSubmission.create({
      data: {
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        isRead: contact.isRead,
        isResolved: contact.isResolved || false,
        createdAt: new Date(todayDate.getTime() - i * 1 * 24 * 60 * 60 * 1000)
      }
    });
  }
  console.log('Seeded contact submissions.');

  console.log('Seeding gallery images...');
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80",
      caption: "Our modern treatment room equipped with the latest dental chairs.",
      category: "clinic",
      altText: "Treatment Room",
      sortOrder: 1,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&q=80",
      caption: "Comfortable and spacious reception area for patients and families.",
      category: "clinic",
      altText: "Reception Area",
      sortOrder: 2,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1579684389782-64d84b5e902a?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e902a?w=400&q=80",
      caption: "Advanced digital sterilization autoclave room adhering to international safety protocols.",
      category: "clinic",
      altText: "Sterilization Room",
      sortOrder: 3,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=400&q=80",
      caption: "Our expert team of dentists and dental hygienists ready to serve you.",
      category: "team",
      altText: "Dental Team Group Photo",
      sortOrder: 4,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
      caption: "Weekly team briefing and clinic operations planning session.",
      category: "team",
      altText: "Team Briefing",
      sortOrder: 5,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&q=80",
      caption: "Live dental restoration using state-of-the-art dental lasers.",
      category: "operations",
      altText: "Laser Restoration Operation",
      sortOrder: 6,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80",
      caption: "Routine check-up utilizing intraoral cameras to show real-time feed.",
      category: "operations",
      altText: "Intraoral check-up",
      sortOrder: 7,
      isPublished: true
    },
    {
      url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
      thumbUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80",
      caption: "Digital OPG X-ray scanning operation for panoramic imaging.",
      category: "operations",
      altText: "OPG scanning",
      sortOrder: 8,
      isPublished: true
    }
  ];

  for (const img of galleryImages) {
    await prisma.galleryImage.create({
      data: img
    });
  }
  console.log(`Seeded ${galleryImages.length} gallery images.`);

  console.log('Seeding before-after transformation images...');
  const teethCleaningSvc = await prisma.service.findFirst({ where: { slug: "teeth-cleaning" } });
  const implantsSvc = await prisma.service.findFirst({ where: { slug: "dental-implants" } });
  const clearAlignersSvc = await prisma.service.findFirst({ where: { slug: "clear-aligners" } });
  const veneersSvc = await prisma.service.findFirst({ where: { slug: "veneers-crowns" } });

  const beforeAfterImages = [];

  if (teethCleaningSvc) {
    beforeAfterImages.push({
      serviceId: teethCleaningSvc.id,
      beforeUrl: "/images/transformations/whitening_before.webp",
      afterUrl: "/images/transformations/whitening_after.webp",
      caption: "Professional teeth whitening treatment completed in a single 45-minute appointment.",
      patientNote: "Patient showed immediate recovery and extreme satisfaction.",
      sortOrder: 1,
      isPublished: true
    });
  }

  if (implantsSvc) {
    beforeAfterImages.push({
      serviceId: implantsSvc.id,
      beforeUrl: "/images/transformations/implants_before.webp",
      afterUrl: "/images/transformations/implants_after.webp",
      caption: "Biocompatible titanium dental implant and ceramic crown restoration.",
      patientNote: "Completed over 3 months, full chewing functionality restored.",
      sortOrder: 2,
      isPublished: true
    });
  }

  if (clearAlignersSvc) {
    beforeAfterImages.push({
      serviceId: clearAlignersSvc.id,
      beforeUrl: "/images/transformations/braces_before.webp",
      afterUrl: "/images/transformations/braces_after.webp",
      caption: "Invisalign clear aligners orthodontic teeth alignment over 9 months.",
      patientNote: "Patient experienced minimal discomfort and perfect alignment.",
      sortOrder: 3,
      isPublished: true
    });
  }

  if (veneersSvc) {
    beforeAfterImages.push({
      serviceId: veneersSvc.id,
      beforeUrl: "/images/transformations/makeover_before.webp",
      afterUrl: "/images/transformations/makeover_after.webp",
      caption: "Complete smile makeover utilizing premium porcelain veneers.",
      patientNote: "Corrected spacing and staining in just 2 sessions.",
      sortOrder: 4,
      isPublished: true
    });
  }

  for (const ba of beforeAfterImages) {
    await prisma.beforeAfterImage.create({
      data: ba
    });
  }
  console.log(`Seeded ${beforeAfterImages.length} before-after images.`);

  const adminEmail = "kiran.mannepalli.in@gmail.com";
  const passwordHash = await bcrypt.hash("Hesvitha@_02", 10);
  
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: passwordHash
    },
    create: {
      name: "Super Admin",
      email: adminEmail,
      passwordHash: passwordHash,
      role: "SUPER_ADMIN"
    }
  });
  console.log('Seeded super admin: kiran.mannepalli.in@gmail.com (pw: Hesvitha@_02)');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
