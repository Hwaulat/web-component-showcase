import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw, Search, CheckCircle2 } from "lucide-react";
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
import { fmtDateTime, manpower, syncLogs } from "@/lib/mock-data";

export const Route = createFileRoute("/master/manpower")({
  head: () => ({
    meta: [
      { title: "Master Manpower — CabinTrack" },
      { name: "description", content: "Roster manpower tersinkron dari sistem HR (read-only)." },
      { property: "og:title", content: "Master Manpower — CabinTrack" },
      { property: "og:description", content: "Roster manpower tersinkron dari sistem HR (read-only)." },
    ],
  }),
  component: MasterManpowerPage,
});

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

  const doSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sync selesai — 8 record manpower diperbarui dari sistem HR.");
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Master Manpower"
        description="Roster sumber dari sistem HR — read-only. Pengaturan akun login ada di Users Management."
        actions={
          <Button onClick={doSync} disabled={syncing}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Menyinkronkan…" : "Sync Sekarang"}
          </Button>
        }
      />

      <div className="mb-4">
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Terakhir sync: {lastSync ? fmtDateTime(lastSync.startedAt) : "—"} · {lastSync?.recordsSynced ?? 0} record
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama / NIK…"
            className="w-64 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={fDept} onValueChange={setFDept}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Departemen</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <THead>
              <Tr>
                <Th column="nik" sortable>NIK</Th>
                <Th column="nama" sortable>Nama</Th>
                <Th column="dept" sortable>Departemen</Th>
                <Th>Status</Th>
                <Th column="sync" sortable>Terakhir Sync</Th>
              </Tr>
            </THead>
            <TBody>
              {rows.map((m) => (
                <Tr key={m.id}>
                  <Td className="font-medium">{m.nik}</Td>
                  <Td>{m.name}</Td>
                  <Td>{m.department}</Td>
                  <Td>
                    {m.isActive ? (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-500">Nonaktif</Badge>
                    )}
                  </Td>
                  <Td className="text-muted-foreground">{fmtDateTime(m.lastSyncedAt)}</Td>
                </Tr>
              ))}
              {rows.length === 0 && (
                <Tr><Td colSpan={5} className="text-center text-muted-foreground">Tidak ada manpower yang cocok dengan filter.</Td></Tr>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
