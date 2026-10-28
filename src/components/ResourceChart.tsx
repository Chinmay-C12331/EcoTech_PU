/**
 * Interactive SVG Resource Time Series Chart
 * EcoTech PU - Presidency University Bengaluru
 */

import React, { useState } from 'react';

export interface ChartDataPoint {
  timestamp: string;
  hour?: number;
  date?: string;
  label: string; // e.g. "10/26 02:00" or "Day 10"
  observed: number;
  baseline: number;
  flagged?: boolean;
  anomalyType?: string;
  isSpecialWindow?: boolean; // e.g. after-hours or overnight
}

interface ResourceChartProps {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  unit: string;
  resourceColor: 'amber' | 'sky' | 'emerald';
  specialWindowLabel?: string;
}

export const ResourceChart: React.FC<ResourceChartProps> = ({
  title,
  subtitle,
  data,
  unit,
  resourceColor,
  specialWindowLabel
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-xs">
        No time-series data available for display.
      </div>
    );
  }

  // Calculate scales
  const maxVal = Math.max(...data.map(d => Math.max(d.observed, d.baseline)), 10) * 1.15;
  const minVal = 0;

  const chartWidth = 900;
  const chartHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return paddingTop + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;
  };

  // Color mappings
  const colorMap = {
    amber: {
      line: '#d97706',
      fill: 'rgba(217, 119, 6, 0.12)',
      point: '#b45309',
      baseline: '#64748b'
    },
    sky: {
      line: '#0284c7',
      fill: 'rgba(2, 132, 199, 0.12)',
      point: '#0369a1',
      baseline: '#64748b'
    },
    emerald: {
      line: '#059669',
      fill: 'rgba(5, 150, 105, 0.12)',
      point: '#047857',
      baseline: '#64748b'
    }
  };
  const theme = colorMap[resourceColor];

  // SVG Paths
  const observedPoints = data.map((d, i) => `${getX(i)},${getY(d.observed)}`).join(' ');
  const baselinePoints = data.map((d, i) => `${getX(i)},${getY(d.baseline)}`).join(' ');

  const areaPath = `M ${getX(0)},${getY(0)} ` +
    data.map((d, i) => `L ${getX(i)},${getY(d.observed)} `).join('') +
    `L ${getX(data.length - 1)},${getY(0)} Z`;

  // Horizontal gridlines (4 steps)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const val = Math.round(minVal + ratio * (maxVal - minVal));
    const y = getY(val);
    return { val, y };
  });

  // Sample X labels
  const step = Math.max(1, Math.floor(data.length / 8));
  const xLabels = data
    .map((d, i) => ({ label: d.label, x: getX(i), index: i }))
    .filter((_, i) => i % step === 0 || i === data.length - 1);

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5" style={{ backgroundColor: theme.line }}></span>
            <span>Observed ({unit})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-slate-500"></span>
            <span>Baseline Profile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Flagged Anomaly</span>
          </div>
          {specialWindowLabel && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300"></span>
              <span>{specialWindowLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative mt-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto max-h-72 select-none"
          style={{ minWidth: '600px' }}
        >
          <defs>
            <linearGradient id={`grad-${resourceColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.line} stopOpacity="0.25" />
              <stop offset="100%" stopColor={theme.line} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Special Windows (e.g. Night hours or after hours) */}
          {data.map((d, i) => {
            if (!d.isSpecialWindow) return null;
            const x = getX(i);
            const w = plotWidth / data.length;
            return (
              <rect
                key={`win-${i}`}
                x={x - w / 2}
                y={paddingTop}
                width={w}
                height={plotHeight}
                fill="#f8fafc"
                opacity={0.8}
              />
            );
          })}

          {/* Grid lines */}
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={t.y}
                x2={chartWidth - paddingRight}
                y2={t.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={t.y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {t.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#grad-${resourceColor})`} />

          {/* Baseline Curve */}
          <polyline
            points={baselinePoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Observed Curve */}
          <polyline
            points={observedPoints}
            fill="none"
            stroke={theme.line}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Interactive hover zones */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.observed);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Anomaly Pin */}
                {d.flagged && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4.5}
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}

                {/* Standard Point when hovered */}
                {!d.flagged && isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill={theme.line}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {/* Invisible hover slice */}
                <rect
                  x={cx - plotWidth / (2 * data.length)}
                  y={paddingTop}
                  width={plotWidth / data.length}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* Active Hover Guideline */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={paddingTop + plotHeight}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* X Axis labels */}
          {xLabels.map((lbl, idx) => (
            <text
              key={idx}
              x={lbl.x}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 font-medium"
            >
              {lbl.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-md p-2.5 shadow-lg text-xs"
            style={{
              left: `${Math.min(75, Math.max(15, (getX(hoveredIndex) / chartWidth) * 100))}%`,
              top: '20px'
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 flex items-center justify-between gap-3">
              <span>{hoveredPoint.label}</span>
              {hoveredPoint.flagged && (
                <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 py-0.2 rounded font-mono">
                  ANOMALY FLAGGED
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[11px]">
              <span className="text-slate-400">Observed:</span>
              <span className="font-mono font-medium text-emerald-400 text-right">
                {hoveredPoint.observed.toLocaleString()} {unit}
              </span>

              <span className="text-slate-400">Baseline:</span>
              <span className="font-mono text-slate-300 text-right">
                {hoveredPoint.baseline.toLocaleString()} {unit}
              </span>

              <span className="text-slate-400">Deviation:</span>
              <span className={`font-mono font-semibold text-right ${
                hoveredPoint.observed > hoveredPoint.baseline ? 'text-amber-400' : 'text-slate-300'
              }`}>
                {hoveredPoint.observed > hoveredPoint.baseline ? '+' : ''}
                {(hoveredPoint.observed - hoveredPoint.baseline).toLocaleString()} {unit}
              </span>
            </div>
            {hoveredPoint.anomalyType && hoveredPoint.anomalyType !== 'none' && (
              <p className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-rose-300 italic">
                Rule triggered: {hoveredPoint.anomalyType.replace(/_/g, ' ')}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Deterministic time series sample</span>
        <span className="font-medium text-slate-500">SIMULATED DEMO DATA</span>
      </div>
    </div>
  );
};
