-- Partner avantaj alanları: açıklama, indirim kodu, indirim etiketi (dinamik avantaj metni)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS discount_label TEXT;
