/**
 * Chart Component - Renders interactive charts using Chart.js
 * Supports scatter plots, line charts, bar charts, etc.
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Scatter, Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDataset {
  data: Array<{ x: number; y: number }> | number[];
  color: string;
  label: string;
}

interface ChartConfig {
  type: 'scatter' | 'line' | 'bar';
  title?: string;
  labels?: string[]; // Category labels for bar charts
  datasets: ChartDataset[];
  x_axis_label?: string;
  y_axis_label?: string;
}

interface ChartComponentProps {
  config: ChartConfig;
  className?: string;
}

export const Chart: React.FC<ChartComponentProps> = ({ config, className = '' }) => {
  // Extract labels for bar charts
  const isBarChart = config.type === 'bar';
  let labels: string[] | undefined = config.labels; // Use provided labels first

  // If no labels provided but data is in {x, y} format, extract them
  if (isBarChart && !labels && config.datasets[0]?.data && Array.isArray(config.datasets[0].data)) {
    const firstDataPoint = config.datasets[0].data[0];
    if (firstDataPoint && typeof firstDataPoint === 'object' && 'x' in firstDataPoint) {
      // Extract unique X values as labels
      const allXValues = new Set<string>();
      config.datasets.forEach(dataset => {
        if (Array.isArray(dataset.data)) {
          dataset.data.forEach((point: any) => {
            if (point && typeof point === 'object' && 'x' in point) {
              allXValues.add(String(point.x));
            }
          });
        }
      });
      labels = Array.from(allXValues);
    }
  }

  // Transform data for Chart.js format
  const chartData: any = {
    labels, // For bar charts, these are the X-axis categories
    datasets: config.datasets.map((dataset, index) => {
      // Determine if this dataset should show a line (e.g., trend line with only 2 points)
      const isTrendLine = dataset.label.toLowerCase().includes('trend') &&
                          Array.isArray(dataset.data) &&
                          dataset.data.length === 2;

      // For bar charts, if data is in {x, y} format, extract y values
      let processedData = dataset.data;
      if (isBarChart && Array.isArray(dataset.data) && dataset.data.length > 0) {
        const firstPoint = dataset.data[0];
        if (firstPoint && typeof firstPoint === 'object' && 'y' in firstPoint) {
          // Extract just the y values for bar charts
          processedData = dataset.data.map((point: any) => point.y);
        }
      }

      return {
        label: dataset.label,
        data: processedData,
        backgroundColor: isBarChart ? dataset.color : dataset.color + '80', // Add transparency for scatter points
        borderColor: dataset.color,
        borderWidth: isBarChart ? 1 : (isTrendLine ? 3 : 2),
        pointRadius: isTrendLine ? 0 : 5, // No points for trend line, visible points for data
        pointHoverRadius: isTrendLine ? 0 : 8,
        pointBackgroundColor: dataset.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        showLine: isTrendLine, // Show line for trend lines
        tension: 0, // Straight lines for trend
        barThickness: isBarChart ? 'flex' : undefined,
        maxBarThickness: isBarChart ? 60 : undefined,
      };
    }),
  };

  // Chart options
  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 13,
          },
          usePointStyle: true,
        },
      },
      title: {
        display: !!config.title,
        text: config.title || '',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'point' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const x = context.parsed.x.toFixed(1);
            const y = context.parsed.y.toFixed(1);
            return `${label}: (${x}, ${y})`;
          },
        },
      },
    },
    scales: {
      x: {
        type: config.type === 'bar' ? 'category' : 'linear',
        title: {
          display: !!config.x_axis_label,
          text: config.x_axis_label || '',
          font: {
            size: 13,
            weight: 'bold' as const,
          },
          padding: {
            top: 10,
          },
        },
        grid: {
          display: config.type !== 'bar', // Hide grid for bar charts on X axis
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear',
        title: {
          display: !!config.y_axis_label,
          text: config.y_axis_label || '',
          font: {
            size: 13,
            weight: 'bold' as const,
          },
          padding: {
            bottom: 10,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Render appropriate chart type
  const renderChart = () => {
    switch (config.type) {
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      default:
        return (
          <div className="text-center text-red-600">
            Unsupported chart type: {config.type}
          </div>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {renderChart()}
    </div>
  );
};

export default Chart;
