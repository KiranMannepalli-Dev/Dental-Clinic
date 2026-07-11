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

  // Example: Sync a service to a 'Services' sheet
  async syncService(serviceData: any) {
    if (!this.isInitialized || !this.doc) await this.init();
    if (!this.isInitialized || !this.doc) return;

    try {
      let sheet = this.doc.sheetsByTitle['Services'];
      if (!sheet) {
        // Create the sheet if it doesn't exist, with headers
        sheet = await this.doc.addSheet({ title: 'Services', headerValues: ['id', 'name', 'category', 'priceMin', 'priceMax', 'isActive'] });
      }

      // Check if row exists
      const rows = await sheet.getRows();
      const existingRow = rows.find(r => r.get('id') === serviceData.id);

      if (existingRow) {
        // Update
        existingRow.assign({
          name: serviceData.name,
          category: serviceData.category,
          priceMin: serviceData.priceMin?.toString() || '',
          priceMax: serviceData.priceMax?.toString() || '',
          isActive: serviceData.isActive?.toString() || 'false',
        });
        await existingRow.save();
      } else {
        // Create
        await sheet.addRow({
          id: serviceData.id,
          name: serviceData.name,
          category: serviceData.category,
          priceMin: serviceData.priceMin?.toString() || '',
          priceMax: serviceData.priceMax?.toString() || '',
          isActive: serviceData.isActive?.toString() || 'false',
        });
      }
    } catch (error) {
      console.error("Error syncing service to Google Sheets:", error);
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
