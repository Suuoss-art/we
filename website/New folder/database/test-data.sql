-- =============================================================================
-- KOPMA UNNES - Test Data for Docker Testing
-- =============================================================================
-- This file contains test data for local development and testing
-- DO NOT USE IN PRODUCTION!
-- =============================================================================

-- Use the test database
USE kopma_test_db;

-- =============================================================================
-- TEST USERS
-- =============================================================================
INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at) VALUES
(1, 'admin', 'admin@kopmaukmunnes.com', '$2b$10$rQZ8K9mN2pQ3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'admin', NOW(), NOW()),
(2, 'testuser', 'test@kopmaukmunnes.com', '$2b$10$rQZ8K9mN2pQ3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'user', NOW(), NOW()),
(3, 'moderator', 'mod@kopmaukmunnes.com', '$2b$10$rQZ8K9mN2pQ3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'moderator', NOW(), NOW());

-- =============================================================================
-- TEST MEMBERS
-- =============================================================================
INSERT INTO members (id, name, student_id, faculty, major, year, phone, email, address, status, created_at, updated_at) VALUES
(1, 'Ahmad Rizki', '1234567890', 'Fakultas Ekonomi', 'Manajemen', 2021, '081234567890', 'ahmad@student.unnes.ac.id', 'Jl. Semarang No. 1', 'active', NOW(), NOW()),
(2, 'Siti Nurhaliza', '1234567891', 'Fakultas Ekonomi', 'Akuntansi', 2021, '081234567891', 'siti@student.unnes.ac.id', 'Jl. Semarang No. 2', 'active', NOW(), NOW()),
(3, 'Budi Santoso', '1234567892', 'Fakultas Teknik', 'Informatika', 2022, '081234567892', 'budi@student.unnes.ac.id', 'Jl. Semarang No. 3', 'active', NOW(), NOW()),
(4, 'Dewi Sartika', '1234567893', 'Fakultas Ilmu Pendidikan', 'PGSD', 2020, '081234567893', 'dewi@student.unnes.ac.id', 'Jl. Semarang No. 4', 'active', NOW(), NOW()),
(5, 'Eko Prasetyo', '1234567894', 'Fakultas Ekonomi', 'Manajemen', 2023, '081234567894', 'eko@student.unnes.ac.id', 'Jl. Semarang No. 5', 'active', NOW(), NOW());

-- =============================================================================
-- TEST CATEGORIES
-- =============================================================================
INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES
(1, 'Berita', 'berita', 'Berita terkini KOPMA UNNES', NOW(), NOW()),
(2, 'Pengumuman', 'pengumuman', 'Pengumuman penting', NOW(), NOW()),
(3, 'Kegiatan', 'kegiatan', 'Kegiatan dan acara', NOW(), NOW()),
(4, 'Prestasi', 'prestasi', 'Prestasi anggota', NOW(), NOW()),
(5, 'Tips', 'tips', 'Tips dan trik', NOW(), NOW());

-- =============================================================================
-- TEST TAGS
-- =============================================================================
INSERT INTO tags (id, name, slug, created_at, updated_at) VALUES
(1, 'KOPMA', 'kopma', NOW(), NOW()),
(2, 'UNNES', 'unnes', NOW(), NOW()),
(3, 'Mahasiswa', 'mahasiswa', NOW(), NOW()),
(4, 'Ekonomi', 'ekonomi', NOW(), NOW()),
(5, 'Pendidikan', 'pendidikan', NOW(), NOW()),
(6, 'Kegiatan', 'kegiatan', NOW(), NOW()),
(7, 'Prestasi', 'prestasi', NOW(), NOW()),
(8, 'Tips', 'tips', NOW(), NOW());

-- =============================================================================
-- TEST POSTS
-- =============================================================================
INSERT INTO posts (id, title, slug, content, excerpt, author_id, category_id, status, featured_image, created_at, updated_at, published_at) VALUES
(1, 'Selamat Datang di KOPMA UNNES', 'selamat-datang-di-kopma-unnes', '<p>Selamat datang di website resmi KOPMA UNNES. Kami siap melayani kebutuhan mahasiswa Universitas Negeri Semarang.</p>', 'Selamat datang di website resmi KOPMA UNNES', 1, 1, 'published', '/images/welcome.jpg', NOW(), NOW(), NOW()),
(2, 'Pengumuman Kegiatan Bulan Ini', 'pengumuman-kegiatan-bulan-ini', '<p>Berikut adalah jadwal kegiatan KOPMA UNNES untuk bulan ini:</p><ul><li>Rapat Anggota - 15 Oktober 2025</li><li>Pelatihan Kewirausahaan - 20 Oktober 2025</li><li>Seminar Nasional - 25 Oktober 2025</li></ul>', 'Jadwal kegiatan KOPMA UNNES bulan ini', 1, 2, 'published', '/images/activities.jpg', NOW(), NOW(), NOW()),
(3, 'Tips Sukses Kuliah', 'tips-sukses-kuliah', '<p>Berikut adalah tips untuk sukses dalam kuliah:</p><ol><li>Atur waktu dengan baik</li><li>Rajin membaca</li><li>Bergabung dengan organisasi</li><li>Jaga kesehatan</li></ol>', 'Tips untuk sukses dalam kuliah', 2, 5, 'published', '/images/tips.jpg', NOW(), NOW(), NOW()),
(4, 'Prestasi Anggota KOPMA', 'prestasi-anggota-kopma', '<p>Kami bangga mengumumkan prestasi yang diraih oleh anggota KOPMA UNNES:</p><ul><li>Juara 1 Lomba Karya Tulis Ilmiah</li><li>Juara 2 Business Plan Competition</li><li>Juara 3 Debat Mahasiswa</li></ul>', 'Prestasi yang diraih anggota KOPMA UNNES', 1, 4, 'published', '/images/achievements.jpg', NOW(), NOW(), NOW()),
(5, 'Kegiatan Bakti Sosial', 'kegiatan-bakti-sosial', '<p>KOPMA UNNES mengadakan kegiatan bakti sosial di panti asuhan. Kegiatan ini diikuti oleh 50 anggota KOPMA.</p>', 'Kegiatan bakti sosial KOPMA UNNES', 3, 3, 'published', '/images/social.jpg', NOW(), NOW(), NOW());

-- =============================================================================
-- TEST POST TAGS
-- =============================================================================
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 6),
(3, 3), (3, 5), (3, 8),
(4, 1), (4, 2), (4, 7),
(5, 1), (5, 2), (5, 6);

-- =============================================================================
-- TEST PRODUCTS
-- =============================================================================
INSERT INTO products (id, name, slug, description, price, stock, category, status, image, created_at, updated_at) VALUES
(1, 'Kaos KOPMA UNNES', 'kaos-kopma-unnes', 'Kaos resmi KOPMA UNNES dengan desain eksklusif', 50000, 100, 'Pakaian', 'active', '/images/kaos.jpg', NOW(), NOW()),
(2, 'Tas KOPMA UNNES', 'tas-kopma-unnes', 'Tas ransel KOPMA UNNES untuk keperluan kuliah', 75000, 50, 'Aksesoris', 'active', '/images/tas.jpg', NOW(), NOW()),
(3, 'Buku Panduan KOPMA', 'buku-panduan-kopma', 'Buku panduan lengkap KOPMA UNNES', 25000, 200, 'Buku', 'active', '/images/buku.jpg', NOW(), NOW()),
(4, 'Pin KOPMA UNNES', 'pin-kopma-unnes', 'Pin resmi KOPMA UNNES', 10000, 500, 'Aksesoris', 'active', '/images/pin.jpg', NOW(), NOW()),
(5, 'Mug KOPMA UNNES', 'mug-kopma-unnes', 'Mug dengan logo KOPMA UNNES', 30000, 75, 'Aksesoris', 'active', '/images/mug.jpg', NOW(), NOW());

-- =============================================================================
-- TEST SERVICES
-- =============================================================================
INSERT INTO services (id, name, slug, description, price, category, status, created_at, updated_at) VALUES
(1, 'Konsultasi Akademik', 'konsultasi-akademik', 'Layanan konsultasi akademik untuk mahasiswa', 0, 'Konsultasi', 'active', NOW(), NOW()),
(2, 'Pelatihan Kewirausahaan', 'pelatihan-kewirausahaan', 'Pelatihan kewirausahaan untuk mahasiswa', 0, 'Pelatihan', 'active', NOW(), NOW()),
(3, 'Bimbingan Skripsi', 'bimbingan-skripsi', 'Bimbingan skripsi untuk mahasiswa', 0, 'Bimbingan', 'active', NOW(), NOW()),
(4, 'Magang KOPMA', 'magang-kopma', 'Program magang di KOPMA UNNES', 0, 'Magang', 'active', NOW(), NOW()),
(5, 'Konsultasi Karir', 'konsultasi-karir', 'Konsultasi karir untuk mahasiswa', 0, 'Konsultasi', 'active', NOW(), NOW());

-- =============================================================================
-- TEST MEDIA
-- =============================================================================
INSERT INTO media (id, filename, original_name, mime_type, size, path, alt_text, created_at, updated_at) VALUES
(1, 'welcome.jpg', 'welcome.jpg', 'image/jpeg', 102400, '/images/welcome.jpg', 'Selamat datang di KOPMA UNNES', NOW(), NOW()),
(2, 'activities.jpg', 'activities.jpg', 'image/jpeg', 204800, '/images/activities.jpg', 'Kegiatan KOPMA UNNES', NOW(), NOW()),
(3, 'tips.jpg', 'tips.jpg', 'image/jpeg', 153600, '/images/tips.jpg', 'Tips sukses kuliah', NOW(), NOW()),
(4, 'achievements.jpg', 'achievements.jpg', 'image/jpeg', 256000, '/images/achievements.jpg', 'Prestasi KOPMA UNNES', NOW(), NOW()),
(5, 'social.jpg', 'social.jpg', 'image/jpeg', 128000, '/images/social.jpg', 'Bakti sosial KOPMA UNNES', NOW(), NOW());

-- =============================================================================
-- TEST ACTIVITY LOGS
-- =============================================================================
INSERT INTO activity_logs (id, user_id, action, description, ip_address, user_agent, created_at) VALUES
(1, 1, 'login', 'User logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(2, 1, 'create_post', 'Created new post: Selamat Datang di KOPMA UNNES', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(3, 2, 'login', 'User logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(4, 2, 'create_post', 'Created new post: Tips Sukses Kuliah', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(5, 1, 'update_post', 'Updated post: Pengumuman Kegiatan Bulan Ini', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW());

-- =============================================================================
-- TEST SETTINGS
-- =============================================================================
INSERT INTO settings (id, key, value, description, created_at, updated_at) VALUES
(1, 'site_name', 'KOPMA UNNES', 'Nama website', NOW(), NOW()),
(2, 'site_description', 'Koperasi Mahasiswa Universitas Negeri Semarang', 'Deskripsi website', NOW(), NOW()),
(3, 'site_url', 'http://localhost:4321', 'URL website', NOW(), NOW()),
(4, 'admin_email', 'admin@kopmaukmunnes.com', 'Email administrator', NOW(), NOW()),
(5, 'maintenance_mode', 'false', 'Mode maintenance', NOW(), NOW()),
(6, 'registration_enabled', 'true', 'Pendaftaran anggota', NOW(), NOW()),
(7, 'comments_enabled', 'true', 'Komentar artikel', NOW(), NOW()),
(8, 'max_upload_size', '10485760', 'Ukuran upload maksimal (bytes)', NOW(), NOW());

-- =============================================================================
-- TEST NOTIFICATIONS
-- =============================================================================
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
(1, 1, 'Selamat Datang', 'Selamat datang di KOPMA UNNES!', 'info', false, NOW()),
(2, 2, 'Pendaftaran Berhasil', 'Pendaftaran Anda sebagai anggota KOPMA UNNES berhasil!', 'success', false, NOW()),
(3, 1, 'Kegiatan Baru', 'Ada kegiatan baru yang akan diadakan minggu depan', 'info', false, NOW()),
(4, 2, 'Pembayaran Berhasil', 'Pembayaran iuran bulanan Anda berhasil', 'success', false, NOW()),
(5, 1, 'Pengumuman Penting', 'Ada pengumuman penting yang perlu Anda baca', 'warning', false, NOW());

-- =============================================================================
-- TEST COMMENTS
-- =============================================================================
INSERT INTO comments (id, post_id, user_id, name, email, content, status, created_at, updated_at) VALUES
(1, 1, 2, 'Ahmad Rizki', 'ahmad@student.unnes.ac.id', 'Terima kasih atas informasinya!', 'approved', NOW(), NOW()),
(2, 2, 3, 'Siti Nurhaliza', 'siti@student.unnes.ac.id', 'Kapan pendaftaran kegiatan dimulai?', 'approved', NOW(), NOW()),
(3, 3, 4, 'Budi Santoso', 'budi@student.unnes.ac.id', 'Tips yang sangat bermanfaat!', 'approved', NOW(), NOW()),
(4, 4, 5, 'Dewi Sartika', 'dewi@student.unnes.ac.id', 'Selamat atas prestasinya!', 'approved', NOW(), NOW()),
(5, 5, 2, 'Eko Prasetyo', 'eko@student.unnes.ac.id', 'Kegiatan yang sangat inspiratif!', 'approved', NOW(), NOW());

-- =============================================================================
-- TEST CONTACTS
-- =============================================================================
INSERT INTO contacts (id, name, email, phone, subject, message, status, created_at, updated_at) VALUES
(1, 'Ahmad Rizki', 'ahmad@student.unnes.ac.id', '081234567890', 'Pertanyaan tentang KOPMA', 'Bagaimana cara bergabung dengan KOPMA UNNES?', 'new', NOW(), NOW()),
(2, 'Siti Nurhaliza', 'siti@student.unnes.ac.id', '081234567891', 'Informasi Kegiatan', 'Kapan kegiatan selanjutnya akan diadakan?', 'new', NOW(), NOW()),
(3, 'Budi Santoso', 'budi@student.unnes.ac.id', '081234567892', 'Bantuan Akademik', 'Saya butuh bantuan untuk konsultasi akademik', 'new', NOW(), NOW()),
(4, 'Dewi Sartika', 'dewi@student.unnes.ac.id', '081234567893', 'Pendaftaran Anggota', 'Bagaimana cara mendaftar sebagai anggota?', 'new', NOW(), NOW()),
(5, 'Eko Prasetyo', 'eko@student.unnes.ac.id', '081234567894', 'Informasi Produk', 'Apakah ada produk baru yang tersedia?', 'new', NOW(), NOW());

-- =============================================================================
-- TEST SUBSCRIBERS
-- =============================================================================
INSERT INTO subscribers (id, email, name, status, created_at, updated_at) VALUES
(1, 'ahmad@student.unnes.ac.id', 'Ahmad Rizki', 'active', NOW(), NOW()),
(2, 'siti@student.unnes.ac.id', 'Siti Nurhaliza', 'active', NOW(), NOW()),
(3, 'budi@student.unnes.ac.id', 'Budi Santoso', 'active', NOW(), NOW()),
(4, 'dewi@student.unnes.ac.id', 'Dewi Sartika', 'active', NOW(), NOW()),
(5, 'eko@student.unnes.ac.id', 'Eko Prasetyo', 'active', NOW(), NOW());

-- =============================================================================
-- TEST FEEDBACK
-- =============================================================================
INSERT INTO feedback (id, user_id, rating, comment, created_at, updated_at) VALUES
(1, 2, 5, 'Website KOPMA UNNES sangat informatif dan mudah digunakan!', NOW(), NOW()),
(2, 3, 4, 'Pelayanan KOPMA UNNES sangat baik, hanya perlu sedikit perbaikan pada tampilan.', NOW(), NOW()),
(3, 4, 5, 'Kegiatan yang diadakan KOPMA UNNES sangat bermanfaat untuk mahasiswa.', NOW(), NOW()),
(4, 5, 4, 'Produk yang ditawarkan KOPMA UNNES berkualitas dan harga terjangkau.', NOW(), NOW()),
(5, 2, 5, 'Tim KOPMA UNNES sangat responsif dalam menanggapi pertanyaan.', NOW(), NOW());

-- =============================================================================
-- TEST ANALYTICS
-- =============================================================================
INSERT INTO analytics (id, page, visits, unique_visitors, bounce_rate, avg_time, created_at) VALUES
(1, '/', 1000, 800, 0.3, 120, NOW()),
(2, '/about', 500, 400, 0.4, 90, NOW()),
(3, '/members', 300, 250, 0.5, 60, NOW()),
(4, '/blog', 800, 600, 0.2, 180, NOW()),
(5, '/products', 400, 350, 0.6, 150, NOW());

-- =============================================================================
-- TEST BACKUPS
-- =============================================================================
INSERT INTO backups (id, filename, size, type, status, created_at) VALUES
(1, 'backup_2025_10_12_001.sql', 1048576, 'database', 'completed', NOW()),
(2, 'backup_2025_10_12_002.sql', 2097152, 'database', 'completed', NOW()),
(3, 'backup_2025_10_12_003.sql', 3145728, 'database', 'completed', NOW()),
(4, 'backup_2025_10_12_004.sql', 4194304, 'database', 'completed', NOW()),
(5, 'backup_2025_10_12_005.sql', 5242880, 'database', 'completed', NOW());

-- =============================================================================
-- TEST SESSIONS
-- =============================================================================
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES
(1, 1, 'test_token_1', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW()),
(2, 2, 'test_token_2', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW()),
(3, 3, 'test_token_3', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW()),
(4, 4, 'test_token_4', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW()),
(5, 5, 'test_token_5', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW());

-- =============================================================================
-- TEST SECURITY LOGS
-- =============================================================================
INSERT INTO security_logs (id, user_id, action, ip_address, user_agent, created_at) VALUES
(1, 1, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(2, 2, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(3, 3, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(4, 4, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
(5, 5, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW());

-- =============================================================================
-- TEST COMPLETED
-- =============================================================================
-- Test data has been successfully inserted into the database
-- You can now test the application with this sample data
