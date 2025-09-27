import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Backend'den tüm markaları çek
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/cars?limit=1000`);
    const data = await response.json();
    
    // Benzersiz markaları çıkar
    const makes = Array.from(new Set(
      data.cars?.map((car: any) => car.make).filter(Boolean) || []
    ));
    
    return NextResponse.json(makes);
  } catch (error) {
    console.error('Error fetching makes:', error);
    return NextResponse.json([], { status: 500 });
  }
}



