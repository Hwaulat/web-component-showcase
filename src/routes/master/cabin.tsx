import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw, Search, CheckCircle2, XCircle, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
import {
  CABIN_MODELS,
  LINE_STATIONS,
  cabins,
  fmtDateTime,
  syncLogs,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/master/cabin")({
  head: () => ({
    meta: [
      { title: "Master Cabin — CabinTrack" },
      { name: "description", content: "Data master cabin tersinkron dari sistem produksi (read-only)." },
      { property: "og:title", content: "Master Cabin — CabinTrack" },
      { property: "og:description", content: "Data master cabin tersinkron dari sistem produksi (read-only)." },
    ],
  }),
  component: MasterCabinPage,
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

function MasterCabinPage() {
  const [search, setSearch] = useState("");
  const [fModel, setFModel] = useState("all");
  const [fLine, setFLine] = useState("all");
  const [syncing, setSyncing] = useState(false);

  const lastSync = syncLogs.find((l) => l.entityType === "cabin" && l.status === "success");
  const lastFailed = syncLogs.find((l) => l.entityType === "cabin" && l.status === "failed");

  const rows = useMemo(
    () =>
      cabins.filter((c) => {
        const q = search.toLowerCase();
        if (q && !c.tagCode.toLowerCase().includes(q) && !c.externalRefId.toLowerCase().includes(q)) return false;
        if (fModel !== "all" && c.model !== fModel) return false;
        if (fLine !== "all" && c.lineStation !== fLine) return false;
        return true;
      }),
    [search, fModel, fLine],
  );

  const pag = usePagination(rows);

  const doSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sync selesai — 24 record cabin diperbarui dari sistem sumber.");
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Master Cabin"
        description="Data cabin disinkronkan dari sistem produksi — read-only, tidak ada tambah/edit/hapus di sini."
        actions={
          <Button onClick={doSync} disabled={syncing} className="bg-[#285BB2] hover:bg-[#1E458B] text-white">
            <RefreshCw className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Menyinkronkan…" : "Sync Sekarang"}
          </Button>
        }
      />

      {/* Status sync */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Terakhir sync: {lastSync ? fmtDateTime(lastSync.startedAt) : "—"} · {lastSync?.recordsSynced ?? 0} record
        </Badge>
        {lastFailed && (
          <Badge variant="outline" className="border-red-200 bg-red-50 px-3 py-1.5 text-red-700">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Percobaan sebelumnya gagal: {lastFailed.errorMessage} ({fmtDateTime(lastFailed.startedAt)})
          </Badge>
        )}
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by tag code or ref ID"
              className="pl-9 h-9 text-sm bg-white border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={fModel} onValueChange={setFModel}>
            <SelectTrigger className="w-[150px] h-9 text-sm text-slate-500 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Model</SelectItem>
              {CABIN_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fLine} onValueChange={setFLine}>
            <SelectTrigger className="w-[130px] h-9 text-sm text-slate-500 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Line</SelectItem>
              {LINE_STATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-center w-[120px]">ACTION</th>
                <th className="px-6 py-3.5">TAG CODE</th>
                <th className="px-6 py-3.5">MODEL</th>
                <th className="px-6 py-3.5">LINE / STATION</th>
                <th className="px-6 py-3.5">REF EXTERNAL</th>
                <th className="px-6 py-3.5">STATUS</th>
                <th className="px-6 py-3.5">LAST SYNC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pag.paged.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="p-1.5 text-slate-400 hover:text-[#285BB2] hover:bg-blue-50 rounded transition-colors border border-slate-200 shadow-sm bg-white"><Eye className="h-4 w-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-[#285BB2] hover:bg-blue-50 rounded transition-colors border border-slate-200 shadow-sm bg-white"><Pencil className="h-4 w-4" /></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-slate-200 shadow-sm bg-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-semibold text-slate-700">{c.tagCode}</td>
                  <td className="px-6 py-3 text-slate-600">{c.model}</td>
                  <td className="px-6 py-3 text-slate-600">{c.lineStation}</td>
                  <td className="px-6 py-3 text-slate-600">{c.externalRefId}</td>
                  <td className="px-6 py-3">
                    {c.isActive ? (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-500">Nonaktif</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-400">{fmtDateTime(c.lastSyncedAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Tidak ada cabin yang cocok dengan filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationFooter page={pag.page} setPage={pag.setPage} perPage={pag.perPage} setPerPage={pag.setPerPage} totalPages={pag.totalPages} total={pag.total} showing={pag.paged.length} />
      </Card>
    </div>
  );
}
