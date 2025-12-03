import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InventoryCard } from "@/components/InventoryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Download, Loader2 } from "lucide-react";
import { apiService, type InventoryCategory } from "@/services/apiService";
import { formatIndianCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { generateComprehensivePDF } from "@/lib/reportGenerator";

// Map category names to appropriate icons
const getCategoryIcon = (category: string): string => {
  const categoryUpper = category.toUpperCase();
  if (categoryUpper.includes("CHAIN")) return "🔗";
  if (categoryUpper.includes("EARRING")) return "💎";
  if (categoryUpper.includes("BANGLE")) return "⚪";
  if (categoryUpper.includes("RING")) return "💍";
  if (categoryUpper.includes("NECKLACE")) return "📿";
  if (categoryUpper.includes("BRACELET")) return "✨";
  if (categoryUpper.includes("PENDANT")) return "🔸";
  return "💍"; // Default icon
};

// Map risk score to risk level
const getRiskLevel = (riskScore: number): "low" | "medium" | "high" => {
  if (riskScore < 33) return "low";
  if (riskScore < 66) return "medium";
  return "high";
};

// Calculate confidence based on risk score (inverse relationship)
const getConfidence = (riskScore: number): number => {
  return Math.round(100 - riskScore);
};

// Transform API data to InventoryCard props
const transformInventoryData = (data: InventoryCategory[]) => {
  return data.map((item) => ({
    category: item.category.charAt(0) + item.category.slice(1).toLowerCase(),
    icon: getCategoryIcon(item.category),
    stockCount: item.itemCount,
    sales30d: formatIndianCurrency(item.stockValue).replace('₹', ''), // Remove ₹ symbol as it's just a value display
    ageing: Math.round(item.avgDaysToSell),
    deadstockRisk: getRiskLevel(item.riskScore),
    reorderSuggestion: item.trend === "rising" && item.riskScore < 40,
    confidence: getConfidence(item.riskScore),
    trend: item.trend,
  }));
};

export default function Inventory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch real inventory data from backend without date filter
  const { data: inventoryCategories, isLoading, error } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: () => apiService.fetchInventoryCategories(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Transform and filter inventory data
  const inventoryItems = useMemo(() => {
    if (!inventoryCategories) return [];
    const transformed = transformInventoryData(inventoryCategories);
    
    if (!searchQuery.trim()) return transformed;
    
    return transformed.filter((item) =>
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryCategories, searchQuery]);

  // Handle comprehensive report download
  const handleDownloadReport = async () => {
    if (!inventoryCategories || inventoryCategories.length === 0) {
      alert("No inventory data available to generate report.");
      return;
    }

    setIsGeneratingReport(true);
    try {
      // Transform data for comprehensive report
      const reportData = {
        categories: inventoryCategories.map((cat) => ({
          name: cat.category.charAt(0) + cat.category.slice(1).toLowerCase(),
          itemCount: cat.itemCount,
          stockValue: cat.stockValue,
          avgDaysToSell: Math.round(cat.avgDaysToSell),
          riskScore: cat.riskScore,
          trend: cat.trend,
        })),
        totalValue: inventoryCategories.reduce((sum, cat) => sum + cat.stockValue, 0),
        totalItems: inventoryCategories.reduce((sum, cat) => sum + cat.itemCount, 0),
      };

      await generateComprehensivePDF(reportData);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleDownloadReport}
            disabled={isLoading || isGeneratingReport || !inventoryCategories}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load inventory data. Please make sure the backend is running.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {/* Inventory Cards */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inventoryItems.length > 0 ? (
            inventoryItems.map((item) => {
              const categoryLower = item.category.toLowerCase();
              const isBracelet = categoryLower.includes("bracelet");
              const isRing = categoryLower.includes("ring");
              const isNecklace = categoryLower.includes("necklace");
              const isBangle = categoryLower.includes("bangle");
              const isEarring = categoryLower.includes("earring");
              const isPendant = categoryLower.includes("pendant");
              const isClickable = isBracelet || isRing || isNecklace || isBangle || isEarring || isPendant;
              
              const getNavigationPath = () => {
                if (isBracelet) return "/inventory/bracelets";
                if (isRing) return "/inventory/rings";
                if (isNecklace) return "/inventory/necklaces";
                if (isBangle) return "/inventory/bangles";
                if (isEarring) return "/inventory/earrings";
                if (isPendant) return "/inventory/pendants";
                return null;
              };
              
              return (
                <div
                  key={item.category}
                  onClick={() => {
                    const path = getNavigationPath();
                    if (path) {
                      navigate(path);
                    }
                  }}
                  className={isClickable ? "cursor-pointer transition-transform hover:scale-105" : ""}
                >
                  <InventoryCard {...item} />
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No categories found matching your search." : "No inventory data available."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
