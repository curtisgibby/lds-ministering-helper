import { DraggableTile } from "./DraggableTile";
import type { DragData } from "@/lib/dnd";
import type { Minister } from "@/lib/types";
import { useStore, getPersonDetails, displayName } from "@/lib/store";

const OFFICE_LABELS: Record<string, string> = {
  ELDER: "Elder",
  HIGH_PRIEST: "High Priest",
  PRIEST: "Priest",
  TEACHER: "Teacher",
  DEACON: "Deacon",
  NONE: "",
};

interface MinisterTileProps {
  minister: Minister;
  companionshipId: string | null;
  searchQuery?: string;
  activeMatchId?: string | null;
}

export function MinisterTile({ minister, companionshipId, searchQuery, activeMatchId }: MinisterTileProps) {
  const people = useStore((s) => s.people);
  const nameFormat = useStore((s) => s.nameFormat);
  const fields = useStore((s) => s.ministerFields);
  const moveMinister = useStore((s) => s.moveMinister);
  const person = getPersonDetails(people, minister.personId);

  const dragData: DragData = {
    type: "minister",
    personId: minister.personId,
    companionshipId,
  };

  const parts: string[] = [];
  if (fields.priesthoodOffice) {
    const office = OFFICE_LABELS[minister.priesthoodOffice] ?? minister.priesthoodOffice;
    if (office) parts.push(office);
  }
  if (fields.phone && person?.phone) parts.push(person.phone);
  if (fields.email && person?.email) parts.push(person.email);
  if (fields.age) parts.push(`${minister.age}`);
  const subtitle = parts.join(" · ");

  return (
    <DraggableTile
      variant="minister"
      dragData={dragData}
      dragId={`minister-${minister.personId}-${companionshipId ?? "pool"}`}
      personId={minister.personId}
      personName={minister.name}
      displayName={displayName(minister.name, nameFormat)}
      subtitle={subtitle || undefined}
      dashed={minister.youthBasedOnAge}
      searchQuery={searchQuery}
      activeMatchId={activeMatchId}
      onRemove={
        companionshipId !== null
          ? () => moveMinister(minister.personId, companionshipId, null)
          : undefined
      }
    />
  );
}
