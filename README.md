# Ministering Helper

A visual, drag-and-drop whiteboard for organizing ministering assignments in LDS wards. Works for both Elders Quorum and Relief Society.

**Try it now:** [lds-ministering-helper.curtisgibby.com](https://lds-ministering-helper.curtisgibby.com/)

Built because the Church's official ministering interface is hard to visualize at a glance and cumbersome to reorganize. This tool gives presidency members a bird's-eye view of their districts, companionships, and assignments — like a digital version of the whiteboards many presidencies already maintain by hand.

![Elders Quorum board view](/public/images/district-1-companionships.png)

## Features

- **Visual board layout** — Districts displayed as color-coded sections with companionship cards showing ministers on the left and assignments on the right
- **Drag and drop** — Move ministers and assignments between companionships, or drag entire companionships between districts
- **Quick remove** — Hover over any minister or assignment to reveal a remove button that sends them back to the unassigned pool

  ![Remove button](/public/images/companionship-remove.png)

- **Unassigned sidebar** — Searchable panel showing ministers and assignments not yet placed in a companionship

  ![Adding ministers from sidebar](/public/images/new-companionship.png)
  ![Adding assignments from sidebar](/public/images/new-companionship-assignments.png)

- **Find (Cmd+F / Ctrl+F)** — Chrome-style search across all districts and the unassigned pool, with match-by-match navigation

  ![Search with highlighting](/public/images/search.png)

- **Configurable field visibility** — Show or hide fields like priesthood office, phone, email, age, and address on minister and family tiles

  ![Settings dropdown](/public/images/settings.png)

- **Church-matching sort order** — Companionships, ministers, and assignments automatically sort to match the ordering in the Church's ministering system
- **Dark mode** — Light, dark, or system theme with a toolbar picker. Defaults to your OS preference.
- **Name format toggle** — Switch between "Last, First" and "First Last" display
- **Member photos** — Displays profile photos when available, with paired head/spouse photos on family tiles in EQ mode. Colored initials as fallback.
- **EQ and RS support** — Same tool works for both Elders Quorum and Relief Society data

  ![Relief Society board view](/public/images/district-1-companionships-rs.png)

- **Create and remove** districts and companionships
- **Export/import** — Save your work as a JSON snapshot and re-import it on another browser; auto-saves to browser localStorage
- **Reset** — One-click reset to the original imported state
- **Fully static** — No server, no database, no accounts. All data stays in your browser.

## Privacy

All ward data stays on your computer. Ministering Helper runs entirely in your browser — no member information is ever sent to any server. Your data is stored only in localStorage and can be cleared at any time.

## Getting Started

### 1. Export your ward's data

You'll need access to the Ministering page in [LCR](https://lcr.churchofjesuschrist.org) (Leader and Clerk Resources). See [IMPORT-GUIDE.md](IMPORT-GUIDE.md) for detailed instructions with screenshots.

In short: open DevTools, navigate to the Ministering page, and save two API responses as JSON files:

- `members.json` — the ward member list
- `companionships.json` — the current companionship assignments

### 2. Open the app

Use the hosted version at [lds-ministering-helper.curtisgibby.com](https://lds-ministering-helper.curtisgibby.com/), or run it locally:

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Import your data

Load both JSON files using the import form, or import a previously exported snapshot.

![Import dialog](/public/images/import.png)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Build | [Vite](https://vitejs.dev) |
| UI | [React](https://react.dev) + TypeScript |
| Drag & drop | [@dnd-kit](https://dndkit.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| State | [Zustand](https://zustand.docs.pmnd.rs) with localStorage persistence |

## Hosting

Since the app is fully static (`npm run build` produces a `dist/` folder), you can host it anywhere that serves static files — GitHub Pages, Netlify, Vercel, shared hosting, etc. No server runtime needed.

## Optional: Member Photos

Member photos aren't included in the exported JSON. You can optionally download them using a browser console script while logged into the Church directory site, then load them into the app via the import dialog or Settings > Load photos. Photos are stored in your browser's IndexedDB — they never leave your machine. See the "Optional: Download member photos" section in [IMPORT-GUIDE.md](IMPORT-GUIDE.md) for instructions.

The app works fine without photos — it generates colored initials avatars as a fallback.

## Example Data

The `examples/` directory contains fake ward data generated with [Faker.js](https://fakerjs.dev) that you can use to try out the app without real member data:

- `examples/members.json` — 447 fake members
- `examples/companionships-eq.json` — Elders Quorum assignments (3 districts, 45 companionships)
- `examples/companionships-rs.json` — Relief Society assignments (3 districts, 54 companionships)

## Limitations

- **Read-only** — This tool does not write changes back to the Church's system. It's for planning and visualization only. Once you've finalized your changes, you'll need to enter them manually in LCR.
- **Data export format** — The Church's API is unofficial and undocumented. If they change it, the import may break.
- **No multi-user** — Each user has their own local state. There's no shared editing or syncing between presidency members.

## License

MIT
