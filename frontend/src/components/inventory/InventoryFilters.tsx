'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export function InventoryFilters() {
  const t = useTranslations();
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    model: '',
    category: '',
    fuelType: '',
    transmission: '',
    yearRange: [2000, 2024],
    priceRange: [0, 5000000],
    mileageRange: [0, 200000],
    featured: false
  });

  const makes = [
    'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 
    'Ford', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru'
  ];

  const categories = [
    { value: '1', label: 'Standart' },
    { value: '2', label: 'Lüks' },
    { value: '3', label: 'Klasik' }
  ];

  const fuelTypes = [
    'Benzin', 'Dizel', 'Hybrid', 'Elektrik', 'LPG'
  ];

  const transmissions = [
    'Manuel', 'Otomatik', 'CVT', 'Yarı Otomatik'
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      category: '',
      fuelType: '',
      transmission: '',
      yearRange: [2000, 2024],
      priceRange: [0, 5000000],
      mileageRange: [0, 200000],
      featured: false
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('tr-TR').format(mileage) + ' km';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t('inventory.filters')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Temizle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Arama
          </label>
          <Input
            placeholder="Marka, model ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Make */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.make')}
          </label>
          <Select value={filters.make} onValueChange={(value) => handleFilterChange('make', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Marka seçin" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.category')}
          </label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.fuelType')}
          </label>
          <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange('fuelType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Yakıt türü seçin" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>
                  {fuel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.transmission')}
          </label>
          <Select value={filters.transmission} onValueChange={(value) => handleFilterChange('transmission', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Şanzıman seçin" />
            </SelectTrigger>
            <SelectContent>
              {transmissions.map((transmission) => (
                <SelectItem key={transmission} value={transmission}>
                  {transmission}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.priceRange')}
          </label>
          <div className="space-y-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              max={5000000}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Year Range */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.yearRange')}
          </label>
          <div className="space-y-2">
            <Slider
              value={filters.yearRange}
              onValueChange={(value) => handleFilterChange('yearRange', value)}
              max={2024}
              min={2000}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.yearRange[0]}</span>
              <span>{filters.yearRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Mileage Range */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {t('inventory.mileageRange')}
          </label>
          <div className="space-y-2">
            <Slider
              value={filters.mileageRange}
              onValueChange={(value) => handleFilterChange('mileageRange', value)}
              max={200000}
              min={0}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatMileage(filters.mileageRange[0])}</span>
              <span>{formatMileage(filters.mileageRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Featured */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={filters.featured}
            onChange={(e) => handleFilterChange('featured', e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Sadece öne çıkan araçlar
          </label>
        </div>

        {/* Apply Filters Button */}
        <Button className="w-full bg-brand-primary hover:bg-brand-primary/90">
          Filtreleri Uygula
        </Button>
      </CardContent>
    </Card>
  );
}







