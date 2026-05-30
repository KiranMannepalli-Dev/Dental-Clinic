"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
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
const categoryMap = {
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
    let staticServices = [];
    try {
        const websiteDataPath = path_1.default.join(__dirname, '../../web/src/data/website-data.json');
        if (fs_1.default.existsSync(websiteDataPath)) {
            const websiteData = JSON.parse(fs_1.default.readFileSync(websiteDataPath, 'utf-8'));
            if (websiteData && Array.isArray(websiteData.services)) {
                staticServices = websiteData.services;
            }
        }
    }
    catch (err) {
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
        const categoryEnum = (categoryMap[svc.category] || "GENERAL");
        let priceMin = 1000;
        let priceMax = 3000;
        if (svc.id === 'dental-implants') {
            priceMin = 25000;
            priceMax = 45000;
        }
        else if (svc.category === 'Surgical') {
            priceMin = 5000;
            priceMax = 15000;
        }
        else if (svc.category === 'Orthodontics') {
            priceMin = 15000;
            priceMax = 40000;
        }
        else if (svc.category === 'Cosmetic') {
            priceMin = 3000;
            priceMax = 10000;
        }
        else if (svc.id === 'check-ups' || svc.id === 'teeth-cleaning') {
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
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
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
            if (spec.includes('orthodontist'))
                return cat === 'ORTHODONTICS';
            if (spec.includes('cosmetic'))
                return cat === 'COSMETIC';
            if (spec.includes('oral surgeon'))
                return cat === 'ORAL_SURGERY' || s.slug === 'dental-implants';
            if (spec.includes('pediatric'))
                return cat === 'PEDIATRIC' || s.slug === 'paediatrics';
            if (spec.includes('endodontist'))
                return s.slug.includes('root-canal');
            if (spec.includes('periodontist'))
                return s.slug.includes('gum-treatment') || s.slug === 'teeth-cleaning';
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
    const adminEmail = "kiran.mannepalli.in@gmail.com";
    const passwordHash = await bcryptjs_1.default.hash("Hesvitha@_02", 10);
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
