'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BulkUploadResults } from './BulkUploadResults';
import * as XLSX from 'xlsx';

interface BulkUploadProps {
  onUploadComplete: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  errors?: string[];
  totalRows?: number;
  processedRows?: number;
  failedRows?: number;
  processedCars?: any[];
  failedCars?: any[];
}

export function BulkUpload({ onUploadComplete }: BulkUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadResult({
        success: false,
        message: 'Geçersiz dosya formatı. Sadece CSV ve Excel dosyaları desteklenir.'
      });
      return;
    }

    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      // Parse file based on type
      let csvData: string[][];
      
      if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        csvData = await parseExcelFile(file);
      } else {
        csvData = await parseCSVFile(file);
      }
      
      if (!csvData || csvData.length === 0) {
        setUploadResult({
          success: false,
          message: 'Dosya boş veya geçersiz format.'
        });
        return;
      }

      // Convert CSV data to cars array with better validation
      const cars = csvData.map((row, index) => {
        // Skip header row
        if (index === 0) return null;
        
        // Validate required fields
        if (!row[0] || !row[1]) {
          throw new Error(`Satır ${index + 1}: Marka ve Model alanları zorunludur`);
        }
        
        // Parse numeric values with error handling
        let year = null;
        if (row[2]) {
          const parsedYear = parseInt(row[2].toString().replace(/[^0-9]/g, ''));
          if (parsedYear >= 1900 && parsedYear <= new Date().getFullYear() + 1) {
            year = parsedYear;
          }
        }
        
        let mileage = null;
        if (row[3]) {
          const parsedMileage = parseInt(row[3].toString().replace(/[^0-9]/g, ''));
          if (parsedMileage >= 0) {
            mileage = parsedMileage;
          }
        }
        
        let price = null;
        if (row[20]) {
          const parsedPrice = parseFloat(row[20].toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
          if (parsedPrice >= 0) {
            price = parsedPrice;
          }
        }
        
        return {
          make: row[0].toString().trim(),
          model: row[1].toString().trim(),
          year,
          mileage,
          color: row[4] ? row[4].toString().trim() : '',
          engine: row[5] ? row[5].toString().trim() : '',
          fuelType: row[6] ? row[6].toString().trim() : '',
          transmission: row[7] ? row[7].toString().trim() : '',
          bodyType: row[8] ? row[8].toString().trim() : '',
          plateStatus: row[10] ? row[10].toString().trim() : '',
          isIncoming: row[11] === 'Evet' || row[11] === 'Yes' || row[11] === 'true' || row[11] === '1',
          price,
          translations: {
            tr: {
              title: row[12] ? row[12].toString().trim() : '',
              description: row[13] ? row[13].toString().trim() : ''
            },
            en: {
              title: row[14] ? row[14].toString().trim() : '',
              description: row[15] ? row[15].toString().trim() : ''
            },
            ar: {
              title: row[16] ? row[16].toString().trim() : '',
              description: row[17] ? row[17].toString().trim() : ''
            },
            ru: {
              title: row[18] ? row[18].toString().trim() : '',
              description: row[19] ? row[19].toString().trim() : ''
            }
          }
        };
      }).filter(car => car !== null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/cars/bulk-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cars }),
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          totalRows: cars.length,
          processedRows: result.results?.success || 0,
          failedRows: result.results?.failed || 0,
          processedCars: result.results?.created || [],
          errors: result.results?.errors || []
        });
        onUploadComplete();
      } else {
        setUploadResult({
          success: false,
          message: result.message || 'Yükleme sırasında bir hata oluştu.',
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Better error handling for production
      let errorMessage = 'Dosya yüklenirken bir hata oluştu.';
      
      if (error instanceof Error) {
        if (error.message.includes('parse edilemedi')) {
          errorMessage = error.message;
        } else if (error.message.includes('Satır')) {
          errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Sunucuya bağlanırken hata oluştu. Lütfen internet bağlantınızı kontrol edin.';
        }
      }
      
      setUploadResult({
        success: false,
        message: errorMessage,
        errors: error instanceof Error ? [error.message] : ['Bilinmeyen hata']
      });
    } finally {
      setIsUploading(false);
    }
  };

  const parseCSVFile = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let text = e.target?.result as string;
          
          // Handle BOM (Byte Order Mark) for UTF-8 files
          if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
          }
          
          // Try different line endings
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            resolve([]);
            return;
          }
          
          const data = lines.map(line => parseCSVLine(line));
          
          resolve(data);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(new Error(`CSV dosyası parse edilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      // Use UTF-8 encoding explicitly
      reader.readAsText(file, 'UTF-8');
    });
  };

  const parseExcelFile = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to CSV format (array of arrays)
          const csvData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: '',
            raw: false // Convert numbers to strings
          }) as string[][];
          
          // Filter out empty rows
          const filteredData = csvData.filter(row => 
            row.some(cell => cell && cell.toString().trim() !== '')
          );
          
          resolve(filteredData);
        } catch (error) {
          console.error('Excel parsing error:', error);
          reject(new Error(`Excel dosyası parse edilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Excel dosyası okunamadı'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote (double quote)
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        // End of field (support both comma and semicolon as delimiter)
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  };

  const downloadTemplate = (format: 'csv' | 'excel' = 'excel') => {
    const headers = [
      'Marka', 'Model', 'YIL', 'KM', 'Renk', 'Motor Gücü', 'Yakıt Türü', 'Vites Tipi', 
      'Kasa Tipi', 'Kategori', 'Plaka Durumu', 'Yolda Gelen', 'TR Başlık', 'TR Açıklama', 
      'EN Başlık', 'EN Açıklama', 'AR Başlık', 'AR Açıklama', 'RU Başlık', 'RU Açıklama', 'Fiyat'
    ];

    const sampleData = [
      ['Toyota', 'Corolla', '2021', '25000', 'Beyaz', '1.990cc', 'Benzin', 'Manuel', 'Sedan', 'Salon', 'Plakalı', 'Hayır', 'Toyota Corolla 2021', '2021 model Toyota Corolla', 'Toyota Corolla 2021', '2021 Toyota Corolla model', 'Toyota Corolla 2021', 'موديل 2021 Toyota Corolla', 'Тойота Королла 2021', 'Модель 2021 Toyota Corolla', '25000'],
      ['BMW', 'X5', '2020', '45000', 'Siyah', '3.000cc', 'Dizel', 'Otomatik', 'SUV', 'Lüks', 'Plakalı', 'Evet', 'BMW X5 2020', '2020 model BMW X5', 'BMW X5 2020', '2020 BMW X5 model', 'BMW X5 2020', 'موديل 2020 BMW X5', 'БМВ X5 2020', 'Модель 2020 BMW X5', '45000']
    ];

    if (format === 'excel') {
      // Create Excel file
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      
      // Set column widths
      const colWidths = [
        { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
        { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 20 },
        { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 10 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Araçlar');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'arac_template.xlsx');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create CSV file
      const csvContent = [headers, ...sampleData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'arac_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Toplu Araç Yükleme</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTemplate('excel')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Excel Template</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTemplate('csv')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>CSV Template</span>
          </Button>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-amber-500 bg-amber-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-600">Dosya yükleniyor...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Dosyayı buraya sürükleyin veya tıklayın
              </p>
              <p className="text-sm text-gray-500 mt-1">
                CSV veya Excel dosyaları desteklenir
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Dosya Seç
            </Button>
          </div>
        )}
      </div>

      {uploadResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadResult.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {uploadResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                uploadResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadResult.message}
              </p>
              {uploadResult.totalRows && uploadResult.processedRows && (
                <p className="text-sm text-gray-600 mt-1">
                  {uploadResult.processedRows} / {uploadResult.totalRows} satır işlendi
                  {uploadResult.failedRows && uploadResult.failedRows > 0 && (
                    <span className="text-red-600 ml-2">
                      ({uploadResult.failedRows} hatalı)
                    </span>
                  )}
                </p>
              )}
              {uploadResult.success && uploadResult.processedCars && uploadResult.processedCars.length > 0 && (
                <div className="mt-3">
                  <Button
                    onClick={() => setShowResults(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Detaylı Sonuçları Görüntüle
                  </Button>
                </div>
              )}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700">Hatalar:</p>
                  <ul className="text-sm text-red-600 mt-1 space-y-1">
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li className="text-gray-500">... ve {uploadResult.errors.length - 5} hata daha</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Dosya Formatı:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>1. Marka - 2. Model - 3. YIL - 4. KM - 5. Renk</p>
          <p>6. Motor Gücü - 7. Yakıt Türü - 8. Vites Tipi - 9. Kasa Tipi</p>
          <p>10. Kategori - 11. Plaka Durumu - 12. Yolda Gelen</p>
          <p>13. TR Başlık - 14. TR Açıklama - 15. EN Başlık - 16. EN Açıklama</p>
          <p>17. AR Başlık - 18. AR Açıklama - 19. RU Başlık - 20. RU Açıklama - 21. Fiyat</p>
          <div className="text-amber-600 font-medium mt-2 space-y-1">
            <p>• İlk satır başlık satırıdır, veriler ikinci satırdan başlar</p>
            <p>• Çeviri alanları ve fiyat boş bırakılabilir</p>
            <p>• Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenir</p>
            <p>• Türkçe karakterler (ç, ğ, ı, ö, ş, ü) desteklenir</p>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {uploadResult && uploadResult.success && (
        <BulkUploadResults
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          processedCars={uploadResult.processedCars || []}
          failedCars={uploadResult.failedCars || []}
          totalRows={uploadResult.totalRows || 0}
          processedRows={uploadResult.processedRows || 0}
          failedRows={uploadResult.failedRows || 0}
        />
      )}
    </div>
  );
}
