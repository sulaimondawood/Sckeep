
-- Create RLS policies for food_items table (if they don't exist)
DO $$ 
BEGIN
    -- Check and create food_items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'food_items' 
        AND policyname = 'Users can view their own food items'
    ) THEN
        CREATE POLICY "Users can view their own food items" 
          ON public.food_items 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'food_items' 
        AND policyname = 'Users can create their own food items'
    ) THEN
        CREATE POLICY "Users can create their own food items" 
          ON public.food_items 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'food_items' 
        AND policyname = 'Users can update their own food items'
    ) THEN
        CREATE POLICY "Users can update their own food items" 
          ON public.food_items 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'food_items' 
        AND policyname = 'Users can delete their own food items'
    ) THEN
        CREATE POLICY "Users can delete their own food items" 
          ON public.food_items 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create RLS policies for notifications table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications" 
          ON public.notifications 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can create their own notifications'
    ) THEN
        CREATE POLICY "Users can create their own notifications" 
          ON public.notifications 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications" 
          ON public.notifications 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can delete their own notifications'
    ) THEN
        CREATE POLICY "Users can delete their own notifications" 
          ON public.notifications 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create RLS policies for user_settings table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can view their own settings'
    ) THEN
        CREATE POLICY "Users can view their own settings" 
          ON public.user_settings 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can create their own settings'
    ) THEN
        CREATE POLICY "Users can create their own settings" 
          ON public.user_settings 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can update their own settings'
    ) THEN
        CREATE POLICY "Users can update their own settings" 
          ON public.user_settings 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_settings' 
        AND policyname = 'Users can delete their own settings'
    ) THEN
        CREATE POLICY "Users can delete their own settings" 
          ON public.user_settings 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;
