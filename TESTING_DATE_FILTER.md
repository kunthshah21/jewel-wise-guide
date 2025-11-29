# Testing Guide: Date Filter Feature

## Quick Start

1. **Start the Python Backend** (in one terminal):
   ```bash
   cd /Users/kunthshah/Desktop/jewel-wise-guide
   python main.py
   ```
   
   Expected output:
   ```
   Loading data files...
   ✓ Sales data loaded: 740 records
   ✓ Ensemble model loaded
   ✓ Data loaded successfully
     - Inventory items: 250
     - Predictions: 250
   ```

2. **Start the Frontend** (in another terminal):
   ```bash
   cd /Users/kunthshah/Desktop/jewel-wise-guide
   npm run dev
   ```

3. **Open the app**: Navigate to `http://localhost:5173`

## Test Scenarios

### Test 1: Date Filter Dropdown
**Location**: Header (top navigation bar)

1. Click on the date dropdown (default shows "Last 30 days")
2. Select "Last 7 days"
3. **Expected**: All data on the dashboard refreshes

### Test 2: Dashboard KPIs
**Location**: Dashboard page (home)

1. Note the values of:
   - Total Stock Value
   - Ageing Stock
   - Predicted Deadstock
   - Fast Moving Items

2. Change date filter to "Last 90 days"
3. **Expected**: 
   - Values should change
   - Stock value should increase (more sales data)
   - Item counts should adjust

### Test 3: Inventory Categories
**Location**: Dashboard > Stock Distribution Chart

1. Note the bar chart values for each category
2. Change date filter to "Last 7 days"
3. **Expected**:
   - Bar heights should change
   - Values should be lower (less time period)

### Test 4: Inventory Page
**Location**: Inventory page (sidebar)

1. Navigate to Inventory page
2. Note the category cards and their metrics
3. Change date filter to "Last 60 days"
4. **Expected**:
   - Stock values update
   - Ageing metrics recalculate
   - Risk scores adjust

### Test 5: Market Trends
**Location**: Market page (sidebar)

1. Navigate to Market page
2. Note the trending categories
3. Change date filter to "Last 90 days"
4. **Expected**:
   - Trend percentages update
   - Risk indicators may change

### Test 6: Data Persistence
**Action**: Refresh the page

1. Set date filter to "Last 60 days"
2. Navigate to different pages
3. Refresh the browser
4. **Expected**:
   - Date filter resets to default (Last 30 days)
   - *Note*: Persistence not yet implemented

## Backend Testing

### Test Date Filtering Endpoint
```bash
# Test KPIs with date range
curl "http://localhost:8000/api/kpis/summary?start_date=2025-10-01&end_date=2025-10-31"

# Test inventory categories with date range
curl "http://localhost:8000/api/inventory/categories?start_date=2025-09-01&end_date=2025-09-30"

# Test market trends with date range
curl "http://localhost:8000/api/market/trends?start_date=2025-08-01&end_date=2025-08-31"
```

### Expected Behavior
- Different date ranges return different aggregated values
- Shorter date ranges = lower totals
- Longer date ranges = higher totals

## Edge Cases

### Edge Case 1: No Backend
1. Stop the Python backend (Ctrl+C)
2. Refresh the frontend
3. **Expected**: App falls back to static JSON data (no date filtering)

### Edge Case 2: Invalid Date Range
1. Use browser DevTools to inspect network calls
2. Check that dates are in YYYY-MM-DD format
3. **Expected**: Properly formatted date strings

### Edge Case 3: Rapid Changes
1. Quickly change the date filter multiple times
2. **Expected**: React Query handles debouncing/caching properly

## Validation Checklist

- [ ] Date dropdown is visible in header
- [ ] Date selection updates global state
- [ ] Dashboard KPIs change with date filter
- [ ] Inventory page updates with date filter
- [ ] Market page updates with date filter
- [ ] Backend receives correct date parameters
- [ ] Backend filters data correctly
- [ ] No console errors
- [ ] No network errors
- [ ] Build succeeds without warnings

## Known Limitations

1. **Static Fallback**: If backend is down, the app uses static JSON which doesn't support date filtering
2. **Chart Data**: Some chart time-series data is still placeholder (would need historical snapshots)
3. **Persistence**: Date selection doesn't persist across page refreshes (future enhancement)
4. **Date Range Validation**: No validation that start_date < end_date (backend assumes correct input)

## Troubleshooting

### Issue: Data doesn't update when changing date
**Solution**: 
- Check browser console for errors
- Verify backend is running on port 8000
- Check Network tab for failed API calls

### Issue: Backend returns empty data
**Solution**:
- Verify sales data CSV is loaded correctly
- Check date range includes sales data (data is from Aug-Oct 2025)
- Check backend logs for errors

### Issue: Build fails
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run type-check`
- Review the error message carefully

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Data changes dynamically with date selection
✅ Backend returns filtered data
✅ Frontend renders updated data correctly
