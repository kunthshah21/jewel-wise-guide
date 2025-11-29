import { InventoryCard } from "@/components/InventoryCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const inventoryItems = [
  {
    category: "Gold Chains",
    icon: "🔗",
    stockCount: 156,
    sales30d: 48,
    ageing: 12,
    deadstockRisk: "low" as const,
    reorderSuggestion: true,
    confidence: 92,
    trend: "rising" as const,
  },
  {
    category: "Diamond Earrings",
    icon: "💎",
    stockCount: 89,
    sales30d: 12,
    ageing: 45,
    deadstockRisk: "medium" as const,
    reorderSuggestion: false,
    confidence: 78,
    trend: "falling" as const,
  },
  {
    category: "Silver Bangles",
    icon: "⚪",
    stockCount: 234,
    sales30d: 18,
    ageing: 67,
    deadstockRisk: "high" as const,
    reorderSuggestion: false,
    confidence: 85,
    trend: "falling" as const,
  },
  {
    category: "Platinum Rings",
    icon: "💍",
    stockCount: 45,
    sales30d: 8,
    ageing: 23,
    deadstockRisk: "low" as const,
    reorderSuggestion: false,
    confidence: 72,
    trend: "stable" as const,
  },
  {
    category: "Gold Necklaces",
    icon: "📿",
    stockCount: 112,
    sales30d: 35,
    ageing: 18,
    deadstockRisk: "low" as const,
    reorderSuggestion: true,
    confidence: 88,
    trend: "rising" as const,
  },
  {
    category: "Diamond Rings",
    icon: "💎",
    stockCount: 67,
    sales30d: 22,
    ageing: 29,
    deadstockRisk: "medium" as const,
    reorderSuggestion: false,
    confidence: 81,
    trend: "stable" as const,
  },
];

export default function Inventory() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor stock levels, sales velocity, and AI-powered restock suggestions
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventoryItems.map((item) => (
          <InventoryCard key={item.category} {...item} />
        ))}
      </div>
    </div>
  );
}
