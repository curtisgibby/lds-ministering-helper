import { useRef, useState, useEffect } from "react";
import { useStore, type NameFormat, type AddressDisplay } from "@/lib/store";
import { useThemeStore, type Theme } from "@/lib/theme";
import { storePhotos } from "@/lib/photoStore";
import {
  ArrowRightLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Home,
  LayoutGrid,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sun,
  Upload,
  Users,
  UserCheck,
  X,
} from "lucide-react";

interface ToolbarProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function Toolbar({ onToggleSidebar, sidebarOpen, searchQuery, onSearchChange, matchCount, currentMatchIndex, onNextMatch, onPrevMatch, searchInputRef }: ToolbarProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const reset = useStore((s) => s.reset);
  const exportState = useStore((s) => s.exportState);
  const createDistrict = useStore((s) => s.createDistrict);
  const districts = useStore((s) => s.districts);
  const unassignedMinisters = useStore((s) => s.unassignedMinisters);
  const unassignedFamilies = useStore((s) => s.unassignedFamilies);
  const nameFormat = useStore((s) => s.nameFormat);
  const setNameFormat = useStore((s) => s.setNameFormat);
  const ministerFields = useStore((s) => s.ministerFields);
  const setMinisterFields = useStore((s) => s.setMinisterFields);
  const familyFields = useStore((s) => s.familyFields);
  const setFamilyFields = useStore((s) => s.setFamilyFields);
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

  const handleLoadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoStatus("Loading...");
      const json = JSON.parse(await file.text()) as Record<string, string>;
      const count = await storePhotos(json);
      setPhotoStatus(`${count} photos loaded`);
      setTimeout(() => setPhotoStatus(null), 3000);
      window.location.reload();
    } catch {
      setPhotoStatus("Failed to load photos");
      setTimeout(() => setPhotoStatus(null), 3000);
    }
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

        {/* Center: search */}
        <div className="flex items-center gap-0.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-300 dark:focus-within:ring-blue-600">
          <Search className="ml-2.5 w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Find person..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matchCount > 0) {
                e.preventDefault();
                if (e.shiftKey) onPrevMatch();
                else onNextMatch();
              } else if (e.key === "Escape") {
                onSearchChange("");
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="pl-2 py-1.5 text-sm bg-transparent dark:text-gray-200 focus:outline-none w-36"
          />
          {searchQuery && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap px-1">
                {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : "0/0"}
              </span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={onPrevMatch}
                disabled={matchCount === 0}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                title="Previous match (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={onNextMatch}
                disabled={matchCount === 0}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                title="Next match (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSearchChange("")}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
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

                {/* Show on ministers */}
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Show on ministers</div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={ministerFields.priesthoodOffice} onChange={(e) => setMinisterFields({ priesthoodOffice: e.target.checked })} className="rounded" />
                      Priesthood office
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={ministerFields.phone} onChange={(e) => setMinisterFields({ phone: e.target.checked })} className="rounded" />
                      Phone
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={ministerFields.email} onChange={(e) => setMinisterFields({ email: e.target.checked })} className="rounded" />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={ministerFields.age} onChange={(e) => setMinisterFields({ age: e.target.checked })} className="rounded" />
                      Age
                    </label>
                  </div>
                </div>

                {/* Show on families */}
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Show on families</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>Address</span>
                      <select
                        value={familyFields.address}
                        onChange={(e) => setFamilyFields({ address: e.target.value as AddressDisplay })}
                        className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <option value="full">Full</option>
                        <option value="street">Street only</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={familyFields.phone} onChange={(e) => setFamilyFields({ phone: e.target.checked })} className="rounded" />
                      Phone
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={familyFields.email} onChange={(e) => setFamilyFields({ email: e.target.checked })} className="rounded" />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={familyFields.age} onChange={(e) => setFamilyFields({ age: e.target.checked })} className="rounded" />
                      Age
                    </label>
                  </div>
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

                {/* Load photos */}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {photoStatus ?? "Load photos"}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleLoadPhotos}
                  className="hidden"
                />

                {/* Re-import */}
                <button
                  onClick={handleClearAndReimport}
                  className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Re-import
                </button>

                {/* GitHub */}
                <a
                  href="https://github.com/curtisgibby/lds-ministering-helper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  GitHub
                </a>

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
