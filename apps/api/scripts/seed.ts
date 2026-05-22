import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DOCTORS = [
  {
    slug: "dr-arjun-mehta",
    firstName: "Arjun", lastName: "Mehta",
    email: "arjun.mehta@brightsmile.com",
    qualification: "BDS, MDS (Orthodontics), FICD",
    specialization: "Orthodontist",
    experience: 14,
    bio: "Dr. Arjun Mehta is a renowned orthodontist with over 14 years of experience transforming smiles with precision. He trained at Manipal College of Dental Sciences and completed his MDS with a gold medal. He specializes in invisible aligners, ceramic braces, and complex bite corrections.",
    rating: 4.9, reviewCount: 312,
    consultationFee: 500,
    languages: ["English", "Hindi", "Telugu"],
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400", // Unsplash doctor image
  },
  {
    slug: "dr-priya-reddy",
    firstName: "Priya", lastName: "Reddy",
    email: "priya.reddy@brightsmile.com",
    qualification: "BDS, MDS (Cosmetic Dentistry)",
    specialization: "Cosmetic Dentist",
    experience: 10, rating: 4.8, reviewCount: 284,
    consultationFee: 600,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    bio: "Dr. Priya Reddy is Hyderabad's most sought-after cosmetic dentist, known for creating naturally beautiful smiles through veneers, whitening, and smile makeovers. She completed her advanced training in aesthetic dentistry from Thailand.",
  }
];

const SERVICES = [
  {
    slug: "dental-implants",
    name: "Dental Implants",
    shortDescription: "Permanent tooth replacement that looks, feels, and functions exactly like your natural teeth.",
    fullDescription: "Dental implants are titanium posts surgically placed into the jawbone beneath your gums. Once in place, they allow your dentist to mount replacement teeth onto them. Implants provide stable support for artificial teeth.",
    category: "IMPLANTS",
    duration: 90,
    priceMin: 25000, priceMax: 45000,
    symptoms: ["Missing one or more teeth", "Loose dentures affecting quality of life", "Jawbone deterioration", "Difficulty chewing or speaking"],
    benefits: ["Permanent solution lasting 20+ years", "No impact on adjacent teeth", "Preserves jawbone density", "Natural appearance and feel", "No dietary restrictions"],
    recoveryTime: "3-6 months (full osseointegration)",
    faqs: [
      { question: "Is the procedure painful?", answer: "The procedure is performed under local anesthesia, ensuring you feel no pain. Mild discomfort for 2-3 days after is normal and managed with prescribed medication." },
      { question: "How long do implants last?", answer: "With proper oral hygiene, dental implants can last a lifetime. The crown may need replacement after 15-20 years due to normal wear." },
      { question: "Am I a good candidate?", answer: "Most adults with good general health qualify. Our doctors will evaluate your jawbone density, gum health, and medical history during consultation." },
    ],
  }
];

async function main() {
  console.log('Start seeding...');

  // Upsert Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
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
    }
  });
  console.log('Site settings seeded.');

  // Upsert Doctors
  for (const doc of DOCTORS) {
    await prisma.doctor.upsert({
      where: { email: doc.email },
      update: doc,
      create: doc,
    });
  }
  console.log(`Seeded ${DOCTORS.length} doctors.`);

  // Upsert Services
  // Note: category must match enum ServiceCategory (e.g., 'IMPLANTS')
  for (const svc of SERVICES) {
    const categoryEnum: any = svc.category;
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: { ...svc, category: categoryEnum },
      create: { ...svc, category: categoryEnum },
    });
  }
  console.log(`Seeded ${SERVICES.length} services.`);

  // Upsert Admin
  const adminEmail = "admin@brightsmile.com";
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Super Admin",
      email: adminEmail,
      passwordHash: passwordHash,
      role: "SUPER_ADMIN"
    }
  });
  console.log('Seeded super admin: admin@brightsmile.com (pw: admin123)');

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
