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
}

export function MinisterTile({ minister, companionshipId }: MinisterTileProps) {
  const people = useStore((s) => s.people);
  const nameFormat = useStore((s) => s.nameFormat);
  const moveMinister = useStore((s) => s.moveMinister);
  const person = getPersonDetails(people, minister.personId);

  const dragData: DragData = {
    type: "minister",
    personId: minister.personId,
    companionshipId,
  };

  const office = OFFICE_LABELS[minister.priesthoodOffice] ?? minister.priesthoodOffice;
  const subtitle = [office, person?.phone].filter(Boolean).join(" · ");

  return (
    <DraggableTile
      variant="minister"
      dragData={dragData}
      dragId={`minister-${minister.personId}-${companionshipId ?? "pool"}`}
      personId={minister.personId}
      displayName={displayName(minister.name, nameFormat)}
      subtitle={subtitle || undefined}
      dashed={minister.youthBasedOnAge}
      onRemove={
        companionshipId !== null
          ? () => moveMinister(minister.personId, companionshipId, null)
          : undefined
      }
    />
  );
}
