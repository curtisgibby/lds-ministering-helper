import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { GripHorizontal } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build a set of matching keys (variant-personId) for highlighting
  const matchSet = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return new Set<string>();
    const keys = new Set<string>();
    for (const district of districts) {
      for (const comp of district.companionships) {
        for (const m of comp.ministers) {
          if (m.name.toLowerCase().includes(query)) keys.add(`minister-${m.personId}`);
        }
        for (const a of comp.assignments) {
          if (a.name.toLowerCase().includes(query)) keys.add(`assignment-${a.personId}`);
        }
      }
    }
    return keys;
  }, [searchQuery, districts]);

  // Read match order from the DOM so navigation follows visual (top-to-bottom, left-to-right) order
  const getDomOrderedMatchKeys = useCallback(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-match-key]");
    const keys: string[] = [];
    nodes.forEach((node) => {
      const key = node.dataset.matchKey;
      if (key && matchSet.has(key) && !keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, [matchSet]);

  const matchCount = matchSet.size;
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // When search changes, jump to first DOM-order match
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentMatchIndex(0);
  }, []);

  // After matchSet updates, resolve the active match from DOM order
  useEffect(() => {
    if (matchSet.size === 0) {
      setActiveMatchId(null);
      setCurrentMatchIndex(0);
      return;
    }
    // Use requestAnimationFrame to ensure DOM has rendered the data-match-key attributes
    const raf = requestAnimationFrame(() => {
      const ordered = getDomOrderedMatchKeys();
      if (ordered.length > 0) {
        const idx = currentMatchIndex % ordered.length;
        setActiveMatchId(ordered[idx]);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [matchSet, currentMatchIndex, getDomOrderedMatchKeys]);

  const handleNextMatch = useCallback(() => {
    setCurrentMatchIndex((i) => (matchCount > 0 ? (i + 1) % matchCount : 0));
  }, [matchCount]);

  const handlePrevMatch = useCallback(() => {
    setCurrentMatchIndex((i) => (matchCount > 0 ? (i - 1 + matchCount) % matchCount : 0));
  }, [matchCount]);

  // Cmd+F / Ctrl+F override
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Toolbar
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          matchCount={matchCount}
          currentMatchIndex={matchCount > 0 ? currentMatchIndex : -1}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          searchInputRef={searchInputRef}
        />
        <div
          className="mx-auto p-4 space-y-6 transition-all duration-300"
          style={{ marginRight: sidebarOpen ? "360px" : undefined }}
        >
          {districts.map((district) => (
            <DistrictBoard key={district.id} district={district} searchQuery={searchQuery} activeMatchId={activeMatchId} />
          ))}
        </div>
      </div>

      <UnassignedPool
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <DragOverlay>
        {activeDrag && activeDrag.data.type === "companionship" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border-2 bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {activeDrag.name}
            </span>
          </div>
        )}
        {activeDrag && activeDrag.data.type !== "companionship" && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-xl border-2 ${
              activeDrag.data.type === "minister"
                ? "bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600"
                : "bg-amber-50 dark:bg-yellow-900/60 border-amber-400 dark:border-yellow-600"
            }`}
          >
            <Avatar name={activeDrag.name} personId={activeDrag.data.personId} size="sm" />
            <span className="text-sm font-medium dark:text-gray-100">{activeDrag.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
