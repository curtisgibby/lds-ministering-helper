import { useDraggable } from "@dnd-kit/core";
import { Avatar } from "./Avatar";
import type { DragData } from "@/lib/dnd";
import type { Minister } from "@/lib/types";
import { useStore, getPersonDetails, displayName } from "@/lib/store";

interface MinisterTileProps {
  minister: Minister;
  companionshipId: string | null;
}

function formatOffice(office: string): string {
  const map: Record<string, string> = {
    ELDER: "Elder",
    HIGH_PRIEST: "High Priest",
    PRIEST: "Priest",
    TEACHER: "Teacher",
    DEACON: "Deacon",
    NONE: "",
  };
  return map[office] ?? office;
}

export function MinisterTile({
  minister,
  companionshipId,
}: MinisterTileProps) {
  const people = useStore((s) => s.people);
  const nameFormat = useStore((s) => s.nameFormat);
  const moveMinister = useStore((s) => s.moveMinister);
  const person = getPersonDetails(people, minister.personId);
  const dragData: DragData = {
    type: "minister",
    personId: minister.personId,
    companionshipId,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `minister-${minister.personId}-${companionshipId ?? "pool"}`,
      data: dragData,
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const office = formatOffice(minister.priesthoodOffice);
  const canRemove = companionshipId !== null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveMinister(minister.personId, companionshipId, null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-2 px-2 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-50 shadow-lg z-50" : "hover:shadow-sm"
      } ${minister.youthBasedOnAge ? "border-dashed" : ""}`}
    >
      <Avatar name={minister.name} personId={minister.personId} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {displayName(minister.name, nameFormat)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {[office, person?.phone].filter(Boolean).join(" · ")}
        </div>
      </div>
      {canRemove && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleRemove}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          title="Remove from companionship"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M8 12h8" />
          </svg>
        </button>
      )}
    </div>
  );
}
