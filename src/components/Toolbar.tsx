import { useState } from "react";
import { useStore, type NameFormat } from "@/lib/store";
import { useThemeStore, type Theme } from "@/lib/theme";

interface ToolbarProps {
  onToggleSidebar: () => void;
}

export function Toolbar({ onToggleSidebar }: ToolbarProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const reset = useStore((s) => s.reset);
  const exportState = useStore((s) => s.exportState);
  const createDistrict = useStore((s) => s.createDistrict);
  const districts = useStore((s) => s.districts);
  const unassignedMinisters = useStore((s) => s.unassignedMinisters);
  const unassignedFamilies = useStore((s) => s.unassignedFamilies);
  const nameFormat = useStore((s) => s.nameFormat);
  const setNameFormat = useStore((s) => s.setNameFormat);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const totalCompanionships = districts.reduce(
    (acc, d) => acc + d.companionships.length,
    0
  );
  const totalMinisters = districts.reduce(
    (acc, d) =>
      acc + d.companionships.reduce((a, c) => a + c.ministers.length, 0),
    0
  );
  const totalFamilies = districts.reduce(
    (acc, d) =>
      acc + d.companionships.reduce((a, c) => a + c.assignments.length, 0),
    0
  );

  const handleExport = () => {
    const json = exportState();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ministering-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAndReimport = () => {
    useStore.persist.clearStorage();
    window.location.reload();
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Ministering Helper
          </h1>
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{districts.length} districts</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>{totalCompanionships} companionships</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>{totalMinisters} ministers</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>{totalFamilies} assignments</span>
            {unassignedMinisters.length > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {unassignedMinisters.length} unassigned ministers
                </span>
              </>
            )}
            {unassignedFamilies.length > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="text-amber-600 dark:text-yellow-400">
                  {unassignedFamilies.length} unassigned
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="text-sm px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <select
            value={nameFormat}
            onChange={(e) => setNameFormat(e.target.value as NameFormat)}
            className="text-sm px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <option value="lastFirst">Last, First</option>
            <option value="firstLast">First Last</option>
          </select>
          <button
            onClick={() => createDistrict(`District ${districts.length + 1}`)}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            + District
          </button>
          <button
            onClick={handleExport}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export JSON
          </button>
          {showConfirmReset ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  reset();
                  setShowConfirmReset(false);
                }}
                className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-sm px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleClearAndReimport}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Re-import
          </button>
          <button
            onClick={onToggleSidebar}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Unassigned
            {unassignedMinisters.length + unassignedFamilies.length > 0 && (
              <span className="ml-1.5 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {unassignedMinisters.length + unassignedFamilies.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
