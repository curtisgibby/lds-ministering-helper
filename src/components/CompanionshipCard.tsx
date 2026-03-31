import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronRight, Home, Trash2, UserCheck } from "lucide-react";
import { MinisterTile } from "./MinisterTile";
import { FamilyTile } from "./FamilyTile";
import { useStore } from "@/lib/store";
import type { Companionship } from "@/lib/types";
import type { DragData, DropTarget } from "@/lib/dnd";

interface CompanionshipCardProps {
  companionship: Companionship;
  searchQuery?: string;
  activeMatchId?: string | null;
}

export function CompanionshipCard({ companionship, searchQuery, activeMatchId }: CompanionshipCardProps) {
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

  const query = searchQuery?.toLowerCase() ?? "";
  const isSearching = query.length > 0;
  const hasMatch = isSearching && (
    companionship.ministers.some((m) => m.name.toLowerCase().includes(query)) ||
    companionship.assignments.some((a) => a.name.toLowerCase().includes(query))
  );

  return (
    <div
      ref={setDragRef}
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden transition-all flex flex-col cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      } ${
        isSearching && hasMatch
          ? "border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-300 dark:ring-yellow-600"
          : "border-gray-200 dark:border-gray-700"
      } ${isSearching && !hasMatch ? "opacity-50" : ""}`}
    >

      <div className="flex divide-x divide-gray-100 dark:divide-gray-700">
        {/* Ministers side — 40% */}
        <div
          ref={setMinisterDropRef}
          className={`w-2/5 shrink-0 p-2 space-y-1.5 min-h-[60px] transition-colors ${
            isMinisterOver ? "bg-blue-50 dark:bg-blue-900/30" : ""
          }`}
        >
          {companionship.ministers.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-center flex items-center justify-center gap-1">
              <UserCheck className="w-3 h-3" />
              Drop ministers here
            </div>
          )}
          {companionship.ministers.map((minister) => (
            <MinisterTile
              key={minister.personId}
              minister={minister}
              companionshipId={companionship.id}
              searchQuery={searchQuery}
              activeMatchId={activeMatchId}
            />
          ))}
        </div>

        {/* Divider arrow */}
        <div className="flex items-center px-1 text-gray-300 dark:text-gray-600">
          <ChevronRight className="w-4 h-4" />
        </div>

        {/* Assignments side — 60% */}
        <div
          ref={setAssignmentDropRef}
          className={`flex-1 p-2 space-y-1.5 min-h-[60px] transition-colors ${
            isAssignmentOver ? "bg-amber-50 dark:bg-yellow-900/30" : ""
          }`}
        >
          {companionship.assignments.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-center flex items-center justify-center gap-1">
              <Home className="w-3 h-3" />
              Drop assignments here
            </div>
          )}
          {companionship.assignments.map((assignment) => (
            <FamilyTile
              key={assignment.personId}
              assignment={assignment}
              companionshipId={companionship.id}
              searchQuery={searchQuery}
              activeMatchId={activeMatchId}
            />
          ))}
        </div>
      </div>

      {isEmpty && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-1.5 flex flex-1 items-center justify-center">
          <button
            onClick={() => removeEmptyCompanionship(companionship.id)}
            className="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Remove empty companionship
          </button>
        </div>
      )}
    </div>
  );
}
