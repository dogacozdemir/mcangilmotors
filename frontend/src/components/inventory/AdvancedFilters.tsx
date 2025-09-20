'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  bodyType?: string;
  plateStatus?: string;
  category?: { name: string };
  featured: boolean;
}

interface AdvancedFiltersProps {
  filters: {
    make: string;
    model: string;
    year_min: string;
    year_max: string;
    price_min: string;
    price_max: string;
    mileage_min: string;
    mileage_max: string;
    fuel_type: string;
    transmission: string;
    body_type: string;
    plate_status: string;
    category_id: string;
    featured: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  makes: string[];
  models: string[];
  cars: Car[];
  bodyTypes?: string[];
  plateStatuses?: string[];
}


export function AdvancedFilters({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters, 
  makes,
  models,
  cars,
  bodyTypes,
  plateStatuses
}: AdvancedFiltersProps) {
  const t = useTranslations();
  const [localPriceMin, setLocalPriceMin] = useState(filters.price_min || '');
  const [localPriceMax, setLocalPriceMax] = useState(filters.price_max || '');

  // Debounce function for price inputs
  const debouncedPriceChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (key: string, value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onFilterChange(key, value);
        }, 500); // 500ms delay
      };
    })(),
    [onFilterChange]
  );

  const handleFilterChange = (key: string, value: string) => {
    // "all" değerini boş string'e çevir
    const actualValue = value === 'all' ? '' : value;
    
    // Eğer marka değişiyorsa, model filtresini temizle
    if (key === 'make') {
      onFilterChange('model', '');
    }
    
    onFilterChange(key, actualValue);
  };

  const handlePriceChange = (key: 'price_min' | 'price_max', value: string) => {
    if (key === 'price_min') {
      setLocalPriceMin(value);
    } else {
      setLocalPriceMax(value);
    }
    debouncedPriceChange(key, value);
  };

  // Seçili markaya göre modelleri filtrele
  const filteredModels = filters.make && filters.make !== '' 
    ? Array.from(new Set(cars
        .filter(car => car.make === filters.make)
        .map(car => car.model)
        .filter(Boolean)
      ))
    : models;

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  // Price ranges
  const priceRanges = [
    { label: t('inventory.filters.priceRanges.all'), value: '', checked: true },
    { label: t('inventory.filters.priceRanges.0-15000'), value: '0-15000' },
    { label: t('inventory.filters.priceRanges.15000-30000'), value: '15000-30000' },
    { label: t('inventory.filters.priceRanges.30000-50000'), value: '30000-50000' },
    { label: t('inventory.filters.priceRanges.50000+'), value: '50000-999999' },
  ];

  // Body types
  const bodyTypesOptions = [
    { label: t('inventory.filters.bodyTypes.all'), value: 'all', checked: true },
    { label: t('inventory.filters.bodyTypes.sedan'), value: 'Sedan' },
    { label: t('inventory.filters.bodyTypes.suv'), value: 'SUV' },
    { label: t('inventory.filters.bodyTypes.hatchback'), value: 'Hatchback' },
    { label: t('inventory.filters.bodyTypes.coupe'), value: 'Coupe' },
    { label: t('inventory.filters.bodyTypes.cabrio'), value: 'Cabrio' },
    { label: t('inventory.filters.bodyTypes.van'), value: 'Van' },
    { label: t('inventory.filters.bodyTypes.stationWagon'), value: 'Station Wagon' },
    { label: t('inventory.filters.bodyTypes.pickup'), value: 'Pickup' }
  ];

  // Plate status
  const plateStatusesOptions = [
    { label: t('inventory.filters.plateStatuses.all'), value: 'all', checked: true },
    { label: t('inventory.filters.plateStatuses.plakalı'), value: 'plakalı' },
    { label: t('inventory.filters.plateStatuses.plakasız'), value: 'plakasız' }
  ];


  // Drive types (transmission)
  const driveTypes = [
    { label: t('inventory.filters.transmissions.all'), value: 'all', checked: true },
    { label: t('inventory.filters.transmissions.manuel'), value: 'Manuel' },
    { label: t('inventory.filters.transmissions.otomatik'), value: 'Otomatik' },
    { label: 'CVT', value: 'CVT' },
    { label: t('inventory.filters.transmissions.yarıOtomatik'), value: 'Yarı Otomatik' },
  ];

  // Fuel types
  const fuelTypes = [
    { label: t('inventory.filters.fuelTypes.all'), value: 'all', checked: true },
    { label: t('inventory.filters.fuelTypes.benzin'), value: 'Benzin' },
    { label: t('inventory.filters.fuelTypes.dizel'), value: 'Dizel' },
    { label: t('inventory.filters.fuelTypes.hibrit'), value: 'Hybrid' },
    { label: t('inventory.filters.fuelTypes.elektrik'), value: 'Elektrik' },
    { label: 'LPG', value: 'LPG' },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        
        {/* Make Filter */}
        <div className="relative w-full lg:w-auto px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
          <label className="absolute text-xs text-gray-600 font-bold duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] px-2">
            {t('inventory.make')}
          </label>
          <Select value={filters.make || 'all'} onValueChange={(value) => handleFilterChange('make', value)}>
            <SelectTrigger className="relative z-10 w-full text-left appearance-none bg-transparent outline-none text-sm pt-2 text-gray-500 border-none focus:ring-0">
              <SelectValue placeholder={t('inventory.make')} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">{t('inventory.make')}</SelectItem>
              {makes.map((make) => (
                <SelectItem key={make} value={make} className="hover:bg-amber-50">
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Filter */}
        <div className="relative w-full lg:w-auto px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
          <label className="absolute text-xs text-gray-600 font-bold duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] px-2">
            {t('inventory.model')}
          </label>
          <Select 
            value={filters.model || 'all'} 
            onValueChange={(value) => handleFilterChange('model', value)}
            disabled={!filters.make || filters.make === ''}
          >
            <SelectTrigger className="relative z-10 w-full text-left appearance-none bg-transparent outline-none text-sm pt-2 text-gray-500 border-none focus:ring-0 disabled:opacity-50">
              <SelectValue placeholder={filters.make ? t('inventory.model') : t('inventory.make')} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">{t('inventory.model')}</SelectItem>
              {filteredModels.map((model) => (
                <SelectItem key={model} value={model} className="hover:bg-amber-50">
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        {/* Year Filter */}
        <div className="relative w-full lg:w-auto px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
          <label className="absolute text-xs text-gray-600 font-bold duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] px-2">
            {t('inventory.year')}
          </label>
          <div className="flex gap-2 pt-2">
            <Select value={filters.year_min || 'all'} onValueChange={(value) => handleFilterChange('year_min', value)}>
              <SelectTrigger className="flex-1 text-left appearance-none bg-transparent outline-none text-sm text-gray-500 border-none focus:ring-0">
                <SelectValue placeholder={t('inventory.yearMin')} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">{t('inventory.yearMin')}</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="hover:bg-amber-50">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-400 text-sm flex items-center">-</span>
            <Select value={filters.year_max || 'all'} onValueChange={(value) => handleFilterChange('year_max', value)}>
              <SelectTrigger className="flex-1 text-left appearance-none bg-transparent outline-none text-sm text-gray-500 border-none focus:ring-0">
                <SelectValue placeholder={t('inventory.yearMax')} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">{t('inventory.yearMax')}</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="hover:bg-amber-50">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Filter */}
        <div className="relative w-full lg:w-auto px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
          <label className="absolute text-xs text-gray-600 font-bold duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] px-2">
            {t('inventory.price')}
          </label>
          <div className="flex gap-2 pt-2">
            <Input
              type="number"
              placeholder={t('inventory.priceMin')}
              value={localPriceMin}
              onChange={(e) => handlePriceChange('price_min', e.target.value)}
              className="flex-1 text-sm text-gray-500 border-none bg-transparent focus:ring-0 focus:border-none"
            />
            <span className="text-gray-400 text-sm flex items-center">-</span>
            <Input
              type="number"
              placeholder={t('inventory.priceMax')}
              value={localPriceMax}
              onChange={(e) => handlePriceChange('price_max', e.target.value)}
              className="flex-1 text-sm text-gray-500 border-none bg-transparent focus:ring-0 focus:border-none"
            />
          </div>
        </div>

        {/* Fuel Type Filter */}
        <div className="relative w-full lg:w-auto px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
          <label className="absolute text-xs text-gray-600 font-bold duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] px-2">
            {t('inventory.fuelType')}
          </label>
          <Select value={filters.fuel_type || 'all'} onValueChange={(value) => handleFilterChange('fuel_type', value)}>
            <SelectTrigger className="relative z-10 w-full text-left appearance-none bg-transparent outline-none text-sm pt-2 text-gray-500 border-none focus:ring-0">
              <SelectValue placeholder={t('inventory.filters.fuelTypes.all')} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">{t('inventory.filters.fuelTypes.all')}</SelectItem>
              {fuelTypes.slice(1).map((type) => (
                <SelectItem key={type.value} value={type.value} className="hover:bg-amber-50">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission Filter */}
        <div className="relative w-full lg:w-auto px-4 py-3 border-b lg:border-b-0 lg:border-r border-gray-200">
          <label className="absolute text-xs text-gray-600 font-bold duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] px-2">
            {t('inventory.transmission')}
          </label>
          <Select value={filters.transmission || 'all'} onValueChange={(value) => handleFilterChange('transmission', value)}>
            <SelectTrigger className="relative z-10 w-full text-left appearance-none bg-transparent outline-none text-sm pt-2 text-gray-500 border-none focus:ring-0">
              <SelectValue placeholder={t('inventory.filters.transmissions.all')} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">{t('inventory.filters.transmissions.all')}</SelectItem>
              {driveTypes.slice(1).map((type) => (
                <SelectItem key={type.value} value={type.value} className="hover:bg-amber-50">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="relative w-full lg:w-auto px-4 py-3">
          <Button
            onClick={onApplyFilters}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('inventory.search')}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}