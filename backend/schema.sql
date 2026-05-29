-- ── Smartcard MariaDB/MySQL Database Schema ────────────────────────────────────

CREATE DATABASE IF NOT EXISTS smartcard;
USE smartcard;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('basic', 'pro', 'advanced', 'admin') DEFAULT 'basic',
  plan_status VARCHAR(50) DEFAULT NULL,
  plan_expires_at DATETIME DEFAULT NULL,
  phonepe_subscription_id VARCHAR(100) DEFAULT NULL,
  max_cards INT DEFAULT NULL,
  admin_override_plan VARCHAR(20) DEFAULT NULL,
  admin_override_until DATETIME DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  premium_requested_at DATETIME DEFAULT NULL,
  premium_approved_at DATETIME DEFAULT NULL,
  approved_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_email (email),
  INDEX idx_slug (slug)
);

-- 2. Cards Table
CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) DEFAULT 'My Business Card',
  company VARCHAR(100) DEFAULT '',
  bio TEXT DEFAULT NULL,
  photo VARCHAR(255) DEFAULT NULL,
  theme VARCHAR(50) DEFAULT 'default',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- 3. Card Links Table
CREATE TABLE IF NOT EXISTS card_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  type VARCHAR(30) NOT NULL,
  label VARCHAR(100) DEFAULT '',
  url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- 4. Card Leads Table
CREATE TABLE IF NOT EXISTS card_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  lead_name VARCHAR(120) NOT NULL,
  lead_email VARCHAR(190) DEFAULT NULL,
  lead_phone VARCHAR(30) DEFAULT NULL,
  lead_note TEXT DEFAULT NULL,
  source VARCHAR(50) DEFAULT 'public_card',
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id)
);

-- 5. Card Views Table
CREATE TABLE IF NOT EXISTS card_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  visitor_ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  viewed_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_viewed_at (viewed_at)
);

-- 6. Premium Requests Table
CREATE TABLE IF NOT EXISTS premium_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  requested_at DATETIME DEFAULT NOW(),
  processed_at DATETIME DEFAULT NULL,
  processed_by INT DEFAULT NULL,
  admin_note VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id)
);

-- 7. Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_user_id INT DEFAULT NULL,
  details TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_id (admin_id)
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('basic', 'pro', 'advanced') NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  phonepe_order_id VARCHAR(100) DEFAULT NULL,
  phonepe_txn_id VARCHAR(100) DEFAULT NULL,
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  discount_amount INT DEFAULT 0,
  coupon_id INT DEFAULT NULL,
  subscription_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_phonepe_order (phonepe_order_id),
  INDEX idx_status (status)
);

-- 10. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('basic','pro','advanced') NOT NULL DEFAULT 'basic',
  status ENUM('active','expired','cancelled','pending') NOT NULL DEFAULT 'pending',
  payment_id INT DEFAULT NULL,
  start_date DATETIME DEFAULT NOW(),
  end_date DATETIME DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  admin_note VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date)
);

-- 11. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  discount_value INT NOT NULL,
  max_uses INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  valid_from DATETIME DEFAULT NOW(),
  valid_until DATETIME DEFAULT NULL,
  applicable_plan ENUM('pro','advanced','all') DEFAULT 'all',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_code (code)
);

-- 12. Feature Limits Table
CREATE TABLE IF NOT EXISTS feature_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_type VARCHAR(20) NOT NULL,
  feature_name VARCHAR(50) NOT NULL,
  limit_value INT NOT NULL,
  is_enabled TINYINT(1) DEFAULT 1,
  UNIQUE KEY unique_plan_feature (plan_type, feature_name)
);

-- ── Seed Data ──────────────────────────────────────────────────────────────────

-- Seed plan limits
INSERT IGNORE INTO feature_limits (plan_type, feature_name, limit_value, is_enabled) VALUES
  ('basic',    'max_cards',           1,    1),
  ('basic',    'max_social_links',    5,    1),
  ('basic',    'cover_photo',         0,    0),
  ('basic',    'company_logo',        0,    0),
  ('basic',    'virtual_background',  0,    0),
  ('basic',    'custom_color_picker', 0,    0),
  ('basic',    'advanced_analytics',  0,    0),
  ('basic',    'custom_fields',       0,    0),
  ('basic',    'lead_capture',        0,    0),
  ('basic',    'csv_export',          0,    0),
  ('basic',    'custom_slug',         0,    0),
  ('pro',      'max_cards',           3,    1),
  ('pro',      'max_social_links',   -1,    1),
  ('pro',      'cover_photo',         1,    1),
  ('pro',      'company_logo',        1,    1),
  ('pro',      'virtual_background',  0,    0),
  ('pro',      'custom_color_picker', 1,    1),
  ('pro',      'advanced_analytics',  1,    1),
  ('pro',      'custom_fields',       1,    1),
  ('pro',      'lead_capture',        1,    1),
  ('pro',      'csv_export',          0,    0),
  ('pro',      'custom_slug',         0,    0),
  ('advanced', 'max_cards',          -1,    1),
  ('advanced', 'max_social_links',   -1,    1),
  ('advanced', 'cover_photo',         1,    1),
  ('advanced', 'company_logo',        1,    1),
  ('advanced', 'virtual_background',  1,    1),
  ('advanced', 'custom_color_picker', 1,    1),
  ('advanced', 'advanced_analytics',  1,    1),
  ('advanced', 'custom_fields',       1,    1),
  ('advanced', 'lead_capture',        1,    1),
  ('advanced', 'csv_export',          1,    1),
  ('advanced', 'custom_slug',         1,    1);

-- Seed Sample Coupon
INSERT IGNORE INTO coupons (code, discount_type, discount_value, max_uses, applicable_plan)
VALUES ('LAUNCH50', 'percent', 50, 100, 'all');

-- Seed Admin Account (Password: admin123, will auto-hash on first login)
INSERT IGNORE INTO users (name, email, password, slug, role, plan_status, is_active)
VALUES ('System Admin', 'admin@smartcard.com', 'admin123', 'system-admin', 'admin', 'active', 1);

-- Seed Basic User Account (Password: user123, will auto-hash on first login)
INSERT IGNORE INTO users (name, email, password, slug, role, plan_status, is_active)
VALUES ('Jane Doe', 'user@smartcard.com', 'user123', 'jane-doe', 'basic', NULL, 1);
