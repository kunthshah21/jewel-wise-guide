import { Package, TrendingDown, AlertTriangle, TrendingUp } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { AISuggestionCard } from "@/components/AISuggestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stockData = [
  { name: "Gold", value: 45 },
  { name: "Silver", value: 30 },
  { name: "Diamond", value: 15 },
  { name: "Platinum", value: 10 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-gold-light/5 to-transparent p-6 md:p-8 border border-primary/10">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, Raj Store
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Today's AI Summary: Your gold chain inventory is moving faster than expected. 
          Consider restocking by next week. Diamond earrings are showing low movement—
          review pricing strategy.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Stock Value"
          value="₹48.5L"
          change="+5.2% from last month"
          changeType="positive"
          icon={Package}
        />
        <KPICard
          title="Ageing Stock"
          value="₹12.3L"
          change="23% of total inventory"
          changeType="neutral"
          icon={TrendingDown}
          iconBg="bg-warning/10"
        />
        <KPICard
          title="Predicted Deadstock"
          value="₹4.8L"
          change="-12% vs last period"
          changeType="positive"
          icon={AlertTriangle}
          iconBg="bg-destructive/10"
        />
        <KPICard
          title="Fast Moving Items"
          value="42"
          change="8 items added this week"
          changeType="positive"
          icon={TrendingUp}
          iconBg="bg-success/10"
        />
      </div>

      {/* Charts & AI Suggestions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stock Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <p className="font-semibold text-foreground mb-1">View Inventory</p>
              <p className="text-xs text-muted-foreground">
                Check stock levels and ageing
              </p>
            </button>
            <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <p className="font-semibold text-foreground mb-1">Market Trends</p>
              <p className="text-xs text-muted-foreground">
                See what's trending now
              </p>
            </button>
            <button className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <p className="font-semibold text-foreground mb-1">Keyword Search</p>
              <p className="text-xs text-muted-foreground">
                Research market demand
              </p>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          AI Recommendations
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AISuggestionCard
            title="Restock Gold Chains"
            reason="Sales velocity is 3x higher than average. Current stock will deplete in 8 days based on trend analysis."
            confidence={92}
            impact="high"
            category="Gold"
          />
          <AISuggestionCard
            title="Review Diamond Earrings Pricing"
            reason="Low turnover rate detected. Competitor analysis shows 12% price gap. Consider promotional strategy."
            confidence={78}
            impact="medium"
            category="Diamond"
          />
          <AISuggestionCard
            title="Clear Silver Bangles Stock"
            reason="Ageing inventory with declining market interest. Recommend clearance sale to free up capital."
            confidence={85}
            impact="medium"
            category="Silver"
          />
        </div>
      </div>
    </div>
  );
}
