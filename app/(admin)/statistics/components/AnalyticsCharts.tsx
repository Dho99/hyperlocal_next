import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Left Card - Destinasi by Category */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-purple-900">Destinasi by Category</h2>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-end space-y-6">
          {[
            { label: 'Nature', value: 45, color: 'bg-emerald-500', count: '561' },
            { label: 'Culture', value: 25, color: 'bg-purple-600', count: '312' },
            { label: 'History', value: 18, color: 'bg-amber-500', count: '224' },
            { label: 'Retail', value: 12, color: 'bg-blue-500', count: '151' },
          ].map((cat) => (
            <div key={cat.label} className="space-y-2">
              <div className="flex justify-between items-end text-sm">
                <span className="font-bold text-gray-700">{cat.label}</span>
                <span className="text-gray-500 font-semibold">{cat.value}% <span className="text-gray-300 mx-1 font-normal">|</span> {cat.count}</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Card - UMKM Halal Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold text-purple-900 mb-6">UMKM Halal Status</h2>

        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-16 py-4">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0 drop-shadow-sm">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Unverified (13%) - Background */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="12" />

              {/* In Progress (20%) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="12"
                strokeDasharray="50.27 251.327"
                strokeDashoffset="-168.39"
              />

              {/* Verified (67%) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#7C3AED" strokeWidth="12"
                strokeDasharray="168.39 251.327"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">67%</span>
              <span className="text-sm text-gray-500 font-semibold mt-1">Verified</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-purple-600 shadow-sm"></div>
              <div>
                <div className="text-sm font-bold text-gray-900">Verified</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">3,105 (67%)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm"></div>
              <div>
                <div className="text-sm font-bold text-gray-900">In Progress</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">918 (20%)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200 shadow-sm"></div>
              <div>
                <div className="text-sm font-bold text-gray-900">Unverified</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">569 (13%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
