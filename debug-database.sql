-- Debug script untuk cek status database dan model

-- 1. Cek semua records di image_processing table
SELECT 
    id,
    original_filename,
    model_used,
    status,
    created_at,
    enhanced_url,
    error_message
FROM image_processing 
ORDER BY created_at DESC;

-- 2. Cek storage buckets
SELECT 
    id,
    name,
    public
FROM storage.buckets;

-- 3. Cek files di original-images bucket
SELECT 
    name,
    bucket_id,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'original-images'
ORDER BY created_at DESC;

-- 4. Cek files di enhanced-images bucket
SELECT 
    name,
    bucket_id,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'enhanced-images'
ORDER BY created_at DESC;

-- 5. Update manual semua status pending ke completed (untuk testing)
-- HATI-HATI: Hanya jalankan jika ingin reset semua status
-- UPDATE image_processing 
-- SET status = 'completed', enhanced_url = original_url 
-- WHERE status = 'pending';

-- 6. Hapus semua records (untuk clean start)
-- HATI-HATI: Ini akan menghapus semua data
-- DELETE FROM image_processing;
-- DELETE FROM storage.objects WHERE bucket_id IN ('original-images', 'enhanced-images');
