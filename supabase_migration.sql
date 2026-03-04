-- ============================================
-- Taboo Adult Store - Supabase Migration
-- ============================================

-- Kategoriler
CREATE TABLE tb_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE tb_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tb_categories" ON tb_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert tb_categories" ON tb_categories FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update tb_categories" ON tb_categories FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete tb_categories" ON tb_categories FOR DELETE TO anon USING (true);

-- Urunler
CREATE TABLE tb_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tb_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tb_products" ON tb_products FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert tb_products" ON tb_products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update tb_products" ON tb_products FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete tb_products" ON tb_products FOR DELETE TO anon USING (true);

-- Siparisler
CREATE TABLE tb_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  notes TEXT,
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tb_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tb_orders" ON tb_orders FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert tb_orders" ON tb_orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update tb_orders" ON tb_orders FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Siparis kalemleri
CREATE TABLE tb_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES tb_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES tb_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL
);

ALTER TABLE tb_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tb_order_items" ON tb_order_items FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert tb_order_items" ON tb_order_items FOR INSERT TO anon WITH CHECK (true);

-- Ornek kategoriler
INSERT INTO tb_categories (name, slug, sort_order) VALUES
  ('Oyuncaklar', 'oyuncaklar', 1),
  ('Ic Giyim', 'ic-giyim', 2),
  ('Aksesuarlar', 'aksesuarlar', 3),
  ('Bakim', 'bakim', 4),
  ('Kostuemler', 'kostuemler', 5);

-- Ornek urunler
INSERT INTO tb_products (name, description, price, image_url, category, in_stock, sort_order) VALUES
  ('Ipek Goz Bandı', 'Premium ipek goz bandı', 2500, NULL, 'aksesuarlar', true, 1),
  ('Masaj Mumu', 'Vanilya kokulu sıcak masaj yagı mumu', 3500, NULL, 'bakim', true, 2),
  ('Dantel Body', 'Zarif siyah dantel body', 8500, NULL, 'ic-giyim', true, 3),
  ('Kadife Kelepce', 'Yumusak kadife kapli kelepce', 4000, NULL, 'aksesuarlar', true, 4),
  ('Gul Vibrator', 'Gul seklinde vibrator', 12000, NULL, 'oyuncaklar', true, 5),
  ('Masaj Yagi Seti', '3lu kokulu masaj yagi seti', 5500, NULL, 'bakim', true, 6),
  ('Hemsire Kostumu', 'Hemsire kostum seti', 9500, NULL, 'kostuemler', true, 7),
  ('Tuy Gıdıklayıcı', 'Devekusu tuyu gıdıklayıcı', 1800, NULL, 'aksesuarlar', true, 8);

-- updated_at trigger
CREATE OR REPLACE FUNCTION tb_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tb_update_orders_updated_at
  BEFORE UPDATE ON tb_orders
  FOR EACH ROW
  EXECUTE FUNCTION tb_update_updated_at_column();

-- ============================================
-- Storage Bucket ve Policy'leri
-- ============================================

-- Storage bucket oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policy'leri
-- SELECT (herkese açık okuma)
CREATE POLICY "Public read product-images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- INSERT (anon kullanıcılar yükleyebilir - admin password kontrolü API'de yapılıyor)
CREATE POLICY "Public insert product-images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

-- UPDATE (anon kullanıcılar güncelleyebilir)
CREATE POLICY "Public update product-images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- DELETE (anon kullanıcılar silebilir)
CREATE POLICY "Public delete product-images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'product-images');
