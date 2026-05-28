import React from 'react';

export default function TrendVisualization() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-lg font-bold text-purple-900">Validation Activity Trend</h2>

        <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-5 border-t-2 border-dashed border-gray-400"></div>
            <span className="text-sm font-bold text-gray-500">Submissions</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 border-t-2 border-solid border-purple-600"></div>
            <span className="text-sm font-bold text-gray-700">Approvals</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[320px] pt-4">
        <svg viewBox="0 0 1000 280" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Grid Lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
              <line x1="40" y1={i * 55 + 20} x2="1000" y2={i * 55 + 20} stroke="#E5E7EB" strokeWidth="1" strokeDasharray={i !== 4 ? "4,4" : "0"} />
              <text x="30" y={i * 55 + 24} textAnchor="end" className="text-xs fill-gray-400 font-bold">
                {800 - (i * 200)}
              </text>
            </g>
          ))}

          {/* X-Axis Labels */}
          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => (
            <text key={label} x={150 + (i * 250)} y="270" textAnchor="middle" className="text-xs fill-gray-400 font-bold uppercase tracking-wider">
              {label}
            </text>
          ))}

          {/* Submissions Path (Dashed) */}
          <path
            d="M 40 180 C 150 150, 250 200, 350 120 C 450 40, 550 180, 650 130 C 750 80, 850 140, 1000 90"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2.5"
            strokeDasharray="6, 6"
          />

          {/* Approvals Path (Solid with area fill) */}
          <path
            d="M 40 200 C 150 180, 250 120, 350 80 C 450 40, 550 90, 650 60 C 750 30, 850 60, 1000 40 L 1000 240 L 40 240 Z"
            fill="url(#purpleGradient)"
          />
          <path
            d="M 40 200 C 150 180, 250 120, 350 80 C 450 40, 550 90, 650 60 C 750 30, 850 60, 1000 40"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="3.5"
          />

          {/* Highlighted Data points for Approvals */}
          <circle cx="350" cy="80" r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" className="drop-shadow-sm" />
          <circle cx="650" cy="60" r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" className="drop-shadow-sm" />
          <circle cx="1000" cy="40" r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" className="drop-shadow-sm" />
        </svg>
      </div>
    </div>
  );
}
