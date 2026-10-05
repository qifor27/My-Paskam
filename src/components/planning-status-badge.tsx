import { StatusBadge } from "@/components/ui/status-badge";
import { PLANNING_STATUS_META, type PlanningStatus } from "@/lib/planning/status";

export function PlanningStatusBadge({ status }: { status: PlanningStatus }) {
  const meta = PLANNING_STATUS_META[status];
  return (
    <StatusBadge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </StatusBadge>
  );
}
