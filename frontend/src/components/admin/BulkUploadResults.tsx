'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Download, Eye, EyeOff } from 'lucide-react';

interface ProcessedCar {
  rowNumber: number;
  data: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    color: string;
    engine: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    category: string;
    plateStatus: string;
    isIncoming: boolean;
    titleTR: string;
    descriptionTR: string;
    titleEN: string;
    descriptionEN: string;
    titleAR: string;
    descriptionAR: string;
    titleRU: string;
    descriptionRU: string;
  };
  car: {
    id: number;
    make: string;
    model: string;
    year: number;
  };
}

interface FailedCar {
  rowNumber: number;
  data: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    color: string;
    engine: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    category: string;
    plateStatus: string;
    isIncoming: boolean;
    titleTR: string;
    descriptionTR: string;
    titleEN: string;
    descriptionEN: string;
    titleAR: string;
    descriptionAR: string;
    titleRU: string;
    descriptionRU: string;
  };
  errors: string[];
}

interface BulkUploadResultsProps {
  isOpen: boolean;
  onClose: () => void;
  processedCars: ProcessedCar[];
  failedCars: FailedCar[];
  totalRows: number;
  processedRows: number;
  failedRows: number;
}

export function BulkUploadResults({
  isOpen,
  onClose,
  processedCars,
  failedCars,
  totalRows,
  processedRows,
  failedRows
}: BulkUploadResultsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'success' | 'errors'>('summary');
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const downloadCSV = (data: any[], filename: string) => {
    const headers = [
      'Satır', 'Marka', 'Model', 'Yıl', 'KM', 'Renk', 'Motor', 'Yakıt', 'Vites', 
      'Kasa', 'Kategori', 'Plaka', 'Yolda Gelen', 'TR Başlık', 'TR Açıklama',
      'EN Başlık', 'EN Açıklama', 'AR Başlık', 'AR Açıklama', 'RU Başlık', 'RU Açıklama'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.rowNumber,
        `"${item.data.make || ''}"`,
        `"${item.data.model || ''}"`,
        item.data.year || '',
        item.data.mileage || '',
        `"${item.data.color || ''}"`,
        `"${item.data.engine || ''}"`,
        `"${item.data.fuelType || ''}"`,
        `"${item.data.transmission || ''}"`,
        `"${item.data.bodyType || ''}"`,
        `"${item.data.category || ''}"`,
        `"${item.data.plateStatus || ''}"`,
        item.data.isIncoming ? 'Evet' : 'Hayır',
        `"${item.data.titleTR || ''}"`,
        `"${item.data.descriptionTR || ''}"`,
        `"${item.data.titleEN || ''}"`,
        `"${item.data.descriptionEN || ''}"`,
        `"${item.data.titleAR || ''}"`,
        `"${item.data.descriptionAR || ''}"`,
        `"${item.data.titleRU || ''}"`,
        `"${item.data.descriptionRU || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Toplu Yükleme Sonuçları</h2>
              <p className="text-blue-100 mt-1">
                {totalRows} satır işlendi • {processedRows} başarılı • {failedRows} hatalı
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-4">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Özet
            </button>
            <button
              onClick={() => setActiveTab('success')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Başarılı ({processedRows})
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'errors'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Hatalı ({failedRows})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Toplam Satır</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{totalRows}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-gray-700">Başarılı</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">{processedRows}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-gray-700">Hatalı</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{failedRows}</div>
                </div>
              </div>

              {processedRows > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Başarıyla Yüklenen Araçlar</h3>
                  <p className="text-green-700 text-sm">
                    {processedRows} araç başarıyla veritabanına eklendi ve sistemde görünür durumda.
                  </p>
                </div>
              )}

              {failedRows > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Yüklenemeyen Araçlar</h3>
                  <p className="text-red-700 text-sm">
                    {failedRows} araç yüklenemedi. Detayları görmek için &quot;Hatalı&quot; sekmesini kontrol edin.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Başarıyla Yüklenen Araçlar ({processedRows})
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showDetails ? 'Gizle' : 'Göster'}</span>
                  </button>
                  <button
                    onClick={() => downloadCSV(processedCars, 'basarili_arabalar.csv')}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV İndir</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Satır</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Marka</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Model</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Yıl</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">KM</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Yakıt</th>
                      {showDetails && (
                        <>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Renk</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Motor</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Vites</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Kasa</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {processedCars.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{item.rowNumber}</td>
                        <td className="px-3 py-2 font-medium">{item.data.make}</td>
                        <td className="px-3 py-2">{item.data.model}</td>
                        <td className="px-3 py-2">{item.data.year}</td>
                        <td className="px-3 py-2">{item.data.mileage ? item.data.mileage.toLocaleString() : 'N/A'}</td>
                        <td className="px-3 py-2">{item.data.fuelType}</td>
                        {showDetails && (
                          <>
                            <td className="px-3 py-2">{item.data.color}</td>
                            <td className="px-3 py-2">{item.data.engine}</td>
                            <td className="px-3 py-2">{item.data.transmission}</td>
                            <td className="px-3 py-2">{item.data.bodyType}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Yüklenemeyen Araçlar ({failedRows})
                </h3>
                <button
                  onClick={() => downloadCSV(failedCars, 'hatali_arabalar.csv')}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV İndir</span>
                </button>
              </div>

              <div className="space-y-3">
                {failedCars.map((item, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-800">Satır {item.rowNumber}:</span>
                          <span className="text-gray-600">
                            {item.data.make} {item.data.model} ({item.data.year})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {item.errors.map((error, errorIndex) => (
                            <div key={errorIndex} className="text-sm text-red-600 flex items-center space-x-1">
                              <XCircle className="w-3 h-3 flex-shrink-0" />
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
