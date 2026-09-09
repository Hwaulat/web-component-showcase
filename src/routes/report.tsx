import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CABIN_MODELS,
  STATUS_LABEL,
  cabinById,
  fmtDate,
  fmtDateTime,
  fmtDuration,
  manpower,
  manpowerById,
  NOW_REF,
  workSessions,
  type SessionStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report — CabinTrack" },
      { name: "description", content: "Buat dan ekspor laporan perbaikan cabin: harian, produktivitas manpower, durasi per model, dan sesi menggantung." },
      { property: "og:title", content: "Report — CabinTrack" },
      { property: "og:description", content: "Buat dan ekspor laporan perbaikan cabin dalam format PDF/Excel." },
    ],
  }),
  component: ReportPage,
});

const STATUS_BADGE: Record<SessionStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  force_closed: "bg-amber-100 text-amber-700 border-amber-200",
};

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

type ReportType = "harian" | "manpower" | "cabin" | "hanging";

function ReportPage() {
  const [range, setRange] = useState("7");
  const [fManpower, setFManpower] = useState("all");
  const [fModel, setFModel] = useState("all");
  const [activeReport, setActiveReport] = useState<ReportType>("harian");
  const [searchQuery, setSearchQuery] = useState("");

  const sessions = useMemo(() => {
    const cutoff = NOW_REF.getTime() - Number(range) * 86400_000;
    return workSessions.filter((s) => {
      if (s.startTime.getTime() < cutoff) return false;
      const cabin = cabinById(s.cabinId);
      if (fManpower !== "all" && s.manpowerId !== fManpower) return false;
      if (fModel !== "all" && cabin?.model !== fModel) return false;
      return true;
    });
  }, [range, fManpower, fModel]);

  const doExport = (kind: "PDF" | "Excel") =>
    toast.success(`Laporan diekspor sebagai ${kind} (simulasi).`);

  // --- Report 1: Harian ---
  const dailyRows = useMemo(() => {
    const map = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const key = fmtDate(s.startTime);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()]
      .sort((a, b) => (b[1][0]?.startTime.getTime() ?? 0) - (a[1][0]?.startTime.getTime() ?? 0))
      .map(([date, list]) => ({
        date,
        selesai: list.filter((s) => s.status === "completed").length,
        manpower: new Set(list.map((s) => s.manpowerId)).size,
        total: list.reduce((a, s) => a + (s.durationSeconds ?? 0), 0),
      }));
  }, [sessions]);

  // --- Report 2: Produktivitas Manpower ---
  const prodRows = useMemo(() => {
    const done = sessions.filter((s) => s.status === "completed");
    return manpower
      .map((m) => {
        const mine = done.filter((s) => s.manpowerId === m.id);
        const total = mine.reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
        return { id: m.id, name: m.name, nik: m.nik, count: new Set(mine.map((s) => s.cabinId)).size, total, avg: mine.length ? total / mine.length : 0 };
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [sessions]);

  // --- Report 3: Durasi per Cabin ---
  const cabinRows = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const s of sessions) {
      if (!s.durationSeconds) continue;
      const cur = map.get(s.cabinId) ?? { count: 0, total: 0 };
      map.set(s.cabinId, { count: cur.count + 1, total: cur.total + s.durationSeconds });
    }
    const all = [...map.values()];
    const globalAvg = all.reduce((a, b) => a + b.total, 0) / Math.max(1, all.length);
    return [...map.entries()]
      .map(([cabinId, v]) => {
        const c = cabinById(cabinId)!;
        return { tag: c.tagCode, model: c.model, ...v, avg: v.total / v.count, wajar: v.total <= globalAvg * 1.5 };
      })
      .sort((a, b) => b.total - a.total);
  }, [sessions]);

  // --- Report 4: Sesi Menggantung ---
  const hangingRows = sessions.filter(
    (s) => s.status === "force_closed" || (s.status === "in_progress" && NOW_REF.getTime() - s.startTime.getTime() > 8 * 3600_000),
  );

  const harianPag = usePagination(dailyRows);
  const prodPag = usePagination(prodRows);
  const cabinPag = usePagination(cabinRows);
  const hangPag = usePagination(hangingRows);

  const tabs: { value: ReportType; label: string }[] = [
    { value: "harian", label: "Daily Report" },
    { value: "manpower", label: "Produktivitas Manpower" },
    { value: "cabin", label: "Durasi per Cabin/Model" },
    { value: "hanging", label: "Sesi Menggantung" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Report"
        description="Report builder — pilih jenis laporan, atur parameter, preview, lalu ekspor."
      />

      {/* Tabs */}
      <div className="flex gap-0 bg-slate-100 rounded-full p-1 mb-6 w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveReport(t.value)}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap",
              activeReport === t.value ? "bg-white dark:bg-slate-900 text-[#285BB2] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search..." className="pl-9 h-9 text-sm bg-white dark:bg-slate-900 border-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[150px] h-9 text-sm text-slate-500 bg-white dark:bg-slate-900"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Hari Ini</SelectItem>
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fManpower} onValueChange={setFManpower}>
            <SelectTrigger className="w-[160px] h-9 text-sm text-slate-500 bg-white dark:bg-slate-900"><SelectValue placeholder="All Manpower" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manpower</SelectItem>
              {manpower.filter((m) => m.isActive).map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fModel} onValueChange={setFModel}>
            <SelectTrigger className="w-[150px] h-9 text-sm text-slate-500 bg-white dark:bg-slate-900"><SelectValue placeholder="All Model" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Model</SelectItem>
              {CABIN_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => doExport("PDF")} className="h-9 bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
              <FileText className="mr-1.5 h-4 w-4" /> Download Report
            </Button>
            <Button onClick={() => doExport("Excel")} className="h-9 bg-[#285BB2] hover:bg-[#1E458B] text-white">
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>

        {/* Harian */}
        {activeReport === "harian" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">DATE</th>
                    <th className="px-6 py-3.5">CABIN COMPLETED</th>
                    <th className="px-6 py-3.5">MANPOWER INVOLVED</th>
                    <th className="px-6 py-3.5">TOTAL DURATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {harianPag.paged.map((r) => (
                    <tr key={r.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">

                      <td className="px-6 py-3 font-semibold text-slate-700">{r.date}</td>
                      <td className="px-6 py-3 text-slate-600">{r.selesai}</td>
                      <td className="px-6 py-3 text-slate-600">{r.manpower}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationFooter page={harianPag.page} setPage={harianPag.setPage} perPage={harianPag.perPage} setPerPage={harianPag.setPerPage} totalPages={harianPag.totalPages} total={harianPag.total} showing={harianPag.paged.length} />
          </>
        )}

        {/* Produktivitas */}
        {activeReport === "manpower" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5 w-[60px]">RANK</th>
                    <th className="px-6 py-3.5">NAME</th>
                    <th className="px-6 py-3.5">TOTAL CABIN</th>
                    <th className="px-6 py-3.5">TOTAL DURATION</th>
                    <th className="px-6 py-3.5">AVG / CABIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {prodPag.paged.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">

                      <td className="px-6 py-3">
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          r.rank === 1 ? "bg-amber-100 text-amber-700" : r.rank <= 3 ? "bg-muted text-foreground" : "text-muted-foreground")}>{r.rank}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div><span className="font-semibold text-slate-700">{r.name}</span></div>
                        <div className="text-[11px] text-slate-400">{r.nik}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{r.count}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(r.total)}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(Math.round(r.avg))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationFooter page={prodPag.page} setPage={prodPag.setPage} perPage={prodPag.perPage} setPerPage={prodPag.setPerPage} totalPages={prodPag.totalPages} total={prodPag.total} showing={prodPag.paged.length} />
          </>
        )}

        {/* Cabin */}
        {activeReport === "cabin" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">CABIN CODE</th>
                    <th className="px-6 py-3.5">MODEL</th>
                    <th className="px-6 py-3.5">SESSIONS</th>
                    <th className="px-6 py-3.5">TOTAL DURATION</th>
                    <th className="px-6 py-3.5">AVERAGE</th>
                    <th className="px-6 py-3.5">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cabinPag.paged.map((r) => (
                    <tr key={r.tag} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">

                      <td className="px-6 py-3 font-semibold text-slate-700">{r.tag}</td>
                      <td className="px-6 py-3 text-slate-600">{r.model}</td>
                      <td className="px-6 py-3 text-slate-600">{r.count}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(r.total)}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(Math.round(r.avg))}</td>
                      <td className="px-6 py-3">
                        {r.wajar ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Wajar</Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Perlu investigasi</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationFooter page={cabinPag.page} setPage={cabinPag.setPage} perPage={cabinPag.perPage} setPerPage={cabinPag.setPerPage} totalPages={cabinPag.totalPages} total={cabinPag.total} showing={cabinPag.paged.length} />
          </>
        )}

        {/* Hanging */}
        {activeReport === "hanging" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">CABIN</th>
                    <th className="px-6 py-3.5">MANPOWER</th>
                    <th className="px-6 py-3.5">START TIME</th>
                    <th className="px-6 py-3.5">STATUS</th>
                    <th className="px-6 py-3.5">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {hangPag.paged.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No pending sessions in this period.</td></tr>
                  )}
                  {hangPag.paged.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">

                      <td className="px-6 py-3 font-semibold text-slate-700">{cabinById(s.cabinId)?.tagCode}</td>
                      <td className="px-6 py-3 text-slate-600">{manpowerById(s.manpowerId)?.name}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDateTime(s.startTime)}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={STATUS_BADGE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs whitespace-normal max-w-[200px]">
                        {s.status === "force_closed" ? `Ditutup paksa — ${s.forceCloseReason ?? "-"}` : "Menunggu tindakan supervisor"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationFooter page={hangPag.page} setPage={hangPag.setPage} perPage={hangPag.perPage} setPerPage={hangPag.setPerPage} totalPages={hangPag.totalPages} total={hangPag.total} showing={hangPag.paged.length} />
          </>
        )}
      </Card>
    </div>
  );
}
