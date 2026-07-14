-- Seed categories
INSERT INTO public.categories (id, name, emoji) VALUES
  ('all', 'All', '🍽️'),
  ('pizza', 'Pizza', '🍕'),
  ('burgers', 'Burgers', '🍔'),
  ('rice', 'Rice & Curry', '🍛'),
  ('kottu', 'Kottu', '🥘'),
  ('desserts', 'Desserts', '🍰'),
  ('healthy', 'Healthy', '🥗'),
  ('beverages', 'Beverages', '🥤')
ON CONFLICT (id) DO NOTHING;

-- Seed food_items
INSERT INTO public.food_items (id, name, restaurant_name, category_id, rating, time_estimate, price, emoji) VALUES
  ('1', 'Margherita Pizza', 'Pizza Hut', 'pizza', 4.8, '20-25 min', 2400, '🍕'),
  ('2', 'Spicy Chicken Burger', 'Colombo Burger Co.', 'burgers', 4.7, '15-20 min', 1650, '🍔'),
  ('3', 'Cheese Kottu + Egg', 'Kottu King', 'kottu', 4.6, '15-25 min', 950, '🥘'),
  ('4', 'Chicken Rice & Curry', 'Upali''s', 'rice', 4.9, '20-30 min', 850, '🍛'),
  ('5', 'Salmon Nigiri Set', 'Nihon Bashi', 'healthy', 4.9, '25-35 min', 3200, '🍣'),
  ('6', 'King Coconut (Thambili)', 'Fresh Stop', 'beverages', 4.5, '5-10 min', 350, '🥥')
ON CONFLICT (id) DO NOTHING;
