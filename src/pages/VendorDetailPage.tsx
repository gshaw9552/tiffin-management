import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, ShoppingCart, X } from 'lucide-react';
import { supabase, Vendor, MenuItem } from '../lib/supabase';
import { useKindeAuth } from '../lib/kinde';
import MenuItemCard from '../components/MenuItemCard';
import { MenuItemSkeleton } from '../components/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useKindeAuth();
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
      fetchMenuItems();
    }
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Vendor not found');
      navigate('/vendors');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', id)
        .order('category')
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (quantity === 0) {
        return prevCart.filter(cartItem => cartItem.id !== item.id);
      }
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity } : cartItem
        );
      }
      
      return [...prevCart, { ...item, quantity }];
    });
  };

  const getTotalAmount = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = vendor?.delivery_fee || 0;
    return subtotal + deliveryFee;
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const subtotal = getSubtotal();
    if (vendor && subtotal < vendor.min_order_amount) {
      toast.error(`Minimum order amount is ${formatCurrency(vendor.min_order_amount)}`);
      return;
    }

    // Navigate to checkout with cart data
    navigate('/checkout', {
      state: {
        vendor,
        cartItems: cart,
        subtotal,
        deliveryFee: vendor?.delivery_fee || 0,
        total: getTotalAmount()
      }
    });
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-square bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg overflow-hidden">
                {vendor.image_url ? (
                  <img
                    src={vendor.image_url}
                    alt={vendor.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {vendor.business_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {vendor.business_name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                  <span className="text-gray-600">({vendor.total_orders} orders)</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{vendor.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>30-45 min delivery</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {vendor.description || 'Serving delicious, authentic homemade food with love and care.'}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Minimum Order</span>
                  <div className="font-semibold text-lg">
                    {formatCurrency(vendor.min_order_amount)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Delivery Fee</span>
                  <div className="font-semibold text-lg">
                    {vendor.delivery_fee === 0 ? 'Free' : formatCurrency(vendor.delivery_fee)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu</h2>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <MenuItemSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                    cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sticky Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Order</h3>
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {cartItemCount}
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(getSubtotal())}</span>
                      </div>
                      {vendor.delivery_fee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>{formatCurrency(vendor.delivery_fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>{formatCurrency(getTotalAmount())}</span>
                      </div>
                    </div>

                    {vendor.min_order_amount > getSubtotal() && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Add {formatCurrency(vendor.min_order_amount - getSubtotal())} more to reach minimum order
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={getSubtotal() < vendor.min_order_amount}
                      className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAuthenticated ? 'Proceed to Checkout' : 'Login to Order'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}