<<<<<<< HEAD
import { Menu, Calendar, Filter } from "lucide-react";
=======
import { Menu, Bell, Calendar, Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";
>>>>>>> parent of b660909 (Reverted to commit 3c906b6c4f88194db85be0f1c5b601550854e2cd)
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
<<<<<<< HEAD
import { useFilter } from "@/contexts/FilterContext";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
=======
import { useDashboardCustomization } from "@/contexts/DashboardCustomizationContext";
>>>>>>> parent of b660909 (Reverted to commit 3c906b6c4f88194db85be0f1c5b601550854e2cd)

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

<<<<<<< HEAD
export const Header = ({ onMenuClick }: HeaderProps) => {
  const { timePeriod, setTimePeriod } = useFilter();
  const { toast } = useToast();

  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    const periodLabel = {
      "7": "7 days",
      "30": "30 days",
      "90": "90 days",
      "365": "1 year"
    }[value] || value;

    toast({
      title: "Data filter updated",
      description: `Showing data for the last ${periodLabel}`,
      duration: 2000,
    });
  };
=======
export const Header = ({ onMenuClick, sidebarOpen }: HeaderProps) => {
  const location = useLocation();
  const { isCustomizeMode, toggleCustomizeMode } = useDashboardCustomization();
  const isDashboard = location.pathname === "/";
>>>>>>> parent of b660909 (Reverted to commit 3c906b6c4f88194db85be0f1c5b601550854e2cd)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className={sidebarOpen ? "md:hidden" : ""}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Active Filter</span>
          </div>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[140px] border-none bg-transparent text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
<<<<<<< HEAD
=======

      <div className="flex items-center gap-2">
        {isDashboard && (
          <Button 
            variant={isCustomizeMode ? "default" : "ghost"} 
            size="sm"
            onClick={toggleCustomizeMode}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Customise
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
>>>>>>> parent of b660909 (Reverted to commit 3c906b6c4f88194db85be0f1c5b601550854e2cd)
    </header>
  );
};
