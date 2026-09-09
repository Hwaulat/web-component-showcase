import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, RotateCw, Pencil, Trash2, Users2, UserCheck, UserX, Search, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

type ShowcaseUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone: string;
  isActive: boolean;
  avatarSeed: string;
};

const initialUsers: ShowcaseUser[] = [
  { id: "1", name: "Tester01", email: "tester01@gmail.com", role: "Warehouse", department: "MECHANICAL", position: "Manager", phone: "085263547687", isActive: true, avatarSeed: "tester01" },
  { id: "2", name: "Tester PIC", email: "qwerty@gmail.com", role: "PIC", department: "MECHANICAL", position: "Supervisor", phone: "081200000", isActive: true, avatarSeed: "testerpic" },
  { id: "3", name: "admin", email: "admin@gmail.com", role: "SUPER ADMIN", department: "MECHANICAL", position: "Supervisor", phone: "089313212196", isActive: true, avatarSeed: "admin" },
];

function UsersPage() {
  const [users, setUsers] = useState<ShowcaseUser[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    position: "",
    phone: "",
    isActive: true,
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      role: "",
      department: "",
      position: "",
      phone: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name || !form.email) {
      toast.error("Nama dan Email harus diisi.");
      return;
    }

    if (editingId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? { ...u, ...form }
            : u
        )
      );
      toast.success("User berhasil diperbarui.");
    } else {
      const newUser: ShowcaseUser = {
        ...form,
        id: `usr-${Date.now()}`,
        avatarSeed: form.name.replace(/\s+/g, "").toLowerCase(),
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success("User baru berhasil ditambahkan.");
    }
    setDialogOpen(false);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User berhasil dihapus.");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
          <Users2 className="h-5 w-5" />
          Users Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage users, roles, and permissions</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button className="px-5 py-2 text-sm font-semibold rounded-full border border-blue-200 text-blue-600 bg-white shadow-sm">
          User Account
        </button>
        <button className="px-5 py-2 text-sm font-semibold rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          Role Permission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-5 flex items-center gap-4 rounded-xl border-slate-200 shadow-sm">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-2xl font-bold text-[#285BB2]">{totalUsers}</p>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center gap-4 rounded-xl border-slate-200 shadow-sm">
          <div className="p-3.5 bg-green-50 text-green-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 rounded-xl border-slate-200 shadow-sm">
          <div className="p-3.5 bg-orange-50 text-orange-500 rounded-xl">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Inactive Users</p>
            <p className="text-2xl font-bold text-orange-500">{inactiveUsers}</p>
          </div>
        </Card>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by username or email" 
              className="pl-9 h-9 text-sm bg-white border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <Select defaultValue="all-role">
              <SelectTrigger className="w-[130px] h-9 text-sm text-slate-500 bg-white">
                <SelectValue placeholder="All Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-role">All Role</SelectItem>
                <SelectItem value="SUPER ADMIN">SUPER ADMIN</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="PIC">PIC</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-dept">
              <SelectTrigger className="w-[150px] h-9 text-sm text-slate-500 bg-white">
                <SelectValue placeholder="All Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-dept">All Department</SelectItem>
                <SelectItem value="MECHANICAL">MECHANICAL</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-pos">
              <SelectTrigger className="w-[130px] h-9 text-sm text-slate-500 bg-white">
                <SelectValue placeholder="All Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pos">All Position</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={openNew} className="h-9 bg-[#285BB2] hover:bg-[#1E458B] text-white rounded-md font-medium shadow-sm ml-2">
              <Plus className="h-4 w-4 mr-1.5" /> Create New User
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-center w-[160px]">ACTION</th>
                <th className="px-6 py-3.5 text-center w-[80px]">STATUS</th>
                <th className="px-6 py-3.5">USERNAME</th>
                <th className="px-6 py-3.5">ROLE</th>
                <th className="px-6 py-3.5">DEPARTMENT</th>
                <th className="px-6 py-3.5">POSITION</th>
                <th className="px-6 py-3.5">PHONE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="p-1.5 text-slate-400 hover:text-[#285BB2] hover:bg-blue-50 rounded transition-colors border border-slate-200 shadow-sm bg-white">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-[#285BB2] hover:bg-blue-50 rounded transition-colors border border-slate-200 shadow-sm bg-white">
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(u.id);
                          setForm({ ...u });
                          setDialogOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#285BB2] hover:bg-blue-50 rounded transition-colors border border-slate-200 shadow-sm bg-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-slate-200 shadow-sm bg-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center">
                      <Switch 
                        checked={u.isActive} 
                        onCheckedChange={(val) => setUsers(prev => prev.map(user => user.id === u.id ? { ...user, isActive: val } : user))}
                        className="data-[state=checked]:bg-[#285BB2]"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed}`}
                        alt={u.name}
                        className="h-9 w-9 rounded-full bg-slate-200 object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{u.name}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{u.role}</td>
                  <td className="px-6 py-3 text-slate-600">{u.department}</td>
                  <td className="px-6 py-3 text-slate-600">{u.position}</td>
                  <td className="px-6 py-3 text-slate-600">{u.phone}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
          <div className="flex items-center gap-3">
            <span>Rows per page</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-[70px] h-8 bg-slate-50 border-slate-200">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-2">1-{filteredUsers.length} of {filteredUsers.length}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-[#285BB2] text-white border-[#285BB2] hover:bg-[#1E458B]">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-white text-slate-400 border-slate-200" disabled>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit User" : "Create New User"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Username</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="col-span-3"
                placeholder="Name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="col-span-3"
                placeholder="Email address"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <div className="col-span-3">
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER ADMIN">SUPER ADMIN</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="PIC">PIC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">Department</Label>
              <div className="col-span-3">
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECHANICAL">MECHANICAL</SelectItem>
                    <SelectItem value="ELECTRICAL">ELECTRICAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="col-span-3"
                placeholder="Position (e.g. Supervisor)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="col-span-3"
                placeholder="Phone number"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label className="text-right">Status</Label>
              <div className="col-span-3 flex items-center gap-3">
                <Switch 
                  checked={form.isActive} 
                  onCheckedChange={(val) => setForm({ ...form, isActive: val })}
                  className="data-[state=checked]:bg-[#285BB2]"
                />
                <span className="text-sm text-slate-500">{form.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-[#285BB2] hover:bg-[#1E458B] text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
