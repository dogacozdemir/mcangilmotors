import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const messagesDir = path.join(process.cwd(), 'public', 'messages');
    const files = fs.readdirSync(messagesDir);
    
    const translations: Record<string, any> = {};
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const language = file.replace('.json', '');
        const filePath = path.join(messagesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        translations[language] = JSON.parse(content);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      files: files,
      translations: Object.keys(translations),
      sample: translations.tr?.home?.hero || 'No data found'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to load translations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

