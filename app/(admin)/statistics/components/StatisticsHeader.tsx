import React from 'react';
import { Calendar, MapPin, Download } from 'lucide-react';

export default function StatisticsHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">
          Statistik & Analitik Overview
        </h1>
        <p className="text-gray-500 mt-1 font-medium">Comprehensive insights into Halal Tourism ecosystem performance.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4 text-purple-600" />
          Last 30 Days
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <MapPin className="w-4 h-4 text-purple-600" />
          All Regions
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-semibold shadow-md transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </header>
  );
}
