export type DragItemType = "minister" | "assignment" | "companionship";

export interface DragData {
  type: DragItemType;
  personId?: string;
  companionshipId: string | null; // null means unassigned pool
}

export interface DropTarget {
  type: DragItemType;
  companionshipId?: string | null;
  districtId?: string;
}
