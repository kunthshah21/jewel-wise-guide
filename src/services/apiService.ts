// src/services/apiService.ts

import { clientDataService } from './clientDataService';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
const USE_CLIENT_SIDE = true; // Set to true to use client-side data loading (no backend required)

export interface KPIData {
  totalStockValue: number;
  ageingStock: number;
  predictedDeadstock: number;
  fastMovingItems: number;
  totalItems: number;
}

export interface InventoryCategory {
  category: string;
  stockValue: number;
  avgDaysToSell: number;
  riskScore: number;
  itemCount: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface AnalyticsPerformance {
  ensemble: {
    r2_score: number;
    rmse: number;
    mae: number;
    mape: number;
  };
  base_models: Record<string, any>;
  training_info: Record<string, any>;
}

export interface MarketTrend {
  category: string;
  total_sales: number;
  avg_sales: number;
  risk: number;
  turnover_days: number;
}

export interface InventoryItem {
  label_no: string;
  category: string;
  predicted_potential_sales: number;
  days_to_sell: number;
  inventory_risk_score: number;
  turnover_category: string;
}

export interface PredictionRequest {
  category: string;
  net_weight: number;
  voucher_date: string;
  purity?: number;
  store_id?: string;
}

export interface PredictionResponse {
  predicted_sales: number;
  confidence: number[];
  input: PredictionRequest;
  category: string;
  weight_grams: number;
}

class APIService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Fetch from static JSON files (no API required)
  async fetchKPIs(startDate?: string, endDate?: string): Promise<KPIData> {
    // Try client-side data loading first
    if (USE_CLIENT_SIDE && startDate && endDate) {
      try {
        console.log('📊 Using client-side data filtering');
        const allData = await clientDataService.loadSalesData();
        const filteredData = clientDataService.filterByDateRange(allData, startDate, endDate);
        const kpis = clientDataService.calculateKPIs(filteredData);
        console.log('✅ Client-side KPIs:', kpis);
        return kpis;
      } catch (error) {
        console.warn('⚠️ Client-side loading failed, trying backend:', error);
      }
    }
    
    try {
      // Try backend API with date filters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const queryString = params.toString();
      const url = queryString 
        ? `${this.baseUrl}/api/kpis/summary?${queryString}`
        : `${this.baseUrl}/api/kpis/summary`;
      
      console.log('📡 Fetching KPIs from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ KPI Data from backend:', data);
        return data;
      } else {
        console.warn('⚠️ Backend returned status:', response.status);
      }
    } catch (error) {
      console.warn('❌ Backend API not available', error);
    }
    
    // Fallback to static JSON
    console.log('📄 Using static kpis.json');
    const response = await fetch('/data/kpis.json');
    if (!response.ok) throw new Error('Failed to fetch KPIs');
    const data = await response.json();
    console.log('📊 Static KPI Data:', data);
    return data;
  }

  async fetchInventoryCategories(startDate?: string, endDate?: string): Promise<InventoryCategory[]> {
    // Try client-side data loading first
    if (USE_CLIENT_SIDE && startDate && endDate) {
      try {
        console.log('📊 Using client-side data filtering for categories');
        const allData = await clientDataService.loadSalesData();
        const filteredData = clientDataService.filterByDateRange(allData, startDate, endDate);
        const categories = clientDataService.calculateCategories(filteredData);
        console.log('✅ Client-side categories:', categories.length);
        return categories;
      } catch (error) {
        console.warn('⚠️ Client-side loading failed, trying backend:', error);
      }
    }
    
    try {
      // Try to fetch from backend API first with date filters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const queryString = params.toString();
      const url = queryString 
        ? `${this.baseUrl}/api/inventory/categories?${queryString}`
        : `${this.baseUrl}/api/inventory/categories`;
      
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Backend API not available, falling back to static data', error);
    }
    
    // Fallback to static JSON file if backend is not available
    const response = await fetch('/data/inventory.json');
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  }

  async fetchMarketTrends(startDate?: string, endDate?: string): Promise<MarketTrend[]> {
    try {
      // Try backend API with date filters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const queryString = params.toString();
      const url = queryString 
        ? `${this.baseUrl}/api/market/trends?${queryString}`
        : `${this.baseUrl}/api/market/trends`;
      
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Backend API not available, falling back to static data', error);
    }
    
    // Fallback to static JSON
    const response = await fetch('/data/market.json');
    if (!response.ok) throw new Error('Failed to fetch market trends');
    return response.json();
  }

  async fetchAnalyticsData(startDate?: string, endDate?: string): Promise<any> {
    try {
      // Try backend API with date filters
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const queryString = params.toString();
      const url = queryString 
        ? `${this.baseUrl}/api/analytics/data?${queryString}`
        : `${this.baseUrl}/api/analytics/data`;
      
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Backend API not available, falling back to static data', error);
    }
    
    // Fallback to static JSON
    const response = await fetch('/data/analytics.json');
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }

  async fetchPrecomputedPredictions(): Promise<any> {
    const response = await fetch('/data/predictions.json');
    if (!response.ok) throw new Error('Failed to fetch precomputed predictions');
    return response.json();
  }

  // ML Prediction endpoints (require Python backend)
  async fetchAnalyticsPerformance(): Promise<AnalyticsPerformance> {
    const response = await fetch(`${this.baseUrl}/api/analytics/performance`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }

  async fetchPredictionComparison(limit: number = 50): Promise<Array<{
    actual: number;
    predicted: number;
    category: string;
  }>> {
    const response = await fetch(`${this.baseUrl}/api/analytics/predictions?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch prediction comparison');
    return response.json();
  }

  async fetchInventoryItems(
    category?: string,
    riskMin: number = 0,
    riskMax: number = 100
  ): Promise<{ total: number; items: InventoryItem[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('risk_min', riskMin.toString());
    params.append('risk_max', riskMax.toString());

    const response = await fetch(
      `${this.baseUrl}/api/inventory/items?${params.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch inventory items');
    return response.json();
  }

  async predictSales(request: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/api/predict/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to predict sales');
    }
    return response.json();
  }

  async checkHealth(): Promise<{
    status: string;
    data_loaded: boolean;
    model_loaded: boolean;
    inventory_items: number;
  }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('API health check failed');
    return response.json();
  }
}

export const apiService = new APIService();
