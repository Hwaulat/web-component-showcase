import { Bell, ChevronDown, PanelLeft, Moon } from "lucide-react";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
      {/* LEFT SIDE */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <PanelLeft className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="h-6 w-px bg-slate-200 mx-4"></div>
      </div>
      
      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">
        <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Moon className="h-5 w-5" strokeWidth={1.5} />
        </button>
        
        <button className="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white border-2 border-white">
            9+
          </span>
        </button>
        
        <div className="flex flex-col items-end leading-tight mr-2">
          <span className="text-[13px] font-bold text-[#1E458B]">16:16:07</span>
          <span className="text-[11px] text-slate-400">Wednesday, September 9, 2026</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity pl-4 border-l border-slate-200">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" 
              alt="admin" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[13px] font-semibold text-slate-800">admin</span>
            <span className="text-[11px] text-slate-400">Super Admin</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 opacity-70" strokeWidth={2} />
        </div>
      </div>
    </header>
  );
}
