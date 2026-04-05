import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronLeft, Home, UserCheck, X } from "lucide-react";
import { MinisterTile } from "./MinisterTile";
import { FamilyTile } from "./FamilyTile";
import { useStore } from "@/lib/store";
import type { DropTarget } from "@/lib/dnd";

interface UnassignedPoolProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery?: string;
  activeMatchId?: string | null;
  requestedTab?: "ministers" | "families";
}

export function UnassignedPool({ isOpen, onToggle, searchQuery, activeMatchId, requestedTab }: UnassignedPoolProps) {
  const unassignedMinisters = useStore((s) => s.unassignedMinisters);
  const unassignedFamilies = useStore((s) => s.unassignedFamilies);
  const [ministerSearch, setMinisterSearch] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ministers" | "families">(
    "ministers"
  );

  useEffect(() => {
    if (requestedTab) setActiveTab(requestedTab);
  }, [requestedTab]);

  // Clear sidebar filters when the global Cmd+F search becomes active
  useEffect(() => {
    if (searchQuery) {
      setMinisterSearch("");
      setFamilySearch("");
    }
  }, [searchQuery]);

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

  const query = searchQuery?.toLowerCase() ?? "";
  const hasUnassignedMatch = query.length > 0 && (
    unassignedMinisters.some((m) => m.name.toLowerCase().includes(query)) ||
    unassignedFamilies.some((a) => a.name.toLowerCase().includes(query))
  );

  return (
    <>
      {/* Toggle tab on the edge of screen when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 border border-r-0 rounded-l-lg px-2 py-4 shadow-lg transition-colors ${
            hasUnassignedMatch
              ? "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-600 ring-2 ring-yellow-300 dark:ring-yellow-600"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 [writing-mode:vertical-lr]">
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
        <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Unassigned</h2>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("ministers")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "ministers"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Ministers ({unassignedMinisters.length})
            </button>
            <button
              onClick={() => setActiveTab("families")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "families"
                  ? "text-amber-600 dark:text-yellow-400 border-b-2 border-amber-600 dark:border-yellow-400 bg-amber-50/50 dark:bg-yellow-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Home className="w-4 h-4" />
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
              } ${isMinisterPoolOver ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
            >
              <div className="p-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ministers..."
                    value={ministerSearch}
                    onChange={(e) => setMinisterSearch(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 text-sm border border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
                  />
                  {ministerSearch && (
                    <button
                      onClick={() => setMinisterSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                {filteredMinisters.map((minister) => (
                  <MinisterTile
                    key={minister.personId}
                    minister={minister}
                    companionshipId={null}
                    searchQuery={searchQuery}
                    activeMatchId={activeMatchId}
                  />
                ))}
                {filteredMinisters.length === 0 && (
                  <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    {ministerSearch ? "No matches" : "All ministers assigned"}
                  </div>
                )}
              </div>
            </div>

            {/* Assignments tab */}
            <div
              ref={setFamilyPoolRef}
              className={`h-full flex flex-col transition-colors ${
                activeTab !== "families" ? "hidden" : ""
              } ${isFamilyPoolOver ? "bg-amber-50 dark:bg-yellow-900/30" : ""}`}
            >
              <div className="p-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={familySearch}
                    onChange={(e) => setFamilySearch(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 text-sm border border-amber-200 dark:border-yellow-800 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
                  />
                  {familySearch && (
                    <button
                      onClick={() => setFamilySearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                {filteredFamilies.map((assignment) => (
                  <FamilyTile
                    key={assignment.personId}
                    assignment={assignment}
                    companionshipId={null}
                    searchQuery={searchQuery}
                    activeMatchId={activeMatchId}
                  />
                ))}
                {filteredFamilies.length === 0 && (
                  <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
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
