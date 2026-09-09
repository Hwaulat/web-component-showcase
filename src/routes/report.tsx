import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppTabs } from "@/components/custom/app-tabs";
import { Table, TBody, THead, Th, Td, Tr } from "@/components/custom/data-table";
import {
  CABIN_MODELS,
  STATUS_LABEL,
  cabinById,
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

type ReportType = "harian" | "manpower" | "cabin" | "hanging";

function ReportPage() {
  const [range, setRange] = useState("7");
  const [fManpower, setFManpower] = useState("all");
  const [fModel, setFModel] = useState("all");

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

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={range} onValueChange={setRange}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Hari Ini</SelectItem>
          <SelectItem value="7">7 Hari Terakhir</SelectItem>
          <SelectItem value="30">30 Hari Terakhir</SelectItem>
        </SelectContent>
      </Select>
      <Select value={fManpower} onValueChange={setFManpower}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Semua Manpower" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Manpower</SelectItem>
          {manpower.filter((m) => m.isActive).map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={fModel} onValueChange={setFModel}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Semua Model" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Model</SelectItem>
          {CABIN_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="ml-auto flex gap-2">
        <Button variant="outline" onClick={() => doExport("PDF")}>
          <FileText className="mr-1.5 h-4 w-4" /> PDF
        </Button>
        <Button onClick={() => doExport("Excel")}>
          <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
        </Button>
      </div>
    </div>
  );

  // --- Report 1: Harian ---
  const dailyRows = useMemo(() => {
    const map = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const key = fmtDate(s.startTime);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()]
      .sort((a, b) => b[1][0].startTime.getTime() - a[1][0].startTime.getTime())
      .map(([date, list]) => ({
        date,
        selesai: list.filter((s) => s.status === "completed").length,
        manpower: new Set(list.map((s) => s.manpowerId)).size,
        total: list.reduce((a, s) => a + (s.durationSeconds ?? 0), 0),
      }));
  }, [sessions]);

  const HarianReport = (
    <Table>
      <THead>
        <Tr>
          <Th column="tgl" sortable>Tanggal</Th>
          <Th column="selesai" sortable>Cabin Selesai</Th>
          <Th column="mp" sortable>Manpower Terlibat</Th>
          <Th column="durasi" sortable>Total Durasi</Th>
        </Tr>
      </THead>
      <TBody>
        {dailyRows.map((r) => (
          <Tr key={r.date}>
            <Td className="font-medium">{r.date}</Td>
            <Td>{r.selesai}</Td>
            <Td>{r.manpower}</Td>
            <Td>{fmtDuration(r.total)}</Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );

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

  const ProduktivitasReport = (
    <Table>
      <THead>
        <Tr>
          <Th>Rank</Th>
          <Th column="nama" sortable>Nama</Th>
          <Th column="cabin" sortable>Total Cabin</Th>
          <Th column="total" sortable>Total Durasi</Th>
          <Th column="avg" sortable>Rata-rata / Cabin</Th>
        </Tr>
      </THead>
      <TBody>
        {prodRows.map((r) => (
          <Tr key={r.id}>
            <Td>
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                r.rank === 1 ? "bg-amber-100 text-amber-700" : r.rank <= 3 ? "bg-muted text-foreground" : "text-muted-foreground")}>
                {r.rank}
              </span>
            </Td>
            <Td>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.nik}</p>
            </Td>
            <Td>{r.count}</Td>
            <Td>{fmtDuration(r.total)}</Td>
            <Td>{fmtDuration(Math.round(r.avg))}</Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );

  // --- Report 3: Durasi per Cabin/Model ---
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

  const CabinReport = (
    <Table>
      <THead>
        <Tr>
          <Th column="tag" sortable>Kode Cabin</Th>
          <Th column="model" sortable>Model</Th>
          <Th column="sesi" sortable>Sesi</Th>
          <Th column="total" sortable>Total Durasi</Th>
          <Th column="avg" sortable>Rata-rata</Th>
          <Th>Keterangan</Th>
        </Tr>
      </THead>
      <TBody>
        {cabinRows.map((r) => (
          <Tr key={r.tag}>
            <Td className="font-medium">{r.tag}</Td>
            <Td>{r.model}</Td>
            <Td>{r.count}</Td>
            <Td>{fmtDuration(r.total)}</Td>
            <Td>{fmtDuration(Math.round(r.avg))}</Td>
            <Td>
              {r.wajar ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Wajar</Badge>
              ) : (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Perlu investigasi</Badge>
              )}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );

  // --- Report 4: Sesi Menggantung ---
  const hangingRows = sessions.filter(
    (s) => s.status === "force_closed" || (s.status === "in_progress" && NOW_REF.getTime() - s.startTime.getTime() > 8 * 3600_000),
  );

  const HangingReport = (
    <Table>
      <THead>
        <Tr>
          <Th column="cabin" sortable>Cabin</Th>
          <Th column="mp" sortable>Manpower</Th>
          <Th column="mulai" sortable>Mulai</Th>
          <Th>Status</Th>
          <Th>Tindakan</Th>
        </Tr>
      </THead>
      <TBody>
        {hangingRows.length === 0 && (
          <Tr><Td colSpan={5} className="text-center text-muted-foreground">Tidak ada sesi menggantung pada periode ini.</Td></Tr>
        )}
        {hangingRows.map((s) => (
          <Tr key={s.id}>
            <Td className="font-medium">{cabinById(s.cabinId)?.tagCode}</Td>
            <Td>{manpowerById(s.manpowerId)?.name}</Td>
            <Td>{fmtDateTime(s.startTime)}</Td>
            <Td>
              <Badge variant="outline" className={STATUS_BADGE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
            </Td>
            <Td className="whitespace-normal text-xs text-muted-foreground">
              {s.status === "force_closed"
                ? `Ditutup paksa — ${s.forceCloseReason ?? "-"}`
                : "Menunggu tindakan supervisor"}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );

  const items: Array<{ value: ReportType; label: string; content: React.ReactNode }> = [
    { value: "harian", label: "Laporan Harian", content: HarianReport },
    { value: "manpower", label: "Produktivitas Manpower", content: ProduktivitasReport },
    { value: "cabin", label: "Durasi per Cabin/Model", content: CabinReport },
    { value: "hanging", label: "Sesi Menggantung", content: HangingReport },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Report"
        description="Report builder — pilih jenis laporan, atur parameter, preview, lalu ekspor."
      />
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Download className="h-4 w-4" /> Parameter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>{filters}</CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <AppTabs items={items} variant="underline" defaultValue="harian" />
        </CardContent>
      </Card>
    </div>
  );
}
