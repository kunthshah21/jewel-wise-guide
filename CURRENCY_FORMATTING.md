# Currency Formatting Update

## Overview
Updated the dashboard to display currency values in both **Lakhs (L)** and **Crores (CR)** based on the magnitude of the values, following Indian numbering conventions.

## Changes Made

### 1. Created Formatting Utilities (`src/lib/utils.ts`)

#### `formatIndianCurrency(value: number, decimals?: number): string`
Formats currency values with the ₹ symbol:
- Values < ₹1L: Shows actual value (e.g., ₹50,000)
- Values ≥ ₹1L and < ₹1CR: Shows in Lakhs (e.g., ₹5.5L)
- Values ≥ ₹1CR: Shows in Crores (e.g., ₹2.3CR)

#### `formatChartValue(value: number, decimals?: number): string`
Same logic as above but without the ₹ symbol, used for chart axes and tooltips.

### 2. Updated Components

#### Dashboard (`src/pages/Dashboard.tsx`)
- **KPI Cards**: Total Stock Value now shows CR when ≥ 1 Crore
- **Stock Distribution Chart**: Y-axis and tooltips format values dynamically
- **Market Trends Chart**: Values formatted in tooltips and Y-axis
- **Stock Ageing Pie Chart**: Tooltips show formatted values
- **AI Daily Insight**: Stock value displayed with proper formatting

#### Inventory Page (`src/pages/Inventory.tsx`)
- **Inventory Cards**: Stock values (sales30d field) now show in L or CR as appropriate

#### Components (`src/components/InventoryCard.tsx`)
- Updated to accept both number and formatted string for `sales30d` prop

## Examples

### Before:
- ₹48.5L (Always in Lakhs)
- ₹125.0L (Large values still in Lakhs)

### After:
- ₹48.5L (< 1 Crore, shown in Lakhs)
- ₹1.3CR (≥ 1 Crore, shown in Crores)
- ₹12.5CR (Large values now properly in Crores)

## Thresholds
- 1 Lakh (L) = ₹1,00,000 (100,000)
- 1 Crore (CR) = ₹1,00,00,000 (10,000,000)

## Testing
The formatting will automatically apply to all currency displays throughout the dashboard. Values will switch from Lakhs to Crores when they exceed ₹1 Crore (10 million rupees).
