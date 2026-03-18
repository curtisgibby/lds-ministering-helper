import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { CompanionshipCard } from "./CompanionshipCard";
import { useStore, districtColor } from "@/lib/store";
import type { District } from "@/lib/types";
import type { DropTarget } from "@/lib/dnd";

interface DistrictBoardProps {
  district: District;
}

export function DistrictBoard({ district }: DistrictBoardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(district.name);
  const createCompanionship = useStore((s) => s.createCompanionship);
  const renameDistrict = useStore((s) => s.renameDistrict);
  const removeEmptyDistrict = useStore((s) => s.removeEmptyDistrict);

  const handleRename = () => {
    if (editName.trim()) {
      renameDistrict(district.id, editName.trim());
    }
    setIsEditing(false);
  };

  const colors = districtColor(district.name);

  const dropData: DropTarget = {
    type: "companionship",
    districtId: district.id,
  };
  const { setNodeRef, isOver } = useDroppable({
    id: `district-drop-${district.id}`,
    data: dropData,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-4 transition-shadow ${
        isOver ? "ring-2 ring-blue-400 ring-offset-2" : ""
      }`}
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {isEditing ? (
            <input
              className="text-lg font-bold bg-white border border-gray-300 rounded px-2 py-1"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          ) : (
            <h2
              className="text-lg font-bold text-gray-800 cursor-pointer hover:text-gray-600"
              onClick={() => {
                setEditName(district.name);
                setIsEditing(true);
              }}
            >
              {district.name}
            </h2>
          )}
          {district.supervisorName && (
            <p className="text-sm text-gray-500">
              Supervisor: {district.supervisorName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-white rounded-full px-2.5 py-1 border">
            {district.companionships.length} companionships
          </span>
          <button
            onClick={() => createCompanionship(district.id)}
            className="text-xs bg-white text-gray-600 hover:text-gray-900 border rounded-full px-2.5 py-1 hover:shadow-sm"
          >
            + Companionship
          </button>
          {district.companionships.length === 0 && (
            <button
              onClick={() => removeEmptyDistrict(district.id)}
              className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded-full px-2.5 py-1"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Companionships grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))' }}>
        {district.companionships.map((comp) => (
          <CompanionshipCard key={comp.id} companionship={comp} />
        ))}
      </div>

      {district.companionships.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No companionships yet. Add one or drag a companionship here.
        </div>
      )}
    </div>
  );
}
