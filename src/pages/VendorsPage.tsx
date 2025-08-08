import { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { supabase, Vendor } from '../lib/supabase';
import VendorCard from '../components/VendorCard';
import { VendorCardSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterAndSortVendors();
  }, [vendors, searchQuery, sortBy, minRating]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVendors = () => {
    const filtered = vendors.filter(vendor => {
      const matchesSearch = vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = vendor.rating >= minRating;
      return matchesSearch && matchesRating;
    });

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'orders':
          return b.total_orders - a.total_orders;
        case 'name':
          return a.business_name.localeCompare(b.business_name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredVendors(filtered);
  };

  const ratingStars = [1, 2, 3, 4, 5].map(rating => (
    <button
      key={rating}
      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        minRating >= rating
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Star className={`h-4 w-4 ${minRating >= rating ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
      <span>{rating}+ Stars</span>
    </button>
  ));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Vendors</h1>
          <p className="text-gray-600 text-lg">
            Discover amazing local vendors serving fresh, homemade tiffins in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search vendors, food types, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="orders">Most Orders</option>
                <option value="name">Name (A-Z)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="lg:col-span-4">
              <div className="flex flex-wrap gap-2">
                {ratingStars}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${filteredVendors.length} vendors found`}
          </p>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <VendorCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No vendors found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find more vendors.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setMinRating(0);
                setSortBy('rating');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}