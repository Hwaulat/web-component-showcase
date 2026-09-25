import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw, Search, CheckCircle2, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtDateTime, manpower, syncLogs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/master/manpower")({
  head: () => ({
    meta: [
      { title: "Master Manpower — CabinTrack" },
      { name: "description", content: "Manpower roster synced from HR system (read-only)." },
      { property: "og:title", content: "Master Manpower — CabinTrack" },
      { property: "og:description", content: "Manpower roster synced from HR system (read-only)." },
    ],
  }),
  component: MasterManpowerPage,
});

function usePagination<T>(data: T[], defaultPerPage = 10) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const safeP = Math.min(page, totalPages);
  const paged = data.slice((safeP - 1) * perPage, safeP * perPage);
  return { page: safeP, setPage, perPage, setPerPage, totalPages, paged, total: data.length };
}

function PaginationFooter({ page, setPage, perPage, setPerPage, totalPages, total, showing }: {
  page: number; setPage: (p: number) => void; perPage: number; setPerPage: (p: number) => void; totalPages: number; total: number; showing: number;
}) {
  const start = (page - 1) * perPage + 1;
  const end = start + showing - 1;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });
  return (
    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span>Rows per page</span>
        <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-[70px] h-8 bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-2">{start}-{end} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white dark:bg-slate-900 text-slate-400 border-slate-200" disabled={page <= 1} onClick={() => setPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white dark:bg-slate-900 text-slate-400 border-slate-200" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        {pages.map(p => (
          <Button key={p} variant="outline" size="icon" onClick={() => setPage(p)} className={cn("h-8 w-8 rounded", p === page ? "bg-[#285BB2] text-white border-[#285BB2] hover:bg-[#1E458B]" : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200")}>{p}</Button>
        ))}
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white dark:bg-slate-900 text-slate-400 border-slate-200" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white dark:bg-slate-900 text-slate-400 border-slate-200" disabled={page >= totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function MasterManpowerPage() {
  const [search, setSearch] = useState("");
  const [fDept, setFDept] = useState("all");
  const [syncing, setSyncing] = useState(false);

  const departments = useMemo(() => [...new Set(manpower.map((m) => m.department))], []);
  const lastSync = syncLogs.find((l) => l.entityType === "manpower" && l.status === "success");

  const rows = manpower.filter((m) => {
    const q = search.toLowerCase();
    if (q && !m.name.toLowerCase().includes(q) && !m.nik.toLowerCase().includes(q)) return false;
    if (fDept !== "all" && m.department !== fDept) return false;
    return true;
  });

  const pag = usePagination(rows);

  const doSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sync completed — 8 manpower records updated from the HR system.");
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Master Manpower"
        description="Source roster from HR system — read-only. Login account settings are in Users Management."
        actions={
          <Button onClick={doSync} disabled={syncing} className="bg-[#285BB2] hover:bg-[#1E458B] text-white">
            <RefreshCw className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        }
      />

      <div className="mb-4">
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Last sync: {lastSync ? fmtDateTime(lastSync.startedAt) : "—"} · {lastSync?.recordsSynced ?? 0} record
        </Badge>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px] w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or NIK"
              className="pl-9 h-9 text-sm bg-white dark:bg-slate-900 border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={fDept} onValueChange={setFDept}>
            <SelectTrigger className="w-[180px] h-9 text-sm text-slate-500 bg-white dark:bg-slate-900"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Department</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3.5">NIK</th>
                <th className="px-6 py-3.5">NAME</th>
                <th className="px-6 py-3.5">DEPARTMENT</th>
                <th className="px-6 py-3.5">STATUS</th>
                <th className="px-6 py-3.5">LAST SYNC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pag.paged.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-700">{m.nik}</td>
                  <td className="px-6 py-3 text-slate-600">{m.name}</td>
                  <td className="px-6 py-3 text-slate-600">{m.department}</td>
                  <td className="px-6 py-3">
                    {m.isActive ? (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-500">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-400">{fmtDateTime(m.lastSyncedAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No manpower matched the filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationFooter page={pag.page} setPage={pag.setPage} perPage={pag.perPage} setPerPage={pag.setPerPage} totalPages={pag.totalPages} total={pag.total} showing={pag.paged.length} />
      </Card>
    </div>
  );
}
