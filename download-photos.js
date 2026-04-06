/**
 * Photo Downloader for Ministering Helper
 *
 * Instructions:
 * 1. Log into https://directory.churchofjesuschrist.org in your browser
 * 2. Open DevTools (Cmd+Option+I) → Console tab
 * 3. Paste this entire script and press Enter
 * 4. Click the "Select members.json" button that appears at the top of the page
 * 5. Choose the members.json file you exported from LCR
 * 6. Wait for it to finish — it will download a member-photos.json file
 *
 * Then load member-photos.json into Ministering Helper via the import
 * dialog or Settings > Load photos.
 */

(function setupPhotoDownloader() {
  // Create a visible button so the file picker is triggered by a real user click
  var container = document.createElement("div");
  container.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:999999;background:#1e40af;color:white;padding:12px 20px;display:flex;align-items:center;gap:12px;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3)";

  var label = document.createElement("span");
  label.textContent = "Ministering Helper Photo Downloader:";
  label.style.fontWeight = "bold";

  var btn = document.createElement("button");
  btn.textContent = "Select members.json";
  btn.style.cssText = "background:white;color:#1e40af;border:none;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer";

  var status = document.createElement("span");
  status.textContent = "Select your members.json file to begin.";

  var input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";

  container.appendChild(label);
  container.appendChild(btn);
  container.appendChild(status);
  document.body.appendChild(container);
  document.body.appendChild(input);

  btn.onclick = function() { input.click(); };
  input.onchange = function() {
    if (input.files && input.files[0]) {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "default";
      input.files[0].text().then(function(text) {
        startDownload(text, status, container);
      });
    }
  };

  async function startDownload(fileText, statusEl, containerEl) {
    var members;
    try {
      members = JSON.parse(fileText);
    } catch (e) {
      statusEl.textContent = "Failed to parse JSON file.";
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
      statusEl.textContent = "Could not extract UUIDs from file. Expected members.json format.";
      return;
    }

    statusEl.textContent = "Found " + UUIDS.length + " members. Downloading photos...";
    console.log("Found " + UUIDS.length + " member UUIDs. Starting download...");

    var BATCH_SIZE = 10;
    var DELAY_MS = 200;
    var results = {};
    var downloaded = 0;
    var skipped = 0;
    var failed = 0;

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
      statusEl.textContent = progress + "/" + UUIDS.length + " checked — " + downloaded + " photos found";
      console.log("Progress: " + progress + "/" + UUIDS.length + " checked | " + downloaded + " photos | " + skipped + " skipped | " + failed + " failed");

      if (i + BATCH_SIZE < UUIDS.length) {
        await new Promise(function(r) { setTimeout(r, DELAY_MS); });
      }
    }

    console.log("Done! " + downloaded + " photos downloaded, " + skipped + " skipped (no photo), " + failed + " failed.");

    if (downloaded === 0) {
      statusEl.textContent = "No photos found.";
      return;
    }

    statusEl.textContent = "Building download file...";
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

    statusEl.textContent = downloaded + " photos saved! Load member-photos.json into Ministering Helper.";
    console.log("Downloaded member-photos.json! Load it into Ministering Helper via the import dialog or Settings > Load photos.");

    setTimeout(function() { containerEl.remove(); }, 10000);
  }
})();
