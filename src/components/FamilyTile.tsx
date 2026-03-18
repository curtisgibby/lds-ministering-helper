import { useDraggable } from "@dnd-kit/core";
import { Avatar } from "./Avatar";
import type { DragData } from "@/lib/dnd";
import type { Assignment } from "@/lib/types";
import { useStore, getPersonDetails, displayName } from "@/lib/store";

interface FamilyTileProps {
  assignment: Assignment;
  companionshipId: string | null;
}

export function FamilyTile({ assignment, companionshipId }: FamilyTileProps) {
  const people = useStore((s) => s.people);
  const nameFormat = useStore((s) => s.nameFormat);
  const moveAssignment = useStore((s) => s.moveAssignment);
  const person = getPersonDetails(people, assignment.personId);
  const dragData: DragData = {
    type: "assignment",
    personId: assignment.personId,
    companionshipId,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `assignment-${assignment.personId}-${companionshipId ?? "pool"}`,
      data: dragData,
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const canRemove = companionshipId !== null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveAssignment(assignment.personId, companionshipId, null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-2 px-2 py-1.5 bg-amber-50 dark:bg-yellow-900/40 border border-amber-200 dark:border-yellow-700/60 rounded-lg cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-50 shadow-lg z-50" : "hover:shadow-sm"
      }`}
    >
      <Avatar name={assignment.name} personId={assignment.personId} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {displayName(assignment.name, nameFormat)}
        </div>
        {person?.address && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{person.address}</div>
        )}
      </div>
      {canRemove && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleRemove}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-yellow-800/50 text-amber-400 dark:text-yellow-600 hover:text-amber-600 dark:hover:text-yellow-400"
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
