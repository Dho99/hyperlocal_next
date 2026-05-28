import React from 'react';

interface TrendVisualizationProps {
  trend: {
    label: string;
    submissions: number;
    approvals: number;
  }[];
}

export default function TrendVisualization({ trend }: TrendVisualizationProps) {
  // Find max value for scaling
  const maxValue = Math.max(1, ...trend.map(t => Math.max(t.submissions, t.approvals)));
  
  // Convert trend data to SVG points
  const submissionPoints = trend.map((t, i) => {
    const x = 40 + (i * 960) / (trend.length - 1);
    const y = 240 - (t.submissions / maxValue) * 200;
    return `${x},${y}`;
  }).join(' ');

  const approvalPoints = trend.map((t, i) => {
    const x = 40 + (i * 960) / (trend.length - 1);
    const y = 240 - (t.approvals / maxValue) * 200;
    return `${x},${y}`;
  }).join(' ');

  // Area fill points for approvals
  const areaPoints = trend.map((t, i) => {
    const x = 40 + (i * 960) / (trend.length - 1);
    const y = 240 - (t.approvals / maxValue) * 200;
    return `${x},${y}`;
  }).join(' ') + ` 1000,240 40,240`;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-lg font-bold text-purple-900">Validation Activity Trend (Last 4 Weeks)</h2>

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
                {Math.round((maxValue - (i * maxValue / 4)))}
              </text>
            </g>
          ))}

          {/* X-Axis Labels */}
          {trend.map((t, i) => (
            <text key={i} x={40 + (i * 960) / (trend.length - 1)} y="270" textAnchor="middle" className="text-xs fill-gray-400 font-bold uppercase tracking-wider">
              {t.label}
            </text>
          ))}

          {/* Submissions Path (Dashed) */}
          <polyline
            points={submissionPoints}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2.5"
            strokeDasharray="6, 6"
          />

          {/* Approvals Path (Solid with area fill) */}
          <polygon
            points={areaPoints}
            fill="url(#purpleGradient)"
          />
          <polyline
            points={approvalPoints}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="3.5"
          />

          {/* Highlighted Data points for Approvals */}
          {trend.map((t, i) => {
            const x = 40 + (i * 960) / (trend.length - 1);
            const y = 240 - (t.approvals / maxValue) * 200;
            return (
              <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" className="drop-shadow-sm" />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
