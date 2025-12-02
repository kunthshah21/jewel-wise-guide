# Bracelets Page - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture & File Structure](#architecture--file-structure)
3. [Data Model](#data-model)
4. [Component Structure](#component-structure)
5. [Features Breakdown](#features-breakdown)
6. [AI Insights System](#ai-insights-system)
7. [KPI Calculations](#kpi-calculations)
8. [Filtering System](#filtering-system)
9. [Report Generation](#report-generation)
10. [Replication Guide](#replication-guide)

---

## Overview

The Bracelets Deep Dive page (`/inventory/bracelets`) is a comprehensive inventory analysis interface that provides:
- **Real-time inventory analytics** with AI-powered insights
- **Stock classification** by lifecycle stage (Fast-moving, Slow-moving, Dead Stock)
- **Multi-dimensional analysis** (by type, metal, design style, location)
- **Actionable recommendations** for inventory management
- **Exportable reports** in Word document format

### Key Design Principles
1. **Performance-first**: Uses `useMemo` extensively to prevent unnecessary recalculations
2. **User-centric**: Clear visual hierarchy with color-coded status indicators
3. **Actionable insights**: AI-generated recommendations specific to each stock category
4. **Scalable architecture**: Modular design allows easy replication for other inventory types

---

## Architecture & File Structure

### Core Files

```
src/
├── pages/
│   └── BraceletDeepDive.tsx          # Main component (867 lines)
├── data/
│   └── braceletData.ts                # Data model & helper functions (1,622 lines)
├── lib/
│   ├── reportGenerator.ts             # Word document report generation
│   └── utils.ts                       # Currency formatting utilities
└── components/
    └── KPICard.tsx                    # Reusable KPI display component
```

### Dependencies

**UI Components (shadcn/ui):**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`, `Badge`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`

**Icons:**
- `lucide-react`: Package, TrendingDown, AlertTriangle, TrendingUp, Sparkles, ArrowLeft, Filter, X, Download

**Utilities:**
- `react-router-dom`: `useNavigate` for navigation
- `docx` + `file-saver`: For report generation

---

## Data Model

### BraceletItem Interface

```typescript
interface BraceletItem {
  // Identification
  sku: string;
  type: string;                    // e.g., "Tennis Bracelet", "Charm Bracelet"
  
  // Material Properties
  metal: string;                   // "Gold", "Silver", "Platinum", etc.
  metalPurity: string;              // "18K", "22K", "925", "950"
  grossWeight: number;              // grams
  netMetalWeight: number;           // grams
  
  // Stone Properties
  stoneType: string;                // "Diamond", "Ruby", "None", etc.
  stoneCount: number;
  totalStoneCarat: number;
  stoneQuality: string;             // "VVS1, D", "AAA Grade", etc.
  stoneSetting: string;             // "Prong Setting", "Pave Setting", etc.
  
  // Physical Attributes
  length: string;                   // "7.0 in" or "Adjustable"
  sizeCategory: string;             // "Small", "Medium", "Large", "Adjustable"
  claspType: string;                // "Box Clasp", "Lobster Clasp", "None"
  surfaceFinish: string;            // "High Polish", "Matte Finish", etc.
  
  // Design & Style
  designStyle: string;              // "Modern Minimalist", "Heritage", "Floral Design"
  chainStyle: string;               // "Box Chain", "Cuban Link", "N/A"
  
  // Pricing
  makingCharges: number;            // percentage
  wastagePercentage: number;
  finalSellingPrice: number;       // in INR
  
  // Inventory Management
  supplier: string;
  stockLocation: string;            // "Showroom A", "Warehouse B", "Safe Locker 1"
  availabilityStatus: string;       // "In Stock"
  manufacturingDate: string;        // ISO date string
  daysInInventory: number;         // calculated days since manufacturing
  
  // Lifecycle & Performance
  lifecycleStage: "Fast-moving" | "Slow-moving" | "Ageing Stock" | "Dead Stock" | "New Arrival";
  salesVelocity: number;             // units per month
  lastSaleDate: string | null;      // ISO date string or null
}
```

### Data Source

- **Location**: `src/data/braceletData.ts`
- **Type**: Static synthetic data (50 items)
- **Structure**: Array of `BraceletItem` objects
- **Lifecycle Distribution**:
  - Fast-moving: High sales velocity (≥2 units/month)
  - Slow-moving: Moderate velocity (0.1-1.9 units/month)
  - Ageing Stock: Low velocity, older inventory
  - Dead Stock: No sales in 90+ days
  - New Arrival: Recently added items

### Helper Functions

All helper functions are exported from `braceletData.ts`:

```typescript
// Filtering Functions
getBraceletsByLifecycleStage(stage: string): BraceletItem[]
getBraceletsByType(type: string): BraceletItem[]
getBraceletsByMetal(metal: string): BraceletItem[]
getBraceletsByLocation(location: string): BraceletItem[]
getBraceletsByDesignStyle(style: string): BraceletItem[]

// Aggregation Functions
getTotalStockValue(): number
getAverageDaysInInventory(): number
getStockValueByLifecycle(): Array<{stage: string, count: number, value: number}>

// Distribution Functions
getStockDistributionByType(): Array<{type: string, count: number, value: number}>
getStockDistributionByMetal(): Array<{metal: string, count: number, value: number}>
getStockDistributionByLocation(): Array<{location: string, count: number, value: number}>
getStockDistributionByDesignStyle(): Array<{style: string, count: number, value: number}>
```

---

## Component Structure

### BraceletDeepDive Component

**Location**: `src/pages/BraceletDeepDive.tsx`

#### State Management

```typescript
// Tab Navigation
const [activeTab, setActiveTab] = useState("fast-moving");

// Global Filters (applies to all tabs)
const [filters, setFilters] = useState<{ metal: string; location: string }>({
  metal: "all",
  location: "all",
});

// Dialog Modals (for distribution views)
const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({
  "bracelet-type": false,
  "metal-type": false,
  "design-style": false,
  "stock-location": false,
  "lifecycle-summary": false,
});
```

#### Memoized Calculations

All expensive calculations use `useMemo` to prevent recalculation on every render:

1. **KPI Calculations** (unfiltered data):
   - `totalStockValue`
   - `deadStockItems`, `deadStockValue`
   - `fastMovingItems`
   - `avgDaysToSell`

2. **Filtered Inventory**:
   - `filteredInventory` - Base filtered dataset
   - `fastMovingStock` - Filtered fast-moving items
   - `slowMovingStock` - Filtered slow-moving + ageing stock
   - `deadStock` - Filtered dead stock

3. **Distribution Data**:
   - `distributionByType`
   - `distributionByMetal`
   - `distributionByDesignStyle`
   - `distributionByLocation`

4. **Performance Metrics**:
   - `typePerformance` - Type with average velocity
   - `topPerforming`, `worstPerforming` - Best/worst types
   - `designStylePerformance` - Design style with average velocity
   - `topPerformingDesign`, `worstPerformingDesign` - Best/worst designs

5. **Tab-Specific Metrics**:
   - Fast-moving: `fastMovingValue`, `fastMovingAvgPrice`, `fastMovingTopType`, `fastMovingTopDesign`, `avgSalesVelocity`
   - Slow-moving: `slowMovingValue`, `slowMovingAvgDays`, `slowMovingAvgPrice`, `slowMovingTopDesign`
   - Dead Stock: `deadStockValueFiltered`, `deadStockAvgDays`, `deadStockAvgPrice`, `deadStockTopDesign`

#### Component Layout

```
BraceletDeepDive
├── Header Section
│   ├── Back Button
│   ├── Title & Description
│   └── Download Report Button
├── AI Insights Hero Section
│   ├── Overall Performance
│   ├── Dead Stock Alert
│   ├── Top Performer Analysis
│   └── Recommendations
├── KPI Cards Grid (4 cards)
│   ├── Total Stock Value
│   ├── Dead Stock Value
│   ├── Fast Moving Items
│   └── Average Days in Inventory
├── Stock Classification Card
│   ├── Global Filters (Metal, Location)
│   └── Tabs
│       ├── Fast Moving Tab
│       │   ├── AI Summary Section
│       │   └── Inventory Table
│       ├── Slow Moving Tab
│       │   ├── AI Summary Section
│       │   └── Inventory Table
│       └── Dead Stock Tab
│           ├── AI Summary Section
│           ├── Alert Banner
│           └── Inventory Table
└── Distribution Summary Cards (5 cards)
    ├── Distribution by Bracelet Type (Dialog)
    ├── Distribution by Metal Type (Dialog)
    ├── Distribution by Design Style (Dialog)
    ├── Distribution by Stock Location (Dialog)
    └── Stock Lifecycle Summary (Dialog)
```

---

## Features Breakdown

### 1. AI Insights Hero Section

**Location**: Lines 454-514 in `BraceletDeepDive.tsx`

**Purpose**: Provides high-level, actionable insights at the top of the page.

**Structure**:
- **Visual Design**: Gradient background with decorative border accents, glassmorphism effect
- **Badge**: "AI Insights" with animated sparkle icon
- **Content Sections**:
  1. **Overall Performance**: Total items, stock value, fast-moving percentage, average velocity
  2. **Dead Stock Alert**: Count, percentage, value, and strategic recommendations
  3. **Top Performer**: Best/worst performing types and design styles with velocity metrics
  4. **Recommendations**: Bulleted list of actionable items

**Key Metrics Used**:
- `braceletInventory.length` - Total items
- `totalStockValue` - Total inventory value
- `fastMovingPercentage` - Percentage of fast-moving items
- `avgSalesVelocity` - Average sales velocity
- `deadStockItems.length`, `deadStockPercentage`, `deadStockValue`
- `topPerforming`, `worstPerforming` - Type performance
- `topPerformingDesign`, `worstPerformingDesign` - Design style performance

**Design Notes**:
- Uses `border-l-4 border-primary` for left accent border
- Background: `bg-muted/50` for subtle contrast
- Text hierarchy: Bold headings, relaxed line-height for readability

### 2. KPI Cards

**Location**: Lines 516-550

**Component**: Reuses `KPICard` from `@/components/KPICard.tsx`

**Four KPIs Displayed**:

1. **Total Bracelet Stock Value**
   - Value: `formatIndianCurrency(totalStockValue)`
   - Change: `${braceletInventory.length} items in inventory`
   - Icon: `Package`
   - Type: `neutral`

2. **Dead Stock Value**
   - Value: `formatIndianCurrency(deadStockValue)`
   - Change: `${deadStockItems.length} items (${deadStockPercentage}% of total)`
   - Icon: `AlertTriangle`
   - Type: `negative`
   - Background: `bg-destructive/10`

3. **Fast Moving Items**
   - Value: `${fastMovingItems.length}`
   - Change: `${fastMovingPercentage}% of inventory`
   - Icon: `TrendingUp`
   - Type: `positive`
   - Background: `bg-success/10`

4. **Average Days in Inventory**
   - Value: `${avgDaysToSell} days`
   - Change: `Across all bracelet items`
   - Icon: `TrendingDown`
   - Type: `neutral`
   - Background: `bg-warning/10`

**Currency Formatting**:
- Uses `formatIndianCurrency()` from `@/lib/utils.ts`
- Formats in Lakhs (L) for < 1 Crore
- Formats in Crores (CR) for >= 1 Crore
- Example: `₹12.5L` or `₹2.3CR`

### 3. Global Filtering System

**Location**: Lines 261-330

**Purpose**: Apply filters that affect all tabs simultaneously.

**Filter Options**:
- **Metal**: All metals or specific metal type
- **Location**: All locations or specific stock location

**Implementation**:
```typescript
const [filters, setFilters] = useState<{ metal: string; location: string }>({
  metal: "all",
  location: "all",
});

const filteredInventory = useMemo(() => {
  return braceletInventory.filter((item) => {
    const metalMatch = filters.metal === "all" || item.metal === filters.metal;
    const locationMatch = filters.location === "all" || item.stockLocation === filters.location;
    return metalMatch && locationMatch;
  });
}, [filters]);
```

**UI Features**:
- Filter section with muted background
- Clear filters button (only shown when filters are active)
- Dropdown selects for metal and location
- Dynamic options from unique values in inventory

**Filter Impact**:
- All tab data (fast-moving, slow-moving, dead stock) uses `filteredInventory`
- KPIs remain unfiltered (show overall inventory health)
- Distribution data remains unfiltered (shows complete picture)

### 4. Stock Classification Tabs

**Location**: Lines 552-710

**Three Tabs**:

#### Tab 1: Fast Moving
- **Criteria**: `lifecycleStage === "Fast-moving"`
- **AI Summary** (Lines 582-604):
  - Count, value, average sales velocity
  - Top performing type and design style
  - Key actions: Restocking, pricing, bundling, marketing
- **Color Theme**: Green (`success` colors)
- **Table**: Shows all fast-moving items with details

#### Tab 2: Slow Moving
- **Criteria**: `lifecycleStage === "Slow-moving" || lifecycleStage === "Ageing Stock"`
- **AI Summary** (Lines 617-642):
  - Count, value, average days in inventory
  - Most common design style in slow-moving category
  - Key actions: Discounts, bundling, marketing, staff training
- **Color Theme**: Yellow/Orange (`warning` colors)
- **Table**: Shows all slow-moving items

#### Tab 3: Dead Stock
- **Criteria**: `lifecycleStage === "Dead Stock"`
- **AI Summary** (Lines 655-691):
  - Count, value, average days, percentage of filtered inventory
  - Most common design style (to avoid in future purchases)
  - Financial impact calculation
  - Key actions: Clearance sales, liquidation, bundling, scrap value evaluation
- **Color Theme**: Red (`destructive` colors)
- **Alert Banner**: Prominent warning with icon
- **Table**: Shows all dead stock items

**Tab-Specific AI Insights**:
Each tab includes:
1. **Summary Paragraph**: Key metrics and observations
2. **Key Actions List**: Bulleted actionable recommendations
3. **Contextual Data**: Top types/designs specific to that category

### 5. Inventory Table

**Location**: Lines 333-390

**Function**: `renderInventoryTable(items: BraceletItem[])`

**Columns**:
1. **SKU**: Unique identifier
2. **Type**: Bracelet type
3. **Metal**: Metal type with purity in parentheses
4. **Design Style**: Design aesthetic
5. **Price**: Formatted Indian currency
6. **Days in Stock**: Badge with color coding
   - Red (`destructive`): >180 days
   - Yellow (`secondary`): >90 days
   - Default: ≤90 days
7. **Location**: Stock location
8. **Status**: Lifecycle stage badge
   - Green (`default`): Fast-moving
   - Red (`destructive`): Dead Stock
   - Yellow (`secondary`): Others

**Empty State**: Shows message when no items match filters

### 6. Distribution Summary Cards

**Location**: Lines 712-863

**Five Distribution Views** (all in dialogs):

1. **Distribution by Bracelet Type**
   - Shows: Type, count, value
   - Sorted by value (highest first)

2. **Distribution by Metal Type**
   - Shows: Metal, count, value
   - Sorted by value

3. **Distribution by Design Style**
   - Shows: Style, count, value
   - Sorted by value

4. **Distribution by Stock Location**
   - Shows: Location, count, value
   - Sorted by value

5. **Stock Lifecycle Summary**
   - Shows: Lifecycle stage, count, value, percentage of total
   - Color-coded badges matching tab colors

**Dialog Implementation**:
- Click card to open dialog
- Scrollable content for long lists
- Clean list layout with borders
- Value and count displayed prominently

---

## AI Insights System

### Overview

The AI insights are **computed dynamically** based on inventory data, not generated by an external AI service. The "AI" refers to the intelligent analysis and pattern recognition built into the component.

### Insight Generation Logic

#### 1. Overall Performance Insight
**Location**: Lines 472-480

**Calculations**:
```typescript
const fastMovingPercentage = ((fastMovingItems.length / braceletInventory.length) * 100).toFixed(1);
const avgSalesVelocity = fastMovingStock.length > 0
  ? (fastMovingStock.reduce((sum, item) => sum + item.salesVelocity, 0) / fastMovingStock.length).toFixed(1)
  : "0";
```

**Output Format**:
- Total items and value
- Fast-moving percentage
- Average sales velocity

#### 2. Dead Stock Alert
**Location**: Lines 482-489

**Calculations**:
```typescript
const deadStockPercentage = ((deadStockItems.length / braceletInventory.length) * 100).toFixed(1);
const deadStockValue = deadStockItems.reduce((sum, item) => sum + item.finalSellingPrice, 0);
```

**Output Format**:
- Count and percentage
- Total value tied up
- Strategic recommendations

#### 3. Top Performer Analysis
**Location**: Lines 491-500

**Calculations**:
```typescript
// Type Performance
const typePerformance = distributionByType.map((type) => {
  const items = braceletInventory.filter((item) => item.type === type.type);
  const avgVelocity = items.length > 0 
    ? items.reduce((sum, item) => sum + item.salesVelocity, 0) / items.length
    : 0;
  return { ...type, avgVelocity };
});

const topPerforming = [...typePerformance].sort((a, b) => b.avgVelocity - a.avgVelocity)[0];
const worstPerforming = [...typePerformance].sort((a, b) => a.avgVelocity - b.avgVelocity)[0];

// Design Style Performance
const designStylePerformance = distributionByDesignStyle.map((style) => {
  const items = braceletInventory.filter((item) => item.designStyle === style.style);
  const avgVelocity = items.length > 0 
    ? items.reduce((sum, item) => sum + item.salesVelocity, 0) / items.length
    : 0;
  return { ...style, avgVelocity };
});

const topPerformingDesign = [...designStylePerformance].sort((a, b) => b.avgVelocity - a.avgVelocity)[0];
const worstPerformingDesign = [...designStylePerformance].sort((a, b) => a.avgVelocity - b.avgVelocity)[0];
```

**Output Format**:
- Best/worst performing types with counts
- Best/worst performing design styles with velocity metrics
- Comparative analysis

#### 4. Recommendations
**Location**: Lines 502-511

**Static Recommendations** (based on calculated metrics):
- Restock top performers
- Clearance for old items
- Pricing strategy for worst performers
- Seasonal promotions
- Focus on top-performing designs

### Tab-Specific AI Insights

#### Fast Moving Tab
**Location**: Lines 582-604

**Metrics**:
- `fastMovingStock.length` - Count
- `fastMovingValue` - Total value
- `avgSalesVelocity` - Average velocity
- `fastMovingTopType` - Most common type
- `fastMovingTopDesign` - Most common design

**Recommendations**:
- Maintain inventory levels
- Set reorder points
- Prioritize top design styles
- Consider price increases
- Bundle with slow-moving items
- Marketing and placement strategies

#### Slow Moving Tab
**Location**: Lines 617-642

**Metrics**:
- `slowMovingStock.length` - Count
- `slowMovingValue` - Total value
- `slowMovingAvgDays` - Average days in inventory
- `slowMovingTopDesign` - Most common design (to avoid)

**Recommendations**:
- Discount strategies (15-25%)
- Bundling with fast-moving items
- Avoid purchasing problematic designs
- Relocation and display strategies
- Marketing campaigns
- Staff training
- Transfer strategies after 120 days

#### Dead Stock Tab
**Location**: Lines 655-691

**Metrics**:
- `deadStock.length` - Count
- `deadStockValueFiltered` - Total value
- `deadStockAvgDays` - Average days
- Percentage of filtered inventory
- `deadStockTopDesign` - Most common design (critical to avoid)

**Recommendations**:
- Clearance events (30-50% discounts)
- Bulk promotions
- Liquidation channels
- Bundling as free gifts
- Stop purchasing problematic designs
- Scrap value evaluation
- Clearance deadlines
- Pattern analysis

**Financial Impact Calculation**:
```typescript
const reinvestmentPotential = fastMovingAvgPrice > 0 
  ? Math.round(deadStockValueFiltered / fastMovingAvgPrice)
  : 0;
```
Shows how many fast-moving items could be purchased with freed capital.

---

## KPI Calculations

### Calculation Strategy

**Unfiltered KPIs** (Overall Health):
- Total Stock Value
- Dead Stock Value
- Fast Moving Items Count
- Average Days in Inventory

**Rationale**: KPIs should reflect overall inventory health, not filtered subsets.

### Implementation

```typescript
// Total Stock Value
const totalStockValue = useMemo(() => getTotalStockValue(), []);

// Dead Stock
const deadStockItems = useMemo(() => getBraceletsByLifecycleStage("Dead Stock"), []);
const deadStockValue = useMemo(() => 
  deadStockItems.reduce((sum, item) => sum + item.finalSellingPrice, 0), 
  [deadStockItems]
);
const deadStockPercentage = useMemo(() => 
  ((deadStockItems.length / braceletInventory.length) * 100).toFixed(1),
  [deadStockItems]
);

// Fast Moving
const fastMovingItems = useMemo(() => getBraceletsByLifecycleStage("Fast-moving"), []);
const fastMovingPercentage = useMemo(() =>
  ((fastMovingItems.length / braceletInventory.length) * 100).toFixed(1),
  [fastMovingItems]
);

// Average Days
const avgDaysToSell = useMemo(() => getAverageDaysInInventory(), []);
```

### Performance Optimization

- All calculations use `useMemo` with proper dependencies
- Calculations only re-run when dependencies change
- No unnecessary recalculations on filter changes (for KPIs)

---

## Filtering System

### Architecture

**Two-Level Filtering**:

1. **Global Filters** (Metal, Location)
   - Applied to all tabs
   - Stored in component state
   - Affects: `filteredInventory`, all tab data

2. **Tab Filters** (Lifecycle Stage)
   - Applied per tab
   - Derived from `lifecycleStage` property
   - Combined with global filters

### Filter Flow

```
braceletInventory (full dataset)
    ↓
[Global Filters: Metal, Location]
    ↓
filteredInventory
    ↓
[Tab Filter: Lifecycle Stage]
    ↓
fastMovingStock / slowMovingStock / deadStock
```

### Implementation Details

```typescript
// Step 1: Apply global filters
const filteredInventory = useMemo(() => {
  return braceletInventory.filter((item) => {
    const metalMatch = filters.metal === "all" || item.metal === filters.metal;
    const locationMatch = filters.location === "all" || item.stockLocation === filters.location;
    return metalMatch && locationMatch;
  });
}, [filters]);

// Step 2: Apply tab-specific filters
const fastMovingStock = useMemo(() => 
  filteredInventory.filter((item) => item.lifecycleStage === "Fast-moving"), 
  [filteredInventory]
);

const slowMovingStock = useMemo(() => 
  filteredInventory.filter((item) => 
    item.lifecycleStage === "Slow-moving" || item.lifecycleStage === "Ageing Stock"
  ), 
  [filteredInventory]
);

const deadStock = useMemo(() => 
  filteredInventory.filter((item) => item.lifecycleStage === "Dead Stock"), 
  [filteredInventory]
);
```

### Filter Options Generation

```typescript
// Unique metals
const uniqueMetals = useMemo(() => {
  const metals = new Set<string>();
  braceletInventory.forEach((item) => metals.add(item.metal));
  return Array.from(metals).sort();
}, []);

// Unique locations
const uniqueLocations = useMemo(() => {
  const locations = new Set<string>();
  braceletInventory.forEach((item) => locations.add(item.stockLocation));
  return Array.from(locations).sort();
}, []);
```

### Filter UI

**Location**: Lines 261-330

**Features**:
- Filter section with muted background
- Labeled dropdowns for Metal and Location
- "Clear Filters" button (only visible when filters active)
- Responsive layout with flexbox

---

## Report Generation

### Overview

**Location**: `src/lib/reportGenerator.ts`

**Function**: `generateBraceletReport(data: ReportData)`

**Output**: Word document (.docx) with comprehensive analysis

### Report Structure

1. **Title Page**
   - Report title
   - Generation timestamp

2. **Executive Summary**
   - Total items and value
   - Purpose statement

3. **Overall AI Prediction**
   - Overall Performance
   - Dead Stock Alert
   - Top Performer Analysis
   - Recommendations

4. **Specific AI Insights**
   - Fast-Moving Goods Analysis
   - Slow-Moving Goods Analysis
   - Dead Stock Analysis

5. **Distribution Analysis**
   - By Bracelet Type
   - By Metal Type
   - By Design Style
   - By Stock Location
   - Lifecycle Summary

6. **Detailed Inventory Lists**
   - Fast-Moving Items Table
   - Slow-Moving Items Table
   - Dead Stock Items Table

### Report Data Interface

```typescript
interface ReportData {
  totalStockValue: number;
  totalItems: number;
  deadStockItems: BraceletItem[];
  deadStockValue: number;
  deadStockPercentage: string;
  fastMovingItems: BraceletItem[];
  fastMovingValue: number;
  fastMovingPercentage: string;
  slowMovingItems: BraceletItem[];
  slowMovingValue: number;
  avgDaysToSell: number;
  topPerforming: { type: string; count: number; value: number; avgVelocity: number };
  worstPerforming: { type: string; count: number; value: number; avgVelocity: number };
  fastMovingTopType: string;
  avgSalesVelocity: string;
  fastMovingAvgPrice: number;
  slowMovingAvgDays: number;
  slowMovingAvgPrice: number;
  deadStockAvgDays: number;
  deadStockAvgPrice: number;
  distributionByType: Array<{ type: string; count: number; value: number }>;
  distributionByMetal: Array<{ metal: string; count: number; value: number }>;
  distributionByDesignStyle: Array<{ style: string; count: number; value: number }>;
  distributionByLocation: Array<{ location: string; count: number; value: number }>;
  topPerformingDesign: { style: string; count: number; value: number; avgVelocity: number };
  worstPerformingDesign: { style: string; count: number; value: number; avgVelocity: number };
  fastMovingTopDesign: string;
  slowMovingTopDesign: string;
  deadStockTopDesign: string;
}
```

### Report Generation Trigger

**Location**: Lines 408-451 in `BraceletDeepDive.tsx`

```typescript
<Button
  onClick={async () => {
    try {
      await generateBraceletReport({
        totalStockValue,
        totalItems: braceletInventory.length,
        deadStockItems,
        deadStockValue,
        deadStockPercentage,
        fastMovingItems,
        fastMovingValue,
        fastMovingPercentage,
        slowMovingItems: slowMovingStock,
        slowMovingValue,
        avgDaysToSell,
        topPerforming,
        worstPerforming,
        fastMovingTopType,
        avgSalesVelocity,
        fastMovingAvgPrice,
        slowMovingAvgDays,
        slowMovingAvgPrice,
        deadStockAvgDays,
        deadStockAvgPrice,
        distributionByType,
        distributionByMetal,
        distributionByDesignStyle,
        distributionByLocation,
        topPerformingDesign,
        worstPerformingDesign,
        fastMovingTopDesign,
        slowMovingTopDesign,
        deadStockTopDesign,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  }}
  className="flex items-center gap-2"
>
  <Download className="h-4 w-4" />
  Download Report
</Button>
```

### Technology Stack

- **docx**: Word document generation library
- **file-saver**: Client-side file download

---

## Replication Guide

### Step-by-Step Process

To replicate the Bracelets page for another inventory type (e.g., Rings, Necklaces):

#### Step 1: Create Data File

**File**: `src/data/{itemType}Data.ts` (e.g., `ringData.ts`)

**Template**:
```typescript
// 1. Define Item Interface (adapt from BraceletItem)
export interface RingItem {
  sku: string;
  type: string;                    // Adapt to ring types
  metal: string;
  metalPurity: string;
  // ... other properties specific to rings
  lifecycleStage: "Fast-moving" | "Slow-moving" | "Ageing Stock" | "Dead Stock" | "New Arrival";
  salesVelocity: number;
  lastSaleDate: string | null;
  // ... rest of properties
}

// 2. Create Inventory Array
export const ringInventory: RingItem[] = [
  // ... 50+ items with complete data
];

// 3. Create Helper Functions (copy from braceletData.ts and adapt)
export const getRingsByLifecycleStage = (stage: RingItem["lifecycleStage"]) => {
  return ringInventory.filter((item) => item.lifecycleStage === stage);
};

export const getTotalStockValue = () => {
  return ringInventory.reduce((sum, item) => sum + item.finalSellingPrice, 0);
};

// ... all other helper functions
```

**Key Considerations**:
- Maintain same lifecycle stage values
- Include `salesVelocity` and `daysInInventory` for classification
- Include `designStyle` for design performance analysis
- Include distribution dimensions (type, metal, location, design)

#### Step 2: Create Deep Dive Component

**File**: `src/pages/{ItemType}DeepDive.tsx` (e.g., `RingDeepDive.tsx`)

**Template Structure**:
```typescript
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// ... all imports (same as BraceletDeepDive)

import {
  ringInventory,
  getRingsByLifecycleStage,
  getTotalStockValue,
  // ... all helper functions
  type RingItem,
} from "@/data/ringData";

export default function RingDeepDive() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("fast-moving");
  const [filters, setFilters] = useState<{ metal: string; location: string }>({
    metal: "all",
    location: "all",
  });
  
  // ... copy all state management from BraceletDeepDive
  
  // ... copy all useMemo calculations (replace "bracelet" with "ring")
  
  // ... copy all render functions
  
  return (
    <div className="space-y-6">
      {/* Header - Update title */}
      {/* AI Insights - Update text references */}
      {/* KPI Cards - Update titles */}
      {/* Tabs - Update tab labels */}
      {/* Distribution Cards - Update titles */}
    </div>
  );
}
```

**Find & Replace Checklist**:
- `Bracelet` → `Ring` (or your item type)
- `bracelet` → `ring` (lowercase)
- `BR-` → `RG-` (SKU prefix, if applicable)
- Update all text references in UI

#### Step 3: Create Report Generator Function

**File**: `src/lib/reportGenerator.ts`

**Add new function**:
```typescript
export async function generateRingReport(data: RingReportData) {
  // Copy generateBraceletReport function
  // Replace all "Bracelet" references with "Ring"
  // Update interface name to RingReportData
}
```

**Create interface**:
```typescript
interface RingReportData {
  // Same structure as ReportData, but for rings
}
```

#### Step 4: Update Routing

**File**: `src/App.tsx`

```typescript
import RingDeepDive from "./pages/RingDeepDive";

// In Routes:
<Route path="/inventory/rings" element={<RingDeepDive />} />
```

#### Step 5: Update Navigation

**File**: `src/components/Sidebar.tsx`

Add navigation item:
```typescript
// In Inventory submenu
{
  label: "Rings",
  path: "/inventory/rings",
  icon: RingIcon, // or appropriate icon
}
```

#### Step 6: Update Inventory Page

**File**: `src/pages/Inventory.tsx`

Add click handler:
```typescript
const isRing = item.category.toLowerCase().includes("ring");
onClick={() => {
  if (isRing) {
    navigate("/inventory/rings");
  }
}}
```

### Key Customization Points

#### 1. Item-Specific Properties

**Bracelets have**:
- `length`, `sizeCategory`, `claspType`, `chainStyle`

**Rings might have**:
- `ringSize`, `bandWidth`, `stoneSetting`, `shankStyle`

**Adapt**:
- Update interface
- Update table columns
- Update distribution dimensions if needed

#### 2. Lifecycle Classification

**Current Logic**:
- Fast-moving: `salesVelocity ≥ 2`
- Slow-moving: `0.1 ≤ salesVelocity < 2` or ageing
- Dead Stock: `daysInInventory > 90` and no sales

**Customize if needed**:
- Adjust velocity thresholds
- Adjust days threshold for dead stock
- Add custom lifecycle stages

#### 3. Distribution Dimensions

**Current Dimensions**:
- Type (Tennis, Charm, Cuff, etc.)
- Metal (Gold, Silver, Platinum, etc.)
- Design Style (Modern Minimalist, Heritage, etc.)
- Location (Showroom A, Warehouse B, etc.)

**Customize**:
- Add item-specific dimensions
- Remove irrelevant dimensions
- Update distribution calculation functions

#### 4. AI Insights Text

**Location**: Multiple locations in component

**Customize**:
- Update recommendations to be item-specific
- Adjust metric descriptions
- Update action items for item type

#### 5. Table Columns

**Location**: `renderInventoryTable()` function

**Customize**:
- Add/remove columns based on item properties
- Update column headers
- Adjust badge logic for status indicators

### Testing Checklist

After replication, verify:

- [ ] All KPIs calculate correctly
- [ ] Filters work on all tabs
- [ ] Tab switching shows correct data
- [ ] AI insights display properly
- [ ] Distribution dialogs open and show data
- [ ] Report generation works
- [ ] Navigation from Inventory page works
- [ ] Navigation from Sidebar works
- [ ] Currency formatting displays correctly
- [ ] Empty states show when filters result in no data
- [ ] All calculations use `useMemo` for performance
- [ ] Responsive design works on mobile/tablet

### Performance Considerations

1. **Memoization**: Ensure all expensive calculations use `useMemo`
2. **Dependencies**: Verify `useMemo` dependencies are correct
3. **Re-renders**: Use React DevTools to check for unnecessary re-renders
4. **Data Size**: If inventory > 1000 items, consider pagination or virtualization

### Common Pitfalls

1. **Forgetting to update all text references**: Use find/replace carefully
2. **Incorrect filter logic**: Ensure filters apply to all tabs correctly
3. **Missing helper functions**: Copy all helper functions from braceletData.ts
4. **Type mismatches**: Ensure TypeScript types match between data and component
5. **Currency formatting**: Verify `formatIndianCurrency` works for all values

---

## Best Practices

### Code Organization

1. **Separate Concerns**:
   - Data logic in `{itemType}Data.ts`
   - UI logic in `{ItemType}DeepDive.tsx`
   - Report generation in `reportGenerator.ts`

2. **Reusable Components**:
   - `KPICard` is reusable
   - Consider extracting `renderInventoryTable` to a component if used elsewhere
   - Consider extracting AI insights sections to components

3. **Type Safety**:
   - Use TypeScript interfaces consistently
   - Export types from data files
   - Use type guards where needed

### Performance

1. **Memoization Strategy**:
   - Memoize all expensive calculations
   - Memoize filtered datasets
   - Memoize derived metrics

2. **Dependency Arrays**:
   - Include all dependencies in `useMemo`
   - Avoid unnecessary dependencies
   - Use stable references when possible

3. **Render Optimization**:
   - Extract render functions if they're large
   - Use `React.memo` for child components if needed
   - Avoid inline object/array creation in render

### User Experience

1. **Loading States**:
   - Show loading indicators for async operations
   - Handle empty states gracefully

2. **Error Handling**:
   - Try-catch for report generation
   - User-friendly error messages
   - Fallback values for calculations

3. **Accessibility**:
   - Proper ARIA labels
   - Keyboard navigation support
   - Screen reader friendly

4. **Responsive Design**:
   - Mobile-friendly layouts
   - Adaptive grid columns
   - Touch-friendly interactions

---

## Conclusion

The Bracelets Deep Dive page is a comprehensive inventory analysis tool that combines:
- **Data-driven insights** with AI-style recommendations
- **Multi-dimensional analysis** across types, metals, designs, and locations
- **Actionable recommendations** for each stock category
- **Exportable reports** for documentation and sharing

The architecture is designed for **easy replication** across other inventory types while maintaining consistency and performance.

For questions or issues during replication, refer to:
- This documentation
- The original `BraceletDeepDive.tsx` implementation
- The `braceletData.ts` data structure
- The `reportGenerator.ts` report generation logic

---

**Last Updated**: Based on codebase analysis as of implementation date
**Version**: 1.0
**Maintained By**: Development Team
