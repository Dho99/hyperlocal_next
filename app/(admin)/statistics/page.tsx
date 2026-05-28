import StatisticsHeader from './components/StatisticsHeader';
import KpiStatCards from './components/KpiStatCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TablesAndMap from './components/TablesAndMap';
import TrendVisualization from './components/TrendVisualization';

export default function StatisticsDashboard() {
  return (
    <div className="space-y-8">
      <StatisticsHeader />
      <KpiStatCards />
      <AnalyticsCharts />
      <TablesAndMap />
      <TrendVisualization />
    </div>
  );
}
