export interface Person {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: "M" | "F";
  email: string | null;
  phone: string | null;
  priesthoodOffice: string;
  householdId: string;
  householdName: string;
  householdRole: string;
  address: string | null;
  eligibleMinister: boolean;
}

export interface Minister {
  personId: string;
  name: string;
  age: number;
  priesthoodOffice: string;
  email: string | null;
  youthBasedOnAge: boolean;
}

export interface Assignment {
  personId: string;
  name: string;
  age: number;
}

export interface Companionship {
  id: string;
  ministers: Minister[];
  assignments: Assignment[];
}

export interface District {
  id: string;
  name: string;
  supervisorName: string;
  supervisorId: string;
  companionships: Companionship[];
}

export interface MinisteringState {
  districts: District[];
  unassignedMinisters: Minister[];
  unassignedFamilies: Assignment[];
  people: Record<string, Person>;
}
