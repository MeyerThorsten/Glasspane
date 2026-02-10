export default function DashboardLoading() {
  return (
    <div className="widget-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="widget-medium bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
          </div>
          <div className="p-5">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-32 bg-gray-50 rounded" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
