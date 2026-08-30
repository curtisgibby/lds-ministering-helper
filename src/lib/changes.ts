import type { Assignment, Companionship, District, Minister, MinisteringState } from "./types";

export type ChangeKind = "minister" | "assignment";

export interface ChangeLocation {
  key: string;
  districtName: string | null;
  companionshipName: string | null;
  label: string;
}

export interface PersonChange {
  kind: ChangeKind;
  personId: string;
  name: string;
  from: ChangeLocation;
  to: ChangeLocation;
}

export type OrganizationChangeKind =
  | "district-added"
  | "district-removed"
  | "district-renamed"
  | "companionship-added"
  | "companionship-removed"
  | "companionship-moved";

export interface OrganizationChange {
  kind: OrganizationChangeKind;
  name: string;
  from?: string;
  to?: string;
}

export interface ProposedChanges {
  ministerChanges: PersonChange[];
  assignmentChanges: PersonChange[];
  organizationChanges: OrganizationChange[];
  total: number;
}

const unassignedLocation = (kind: ChangeKind): ChangeLocation => ({
  key: `unassigned-${kind}`,
  districtName: null,
  companionshipName: null,
  label: "Unassigned",
});

function companionshipName(companionship: Companionship): string {
  const names = companionship.ministers.map((minister) => minister.name.split(",")[0]);
  if (names.length === 0) return "Empty companionship";
  if (names.length <= 2) return names.join(" & ");
  return `${names.slice(0, 2).join(" & ")} +${names.length - 2}`;
}

function makeLocation(
  kind: ChangeKind,
  district: District,
  companionship: Companionship
): ChangeLocation {
  return {
    key: `${kind}-${companionship.id}`,
    districtName: district.name,
    companionshipName: companionshipName(companionship),
    label: `${district.name} · ${companionshipName(companionship)}`,
  };
}

function locationIndex<T extends Minister | Assignment>(
  state: MinisteringState,
  kind: ChangeKind,
  getItems: (companionship: Companionship) => T[],
  unassignedItems: T[]
): Map<string, ChangeLocation> {
  const locations = new Map<string, ChangeLocation>();
  for (const district of state.districts) {
    for (const companionship of district.companionships) {
      const location = makeLocation(kind, district, companionship);
      for (const item of getItems(companionship)) {
        locations.set(item.personId, location);
      }
    }
  }
  const unassigned = unassignedLocation(kind);
  for (const item of unassignedItems) {
    locations.set(item.personId, unassigned);
  }
  return locations;
}

function personIndex<T extends Minister | Assignment>(
  state: MinisteringState,
  getItems: (companionship: Companionship) => T[],
  unassigned: T[]
): Map<string, T> {
  const people = new Map<string, T>();
  for (const district of state.districts) {
    for (const companionship of district.companionships) {
      for (const item of getItems(companionship)) people.set(item.personId, item);
    }
  }
  for (const item of unassigned) people.set(item.personId, item);
  return people;
}

function getPersonChanges<T extends Minister | Assignment>(
  original: MinisteringState,
  current: MinisteringState,
  kind: ChangeKind,
  getItems: (companionship: Companionship) => T[],
  getUnassigned: (state: MinisteringState) => T[]
): PersonChange[] {
  const originalLocations = locationIndex(original, kind, getItems, getUnassigned(original));
  const currentLocations = locationIndex(current, kind, getItems, getUnassigned(current));
  const originalPeople = personIndex(original, getItems, getUnassigned(original));
  const currentPeople = personIndex(current, getItems, getUnassigned(current));
  const personIds = new Set([...originalPeople.keys(), ...currentPeople.keys()]);
  const changes: PersonChange[] = [];

  for (const personId of personIds) {
    const from = originalLocations.get(personId) ?? unassignedLocation(kind);
    const to = currentLocations.get(personId) ?? unassignedLocation(kind);
    if (from.key === to.key) continue;

    const person = currentPeople.get(personId) ?? originalPeople.get(personId);
    if (!person) continue;
    changes.push({
      kind,
      personId,
      name: person.name,
      from,
      to,
    });
  }

  return changes.sort((a, b) => a.name.localeCompare(b.name));
}

function companionshipLabel(companionship: Companionship): string {
  return companionshipName(companionship);
}

function getOrganizationChanges(
  original: MinisteringState,
  current: MinisteringState
): OrganizationChange[] {
  const changes: OrganizationChange[] = [];
  const originalDistricts = new Map(original.districts.map((district) => [district.id, district]));
  const currentDistricts = new Map(current.districts.map((district) => [district.id, district]));

  for (const district of current.districts) {
    const previous = originalDistricts.get(district.id);
    if (!previous) {
      changes.push({ kind: "district-added", name: district.name });
    } else if (previous.name !== district.name) {
      changes.push({
        kind: "district-renamed",
        name: district.name,
        from: previous.name,
        to: district.name,
      });
    }
  }
  for (const district of original.districts) {
    if (!currentDistricts.has(district.id)) {
      changes.push({ kind: "district-removed", name: district.name });
    }
  }

  const originalCompanionships = new Map(
    original.districts.flatMap((district) =>
      district.companionships.map((companionship) => [companionship.id, { district, companionship }] as const)
    )
  );
  const currentCompanionships = new Map(
    current.districts.flatMap((district) =>
      district.companionships.map((companionship) => [companionship.id, { district, companionship }] as const)
    )
  );

  for (const { district, companionship } of currentCompanionships.values()) {
    const previous = originalCompanionships.get(companionship.id);
    if (!previous) {
      changes.push({
        kind: "companionship-added",
        name: companionshipLabel(companionship),
        to: district.name,
      });
    } else if (previous.district.id !== district.id) {
      changes.push({
        kind: "companionship-moved",
        name: companionshipLabel(companionship),
        from: previous.district.name,
        to: district.name,
      });
    }
  }
  for (const { district, companionship } of originalCompanionships.values()) {
    if (!currentCompanionships.has(companionship.id)) {
      changes.push({
        kind: "companionship-removed",
        name: companionshipLabel(companionship),
        from: district.name,
      });
    }
  }

  return changes.sort((a, b) => a.name.localeCompare(b.name));
}

export function getProposedChanges(
  current: MinisteringState,
  original: MinisteringState | null
): ProposedChanges {
  if (!original) {
    return { ministerChanges: [], assignmentChanges: [], organizationChanges: [], total: 0 };
  }

  const ministerChanges = getPersonChanges(
    original,
    current,
    "minister",
    (companionship) => companionship.ministers,
    (state) => state.unassignedMinisters
  );
  const assignmentChanges = getPersonChanges(
    original,
    current,
    "assignment",
    (companionship) => companionship.assignments,
    (state) => state.unassignedFamilies
  );
  const organizationChanges = getOrganizationChanges(original, current);

  return {
    ministerChanges,
    assignmentChanges,
    organizationChanges,
    total: ministerChanges.length + assignmentChanges.length + organizationChanges.length,
  };
}
