import React, { useState, useEffect, useCallback } from 'react';
import { adminGetStats, fetchCodStats } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ShoppingCart, Users, DollarSign, Star, TrendingUp,
  Package, MessageSquare, Crown, Calendar as CalendarIcon, CalendarDays, Zap, Filter, X,
  ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface AdminDashboardProps {
  password: string;
  onLogout: () => void;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  totalReviews: number;
  avgRating: string;
  todayOrders: number;
  todayRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  monthlyOrders: { month: string; orders: number; revenue: number }[];
  recentOrders: any[];
  topProducts: { _id: string; name: string; totalSold: number }[];
  mostReviewed: { _id: string; name: string; count: number; avgRating: number }[];
  isFiltered?: boolean;
  filterRange?: { start: string; end: string } | null;
}

type PresetKey = 'all' | '2days' | 'week' | 'month';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const presets: { key: PresetKey; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'all', label: 'All Time', icon: <CalendarDays className="h-4 w-4" />, desc: 'Everything' },
  { key: '2days', label: '2 Days', icon: <Zap className="h-4 w-4" />, desc: 'Last 48h' },
  { key: 'week', label: 'Week', icon: <CalendarIcon className="h-4 w-4" />, desc: 'Last 7 days' },
  { key: 'month', label: 'Month', icon: <CalendarIcon className="h-4 w-4" />, desc: 'Last 30 days' },
];

const getPresetRange = (key: PresetKey): { start?: string; end?: string } => {
  if (key === 'all') return {};
  const now = new Date();
  const end = format(now, 'yyyy-MM-dd');
  let start: Date;
  if (key === '2days') start = subDays(now, 2);
  else if (key === 'week') start = subDays(now, 7);
  else start = subMonths(now, 1);
  return { start: format(start, 'yyyy-MM-dd'), end };
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ password, onLogout }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetKey>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [codStats, setCodStats] = useState<{ pending: { amount: number; count: number }; collected: { amount: number; count: number } } | null>(null);

  const fetchStats = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const result = await adminGetStats(startDate, endDate);
      if (result.success) {
        setStats(result.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error.message && (error.message.includes('Not authorized') || error.message.includes('token failed'))) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchStats();
    loadCodStats();
  }, []);

  const loadCodStats = async () => {
    try {
      const result = await fetchCodStats();
      if (result.success) setCodStats(result.data);
    } catch (e) { /* ignore */ }
  };

  const handlePreset = (key: PresetKey) => {
    setActivePreset(key);
    setIsCustom(false);
    setDateRange(undefined);
    const range = getPresetRange(key);
    fetchStats(range.start, range.end);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setActivePreset('all');
      setIsCustom(true);
      setCalendarOpen(false);
      fetchStats(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'));
    }
  };

  const handleClearCustom = () => {
    setIsCustom(false);
    setDateRange(undefined);
    setActivePreset('all');
    fetchStats();
  };

  // Build pie chart data from top products
  const pieData = stats?.topProducts?.map((p, i) => ({
    name: p.name || p._id,
    value: p.totalSold,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  })) || [];

  // Build order status distribution from recent orders (for visual variety)
  const statusCounts: Record<string, number> = {};
  stats?.recentOrders?.forEach(o => {
    const s = o.orderStatus || o.paymentStatus || 'pending';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusPieData = Object.entries(statusCounts).map(([name, value], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
    value,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const activeLabel = isCustom && dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'dd MMM yyyy')} — ${format(dateRange.to, 'dd MMM yyyy')}`
    : presets.find(p => p.key === activePreset)?.label || 'All Time';

  const showTimePeriodCards = !stats?.isFiltered;

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═════════════════════ DATE FILTER BAR ═════════════════════ */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col gap-4">
            {/* Title + indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                  <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-semibold">Date Filter</span>
              </div>
              {(isCustom || activePreset !== 'all') && (
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    Showing: <span className="font-semibold text-foreground">{activeLabel}</span>
                  </span>
                  {loading && <span className="text-xs italic text-muted-foreground ml-1">Loading…</span>}
                </div>
              )}
            </div>

            {/* Preset Cards + Calendar Picker */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Preset Buttons as mini-cards */}
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-left transition-all duration-200 border
                    ${!isCustom && activePreset === p.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-card/80 text-foreground border-border hover:border-indigo-300 hover:shadow-sm hover:scale-[1.01]'
                    }`}
                >
                  <span className={`${!isCustom && activePreset === p.key ? 'text-white' : 'text-indigo-500'}`}>
                    {p.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{p.label}</p>
                    <p className={`text-[10px] leading-tight ${!isCustom && activePreset === p.key ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              ))}

              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-border mx-1" />

              {/* Calendar Popover Picker */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200
                      ${isCustom
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-card/80 text-foreground border-border hover:border-indigo-300 hover:shadow-sm hover:scale-[1.01]'
                      }`}
                  >
                    <CalendarIcon className={`h-4 w-4 ${isCustom ? 'text-white' : 'text-indigo-500'}`} />
                    <div className="text-left">
                      <p className="text-xs font-semibold leading-tight">Custom Range</p>
                      <p className={`text-[10px] leading-tight ${isCustom ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                        {isCustom && dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, 'dd MMM')} – ${format(dateRange.to, 'dd MMM')}`
                          : 'Pick dates'}
                      </p>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <p className="text-sm font-semibold">Select Date Range</p>
                    <p className="text-xs text-muted-foreground">Click a start date, then an end date</p>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={2}
                    disabled={{ after: new Date() }}
                    className="rounded-b-md"
                  />
                </PopoverContent>
              </Popover>

              {/* Clear button */}
              {isCustom && (
                <button
                  onClick={handleClearCustom}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                  title="Clear custom filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═════════════════════ FILTERED SUMMARY ═════════════════════ */}
      {stats?.isFiltered && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Orders', value: stats.totalOrders, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
            { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
            { label: 'Customers', value: stats.totalCustomers, icon: <Users className="h-5 w-5" />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/20' },
            { label: 'Reviews', value: stats.totalReviews, icon: <MessageSquare className="h-5 w-5" />, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-500/20' },
          ].map((item, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${item.bg}`}>
                    <span className={item.color}>{item.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ═════════════════════ TIME PERIOD CARDS ═════════════════════ */}
      {showTimePeriodCards && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" /> Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats?.todayOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{(stats?.todayRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-purple-500" /> This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats?.monthOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{(stats?.monthRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-500" /> Overall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═════════════════════ SECONDARY STATS ═════════════════════ */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Customers', value: stats?.totalCustomers || 0, icon: <Users className="h-4 w-4 text-purple-600" />, bg: 'bg-purple-100' },
          { label: 'Products', value: stats?.totalProducts || 0, icon: <Package className="h-4 w-4 text-orange-600" />, bg: 'bg-orange-100' },
          { label: 'Avg Rating', value: stats?.avgRating || '0.0', icon: <Star className="h-4 w-4 text-yellow-600" />, bg: 'bg-yellow-100' },
          { label: 'Reviews', value: stats?.totalReviews || 0, icon: <MessageSquare className="h-4 w-4 text-pink-600" />, bg: 'bg-pink-100' },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <div className={`p-2 rounded-lg ${item.bg}`}>{item.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═════════════════════ COD STATS ═════════════════════ */}
      {codStats && (
        <div className="grid gap-4 grid-cols-2">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">COD Pending</CardTitle>
              <div className="p-2 rounded-lg bg-amber-100"><DollarSign className="h-4 w-4 text-amber-600" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">₹{(codStats.pending.amount || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{codStats.pending.count} order{codStats.pending.count !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">COD Collected</CardTitle>
              <div className="p-2 rounded-lg bg-green-100"><DollarSign className="h-4 w-4 text-green-600" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{(codStats.collected.amount || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{codStats.collected.count} order{codStats.collected.count !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═════════════════════ CHARTS — Revenue Area + Orders Bar ═════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              {stats?.isFiltered ? 'Revenue in Period' : 'Revenue Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyOrders || []}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              {stats?.isFiltered ? 'Orders in Period' : 'Order Volume'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyOrders || []} barSize={32}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                  />
                  <Bar dataKey="orders" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═════════════════════ PIE CHARTS — Top Products + Order Status ═════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products Pie */}
        {pieData.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-5 w-5 text-amber-500" />
                Top Products (Sales Distribution)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name.slice(0, 12)}${name.length > 12 ? '…' : ''} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} strokeWidth={2} stroke="hsl(var(--card))" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      formatter={(value: number) => [`${value} sold`, 'Quantity']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Selling List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Top Sellers Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => {
                  const maxSold = stats.topProducts[0]?.totalSold || 1;
                  const pct = (product.totalSold / maxSold) * 100;
                  return (
                    <div key={product._id || index} className="relative">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 relative z-10">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                index === 1 ? 'bg-slate-100 text-slate-600' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-muted text-muted-foreground'
                              }`}
                          >
                            #{index + 1}
                          </span>
                          <span className="font-medium text-sm">{product.name || product._id}</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">{product.totalSold} sold</span>
                      </div>
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 h-1 rounded-b-xl bg-indigo-500/20 w-full">
                        <div
                          className="h-full rounded-b-xl bg-indigo-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═════════════════════ RECENT ORDERS + MOST REVIEWED ═════════════════════ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order, index) => (
                  <div key={order._id || index} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{order.orderId || order._id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.name || 'Customer'} • {order.items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">₹{order.totalAmount}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Most Reviewed Products */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-pink-500" />
              Most Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.mostReviewed && stats.mostReviewed.length > 0 ? (
              <div className="space-y-3">
                {stats.mostReviewed.map((product, index) => (
                  <div key={product._id || index} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{product.name || product._id}</p>
                      <p className="text-xs text-muted-foreground">{product.count} reviews</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-500/10 px-2.5 py-1 rounded-lg">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                        {product.avgRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
