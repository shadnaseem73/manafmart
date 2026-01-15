-- Seed Categories and Subcategories

-- Gadget Hub
INSERT INTO categories (name, description, icon, display_order) VALUES
('Gadget Hub', 'Premium audio, wearables, and smart accessories', '🎧', 1)
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, display_order)
SELECT id, name, row_number() OVER (ORDER BY name) FROM (
  VALUES
    ('Gadget Hub', 'Gaming TWS'),
    ('Gadget Hub', 'ANC Airbuds'),
    ('Gadget Hub', 'Budget Airbuds'),
    ('Gadget Hub', 'Transparent Case'),
    ('Gadget Hub', 'Neckbands'),
    ('Gadget Hub', 'Wired Gaming'),
    ('Gadget Hub', 'Type-C Wired'),
    ('Gadget Hub', 'Bone Conduction'),
    ('Gadget Hub', 'Sleep Masks'),
    ('Gadget Hub', 'Mini Speakers'),
    ('Gadget Hub', 'Waterproof Speakers'),
    ('Gadget Hub', 'Calling Smartwatches'),
    ('Gadget Hub', 'Fitness Bands'),
    ('Gadget Hub', 'Kids GPS'),
    ('Gadget Hub', 'Straps'),
    ('Gadget Hub', 'Chargers'),
    ('Gadget Hub', 'Screen Protectors'),
    ('Gadget Hub', 'Audio Receivers'),
    ('Gadget Hub', 'Tracker Cases'),
    ('Gadget Hub', 'Sound Cards')
) AS cat(category_name, subcat_name)
JOIN categories c ON c.name = cat.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM subcategories WHERE name = cat.subcat_name
)
ON CONFLICT DO NOTHING;

-- Mobile Phone Essentials
INSERT INTO categories (name, description, icon, display_order) VALUES
('Mobile Phone Essentials', 'Cables, chargers, and phone accessories', '📱', 2)
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, display_order)
SELECT id, name, row_number() OVER (ORDER BY name) FROM (
  VALUES
    ('Mobile Phone Essentials', 'Type-C Cables'),
    ('Mobile Phone Essentials', 'iPhone Cables'),
    ('Mobile Phone Essentials', 'Micro USB'),
    ('Mobile Phone Essentials', '3-in-1'),
    ('Mobile Phone Essentials', 'PD Cables'),
    ('Mobile Phone Essentials', 'Gaming Cables'),
    ('Mobile Phone Essentials', 'Short Cables'),
    ('Mobile Phone Essentials', 'Magnetic Cables'),
    ('Mobile Phone Essentials', 'Fast Adapters'),
    ('Mobile Phone Essentials', 'GaN Chargers'),
    ('Mobile Phone Essentials', 'Car Chargers'),
    ('Mobile Phone Essentials', 'Wireless Pads'),
    ('Mobile Phone Essentials', 'OTG'),
    ('Mobile Phone Essentials', 'Audio Converters'),
    ('Mobile Phone Essentials', 'Splitters'),
    ('Mobile Phone Essentials', 'Desk Stands'),
    ('Mobile Phone Essentials', 'Tablet Stands'),
    ('Mobile Phone Essentials', 'Bike Mounts'),
    ('Mobile Phone Essentials', 'Car Holders'),
    ('Mobile Phone Essentials', 'Ring Holders'),
    ('Mobile Phone Essentials', 'Cable Protectors'),
    ('Mobile Phone Essentials', 'SIM Tools')
) AS cat(category_name, subcat_name)
JOIN categories c ON c.name = cat.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM subcategories WHERE name = cat.subcat_name
)
ON CONFLICT DO NOTHING;

-- Comfort & Care
INSERT INTO categories (name, description, icon, display_order) VALUES
('Comfort & Care', 'Personal care and ambient lighting', '💆', 3)
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, display_order)
SELECT id, name, row_number() OVER (ORDER BY name) FROM (
  VALUES
    ('Comfort & Care', 'Men''s Trimmers'),
    ('Comfort & Care', 'Grooming Kits'),
    ('Comfort & Care', 'Shavers'),
    ('Comfort & Care', 'Nose Trimmers'),
    ('Comfort & Care', 'Body Groomers'),
    ('Comfort & Care', 'Mini Dryers'),
    ('Comfort & Care', 'Straighteners'),
    ('Comfort & Care', 'Blackhead Removers'),
    ('Comfort & Care', 'Cleansing Brushes'),
    ('Comfort & Care', 'Lint Removers'),
    ('Comfort & Care', 'RGB Strips'),
    ('Comfort & Care', 'Sunset Lamps'),
    ('Comfort & Care', 'Galaxy Projectors'),
    ('Comfort & Care', 'Moon Lamps'),
    ('Comfort & Care', 'Motion Lights'),
    ('Comfort & Care', 'Night Lights'),
    ('Comfort & Care', 'Reading Lights'),
    ('Comfort & Care', 'Table Clocks'),
    ('Comfort & Care', 'Cable Management'),
    ('Comfort & Care', 'Desk Mats'),
    ('Comfort & Care', 'Humidifiers'),
    ('Comfort & Care', 'Fans'),
    ('Comfort & Care', 'Mosquito Killers')
) AS cat(category_name, subcat_name)
JOIN categories c ON c.name = cat.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM subcategories WHERE name = cat.subcat_name
)
ON CONFLICT DO NOTHING;

-- Smart Picks
INSERT INTO categories (name, description, icon, display_order) VALUES
('Smart Picks', 'Content creation and smart gadgets', '📸', 4)
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, display_order)
SELECT id, name, row_number() OVER (ORDER BY name) FROM (
  VALUES
    ('Smart Picks', 'Wireless Mics'),
    ('Smart Picks', 'Wired Mics'),
    ('Smart Picks', 'Selfie Sticks'),
    ('Smart Picks', 'Mini Tripods'),
    ('Smart Picks', 'Gorilla Pods'),
    ('Smart Picks', 'Ring Lights'),
    ('Smart Picks', 'Gimbals'),
    ('Smart Picks', 'Finger Sleeves'),
    ('Smart Picks', 'Triggers'),
    ('Smart Picks', 'Cooling Fans'),
    ('Smart Picks', 'Camera Lenses'),
    ('Smart Picks', 'Stylus Pens'),
    ('Smart Picks', 'Writing Tablets'),
    ('Smart Picks', 'Luggage Scales'),
    ('Smart Picks', 'Kitchen Scales'),
    ('Smart Picks', 'Laser Pointers'),
    ('Smart Picks', 'Smart Wallets'),
    ('Smart Picks', 'Key Organizers'),
    ('Smart Picks', 'Flashlights'),
    ('Smart Picks', 'Multi-Tools'),
    ('Smart Picks', 'Fingerprint Padlocks')
) AS cat(category_name, subcat_name)
JOIN categories c ON c.name = cat.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM subcategories WHERE name = cat.subcat_name
)
ON CONFLICT DO NOTHING;

-- Initialize Master Config
INSERT INTO master_config (feature_key, is_enabled, metadata) VALUES
('squad_buys_enabled', true, '{"description": "Enable/disable squad buying feature"}'),
('partial_cod_enabled', true, '{"min_amount": 2000, "booking_fee": 200}'),
('ai_search_enabled', true, '{"voice_search": true, "image_search": true}'),
('invoice_pdf_enabled', true, '{"dark_theme": true}'),
('blockchain_verify_enabled', true, '{"network": "test"}'),
('spy_dashboard_enabled', false, '{"description": "Admin-only dashboard"}'),
('master_switchboard_enabled', true, '{"description": "Admin feature toggle panel"}'),
('elite_drops_enabled', true, '{"limited_quantity": 50}')
ON CONFLICT DO NOTHING;
