import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  FileText,
  Calendar,
  Settings,
  DollarSign,
  PlusCircle,
  Package,
  CheckCircle2,
  Database,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppSidebar({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [sparepartOpen, setSparepartOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0B1527] text-slate-300 md:flex shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-300 to-blue-600" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold text-white tracking-wide">JSGI - Maintenance</span>
          <span className="text-[11px] font-medium text-blue-400">Management System</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="px-4 pb-4 space-y-6 text-sm font-medium">
          
          {/* CORE FUNCTIONS */}
          <div>
            <div className="mb-3 px-2 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                CORE FUNCTIONS
              </span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <div className="space-y-1">
              <div className={cn("rounded-lg overflow-hidden transition-colors", dashboardOpen ? "bg-[#16233B]" : "")}>
                <button
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-white hover:bg-[#1C2C45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="h-4.5 w-4.5" />
                    <span>Dashboard</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", !dashboardOpen && "-rotate-90")} />
                </button>
                
                {dashboardOpen && (
                  <div className="relative ml-5 pl-4 py-1 space-y-1 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-slate-700">
                    <Link
                      to="/dashboard/trouble-report"
                      className="flex items-center gap-3 rounded-md px-3 py-2 bg-[#2557B3] text-white"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Trouble Report</span>
                    </Link>
                    <Link
                      to="/dashboard/work-order"
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[#1C2C45] hover:text-white transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Work Order</span>
                    </Link>
                    <Link
                      to="/dashboard/mtc-plan"
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[#1C2C45] hover:text-white transition-colors"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>MTC. Plan</span>
                    </Link>
                    <Link
                      to="/dashboard/sparepart"
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[#1C2C45] hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Sparepart</span>
                    </Link>
                    <Link
                      to="/dashboard/cost"
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[#1C2C45] hover:text-white transition-colors"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Cost</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/workflow-approval" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <Settings className="h-4.5 w-4.5" />
                <span>Workflow Approval</span>
              </Link>
              <Link to="/trouble-report" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <FileText className="h-4.5 w-4.5" />
                <span>Trouble Report</span>
              </Link>
              <Link to="/maintenance-plan" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <Calendar className="h-4.5 w-4.5" />
                <span>Maintenance Plan</span>
              </Link>
              <Link to="/work-order" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Work Order</span>
              </Link>
              
              <button
                onClick={() => setSparepartOpen(!sparepartOpen)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4.5 w-4.5" />
                  <span>Sparepart</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", !sparepartOpen && "-rotate-90")} />
              </button>

              <Link to="/approval" className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>Approval</span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  1
                </span>
              </Link>
            </div>
          </div>

          {/* REPORT & DOCUMENTATION */}
          <div>
            <div className="mb-3 px-2 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                REPORT & DOCUMENTATION
              </span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4.5 w-4.5" />
                  <span>Reports</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", !reportsOpen && "-rotate-90")} />
              </button>
              
              <Link to="/documentation" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <FileText className="h-4.5 w-4.5" />
                <span>Documentation</span>
              </Link>
            </div>
          </div>

          {/* SETUP SYSTEM */}
          <div>
            <div className="mb-3 px-2 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                SETUP SYSTEM
              </span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setMasterDataOpen(!masterDataOpen)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="h-4.5 w-4.5" />
                  <span>Master Data</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", !masterDataOpen && "-rotate-90")} />
              </button>
              
              <Link to="/users" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#16233B] hover:text-white transition-colors">
                <User className="h-4.5 w-4.5" />
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
          <span>v2.4.1</span>
        </div>
      </div>
    </aside>
  );
}
