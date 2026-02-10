export default function ComplianceLoading() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#1C1C27] rounded-xl border border-gray-200 dark:border-[#2E2E3D] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#252533]">
            <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-1/4 animate-pulse" />
          </div>
          <div className="p-5">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-3/4" />
              <div className="h-48 bg-gray-50 dark:bg-[#1C1C27] rounded" />
              <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
