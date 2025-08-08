import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKindeAuth } from '../lib/kinde';
import { supabase, Vendor, MenuItem } from '../lib/supabase';
import { formatCurrency, generateTransactionId } from '../lib/utils';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CheckoutData {
  vendor: Vendor;
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useKindeAuth();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qr_code');
  const [qrCodeData, setQrCodeData] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const data = location.state as CheckoutData;
    if (!data || !data.vendor || !data.cartItems.length) {
      toast.error('Invalid checkout data');
      navigate('/vendors');
      return;
    }

    setCheckoutData(data);
    
    // Generate payment data
    const txnId = generateTransactionId();
    setTransactionId(txnId);
    
    // Generate QR code data (UPI format)
    const upiData = `upi://pay?pa=vendor@paytm&pn=${encodeURIComponent(data.vendor.business_name)}&am=${data.total}&tn=${encodeURIComponent(`Order payment - ${txnId}`)}&cu=INR`;
    setQrCodeData(upiData);
  }, [location.state, isAuthenticated, navigate]);

  const handlePlaceOrder = async () => {
    if (!checkoutData || !user) return;

    setProcessing(true);
    
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          vendor_id: checkoutData.vendor.id,
          total_amount: checkoutData.total,
          delivery_fee: checkoutData.deliveryFee,
          special_instructions: specialInstructions || null,
          estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = checkoutData.cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          customer_id: user.id,
          vendor_id: checkoutData.vendor.id,
          amount: checkoutData.total,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          qr_code_data: qrCodeData,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      toast.success('Order placed successfully!');
      navigate('/dashboard', { 
        state: { 
          message: 'Order placed successfully! Your payment is pending verification.',
          orderId: order.id 
        } 
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order from</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {checkoutData.vendor.business_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {checkoutData.vendor.business_name}
                  </h3>
                  <p className="text-gray-600">{checkoutData.vendor.address}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {checkoutData.cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Special Instructions (Optional)
              </h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or delivery instructions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(checkoutData.subtotal)}</span>
                </div>
                {checkoutData.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(checkoutData.deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(checkoutData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr_code"
                    checked={paymentMethod === 'qr_code'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <span>UPI/QR Code Payment</span>
                </label>
              </div>

              {paymentMethod === 'qr_code' && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <QRCode value={qrCodeData} size={200} />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <strong>Transaction ID:</strong> {transactionId}
                    </p>
                    <p>
                      Scan the QR code with any UPI app to pay {formatCurrency(checkoutData.total)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Payment Verification</p>
                  <p>
                    After placing your order, please complete the payment using the QR code above. 
                    Your order will be confirmed once the vendor verifies your payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Placing Order...' : `Place Order - ${formatCurrency(checkoutData.total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}