import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface AnalyticsChartsProps {
  categories: {
    label: string;
    count: number;
    value: number;
  }[];
  facilities: {
    label: string;
    count: number;
    value: number;
  }[];
  umkmStatus: {
    verified: number;
    inProgress: number;
    unverified: number;
    verifiedPercent: number;
  };
}

export default function AnalyticsCharts({ categories, facilities, umkmStatus }: AnalyticsChartsProps) {
  const categoryColors = [
    'bg-emerald-500',
    'bg-purple-600',
    'bg-amber-500',
    'bg-blue-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];

  const total = umkmStatus.verified + umkmStatus.inProgress + umkmStatus.unverified;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card - Destinasi by Category */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-purple-900">Destinasi by Category</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6">
            {categories.slice(0, 5).map((cat, idx) => (
              <div key={cat.label} className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-bold text-gray-700">{cat.label}</span>
                  <span className="text-gray-500 font-semibold">{cat.value}% <span className="text-gray-300 mx-1 font-normal">|</span> {cat.count}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${categoryColors[idx % categoryColors.length]} rounded-full`} style={{ width: `${cat.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card - Halal Facilities Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-purple-900">Facilities Statistics</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6">
            {facilities.slice(0, 5).map((fac, idx) => (
              <div key={fac.label} className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-bold text-gray-700">{fac.label}</span>
                  <span className="text-gray-500 font-semibold">{fac.value}% <span className="text-gray-300 mx-1 font-normal">|</span> {fac.count}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${categoryColors[(idx + 2) % categoryColors.length]} rounded-full`} style={{ width: `${fac.value}%` }}></div>
                </div>
              </div>
            ))}
            {facilities.length === 0 && (
              <div className="text-center py-8 text-gray-400 italic">No facility data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* UMKM Halal Status Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold text-purple-900 mb-6">UMKM Halal Status</h2>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-16 py-4">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0 drop-shadow-sm">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="12"
                strokeDasharray={`${(umkmStatus.inProgress / total) * 251.327} 251.327`}
                strokeDashoffset={`-${(umkmStatus.verified / total) * 251.327}`}
              />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#7C3AED" strokeWidth="12"
                strokeDasharray={`${(umkmStatus.verified / total) * 251.327} 251.327`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{umkmStatus.verifiedPercent}%</span>
              <span className="text-sm text-gray-500 font-semibold mt-1">Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-xs font-bold text-gray-500 uppercase">Verified</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{umkmStatus.verified.toLocaleString()}</div>
              <div className="text-xs text-gray-400 font-medium">certified businesses</div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs font-bold text-gray-500 uppercase">In Progress</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{umkmStatus.inProgress.toLocaleString()}</div>
              <div className="text-xs text-gray-400 font-medium">validation pending</div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span className="text-xs font-bold text-gray-500 uppercase">Unverified</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{umkmStatus.unverified.toLocaleString()}</div>
              <div className="text-xs text-gray-400 font-medium">no certificates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
