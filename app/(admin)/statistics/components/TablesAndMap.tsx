import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TablesAndMap() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
      {/* Left Card - Top Halal-Ready Destinations */}
      <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-purple-900">Top Halal-Ready Destinations</h2>
          <button className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Rank</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Destination Name</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Region</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-56">Score</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-24">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { rank: 1, name: 'Masjid Istiqlal Complex', region: 'Central Jakarta', score: 98, trend: 'up' },
                { rank: 2, name: 'Sunda Kelapa Harbor', region: 'North Jakarta', score: 92, trend: 'up' },
                { rank: 3, name: 'Kota Tua Heritage', region: 'West Jakarta', score: 87, trend: 'neutral' },
                { rank: 4, name: 'Taman Mini Indonesia Indah', region: 'East Jakarta', score: 84, trend: 'down' },
              ].map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4.5 text-sm font-bold text-gray-400">#{item.rank}</td>
                  <td className="py-4.5 text-sm font-bold text-gray-900">{item.name}</td>
                  <td className="py-4.5 text-sm text-gray-500 font-medium">{item.region}</td>
                  <td className="py-4.5 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-8">{item.score}</span>
                    </div>
                  </td>
                  <td className="py-4.5 text-right">
                    <div className="inline-flex justify-end w-full">
                      {item.trend === 'up' && <div className="flex items-center justify-center w-7 h-7 text-emerald-600 bg-emerald-50 rounded-md shadow-sm"><TrendingUp className="w-4 h-4" /></div>}
                      {item.trend === 'neutral' && <div className="flex items-center justify-center w-7 h-7 text-gray-400 bg-gray-50 rounded-md shadow-sm"><Minus className="w-4 h-4" /></div>}
                      {item.trend === 'down' && <div className="flex items-center justify-center w-7 h-7 text-rose-600 bg-rose-50 rounded-md shadow-sm"><TrendingDown className="w-4 h-4" /></div>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Card - Map Destinasi */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold text-purple-900 mb-6">Map Destinasi</h2>

        <div className="relative flex-1 w-full min-h-[280px] bg-slate-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shadow-inner">
          {/* Map mock background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>

          {/* Scattered Destination Pins */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <MapPin className="w-5 h-5 text-purple-600 drop-shadow-sm z-10" fill="currentColor" />
          </div>
          <div className="absolute top-1/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <MapPin className="w-5 h-5 text-amber-500 drop-shadow-sm z-10" fill="currentColor" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <MapPin className="w-6 h-6 text-emerald-500 drop-shadow-sm z-10" fill="currentColor" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <MapPin className="w-4 h-4 text-purple-400 drop-shadow-sm z-10" fill="currentColor" />
          </div>

          {/* Central Hub Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <MapPin className="w-8 h-8 text-purple-700 drop-shadow-md z-10" fill="currentColor" />
            <div className="w-4 h-1.5 bg-purple-900/30 rounded-[100%] mt-1 blur-[1px]"></div>
          </div>

          <div className="absolute bottom-5 left-0 right-0 flex justify-center">
            <div className="bg-white/95 backdrop-blur-md border border-purple-100 shadow-md px-5 py-2.5 rounded-full flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.6)]"></div>
              <span className="text-sm font-bold text-purple-900">Jakarta Hub - Pusat Destinasi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
