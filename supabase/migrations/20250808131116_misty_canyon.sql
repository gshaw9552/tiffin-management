/*
  # Tiffin Management Platform - Initial Database Schema

  ## Overview
  Complete database schema for the Tiffin Management Platform supporting:
  - Dual user system (students and vendors)
  - Order management with status tracking
  - Menu and vendor management
  - Payment processing with QR codes
  - Reviews and analytics

  ## Tables Created
  1. **profiles** - User profiles extending Supabase auth
  2. **vendors** - Vendor business information and settings
  3. **menu_items** - Vendor menu items with categories
  4. **orders** - Order tracking with status management
  5. **order_items** - Individual items within orders
  6. **payments** - Payment transaction records
  7. **reviews** - Customer reviews and ratings
  8. **vendor_timings** - Operating hours and availability

  ## Security
  - Row Level Security enabled on all tables
  - Policies for role-based access control
  - Secure payment verification workflow

  ## Performance
  - Proper indexing on frequently queried columns
  - Foreign key relationships for data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('student', 'vendor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'failed', 'refunded');

-- Profiles table extending Supabase auth
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendors table for business information
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text,
  address text NOT NULL,
  phone text NOT NULL,
  is_active boolean DEFAULT true,
  rating numeric(3,2) DEFAULT 0.0,
  total_orders integer DEFAULT 0,
  delivery_fee numeric(10,2) DEFAULT 0.00,
  min_order_amount numeric(10,2) DEFAULT 0.00,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor operating timings
CREATE TABLE IF NOT EXISTS vendor_timings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  category text NOT NULL,
  is_available boolean DEFAULT true,
  image_url text,
  preparation_time integer DEFAULT 30, -- in minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_fee numeric(10,2) DEFAULT 0.00,
  special_instructions text,
  estimated_delivery_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items (individual items within orders)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  payment_method text DEFAULT 'qr_code',
  transaction_id text UNIQUE,
  qr_code_data text,
  status payment_status DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor ON menu_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews(vendor_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_timings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public vendor profiles viewable"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'vendor');

-- RLS Policies for vendors
CREATE POLICY "Anyone can view active vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Vendors can manage own business"
  ON vendors FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- RLS Policies for vendor_timings
CREATE POLICY "Anyone can view vendor timings"
  ON vendor_timings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors can manage own timings"
  ON vendor_timings FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE profile_id = auth.uid()
    )
  );

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Vendors can manage own menu"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE profile_id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Vendors can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Vendors can update their orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE profile_id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_id = auth.uid() 
      OR vendor_id IN (
        SELECT id FROM vendors WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert order items for their orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    vendor_id IN (
      SELECT id FROM vendors WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create reviews for their orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger for order number generation
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE generate_order_number();

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors 
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews 
    WHERE vendor_id = NEW.vendor_id
  )
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update vendor rating on new review
CREATE TRIGGER update_vendor_rating_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_vendor_rating();