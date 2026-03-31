import { DraggableTile } from "./DraggableTile";
import type { DragData } from "@/lib/dnd";
import type { Assignment } from "@/lib/types";
import { useStore, getPersonDetails, displayName } from "@/lib/store";

interface FamilyTileProps {
  assignment: Assignment;
  companionshipId: string | null;
  searchQuery?: string;
  activeMatchId?: string | null;
}

export function FamilyTile({ assignment, companionshipId, searchQuery, activeMatchId }: FamilyTileProps) {
  const people = useStore((s) => s.people);
  const nameFormat = useStore((s) => s.nameFormat);
  const moveAssignment = useStore((s) => s.moveAssignment);
  const person = getPersonDetails(people, assignment.personId);

  const dragData: DragData = {
    type: "assignment",
    personId: assignment.personId,
    companionshipId,
  };

  return (
    <DraggableTile
      variant="assignment"
      dragData={dragData}
      dragId={`assignment-${assignment.personId}-${companionshipId ?? "pool"}`}
      personId={assignment.personId}
      displayName={displayName(assignment.name, nameFormat)}
      subtitle={person?.address ?? undefined}
      searchQuery={searchQuery}
      activeMatchId={activeMatchId}
      onRemove={
        companionshipId !== null
          ? () => moveAssignment(assignment.personId, companionshipId, null)
          : undefined
      }
    />
  );
}
