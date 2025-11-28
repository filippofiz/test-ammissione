import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface RechartsRendererProps {
  code: string;
  className?: string;
}

export default function RechartsRenderer({ code, className }: RechartsRendererProps) {
  const RenderedChart = useMemo(() => {
    try {
      // Extract the data array from the code
      const dataMatch = code.match(/const data = (\[[\s\S]*?\]);/);
      if (!dataMatch) {
        console.error('Could not extract data from Recharts code');
        return null;
      }

      // Parse the data
      const data = eval(`(${dataMatch[1]})`);

      // Detect chart type
      const isLineChart = code.includes('<LineChart');
      const isBarChart = code.includes('<BarChart');
      const isAreaChart = code.includes('<AreaChart');
      const isScatterChart = code.includes('<ScatterChart');

      // Extract axis configurations
      const xAxisMatch = code.match(/dataKey="(\w+)"/);
      const xAxisKey = xAxisMatch ? xAxisMatch[1] : Object.keys(data[0] || {})[0];

      // Get all keys except the x-axis key for y-axis data
      const dataKeys = data.length > 0
        ? Object.keys(data[0]).filter(k => k !== xAxisKey)
        : [];

      // Extract labels if present
      const xLabelMatch = code.match(/XAxis[^>]*label={{[^}]*value:\s*['"]([^'"]+)['"]/);
      const yLabelMatch = code.match(/YAxis[^>]*label={{[^}]*value:\s*['"]([^'"]+)['"]/);
      const xLabel = xLabelMatch ? xLabelMatch[1] : '';
      const yLabel = yLabelMatch ? yLabelMatch[1] : '';

      // Render the appropriate chart type
      return (
        <div className={className}>
          <ResponsiveContainer width="100%" height={400}>
            {isLineChart && (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxisKey}
                  label={xLabel ? { value: xLabel, position: 'bottom', offset: 0 } : undefined}
                />
                <YAxis
                  label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index % 4]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            )}
            {isBarChart && (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxisKey}
                  label={xLabel ? { value: xLabel, position: 'bottom', offset: 0 } : undefined}
                />
                <YAxis
                  label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index % 4]}
                  />
                ))}
              </BarChart>
            )}
            {isAreaChart && (
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxisKey}
                  label={xLabel ? { value: xLabel, position: 'bottom', offset: 0 } : undefined}
                />
                <YAxis
                  label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index % 4]}
                    fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index % 4]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            )}
            {isScatterChart && (
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey={xAxisKey}
                  label={xLabel ? { value: xLabel, position: 'bottom', offset: 0 } : undefined}
                />
                <YAxis
                  type="number"
                  dataKey={dataKeys[0]}
                  label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name={dataKeys[0]} data={data} fill="#8884d8" />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    } catch (error) {
      console.error('Error rendering Recharts:', error);
      return (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-700">Error rendering chart</p>
          <p className="text-xs text-red-600 mt-1">{String(error)}</p>
        </div>
      );
    }
  }, [code, className]);

  return RenderedChart;
}
