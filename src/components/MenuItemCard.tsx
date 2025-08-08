import { useState } from 'react';
import { Plus, Minus, Clock } from 'lucide-react';
import { MenuItem } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  cartQuantity?: number;
}

export default function MenuItemCard({ item, onAddToCart, cartQuantity = 0 }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(cartQuantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
      onAddToCart(item, newQuantity);
    }
  };

  if (!item.is_available) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-60">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-500 line-clamp-2">{item.name}</h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-semibold text-gray-400">{formatCurrency(item.price)}</span>
              <span className="text-sm text-red-500 font-medium">Currently Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-200 to-red-200 rounded-lg flex items-center justify-center overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-orange-600 text-xs font-medium text-center">No Image</span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{item.preparation_time} min</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="font-semibold text-lg text-gray-900">
              {formatCurrency(item.price)}
            </span>

            {quantity === 0 ? (
              <button
                onClick={() => handleQuantityChange(1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="bg-gray-200 text-gray-700 p-1 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="bg-blue-600 text-white p-1 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}