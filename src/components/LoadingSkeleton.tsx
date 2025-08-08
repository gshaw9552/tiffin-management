interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({ className = '', count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}

export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
      <div className="h-6 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}