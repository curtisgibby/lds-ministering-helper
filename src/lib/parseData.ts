import type {
  Person,
  Minister,
  Assignment,
  Companionship,
  District,
  MinisteringState,
} from "./types";

interface RawFamilyMember {
  eligibleMinister: boolean;
  member: {
    nameFormats: {
      listPreferredLocal: string;
      givenPreferredLocal: string;
      familyPreferredLocal: string;
    };
    uuid: string;
    age: number;
    emails: Array<{ email: string }> | null;
    phones: Array<{ number: string }> | null;
    phoneNumber: string | null;
    priesthoodOffice: string;
    sex: "M" | "F";
    householdMember: {
      householdRole: string;
      household: {
        uuid: string;
        familyNameLocal: string;
        directoryPreferredLocal: string;
        address: {
          addressLines: string[];
        } | null;
      };
    };
  };
}

interface RawMinister {
  personUuid: string;
  name: string;
  age: number;
  priesthoodOffice: string;
  email?: string;
  youthBasedOnAge: boolean;
}

interface RawAssignment {
  personUuid: string;
  name: string;
  age: number;
}

interface RawCompanionship {
  id: string;
  ministers: RawMinister[];
  assignments: RawAssignment[];
}

interface RawDistrict {
  districtName: string;
  districtUuid: string;
  supervisorName: string;
  supervisorPersonUuid: string;
  companionships: RawCompanionship[];
}

interface RawCompanionshipsFile {
  elders?: RawDistrict[];
  reliefSociety?: RawDistrict[];
}

function parsePerson(raw: RawFamilyMember): Person {
  const m = raw.member;
  const hh = m.householdMember.household;
  return {
    id: m.uuid,
    name: m.nameFormats.listPreferredLocal,
    firstName: m.nameFormats.givenPreferredLocal,
    lastName: m.nameFormats.familyPreferredLocal,
    age: m.age,
    sex: m.sex,
    email: m.emails?.[0]?.email ?? null,
    phone: m.phoneNumber ?? m.phones?.[0]?.number ?? null,
    priesthoodOffice: m.priesthoodOffice,
    householdId: hh.uuid,
    householdName: hh.directoryPreferredLocal,
    householdRole: m.householdMember.householdRole,
    address: hh.address?.addressLines?.join(", ") ?? null,
    addressLines: hh.address?.addressLines ?? [],
    eligibleMinister: raw.eligibleMinister,
  };
}

function parseMinister(raw: RawMinister): Minister {
  return {
    personId: raw.personUuid,
    name: raw.name,
    age: raw.age,
    priesthoodOffice: raw.priesthoodOffice,
    email: raw.email ?? null,
    youthBasedOnAge: raw.youthBasedOnAge,
  };
}

function parseAssignment(raw: RawAssignment): Assignment {
  return {
    personId: raw.personUuid,
    name: raw.name,
    age: raw.age,
  };
}

function parseCompanionship(raw: RawCompanionship): Companionship {
  return {
    id: raw.id,
    ministers: raw.ministers.map(parseMinister),
    assignments: raw.assignments.map(parseAssignment),
  };
}

function parseDistrict(raw: RawDistrict): District {
  return {
    id: raw.districtUuid,
    name: raw.districtName,
    supervisorName: raw.supervisorName,
    supervisorId: raw.supervisorPersonUuid,
    companionships: raw.companionships.map(parseCompanionship),
  };
}

export function parseMinisteringData(
  familiesJson: RawFamilyMember[],
  companionshipsJson: RawCompanionshipsFile
): MinisteringState {
  // Build people lookup
  const people: Record<string, Person> = {};
  for (const raw of familiesJson) {
    const person = parsePerson(raw);
    people[person.id] = person;
  }

  // Parse districts — detect EQ vs RS
  const isElders = !!companionshipsJson.elders;
  const rawDistricts =
    companionshipsJson.elders ??
    companionshipsJson.reliefSociety ??
    [];
  const districts = rawDistricts.map(parseDistrict);

  // Track who's assigned
  const assignedMinisterIds = new Set<string>();
  const assignedFamilyIds = new Set<string>();

  for (const district of districts) {
    for (const comp of district.companionships) {
      for (const minister of comp.ministers) {
        assignedMinisterIds.add(minister.personId);
        if (!people[minister.personId]) {
          console.warn(
            `[parseMinisteringData] Minister "${minister.name}" references personId ${minister.personId} which was not found in the families data.`
          );
        }
      }
      for (const assignment of comp.assignments) {
        assignedFamilyIds.add(assignment.personId);
        const person = people[assignment.personId];
        if (!person) {
          console.warn(
            `[parseMinisteringData] Assignment "${assignment.name}" references personId ${assignment.personId} which was not found in the families data. This family will not appear in the unassigned pool.`
          );
        } else if (isElders && person.householdRole !== "HEAD") {
          console.warn(
            `[parseMinisteringData] Assignment "${assignment.name}" references personId ${assignment.personId} who has role "${person.householdRole}" instead of "HEAD". This family may not be tracked correctly.`
          );
        }
      }
    }
  }

  // Build unassigned lists
  // Unassigned ministers: eligible people not currently assigned as a minister
  const unassignedMinisters: Minister[] = [];
  for (const person of Object.values(people)) {
    if (person.eligibleMinister && !assignedMinisterIds.has(person.id)) {
      unassignedMinisters.push({
        personId: person.id,
        name: person.name,
        age: person.age,
        priesthoodOffice: person.priesthoodOffice,
        email: person.email,
        youthBasedOnAge: person.age < 18,
      });
    }
  }
  unassignedMinisters.sort((a, b) => a.name.localeCompare(b.name));

  // Unassigned families/sisters
  const unassignedFamilies: Assignment[] = [];
  if (isElders) {
    // EQ: household heads not assigned to any companionship
    const householdHeads = Object.values(people).filter(
      (p) => p.householdRole === "HEAD"
    );
    for (const head of householdHeads) {
      if (!assignedFamilyIds.has(head.id)) {
        unassignedFamilies.push({
          personId: head.id,
          name: head.householdName,
          age: head.age,
        });
      }
    }
  } else {
    // RS: individual adult women not assigned to any companionship
    for (const person of Object.values(people)) {
      if (person.sex === "F" && person.age >= 18 && !assignedFamilyIds.has(person.id)) {
        unassignedFamilies.push({
          personId: person.id,
          name: person.name,
          age: person.age,
        });
      }
    }
  }
  unassignedFamilies.sort((a, b) => a.name.localeCompare(b.name));

  return { districts, unassignedMinisters, unassignedFamilies, people };
}
