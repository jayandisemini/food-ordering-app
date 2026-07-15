CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT
);

CREATE TABLE IF NOT EXISTS public.food_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL DEFAULT 0,
  time_estimate TEXT,
  price INTEGER NOT NULL,
  emoji TEXT,
  description TEXT NOT NULL DEFAULT '',
  ingredients TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price INTEGER,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT,
  instructions TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  restaurant_name TEXT,
  eta TEXT,
  status TEXT NOT NULL DEFAULT 'placed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS restaurant_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS eta TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS track_lat DOUBLE PRECISION NOT NULL DEFAULT 6.9271;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS track_lng DOUBLE PRECISION NOT NULL DEFAULT 79.8612;

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, food_id)
);

ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE public.favorites
  ADD CONSTRAINT favorites_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are owned by user" ON public.profiles;
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Categories are readable" ON public.categories;
DROP POLICY IF EXISTS "Food items are readable by everyone" ON public.food_items;
DROP POLICY IF EXISTS "Food items are readable" ON public.food_items;
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can manage own orders" ON public.orders;
DROP POLICY IF EXISTS "Orders are owned by user" ON public.orders;
DROP POLICY IF EXISTS "Users can manage own order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items are owned by order user" ON public.order_items;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Favorites are owned by user" ON public.favorites;

CREATE POLICY "Profiles are owned by user"
  ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Categories are readable"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Food items are readable"
  ON public.food_items FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Orders are owned by user"
  ON public.orders FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Order items are owned by order user"
  ON public.order_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Favorites are owned by user"
  ON public.favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.categories, public.food_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.orders, public.order_items, public.favorites TO authenticated;
GRANT ALL ON public.profiles, public.categories, public.food_items, public.orders, public.order_items, public.favorites TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name TEXT;
BEGIN
  profile_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, display_name, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    profile_name,
    profile_name,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.categories (id, name, emoji) VALUES
  ('all', 'All', 'plate'),
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

INSERT INTO public.food_items (id, name, restaurant_name, category_id, rating, time_estimate, price, emoji, description, ingredients) VALUES
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
