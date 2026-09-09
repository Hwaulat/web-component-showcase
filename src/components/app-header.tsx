import { Bell, ChevronDown, PanelLeft, Moon, Sun, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isDark, setIsDark] = useState(false);

  // Optional: A real-time clock could go here if needed, keeping dummy for now
  const time = "16:16:07";
  const dateStr = "Wednesday, September 9, 2026";

  useEffect(() => {
    // If you have a real dark mode implementation, you'd toggle a class on <html> here
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white dark:bg-slate-900 px-5 transition-colors">
      {/* LEFT SIDE */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <PanelLeft className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-4"></div>
      </div>
      
      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none">
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white border-2 border-white dark:border-slate-900">
                9+
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">New user registered</span>
                <span className="text-xs text-slate-500">2 minutes ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">Cabin X completed</span>
                <span className="text-xs text-slate-500">1 hour ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-blue-600 cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex flex-col items-end leading-tight mr-2">
          <span className="text-[13px] font-bold text-[#1E458B] dark:text-blue-400">{time}</span>
          <span className="text-[11px] text-slate-400">{dateStr}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity pl-4 border-l border-slate-200 dark:border-slate-700 outline-none">
              <div className="h-8 w-8 overflow-hidden rounded-full">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" 
                  alt="admin" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">admin</span>
                <span className="text-[11px] text-slate-400">Super Admin</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 opacity-70" strokeWidth={2} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-0" sideOffset={12}>
            <div className="px-4 py-3 flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-700">admin</p>
              <p className="text-xs text-slate-500">admin@gmail.com</p>
            </div>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1">
              <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-slate-600">
                <User className="mr-3 h-4 w-4" strokeWidth={1.5} />
                <span className="text-[13px]">Profile</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1">
              <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-3 h-4 w-4" strokeWidth={1.5} />
                <span className="text-[13px]">Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
