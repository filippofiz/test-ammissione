/**
 * Chart Component for React Native
 * Renders interactive charts for data visualization
 * Supports scatter plots, line charts, bar charts
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ChartDataset {
  data: Array<{ x: number; y: number }> | number[];
  color: string;
  label: string;
}

interface ChartConfig {
  type: 'scatter' | 'line' | 'bar';
  title?: string;
  labels?: string[];
  datasets: ChartDataset[];
  x_axis_label?: string;
  y_axis_label?: string;
}

interface ChartComponentProps {
  config: ChartConfig;
  style?: any;
}

export const Chart: React.FC<ChartComponentProps> = ({ config, style }) => {
  // Extract data for chart
  const labels = config.labels || [];
  const datasets = config.datasets.map(dataset => {
    // Extract y values if data is in {x, y} format
    let data: number[] = [];
    if (Array.isArray(dataset.data) && dataset.data.length > 0) {
      const firstPoint = dataset.data[0];
      if (firstPoint && typeof firstPoint === 'object' && 'y' in firstPoint) {
        data = dataset.data.map((point: any) => point.y);
      } else {
        data = dataset.data as number[];
      }
    }
    return {
      data,
      color: () => dataset.color,
      strokeWidth: 2,
    };
  });

  // Chart configuration for react-native-chart-kit
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 166, 102, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#00a666',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(0, 0, 0, 0.1)',
    },
  };

  // Prepare data for chart
  const chartData = {
    labels: labels.length > 0 ? labels : datasets[0]?.data.map((_, i) => `${i + 1}`),
    datasets: datasets.map((dataset, index) => ({
      data: dataset.data.length > 0 ? dataset.data : [0],
      color: dataset.color,
      strokeWidth: 2,
    })),
  };

  // Render different chart types
  const renderChart = () => {
    switch (config.type) {
      case 'line':
      case 'scatter':
        return (
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier={config.type === 'line'}
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            yAxisLabel=""
            yAxisSuffix=""
            formatYLabel={(value) => value}
          />
        );

      case 'bar':
        return (
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines={true}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        );

      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unsupported chart type: {config.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {config.title && (
        <Text style={styles.title}>{config.title}</Text>
      )}
      {renderChart()}
      {(config.x_axis_label || config.y_axis_label) && (
        <View style={styles.axisLabels}>
          {config.x_axis_label && (
            <Text style={styles.axisLabel}>{config.x_axis_label}</Text>
          )}
          {config.y_axis_label && (
            <Text style={styles.axisLabel}>{config.y_axis_label}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c2545',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  axisLabels: {
    marginTop: 8,
    alignItems: 'center',
  },
  axisLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginVertical: 4,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Chart;
