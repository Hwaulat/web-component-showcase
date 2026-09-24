import { Bell, ChevronDown, PanelLeft, Moon, Sun, User, LogOut, Clock } from "lucide-react";
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

  const notifications = [
    {
      id: 1,
      title: "Maintenance Plan",
      description: "Tester01 created new maintenance plan",
      time: "about 22 hours ago",
      unread: true
    },
    {
      id: 2,
      title: "Sparepart Order Request",
      description: "Tester01 successfully update all PO",
      time: "about 23 hours ago",
      unread: true
    },
    {
      id: 3,
      title: "Sparepart Order Request",
      description: "admin created new SOR, must update PO",
      time: "1 day ago",
      unread: true
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white border-2 border-white dark:border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px] p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-[14px]">Notifications</span>
                <span className="text-[12px] text-slate-500 font-medium mt-0.5">{unreadCount} unread notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full border border-red-200 bg-red-50 px-4 py-0.5 text-[12px] font-medium text-red-600 dark:bg-red-500/10 dark:border-red-500/20">
                  {unreadCount} New
                </span>
              )}
            </div>
            
            <DropdownMenuSeparator className="m-0" />
            
            <div className="flex flex-col max-h-[350px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer rounded-none border-b border-slate-100 dark:border-slate-800 ${
                    notification.unread 
                      ? "bg-[#F4F7FB] hover:bg-[#EBF1F8] focus:bg-[#EBF1F8] dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:focus:bg-slate-800" 
                      : "bg-white hover:bg-slate-50 focus:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <Clock className="h-[18px] w-[18px] text-[#4F46E5] dark:text-indigo-400" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 leading-none">{notification.title}</span>
                    <span className="text-[12px] text-slate-500 leading-none">{notification.description}</span>
                    <span className="text-[11px] text-slate-400 leading-none">{notification.time}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-b-md">
              <button className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 text-[13px] font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                View All Notification
              </button>
            </div>
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
