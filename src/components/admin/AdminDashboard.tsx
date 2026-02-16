import React, { useState, useEffect } from 'react';
import { adminGetStats } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart, Users, DollarSign, Star, TrendingUp,
  Package, MessageSquare, Crown, Calendar, CalendarDays, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ password, onLogout }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await adminGetStats();
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
  };

  if (loading) {
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
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time-Period Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Today */}
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

        {/* This Month */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" /> This Month
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

        {/* Overall */}
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

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgRating || '0.0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviews</CardTitle>
            <div className="p-2 rounded-lg bg-pink-100">
              <MessageSquare className="h-4 w-4 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyOrders || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.monthlyOrders || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product._id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-sm">{product.name || product._id}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {product.totalSold} sold
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No sales data yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order, index) => (
                  <div key={order._id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{order.orderId || order._id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.name || 'Customer'} • {order.items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">₹{order.totalAmount}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
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
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Reviewed Products */}
      {stats?.mostReviewed && stats.mostReviewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-pink-500" />
              Most Reviewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.mostReviewed.map((product, index) => (
                <div key={product._id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">{product.name || product._id}</p>
                    <p className="text-xs text-muted-foreground">{product.count} reviews</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{product.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
