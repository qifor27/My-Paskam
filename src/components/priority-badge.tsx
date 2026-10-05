import { StatusBadge } from "@/components/ui/status-badge";
import { PRIORITY_META, type Priority } from "@/lib/spare-part/priority";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <StatusBadge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </StatusBadge>
  );
}
