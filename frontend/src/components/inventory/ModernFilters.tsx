"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

// ---------- Dropdown Props ----------
interface DropdownProps {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  disabled?: boolean;
  align?: "left" | "right";
}

// ---------- Dropdown Component ----------
function Dropdown({
  id,
  label,
  value,
  placeholder,
  children,
  isOpen,
  onToggle,
  onClose,
  disabled = false,
  align = "left",
}: DropdownProps) {
  const t = useTranslations();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // dış tıklama ile kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div
      className="relative mb-4.5 w-full px-5 transition duration-1000 rounded-md lg:rounded-none border border-neutral-200 dark:border-neutral-600 lg:border-y-0 lg:border-l-0 lg:border-r my-0 lg:my-2 py-2 lg:py-0"
      ref={dropdownRef}
    >
      {/* Label */}
      <label className="absolute lg:static text-[14px] text-neutral-600 dark:text-neutral-200 font-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 lg:px-0 peer-focus:px-2 peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
        {label}
      </label>

      {/* Button */}
      <button
        type="button"
        className={`relative z-10 w-full text-left appearance-none bg-transparent outline-none transition focus:border-primary active:border-primary text-[14px] pt-2 lg:pt-0 ${
          disabled
            ? "text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            : "text-neutral-500 dark:text-neutral-300"
        }`}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onToggle();
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        {value || placeholder}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="z-20 fixed inset-0 h-screen w-screen"
          onClick={onClose}
        ></div>
      )}

      {/* Dropdown content */}
      <div
        className={`z-50 absolute ${
          align === "right" ? "right-0" : "left-0"
        } top-12 w-full transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div
          className="p-3 bg-white dark:bg-[#0F161E] shadow-xl rounded-lg w-full md:w-72 border border-gray-200 dark:border-gray-700 max-h-56 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>

      {/* Chevron */}
      <span
        className={`absolute top-1/2 right-4 z-10 -translate-y-1/2 transition-transform duration-300 ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      >
        <ChevronDown className="text-neutral-600 dark:text-neutral-200 w-4 h-4" />
      </span>
    </div>
  );
}

// ---------- Main Component ----------
interface ModernFiltersProps {
  onFilterChange: (filter: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  filters: {
    make?: string;
    model?: string;
    year?: string;
    yearFrom?: string;
    yearTo?: string;
    priceSort?: string; // "asc" | "desc" | ""
    bodyType?: string;
  };
  makes?: string[];
  models?: string[];
  cars?: any[];
  bodyTypes?: string[];
}

export default function ModernFilters({
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  filters,
  makes = [],
  models = [],
  cars = [],
  bodyTypes = [],
}: ModernFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleClose = () => {
    setOpenDropdown(null);
  };

  // Get brand icon path
  const getBrandIcon = (make: string) => {
    const brandMap: { [key: string]: string } = {
      'Audi': '/brands/audi.png',
      'BMW': '/brands/bmw.png',
      'Ford': '/brands/ford.png',
      'Honda': '/brands/honda.png',
      'Hyundai': '/brands/hyundai.png',
      'Kia': '/brands/kia.png',
      'Mercedes': '/brands/mercedes.png',
      'Mercedes-Benz': '/brands/mercedes.png',
      'Nissan': '/brands/nissan.png',
      'Suzuki': '/brands/suzuki.png',
      'Toyota': '/brands/toyota.png',
      'Volkswagen': '/brands/volkswagen.png',
    };
    return brandMap[make] || null;
  };

  return (
    <div className="w-full bg-[#fff] dark:bg-[#0F161E] flex flex-col lg:flex-row justify-stretch border border-neutral-200 dark:border-neutral-600 p-4 lg:p-0 lg:border-stroke rounded-md lg:rounded-l-md gap-4 lg:gap-0">
      {/* Marka */}
      <Dropdown
        id="brand"
        label="Marka"
        value={filters.make}
        placeholder="Seçiniz"
        isOpen={openDropdown === "brand"}
        onToggle={() => handleToggle("brand")}
        onClose={handleClose}
      >
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <button
            type="button"
            className={`flex items-center py-1 px-2 gap-1 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out text-neutral-600 dark:text-neutral-200 ${
              !filters.make ? 'border border-red-500 bg-red-50 dark:bg-red-600 shadow-sm' : 'bg-[#F1F1F0] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onFilterChange("make", "");
              handleClose();
            }}
          >
            Tümü
          </button>
          {makes.map((brand) => {
            const brandIcon = getBrandIcon(brand);
            return (
              <button
                type="button"
                key={brand}
                className={`flex items-center py-1 px-2 gap-2 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out text-neutral-600 dark:text-neutral-200 hover:scale-102 active:scale-98 ${
                  filters.make === brand ? 'border border-red-500 bg-red-50 dark:bg-red-600 shadow-sm' : 'bg-[#F1F1F0] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onFilterChange("make", brand);
                  onFilterChange("model", ""); // Model'i temizle
                  handleClose();
                }}
              >
                {brandIcon && (
                  <Image
                    alt={brand}
                    src={brandIcon}
                    width={18}
                    height={18}
                    className="w-5 h-5 rounded-sm"
                    style={{ color: 'transparent' }}
                  />
                )}
                <span className="truncate">{brand}</span>
              </button>
            );
          })}
        </div>
        <hr className="h-px my-3 bg-[#F5F5F5] dark:bg-neutral-500 border-0" />
        <button
          type="button"
          className="w-full bg-black dark:bg-white text-neutral-200 dark:text-neutral-600 py-2 rounded-md font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-98"
          onClick={() => {
            onApplyFilters();
            handleClose();
          }}
        >
          Uygula
        </button>
      </Dropdown>

      {/* Model */}
      <Dropdown
        id="model"
        label="Model"
        value={filters.model}
        placeholder="Seçiniz"
        isOpen={openDropdown === "model"}
        onToggle={() => handleToggle("model")}
        onClose={handleClose}
        disabled={!filters.make}
      >
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <button
            type="button"
            className={`flex items-center py-1 px-2 gap-1 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out text-neutral-600 dark:text-neutral-200 ${
              !filters.model ? 'border border-red-500 bg-red-50 dark:bg-red-600 shadow-sm' : 'bg-[#F1F1F0] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onFilterChange("model", "");
              handleClose();
            }}
          >
            Tümü
          </button>
          {models.map((model) => (
            <button
              type="button"
              key={model}
              className={`flex items-center py-1 px-2 gap-2 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out text-neutral-600 dark:text-neutral-200 hover:scale-102 active:scale-98 ${
                filters.model === model ? 'border border-red-500 bg-red-50 dark:bg-red-600 shadow-sm' : 'bg-[#F1F1F0] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onFilterChange("model", model);
                handleClose();
              }}
            >
              {model}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Yıl */}
      <Dropdown
        id="year"
        label="Yıl"
        value={filters.yearFrom && filters.yearTo ? `${filters.yearFrom}-${filters.yearTo}` : ''}
        placeholder="Seçiniz"
        isOpen={openDropdown === "year"}
        onToggle={() => handleToggle("year")}
        onClose={handleClose}
      >
        <div className="flex flex-row gap-3 mb-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="block text-neutral-800 dark:text-neutral-100 text-sm lg:text-base font-medium tracking-wide text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Başlangıç
            </label>
            <div className="relative">
              <select
                id="year-start"
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-neutral-900 dark:text-neutral-100"
                value={filters.yearFrom || ''}
                onChange={(e) => {
                  onFilterChange("yearFrom", e.target.value);
                }}
              >
                <option value="" hidden className="text-neutral-400">Min</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year} className="text-neutral-900 dark:text-neutral-100">{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="block text-neutral-800 dark:text-neutral-100 text-sm lg:text-base font-medium tracking-wide text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Bitiş
            </label>
            <div className="relative">
              <select
                id="year-end"
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-neutral-900 dark:text-neutral-100"
                value={filters.yearTo || ''}
                onChange={(e) => {
                  onFilterChange("yearTo", e.target.value);
                }}
              >
                <option value="" hidden className="text-neutral-400">Max</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year} className="text-neutral-900 dark:text-neutral-100">{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Dropdown>

      {/* Body Type */}
      <Dropdown
        id="bodyType"
        label="Kasa Tipi"
        value={filters.bodyType}
        placeholder="Seçiniz"
        isOpen={openDropdown === "bodyType"}
        onToggle={() => handleToggle("bodyType")}
        onClose={handleClose}
      >
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <button
            type="button"
            className={`flex items-center py-1 px-2 gap-1 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out text-neutral-600 dark:text-neutral-200 ${
              !filters.bodyType ? 'border border-red-500 bg-red-50 dark:bg-red-600 shadow-sm' : 'bg-[#F1F1F0] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onFilterChange("bodyType", "");
              handleClose();
            }}
          >
            <span className="text-xs">Tümü</span>
          </button>
          {bodyTypes.map((bodyType) => (
            <button
              key={bodyType}
              type="button"
              className={`flex items-center py-1 px-2 gap-1 rounded-md text-sm font-semibold transition-all duration-150 ease-in-out text-neutral-600 dark:text-neutral-200 ${
                filters.bodyType === bodyType ? 'border border-red-500 bg-red-50 dark:bg-red-600 shadow-sm' : 'bg-[#F1F1F0] dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onFilterChange("bodyType", bodyType);
                handleClose();
              }}
            >
              <span className="text-xs">{bodyType}</span>
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Fiyat Sıralama */}
      <Dropdown
        id="priceSort"
        label="Fiyat Sıralama"
        value={
          filters.priceSort === "asc" ? "Artan" : 
          filters.priceSort === "desc" ? "Azalan" : ""
        }
        placeholder="Sıralama seçiniz"
        isOpen={openDropdown === "priceSort"}
        onToggle={() => handleToggle("priceSort")}
        onClose={handleClose}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-200 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
              <input
                className="w-4 h-4 rounded transition-colors duration-200 accent-red-600"
                type="radio"
                name="priceSort"
                checked={!filters.priceSort}
                onChange={() => {
                  onFilterChange("priceSort", "");
                }}
              />
              <span className="font-medium text-sm">Varsayılan</span>
            </label>
            <label className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-200 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
              <input
                className="w-4 h-4 rounded transition-colors duration-200 accent-red-600"
                type="radio"
                name="priceSort"
                checked={filters.priceSort === "asc"}
                onChange={() => {
                  onFilterChange("priceSort", "asc");
                }}
              />
              <span className="font-medium text-sm">Artan (Düşük → Yüksek)</span>
            </label>
            <label className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-200 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
              <input
                className="w-4 h-4 rounded transition-colors duration-200 accent-red-600"
                type="radio"
                name="priceSort"
                checked={filters.priceSort === "desc"}
                onChange={() => {
                  onFilterChange("priceSort", "desc");
                }}
              />
              <span className="font-medium text-sm">Azalan (Yüksek → Düşük)</span>
            </label>
          </div>
        </div>
      </Dropdown>

      {/* Search Button */}
      <button
        type="button"
        className="relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium px-4 py-3 sm:px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold border border-amber-500 rounded-none sm:rounded-r-md border-none cursor-pointer"
        onClick={() => {
          onApplyFilters();
        }}
      >
        Ara
      </button>
    </div>
  );
}
