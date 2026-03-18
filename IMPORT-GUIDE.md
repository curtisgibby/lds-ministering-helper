# How to Export Your Ward's Ministering Data

This guide walks you through downloading the two JSON files that Ministering Helper needs. You'll need a calling that gives you access to the Ministering page in Leader and Clerk Resources (LCR) — typically a member of the bishopric, EQ presidency, or RS presidency.

**Estimated time:** 5 minutes

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- Access to the Ministering section of LCR (Leader and Clerk Resources)

## Step 1: Log in to LCR and open Developer Tools

1. Go to [lcr.churchofjesuschrist.org](https://lcr.churchofjesuschrist.org) and sign in with your Church account
2. Open your browser's Developer Tools:
   - **Chrome / Edge:** Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - **Firefox:** Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - **Safari:** First enable Developer Tools in Safari > Settings > Advanced > "Show features for web developers", then press `Cmd+Option+I`
3. Click the **Network** tab
4. In the Network tab's filter bar, click **XHR** to show only API requests

![Network tab with XHR filter](/public/images/console-network-tab-xhr.png)

## Step 2: Navigate to the Ministering page

1. In LCR, navigate to **Ministering and Welfare > Ministering**
2. Make sure you're on the **Ministering Brothers** (Elders Quorum) or **Ministering Sisters** (Relief Society) page
3. You should see several network requests appear in the Developer Tools

## Step 3: Download the Companionships file

1. In the Network tab, look for a request to `data-full` — the full URL looks like:

   ```plaintext
   https://lcr.churchofjesuschrist.org/api/umlu/v1/ministering/data-full?lang=eng&type=EQ&unitNumber=XXXXXX
   ```

   (For Relief Society, it will say `&type=RS` instead of `&type=EQ`)
2. Right-click on that request and select **Save Response As**

   ![Save Response As for data-full](/public/images/console-data-full-save-response-as.png)

3. Save the file as `companionships.json`

**How to identify this file:** The JSON starts with `{"elders":[{"companionships":[...` (or `{"reliefSociety":[...` for RS). It contains districts, companionships, ministers, and assignments.

## Step 4: Download the Members file

1. In the same Network tab, look for a request to `ministering-members` — the full URL looks like:

   ```plaintext
   https://lcr.churchofjesuschrist.org/api/umlu/v1/ministering/ministering-members?lang=eng&assignType=EQ
   ```

   This is the largest request (1+ MB). It contains every member in the ward.
2. Right-click on that request and select **Save Response As**

   ![Save Response As for ministering-members](/public/images/console-ministering-members-save-response-as.png)

3. Save it as `members.json`

**How to identify this file:** The JSON is an array that starts with `[{"eligibleMinister":false,"member":{"nameFormats":...`. Each entry represents one ward member with their name, contact info, address, and household details.

**Tip:** If you don't see these requests, try refreshing the page (`Ctrl+R` / `Cmd+R`) with the Network tab open.

## Step 5: Import into Ministering Helper

1. Open Ministering Helper in your browser
2. Upload both files using the import form
3. You're ready to go!

![Import dialog](/public/images/import.png)

## Optional: Download member photos

Member photos require an extra step because they're served from a separate authenticated API.

1. While logged into [directory.churchofjesuschrist.org](https://directory.churchofjesuschrist.org), open the browser console (Developer Tools > **Console** tab)
2. Copy and paste the contents of `download-photos.js` (included with Ministering Helper) and press Enter
3. When a file picker appears, select the `members.json` file you saved in Step 4
4. Wait for it to finish — it will log progress as it downloads each batch
5. It will download a `member-photos.json` file to your Downloads folder
6. Move `member-photos.json` into the ministering-helper project folder
7. In your terminal, run:

   ```bash
   node extract-photos.cjs
   ```

8. This extracts all photos into `public/images/{uuid}.jpg`
9. Refresh the app to see photos

**Note:** This step is optional. The app works fine with initials-based avatars if you skip this. Not all members will have photos — those without photos will continue to show initials.

## Troubleshooting

### "I can't see the Ministering page"

You need a calling that grants access: bishopric member, EQ/RS presidency, or ward clerk. Talk to your bishop or clerk if you think you should have access.

### "I don't see any network requests"

Make sure the Network tab is open *before* you navigate to the Ministering page. The tab only captures requests made while it's open. Try refreshing the page with the Network tab open. Also make sure you have **XHR** selected as the filter type.

### "The response says 'Response has been truncated'"

This is just a display issue — the full response is still there. Use the "Copy response" right-click option (Chrome/Edge) to get the complete data.

### "The JSON looks different than expected"

The Church occasionally updates their systems. If the import fails, open an issue on GitHub with a description of what the JSON structure looks like (but **do not** share actual member data).

### "The photo download script doesn't run"

Make sure you're running it on `directory.churchofjesuschrist.org`, not `lcr.churchofjesuschrist.org`. The photo API is on the directory domain. Also, some browsers may block pasting into the console — look for a message asking you to type "allow pasting" first.

## Privacy Note

All data stays on your computer. Ministering Helper runs entirely in your browser — no member data is ever sent to any server. Your ward's information is stored only in your browser's local storage and can be cleared at any time by clicking "Re-import" or clearing your browser data.

The photo download script runs in your browser and uses your existing authenticated session — no passwords are stored or transmitted. The downloaded photos are saved as local files on your machine only.
