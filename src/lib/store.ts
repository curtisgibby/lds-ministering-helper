import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Assignment,
  Companionship,
  District,
  Minister,
  MinisteringState,
  Person,
} from "./types";

function sortMinisteringState(state: MinisteringState): MinisteringState {
  const districts = structuredClone(state.districts);
  for (const district of districts) {
    for (const comp of district.companionships) {
      comp.ministers.sort((a, b) => a.name.localeCompare(b.name));
      comp.assignments.sort((a, b) => a.name.localeCompare(b.name));
    }
    district.companionships.sort((a, b) => {
      const aLast = a.ministers[0]?.name.split(",")[0] ?? "";
      const bLast = b.ministers[0]?.name.split(",")[0] ?? "";
      return aLast.localeCompare(bLast);
    });
  }
  return {
    ...state,
    districts,
    unassignedMinisters: [...state.unassignedMinisters].sort((a, b) => a.name.localeCompare(b.name)),
    unassignedFamilies: [...state.unassignedFamilies].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export type NameFormat = "lastFirst" | "firstLast";
export type AddressDisplay = "full" | "street" | "hidden";

export interface MinisterFieldSettings {
  priesthoodOffice: boolean;
  phone: boolean;
  email: boolean;
  age: boolean;
}

export interface FamilyFieldSettings {
  address: AddressDisplay;
  phone: boolean;
  email: boolean;
  age: boolean;
}

const defaultMinisterFields: MinisterFieldSettings = {
  priesthoodOffice: true,
  phone: true,
  email: false,
  age: false,
};

const defaultFamilyFields: FamilyFieldSettings = {
  address: "full",
  phone: false,
  email: false,
  age: false,
};

interface StoreState extends MinisteringState {
  originalState: MinisteringState | null;
  hasImported: boolean;
  nameFormat: NameFormat;
  ministerFields: MinisterFieldSettings;
  familyFields: FamilyFieldSettings;

  importData: (state: MinisteringState) => void;
  reset: () => void;
  setNameFormat: (format: NameFormat) => void;
  setMinisterFields: (fields: Partial<MinisterFieldSettings>) => void;
  setFamilyFields: (fields: Partial<FamilyFieldSettings>) => void;

  moveMinister: (
    ministerId: string,
    fromCompanionshipId: string | null,
    toCompanionshipId: string | null
  ) => void;
  moveAssignment: (
    assignmentId: string,
    fromCompanionshipId: string | null,
    toCompanionshipId: string | null
  ) => void;
  moveCompanionship: (
    companionshipId: string,
    toDistrictId: string
  ) => void;
  createCompanionship: (districtId: string) => void;
  removeEmptyCompanionship: (companionshipId: string) => void;
  createDistrict: (name: string) => void;
  renameDistrict: (districtId: string, name: string) => void;
  removeEmptyDistrict: (districtId: string) => void;
  exportState: () => string;
}

function generateId(): string {
  return crypto.randomUUID();
}

function findCompanionship(
  districts: District[],
  companionshipId: string
): { district: District; companionship: Companionship } | null {
  for (const district of districts) {
    const comp = district.companionships.find((c) => c.id === companionshipId);
    if (comp) return { district, companionship: comp };
  }
  return null;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      districts: [],
      unassignedMinisters: [],
      unassignedFamilies: [],
      people: {},
      originalState: null,
      hasImported: false,
      nameFormat: "lastFirst" as NameFormat,
      ministerFields: defaultMinisterFields,
      familyFields: defaultFamilyFields,

      setNameFormat: (format: NameFormat) => set({ nameFormat: format }),
      setMinisterFields: (fields: Partial<MinisterFieldSettings>) =>
        set((state) => ({ ministerFields: { ...state.ministerFields, ...fields } })),
      setFamilyFields: (fields: Partial<FamilyFieldSettings>) =>
        set((state) => ({ familyFields: { ...state.familyFields, ...fields } })),

      importData: (raw: MinisteringState) => {
        const state = sortMinisteringState(raw);
        set({
          ...state,
          originalState: structuredClone(state),
          hasImported: true,
        });
      },

      reset: () => {
        const original = get().originalState;
        if (original) {
          set({
            ...structuredClone(original),
            originalState: get().originalState,
            hasImported: true,
          });
        }
      },

      moveMinister: (
        ministerId: string,
        fromCompanionshipId: string | null,
        toCompanionshipId: string | null
      ) =>
        set((state) => {
          const districts = structuredClone(state.districts);
          let unassignedMinisters = [...state.unassignedMinisters];
          let minister: Minister | undefined;

          // Remove from source
          if (fromCompanionshipId) {
            const found = findCompanionship(districts, fromCompanionshipId);
            if (found) {
              const idx = found.companionship.ministers.findIndex(
                (m) => m.personId === ministerId
              );
              if (idx !== -1) {
                minister = found.companionship.ministers.splice(idx, 1)[0];
              }
            }
          } else {
            const idx = unassignedMinisters.findIndex(
              (m) => m.personId === ministerId
            );
            if (idx !== -1) {
              minister = unassignedMinisters.splice(idx, 1)[0];
            }
          }

          if (!minister) return state;

          // Add to target
          if (toCompanionshipId) {
            const found = findCompanionship(districts, toCompanionshipId);
            if (found) {
              found.companionship.ministers.push(minister);
              found.companionship.ministers.sort((a, b) =>
                a.name.localeCompare(b.name)
              );
            }
          } else {
            unassignedMinisters.push(minister);
            unassignedMinisters.sort((a, b) => a.name.localeCompare(b.name));
          }

          return { districts, unassignedMinisters };
        }),

      moveAssignment: (
        assignmentId: string,
        fromCompanionshipId: string | null,
        toCompanionshipId: string | null
      ) =>
        set((state) => {
          const districts = structuredClone(state.districts);
          let unassignedFamilies = [...state.unassignedFamilies];
          let assignment: Assignment | undefined;

          if (fromCompanionshipId) {
            const found = findCompanionship(districts, fromCompanionshipId);
            if (found) {
              const idx = found.companionship.assignments.findIndex(
                (a) => a.personId === assignmentId
              );
              if (idx !== -1) {
                assignment = found.companionship.assignments.splice(idx, 1)[0];
              }
            }
          } else {
            const idx = unassignedFamilies.findIndex(
              (a) => a.personId === assignmentId
            );
            if (idx !== -1) {
              assignment = unassignedFamilies.splice(idx, 1)[0];
            }
          }

          if (!assignment) return state;

          if (toCompanionshipId) {
            const found = findCompanionship(districts, toCompanionshipId);
            if (found) {
              found.companionship.assignments.push(assignment);
              found.companionship.assignments.sort((a, b) =>
                a.name.localeCompare(b.name)
              );
            }
          } else {
            unassignedFamilies.push(assignment);
            unassignedFamilies.sort((a, b) => a.name.localeCompare(b.name));
          }

          return { districts, unassignedFamilies };
        }),

      moveCompanionship: (companionshipId: string, toDistrictId: string) =>
        set((state) => {
          const districts = structuredClone(state.districts);
          let comp: Companionship | undefined;

          for (const district of districts) {
            const idx = district.companionships.findIndex(
              (c) => c.id === companionshipId
            );
            if (idx !== -1) {
              comp = district.companionships.splice(idx, 1)[0];
              break;
            }
          }

          if (!comp) return state;

          const target = districts.find((d) => d.id === toDistrictId);
          if (target) {
            target.companionships.push(comp);
            target.companionships.sort((a, b) => {
              const aName = a.ministers[0]?.name ?? "";
              const bName = b.ministers[0]?.name ?? "";
              const aLast = aName.split(",")[0] ?? "";
              const bLast = bName.split(",")[0] ?? "";
              return aLast.localeCompare(bLast);
            });
          }

          return { districts };
        }),

      createCompanionship: (districtId: string) =>
        set((state) => {
          const districts = structuredClone(state.districts);
          const district = districts.find((d) => d.id === districtId);
          if (!district) return state;

          district.companionships.push({
            id: generateId(),
            ministers: [],
            assignments: [],
          });

          return { districts };
        }),

      removeEmptyCompanionship: (companionshipId: string) =>
        set((state) => {
          const districts = structuredClone(state.districts);
          for (const district of districts) {
            const idx = district.companionships.findIndex(
              (c) => c.id === companionshipId
            );
            if (idx !== -1) {
              const comp = district.companionships[idx];
              if (
                comp.ministers.length === 0 &&
                comp.assignments.length === 0
              ) {
                district.companionships.splice(idx, 1);
              }
              break;
            }
          }
          return { districts };
        }),

      createDistrict: (name: string) =>
        set((state) => ({
          districts: [
            ...state.districts,
            {
              id: generateId(),
              name,
              supervisorName: "",
              supervisorId: "",
              companionships: [],
            },
          ],
        })),

      renameDistrict: (districtId: string, name: string) =>
        set((state) => {
          const districts = structuredClone(state.districts);
          const district = districts.find((d) => d.id === districtId);
          if (district) district.name = name;
          return { districts };
        }),

      removeEmptyDistrict: (districtId: string) =>
        set((state) => {
          const district = state.districts.find((d) => d.id === districtId);
          if (district && district.companionships.length === 0) {
            return {
              districts: state.districts.filter((d) => d.id !== districtId),
            };
          }
          return state;
        }),

      exportState: () => {
        const { districts, unassignedMinisters, unassignedFamilies, people } =
          get();
        return JSON.stringify(
          { districts, unassignedMinisters, unassignedFamilies, people },
          null,
          2
        );
      },
    }),
    {
      name: "ministering-helper-storage",
      partialize: (state) => ({
        districts: state.districts,
        unassignedMinisters: state.unassignedMinisters,
        unassignedFamilies: state.unassignedFamilies,
        people: state.people,
        originalState: state.originalState,
        hasImported: state.hasImported,
        nameFormat: state.nameFormat,
      }),
    }
  )
);

export function getInitials(name: string): string {
  // Handle "Last, First" or "Last, First & Spouse" format
  const parts = name.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const last = parts[0];
    const first = parts[1].split(/[\s&]/)[0].trim();
    return (first[0] + last[0]).toUpperCase();
  }
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function nameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-amber-600",
    "bg-cyan-600",
    "bg-rose-500",
    "bg-emerald-600",
    "bg-violet-500",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function getPersonDetails(
  people: Record<string, Person>,
  personId: string
): Person | undefined {
  return people[personId];
}

/**
 * Convert a "Last, First" name to "First Last" format.
 * Handles spouse names like "Freestone, Greg & Charlene" → "Greg & Charlene Freestone"
 */
function toFirstLast(name: string): string {
  const commaIdx = name.indexOf(",");
  if (commaIdx === -1) return name;
  const last = name.slice(0, commaIdx).trim();
  const rest = name.slice(commaIdx + 1).trim();
  return `${rest} ${last}`;
}

export function displayName(name: string, format: NameFormat): string {
  if (format === "firstLast") return toFirstLast(name);
  return name;
}

export function districtColor(name: string): {
  bg: string;
  border: string;
  bgDark: string;
  borderDark: string;
} {
  // FNV-1a hash
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Golden ratio spread to avoid similar names landing on similar hues
  const hue = Math.round(((hash >>> 0) * 0.618033988749895 * 360) % 360);
  return {
    bg: `hsl(${hue} 60% 95%)`,
    border: `hsl(${hue} 50% 80%)`,
    bgDark: `hsl(${hue} 30% 15%)`,
    borderDark: `hsl(${hue} 30% 30%)`,
  };
}
