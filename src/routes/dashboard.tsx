import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader,
  Timer,
  Users,
  AlertTriangle,
  Ban,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CABIN_MODELS,
  LINE_STATIONS,
  STATUS_LABEL,
  cabinById,
  cabins,
  fmtDate,
  fmtDateTime,
  fmtDuration,
  isSameDay,
  manpower,
  manpowerById,
  NOW_REF,
  workSessions,
  type SessionStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CabinTrack" },
      { name: "description", content: "Pantau cabin diperbaiki, sesi aktif, durasi rata-rata, dan produktivitas manpower secara real-time." },
      { property: "og:title", content: "Dashboard — CabinTrack" },
      { property: "og:description", content: "Pantau cabin diperbaiki, sesi aktif, durasi rata-rata, dan produktivitas manpower secara real-time." },
    ],
  }),
  component: DashboardPage,
});

const STATUS_BADGE: Record<SessionStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  force_closed: "bg-amber-100 text-amber-700 border-amber-200",
};

const PIE_COLORS = ["#285BB2", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#EC4899"];

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
    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
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
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled={page <= 1} onClick={() => setPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        {pages.map(p => (
          <Button key={p} variant="outline" size="icon" onClick={() => setPage(p)} className={cn("h-8 w-8 rounded", p === page ? "bg-[#285BB2] text-white border-[#285BB2] hover:bg-[#1E458B]" : "bg-white text-slate-500 border-slate-200")}>{p}</Button>
        ))}
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled={page >= totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [range, setRange] = useState("7");
  const [fManpower, setFManpower] = useState("all");
  const [fModel, setFModel] = useState("all");
  const [fLine, setFLine] = useState("all");
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const [forceCloseTarget, setForceCloseTarget] = useState<string | null>(null);
  const [forceReason, setForceReason] = useState("");
  const [searchManpower, setSearchManpower] = useState("");
  const [searchCabin, setSearchCabin] = useState("");
  const [summaryTab, setSummaryTab] = useState<"manpower" | "cabin">("manpower");

  const filtered = useMemo(
    () =>
      workSessions.filter((s) => {
        const cabin = cabinById(s.cabinId);
        if (!cabin) return false;
        if (fManpower !== "all" && s.manpowerId !== fManpower) return false;
        if (fModel !== "all" && cabin.model !== fModel) return false;
        if (fLine !== "all" && cabin.lineStation !== fLine) return false;
        return true;
      }),
    [fManpower, fModel, fLine],
  );

  const todaySessions = filtered.filter((s) => isSameDay(s.startTime, NOW_REF));
  const completedToday = todaySessions.filter((s) => s.status === "completed");
  const inProgress = filtered.filter(
    (s) => s.status === "in_progress" && !closedIds.includes(s.id),
  );
  const hanging = inProgress.filter(
    (s) => NOW_REF.getTime() - s.startTime.getTime() > 8 * 3600_000,
  );
  const avgToday =
    completedToday.length > 0
      ? completedToday.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / completedToday.length
      : 0;
  const activeManpower = new Set(todaySessions.map((s) => s.manpowerId)).size;

  const trend = useMemo(() => {
    const days = Number(range);
    const out: Array<{ date: string; selesai: number; rataRata: number | null }> = [];
    const windowVals: number[] = [];
    for (let d = days - 1; d >= 0; d--) {
      const day = new Date(NOW_REF.getTime() - d * 86400_000);
      const count = filtered.filter(
        (s) => s.status === "completed" && s.endTime && isSameDay(s.endTime, day),
      ).length;
      windowVals.push(count);
      const w = windowVals.slice(-7);
      out.push({
        date: fmtDate(day),
        selesai: count,
        rataRata: Math.round((w.reduce((a, b) => a + b, 0) / w.length) * 10) / 10,
      });
    }
    return out;
  }, [filtered, range]);

  const manpowerSummary = useMemo(() => {
    const done = filtered.filter((s) => s.status === "completed");
    return manpower
      .map((m) => {
        const mine = done.filter((s) => s.manpowerId === m.id);
        const total = mine.reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
        return {
          id: m.id, name: m.name, nik: m.nik,
          cabinCount: new Set(mine.map((s) => s.cabinId)).size,
          totalDuration: total, avg: mine.length ? total / mine.length : 0,
        };
      })
      .filter((r) => r.cabinCount > 0)
      .sort((a, b) => b.cabinCount - a.cabinCount);
  }, [filtered]);

  const cabinSummary = useMemo(() => {
    const avgDuration =
      filtered.filter((s) => s.durationSeconds).reduce((a, s) => a + (s.durationSeconds ?? 0), 0) /
        Math.max(1, filtered.filter((s) => s.durationSeconds).length);
    return cabins
      .map((c) => {
        const mine = filtered.filter((s) => s.cabinId === c.id);
        if (!mine.length) return null;
        const total = mine.reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
        const last = [...mine].sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
        if (!last) return null;
        return {
          id: c.id, tagCode: c.tagCode, model: c.model,
          sessions: mine.length, totalDuration: total, status: last.status,
          aboveAvg: mine.some((s) => (s.durationSeconds ?? 0) > avgDuration * 1.5),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.totalDuration - a.totalDuration);
  }, [filtered]);

  const modelChart = useMemo(
    () =>
      CABIN_MODELS.map((model) => {
        const ids = cabins.filter((c) => c.model === model).map((c) => c.id);
        const sessions = filtered.filter(
          (s) => ids.includes(s.cabinId) && s.durationSeconds,
        );
        const avg =
          sessions.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / Math.max(1, sessions.length);
        return { model: model.replace("Cabin ", ""), menit: Math.round(avg / 60) };
      }),
    [filtered],
  );

  const kpis = [
    { label: "Cabin Diperbaiki Hari Ini", value: completedToday.length, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Sedang Dikerjakan", value: inProgress.length, icon: Loader, tone: "text-blue-600 bg-blue-50" },
    { label: "Rata-rata Durasi / Cabin", value: fmtDuration(Math.round(avgToday)), icon: Timer, tone: "text-violet-600 bg-violet-50" },
    { label: "Manpower Aktif Hari Ini", value: activeManpower, icon: Users, tone: "text-cyan-600 bg-cyan-50" },
    { label: "Sesi Menggantung", value: hanging.length, icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" },
  ];

  const filteredManpowerSummary = manpowerSummary.filter(r => {
    const q = searchManpower.toLowerCase();
    return !q || r.name.toLowerCase().includes(q) || r.nik.toLowerCase().includes(q);
  });

  const filteredCabinSummary = cabinSummary.filter(r => {
    const q = searchCabin.toLowerCase();
    return !q || r.tagCode.toLowerCase().includes(q) || r.model.toLowerCase().includes(q);
  });

  const mpPag = usePagination(filteredManpowerSummary);
  const cbPag = usePagination(filteredCabinSummary);

  const target = forceCloseTarget ? workSessions.find((s) => s.id === forceCloseTarget) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Dashboard"
        description="Monitoring real-time pengerjaan perbaikan cabin berdasarkan data scan RFID/barcode."
        actions={
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="14">14 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-start gap-3 p-4">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", k.tone)}>
                <k.icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts: Tren (Area) + Durasi per Model (Pie) side by side */}
      <div className="mt-4 flex flex-col xl:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tren Cabin Diperbaiki per Hari</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="selesai" name="Cabin selesai" stroke="var(--primary)" fill="url(#gradSelesai)" strokeWidth={2} />
                <Area type="monotone" dataKey="rataRata" name="Rata-rata bergerak" stroke="var(--chart-2)" strokeDasharray="5 4" fill="none" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="w-full xl:w-[450px] shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Rata-rata Durasi per Model Cabin</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelChart}
                  dataKey="menit"
                  nameKey="model"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  strokeWidth={2}
                  label={({ model, menit }) => `${model}: ${menit}m`}
                >
                  {modelChart.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 }} formatter={(v: number) => `${v} menit`} />
                <Legend verticalAlign="bottom" height={30} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Combined Summary Table with Pill Tabs */}
      <Card className="mt-4 rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 flex flex-wrap items-center gap-4 border-b border-slate-100">
          {/* Pill Tablist */}
          <div className="flex gap-0 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setSummaryTab("manpower")}
              className={cn(
                "px-5 py-2 text-sm font-semibold rounded-full transition-colors",
                summaryTab === "manpower" ? "bg-white text-[#285BB2] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Summary per Manpower
            </button>
            <button
              onClick={() => setSummaryTab("cabin")}
              className={cn(
                "px-5 py-2 text-sm font-semibold rounded-full transition-colors",
                summaryTab === "cabin" ? "bg-white text-[#285BB2] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Summary per Cabin
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={summaryTab === "manpower" ? "Search by name or NIK" : "Search by tag code or model"}
                className="pl-9 h-9 text-sm bg-white border-slate-200"
                value={summaryTab === "manpower" ? searchManpower : searchCabin}
                onChange={(e) => summaryTab === "manpower" ? setSearchManpower(e.target.value) : setSearchCabin(e.target.value)}
              />
            </div>
            {summaryTab === "manpower" && (
              <Select value={fManpower} onValueChange={setFManpower}>
                <SelectTrigger className="w-[160px] h-9 text-sm text-slate-500 bg-white"><SelectValue placeholder="All Manpower" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manpower</SelectItem>
                  {manpower.filter((m) => m.isActive).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {summaryTab === "cabin" && (
              <>
                <Select value={fModel} onValueChange={setFModel}>
                  <SelectTrigger className="w-[160px] h-9 text-sm text-slate-500 bg-white"><SelectValue placeholder="All Model" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Model</SelectItem>
                    {CABIN_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fLine} onValueChange={setFLine}>
                  <SelectTrigger className="w-[140px] h-9 text-sm text-slate-500 bg-white"><SelectValue placeholder="All Line" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Line</SelectItem>
                    {LINE_STATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {/* Manpower Tab */}
        {summaryTab === "manpower" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">NAME</th>
                    <th className="px-6 py-3.5">CABIN COUNT</th>
                    <th className="px-6 py-3.5">TOTAL DURATION</th>
                    <th className="px-6 py-3.5">AVERAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mpPag.paged.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3">
                        <div><span className="font-semibold text-slate-700">{r.name}</span></div>
                        <div className="text-[11px] text-slate-400">{r.nik}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{r.cabinCount}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(r.totalDuration)}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(Math.round(r.avg))}</td>
                    </tr>
                  ))}
                  {filteredManpowerSummary.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No data found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationFooter page={mpPag.page} setPage={mpPag.setPage} perPage={mpPag.perPage} setPerPage={mpPag.setPerPage} totalPages={mpPag.totalPages} total={mpPag.total} showing={mpPag.paged.length} />
          </>
        )}

        {/* Cabin Tab */}
        {summaryTab === "cabin" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">CABIN</th>
                    <th className="px-6 py-3.5">MODEL</th>
                    <th className="px-6 py-3.5">SESSIONS</th>
                    <th className="px-6 py-3.5">TOTAL DURATION</th>
                    <th className="px-6 py-3.5">LAST STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cbPag.paged.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-semibold text-slate-700">{r.tagCode}</span>
                        {r.aboveAvg && (
                          <Badge variant="outline" className="ml-2 border-amber-300 bg-amber-50 text-amber-700">Di atas rata-rata</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{r.model}</td>
                      <td className="px-6 py-3 text-slate-600">{r.sessions}</td>
                      <td className="px-6 py-3 text-slate-600">{fmtDuration(r.totalDuration)}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredCabinSummary.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No data found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationFooter page={cbPag.page} setPage={cbPag.setPage} perPage={cbPag.perPage} setPerPage={cbPag.setPerPage} totalPages={cbPag.totalPages} total={cbPag.total} showing={cbPag.paged.length} />
          </>
        )}
      </Card>

      {/* Dialog tutup paksa */}
      <Dialog open={!!target} onOpenChange={(o) => !o && setForceCloseTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutup Paksa Sesi</DialogTitle>
            <DialogDescription>
              Sesi {target ? cabinById(target.cabinId)?.tagCode : ""} oleh{" "}
              {target ? manpowerById(target.manpowerId)?.name : ""} akan ditutup paksa.
              Alasan akan tercatat di audit log.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan force close, mis. teknisi lupa scan selesai saat pulang…"
            value={forceReason}
            onChange={(e) => setForceReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceCloseTarget(null)}>Batal</Button>
            <Button
              disabled={forceReason.trim().length < 5}
              onClick={() => {
                if (target) setClosedIds((p) => [...p, target.id]);
                setForceCloseTarget(null);
                toast.success("Sesi ditutup paksa dan tercatat di audit log.");
              }}
            >
              Tutup Paksa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
