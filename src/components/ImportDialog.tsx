import { useRef, useState } from "react";
import { parseMinisteringData } from "@/lib/parseData";
import { useStore } from "@/lib/store";

export function ImportDialog() {
  const importData = useStore((s) => s.importData);
  const [error, setError] = useState<string | null>(null);
  const familiesRef = useRef<HTMLInputElement>(null);
  const companionshipsRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    setError(null);
    const familiesFile = familiesRef.current?.files?.[0];
    const companionshipsFile = companionshipsRef.current?.files?.[0];

    if (!familiesFile || !companionshipsFile) {
      setError("Please select both files.");
      return;
    }

    try {
      const [familiesText, companionshipsText] = await Promise.all([
        familiesFile.text(),
        companionshipsFile.text(),
      ]);

      const familiesJson = JSON.parse(familiesText);
      const companionshipsJson = JSON.parse(companionshipsText);

      const state = parseMinisteringData(familiesJson, companionshipsJson);
      importData(state);
    } catch (e) {
      setError(`Failed to parse files: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Ministering Helper
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload your ward's JSON data files to get started. These files are
          exported from the Church's ministering system.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Members file
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                (members.json)
              </span>
            </label>
            <input
              ref={familiesRef}
              type="file"
              accept=".json"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Companionships file
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                (companionships.json)
              </span>
            </label>
            <input
              ref={companionshipsRef}
              type="file"
              accept=".json"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 dark:file:bg-amber-900/50 file:text-amber-700 dark:file:text-amber-300 hover:file:bg-amber-100 dark:hover:file:bg-amber-900/70"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            onClick={handleImport}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Import & Build Board
          </button>
        </div>
      </div>
    </div>
  );
}
