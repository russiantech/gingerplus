import { FLAVOR_COLOR } from "@/utils/constants";
import { titleCase } from "@/utils/format";
export default function FlavorChip({ flavor, className = "" }: { flavor?: string | null; className?: string }) {
  if (!flavor) return null;
  return <span className={`flavor-chip ${className}`} style={{ background: FLAVOR_COLOR[flavor] ?? "#7f4e1a" }}>{titleCase(flavor)}</span>;
}
