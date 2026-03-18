import { useDraggable, useDroppable } from "@dnd-kit/core";
import { MinisterTile } from "./MinisterTile";
import { FamilyTile } from "./FamilyTile";
import { useStore } from "@/lib/store";
import type { Companionship } from "@/lib/types";
import type { DragData, DropTarget } from "@/lib/dnd";

interface CompanionshipCardProps {
  companionship: Companionship;
}

export function CompanionshipCard({ companionship }: CompanionshipCardProps) {
  const removeEmptyCompanionship = useStore((s) => s.removeEmptyCompanionship);
  const isEmpty =
    companionship.ministers.length === 0 &&
    companionship.assignments.length === 0;

  const dragData: DragData = {
    type: "companionship",
    companionshipId: companionship.id,
  };
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `companionship-drag-${companionship.id}`,
    data: dragData,
  });

  const ministerDrop: DropTarget = {
    type: "minister",
    companionshipId: companionship.id,
  };
  const assignmentDrop: DropTarget = {
    type: "assignment",
    companionshipId: companionship.id,
  };

  const { setNodeRef: setMinisterDropRef, isOver: isMinisterOver } =
    useDroppable({
      id: `comp-ministers-${companionship.id}`,
      data: ministerDrop,
    });

  const { setNodeRef: setAssignmentDropRef, isOver: isAssignmentOver } =
    useDroppable({
      id: `comp-assignments-${companionship.id}`,
      data: assignmentDrop,
    });

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-opacity ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {/* Drag handle bar */}
      <div
        ref={setDragRef}
        {...listeners}
        {...attributes}
        className="flex items-center justify-center h-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
      >
        <svg
          className="w-4 h-3 text-gray-300 dark:text-gray-600"
          viewBox="0 0 16 6"
          fill="currentColor"
        >
          <circle cx="3" cy="1" r="1" />
          <circle cx="8" cy="1" r="1" />
          <circle cx="13" cy="1" r="1" />
          <circle cx="3" cy="5" r="1" />
          <circle cx="8" cy="5" r="1" />
          <circle cx="13" cy="5" r="1" />
        </svg>
      </div>

      <div className="flex divide-x divide-gray-100 dark:divide-gray-700">
        {/* Ministers side — 40% */}
        <div
          ref={setMinisterDropRef}
          className={`w-2/5 shrink-0 p-2 space-y-1.5 min-h-[60px] transition-colors ${
            isMinisterOver ? "bg-blue-50 dark:bg-blue-900/30" : ""
          }`}
        >
          {companionship.ministers.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-center">
              Drop ministers here
            </div>
          )}
          {companionship.ministers.map((minister) => (
            <MinisterTile
              key={minister.personId}
              minister={minister}
              companionshipId={companionship.id}
            />
          ))}
        </div>

        {/* Divider arrow */}
        <div className="flex items-center px-1 text-gray-300 dark:text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Assignments side — 60% */}
        <div
          ref={setAssignmentDropRef}
          className={`flex-1 p-2 space-y-1.5 min-h-[60px] transition-colors ${
            isAssignmentOver ? "bg-amber-50 dark:bg-yellow-900/30" : ""
          }`}
        >
          {companionship.assignments.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-center">
              Drop assignments here
            </div>
          )}
          {companionship.assignments.map((assignment) => (
            <FamilyTile
              key={assignment.personId}
              assignment={assignment}
              companionshipId={companionship.id}
            />
          ))}
        </div>
      </div>

      {isEmpty && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-1.5 text-center">
          <button
            onClick={() => removeEmptyCompanionship(companionship.id)}
            className="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
          >
            Remove empty companionship
          </button>
        </div>
      )}
    </div>
  );
}
