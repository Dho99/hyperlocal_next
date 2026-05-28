import React from 'react';
import { Flag, Store, BadgeCheck, Award, TrendingUp } from 'lucide-react';

export default function KpiStatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Card 1 */}
      <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Flag className="w-6 h-6 text-purple-700" />
          </div>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            +12%
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Destinations</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">1,248</div>
        <p className="text-xs text-gray-400 mt-2 font-medium">from last month</p>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            +8%
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Total UMKM</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">4,592</div>
        <p className="text-xs text-gray-400 mt-2 font-medium">from last month</p>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-purple-700" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Verified</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">3,105</div>
        <p className="text-xs text-purple-600 font-semibold mt-2">67% verification rate</p>
      </div>

      {/* Card 4 */}
      <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-700" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Avg Halal Score</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
          86<span className="text-lg text-gray-400 font-medium">/100</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-700 rounded-full" style={{ width: '86%' }}></div>
        </div>
      </div>
    </div>
  );
}
