/**
 * Photo Downloader for Ministering Helper
 *
 * Instructions:
 * 1. Log into https://directory.churchofjesuschrist.org in your browser
 * 2. Open DevTools (Cmd+Option+I) → Console tab
 * 3. Paste this entire script and press Enter
 * 4. When prompted, select your members.json file
 * 5. Wait for it to finish — it will download a member-photos.json file
 *
 * Then run: node extract-photos.cjs
 * to extract individual images into public/images/
 */

(async function downloadMemberPhotos() {
  // Prompt user to select their members.json file
  console.log("Select your members.json file...");
  var input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  var fileText = await new Promise(function(resolve) {
    input.onchange = function() {
      if (input.files && input.files[0]) {
        input.files[0].text().then(resolve);
      } else {
        resolve(null);
      }
    };
    input.click();
  });

  if (!fileText) {
    console.log("No file selected.");
    return;
  }

  var members;
  try {
    members = JSON.parse(fileText);
  } catch (e) {
    console.log("Failed to parse JSON file.");
    return;
  }

  // Extract UUIDs — supports both members.json format (array with .member.uuid)
  // and a plain array of UUID strings
  var UUIDS;
  if (Array.isArray(members) && members.length > 0) {
    if (typeof members[0] === "string") {
      UUIDS = members;
    } else if (members[0].member && members[0].member.uuid) {
      UUIDS = members.map(function(m) { return m.member.uuid; });
    }
  }

  if (!UUIDS || UUIDS.length === 0) {
    console.log("Could not extract UUIDs from file. Expected members.json format.");
    return;
  }

  console.log("Found " + UUIDS.length + " member UUIDs. Starting download...");

  var BATCH_SIZE = 10;
  var DELAY_MS = 200;
  var results = {};
  var downloaded = 0;
  var skipped = 0;
  var failed = 0;

  console.log("Starting download of " + UUIDS.length + " member photos...");

  for (var i = 0; i < UUIDS.length; i += BATCH_SIZE) {
    var batch = UUIDS.slice(i, i + BATCH_SIZE);
    var promises = batch.map(async function(uuid) {
      try {
        var url = "https://directory.churchofjesuschrist.org/api/v4/photos/members/" + uuid + "?thumbnail=true";
        var resp = await fetch(url, { credentials: "include" });

        if (!resp.ok) {
          skipped++;
          return;
        }

        var contentType = resp.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
          skipped++;
          return;
        }

        var blob = await resp.blob();
        if (blob.size < 500) {
          skipped++;
          return;
        }

        results[uuid] = blob;
        downloaded++;
      } catch (e) {
        failed++;
      }
    });

    await Promise.all(promises);

    var progress = Math.min(i + BATCH_SIZE, UUIDS.length);
    console.log("Progress: " + progress + "/" + UUIDS.length + " checked | " + downloaded + " photos | " + skipped + " skipped | " + failed + " failed");

    if (i + BATCH_SIZE < UUIDS.length) {
      await new Promise(function(r) { setTimeout(r, DELAY_MS); });
    }
  }

  console.log("Done! " + downloaded + " photos downloaded, " + skipped + " skipped (no photo), " + failed + " failed.");

  if (downloaded === 0) {
    console.log("No photos to save.");
    return;
  }

  console.log("Saving photos to localStorage. Run the next step in the ministering-helper app console to extract them.");
  console.log("Building base64 data...");

  var photoData = {};
  var uuidKeys = Object.keys(results);
  for (var k = 0; k < uuidKeys.length; k++) {
    var uuid = uuidKeys[k];
    var reader = new FileReader();
    var b64 = await new Promise(function(resolve) {
      reader.onload = function() { resolve(reader.result); };
      reader.readAsDataURL(results[uuid]);
    });
    photoData[uuid] = b64;
  }

  var jsonStr = JSON.stringify(photoData);
  console.log("Data size: " + Math.round(jsonStr.length / 1024 / 1024) + " MB");

  var blob = new Blob([jsonStr], { type: "application/json" });
  var dlUrl = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = dlUrl;
  a.download = "member-photos.json";
  a.click();
  URL.revokeObjectURL(dlUrl);

  console.log("Downloaded member-photos.json! Now run the extract script to convert to individual files.");
})();
