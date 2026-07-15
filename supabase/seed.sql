INSERT INTO public.categories (id, name, emoji) VALUES
  ('all', 'All', 'food'),
  ('pizza', 'Pizza', 'pizza'),
  ('burgers', 'Burgers', 'burger'),
  ('rice', 'Rice & Curry', 'rice'),
  ('kottu', 'Kottu', 'kottu'),
  ('desserts', 'Desserts', 'cake'),
  ('healthy', 'Healthy', 'salad'),
  ('beverages', 'Beverages', 'drink')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji;

INSERT INTO public.food_items
  (id, name, restaurant_name, category_id, rating, time_estimate, price, emoji, description, ingredients)
VALUES
  ('1', 'Margherita Pizza', 'Pizza Hut', 'pizza', 4.8, '20-25 min', 2400, 'pizza', 'Classic tomato, mozzarella, and basil pizza baked fresh.', 'Tomato sauce, mozzarella, basil, olive oil'),
  ('2', 'Spicy Chicken Burger', 'Colombo Burger Co.', 'burgers', 4.7, '15-20 min', 1650, 'burger', 'Spicy grilled chicken burger with crisp lettuce and house sauce.', 'Chicken, bun, lettuce, tomato, chili mayo'),
  ('3', 'Cheese Kottu + Egg', 'Kottu King', 'kottu', 4.6, '15-25 min', 950, 'kottu', 'Sri Lankan chopped roti tossed with cheese, egg, and spices.', 'Godamba roti, cheese, egg, leeks, curry spices'),
  ('4', 'Chicken Rice & Curry', 'Upali''s', 'rice', 4.9, '20-30 min', 850, 'rice', 'Comforting chicken rice and curry with sambols and vegetables.', 'Rice, chicken curry, dhal, mallum, sambol'),
  ('5', 'Salmon Nigiri Set', 'Nihon Bashi', 'healthy', 4.9, '25-35 min', 3200, 'sushi', 'Fresh salmon nigiri set prepared for a light premium meal.', 'Salmon, sushi rice, wasabi, soy sauce'),
  ('6', 'King Coconut (Thambili)', 'Fresh Stop', 'beverages', 4.5, '5-10 min', 350, 'drink', 'Chilled king coconut served fresh.', 'King coconut')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  restaurant_name = EXCLUDED.restaurant_name,
  category_id = EXCLUDED.category_id,
  rating = EXCLUDED.rating,
  time_estimate = EXCLUDED.time_estimate,
  price = EXCLUDED.price,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  ingredients = EXCLUDED.ingredients;
