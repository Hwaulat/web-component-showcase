import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Pencil, Plus, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppTabs } from "@/components/custom/app-tabs";
import { Table, TBody, THead, Th, Td, Tr } from "@/components/custom/data-table";
import { appUsers, fmtDateTime, manpower, type AppUser } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users Management — CabinTrack" },
      { name: "description", content: "Kelola akun yang punya akses login ke aplikasi serta matriks role dan permission." },
      { property: "og:title", content: "Users Management — CabinTrack" },
      { property: "og:description", content: "Kelola akun login aplikasi serta matriks role dan permission." },
    ],
  }),
  component: UsersPage,
});

const ROLE_LABEL: Record<AppUser["role"], string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  manpower: "Manpower",
};
const ROLE_BADGE: Record<AppUser["role"], string> = {
  admin: "border-violet-200 bg-violet-50 text-violet-700",
  supervisor: "border-blue-200 bg-blue-50 text-blue-700",
  manpower: "border-slate-200 bg-slate-50 text-slate-700",
};

const PERMISSIONS = [
  { modul: "Dashboard", manpower: [false, false], supervisor: [true, false], admin: [true, true] },
  { modul: "Report", manpower: [false, false], supervisor: [true, true], admin: [true, true] },
  { modul: "Master Data", manpower: [false, false], supervisor: [true, false], admin: [true, true] },
  { modul: "Users Management", manpower: [false, false], supervisor: [false, false], admin: [true, true] },
  { modul: "Mobile App (Scan)", manpower: [true, true], supervisor: [false, false], admin: [true, true] },
];

function PermIcon({ on }: { on: boolean }) {
  return on ? (
    <Check className="h-4 w-4 text-emerald-600" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground/50" />
  );
}

function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(appUsers);
  const [search, setSearch] = useState("");
  const [fRole, setFRole] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ source: "roster", manpowerId: "", name: "", role: "manpower" as AppUser["role"], active: true });

  const rows = users.filter((u) => {
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !(u.nik ?? "").toLowerCase().includes(q)) return false;
    if (fRole !== "all" && u.role !== fRole) return false;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ source: "roster", manpowerId: "", name: "", role: "manpower", active: true });
    setDialogOpen(true);
  };
  const openEdit = (u: AppUser) => {
    setEditing(u);
    setForm({
      source: u.manpowerId ? "roster" : "custom",
      manpowerId: u.manpowerId ?? "",
      name: u.name,
      role: u.role,
      active: u.isActive,
    });
    setDialogOpen(true);
  };

  const save = () => {
    const picked = manpower.find((m) => m.id === form.manpowerId);
    const name = form.source === "roster" ? (picked?.name ?? "") : form.name.trim();
    if (!name) return;
    if (editing) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? { ...u, name, role: form.role, isActive: form.active, manpowerId: form.source === "roster" ? form.manpowerId : null, nik: picked?.nik ?? null }
            : u,
        ),
      );
      toast.success("Akun diperbarui.");
    } else {
      setUsers((prev) => [
        { id: `usr-${Date.now()}`, manpowerId: form.source === "roster" ? form.manpowerId : null, name, nik: picked?.nik ?? null, role: form.role, isActive: form.active, lastLoginAt: null },
        ...prev,
      ]);
      toast.success("Akun baru ditambahkan.");
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  const AkunTab = (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama / NIK…" className="w-64 pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={fRole} onValueChange={setFRole}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="manpower">Manpower</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-auto" onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> Tambah Akun
        </Button>
      </div>

      <Table>
        <THead>
          <Tr>
            <Th column="nama" sortable>Nama</Th>
            <Th column="nik" sortable>NIK</Th>
            <Th column="role" sortable>Role</Th>
            <Th>Status</Th>
            <Th column="login" sortable>Terakhir Login</Th>
            <Th>Aksi</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.map((u) => (
            <Tr key={u.id}>
              <Td className="font-medium">{u.name}</Td>
              <Td className="text-muted-foreground">{u.nik ?? "—"}</Td>
              <Td><Badge variant="outline" className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Switch checked={u.isActive} onCheckedChange={() => toggleActive(u.id)} />
                  <span className="text-xs text-muted-foreground">{u.isActive ? "Aktif" : "Nonaktif"}</span>
                </div>
              </Td>
              <Td className="text-muted-foreground">{fmtDateTime(u.lastLoginAt)}</Td>
              <Td>
                <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </>
  );

  const RoleTab = (
    <Table>
      <THead>
        <Tr>
          <Th>Modul</Th>
          <Th className="text-center">Manpower — Lihat</Th>
          <Th className="text-center">Manpower — Kelola</Th>
          <Th className="text-center">Supervisor — Lihat</Th>
          <Th className="text-center">Supervisor — Kelola</Th>
          <Th className="text-center">Admin — Lihat</Th>
          <Th className="text-center">Admin — Kelola</Th>
        </Tr>
      </THead>
      <TBody>
        {PERMISSIONS.map((p) => (
          <Tr key={p.modul}>
            <Td className="font-medium">{p.modul}</Td>
            {[...p.manpower, ...p.supervisor, ...p.admin].map((on, i) => (
              <Td key={i}>
                <div className="flex justify-center"><PermIcon on={on} /></div>
              </Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Users Management"
        description="Mengatur akun yang punya akses login — berbeda dari roster Master Data Manpower."
      />

      <Card>
        <CardContent className="pt-6">
          <AppTabs
            variant="underline"
            defaultValue="akun"
            items={[
              { value: "akun", label: "Akun Pengguna", badge: users.length, content: AkunTab },
              { value: "role", label: "Role & Permission", icon: <ShieldCheck />, content: RoleTab },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Akun" : "Tambah Akun"}</DialogTitle>
            <DialogDescription>
              Pilih dari roster Master Data Manpower agar konsisten, atau buat akun khusus untuk Supervisor/Admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Sumber Akun</Label>
              <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="roster">Dari roster Manpower</SelectItem>
                  <SelectItem value="custom">Akun khusus (Supervisor/Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.source === "roster" ? (
              <div className="space-y-1.5">
                <Label>Manpower</Label>
                <Select value={form.manpowerId} onValueChange={(v) => setForm((f) => ({ ...f, manpowerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih dari roster…" /></SelectTrigger>
                  <SelectContent>
                    {manpower.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nik} — {m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Nama Lengkap</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="mis. Surya Supervisor" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as AppUser["role"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manpower">Manpower — akses mobile app saja</SelectItem>
                  <SelectItem value="supervisor">Supervisor — akses web</SelectItem>
                  <SelectItem value="admin">Admin — akses penuh + sync manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>PIN / Password Awal</Label>
              <Input type="password" placeholder="••••••" />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <span className="text-sm">Akun aktif</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
