import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(158, 64%, 42%)', 'hsl(200, 70%, 50%)', 'hsl(262, 60%, 55%)', 'hsl(40, 90%, 50%)', 'hsl(340, 70%, 55%)'];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp = true, color }) => (
  <Card className="bg-card border-border hover:border-primary/40 transition-all overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      {trend && (
        <p className={`text-xs mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.active).length;
  const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  const salesByDay = React.useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days[key] = 0;
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (days[orderDate] !== undefined) {
        days[orderDate] += Number(order.total);
      }
    });

    return Object.entries(days).map(([date, value]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value,
    }));
  }, [orders]);

  const salesByCategory = React.useMemo(() => {
    const categories: Record<string, number> = {};
    
    orders.forEach((order) => {
      const items = order.items as Array<{ category?: string; price?: number; quantity?: number }>;
      items?.forEach((item) => {
        const cat = item.category || 'Outros';
        categories[cat] = (categories[cat] || 0) + (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  if (loadingOrders || loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Gerencie e monitore sua loja em tempo real.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Vendas Totais"
          value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          trend="+12% este mês"
          color="bg-gradient-to-br from-primary to-emerald-600"
        />
        <StatCard
          title="Total de Pedidos"
          value={totalOrders}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          trend="+8% este mês"
          color="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <StatCard
          title="Produtos Ativos"
          value={activeProducts}
          icon={<Package className="w-6 h-6 text-white" />}
          trend={`${products.length} total`}
          color="bg-gradient-to-br from-purple-500 to-indigo-600"
        />
        <StatCard
          title="Ticket Médio"
          value={avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          trend="+5% este mês"
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg font-semibold">Vendas - Últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByDay}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    stroke="rgba(255,255,255,0.5)"
                    tickFormatter={(v) => `R$${v}`} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 14%, 18%)', 
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                    formatter={(value: number) =>
                      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(158, 64%, 52%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg font-semibold">Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {salesByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(220, 14%, 18%)', 
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                      formatter={(value: number) =>
                        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados de vendas
                </div>
              )}
            </div>
            {salesByCategory.length > 0 && (
              <div className="mt-4 space-y-2">
                {salesByCategory.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-foreground/80">{cat.name}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {cat.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground text-lg font-semibold">Pedidos Recentes</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Últimos 5 pedidos
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-3 font-mono text-xs text-foreground/60">#{order.id.slice(0, 8)}</td>
                      <td className="py-4 px-3 text-foreground font-medium">{order.customer_name}</td>
                      <td className="py-4 px-3 text-foreground">
                        {Number(order.total).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="py-4 px-3">
                        <Badge className={`${statusColors[order.status] || 'bg-slate-500/20'} border font-medium`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
