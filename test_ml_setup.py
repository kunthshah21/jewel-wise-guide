#!/usr/bin/env python3
"""
Test script to verify ML prediction endpoint works correctly
"""
import sys
import pickle
import pandas as pd
from datetime import datetime

def test_model_loading():
    """Test if the model can be loaded"""
    print("🔍 Testing model loading...")
    try:
        with open('output/ensemble_model.pkl', 'rb') as f:
            model = pickle.load(f)
        print("✓ Model loaded successfully")
        print(f"  - Base models: {list(model['base_models'].keys())}")
        print(f"  - Feature columns: {len(model['feature_columns'])}")
        return model
    except Exception as e:
        print(f"✗ Model loading failed: {e}")
        return None

def test_prediction(model):
    """Test a sample prediction"""
    print("\n🔍 Testing prediction...")
    try:
        # Sample input
        category = "RING"
        net_weight = 5.0
        voucher_date = datetime.now().strftime('%Y-%m-%d')
        purity = 22.0
        
        date_obj = datetime.strptime(voucher_date, '%Y-%m-%d')
        price_per_gram = 6000
        
        # Create features
        features = {
            'year': date_obj.year,
            'month': date_obj.month,
            'day': date_obj.day,
            'day_of_week': date_obj.weekday(),
            'week_of_year': date_obj.isocalendar()[1],
            'is_weekend': 1 if date_obj.weekday() >= 5 else 0,
            'is_festival': 0,
            'net_weight': net_weight,
            'price_per_gram': price_per_gram,
            'market_share': 13.0,
            'category_avg_market': 90000,
            'store_avg_sales': 95000,
            'sales_momentum': 92000,
            'product_category_GOLD BRACELET': 0,
            'product_category_GOLD CHAINS': 0,
            'product_category_GOLD EARRING': 0,
            'product_category_GOLD NECKLACE': 0,
            'product_category_GOLD RINGS': 1,
            'weight_category_Light': 0,
            'weight_category_Medium': 1,
            'weight_category_Heavy': 0,
            'weight_category_Very_Heavy': 0,
            'weight_category_Ultra_Heavy': 0,
            'price_bracket_Budget': 1,
            'price_bracket_Mid': 0,
            'price_bracket_Premium': 0,
            'price_bracket_Luxury': 0,
            'price_bracket_Ultra': 0,
            'store_id_MAIN_STORE': 1,
            'store_id_STORE_1': 0,
            'store_id_STORE_2': 0,
            'store_id_STORE_3': 0,
            'store_id_STORE_4': 0,
            'store_id_STORE_5': 0,
            'store_id_STORE_6': 0,
        }
        
        # Create DataFrame
        X = pd.DataFrame([features])[model['feature_columns']]
        
        # Scale features
        X_scaled = model['scaler'].transform(X)
        
        # Make predictions
        predictions = []
        for model_name, base_model in model['base_models'].items():
            pred = base_model.predict(X_scaled)[0]
            predictions.append(pred)
        
        # Ensemble prediction
        ensemble_pred = sum(w * p for w, p in zip(model['weights'], predictions))
        
        print("✓ Prediction successful")
        print(f"  - Input: {category}, {net_weight}g, {purity}K")
        print(f"  - Predicted Sales: ₹{ensemble_pred:,.2f}")
        print(f"  - Individual predictions: {[f'₹{p:,.0f}' for p in predictions]}")
        return True
        
    except Exception as e:
        print(f"✗ Prediction failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_dependencies():
    """Test if all required modules are available"""
    print("🔍 Testing Python dependencies...")
    required_modules = [
        'fastapi',
        'uvicorn',
        'pandas',
        'numpy',
        'sklearn',
        'xgboost',
        'pydantic'
    ]
    
    all_ok = True
    for module in required_modules:
        try:
            __import__(module)
            print(f"✓ {module}")
        except ImportError:
            print(f"✗ {module} - NOT INSTALLED")
            all_ok = False
    
    return all_ok

def main():
    print("=" * 60)
    print("ML Prediction System Test")
    print("=" * 60)
    
    # Test dependencies
    deps_ok = test_api_dependencies()
    if not deps_ok:
        print("\n⚠️  Some dependencies are missing. Run:")
        print("   pip install -r requirements.txt")
        sys.exit(1)
    
    # Test model loading
    model = test_model_loading()
    if model is None:
        print("\n⚠️  Model loading failed. Check that:")
        print("   1. output/ensemble_model.pkl exists")
        print("   2. XGBoost is installed: pip install xgboost")
        print("   3. On macOS: brew install libomp")
        sys.exit(1)
    
    # Test prediction
    pred_ok = test_prediction(model)
    if not pred_ok:
        print("\n⚠️  Prediction test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All tests passed! ML prediction system is ready.")
    print("=" * 60)
    print("\nYou can now start the application with:")
    print("  npm run dev")
    print("\nOr start services separately:")
    print("  npm run dev:frontend  # Frontend on http://localhost:5173")
    print("  npm run dev:backend   # Backend on http://localhost:8000")

if __name__ == '__main__':
    main()
