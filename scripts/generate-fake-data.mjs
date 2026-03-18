/**
 * Generate fake ward data from real JSON structure.
 * Replaces all PII with realistic faker data while preserving
 * the structural relationships (districts, companionships, assignments).
 *
 * Usage: node scripts/generate-fake-data.mjs <members.json> <companionships-eq.json> [companionships-rs.json]
 *
 * Outputs to examples/ directory:
 *   members.json, companionships-eq.json, companionships-rs.json
 */

import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";

faker.seed(42);

const membersPath = process.argv[2];
const eqPath = process.argv[3];
const rsPath = process.argv[4];

if (!membersPath || !eqPath) {
  console.error(
    "Usage: node scripts/generate-fake-data.mjs <members.json> <companionships-eq.json> [companionships-rs.json]"
  );
  process.exit(1);
}

var members = JSON.parse(fs.readFileSync(membersPath, "utf-8"));
var eqData = JSON.parse(fs.readFileSync(eqPath, "utf-8"));
var rsData = rsPath ? JSON.parse(fs.readFileSync(rsPath, "utf-8")) : null;

// --- Config ---
var WARD_NAME = "Maplewood 3rd Ward";
var UNIT_NUMBER = 100042;
var BASE_STREETS = [
  "Elm St", "Maple Ave", "Oak Dr", "Pine Ln", "Cedar Ct",
  "Birch Way", "Aspen Rd", "Willow Cir", "Spruce Blvd", "Juniper Pl",
  "Cherry Ln", "Walnut St", "Poplar Dr", "Hickory Ave", "Magnolia Way",
];
var CITY = "Maplewood";
var STATE = "UT";
var ZIP_BASE = "84601";
var AREA_CODES = ["801", "385", "435"];
var DISTRICT_NAMES = ["District 1", "District 2", "District 3", "District 4", "District 5"];

// --- Common names pool (75% chance) ---
var COMMON_LAST = [
  "Anderson", "Baker", "Bennett", "Brown", "Campbell", "Carter", "Clark",
  "Collins", "Cook", "Cooper", "Davis", "Edwards", "Evans", "Garcia",
  "Green", "Hall", "Harris", "Hill", "Hughes", "Jackson", "James",
  "Jenkins", "Johnson", "Jones", "King", "Lee", "Lewis", "Martin",
  "Miller", "Mitchell", "Moore", "Morgan", "Morris", "Murphy", "Nelson",
  "Palmer", "Parker", "Peterson", "Phillips", "Price", "Reed", "Reynolds",
  "Richardson", "Roberts", "Robinson", "Rogers", "Ross", "Russell",
  "Scott", "Shaw", "Simmons", "Smith", "Stewart", "Taylor", "Thomas",
  "Thompson", "Turner", "Walker", "Ward", "Watson", "White", "Williams",
  "Wilson", "Wood", "Wright", "Young",
];
var COMMON_FIRST_F = [
  "Abigail", "Allison", "Amanda", "Amber", "Amy", "Andrea", "Angela",
  "Anna", "Anne", "Ashley", "Barbara", "Becky", "Beth", "Betty",
  "Beverly", "Bonnie", "Brenda", "Brittany", "Brooke", "Caitlin",
  "Carla", "Carol", "Carolyn", "Catherine", "Charlotte", "Chelsea",
  "Cheryl", "Christina", "Christine", "Cindy", "Claire", "Colleen",
  "Connie", "Courtney", "Crystal", "Cynthia", "Dana", "Danielle",
  "Darlene", "Dawn", "Deborah", "Denise", "Diana", "Diane", "Donna",
  "Dorothy", "Eileen", "Elaine", "Elizabeth", "Ellen", "Emily", "Emma",
  "Erica", "Erin", "Frances", "Gail", "Gloria", "Grace", "Hailey",
  "Hannah", "Heather", "Helen", "Holly", "Irene", "Jackie", "Jamie",
  "Jane", "Janet", "Janice", "Jean", "Jenna", "Jennifer", "Jenny",
  "Jessica", "Jill", "Joan", "Joanne", "Jodi", "Joyce", "Judith",
  "Judy", "Julia", "Julie", "June", "Karen", "Kate", "Katherine",
  "Kathleen", "Kathy", "Katie", "Kay", "Kelly", "Kelsey", "Kendra",
  "Kimberly", "Kristen", "Kristin", "Laura", "Lauren", "Laurie",
  "Leah", "Leslie", "Linda", "Lisa", "Lori", "Lynn", "Madison",
  "Margaret", "Maria", "Marie", "Marilyn", "Marsha", "Martha", "Mary",
  "Maureen", "Megan", "Melissa", "Michelle", "Molly", "Monica", "Nancy",
  "Natalie", "Nicole", "Norma", "Olivia", "Pam", "Pamela", "Patricia",
  "Paula", "Peggy", "Penny", "Rachel", "Rebecca", "Renee", "Robin",
  "Rose", "Ruth", "Samantha", "Sandra", "Sandy", "Sara", "Sarah",
  "Shannon", "Sharon", "Sheila", "Sherry", "Shirley", "Sophia",
  "Stacy", "Stephanie", "Sue", "Susan", "Suzanne", "Tammy", "Tanya",
  "Teresa", "Terri", "Theresa", "Tiffany", "Tina", "Tracy", "Valerie",
  "Vanessa", "Vicki", "Victoria", "Virginia", "Wendy",
];
var COMMON_FIRST_M = [
  "Aaron", "Adam", "Alan", "Albert", "Alex", "Allen", "Andrew",
  "Anthony", "Arthur", "Barry", "Ben", "Benjamin", "Bill", "Billy",
  "Blake", "Bob", "Brad", "Bradley", "Brandon", "Brent", "Brett",
  "Brian", "Bruce", "Bryan", "Caleb", "Calvin", "Carl", "Carter",
  "Chad", "Charles", "Chris", "Clark", "Clayton", "Cody", "Cole",
  "Colin", "Connor", "Craig", "Curtis", "Dale", "Dan", "Daniel",
  "Danny", "Darrell", "Darren", "Dave", "David", "Dean", "Dennis",
  "Derek", "Don", "Donald", "Doug", "Douglas", "Drew", "Dustin",
  "Dylan", "Earl", "Ed", "Edward", "Eric", "Ethan", "Eugene",
  "Evan", "Frank", "Fred", "Garrett", "Gary", "Gene", "George",
  "Glen", "Gordon", "Grant", "Greg", "Harold", "Harry", "Henry",
  "Howard", "Hunter", "Jack", "Jacob", "Jake", "James", "Jason",
  "Jay", "Jeff", "Jeffrey", "Jeremy", "Jerry", "Jesse", "Jim",
  "Joe", "Joel", "John", "Jon", "Jonathan", "Jordan", "Joseph",
  "Josh", "Joshua", "Justin", "Keith", "Ken", "Kenneth", "Kent",
  "Kevin", "Kirk", "Kurt", "Kyle", "Lance", "Larry", "Lee",
  "Leo", "Leon", "Logan", "Luke", "Mark", "Martin", "Marvin",
  "Matt", "Matthew", "Max", "Michael", "Mike", "Mitchell", "Nathan",
  "Neil", "Nelson", "Nick", "Noah", "Norman", "Owen", "Patrick",
  "Paul", "Pete", "Peter", "Phil", "Preston", "Ralph", "Randy",
  "Ray", "Raymond", "Reed", "Rex", "Richard", "Rick", "Rob",
  "Robert", "Rod", "Roger", "Ron", "Ronald", "Ross", "Roy",
  "Russell", "Ryan", "Sam", "Samuel", "Scott", "Sean", "Seth",
  "Shane", "Shawn", "Spencer", "Stan", "Stephen", "Steve", "Steven",
  "Stuart", "Ted", "Terry", "Thomas", "Tim", "Timothy", "Todd",
  "Tom", "Tony", "Travis", "Trevor", "Troy", "Tyler", "Vern",
  "Victor", "Wade", "Walter", "Warren", "Wayne", "Wesley", "Will",
  "William", "Wyatt", "Zach",
];

function pickLastName() {
  if (Math.random() < 0.80) {
    return COMMON_LAST[Math.floor(Math.random() * COMMON_LAST.length)];
  }
  return faker.person.lastName();
}

function pickFirstName(sex) {
  // Always draw from our curated pools to guarantee sex-appropriate names
  var pool = sex === "F" ? COMMON_FIRST_F : COMMON_FIRST_M;
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- UUID mapping ---
var uuidMap = new Map();
function mapUuid(realUuid) {
  if (!uuidMap.has(realUuid)) {
    uuidMap.set(realUuid, faker.string.uuid());
  }
  return uuidMap.get(realUuid);
}

// --- Household + person name tracking ---
var householdLastNames = new Map();
function getHouseholdLastName(householdUuid) {
  if (!householdLastNames.has(householdUuid)) {
    householdLastNames.set(householdUuid, pickLastName());
  }
  return householdLastNames.get(householdUuid);
}

var personNames = new Map();

function generatePersonName(realUuid, sex, householdUuid) {
  if (personNames.has(realUuid)) return personNames.get(realUuid);
  var lastName = getHouseholdLastName(householdUuid);
  var firstName = pickFirstName(sex);
  // ~25% get a middle name
  if (Math.random() < 0.25) {
    firstName = firstName + " " + pickFirstName(sex);
  }
  var entry = {
    first: firstName,
    last: lastName,
    listFormat: lastName + ", " + firstName,
  };
  personNames.set(realUuid, entry);
  return entry;
}

function fakePhone() {
  var area = AREA_CODES[Math.floor(Math.random() * AREA_CODES.length)];
  return area + "-555-" + faker.string.numeric(4);
}

function fakeAddress() {
  var num = faker.number.int({ min: 50, max: 2500 });
  var dir = faker.helpers.arrayElement(["N", "S", "E", "W"]);
  var street = BASE_STREETS[Math.floor(Math.random() * BASE_STREETS.length)];
  var line1 = num + " " + dir + " " + street;
  var zipSuffix = faker.string.numeric(4);
  var line2 = CITY + " " + STATE + " " + ZIP_BASE + "-" + zipSuffix;
  return { line1: line1, line2: line2, lines: [line1, line2] };
}

function fakeEmail(firstName, lastName) {
  var domain = faker.helpers.arrayElement([
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "comcast.net", "msn.com",
  ]);
  var user = faker.helpers.arrayElement([
    firstName.toLowerCase() + lastName.toLowerCase(),
    firstName.toLowerCase() + "." + lastName.toLowerCase(),
    firstName.toLowerCase() + faker.string.numeric(2),
    firstName.toLowerCase()[0] + lastName.toLowerCase(),
  ]);
  return user + "@" + domain;
}

// --- Fake members ---
function fakeMember(raw) {
  var m = raw.member;
  var hh = m.householdMember.household;
  var realUuid = m.uuid;
  var householdUuid = hh.uuid;
  var role = m.householdMember.householdRole;

  var name = generatePersonName(realUuid, m.sex, householdUuid);
  var phone = fakePhone();
  var email = fakeEmail(name.first, name.last);
  var addr = fakeAddress();

  return {
    eligibleMinister: raw.eligibleMinister,
    member: {
      nameFormats: {
        listPreferredLocal: name.listFormat,
        givenPreferredLocal: name.first,
        familyPreferredLocal: name.last,
        listPreferred: null, listOfficial: null, spokenPreferredLocal: null,
        certificateChurchOfficerLocal: null, certificateOfficialLocal: null,
      },
      uuid: mapUuid(realUuid),
      nameOrder: m.nameOrder,
      age: m.age,
      mrn: null,
      emails: [{ email: email, ownerType: null, useType: null }],
      phones: [{ number: phone, localNumber: null, ownerType: null, useType: null, internationalFormat: null }],
      phoneNumber: phone,
      priesthoodOffice: m.priesthoodOffice,
      membershipUnit: null,
      legacyCmisId: faker.number.int({ min: 100000000, max: 9999999999 }),
      sex: m.sex,
      unitOrgsCombined: (m.unitOrgsCombined || []).map(mapUuid),
      positions: null,
      preferredLanguage: null,
      householdMember: {
        householdRole: role,
        household: {
          anchorPerson: {
            legacyCmisId: faker.number.int({ min: 100000000, max: 9999999999 }),
            uuid: mapUuid(hh.anchorPerson.uuid),
          },
          uuid: mapUuid(householdUuid),
          familyNameLocal: name.last,
          directoryPreferredLocal: name.listFormat,
          address: {
            formattedLine1: addr.line1, formattedLine2: addr.line2,
            formattedLine3: null, formattedLine4: null, useType: null,
            formatted1: null, formatted2: null, formatted3: null,
            formatted4: null, formatted5: null, formatted6: null,
            addressLines: addr.lines, formattedAll: [],
          },
          emails: null, phones: null,
          unit: {
            parentUnit: null, uuid: null, unitNumber: UNIT_NUMBER,
            nameLatin: null, nameLocal: WARD_NAME, unitType: null,
            children: null, positions: null, cdolLink: null,
            adminUnit: null, addressUnknown: null,
          },
          membershipUnitFlag: true,
        },
      },
    },
  };
}

// --- Fake companionships ---
function lookupSex(realUuid, fallbackAssignType) {
  if (sexByUuid.has(realUuid)) return sexByUuid.get(realUuid);
  // Fallback: RS ministers are female, EQ ministers are male
  return fallbackAssignType === "RS" ? "F" : "M";
}

function fakeMinister(raw) {
  var realUuid = raw.personUuid;
  if (!personNames.has(realUuid)) {
    var sex = lookupSex(realUuid, raw.assignType);
    generatePersonName(realUuid, sex, faker.string.uuid());
  }
  var name = personNames.get(realUuid);
  return {
    personUuid: mapUuid(realUuid),
    legacyCmisId: faker.number.int({ min: 100000000, max: 9999999999 }),
    name: name.listFormat,
    nameSort: name.listFormat,
    email: fakeEmail(name.first, name.last),
    age: raw.age,
    priesthoodOffice: raw.priesthoodOffice,
    assignType: raw.assignType,
    unitOrgId: raw.unitOrgId ? mapUuid(raw.unitOrgId) : undefined,
    youthBasedOnAge: raw.youthBasedOnAge,
  };
}

function fakeAssignment(raw) {
  var realUuid = raw.personUuid;
  if (!personNames.has(realUuid)) {
    var sex = lookupSex(realUuid, raw.assignType);
    generatePersonName(realUuid, sex, faker.string.uuid());
  }
  var name = personNames.get(realUuid);

  var originalHasSpouse = raw.name.includes("&");
  var displayName = name.listFormat;
  if (originalHasSpouse) {
    var spouseFirst = faker.person.firstName("female");
    displayName = name.last + ", " + name.first + " & " + spouseFirst;
  }

  return {
    personUuid: mapUuid(realUuid),
    legacyCmisId: faker.number.int({ min: 100000000, max: 9999999999 }),
    name: displayName,
    nameSort: displayName,
    age: raw.age,
    assignType: raw.assignType,
    youthBasedOnAge: raw.youthBasedOnAge,
  };
}

function fakeCompanionship(raw) {
  return {
    id: faker.string.uuid(),
    ministers: raw.ministers.map(fakeMinister),
    assignments: raw.assignments.map(fakeAssignment),
    ministerErrors: [], ministerWarnings: [],
    assignmentErrors: [], assignmentWarnings: [],
    recentlyChangedDate: raw.recentlyChangedDate,
    recentlyChangedDateInMilliseconds: raw.recentlyChangedDateInMilliseconds,
  };
}

function fakeDistrict(raw, index, orgKey) {
  var supervisorUuid = raw.supervisorPersonUuid;
  if (!personNames.has(supervisorUuid)) {
    var sex = lookupSex(supervisorUuid, orgKey === "reliefSociety" ? "RS" : "EQ");
    generatePersonName(supervisorUuid, sex, faker.string.uuid());
  }
  var supervisorName = personNames.get(supervisorUuid);
  return {
    companionships: raw.companionships.map(fakeCompanionship),
    districtName: DISTRICT_NAMES[index] || "District " + (index + 1),
    districtUuid: faker.string.uuid(),
    supervisorName: supervisorName.listFormat,
    supervisorLegacyCmisId: faker.number.int({ min: 100000000, max: 9999999999 }),
    supervisorPersonUuid: mapUuid(supervisorUuid),
  };
}

function fakeCompanionshipsFile(data) {
  var orgKey = data.elders ? "elders" : "reliefSociety";
  var supervisorKey = data.elders ? "eldersQuorumSupervisors" : "reliefSocietySupervisors";
  var orgName = data.elders ? "Elders Quorum" : "Relief Society";

  var rawDistricts = data[orgKey];
  var fallbackSex = orgKey === "reliefSociety" ? "F" : "M";
  var fakeDistricts = rawDistricts.map(function(d, i) { return fakeDistrict(d, i, orgKey); });

  var fakeSupervisors = data[supervisorKey].map(function(s) {
    if (!personNames.has(s.personUuid)) {
      var sex = lookupSex(s.personUuid, orgKey === "reliefSociety" ? "RS" : "EQ");
      generatePersonName(s.personUuid, sex, faker.string.uuid());
    }
    var name = personNames.get(s.personUuid);
    return { personUuid: mapUuid(s.personUuid), name: name.listFormat, youthBasedOnAge: s.youthBasedOnAge };
  });

  var fakeUnitOrgs = data.unitOrgs.map(function(o) {
    return {
      children: null, unitOrgUuid: mapUuid(o.unitOrgUuid), unitUuid: null,
      unitNumber: null, unitOrgName: orgName, unitOrgTypeIds: o.unitOrgTypeIds, isClass: false,
    };
  });

  var result = {};
  result[orgKey] = fakeDistricts;
  result[supervisorKey] = fakeSupervisors;
  result.unitOrgs = fakeUnitOrgs;
  result.interviewViewAccess = false;
  result.error = false;
  return result;
}

// --- Build sex lookup from members file (source of truth) ---
var sexByUuid = new Map();
for (var rawMember of members) {
  sexByUuid.set(rawMember.member.uuid, rawMember.member.sex);
}

// --- Process members first (builds UUID map + name map) ---
console.log("Generating fake member data for " + members.length + " members...");
var fakeMembers = members.map(fakeMember);

// --- Process EQ companionships ---
console.log("Generating fake EQ companionship data...");
var fakeEq = fakeCompanionshipsFile(eqData);

// --- Process RS companionships (if provided) ---
var fakeRs = null;
if (rsData) {
  console.log("Generating fake RS companionship data...");
  fakeRs = fakeCompanionshipsFile(rsData);
}

// --- Write output ---
var outDir = path.join(path.dirname(membersPath), "examples");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

var membersOut = path.join(outDir, "members.json");
var eqOut = path.join(outDir, "companionships-eq.json");

fs.writeFileSync(membersOut, JSON.stringify(fakeMembers, null, 2));
fs.writeFileSync(eqOut, JSON.stringify(fakeEq, null, 2));
console.log("Wrote " + membersOut);
console.log("Wrote " + eqOut);

if (fakeRs) {
  var rsOut = path.join(outDir, "companionships-rs.json");
  fs.writeFileSync(rsOut, JSON.stringify(fakeRs, null, 2));
  console.log("Wrote " + rsOut);
}

console.log("UUID mappings: " + uuidMap.size + " | Person names: " + personNames.size);
