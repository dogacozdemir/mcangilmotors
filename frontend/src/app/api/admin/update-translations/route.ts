import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { language, translations } = await request.json();
    
    // Validate language
    const validLanguages = ['tr', 'en', 'ar', 'ru'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }
    
    // Get the path to the messages directory in public folder
    const messagesDir = path.join(process.cwd(), 'public', 'messages');
    const filePath = path.join(messagesDir, `${language}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Translation file not found' }, { status: 404 });
    }
    
    // Write updated translations to file
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: `Translations updated for ${language}` 
    });
    
  } catch (error) {
    console.error('Error updating translations:', error);
    return NextResponse.json(
      { error: 'Failed to update translations' }, 
      { status: 500 }
    );
  }
}
