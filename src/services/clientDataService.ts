// Client-side data service - loads and filters CSV data directly in the browser
// No backend required!

interface SalesRecord {
  voucher_date: string;
  label_no: string;
  category: string;
  value: number;
}

class ClientDataService {
  private salesData: SalesRecord[] | null = null;
  private loading: boolean = false;

  // Load and parse CSV data
  async loadSalesData(): Promise<SalesRecord[]> {
    if (this.salesData) {
      return this.salesData;
    }

    if (this.loading) {
      // Wait for existing load to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.loadSalesData();
    }

    this.loading = true;
    console.log('📥 Loading sales data from CSV...');

    try {
      const response = await fetch('/data/sales_data.csv');
      const text = await response.text();
      
      // Parse CSV manually (simple implementation)
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data: SalesRecord[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Split by comma but handle quoted fields
        const values = this.parseCSVLine(lines[i]);
        
        if (values.length < headers.length) continue;
        
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        
        // Only keep fields we need
        if (record.voucher_date && record.label_no && record.category && record.value) {
          data.push({
            voucher_date: record.voucher_date,
            label_no: record.label_no,
            category: record.category.toUpperCase(),
            value: parseFloat(record.value) || 0,
          });
        }
      }
      
      this.salesData = data;
      console.log(`✅ Loaded ${data.length} sales records`);
      this.loading = false;
      return data;
    } catch (error) {
      console.error('❌ Failed to load sales data:', error);
      this.loading = false;
      throw error;
    }
  }

  // Simple CSV parser that handles quoted fields
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Filter data by date range
  filterByDateRange(data: SalesRecord[], startDate: string, endDate: string): SalesRecord[] {
    return data.filter(record => {
      const date = record.voucher_date;
      return date >= startDate && date <= endDate;
    });
  }

  // Calculate KPIs from filtered data
  calculateKPIs(data: SalesRecord[]) {
    const totalStockValue = data.reduce((sum, record) => sum + record.value, 0);
    
    // Group by label_no to get unique items
    const itemsMap = new Map<string, { value: number; dates: string[] }>();
    data.forEach(record => {
      const existing = itemsMap.get(record.label_no);
      if (existing) {
        existing.value += record.value;
        existing.dates.push(record.voucher_date);
      } else {
        itemsMap.set(record.label_no, {
          value: record.value,
          dates: [record.voucher_date],
        });
      }
    });

    const items = Array.from(itemsMap.values());
    
    // Calculate metrics
    const itemsWithAge = items.map(item => {
      const dates = item.dates.sort();
      const firstDate = new Date(dates[0]);
      const lastDate = new Date(dates[dates.length - 1]);
      const daysActive = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
      const riskScore = Math.min(daysActive * 5, 50);
      return { ...item, riskScore };
    });

    const ageingStock = itemsWithAge.filter(item => item.riskScore > 45).length;
    const predictedDeadstock = itemsWithAge.filter(item => item.riskScore > 48).length;
    const fastMovingItems = itemsWithAge.filter(item => item.riskScore < 30).length;

    return {
      totalStockValue,
      ageingStock,
      predictedDeadstock,
      fastMovingItems,
      totalItems: itemsMap.size,
    };
  }

  // Calculate category breakdown
  calculateCategories(data: SalesRecord[]) {
    const categoryMap = new Map<string, { value: number; items: Set<string>; dates: string[] }>();
    
    data.forEach(record => {
      const existing = categoryMap.get(record.category);
      if (existing) {
        existing.value += record.value;
        existing.items.add(record.label_no);
        existing.dates.push(record.voucher_date);
      } else {
        categoryMap.set(record.category, {
          value: record.value,
          items: new Set([record.label_no]),
          dates: [record.voucher_date],
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const dates = data.dates.sort();
      const firstDate = new Date(dates[0]);
      const lastDate = new Date(dates[dates.length - 1]);
      const avgDaysToSell = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24) / data.items.size));
      const riskScore = Math.min(avgDaysToSell * 5, 50);
      const trend = riskScore < 30 ? 'rising' : riskScore > 45 ? 'falling' : 'stable';

      return {
        category,
        stockValue: data.value,
        avgDaysToSell,
        riskScore,
        itemCount: data.items.size,
        trend: trend as 'rising' | 'falling' | 'stable',
      };
    });
  }
}

export const clientDataService = new ClientDataService();
