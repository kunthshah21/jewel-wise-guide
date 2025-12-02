import { Menu, Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardCustomization } from "@/contexts/DashboardCustomizationContext";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export const Header = ({ onMenuClick, sidebarOpen }: HeaderProps) => {
  const location = useLocation();
  const { isCustomizeMode, toggleCustomizeMode } = useDashboardCustomization();
  const isDashboard = location.pathname === "/";

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
      </div>

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
      </div>
    </header>
  );
};
