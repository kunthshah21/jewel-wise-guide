import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const sampleData = [
  { month: "Jan", searches: 45 },
  { month: "Feb", searches: 52 },
  { month: "Mar", searches: 48 },
  { month: "Apr", searches: 61 },
  { month: "May", searches: 55 },
  { month: "Jun", searches: 67 },
];

const relatedSearches = [
  "gold chain designs",
  "22kt gold chain price",
  "lightweight gold chains for women",
  "gold chain with pendant",
  "gold chain for men",
];

export default function Keywords() {
  const [searchQuery, setSearchQuery] = useState("gold chain");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Keyword Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Research market demand and search trends for jewellery products
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter keyword (e.g., gold chain, diamond earrings)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <>
          {/* Interest Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Interest Over Time: "{searchQuery}"</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="searches"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Related Searches */}
            <Card>
              <CardHeader>
                <CardTitle>Related Search Phrases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{search}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>AI Recommendation</span>
                  <Badge>92% Confidence</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    High Demand Detected
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Search interest for "{searchQuery}" has grown 34% in the last quarter. 
                    This indicates strong market demand. Consider:
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Increasing stock allocation for lightweight designs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Promoting 22kt variants as they show highest interest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Targeting women's collection in marketing campaigns</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-foreground">
                    Potential Impact: <span className="text-success">High</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Category-Level Demand Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Gold Category</span>
                    <span className="text-sm font-semibold text-foreground">High</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-success" style={{ width: "85%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Chains Subcategory</span>
                    <span className="text-sm font-semibold text-foreground">Very High</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "92%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Price Sensitivity</span>
                    <span className="text-sm font-semibold text-foreground">Medium</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: "62%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
