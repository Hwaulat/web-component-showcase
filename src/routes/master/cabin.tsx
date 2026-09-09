import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw, Search, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
import { Table, TBody, THead, Th, Td, Tr } from "@/components/custom/data-table";
import {
  CABIN_MODELS,
  LINE_STATIONS,
  cabins,
  fmtDateTime,
  syncLogs,
} from "@/lib/mock-data";

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

  const doSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sync selesai — 24 record cabin diperbarui dari sistem sumber.");
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Master Cabin"
        description="Data cabin disinkronkan dari sistem produksi — read-only, tidak ada tambah/edit/hapus di sini."
        actions={
          <Button onClick={doSync} disabled={syncing}>
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

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode tag / ref eksternal…"
            className="w-64 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={fModel} onValueChange={setFModel}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Model</SelectItem>
            {CABIN_MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fLine} onValueChange={setFLine}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Line</SelectItem>
            {LINE_STATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <THead>
              <Tr>
                <Th column="tag" sortable>Kode / Tag Cabin</Th>
                <Th column="model" sortable>Model</Th>
                <Th column="line" sortable>Line / Stasiun</Th>
                <Th column="ref" sortable>Ref Sistem Sumber</Th>
                <Th>Status</Th>
                <Th column="sync" sortable>Terakhir Sync</Th>
              </Tr>
            </THead>
            <TBody>
              {rows.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium">{c.tagCode}</Td>
                  <Td>{c.model}</Td>
                  <Td>{c.lineStation}</Td>
                  <Td>{c.externalRefId}</Td>
                  <Td>
                    {c.isActive ? (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-500">Nonaktif</Badge>
                    )}
                  </Td>
                  <Td className="text-muted-foreground">{fmtDateTime(c.lastSyncedAt)}</Td>
                </Tr>
              ))}
              {rows.length === 0 && (
                <Tr><Td colSpan={6} className="text-center text-muted-foreground">Tidak ada cabin yang cocok dengan filter.</Td></Tr>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
