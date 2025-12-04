/*
  # Food Ordering Platform Database Schema

  ## Overview
  This migration creates a complete database schema for a food ordering platform
  that allows restaurants to manage menus and orders while customers can browse,
  order, track deliveries, and provide ratings.

  ## 1. New Tables

  ### `restaurants`
  - `id` (uuid, primary key) - Unique restaurant identifier
  - `user_id` (uuid, foreign key to auth.users) - Owner of the restaurant
  - `name` (text) - Restaurant name
  - `description` (text) - Restaurant description
  - `image_url` (text) - Restaurant logo/image
  - `address` (text) - Physical address
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `restaurant_id` (uuid, foreign key) - Associated restaurant
  - `name` (text) - Category name (e.g., "Pizza", "Burgers")
  - `display_order` (integer) - Order for displaying categories
  - `created_at` (timestamptz) - Record creation timestamp

  ### `menu_items`
  - `id` (uuid, primary key) - Unique menu item identifier
  - `restaurant_id` (uuid, foreign key) - Associated restaurant
  - `category_id` (uuid, foreign key) - Associated category
  - `name` (text) - Dish name
  - `description` (text) - Detailed description
  - `price` (decimal) - Price in dollars
  - `image_url` (text) - Food image URL
  - `available` (boolean) - Availability status
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `customer_id` (uuid, foreign key to auth.users) - Customer who placed order
  - `restaurant_id` (uuid, foreign key) - Restaurant fulfilling order
  - `status` (text) - Order status: 'pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'
  - `total_amount` (decimal) - Total order cost
  - `delivery_address` (text) - Delivery location
  - `customer_notes` (text) - Special instructions
  - `created_at` (timestamptz) - Order placement time
  - `updated_at` (timestamptz) - Last status update time

  ### `order_items`
  - `id` (uuid, primary key) - Unique order item identifier
  - `order_id` (uuid, foreign key) - Associated order
  - `menu_item_id` (uuid, foreign key) - Menu item ordered
  - `quantity` (integer) - Number of items
  - `price` (decimal) - Price at time of order
  - `special_instructions` (text) - Item-specific notes

  ### `ratings`
  - `id` (uuid, primary key) - Unique rating identifier
  - `order_id` (uuid, foreign key) - Associated order
  - `customer_id` (uuid, foreign key to auth.users) - Customer providing rating
  - `menu_item_id` (uuid, foreign key) - Rated dish
  - `restaurant_id` (uuid, foreign key) - Rated restaurant
  - `rating` (integer) - Score from 1-5
  - `review` (text) - Written feedback
  - `created_at` (timestamptz) - Rating submission time

  ### `user_profiles`
  - `id` (uuid, primary key, foreign key to auth.users) - User identifier
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone
  - `default_address` (text) - Default delivery address
  - `is_restaurant_owner` (boolean) - Flag for restaurant owners
  - `created_at` (timestamptz) - Profile creation time
  - `updated_at` (timestamptz) - Profile update time

  ## 2. Security (Row Level Security)

  All tables have RLS enabled with policies that ensure:
  - Users can only view their own orders and profiles
  - Restaurant owners can only manage their own restaurants, menus, and orders
  - All users can view public menu items and restaurant information
  - Only customers who placed orders can rate items from those orders
  - Secure data access based on authentication and ownership

  ## 3. Indexes

  Performance indexes added for:
  - Menu item lookups by restaurant and category
  - Order queries by customer and restaurant
  - Rating queries by menu item and restaurant
  - Fast filtering of available menu items

  ## 4. Important Notes

  - All monetary values use DECIMAL(10,2) for precise currency handling
  - Order status follows the flow: pending → preparing → on_the_way → delivered
  - Ratings are constrained to 1-5 range
  - Timestamps use timestamptz for timezone awareness
  - Foreign key constraints maintain referential integrity
  - Default values prevent null errors and provide sensible starting states
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  default_address text,
  is_restaurant_owner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  address text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_address text NOT NULL,
  customer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  special_instructions text
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, menu_item_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ratings_menu_item ON ratings(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_ratings_restaurant ON ratings(restaurant_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Restaurants Policies
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurant owners can insert own restaurant"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can update own restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can delete own restaurant"
  ON restaurants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurant owners can manage own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

-- Menu Items Policies
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurant owners can insert own menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can update own menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can delete own menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

-- Orders Policies
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Restaurant owners can view orders for their restaurant"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Restaurant owners can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.user_id = auth.uid()
    )
  );

-- Order Items Policies
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN restaurants ON restaurants.id = orders.restaurant_id
      WHERE orders.id = order_id
      AND restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Ratings Policies
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can rate items from their orders"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'delivered'
    )
  );

CREATE POLICY "Customers can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);