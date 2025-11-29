# ML Prediction Setup Guide

## Issue Resolution

The sales prediction feature requires proper setup of XGBoost and its dependencies. Follow these steps to ensure everything works correctly.

## Prerequisites Installation

### 1. Install XGBoost and Dependencies

```bash
# Install Python dependencies
python -m pip install -r requirements.txt

# Install XGBoost specifically
python -m pip install xgboost --upgrade
```

### 2. Install OpenMP Library (macOS only)

On macOS, XGBoost requires the OpenMP library:

```bash
# Install using Homebrew
brew install libomp
```

**For Linux users:** OpenMP is usually pre-installed. If not:
```bash
sudo apt-get install libgomp1
```

**For Windows users:** OpenMP is included with Visual C++ runtime.

### 3. Verify Model Loading

Test that the model can be loaded correctly:

```bash
cd /Users/kunthshah/Desktop/jewel-wise-guide
python -c "import pickle; model = pickle.load(open('output/ensemble_model.pkl', 'rb')); print('✓ Model loaded successfully')"
```

You should see: `✓ Model loaded successfully`

## Starting the Application

### Option 1: Single Command (Recommended)

```bash
npm run dev
```

This starts both:
- Frontend on http://localhost:5173
- Backend API on http://localhost:8000

### Option 2: Separate Terminals

Terminal 1 - Frontend:
```bash
npm run dev:frontend
```

Terminal 2 - Backend:
```bash
npm run dev:backend
# or directly: python main.py
```

## Testing Sales Predictions

1. Navigate to **Sales Predictions** page in the sidebar
2. Fill in the form:
   - Category: Select from dropdown (RING, CHAIN, etc.)
   - Net Weight: e.g., 5.0 grams
   - Voucher Date: Select today's date
   - Purity: Select 18K, 22K, or 24K
   - Store ID: Keep default "MAIN_STORE"
3. Click **Predict Sales Value**
4. You should see the predicted value in rupees

## Troubleshooting

### Error: "Model not loaded"
- Ensure Python backend is running on http://localhost:8000
- Check backend logs for any errors during startup
- Verify model file exists: `ls -lh output/ensemble_model.pkl`

### Error: "ModuleNotFoundError: No module named 'xgboost'"
```bash
python -m pip install xgboost
```

### Error: "Library not loaded: @rpath/libomp.dylib" (macOS)
```bash
brew install libomp
```

### Error: "Failed to fetch" or network errors
- Ensure backend is running on port 8000
- Check if another service is using port 8000:
  ```bash
  lsof -i :8000
  ```
- Kill the process if needed and restart

### Scikit-learn Version Warning
The warning about "InconsistentVersionWarning" is expected and won't affect predictions. It's because the model was trained with a newer version of scikit-learn.

To eliminate warnings:
```bash
python -m pip install scikit-learn==1.7.2 --upgrade
```

## Verification Checklist

- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] XGBoost installed (`python -m pip install xgboost`)
- [ ] OpenMP installed (macOS: `brew install libomp`)
- [ ] Model loads successfully (run verification command above)
- [ ] Backend starts without errors (`python main.py`)
- [ ] Backend health check works: `curl http://localhost:8000/health`
- [ ] Frontend starts: `npm run dev:frontend`
- [ ] Can access predictions page at http://localhost:5173/predictions
- [ ] Can make a test prediction successfully

## Expected Backend Output on Startup

```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
Loading data files...
✓ Ensemble model loaded
✓ Data loaded successfully
  - Inventory items: 250
  - Predictions: 623
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## API Endpoints

Test these endpoints once backend is running:

```bash
# Health check
curl http://localhost:8000/health

# Get KPIs
curl http://localhost:8000/api/kpis/summary

# Get inventory categories
curl http://localhost:8000/api/inventory/categories

# Make a prediction
curl -X POST http://localhost:8000/api/predict/sales \
  -H "Content-Type: application/json" \
  -d '{
    "category": "RING",
    "net_weight": 5.0,
    "voucher_date": "2025-11-29",
    "purity": 22.0,
    "store_id": "MAIN_STORE"
  }'
```

## Need Help?

If you're still experiencing issues after following these steps:

1. Check the backend terminal for error messages
2. Check the browser console (F12) for frontend errors
3. Verify all prerequisites are installed
4. Try restarting both frontend and backend
