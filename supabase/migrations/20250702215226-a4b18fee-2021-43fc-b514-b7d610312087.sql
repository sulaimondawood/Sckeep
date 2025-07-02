-- Create waste_log table to track disposed/consumed items
CREATE TABLE public.waste_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  disposal_type TEXT NOT NULL CHECK (disposal_type IN ('wasted', 'consumed', 'donated', 'composted')),
  disposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  reason TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  carbon_footprint_kg NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create waste_goals table for user waste reduction goals
CREATE TABLE public.waste_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('monthly_waste_reduction', 'carbon_footprint_reduction', 'cost_savings')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_period TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create carbon_footprint_data table for food carbon footprint estimates
CREATE TABLE public.carbon_footprint_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  carbon_per_kg NUMERIC NOT NULL, -- kg CO2 per kg of food
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waste_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_footprint_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for waste_log
CREATE POLICY "Users can view their own waste logs" 
ON public.waste_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waste logs" 
ON public.waste_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waste logs" 
ON public.waste_log 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waste logs" 
ON public.waste_log 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for waste_goals
CREATE POLICY "Users can view their own waste goals" 
ON public.waste_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waste goals" 
ON public.waste_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waste goals" 
ON public.waste_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waste goals" 
ON public.waste_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for carbon_footprint_data (read-only for all users)
CREATE POLICY "Anyone can view carbon footprint data" 
ON public.carbon_footprint_data 
FOR SELECT 
USING (true);

-- Insert default carbon footprint data (kg CO2 per kg of food)
INSERT INTO public.carbon_footprint_data (category, carbon_per_kg) VALUES
('Meat', 50.0),
('Seafood', 6.0),
('Dairy', 3.2),
('Fruits', 0.9),
('Vegetables', 0.4),
('Bakery', 1.3),
('Beverages', 0.7),
('Snacks', 2.1),
('Frozen', 1.8),
('Canned', 1.1),
('Other', 1.0);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_waste_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_waste_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_waste_log_updated_at
BEFORE UPDATE ON public.waste_log
FOR EACH ROW
EXECUTE FUNCTION public.update_waste_log_updated_at();

CREATE TRIGGER update_waste_goals_updated_at
BEFORE UPDATE ON public.waste_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_waste_goals_updated_at();