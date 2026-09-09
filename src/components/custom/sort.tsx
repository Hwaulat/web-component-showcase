import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortDir } from "./data-table";

interface SortIconProps {
  column: string;
  sortKey: string;
  sortDir: SortDir;
}

export function SortIcon({ column, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== column) {
    return <ArrowUpDown className="ml-1 inline-block h-3.5 w-3.5 opacity-40" />;
  }
  return sortDir === "ASC" ? (
    <ArrowUp className="ml-1 inline-block h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 inline-block h-3.5 w-3.5" />
  );
}
