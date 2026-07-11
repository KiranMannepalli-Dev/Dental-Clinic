import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
        console.warn("Google Sheets credentials not fully provided in environment variables.");
        return;
      }

      const jwt = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines in .env
        scopes: SCOPES,
      });

      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
      await this.doc.loadInfo(); 
      this.isInitialized = true;
      console.log(`Loaded Google Sheet: ${this.doc.title}`);
    } catch (error) {
      console.error("Failed to initialize Google Sheets service:", error);
    }
  }

  // Generic sync method
  private async syncRecord(sheetTitle: string, recordData: Record<string, any>, headers: string[]) {
    if (!this.isInitialized || !this.doc) await this.init();
    if (!this.isInitialized || !this.doc) return;

    try {
      let sheet = this.doc.sheetsByTitle[sheetTitle];
      if (!sheet) {
        sheet = await this.doc.addSheet({ title: sheetTitle, headerValues: headers });
      }

      const rows = await sheet.getRows();
      const existingRow = rows.find(r => r.get('id') === recordData.id);

      // Convert all values to string for Sheets
      const stringifiedData: Record<string, string> = {};
      for (const [key, value] of Object.entries(recordData)) {
         stringifiedData[key] = value !== null && value !== undefined ? value.toString() : '';
      }

      if (existingRow) {
        existingRow.assign(stringifiedData);
        await existingRow.save();
      } else {
        await sheet.addRow(stringifiedData);
      }
    } catch (error) {
      console.error(`Error syncing ${sheetTitle} to Google Sheets:`, error);
    }
  }

  // --- Specific Model Sync Wrappers ---

  async syncService(data: any) {
    await this.syncRecord('Services', {
      id: data.id, name: data.name, category: data.category,
      priceMin: data.priceMin, priceMax: data.priceMax, isActive: data.isActive
    }, ['id', 'name', 'category', 'priceMin', 'priceMax', 'isActive']);
  }

  async syncAppointment(data: any) {
    await this.syncRecord('Appointments', {
      id: data.id, bookingRef: data.bookingRef, patientId: data.patientId, doctorId: data.doctorId,
      serviceId: data.serviceId, appointmentDate: data.appointmentDate, startTime: data.startTime,
      status: data.status, paymentStatus: data.paymentStatus
    }, ['id', 'bookingRef', 'patientId', 'doctorId', 'serviceId', 'appointmentDate', 'startTime', 'status', 'paymentStatus']);
  }

  async syncPatient(data: any) {
    await this.syncRecord('Patients', {
      id: data.id, firstName: data.firstName, lastName: data.lastName,
      email: data.email, phone: data.phone, gender: data.gender, isActive: data.isActive
    }, ['id', 'firstName', 'lastName', 'email', 'phone', 'gender', 'isActive']);
  }

  async syncDoctor(data: any) {
    await this.syncRecord('Doctors', {
      id: data.id, firstName: data.firstName, lastName: data.lastName,
      specialization: data.specialization, experience: data.experience,
      consultationFee: data.consultationFee, isActive: data.isActive
    }, ['id', 'firstName', 'lastName', 'specialization', 'experience', 'consultationFee', 'isActive']);
  }

  async syncLead(data: any) {
    await this.syncRecord('Leads', {
      id: data.id, name: data.name, email: data.email, phone: data.phone,
      subject: data.subject, isRead: data.isRead, isResolved: data.isResolved
    }, ['id', 'name', 'email', 'phone', 'subject', 'isRead', 'isResolved']);
  }

  async syncBlog(data: any) {
    await this.syncRecord('Blogs', {
      id: data.id, title: data.title, category: data.category,
      status: data.status, viewCount: data.viewCount
    }, ['id', 'title', 'category', 'status', 'viewCount']);
  }

  async syncReview(data: any) {
    await this.syncRecord('Reviews', {
      id: data.id, patientId: data.patientId, rating: data.rating,
      title: data.title, isPublished: data.isPublished
    }, ['id', 'patientId', 'rating', 'title', 'isPublished']);
  }
}

export const googleSheetsService = new GoogleSheetsService();
