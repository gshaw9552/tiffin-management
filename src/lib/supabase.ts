import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'vendor' | 'admin';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  profile_id: string;
  business_name: string;
  description?: string;
  address: string;
  phone: string;
  is_active: boolean;
  rating: number;
  total_orders: number;
  delivery_fee: number;
  min_order_amount: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url?: string;
  preparation_time: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  order_number: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  special_instructions?: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  vendor_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  qr_code_data?: string;
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  vendor_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}