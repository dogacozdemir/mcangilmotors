# CORS Sorunu Çözüm Rehberi

## 🔍 Sorunun Analizi

VPS'e deploy ettiğinizde CORS hatası almanızın temel nedenleri:

1. **Hardcoded localhost URL'leri**: Frontend kodunda `http://localhost:3001` hardcoded olarak yazılmış
2. **CORS konfigürasyonu**: Backend sadece localhost:3000'e izin veriyor
3. **Environment değişkenleri**: Production URL'leri doğru şekilde ayarlanmamış
4. **Nginx proxy**: CORS header'ları eksik

## ✅ Yapılan Düzeltmeler

### 1. Backend CORS Konfigürasyonu
- `backend/src/index.ts` dosyasında CORS middleware'i güncellendi
- Multiple origin desteği eklendi
- Production URL'leri için CORS_ORIGIN environment variable'ı kullanılıyor

### 2. Frontend URL Yönetimi
- `frontend/src/lib/urlUtils.ts` utility dosyası oluşturuldu
- Hardcoded localhost URL'leri environment değişkenleri ile değiştirildi
- `getCarImageUrl()`, `getImageUrl()` gibi helper fonksiyonlar eklendi

### 3. Next.js Konfigürasyonu
- `frontend/next.config.js` dosyasında production URL'leri eklendi
- Image remote patterns güncellendi
- Rewrites konfigürasyonu environment-aware hale getirildi

### 4. Docker Compose
- `docker-compose.yml` dosyasında production environment variables eklendi
- CORS_ORIGIN ve FRONTEND_URL güncellendi

### 5. Nginx Konfigürasyonu
- `nginx/nginx.conf` dosyasında CORS header'ları eklendi
- OPTIONS preflight request'leri için özel handling eklendi
- API routes için CORS header'ları eklendi

## 🚀 VPS'e Deploy Etme Adımları

### 1. Environment Dosyalarını Oluşturun

Backend için `.env` dosyası:
```bash
# Backend .env
DATABASE_URL="mysql://mcangilmotors:mcangilmotors123@mysql:3306/mustafa_cangil_motors"
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
JWT_EXPIRES_IN="7d"
SESSION_SECRET="your-super-secret-session-key-here-change-this-in-production"
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://mcangilmotors.com"
CORS_ORIGIN="https://mcangilmotors.com,https://www.mcangilmotors.com"
```

Frontend için `.env.local` dosyası:
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL="https://mcangilmotors.com"
NEXT_PUBLIC_UPLOAD_URL="https://mcangilmotors.com"
```

### 2. Domain Ayarları

Nginx konfigürasyonunda domain'inizi güncelleyin:
```nginx
server_name mcangilmotors.com www.mcangilmotors.com;
```

### 3. SSL Sertifikası

Let's Encrypt ile SSL sertifikası kurun:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mcangilmotors.com -d www.mcangilmotors.com
```

### 4. Docker Compose ile Deploy

```bash
# Production environment variables ile
docker-compose up -d --build

# Veya environment dosyası ile
docker-compose --env-file .env.production up -d --build
```

### 5. Nginx Konfigürasyonunu Test Edin

```bash
# Nginx konfigürasyonunu test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl reload nginx
```

## 🔧 Ek Düzeltmeler

### 1. Diğer Hardcoded URL'leri Düzeltin

Aşağıdaki dosyalarda hala hardcoded URL'ler olabilir:
- `frontend/src/app/[locale]/blog/BlogPageClient.tsx`
- `frontend/src/components/sections/HeroSection.tsx`
- `frontend/src/components/sections/BlogSection.tsx`
- `frontend/src/app/admin/cars/page.tsx`
- `frontend/src/components/ui/SoldCarCard.tsx`
- `frontend/src/components/ui/CarImageUpload.tsx`
- `frontend/src/components/ui/ImageUpload.tsx`
- `frontend/src/components/ui/ComparisonModal.tsx`
- `frontend/src/components/ui/QuickViewModal.tsx`

Bu dosyalarda `getImageUrl()` veya `getCarImageUrl()` fonksiyonlarını kullanın.

### 2. Admin Panel URL'leri

Admin panelinde de hardcoded URL'ler olabilir. Bunları da düzeltin.

## 🧪 Test Etme

### 1. CORS Testi

Browser console'da test edin:
```javascript
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('CORS Test:', data))
  .catch(error => console.error('CORS Error:', error));
```

### 2. Image URL Testi

```javascript
// Test image URL generation
console.log('Image URL:', getImageUrl('/uploads/cars/test.jpg'));
```

## 🚨 Önemli Notlar

1. **SSL Sertifikası**: HTTPS kullanmadan CORS çalışmayabilir
2. **Domain Ayarları**: DNS ayarlarınızın doğru olduğundan emin olun
3. **Firewall**: 80 ve 443 portlarının açık olduğundan emin olun
4. **Environment Variables**: Production'da doğru environment variables'ları kullandığınızdan emin olun

## 🔍 Debugging

CORS hatalarını debug etmek için:

1. Browser Network tab'ında OPTIONS request'lerini kontrol edin
2. Response header'larında CORS header'larının olup olmadığını kontrol edin
3. Backend log'larında CORS blocked origin mesajlarını kontrol edin
4. Nginx access log'larını kontrol edin

```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

Bu düzeltmelerle CORS sorununuz çözülmüş olmalı. Herhangi bir sorun yaşarsanız, log'ları kontrol ederek debug edebilirsiniz.
