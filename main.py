# api/main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

app = FastAPI(title="JewelAI API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "output"

# Global variables for loaded data
turnover_df = None
ensemble_df = None
sales_df = None  # Full sales data with dates
metrics = None
ensemble_model_package = None

# Load data on startup
@app.on_event("startup")
async def load_data():
    global turnover_df, ensemble_df, sales_df, metrics, ensemble_model_package
    try:
        print("Loading data files...")
        turnover_df = pd.read_csv(DATA_DIR / "inventory_turnover_predictions.csv")
        ensemble_df = pd.read_csv(DATA_DIR / "ensemble_predictions.csv")
        
        # Load full sales data with dates for filtering
        sales_path = BASE_DIR / "Data" / "jewellery_multi_store_dataset" / "multi_store_denorm_sales.csv"
        if sales_path.exists():
            sales_df = pd.read_csv(sales_path)
            sales_df['voucher_date'] = pd.to_datetime(sales_df['voucher_date'])
            print(f"✓ Sales data loaded: {len(sales_df)} records")
        else:
            print("⚠ Sales data not found, date filtering will be limited")
        
        with open(DATA_DIR / "ensemble_metrics.json", 'r') as f:
            metrics = json.load(f)
        
        # Load ensemble model for predictions
        try:
            with open(DATA_DIR / "ensemble_model.pkl", 'rb') as f:
                ensemble_model_package = pickle.load(f)
            print("✓ Ensemble model loaded")
        except Exception as e:
            print(f"⚠ Model loading failed (predictions disabled): {e}")
        
        print("✓ Data loaded successfully")
        print(f"  - Inventory items: {len(turnover_df)}")
        print(f"  - Predictions: {len(ensemble_df)}")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        raise

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "JewelAI API is running",
        "version": "1.0.0",
        "endpoints": [
            "/api/kpis/summary",
            "/api/inventory/categories",
            "/api/analytics/performance",
            "/api/market/trends",
            "/health"
        ]
    }

# Helper function to filter by date range
def filter_by_date(df: pd.DataFrame, start_date: Optional[str], end_date: Optional[str]) -> pd.DataFrame:
    """Filter dataframe by date range if dates are provided"""
    if start_date is None and end_date is None:
        return df
    
    if 'voucher_date' not in df.columns:
        return df
    
    filtered = df.copy()
    if start_date:
        filtered = filtered[filtered['voucher_date'] >= start_date]
    if end_date:
        filtered = filtered[filtered['voucher_date'] <= end_date]
    
    return filtered

# KPIs endpoint
@app.get("/api/kpis/summary")
def get_kpis(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get KPI summary including total stock value, ageing stock, deadstock, and fast-moving items"""
    try:
        # Use sales_df with date filtering if available, otherwise use turnover_df
        if sales_df is not None and (start_date or end_date):
            filtered_sales = filter_by_date(sales_df, start_date, end_date)
            
            # Calculate metrics from filtered sales
            total_stock = float(filtered_sales['value'].sum())
            
            # Group by label to get unique items
            items_df = filtered_sales.groupby('label_no').agg({
                'value': 'sum',
                'voucher_date': ['min', 'max']
            }).reset_index()
            
            # Calculate age and velocity
            items_df['days_active'] = (items_df[('voucher_date', 'max')] - items_df[('voucher_date', 'min')]).dt.days + 1
            items_df['risk_score'] = items_df['days_active'].apply(lambda x: min(x * 5, 50))  # Simple risk calculation
            
            ageing_stock = len(items_df[items_df['risk_score'] > 45])
            deadstock = len(items_df[items_df['risk_score'] > 48])
            fast_moving = len(items_df[items_df['risk_score'] < 30])
            total_items = len(items_df)
        else:
            # Fallback to turnover_df
            total_stock = float(turnover_df['predicted_potential_sales'].sum())
            ageing_stock = len(turnover_df[turnover_df['inventory_risk_score'] > 45])
            deadstock = len(turnover_df[turnover_df['inventory_risk_score'] > 48])
            fast_moving = len(turnover_df[turnover_df['inventory_risk_score'] < 30])
            total_items = len(turnover_df)
        
        return {
            "totalStockValue": total_stock,
            "ageingStock": ageing_stock,
            "predictedDeadstock": deadstock,
            "fastMovingItems": fast_moving,
            "totalItems": total_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Inventory categories endpoint
@app.get("/api/inventory/categories")
def get_inventory_categories(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get inventory breakdown by category with stock value, turnover, and risk metrics"""
    try:
        # Use sales_df with date filtering if available
        if sales_df is not None and (start_date or end_date):
            filtered_sales = filter_by_date(sales_df, start_date, end_date)
            
            # Group by category
            category_summary = filtered_sales.groupby('category').agg({
                'value': 'sum',
                'label_no': 'count',
                'voucher_date': ['min', 'max']
            }).reset_index()
            
            # Calculate metrics
            category_summary.columns = ['category', 'stockValue', 'itemCount', 'first_date', 'last_date']
            category_summary['avgDaysToSell'] = ((pd.to_datetime(category_summary['last_date']) - 
                                                  pd.to_datetime(category_summary['first_date'])).dt.days / 
                                                  category_summary['itemCount']).fillna(1)
            category_summary['riskScore'] = category_summary['avgDaysToSell'].apply(lambda x: min(x * 5, 50))
            category_summary['trend'] = category_summary['avgDaysToSell'].apply(
                lambda x: 'rising' if x < 7 else 'falling' if x > 30 else 'stable'
            )
            
            # Select and rename columns
            result = category_summary[['category', 'stockValue', 'avgDaysToSell', 'riskScore', 'itemCount', 'trend']]
        else:
            # Fallback to turnover_df
            category_summary = turnover_df.groupby('category').agg({
                'predicted_potential_sales': 'sum',
                'days_to_sell': 'mean',
                'inventory_risk_score': 'mean',
                'label_no': 'count'
            }).reset_index()
            
            category_summary.columns = ['category', 'stockValue', 'avgDaysToSell', 'riskScore', 'itemCount']
            
            # Add velocity trend
            category_summary['trend'] = category_summary['avgDaysToSell'].apply(
                lambda x: 'rising' if x < 7 else 'falling' if x > 30 else 'stable'
            )
            result = category_summary
        
        return result.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoint
@app.get("/api/analytics/performance")
def get_analytics_performance():
    """Get model performance metrics and training information"""
    try:
        return {
            "ensemble": {
                "r2_score": metrics['ensemble']['r2_score'],
                "rmse": metrics['ensemble']['rmse'],
                "mae": metrics['ensemble']['mae'],
                "mape": metrics['ensemble']['mape']
            },
            "base_models": metrics['base_models'],
            "training_info": metrics['training_info']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Market trends endpoint
@app.get("/api/market/trends")
def get_market_trends(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get market trends aggregated by category"""
    try:
        # Use sales_df with date filtering if available
        if sales_df is not None and (start_date or end_date):
            filtered_sales = filter_by_date(sales_df, start_date, end_date)
            
            # Aggregate by category for market view
            trends = filtered_sales.groupby('category').agg({
                'value': ['sum', 'mean'],
                'voucher_date': ['min', 'max'],
                'label_no': 'count'
            }).reset_index()
            
            trends.columns = ['category', 'total_sales', 'avg_sales', 'first_date', 'last_date', 'item_count']
            
            # Calculate risk and turnover days
            trends['turnover_days'] = ((pd.to_datetime(trends['last_date']) - 
                                       pd.to_datetime(trends['first_date'])).dt.days / 
                                       trends['item_count']).fillna(1)
            trends['risk'] = trends['turnover_days'].apply(lambda x: min(x * 5, 50))
            
            result = trends[['category', 'total_sales', 'avg_sales', 'risk', 'turnover_days']]
        else:
            # Fallback to turnover_df
            trends = turnover_df.groupby('category').agg({
                'predicted_potential_sales': ['sum', 'mean'],
                'inventory_risk_score': 'mean',
                'days_to_sell': 'mean'
            }).reset_index()
            
            trends.columns = ['category', 'total_sales', 'avg_sales', 'risk', 'turnover_days']
            result = trends
        
        return result.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Inventory details endpoint
@app.get("/api/inventory/items")
def get_inventory_items(category: str = None, risk_min: float = 0, risk_max: float = 100):
    """Get detailed inventory items with optional filtering"""
    try:
        df = turnover_df.copy()
        
        # Apply filters
        if category:
            df = df[df['category'] == category.upper()]
        df = df[(df['inventory_risk_score'] >= risk_min) & (df['inventory_risk_score'] <= risk_max)]
        
        # Select relevant columns
        result = df[['label_no', 'category', 'predicted_potential_sales', 
                     'days_to_sell', 'inventory_risk_score', 'turnover_category']].to_dict('records')
        
        return {
            "total": len(result),
            "items": result[:100]  # Limit to 100 items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prediction request schema
class PredictionRequest(BaseModel):
    category: str
    net_weight: float
    voucher_date: str
    purity: float = 22.0
    store_id: str = "MAIN_STORE"

# Prediction endpoint (Phase 4)
@app.post("/api/predict/sales")
def predict_sales(request: PredictionRequest):
    """Predict sales value for a new item (requires loaded model)"""
    if ensemble_model_package is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        from datetime import datetime
        
        # Parse date
        date_obj = datetime.strptime(request.voucher_date, '%Y-%m-%d')
        
        # Calculate price per gram (estimated)
        price_per_gram = 6000 if request.purity == 22 else 5500 if request.purity == 18 else 6500
        
        # Create feature dictionary with all 35 features
        features = {
            # Date features
            'year': date_obj.year,
            'month': date_obj.month,
            'day': date_obj.day,
            'day_of_week': date_obj.weekday(),
            'week_of_year': date_obj.isocalendar()[1],
            'is_weekend': 1 if date_obj.weekday() >= 5 else 0,
            'is_festival': 0,  # Simplified
            
            # Numeric features
            'net_weight': request.net_weight,
            'price_per_gram': price_per_gram,
            'market_share': 13.0,
            'category_avg_market': 90000,
            'store_avg_sales': 95000,
            'sales_momentum': 92000,
            
            # Product category (one-hot encoded)
            'product_category_GOLD BRACELET': 1 if request.category.upper() in ['BRACELET', 'GOLD BRACELET'] else 0,
            'product_category_GOLD CHAINS': 1 if request.category.upper() in ['CHAIN', 'GOLD CHAINS'] else 0,
            'product_category_GOLD EARRING': 1 if request.category.upper() in ['EARRING', 'GOLD EARRING'] else 0,
            'product_category_GOLD NECKLACE': 1 if request.category.upper() in ['NECKLACE', 'GOLD NECKLACE'] else 0,
            'product_category_GOLD RINGS': 1 if request.category.upper() in ['RING', 'GOLD RINGS'] else 0,
            
            # Weight category (one-hot encoded)
            'weight_category_Light': 1 if request.net_weight < 5 else 0,
            'weight_category_Medium': 1 if 5 <= request.net_weight < 10 else 0,
            'weight_category_Heavy': 1 if 10 <= request.net_weight < 20 else 0,
            'weight_category_Very_Heavy': 1 if 20 <= request.net_weight < 50 else 0,
            'weight_category_Ultra_Heavy': 1 if request.net_weight >= 50 else 0,
            
            # Price bracket (one-hot encoded)
            'price_bracket_Budget': 1 if price_per_gram * request.net_weight < 20000 else 0,
            'price_bracket_Mid': 1 if 20000 <= price_per_gram * request.net_weight < 50000 else 0,
            'price_bracket_Premium': 1 if 50000 <= price_per_gram * request.net_weight < 100000 else 0,
            'price_bracket_Luxury': 1 if 100000 <= price_per_gram * request.net_weight < 200000 else 0,
            'price_bracket_Ultra': 1 if price_per_gram * request.net_weight >= 200000 else 0,
            
            # Store ID (one-hot encoded)
            'store_id_MAIN_STORE': 1 if request.store_id == 'MAIN_STORE' else 0,
            'store_id_STORE_1': 1 if request.store_id == 'STORE_1' else 0,
            'store_id_STORE_2': 1 if request.store_id == 'STORE_2' else 0,
            'store_id_STORE_3': 1 if request.store_id == 'STORE_3' else 0,
            'store_id_STORE_4': 1 if request.store_id == 'STORE_4' else 0,
            'store_id_STORE_5': 1 if request.store_id == 'STORE_5' else 0,
            'store_id_STORE_6': 1 if request.store_id == 'STORE_6' else 0,
        }
        
        # Create DataFrame in the correct order
        feature_columns = ensemble_model_package['feature_columns']
        X = pd.DataFrame([features])[feature_columns]
        
        # Scale features
        scaler = ensemble_model_package['scaler']
        X_scaled = scaler.transform(X)
        
        # Ensemble prediction
        base_models = ensemble_model_package['base_models']
        weights = ensemble_model_package['weights']
        
        predictions = []
        for model_name, model in base_models.items():
            pred = model.predict(X_scaled)[0]
            predictions.append(pred)
        
        ensemble_pred = sum(w * p for w, p in zip(weights, predictions))
        
        return {
            "predicted_sales": float(ensemble_pred),
            "confidence": weights.tolist(),
            "input": request.dict(),
            "category": request.category,
            "weight_grams": request.net_weight
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Prediction comparison endpoint for charts
@app.get("/api/analytics/predictions")
def get_prediction_comparison(limit: int = 50):
    """Get sample of actual vs predicted sales for visualization"""
    try:
        # Get a sample of predictions
        sample = ensemble_df.head(limit)
        
        comparison = []
        for _, row in sample.iterrows():
            comparison.append({
                'actual': float(row['actual_sales']),
                'predicted': float(row['ensemble_prediction']),
                'category': row.get('product_category', 'Unknown') if 'product_category' in row else 'Unknown',
            })
        
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
def health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "data_loaded": turnover_df is not None,
        "model_loaded": ensemble_model_package is not None,
        "inventory_items": len(turnover_df) if turnover_df is not None else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
