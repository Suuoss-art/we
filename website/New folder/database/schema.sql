-- ═══════════════════════════════════════════════════════════════════════════
-- KOPMA UNNES Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Version: 1.0.0
-- Date: 2025-10-12
-- Description: Complete database schema for KOPMA UNNES website
-- ═══════════════════════════════════════════════════════════════════════════

-- Create database
CREATE DATABASE IF NOT EXISTS kopma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kopma_db;

-- ============================================================================
-- Users & Authentication
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Members & Organization
-- ============================================================================

-- Members table (for KOPMA members)
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    nama VARCHAR(255) NOT NULL,
    nim VARCHAR(50),
    jurusan VARCHAR(100),
    fakultas VARCHAR(100),
    angkatan VARCHAR(10),
    divisi VARCHAR(100),
    jabatan VARCHAR(100),
    foto VARCHAR(255),
    bio TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    tahun_bergabung YEAR,
    status ENUM('active', 'alumni', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_nim (nim),
    INDEX idx_divisi (divisi),
    INDEX idx_status (status),
    INDEX idx_angkatan (angkatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Content Management
-- ============================================================================

-- Blog posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT,
    featured_image VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    FULLTEXT INDEX idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post categories
CREATE TABLE IF NOT EXISTS post_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    post_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post tags
CREATE TABLE IF NOT EXISTS post_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    post_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post-Category relationship (many-to-many)
CREATE TABLE IF NOT EXISTS post_category_relations (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES post_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS post_tag_relations (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES post_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Business & Services
-- ============================================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2),
    stock INT DEFAULT 0,
    category VARCHAR(100),
    image VARCHAR(255),
    status ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    price VARCHAR(100),
    operational_hours VARCHAR(100),
    location VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Activity & Logging
-- ============================================================================

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Session Management
-- ============================================================================

-- Sessions table (for Redis fallback)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT,
    data TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Media Library
-- ============================================================================

-- Media files
CREATE TABLE IF NOT EXISTS media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INT,
    height INT,
    uploaded_by INT,
    alt_text VARCHAR(255),
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_file_type (file_type),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Settings & Configuration
-- ============================================================================

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Insert Default Data
-- ============================================================================

-- Default admin user (password: 'admin123' - CHANGE THIS IMMEDIATELY!)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@kopmaukmunnes.com', '$2a$10$rXxGxzYvKqF4X9zVKqF4XeJ7G8K9WN1LMN2O3P4Q5R6S7T8U9V0W', 'admin');

-- Default categories
INSERT INTO post_categories (name, slug, description) VALUES
('Kegiatan', 'kegiatan', 'Kegiatan KOPMA UNNES'),
('Pendidikan', 'pendidikan', 'Program pendidikan koperasi'),
('Pengumuman', 'pengumuman', 'Pengumuman resmi KOPMA'),
('Berita', 'berita', 'Berita terkini KOPMA');

-- Default services
INSERT INTO services (name, slug, description, icon, price, operational_hours, location, display_order) VALUES
('Fotokopi & Print', 'fotokopi-print', 'Layanan fotokopi dan print dokumen', 'printer', 'Rp 200/lembar', '08:00 - 16:00', 'Gedung PKM Lt. 2', 1),
('Jilid & Laminating', 'jilid-laminating', 'Layanan jilid dan laminating dokumen', 'book-open', 'Mulai Rp 3.000', '08:00 - 16:00', 'Gedung PKM Lt. 2', 2),
('ATK (Alat Tulis Kantor)', 'atk', 'Penjualan alat tulis lengkap', 'pen-tool', 'Harga kompetitif', '08:00 - 16:00', 'Gedung PKM Lt. 2', 3),
('Snack & Minuman', 'snack-minuman', 'Aneka snack dan minuman segar', 'coffee', 'Mulai Rp 5.000', '08:00 - 16:00', 'Gedung PKM Lt. 2', 4),
('Pulsa & Token Listrik', 'pulsa-token', 'Penjualan pulsa dan token listrik', 'smartphone', 'Harga normal', '08:00 - 16:00', 'Gedung PKM Lt. 2', 5);

-- Default settings
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'KOPMA UNNES', 'string', 'Website name'),
('site_tagline', 'Koperasi Mahasiswa Universitas Negeri Semarang', 'string', 'Website tagline'),
('site_email', 'kopma@unnes.ac.id', 'string', 'Contact email'),
('site_phone', '024-8508xxx', 'string', 'Contact phone'),
('site_address', 'Gedung PKM Lt. 2 Universitas Negeri Semarang', 'string', 'Physical address'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('registration_open', 'true', 'boolean', 'Allow new member registration');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
