'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface TablesAndMapProps {
  rankings: {
    topRegions: {
      regionName: string;
      regionType: string;
      totalScore: number;
      destinationCount: number;
    }[];
    topDestinations: {
      id: string;
      name: string;
      score: number;
      category: string;
      city: string;
    }[];
    topUmkms: {
      id: string;
      name: string;
      rating: number;
      category: string;
      city: string;
    }[];
  };
  mapData: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    category: string;
    intensity: number;
  }[];
}

export default function TablesAndMap({ rankings, mapData }: TablesAndMapProps) {
  const [activeTab, setActiveTab] = React.useState<'regions' | 'destinations' | 'umkms'>('regions');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
      {/* Left Card - Rankings */}
      <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-purple-900">Top Rankings Overview</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['regions', 'destinations', 'umkms'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'regions' ? 'Regions' : tab === 'destinations' ? 'Destinations' : 'UMKM'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Rank</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Detail</th>
                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-56">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTab === 'regions' && rankings.topRegions.map((item, idx) => (
                <tr key={item.regionName} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4.5 text-sm font-bold text-gray-400">#{idx + 1}</td>
                  <td className="py-4.5 text-sm font-bold text-gray-900">{item.regionName}</td>
                  <td className="py-4.5 text-sm text-gray-500 font-medium capitalize">{item.regionType} • {item.destinationCount} Places</td>
                  <td className="py-4.5 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(100, (item.totalScore / 3) * 100)}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-8">{Math.min(100, Math.round((item.totalScore / 3) * 100))}</span>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'destinations' && rankings.topDestinations.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4.5 text-sm font-bold text-gray-400">#{idx + 1}</td>
                  <td className="py-4.5 text-sm font-bold text-gray-900">{item.name}</td>
                  <td className="py-4.5 text-sm text-gray-500 font-medium">{item.category} • {item.city}</td>
                  <td className="py-4.5 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-emerald-500 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-8">{item.score}</span>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'umkms' && rankings.topUmkms.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4.5 text-sm font-bold text-gray-400">#{idx + 1}</td>
                  <td className="py-4.5 text-sm font-bold text-gray-900">{item.name}</td>
                  <td className="py-4.5 text-sm text-gray-500 font-medium">{item.category} • {item.city}</td>
                  <td className="py-4.5 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-amber-400 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.rating * 20}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-8">{item.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Card - Distribution Map & Heatmap Preview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold text-purple-900 mb-6">GIS & Heatmap Analytics</h2>
        <div className="relative flex-1 w-full min-h-[320px] bg-slate-50 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
          
          {/* Mock Heatmap Gradients */}
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl"></div>

          {mapData.slice(0, 12).map((d, i) => {
            const top = 20 + (i * 12 + (parseInt(d.id.slice(0,1), 16) || 0) * 3) % 65;
            const left = 20 + (i * 18 + (parseInt(d.id.slice(1,2), 16) || 0) * 4) % 65;
            return (
              <div key={d.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group" style={{ top: `${top}%`, left: `${left}%` }}>
                <MapPin className={`w-5 h-5 drop-shadow-sm z-10 hover:scale-125 transition-transform ${d.intensity > 0.8 ? 'text-purple-700' : d.intensity > 0.5 ? 'text-purple-500' : 'text-purple-300'}`} fill="currentColor" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                  {d.name} ({Math.round(d.intensity * 100)}%)
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-5 left-5 right-5">
            <div className="bg-white/95 backdrop-blur-md border border-purple-100 shadow-lg px-4 py-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900">Heatmap Intensity</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Halal Score Based</span>
              </div>
              <div className="h-1.5 w-full bg-gradient-to-r from-purple-200 via-purple-500 to-purple-800 rounded-full"></div>
              <div className="flex justify-between mt-1 text-[10px] font-bold text-gray-400">
                <span>LOW</span>
                <span>HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
