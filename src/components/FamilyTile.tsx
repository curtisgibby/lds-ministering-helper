import { useMemo } from "react";
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
  const fields = useStore((s) => s.familyFields);
  const moveAssignment = useStore((s) => s.moveAssignment);
  const person = getPersonDetails(people, assignment.personId);

  const dragData: DragData = {
    type: "assignment",
    personId: assignment.personId,
    companionshipId,
  };

  // Find spouse for dual-age/photo display (EQ only — HEAD assignments represent households)
  const spouse = useMemo(() => {
    if (!person || person.householdRole !== "HEAD") return null;
    return Object.values(people).find(
      (p) => p.householdId === person.householdId
        && p.id !== person.id
        && p.householdRole === "SPOUSE"
    ) ?? null;
  }, [people, person]);

  const parts: string[] = [];
  if (fields.address !== "hidden" && person) {
    const addr = fields.address === "street"
      ? (person.addressLines?.[0] ?? person.address?.split(",")[0])
      : person.address;
    if (addr) parts.push(addr);
  }
  if (fields.phone && person?.phone) parts.push(person.phone);
  if (fields.email && person?.email) parts.push(person.email);
  if (fields.age) {
    const ages = [person?.age, spouse?.age].filter((a): a is number => a != null);
    if (ages.length > 0) parts.push(ages.join(" & "));
  }
  const subtitle = parts.join(" · ");

  return (
    <DraggableTile
      variant="assignment"
      dragData={dragData}
      dragId={`assignment-${assignment.personId}-${companionshipId ?? "pool"}`}
      personId={assignment.personId}
      personName={person?.name ?? assignment.name}
      displayName={displayName(assignment.name, nameFormat)}
      subtitle={subtitle || undefined}
      searchQuery={searchQuery}
      activeMatchId={activeMatchId}
      spousePersonId={spouse?.id}
      spouseName={spouse?.name}
      onRemove={
        companionshipId !== null
          ? () => moveAssignment(assignment.personId, companionshipId, null)
          : undefined
      }
    />
  );
}
