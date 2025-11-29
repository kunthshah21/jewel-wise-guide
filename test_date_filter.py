#!/usr/bin/env python3
"""
Test script to verify date filtering is working correctly
"""
import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_backend_running():
    """Check if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running")
        print("   Start it with: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_date_filtering():
    """Test date filtering with different ranges"""
    if not test_backend_running():
        return
    
    print("\n" + "="*60)
    print("Testing Date Filtering")
    print("="*60)
    
    # Test cases with the actual data range (Aug 1 - Oct 31, 2025)
    test_cases = [
        {
            'days': 30,
            'start_date': '2025-10-01',
            'end_date': '2025-10-31',
            'label': 'Last 30 days (Oct)'
        },
        {
            'days': 60,
            'start_date': '2025-09-01',
            'end_date': '2025-10-31',
            'label': 'Last 60 days (Sep-Oct)'
        },
        {
            'days': 90,
            'start_date': '2025-08-01',
            'end_date': '2025-10-31',
            'label': 'Last 90 days (Aug-Oct)'
        },
    ]
    
    for test in test_cases:
        print(f"\n{test['label']}:")
        print(f"  Date range: {test['start_date']} to {test['end_date']}")
        
        # Test KPIs endpoint
        params = {
            'start_date': test['start_date'],
            'end_date': test['end_date']
        }
        
        try:
            response = requests.get(f"{BASE_URL}/api/kpis/summary", params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Total Stock Value: ₹{data['totalStockValue']:,.2f}")
                print(f"     Total Items: {data['totalItems']}")
                print(f"     Ageing Stock: {data['ageingStock']}")
                print(f"     Fast Moving: {data['fastMovingItems']}")
            else:
                print(f"  ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n" + "="*60)
    print("Testing Inventory Categories")
    print("="*60)
    
    for test in test_cases[:2]:  # Just test two ranges
        print(f"\n{test['label']}:")
        params = {
            'start_date': test['start_date'],
            'end_date': test['end_date']
        }
        
        try:
            response = requests.get(f"{BASE_URL}/api/inventory/categories", params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Categories found: {len(data)}")
                for cat in data[:3]:  # Show first 3
                    print(f"     {cat['category']}: ₹{cat['stockValue']:,.2f}")
            else:
                print(f"  ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {e}")

if __name__ == "__main__":
    test_date_filtering()
