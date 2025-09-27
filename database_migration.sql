-- Database Migration Script for VPS
-- Bu script VPS'deki database'i optimize eder (tüm alanlar zaten mevcut)

-- 1. Cars tablosu zaten tüm gerekli alanlara sahip
-- body_type, plate_status, cover_image, is_sold, is_incoming, is_reserved, 
-- expected_arrival, sold_at, sold_price alanları zaten mevcut

-- 2. Car Images tablosu zaten tüm gerekli alanlara sahip  
-- sort_order, alt_text alanları zaten mevcut

-- 3. Blog Posts tablosuna eksik alanı ekle (zaten var ama kontrol için)
-- ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS img_url VARCHAR(500) DEFAULT NULL;

-- 4. Unique constraint'leri kontrol et ve ekle
ALTER TABLE car_translations 
ADD CONSTRAINT IF NOT EXISTS unique_car_lang UNIQUE (car_id, lang);

ALTER TABLE blog_translations 
ADD CONSTRAINT IF NOT EXISTS unique_blog_lang UNIQUE (post_id, lang);

ALTER TABLE page_translations 
ADD CONSTRAINT IF NOT EXISTS unique_page_lang UNIQUE (page_id, lang);

-- 5. Index'leri optimize et
CREATE INDEX IF NOT EXISTS idx_cars_category ON cars(category_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_featured ON cars(featured);
CREATE INDEX IF NOT EXISTS idx_cars_is_sold ON cars(is_sold);
CREATE INDEX IF NOT EXISTS idx_cars_is_incoming ON cars(is_incoming);
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_car_images_is_main ON car_images(is_main);
CREATE INDEX IF NOT EXISTS idx_car_translations_car_id ON car_translations(car_id);
CREATE INDEX IF NOT EXISTS idx_car_translations_lang ON car_translations(lang);
CREATE INDEX IF NOT EXISTS idx_blog_translations_post_id ON blog_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_translations_lang ON blog_translations(lang);

-- 6. Mevcut verileri kontrol et ve varsayılan değerleri ayarla
UPDATE cars SET is_sold = FALSE WHERE is_sold IS NULL;
UPDATE cars SET is_incoming = FALSE WHERE is_incoming IS NULL;
UPDATE cars SET is_reserved = FALSE WHERE is_reserved IS NULL;
UPDATE car_images SET sort_order = 0 WHERE sort_order IS NULL;

-- 7. Veri tutarlılığını kontrol et
-- Satılan araçlar için sold_at tarihi kontrolü
UPDATE cars SET sold_at = updated_at WHERE is_sold = TRUE AND sold_at IS NULL;

-- Gelen araçlar için expected_arrival kontrolü
UPDATE cars SET expected_arrival = DATE_ADD(created_at, INTERVAL 30 DAY) WHERE is_incoming = TRUE AND expected_arrival IS NULL;

-- 8. Foreign key constraint'leri kontrol et
-- Eğer foreign key constraint'ler yoksa ekle
-- ALTER TABLE cars ADD CONSTRAINT fk_cars_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
-- ALTER TABLE car_images ADD CONSTRAINT fk_car_images_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE;
-- ALTER TABLE car_translations ADD CONSTRAINT fk_car_translations_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE;
-- ALTER TABLE blog_images ADD CONSTRAINT fk_blog_images_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
-- ALTER TABLE blog_translations ADD CONSTRAINT fk_blog_translations_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
-- ALTER TABLE offers ADD CONSTRAINT fk_offers_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL;
-- ALTER TABLE offers ADD CONSTRAINT fk_offers_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
-- ALTER TABLE page_translations ADD CONSTRAINT fk_page_translations_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE;

-- Migration tamamlandı
SELECT 'Database migration completed successfully!' as status;
