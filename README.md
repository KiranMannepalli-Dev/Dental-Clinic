# Heshvitha Multi Speciality Dental Clinic

A modern, high-performance web application built for **Heshvitha Multi Speciality Dental Clinic**. It is designed with aesthetic excellence, smooth animations, and optimized load times to provide the best possible digital experience for patients.

## Features
- **Dynamic Content:** All content is centralized in a data file, allowing for easy updates to services, doctors, and blog posts without digging into code.
- **Beautiful UI/UX:** Built with Tailwind CSS and Lucide Icons, featuring custom micro-animations, glassmorphism, and smooth page transitions.
- **Patient-centric Features:** Includes an interactive Appointment booking form, dynamic Service/Doctor pages, and an immersive before & after Gallery.
- **Performance Optimized:** Statically generated pages via Next.js App Router for instant load times and perfect SEO.
- **Responsive Design:** Fully fluid and responsive across mobile, tablet, and desktop viewports.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion (or native CSS transitions)
- **Monorepo Tooling:** Turborepo

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/KiranMannepalli-Dev/Dental-Clinic.git
cd Dental-Clinic
\`\`\`

2. Install dependencies
\`\`\`bash
pnpm install
\`\`\`

3. Run the development server
\`\`\`bash
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure
- \`apps/web\`: The main Next.js frontend application.
  - \`src/app\`: Page routes (Home, About, Services, Doctors, Gallery, Achievements, Blog).
  - \`src/components\`: Reusable UI components (Navbar, Footer, Modals, Cards).
  - \`src/data\`: Centralized JSON data driving the site content (\`website-data.json\`).

## Updating Site Content
To update doctors, services, or hospital data, simply edit the JSON file located at:
\`apps/web/src/data/website-data.json\`
The site will dynamically read this file to populate pages.

---
*Built with ❤️ for Heshvitha Dental Hospital*
