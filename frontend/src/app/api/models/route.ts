import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    
    // Backend'den tüm modelleri çek
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/cars?limit=1000`);
    const data = await response.json();
    
    // Marka filtresi varsa uygula
    let models = data.cars?.map((car: any) => car.model).filter(Boolean) || [];
    
    if (make) {
      models = data.cars
        ?.filter((car: any) => car.make === make)
        ?.map((car: any) => car.model)
        ?.filter(Boolean) || [];
    }
    
    // Benzersiz modelleri çıkar
    const uniqueModels = Array.from(new Set(models));
    
    return NextResponse.json(uniqueModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json([], { status: 500 });
  }
}



