-- ====================================================================
-- MarketLink – eGreen Basket: MySQL Database Schema & Seed Data
-- Full-Stack Agricultural Marketplace Project (PKR Currency)
-- Compatible with MySQL 8.0+, MariaDB, and Cloud MySQL
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `pickup_slots`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `farmers`;
DROP TABLE IF EXISTS `markets`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. USERS TABLE (Customers, Farmers, Admins)
-- --------------------------------------------------------------------
CREATE TABLE `users` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) DEFAULT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `role` ENUM('customer', 'farmer', 'admin') NOT NULL DEFAULT 'customer',
    `avatar_url` TEXT DEFAULT NULL,
    `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. MARKETS TABLE (Physical Farmers Market Locations)
-- --------------------------------------------------------------------
CREATE TABLE `markets` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `operating_days` VARCHAR(100) NOT NULL, -- e.g. 'Friday, Saturday'
    `opening_time` TIME NOT NULL DEFAULT '08:00:00',
    `closing_time` TIME NOT NULL DEFAULT '18:00:00',
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `map_provider` VARCHAR(50) DEFAULT 'OpenStreetMap',
    `image_url` TEXT DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `farmer_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. FARMERS TABLE (Farmer Stalls & Operating Details)
-- --------------------------------------------------------------------
CREATE TABLE `farmers` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `user_id` VARCHAR(50) DEFAULT NULL,
    `stall_name` VARCHAR(191) NOT NULL,
    `farmer_name` VARCHAR(150) NOT NULL,
    `contact_person` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `market_id` VARCHAR(50) DEFAULT NULL,
    `operating_days` VARCHAR(100) NOT NULL,
    `pickup_start` TIME NOT NULL DEFAULT '09:00:00',
    `pickup_end` TIME NOT NULL DEFAULT '17:00:00',
    `latitude` DECIMAL(10, 7) DEFAULT NULL,
    `longitude` DECIMAL(10, 7) DEFAULT NULL,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    `reviews_count` INT NOT NULL DEFAULT 0,
    `status` ENUM('approved', 'pending', 'suspended') NOT NULL DEFAULT 'approved',
    `bio` TEXT DEFAULT NULL,
    `image_url` TEXT DEFAULT NULL,
    `stall_image` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_farmer_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE SET NULL,
    INDEX `idx_farmers_market` (`market_id`),
    INDEX `idx_farmers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE `categories` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL,
    `icon` VARCHAR(50) DEFAULT 'bi-basket',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. PRODUCTS TABLE (Farm Produce with Stock & PKR Pricing)
-- --------------------------------------------------------------------
CREATE TABLE `products` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `farmer_id` VARCHAR(50) NOT NULL,
    `category_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `unit` VARCHAR(30) NOT NULL DEFAULT 'kg', -- e.g. kg, dozen, liter, jar
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `image_url` TEXT DEFAULT NULL,
    `status` ENUM('available', 'sold_out', 'unavailable') NOT NULL DEFAULT 'available',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_prod_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
    INDEX `idx_products_farmer` (`farmer_id`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. ORDERS TABLE (Customer Pre-Orders for Pickup)
-- --------------------------------------------------------------------
CREATE TABLE `orders` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `customer_id` VARCHAR(50) NOT NULL,
    `farmer_id` VARCHAR(50) NOT NULL,
    `market_id` VARCHAR(50) NOT NULL,
    `pickup_date` DATE NOT NULL,
    `pickup_time` VARCHAR(50) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Placed', 'Accepted', 'Ready for Pickup', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Placed',
    `notes` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_ord_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ord_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE RESTRICT,
    INDEX `idx_orders_customer` (`customer_id`),
    INDEX `idx_orders_farmer` (`farmer_id`),
    INDEX `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. ORDER ITEMS TABLE (Line Items in Order)
-- --------------------------------------------------------------------
CREATE TABLE `order_items` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `order_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    INDEX `idx_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. FAVORITES TABLE (Saved Items)
-- --------------------------------------------------------------------
CREATE TABLE `favorites` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `customer_id` VARCHAR(50) NOT NULL,
    `item_type` ENUM('farmer', 'product', 'market') NOT NULL,
    `item_id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fav_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. REVIEWS TABLE (Customer Ratings 1-5 Stars)
-- --------------------------------------------------------------------
CREATE TABLE `reviews` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `customer_id` VARCHAR(50) NOT NULL,
    `customer_name` VARCHAR(150) NOT NULL,
    `farmer_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) DEFAULT NULL,
    `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NOT NULL,
    `status` ENUM('approved', 'pending', 'hidden') NOT NULL DEFAULT 'approved',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rev_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE,
    INDEX `idx_reviews_farmer` (`farmer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. PICKUP SLOTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE `pickup_slots` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `farmer_id` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `max_orders` INT NOT NULL DEFAULT 15,
    `cutoff_hours` INT NOT NULL DEFAULT 4,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_slot_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE,
    INDEX `idx_slots_farmer` (`farmer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA (Realistic Pakistani Agricultural Marketplace)
-- ====================================================================

-- Categories
INSERT INTO `categories` (`id`, `name`, `description`, `icon`) VALUES
('cat-veg', 'Vegetables', 'Freshly harvested organic vegetables', 'bi-flower1'),
('cat-fruit', 'Fruits', 'Sweet and seasonal orchard fruits', 'bi-apple'),
('cat-dairy', 'Dairy', 'Pure milk, desi ghee, and artisanal cheese', 'bi-cup-straw'),
('cat-bakery', 'Bakery', 'Traditional breads, buns, and rusks', 'bi-egg-fried'),
('cat-eggs', 'Eggs', 'Free-range desi and country fresh eggs', 'bi-egg'),
('cat-honey', 'Honey', 'Raw, unpasteurized natural mountain honey', 'bi-droplet-half'),
('cat-other', 'Other', 'Cold-pressed oils, herbs, and dried goods', 'bi-boxes');

-- Admin & Default Users
INSERT INTO `users` (`id`, `name`, `email`, `role`, `phone`, `address`, `status`) VALUES
('usr-admin-1', 'MarketLink Admin', 'admin@marketlink.com', 'admin', '+92 51 111 222 333', 'Islamabad Capital Territory, Pakistan', 'active'),
('usr-customer-1', 'Hamza Malik', 'hamza.malik@gmail.com', 'customer', '+92 300 1234567', 'House 14, Street 22, Sector F-7/2, Islamabad', 'active'),
('usr-customer-2', 'Fatima Zahra', 'fatima.zahra@hotmail.com', 'customer', '+92 321 7654321', 'Apartment 4B, Silver Oaks, Sector F-10, Islamabad', 'active'),
('usr-farmer-1', 'Tariq Mehmood', 'farmer@marketlink.com', 'farmer', '+92 300 5112233', 'Chak Shahzad Agricultural Enclave, Islamabad', 'active');

-- Markets
INSERT INTO `markets` (`id`, `name`, `address`, `city`, `operating_days`, `opening_time`, `closing_time`, `latitude`, `longitude`, `farmer_count`, `description`) VALUES
('mkt-isb-f6', 'Islamabad F-6 Super Market Organic Bazaar', 'School Road, Super Market, Sector F-6, Islamabad', 'Islamabad', 'Friday, Saturday', '08:00:00', '18:00:00', 33.7297, 73.0746, 14, 'Premier open-air weekend market featuring certified organic growers from Potohar.'),
('mkt-lhr-model-town', 'Lahore Model Town Sunday Farmers Market', 'Central Park Ground, Model Town, Lahore', 'Lahore', 'Sunday', '07:30:00', '16:00:00', 31.4826, 74.3218, 22, 'Vibrant family market in Model Town offering farm-direct dairy and produce.'),
('mkt-khi-clifton', 'Karachi Clifton Green Farmers Market', 'Near Beach Park, Block 2, Clifton, Karachi', 'Karachi', 'Saturday', '08:00:00', '15:00:00', 24.8138, 67.0305, 18, 'Seaside farmers market bringing Sindh river-belt produce and Malir vegetables.'),
('mkt-rwp-hub', 'Rawalpindi Farm Fresh Hub', 'Ayub National Park Gate 2, Jhelum Road, Rawalpindi', 'Rawalpindi', 'Tuesday, Thursday', '08:30:00', '17:30:00', 33.5684, 73.0886, 11, 'Mid-week produce hub connecting Chakwal and Rawat organic growers.'),
('mkt-psh-heritage', 'Peshawar Heritage Agri Market', 'Near Shahi Bagh, Khyber Bazaar Road, Peshawar', 'Peshawar', 'Wednesday, Sunday', '08:00:00', '17:00:00', 34.0150, 71.5805, 15, 'Traditional market famous for Swat valley fruits and wild honey.');

-- Farmers
INSERT INTO `farmers` (`id`, `user_id`, `stall_name`, `farmer_name`, `contact_person`, `phone`, `email`, `address`, `market_id`, `operating_days`, `pickup_start`, `pickup_end`, `rating`, `reviews_count`, `status`, `bio`) VALUES
('fm-1', 'usr-farmer-1', 'GreenValley Organic Farm', 'Tariq Mehmood', 'Tariq Mehmood', '+92 300 5112233', 'farmer@marketlink.com', 'Chak Shahzad Agricultural Enclave, Islamabad', 'mkt-isb-f6', 'Friday, Saturday', '08:30:00', '17:30:00', 4.90, 38, 'approved', 'Chemical-free farming for over 15 years in Islamabad outskirts.'),
('fm-2', 'usr-farmer-2', 'Potohar Fresh Orchards', 'Ayesha Khan', 'Ayesha Khan', '+92 333 4521890', 'potohar.fresh@marketlink.com', 'Talagang Road, Chakwal, Punjab', 'mkt-isb-f6', 'Friday, Saturday', '09:00:00', '17:00:00', 4.80, 27, 'approved', 'Family-run olive and citrus orchard specializing in seasonal fruits.'),
('fm-3', 'usr-farmer-3', 'Sindh Dairy & Honey Farm', 'Rasheed Ahmed', 'Rasheed Ahmed', '+92 321 9876543', 'sindhdairy@marketlink.com', 'Malir River Basin Farms, Karachi', 'mkt-khi-clifton', 'Saturday', '08:00:00', '14:30:00', 4.95, 43, 'approved', 'Pure buffalo milk, country butter, and wild acacia honey.');

-- Sample Products (in PKR)
INSERT INTO `products` (`id`, `farmer_id`, `category_id`, `name`, `description`, `price`, `unit`, `stock_quantity`, `status`) VALUES
('prod-1', 'fm-1', 'cat-veg', 'Organic Desi Spinach (Palak)', 'Tender, naturally grown pesticide-free spinach harvested fresh on market morning.', 120.00, 'kg', 35, 'available'),
('prod-2', 'fm-1', 'cat-veg', 'Farm Fresh Red Tomatoes', 'Vine-ripened organic tomatoes packed with rich flavor and natural sweetness.', 160.00, 'kg', 50, 'available'),
('prod-7', 'fm-2', 'cat-fruit', 'Kinnnow Orange Pack', 'Juicy, sweet and tangy citrus harvested directly from Bhalwal orchards.', 450.00, 'dozen', 40, 'available'),
('prod-12', 'fm-3', 'cat-dairy', 'Pure Desi Cow Ghee', 'Traditional Bilona churned grass-fed desi cow ghee with rich golden aroma.', 2400.00, 'jar', 18, 'available'),
('prod-15', 'fm-3', 'cat-honey', 'Wild Margalla Beri Honey', '100% pure raw Sidr/Beri mountain honey without heating or filtration.', 1850.00, 'jar', 22, 'available');
