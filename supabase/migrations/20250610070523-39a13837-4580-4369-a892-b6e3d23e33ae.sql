
-- Create RLS policies for notifications table (if they don't exist)
DO $$ 
BEGIN
    -- Check and create notifications policies
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
END $$;

-- Create a storage bucket for food images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food_images', 'food_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the food_images bucket (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload their own food images'
    ) THEN
        CREATE POLICY "Users can upload their own food images" 
          ON storage.objects 
          FOR INSERT 
          WITH CHECK (bucket_id = 'food_images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view food images'
    ) THEN
        CREATE POLICY "Users can view food images" 
          ON storage.objects 
          FOR SELECT 
          USING (bucket_id = 'food_images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their own food images'
    ) THEN
        CREATE POLICY "Users can update their own food images" 
          ON storage.objects 
          FOR UPDATE 
          USING (bucket_id = 'food_images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own food images'
    ) THEN
        CREATE POLICY "Users can delete their own food images" 
          ON storage.objects 
          FOR DELETE 
          USING (bucket_id = 'food_images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;
