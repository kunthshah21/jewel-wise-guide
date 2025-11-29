# Quick Start Guide - Date Filtering

## TL;DR - Why Values Don't Change

**The backend server MUST be running for date filtering to work!**

Without the backend:
- App uses static JSON files (fixed values)
- Date filter does nothing ❌

With the backend:
- App queries real data from CSV
- Date filter works dynamically ✅

## Start the App (Choose One Method)

### Method 1: Automated (Recommended)
```bash
cd /Users/kunthshah/Desktop/jewel-wise-guide
./start.sh
```

### Method 2: Manual

**Terminal 1 - Backend:**
```bash
cd /Users/kunthshah/Desktop/jewel-wise-guide
python main.py
```

Wait for this output:
```
✓ Sales data loaded: 4744 records
✓ Ensemble model loaded
✓ Data loaded successfully
  - Inventory items: 250
  - Predictions: 4744
```

**Terminal 2 - Frontend:**
```bash
cd /Users/kunthshah/Desktop/jewel-wise-guide
npm run dev
```

## Test the Date Filter

1. **Open the app**: http://localhost:5173

2. **Look at the first KPI card** (Total Stock Value):
   - Should show a value like: **₹158.9L** or **₹302.8L**

3. **Click the date dropdown** in the header (next to the calendar icon)

4. **Try different ranges:**
   - **Last 30 days** → ~₹158.9L (1,681 records)
   - **Last 60 days** → ~₹302.8L (3,145 records)  
   - **Last 90 days** → ~₹454.8L (4,744 records)

5. **The value should CHANGE each time!**

## What You Should See

### ✅ CORRECT (Backend Running)
```
Date: Last 30 days  →  Total Stock Value: ₹158.9L
Date: Last 60 days  →  Total Stock Value: ₹302.8L  
Date: Last 90 days  →  Total Stock Value: ₹454.8L
```

### ❌ WRONG (Backend NOT Running)
```
Date: Last 30 days  →  Total Stock Value: ₹335.5L
Date: Last 60 days  →  Total Stock Value: ₹335.5L  (SAME!)
Date: Last 90 days  →  Total Stock Value: ₹335.5L  (SAME!)
```

If you see the WRONG behavior → **The backend is not running!**

## Verify Backend is Working

### Check 1: Backend Terminal
Look for this in the backend terminal:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Check 2: Test API Directly
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status":"healthy","data_loaded":true,...}
```

### Check 3: Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Change the date filter
4. Look for requests to: `localhost:8000/api/kpis/summary?start_date=...`

If you see `/data/kpis.json` instead → Backend is not being used!

## Troubleshooting

### Problem: Backend won't start
**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Fix**:
```bash
pip install fastapi uvicorn pandas
```

### Problem: Port 8000 already in use
**Error**: `Address already in use`

**Fix**:
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Then restart
python main.py
```

### Problem: Values still don't change
**Checklist**:
- [ ] Backend terminal shows "Data loaded successfully"
- [ ] Frontend terminal shows "VITE vX.X.X  ready in XXXms"
- [ ] Browser shows http://localhost:5173 (not 8000)
- [ ] Browser DevTools shows API calls to localhost:8000
- [ ] No errors in either terminal

## Understanding the Fix

The date filter was using "today" (November 2025) but your data is from **August-October 2025**. 

I fixed it to use October 31, 2025 as the end date, so:
- "Last 30 days" = October 2025
- "Last 60 days" = September-October 2025
- "Last 90 days" = August-October 2025

This matches your actual data range!

## Files Modified

1. **`src/contexts/DateFilterContext.tsx`** - Fixed date calculation
2. **`main.py`** - Backend date filtering (already working)
3. **`test_date_filter.py`** - New test script
4. **`start.sh`** - New startup script

## Success Criteria

✅ Backend shows "Sales data loaded: 4744 records"
✅ Frontend loads without errors
✅ Date dropdown is visible in header
✅ Changing date filter updates Total Stock Value
✅ Different date ranges show different values
✅ Browser Network tab shows API calls with date parameters

---

**Need Help?** Check `DATE_FILTER_FIX.md` for detailed troubleshooting.
