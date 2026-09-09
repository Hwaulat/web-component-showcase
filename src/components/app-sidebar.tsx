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

const linkCls = (active: boolean) =>
  cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-primary"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
  );

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const masterActive = pathname.startsWith("/master");
  const [masterOpen, setMasterOpen] = useState(true);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ScanBarcode className="h-4.5 w-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">CabinTrack</p>
          <p className="text-[11px] text-muted-foreground">Monitoring Perbaikan Cabin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link to="/dashboard" className={linkCls(pathname.startsWith("/dashboard"))}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link to="/report" className={linkCls(pathname.startsWith("/report"))}>
          <FileBarChart className="h-4 w-4" />
          Report
        </Link>

        <button
          onClick={() => setMasterOpen((v) => !v)}
          className={cn(linkCls(masterActive), "w-full justify-between")}
        >
          <span className="flex items-center gap-2.5">
            <Database className="h-4 w-4" />
            Master Data
          </span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", masterOpen && "rotate-180")}
          />
        </button>
        {masterOpen && (
          <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3">
            <Link to="/master/cabin" className={linkCls(pathname === "/master/cabin")}>
              Cabin
            </Link>
            <Link to="/master/manpower" className={linkCls(pathname === "/master/manpower")}>
              Manpower
            </Link>
          </div>
        )}

        <Link to="/users" className={linkCls(pathname.startsWith("/users"))}>
          <Users2 className="h-4 w-4" />
          Users Management
        </Link>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            HA
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium text-sidebar-foreground">Hartono Admin</p>
            <p className="text-[11px] text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
