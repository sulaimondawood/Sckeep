
# Supabase Setup Instructions for Food Tracker App

## Database Schema Setup

Run the following SQL in the Supabase SQL Editor to set up your database schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up tables
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  expiry_date DATE NOT NULL,
  added_date DATE NOT NULL,
  barcode VARCHAR,
  quantity NUMERIC NOT NULL,
  unit VARCHAR NOT NULL,
  notes TEXT,
  image_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR NOT NULL,
  message TEXT NOT NULL,
  item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  theme VARCHAR,
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_warning_days INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_food_items_user_id ON food_items(user_id);
CREATE INDEX idx_food_items_expiry_date ON food_items(expiry_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

## Row Level Security (RLS) Policies

Set up Row Level Security to ensure users can only access their own data:

```sql
-- Enable RLS on tables
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for food_items table
CREATE POLICY "Users can view their own food items" 
ON food_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food items" 
ON food_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food items" 
ON food_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food items" 
ON food_items FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for user_settings table
CREATE POLICY "Users can view their own settings" 
ON user_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON user_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
ON user_settings FOR DELETE 
USING (auth.uid() = user_id);
```

## Storage Setup

1. Create a new bucket called `food_images` in the Storage section of your Supabase dashboard.

2. Set up RLS policies for the storage bucket:

```sql
-- Users can view any image (public access to view)
CREATE POLICY "Public can view food images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'food_images');

-- Users can upload their own images
CREATE POLICY "Users can upload their own images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'food_images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own images
CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'food_images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'food_images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_URL.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace the values with your actual Supabase project URL and anon key, which you can find in your Supabase dashboard under Project Settings > API.

## Authentication Setup

1. In the Supabase dashboard, go to Authentication > Settings
2. Ensure Email Auth is enabled with "Confirm email" option
3. Configure the Site URL to match your application URL
4. Customize email templates if desired

## Optional: Database Functions

Create a function to automatically clean up old deleted items (run as a scheduled function):

```sql
-- Function to delete items that have been in the deleted_items table for more than 30 days
CREATE OR REPLACE FUNCTION clean_old_deleted_items()
RETURNS void AS $$
BEGIN
  DELETE FROM deleted_items
  WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

## Next Steps

After setting up the database schema and policies:

1. Set the environment variables in your project
2. Implement the client-side code to interact with Supabase
3. Test authentication flow and CRUD operations
4. Implement file uploads for food item images
