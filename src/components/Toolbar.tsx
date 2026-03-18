import { useRef, useState, useEffect } from "react";
import { useStore, type NameFormat } from "@/lib/store";
import { useThemeStore, type Theme } from "@/lib/theme";
import {
  ArrowRightLeft,
  Download,
  Home,
  LayoutGrid,
  Moon,
  Plus,
  RotateCcw,
  Settings,
  Sun,
  Upload,
  Users,
  UserCheck,
} from "lucide-react";

interface ToolbarProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

export function Toolbar({ onToggleSidebar, sidebarOpen }: ToolbarProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
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

  // Close settings dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
        setShowConfirmReset(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [settingsOpen]);

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

  const unassignedTotal = unassignedMinisters.length + unassignedFamilies.length;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-all duration-300" style={{ marginRight: sidebarOpen ? "360px" : undefined }}>
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: title + stats */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Ministering Helper
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1" title="Districts">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Districts:</span>
              {districts.length}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="flex items-center gap-1" title="Companionships">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Companionships:</span>
              {totalCompanionships}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="flex items-center gap-1" title={`Ministers: ${totalMinisters} assigned / ${totalMinisters + unassignedMinisters.length} total`}>
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ministers:</span>
              {totalMinisters}/{totalMinisters + unassignedMinisters.length}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="flex items-center gap-1" title={`Assignments: ${totalFamilies} assigned / ${totalFamilies + unassignedFamilies.length} total`}>
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Assignments:</span>
              {totalFamilies}/{totalFamilies + unassignedFamilies.length}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => createDistrict(`District ${districts.length + 1}`)}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">District</span>
          </button>

          <button
            onClick={onToggleSidebar}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
          >
            Unassigned
            {unassignedTotal > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {unassignedTotal}
              </span>
            )}
          </button>

          {/* Settings dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="text-sm p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                {/* Theme */}
                <div className="px-3 py-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {theme === "dark" ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="w-full text-sm px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                {/* Name format */}
                <div className="px-3 py-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <ArrowRightLeft className="w-4 h-4" />
                    Name format
                  </label>
                  <select
                    value={nameFormat}
                    onChange={(e) => setNameFormat(e.target.value as NameFormat)}
                    className="w-full text-sm px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <option value="lastFirst">Last, First</option>
                    <option value="firstLast">First Last</option>
                  </select>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                {/* Export */}
                <button
                  onClick={handleExport}
                  className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>

                {/* Re-import */}
                <button
                  onClick={handleClearAndReimport}
                  className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Re-import
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                {/* Reset */}
                {showConfirmReset ? (
                  <div className="px-3 py-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        reset();
                        setShowConfirmReset(false);
                        setSettingsOpen(false);
                      }}
                      className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
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
                    className="w-full px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to original
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
