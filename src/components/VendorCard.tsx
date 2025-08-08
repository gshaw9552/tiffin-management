import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Utensils } from 'lucide-react';
import { Vendor } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';

interface VendorCardProps {
  vendor: Vendor & {
    profiles?: { full_name: string };
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500">
        {vendor.image_url ? (
          <img
            src={vendor.image_url}
            alt={vendor.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-16 w-16 text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <div className="bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {vendor.business_name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {vendor.description || 'Delicious homemade tiffins with authentic flavors'}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{vendor.address}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>30-45 min delivery</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">Min order: </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(vendor.min_order_amount)}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Delivery: </span>
            <span className="font-medium text-gray-900">
              {vendor.delivery_fee === 0 ? 'Free' : formatCurrency(vendor.delivery_fee)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {vendor.total_orders} orders completed
            </div>
            <Link
              to={`/vendor/${vendor.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}