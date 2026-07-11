require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function testSheet() {
  console.log("Testing Google Sheets Connection...");
  
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.error("❌ Missing environment variables!");
    return;
  }

  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo();
    console.log(`✅ Successfully loaded document: ${doc.title}`);
    
    const sheet = doc.sheetsByTitle['Services'];
    if (!sheet) {
       console.error("❌ Could not find a tab named 'Services'. Existing tabs:");
       Object.values(doc.sheetsById).forEach(s => console.log(`   - ${s.title}`));
       return;
    }
    
    console.log("✅ Found 'Services' tab!");
    const rows = await sheet.getRows();
    console.log(`✅ Current row count: ${rows.length}`);
    
  } catch (error) {
    console.error("❌ Error connecting to Google Sheets:");
    console.error(error.message);
  }
}

testSheet();
