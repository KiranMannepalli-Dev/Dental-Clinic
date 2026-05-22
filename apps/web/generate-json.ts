import fs from 'fs';
import path from 'path';

// Parse services.ts
const servicesContent = fs.readFileSync(path.join(__dirname, 'src/data/services.ts'), 'utf-8');

const getImages = (mainImage: string, poolOffset: number) => {
  const commonImages = [
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=80"
  ];
  return [
    mainImage,
    commonImages[poolOffset % commonImages.length],
    commonImages[(poolOffset + 1) % commonImages.length],
    commonImages[(poolOffset + 2) % commonImages.length]
  ];
};

const extractedServices = [];
const servicesRegex = /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*shortDesc:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*image:\s*"([^"]+)",[^}]*icon:\s*([A-Za-z]+),\s*slug:\s*"([^"]+)"\s*\}/g;

let match;
let offset = 0;
while ((match = servicesRegex.exec(servicesContent)) !== null) {
  extractedServices.push({
    id: match[1],
    title: match[2],
    name: match[3],
    description: match[4],
    shortDesc: match[5],
    category: match[6],
    image: match[7],
    images: getImages(match[7], offset),
    icon: match[8],
    slug: match[9]
  });
  offset++;
}

const data = {
  services: extractedServices,
  about: {
    stats: [
      { value: "20,000+", label: "Happy Patients" },
      { value: "15+", label: "Years Experience" },
      { value: "12+", label: "Dental Specialists" },
      { value: "98%", label: "Patient Satisfaction" }
    ],
    values: [
      { icon: "Heart", title: "Patient-First Care", description: "Every decision we make is guided by what's best for our patients' oral health and overall well-being." },
      { icon: "Microscope", title: "Clinical Excellence", description: "We invest in the latest technology and continuous education to deliver the highest standard of care." },
      { icon: "Shield", title: "Trust & Transparency", description: "Honest diagnosis, clear pricing, and no unnecessary treatments — we earn your trust every visit." },
      { icon: "UserCheck", title: "Personalized Approach", description: "Customized treatment plans tailored to each patient's unique dental needs and aesthetic goals." },
      { icon: "Sparkles", title: "Comfort & Compassion", description: "From our calming clinic environment to painless procedures, your comfort is always our priority." },
      { icon: "Eye", title: "Continuous Innovation", description: "Adopting breakthrough techniques and materials to provide faster, safer, and more effective treatments." }
    ],
    milestones: [
      { year: "2009", title: "The Beginning", description: "Heshvitha Dental founded with a single chair clinic in Kandukur." },
      { year: "2013", title: "Expanding Horizons", description: "Grew to a full multi-specialty dental hospital with 5 treatment rooms and 6 specialists." },
      { year: "2017", title: "Technology Leap", description: "Introduced 3D CBCT imaging, laser dentistry, and digital smile design technology." },
      { year: "2020", title: "10,000 Smiles", description: "Crossed 10,000 successful treatments. Launched Invisalign and implant specialty center." },
      { year: "2024", title: "Leading the Way", description: "Recognized as one of Kandukur's top-rated dental hospitals with 20,000+ patients served." }
    ]
  },
  footer: {
    quickLinks: [
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Dental Services" },
      { href: "/doctors", label: "Our Specialists" },
      { href: "/appointment", label: "Book Appointment" },
      { href: "/gallery", label: "Gallery" },
      { href: "/blog", label: "Dental Blog" },
      { href: "/contact", label: "Contact Us" }
    ],
    socials: [
      { label: "Facebook", href: "#", icon: "Facebook" },
      { label: "Instagram", href: "#", icon: "Instagram" },
      { label: "Twitter", href: "#", icon: "Twitter" },
      { label: "YouTube", href: "#", icon: "Youtube" }
    ],
    contactInfo: {
      address: "2 Floor, Heshvitha Dental, Government Hospital, Road, above New SBI Bank, opposite Muppa Roshaiah Hospital, Kota Reddy Nagar, Kandukur, Andhra Pradesh 523105",
      phone: "08374621025",
      displayPhone: "083746 21025",
      email: "hello@heshvithadental.com"
    },
    workingHours: [
      { day: "Mon – Fri", time: "9:00 AM – 8:00 PM" },
      { day: "Saturday", time: "9:00 AM – 6:00 PM" },
      { day: "Sunday", time: "Emergency Only", isEmergency: true }
    ]
  }
};

fs.writeFileSync(path.join(__dirname, 'src/data/website-data.json'), JSON.stringify(data, null, 2));
console.log('Successfully wrote website-data.json!');
