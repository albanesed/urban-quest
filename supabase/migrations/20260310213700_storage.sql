-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('game-media', 'game-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('operator-branding', 'operator-branding', true);

-- Public read for game media and QR codes
CREATE POLICY "game_media_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'game-media');
CREATE POLICY "game_media_auth_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game-media' AND auth.role() = 'authenticated');
CREATE POLICY "qr_codes_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'qr-codes');
CREATE POLICY "qr_codes_auth_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');
