import StatisticsHeader from './components/StatisticsHeader';
import KpiStatCards from './components/KpiStatCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TablesAndMap from './components/TablesAndMap';
import TrendVisualization from './components/TrendVisualization';
import ViewTrendAnalytics from './components/ViewTrendAnalytics';
import { getDetailedStatistics } from "@/lib/services/analytics-service";

export default async function StatisticsDashboard() {
  const data = await getDetailedStatistics();

  return (
    <div className="space-y-8 pb-12">
      <StatisticsHeader data={data} />
      <KpiStatCards stats={data.kpi} />
      <AnalyticsCharts 
        categories={data.distributions.destinationsByCategory} 
        facilities={data.distributions.facilitiesByType}
        umkmStatus={data.umkmHalalStatus} 
      />
      <TablesAndMap 
        rankings={data.rankings} 
        mapData={data.mapData} 
      />
      <TrendVisualization trend={data.weeklyTrend} />
      <ViewTrendAnalytics period="daily" />
    </div>
  );
}
