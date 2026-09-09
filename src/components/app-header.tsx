import { Bell, ChevronDown, Menu, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 hover:bg-accent text-muted-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative rounded-md p-2 hover:bg-accent text-muted-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              9+
            </span>
          </button>

          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" 
                alt="admin" 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="hidden flex-col items-start lg:flex">
              <span className="text-sm font-semibold leading-none">admin</span>
              <span className="text-xs text-muted-foreground mt-1">Super Admin</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="hidden h-6 w-px bg-border lg:block"></div>

        <div className="flex items-center gap-4">
          <button className="rounded-md p-2 hover:bg-accent text-muted-foreground transition-colors">
            <Moon className="h-5 w-5" />
          </button>
          
          <div className="hidden flex-col items-end lg:flex">
            <span className="text-sm font-bold text-foreground">15:13:27</span>
            <span className="text-xs text-muted-foreground">Wednesday, September 9, 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
}
