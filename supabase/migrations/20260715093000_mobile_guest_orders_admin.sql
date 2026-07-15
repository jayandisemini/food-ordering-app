ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE public.food_items ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.food_items ADD COLUMN IF NOT EXISTS ingredients TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS track_lat DOUBLE PRECISION NOT NULL DEFAULT 6.9271;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS track_lng DOUBLE PRECISION NOT NULL DEFAULT 79.8612;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS orders_user_created_idx ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id, created_at DESC);

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE(display_name, full_name, avatar_url, phone, updated_at) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can read all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can read all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can read all food items" ON public.food_items;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all food items"
  ON public.food_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

UPDATE public.food_items SET
  description = 'Classic tomato, mozzarella, and basil pizza baked fresh.',
  ingredients = 'Tomato sauce, mozzarella, basil, olive oil'
WHERE id = '1';

UPDATE public.food_items SET
  description = 'Spicy grilled chicken burger with crisp lettuce and house sauce.',
  ingredients = 'Chicken, bun, lettuce, tomato, chili mayo'
WHERE id = '2';

UPDATE public.food_items SET
  description = 'Sri Lankan chopped roti tossed with cheese, egg, and spices.',
  ingredients = 'Godamba roti, cheese, egg, leeks, curry spices'
WHERE id = '3';

UPDATE public.food_items SET
  description = 'Comforting chicken rice and curry with sambols and vegetables.',
  ingredients = 'Rice, chicken curry, dhal, mallum, sambol'
WHERE id = '4';

UPDATE public.food_items SET
  description = 'Fresh salmon nigiri set prepared for a light premium meal.',
  ingredients = 'Salmon, sushi rice, wasabi, soy sauce'
WHERE id = '5';

UPDATE public.food_items SET
  description = 'Chilled king coconut served fresh.',
  ingredients = 'King coconut'
WHERE id = '6';
