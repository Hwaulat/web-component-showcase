import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileBarChart,
  Database,
  Users2,
  ScanBarcode,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppSidebar({ className, isOpen = true }: { className?: string, isOpen?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const masterActive = pathname.startsWith("/master");
  const [masterOpen, setMasterOpen] = useState(true);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex-col bg-[#0B1527] text-slate-300 md:flex shadow-xl transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <ScanBarcode className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold text-white tracking-wide">CabinTrack</span>
          <span className="text-[11px] font-medium text-blue-400">Repair Monitoring</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="px-4 pb-4 space-y-6 text-sm font-medium">
          
          {/* MENU */}
          <div>
            <div className="mb-3 px-2 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                CORE MENU
              </span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <div className="space-y-1">
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "bg-[#285BB2] text-white"
                    : "hover:bg-[#16233B] hover:text-white"
                )}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/report"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  pathname.startsWith("/report")
                    ? "bg-[#285BB2] text-white"
                    : "hover:bg-[#16233B] hover:text-white"
                )}
              >
                <FileBarChart className="h-4.5 w-4.5" />
                <span>Report</span>
              </Link>

              <div className={cn("rounded-lg overflow-hidden transition-colors", masterActive ? "bg-[#16233B]" : "")}>
                <button
                  onClick={() => setMasterOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-[#1C2C45] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-4.5 w-4.5" />
                    <span className={masterActive ? "text-white" : ""}>Master Data</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", !masterOpen && "-rotate-90")} />
                </button>
                
                {masterOpen && (
                  <div className="relative ml-5 pl-4 py-1 space-y-1 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-slate-700">
                    <Link
                      to="/master/cabin"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        pathname === "/master/cabin"
                          ? "bg-[#2557B3] text-white"
                          : "hover:bg-[#1C2C45] hover:text-white"
                      )}
                    >
                      <span>Cabin</span>
                    </Link>
                    <Link
                      to="/master/manpower"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        pathname === "/master/manpower"
                          ? "bg-[#2557B3] text-white"
                          : "hover:bg-[#1C2C45] hover:text-white"
                      )}
                    >
                      <span>Manpower</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/users"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  pathname.startsWith("/users")
                    ? "bg-[#285BB2] text-white"
                    : "hover:bg-[#16233B] hover:text-white"
                )}
              >
                <Users2 className="h-4.5 w-4.5" />
                <span>Users Management</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
            <span>System Online</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
