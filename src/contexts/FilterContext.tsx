import { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
  timePeriod: string;
  setTimePeriod: (period: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [timePeriod, setTimePeriod] = useState("30");

  return (
    <FilterContext.Provider value={{ timePeriod, setTimePeriod }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};

