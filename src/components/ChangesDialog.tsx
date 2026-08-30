import { useEffect } from "react";
import {
  ArrowRight,
  ClipboardList,
  Home,
  LayoutGrid,
  Minus,
  Plus,
  UserCheck,
  X,
} from "lucide-react";
import { getProposedChanges, type OrganizationChange, type PersonChange } from "@/lib/changes";
import { useStore } from "@/lib/store";

interface ChangesDialogProps {
  onClose: () => void;
}

function LocationChange({ change }: { change: PersonChange }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className={`mt-0.5 rounded-full p-1.5 ${change.kind === "minister" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"}`}>
        {change.kind === "minister" ? <UserCheck className="w-4 h-4" /> : <Home className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-800 dark:text-gray-100 truncate">{change.name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>{change.from.label}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span>{change.to.label}</span>
        </div>
      </div>
    </div>
  );
}

function OrganizationRow({ change }: { change: OrganizationChange }) {
  const isAdded = change.kind.endsWith("added");
  const isRemoved = change.kind.endsWith("removed");
  const isRenamed = change.kind === "district-renamed";
  const icon = isAdded ? <Plus className="w-4 h-4" /> : isRemoved ? <Minus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />;
  const label = isRenamed
    ? `Renamed district “${change.from}” to “${change.to}”`
    : isAdded
      ? `Added ${change.kind.startsWith("district") ? "district" : "companionship"} “${change.name}”${change.to ? ` to ${change.to}` : ""}`
      : isRemoved
        ? `Removed ${change.kind.startsWith("district") ? "district" : "companionship"} “${change.name}”${change.from ? ` from ${change.from}` : ""}`
        : `Moved companionship “${change.name}” from ${change.from} to ${change.to}`;

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className={`mt-0.5 rounded-full p-1.5 ${isAdded ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : isRemoved ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"}`}>
        {icon}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-200">{label}</div>
    </div>
  );
}

function ChangeSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        {icon}
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <span className="ml-auto text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5">{count}</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">{children}</div>
    </section>
  );
}

export function ChangesDialog({ onClose }: ChangesDialogProps) {
  const districts = useStore((s) => s.districts);
  const unassignedMinisters = useStore((s) => s.unassignedMinisters);
  const unassignedFamilies = useStore((s) => s.unassignedFamilies);
  const people = useStore((s) => s.people);
  const originalState = useStore((s) => s.originalState);
  const changes = getProposedChanges({
    districts,
    unassignedMinisters,
    unassignedFamilies,
    people,
  }, originalState);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 p-4 sm:p-8" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="changes-title" className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800 sm:max-h-[calc(100vh-4rem)]">
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 id="changes-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">Proposed changes</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Local edits that are not in the Church’s system yet.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200" aria-label="Close proposed changes">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {changes.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-green-100 p-3 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-800 dark:text-gray-100">No local changes</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">The board currently matches the data imported from the Church’s system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
                {changes.total} proposed {changes.total === 1 ? "change" : "changes"}. These edits only affect this local board; enter them manually in the Church’s system when you are ready.
              </div>
              <ChangeSection icon={<UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />} title="Minister moves" count={changes.ministerChanges.length}>
                {changes.ministerChanges.map((change) => <LocationChange key={`${change.kind}-${change.personId}`} change={change} />)}
              </ChangeSection>
              <ChangeSection icon={<Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />} title="Assignment moves" count={changes.assignmentChanges.length}>
                {changes.assignmentChanges.map((change) => <LocationChange key={`${change.kind}-${change.personId}`} change={change} />)}
              </ChangeSection>
              <ChangeSection icon={<LayoutGrid className="w-4 h-4 text-purple-600 dark:text-purple-400" />} title="District and companionship changes" count={changes.organizationChanges.length}>
                {changes.organizationChanges.map((change, index) => <OrganizationRow key={`${change.kind}-${change.name}-${index}`} change={change} />)}
              </ChangeSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
