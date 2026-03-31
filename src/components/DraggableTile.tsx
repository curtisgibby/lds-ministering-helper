import { useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CircleMinus } from "lucide-react";
import { Avatar } from "./Avatar";
import type { DragData } from "@/lib/dnd";

const variants = {
  minister: {
    tile: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    button:
      "hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300",
  },
  assignment: {
    tile: "bg-amber-50 dark:bg-yellow-900/40 border-amber-200 dark:border-yellow-700/60",
    button:
      "hover:bg-amber-200 dark:hover:bg-yellow-800/50 text-amber-400 dark:text-yellow-600 hover:text-amber-600 dark:hover:text-yellow-400",
  },
};

interface DraggableTileProps {
  variant: "minister" | "assignment";
  dragData: DragData;
  dragId: string;
  personId: string;
  displayName: string;
  subtitle?: string;
  dashed?: boolean;
  searchQuery?: string;
  activeMatchId?: string | null;
  onRemove?: () => void;
}

export function DraggableTile({
  variant,
  dragData,
  dragId,
  personId,
  displayName,
  subtitle,
  dashed,
  searchQuery,
  activeMatchId,
  onRemove,
}: DraggableTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: dragId, data: dragData });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const colors = variants[variant];
  const scrollRef = useRef<HTMLDivElement>(null);

  const query = searchQuery?.toLowerCase() ?? "";
  const isSearching = query.length > 0;
  const isMatch = isSearching && displayName.toLowerCase().includes(query);
  const matchKey = `${variant}-${personId}`;
  const isActiveMatch = isMatch && activeMatchId === matchKey;

  useEffect(() => {
    if (isActiveMatch && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActiveMatch, activeMatchId]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      data-match-key={matchKey}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative flex items-center gap-2 px-2 py-1.5 border rounded-lg cursor-grab active:cursor-grabbing select-none transition-all ${colors.tile} ${
        isDragging ? "opacity-50 shadow-lg z-50" : "hover:shadow-sm"
      } ${dashed ? "border-dashed" : ""} ${
        isActiveMatch
          ? "ring-2 ring-orange-400 dark:ring-orange-500 border-orange-400 dark:border-orange-500 shadow-md shadow-orange-200 dark:shadow-orange-900"
          : isMatch
            ? "ring-2 ring-yellow-300/60 dark:ring-yellow-600/60 border-yellow-300 dark:border-yellow-600"
            : ""
      } ${isSearching && !isMatch ? "opacity-50" : ""}`}
    >
      <Avatar name={displayName} personId={personId} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {displayName}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </div>
        )}
      </div>
      {onRemove && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 ${colors.button}`}
          title="Remove from companionship"
        >
          <CircleMinus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
