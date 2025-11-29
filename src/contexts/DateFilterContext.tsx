import { createContext, useContext, useState, ReactNode } from 'react';

interface DateFilterContextType {
  days: number;
  setDays: (days: number) => void;
  getDateRange: () => { startDate: string; endDate: string };
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<number>(30);

  const getDateRange = () => {
    // Use the data's actual date range (Aug 1 - Oct 31, 2025)
    // Set end date to the last date in the dataset
    const endDate = new Date('2025-10-31');
    const startDate = new Date('2025-10-31');
    startDate.setDate(startDate.getDate() - days);
    
    const range = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    // Debug logging
    console.log('🗓️ Date Filter:', { days, ...range });
    
    return range;
  };

  return (
    <DateFilterContext.Provider value={{ days, setDays, getDateRange }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}
