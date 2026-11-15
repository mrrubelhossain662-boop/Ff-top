-- Database structure for API Reseller & Product Override System

CREATE TABLE IF NOT EXISTS `api_sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `button_name` varchar(255) NOT NULL,
  `api_url` text NOT NULL,
  `api_token` varchar(255) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `api_products_override` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `api_source_id` int(11) NOT NULL,
  `product_id` varchar(255) NOT NULL, -- Original product ID from provider API
  `custom_name` varchar(255) DEFAULT NULL,
  `custom_image` text DEFAULT NULL,
  `custom_price` decimal(10,2) DEFAULT NULL,
  `is_hidden` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `api_source_id` (`api_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
