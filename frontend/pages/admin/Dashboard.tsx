import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { ApiService } from '../../services/api';
import { DashboardStats, ChartDataPoint, TimeRange } from '../../types';

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trendValue?: string;
  isPositive?: boolean;
}> = ({ title, value, icon, trendValue, isPositive }) => (
  <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-stone-50 rounded-lg text-forest">{icon}</div>
      {trendValue && (
        <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {trendValue}
        </span>
      )}
    </div>
    <h3 className="text-stone-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
    <p className="text-3xl font-serif font-bold text-charcoal mt-1">{value}</p>
    <p className="text-[10px] text-stone-400 mt-1">vs Yesterday</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');

  useEffect(() => {
    const loadStats = async () => {
      const data = await ApiService.getDashboardStats();
      setStats(data);
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadChart = async () => {
      const data = await ApiService.getSalesChartData(timeRange);
      setChartData(data);
    };
    loadChart();
  }, [timeRange]);

  // Helper to calculate percentage change
  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return { val: '100%', pos: true };
    const diff = ((curr - prev) / prev) * 100;
    return { 
      val: `${Math.abs(diff).toFixed(1)}%`, 
      pos: diff >= 0 
    };
  };

  const calcDiff = (curr: number, prev: number) => {
      const diff = curr - prev;
      return {
          val: `${Math.abs(diff)}m`,
          pos: diff <= 0 // Lower prep time is positive
      }
  }

  if (!stats) return <div className="p-8 text-center text-stone-500">Loading Dashboard...</div>;

  const revTrend = calcChange(stats.revenue.current, stats.revenue.previous);
  const ordTrend = calcChange(stats.orders.current, stats.orders.previous);
  const prepTrend = calcDiff(stats.avgPrepTime.current, stats.avgPrepTime.previous);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="font-serif text-3xl font-bold text-charcoal">Dashboard</h2>
        <p className="text-stone-500">Overview of today's performance vs yesterday.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value={`Rp ${(stats.revenue.current / 1000000).toFixed(1)}M`} 
          icon={<DollarSign size={24} />} 
          trendValue={revTrend.val} 
          isPositive={revTrend.pos}
        />
        <StatCard 
          title="Today's Orders" 
          value={stats.orders.current.toString()} 
          icon={<TrendingUp size={24} />} 
          trendValue={ordTrend.val} 
          isPositive={ordTrend.pos}
        />
        <StatCard 
          title="Active Tables" 
          value={`${stats.activeTables}/${stats.totalTables}`} 
          icon={<Users size={24} />} 
        />
        <StatCard 
          title="Avg. Prep Time" 
          value={`${stats.avgPrepTime.current}m`} 
          icon={<Activity size={24} />} 
          trendValue={prepTrend.val}
          isPositive={prepTrend.pos}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h3 className="font-serif text-xl font-bold text-charcoal">Sales Trend</h3>
          
          <div className="flex bg-stone-100 p-1 rounded-lg mt-4 md:mt-0">
            {(['1W', '1M', '6M', '1Y', 'YTD'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  px-4 py-1.5 rounded-md text-xs font-bold transition-all
                  ${timeRange === range 
                    ? 'bg-white text-forest shadow-sm' 
                    : 'text-stone-500 hover:text-charcoal'}
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} minTickGap={30} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="sales" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;