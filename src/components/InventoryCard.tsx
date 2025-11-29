import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  category: string;
  icon: string;
  stockCount: number;
  sales30d: number | string;  // Can be number or formatted string
  ageing: number;
  deadstockRisk: "low" | "medium" | "high";
  reorderSuggestion: boolean;
  confidence: number;
  trend: "rising" | "stable" | "falling";
}

export const InventoryCard = ({
  category,
  icon,
  stockCount,
  sales30d,
  ageing,
  deadstockRisk,
  reorderSuggestion,
  confidence,
  trend,
}: InventoryCardProps) => {
  const getRiskColor = () => {
    switch (deadstockRisk) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "rising":
        return TrendingUp;
      case "falling":
        return TrendingDown;
      case "stable":
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{category}</h3>
              <p className="text-xs text-muted-foreground">Category</p>
            </div>
          </div>
          <Badge className={cn("border", getRiskColor())}>
            <AlertTriangle className="mr-1 h-3 w-3" />
            {deadstockRisk} risk
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Stock</p>
            <p className="text-lg font-bold text-foreground">{stockCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sales (30d)</p>
            <p className="text-lg font-bold text-foreground">{sales30d}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ageing</p>
            <p className="text-lg font-bold text-foreground">{ageing}d</p>
          </div>
        </div>

        {/* Trend & Confidence */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={cn("h-4 w-4", 
              trend === "rising" && "text-success",
              trend === "falling" && "text-destructive",
              trend === "stable" && "text-muted-foreground"
            )} />
            <span className="text-muted-foreground capitalize">{trend}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-semibold text-foreground">{confidence}%</p>
          </div>
        </div>

        {/* Reorder Badge */}
        {reorderSuggestion && (
          <Badge variant="secondary" className="w-full justify-center">
            ✓ Reorder Suggested
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
