import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { DistrictBoard } from "./DistrictBoard";
import { UnassignedPool } from "./UnassignedPool";
import { Toolbar } from "./Toolbar";
import { useStore } from "@/lib/store";
import { Avatar } from "./Avatar";
import type { DragData, DropTarget } from "@/lib/dnd";

export function Board() {
  const districts = useStore((s) => s.districts);
  const moveMinister = useStore((s) => s.moveMinister);
  const moveAssignment = useStore((s) => s.moveAssignment);
  const moveCompanionship = useStore((s) => s.moveCompanionship);
  const [activeDrag, setActiveDrag] = useState<{
    data: DragData;
    name: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData;
    let name = "";
    const store = useStore.getState();

    if (data.type === "companionship") {
      // Build a summary label for the overlay
      for (const d of store.districts) {
        const comp = d.companionships.find(
          (c) => c.id === data.companionshipId
        );
        if (comp) {
          const ministerNames = comp.ministers.map((m) => m.name.split(",")[0]);
          name = ministerNames.join(" & ") || "Empty companionship";
          break;
        }
      }
    } else if (data.type === "minister") {
      if (data.companionshipId) {
        for (const d of store.districts) {
          for (const c of d.companionships) {
            const m = c.ministers.find((m) => m.personId === data.personId);
            if (m) {
              name = m.name;
              break;
            }
          }
        }
      } else {
        const m = store.unassignedMinisters.find(
          (m) => m.personId === data.personId
        );
        if (m) name = m.name;
      }
    } else {
      if (data.companionshipId) {
        for (const d of store.districts) {
          for (const c of d.companionships) {
            const a = c.assignments.find((a) => a.personId === data.personId);
            if (a) {
              name = a.name;
              break;
            }
          }
        }
      } else {
        const a = store.unassignedFamilies.find(
          (a) => a.personId === data.personId
        );
        if (a) name = a.name;
      }
    }
    setActiveDrag({ data, name });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragData;
    const dropData = over.data.current as DropTarget;

    if (!dragData || !dropData) return;

    // Companionship → District
    if (dragData.type === "companionship" && dropData.type === "companionship") {
      if (dragData.companionshipId && dropData.districtId) {
        moveCompanionship(dragData.companionshipId, dropData.districtId);
      }
      return;
    }

    // Minister/Assignment moves
    if (dragData.type !== dropData.type) return;
    if (dragData.companionshipId === dropData.companionshipId) return;

    if (dragData.type === "minister" && dragData.personId) {
      moveMinister(
        dragData.personId,
        dragData.companionshipId,
        dropData.companionshipId ?? null
      );
    } else if (dragData.type === "assignment" && dragData.personId) {
      moveAssignment(
        dragData.personId,
        dragData.companionshipId,
        dropData.companionshipId ?? null
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-100">
        <Toolbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <div
          className="mx-auto p-4 space-y-6 transition-all duration-300"
          style={{ marginRight: sidebarOpen ? "360px" : undefined }}
        >
          {districts.map((district) => (
            <DistrictBoard key={district.id} district={district} />
          ))}
        </div>
      </div>

      <UnassignedPool
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <DragOverlay>
        {activeDrag && activeDrag.data.type === "companionship" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border-2 bg-white border-gray-400">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 6" fill="currentColor">
              <circle cx="3" cy="1" r="1" />
              <circle cx="8" cy="1" r="1" />
              <circle cx="13" cy="1" r="1" />
              <circle cx="3" cy="5" r="1" />
              <circle cx="8" cy="5" r="1" />
              <circle cx="13" cy="5" r="1" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {activeDrag.name}
            </span>
          </div>
        )}
        {activeDrag && activeDrag.data.type !== "companionship" && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-xl border-2 ${
              activeDrag.data.type === "minister"
                ? "bg-blue-50 border-blue-400"
                : "bg-amber-50 border-amber-400"
            }`}
          >
            <Avatar name={activeDrag.name} personId={activeDrag.data.personId} size="sm" />
            <span className="text-sm font-medium">{activeDrag.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
