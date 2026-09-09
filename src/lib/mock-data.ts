// Data mock untuk UI web monitoring perbaikan cabin.
// Di produksi, data ini berasal dari database (cabins, manpower, work_sessions, app_users, sync_logs).

export interface Cabin {
  id: string;
  tagCode: string;
  model: string;
  lineStation: string;
  externalRefId: string;
  lastSyncedAt: Date;
  isActive: boolean;
}

export interface Manpower {
  id: string;
  nik: string;
  name: string;
  department: string;
  isActive: boolean;
  lastSyncedAt: Date;
}

export type SessionStatus = "in_progress" | "completed" | "force_closed";

export interface WorkSession {
  id: string;
  cabinId: string;
  manpowerId: string;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number | null;
  status: SessionStatus;
  forceClosedBy?: string | undefined;
  forceCloseReason?: string | undefined;
  createdOffline: boolean;
}

export interface AppUser {
  id: string;
  manpowerId: string | null;
  name: string;
  nik: string | null;
  role: "manpower" | "supervisor" | "admin";
  isActive: boolean;
  lastLoginAt: Date | null;
}

export interface SyncLog {
  id: string;
  entityType: "cabin" | "manpower";
  triggeredBy: "scheduled" | "manual";
  status: "success" | "failed";
  recordsSynced: number;
  errorMessage: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}

export const CABIN_MODELS = ["Cabin Standard", "Cabin Deluxe", "Cabin Heavy Duty"];
export const LINE_STATIONS = ["Line A", "Line B", "Line C"];

// RNG deterministik supaya data stabil antar render
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;

const NOW = new Date("2026-09-09T14:00:00+07:00");
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number, hourJitter = 10) =>
  new Date(NOW.getTime() - n * DAY - Math.floor(rand() * hourJitter) * 3600_000);

const SYNC_TIME = new Date(NOW.getTime() - 45 * 60_000);

const MANPOWER_NAMES: Array<[string, string]> = [
  ["NIK-1001", "Budi Santoso"],
  ["NIK-1002", "Agus Wijaya"],
  ["NIK-1003", "Rina Marlina"],
  ["NIK-1004", "Dedi Kurniawan"],
  ["NIK-1005", "Siti Rahayu"],
  ["NIK-1006", "Joko Prasetyo"],
  ["NIK-1007", "Ahmad Fauzi"],
  ["NIK-1008", "Dewi Lestari"],
];
const DEPARTMENTS = ["Perbaikan Cabin", "Perakitan", "Quality Control"];

export const manpower: Manpower[] = MANPOWER_NAMES.map(([nik, name], i) => ({
  id: `mp-${i + 1}`,
  nik,
  name,
  department: pick(DEPARTMENTS),
  isActive: i !== 7,
  lastSyncedAt: SYNC_TIME,
}));

export const cabins: Cabin[] = Array.from({ length: 24 }, (_, i) => ({
  id: `cb-${i + 1}`,
  tagCode: `CBN-${String(i + 1).padStart(3, "0")}`,
  model: CABIN_MODELS[i % 3]!,
  lineStation: LINE_STATIONS[i % 3]!,
  externalRefId: `EXT-CB-${1000 + i}`,
  lastSyncedAt: SYNC_TIME,
  isActive: i !== 23,
}));

// Bangkitkan work sessions 30 hari terakhir
function buildSessions(): WorkSession[] {
  const sessions: WorkSession[] = [];
  let seq = 1;
  for (let d = 30; d >= 0; d--) {
    const perDay = d === 0 ? 4 : 3 + Math.floor(rand() * 5); // hari ini belum selesai semua
    for (let s = 0; s < perDay; s++) {
      const cabin = pick(cabins);
      const worker = pick(manpower.filter((m) => m.isActive));
      const start = daysAgo(d, 8);
      const durMin = 25 + Math.floor(rand() * 150);
      const completed = d > 0 ? rand() > 0.06 : rand() > 0.5;
      const end = completed ? new Date(start.getTime() + durMin * 60_000) : null;
      const forceClosed = completed && rand() < 0.05;
      sessions.push({
        id: `ws-${seq++}`,
        cabinId: cabin.id,
        manpowerId: worker.id,
        startTime: start,
        endTime: forceClosed ? null : end,
        durationSeconds: forceClosed ? null : end ? durMin * 60 : null,
        status: forceClosed ? "force_closed" : end ? "completed" : "in_progress",
        forceClosedBy: forceClosed ? "usr-admin" : undefined,
        forceCloseReason: forceClosed
          ? "Sesi menggantung > 8 jam, teknisi lupa scan selesai"
          : undefined,
        createdOffline: rand() < 0.08,
      });
    }
  }
  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

export const workSessions: WorkSession[] = buildSessions();

export const appUsers: AppUser[] = [
  { id: "usr-admin", manpowerId: null, name: "Hartono Admin", nik: null, role: "admin", isActive: true, lastLoginAt: new Date(NOW.getTime() - 2 * 3600_000) },
  { id: "usr-spv-1", manpowerId: null, name: "Surya Supervisor", nik: null, role: "supervisor", isActive: true, lastLoginAt: new Date(NOW.getTime() - 26 * 3600_000) },
  ...manpower.map((m, i) => ({
    id: `usr-mp-${i + 1}`,
    manpowerId: m.id,
    name: m.name,
    nik: m.nik,
    role: "manpower" as const,
    isActive: m.isActive,
    lastLoginAt: i < 5 ? daysAgo(Math.floor(rand() * 3), 6) : null,
  })),
];

export const syncLogs: SyncLog[] = [
  { id: "sl-1", entityType: "cabin", triggeredBy: "scheduled", status: "success", recordsSynced: 24, errorMessage: null, startedAt: SYNC_TIME, finishedAt: new Date(SYNC_TIME.getTime() + 4200) },
  { id: "sl-2", entityType: "manpower", triggeredBy: "scheduled", status: "success", recordsSynced: 8, errorMessage: null, startedAt: SYNC_TIME, finishedAt: new Date(SYNC_TIME.getTime() + 2100) },
  { id: "sl-3", entityType: "cabin", triggeredBy: "scheduled", status: "failed", recordsSynced: 0, errorMessage: "Gagal terhubung ke sistem sumber (timeout)", startedAt: new Date(SYNC_TIME.getTime() - 3600_000), finishedAt: new Date(SYNC_TIME.getTime() - 3600_000 + 30_000) },
  { id: "sl-4", entityType: "manpower", triggeredBy: "manual", status: "success", recordsSynced: 8, errorMessage: null, startedAt: new Date(SYNC_TIME.getTime() - 7200_000), finishedAt: new Date(SYNC_TIME.getTime() - 7200_000 + 1900) },
];

// ---------- Helpers ----------
export const cabinById = (id: string) => cabins.find((c) => c.id === id);
export const manpowerById = (id: string) => manpower.find((m) => m.id === id);

export function fmtDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

export function fmtDateTime(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const NOW_REF = NOW;

export const STATUS_LABEL: Record<SessionStatus, string> = {
  in_progress: "Sedang Dikerjakan",
  completed: "Selesai",
  force_closed: "Ditutup Paksa",
};
