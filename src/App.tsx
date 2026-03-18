import { Board } from "./components/Board";
import { ImportDialog } from "./components/ImportDialog";
import { useStore } from "./lib/store";

export default function App() {
  const hasImported = useStore((s) => s.hasImported);

  if (!hasImported) {
    return <ImportDialog />;
  }

  return <Board />;
}
