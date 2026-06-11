import React from 'react';
import { Flag, Store, BadgeCheck, Award, TrendingUp } from 'lucide-react';

interface KpiStatsProps {
  stats: {
    totalDestinations: number;
    totalUmkms: number;
    verifiedUmkms: number;
    avgHalalScore: number;
  }
}

export default function KpiStatCards({ stats }: KpiStatsProps) {
  const verificationRate = stats.totalUmkms > 0 
    ? Math.round((stats.verifiedUmkms / stats.totalUmkms) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Card 1 */}
      <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Flag className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            Active
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Destinations</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalDestinations.toLocaleString()}</div>
        <p className="text-xs text-gray-400 mt-2 font-medium">registered in system</p>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Total UMKM</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalUmkms.toLocaleString()}</div>
        <p className="text-xs text-gray-400 mt-2 font-medium">partners across regions</p>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-emerald-700" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Verified UMKM</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">{stats.verifiedUmkms.toLocaleString()}</div>
        <p className="text-xs text-emerald-600 font-semibold mt-2">{verificationRate}% verification rate</p>
      </div>

      {/* Card 4 */}
      <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-700" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-1">Avg Halal Score</h3>
        <div className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
          {stats.avgHalalScore}<span className="text-lg text-gray-400 font-medium">/100</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${stats.avgHalalScore}%` }}></div>
        </div>
      </div>
    </div>
  );
}
