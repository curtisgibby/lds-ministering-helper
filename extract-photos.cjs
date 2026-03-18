/**
 * Extract photos from member-photos.json into public/images/{uuid}.jpg
 *
 * Usage:
 *   node extract-photos.js [path-to-member-photos.json]
 *
 * If no path is given, it looks for member-photos.json in the current directory.
 */

const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2] || "member-photos.json";
const outputDir = path.join(__dirname, "public", "images");

if (!fs.existsSync(inputPath)) {
  console.error("File not found: " + inputPath);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Reading " + inputPath + "...");
const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const uuids = Object.keys(data);
console.log("Found " + uuids.length + " photos.");

let written = 0;
for (const uuid of uuids) {
  const dataUrl = data[uuid];
  // data:image/jpeg;base64,/9j/4AAQ...
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) continue;
  const base64 = dataUrl.slice(commaIdx + 1);
  const buffer = Buffer.from(base64, "base64");
  fs.writeFileSync(path.join(outputDir, uuid + ".jpg"), buffer);
  written++;
}

console.log("Wrote " + written + " images to " + outputDir);
