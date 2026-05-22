import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  // Vercel and most serverless platforms have a read-only filesystem.
  // Writing to local files is not supported in production.
  // To enable data persistence, connect a database or use a service like Vercel KV / Supabase.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { 
        error: 'File system writes are not supported in production (serverless environment). Please connect a database to enable dynamic data updates.',
        code: 'READONLY_FILESYSTEM'
      },
      { status: 501 }
    );
  }

  // Development only: write to local JSON file
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'src/data/website-data.json');
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/website-data.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}
