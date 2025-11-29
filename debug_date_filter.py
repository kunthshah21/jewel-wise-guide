#!/usr/bin/env python3
"""
Quick debug script to check if backend is running and date filtering works
"""
import sys
import requests
from datetime import datetime

BASE_URL = "http://localhost:8000"

def main():
    print("=" * 70)
    print("🔍 DEBUGGING DATE FILTER")
    print("=" * 70)
    print()
    
    # Test 1: Check if backend is running
    print("TEST 1: Backend Status")
    print("-" * 70)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is RUNNING on {BASE_URL}")
            print(f"   Status: {data.get('status')}")
            print(f"   Data loaded: {data.get('data_loaded')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
        else:
            print(f"⚠️  Backend responded with status {response.status_code}")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend is NOT RUNNING")
        print(f"   Cannot connect to {BASE_URL}")
        print()
        print("👉 START THE BACKEND:")
        print("   Terminal 1: python main.py")
        print()
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    
    print()
    
    # Test 2: Test date filtering with different ranges
    print("TEST 2: Date Filtering")
    print("-" * 70)
    
    test_cases = [
        ('2025-10-01', '2025-10-31', 'Last 30 days'),
        ('2025-09-01', '2025-10-31', 'Last 60 days'),
        ('2025-08-01', '2025-10-31', 'Last 90 days'),
    ]
    
    results = []
    for start, end, label in test_cases:
        params = {'start_date': start, 'end_date': end}
        try:
            response = requests.get(f"{BASE_URL}/api/kpis/summary", params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                total = data['totalStockValue']
                results.append(total)
                print(f"✅ {label:15} Stock Value: ₹{total:,.2f}")
            else:
                print(f"❌ {label:15} Failed: HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ {label:15} Error: {e}")
    
    print()
    print("-" * 70)
    
    # Test 3: Verify values are DIFFERENT
    print("TEST 3: Values Check")
    print("-" * 70)
    
    if len(results) >= 3:
        if results[0] == results[1] == results[2]:
            print("❌ PROBLEM: All values are THE SAME!")
            print("   This means date filtering is NOT working")
            print()
            print("   Expected:")
            print("   - Last 30 days: ~₹158M")
            print("   - Last 60 days: ~₹302M")
            print("   - Last 90 days: ~₹454M")
        elif results[0] < results[1] < results[2]:
            print("✅ SUCCESS: Values are DIFFERENT and INCREASING!")
            print("   Date filtering is working correctly!")
        else:
            print("⚠️  Values are different but not in expected order")
            print("   Last 30 < Last 60 < Last 90 expected")
    
    print()
    print("=" * 70)
    print("🎯 WHAT TO DO NEXT:")
    print("=" * 70)
    
    if len(results) >= 3 and results[0] < results[1] < results[2]:
        print("✅ Backend is working! Now check the frontend:")
        print()
        print("1. Open http://localhost:5173 in your browser")
        print("2. Open DevTools (F12) → Console tab")
        print("3. Look for these log messages:")
        print("   🗓️ Date Filter: { days: 30, startDate: '...', endDate: '...' }")
        print("   📡 Fetching KPIs from: http://localhost:8000/api/kpis/summary?...")
        print("   ✅ KPI Data from backend: { totalStockValue: ... }")
        print()
        print("4. Change the date dropdown and verify:")
        print("   - Console shows new date range")
        print("   - API is called with new dates")
        print("   - Total Stock Value updates")
    else:
        print("❌ Backend date filtering has issues")
        print()
        print("Check backend logs for errors")
    
    print()

if __name__ == "__main__":
    main()
