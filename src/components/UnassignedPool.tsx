import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MinisterTile } from "./MinisterTile";
import { FamilyTile } from "./FamilyTile";
import { useStore } from "@/lib/store";
import type { DropTarget } from "@/lib/dnd";

interface UnassignedPoolProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function UnassignedPool({ isOpen, onToggle }: UnassignedPoolProps) {
  const unassignedMinisters = useStore((s) => s.unassignedMinisters);
  const unassignedFamilies = useStore((s) => s.unassignedFamilies);
  const [ministerSearch, setMinisterSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ministers" | "families">(
    "ministers"
  );

  const ministerDrop: DropTarget = { type: "minister", companionshipId: null };
  const assignmentDrop: DropTarget = {
    type: "assignment",
    companionshipId: null,
  };

  const { setNodeRef: setMinisterPoolRef, isOver: isMinisterPoolOver } =
    useDroppable({
      id: "unassigned-ministers-pool",
      data: ministerDrop,
    });

  const { setNodeRef: setFamilyPoolRef, isOver: isFamilyPoolOver } =
    useDroppable({
      id: "unassigned-families-pool",
      data: assignmentDrop,
    });

  const filteredMinisters = unassignedMinisters.filter((m) =>
    m.name.toLowerCase().includes(ministerSearch.toLowerCase())
  );

  const filteredFamilies = unassignedFamilies.filter((f) =>
    f.name.toLowerCase().includes(familySearch.toLowerCase())
  );

  const totalUnassigned =
    unassignedMinisters.length + unassignedFamilies.length;

  return (
    <>
      {/* Toggle tab on the edge of screen when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white border border-r-0 border-gray-300 rounded-l-lg px-2 py-4 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-1">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-xs font-medium text-gray-600 [writing-mode:vertical-lr]">
              Unassigned
            </span>
            {totalUnassigned > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalUnassigned}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "360px" }}
      >
        <div className="h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Unassigned</h2>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("ministers")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "ministers"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Ministers ({unassignedMinisters.length})
            </button>
            <button
              onClick={() => setActiveTab("families")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "families"
                  ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Assignments ({unassignedFamilies.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Ministers tab */}
            <div
              ref={setMinisterPoolRef}
              className={`h-full flex flex-col transition-colors ${
                activeTab !== "ministers" ? "hidden" : ""
              } ${isMinisterPoolOver ? "bg-blue-50" : ""}`}
            >
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search ministers..."
                  value={ministerSearch}
                  onChange={(e) => setMinisterSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                {filteredMinisters.map((minister) => (
                  <MinisterTile
                    key={minister.personId}
                    minister={minister}
                    companionshipId={null}
                  />
                ))}
                {filteredMinisters.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-8">
                    {ministerSearch ? "No matches" : "All ministers assigned"}
                  </div>
                )}
              </div>
            </div>

            {/* Families tab */}
            <div
              ref={setFamilyPoolRef}
              className={`h-full flex flex-col transition-colors ${
                activeTab !== "families" ? "hidden" : ""
              } ${isFamilyPoolOver ? "bg-amber-50" : ""}`}
            >
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={familySearch}
                  onChange={(e) => setFamilySearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                {filteredFamilies.map((assignment) => (
                  <FamilyTile
                    key={assignment.personId}
                    assignment={assignment}
                    companionshipId={null}
                  />
                ))}
                {filteredFamilies.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-8">
                    {familySearch ? "No matches" : "All assigned"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
