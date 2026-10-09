# Setup guide

One-time setup, about 20 minutes. After that the client only edits the Google Sheet.

## 1. Create the Google Sheet
1. Go to sheets.google.com > File > Import > Upload `sheet-template/website-content.xlsx` > **Create new spreadsheet**. You get one spreadsheet with three tabs: **Site**, **Projects**, **Messages**. Rename it e.g. "Website Content".
2. Don't rename the tabs or the header rows; the site looks them up by name.
3. In **Projects**, select the `visible` column (B2 down) and Insert > Checkbox, so the client ticks to show/hide.
4. Share > General access > **Anyone with the link: Viewer**. (The Messages tab is in the same file; see the privacy note in section 3.)
5. Copy the Sheet ID from the URL: `docs.google.com/spreadsheets/d/<THIS_PART>/edit`.

## 2. Get an API key (Sheets API, read only)
1. console.cloud.google.com > create a project.
2. APIs & Services > Library > enable **Google Sheets API**.
3. APIs & Services > Credentials > Create credentials > **API key**.
4. Edit the key and restrict it:
   - **Application restrictions:** Websites. Add the live URL (`https://<user>.github.io/*` or the custom domain) and `http://localhost:3000/*` for preview.
   - **API restrictions:** Restrict key > Google Sheets API only.
5. Paste the Sheet ID and key into `public/config.js`.

The key is visible in the page source. The restrictions above are what keep it safe; it can only read sheets that are already link-shared.

## 3. Contact form (Apps Script)
1. In the sheet: Extensions > Apps Script. Paste `apps-script/Code.gs`.
2. Set `NOTIFY_EMAIL` to the client's address.
3. Deploy > New deployment > type **Web app** > Execute as **Me**, Who has access **Anyone**. Authorize when asked.
4. Copy the web app URL into `CONTACT_ENDPOINT` in `public/config.js`.
5. Messages land in the **Messages** tab and are emailed to the client.

**Privacy note:** because the sheet is link-shared, anyone with the link could open the Messages tab. Keep the link private, or move form submissions to a second, private sheet by using `SpreadsheetApp.openById('<private sheet id>')` in `Code.gs` instead of `getActive()`.
Editing the Apps Script later requires Deploy > Manage deployments > Edit > New version.

## 4. Deploy to GitHub Pages
1. Push this folder to a GitHub repo (branch `main`).
2. Repo Settings > Pages > Source: **GitHub Actions**.
3. The included workflow publishes `public/` on every push.
4. Custom domain: Settings > Pages > Custom domain, and add that domain to the API key's website restrictions.

## 5. How the client edits
- **Site tab:** change the `value` column. Don't rename the `key` column entries.
- **Projects tab:** each row is a project. `order` sets position, untick `visible` to hide, add rows to add projects, `link` is optional.
- Changes show on the next page load (no waiting). Visitors who've been before see the old version for a split second while the new one loads.

## 5b. Timeline and Work tabs, new Site keys
The site now has a hero, a timeline and a contact form (no Work/About sections).
- Add a tab named exactly **Timeline** to the sheet (File > Import > `sheet-template/Timeline.csv` > Insert new sheet). Columns: `year`, `title`, `text`, `order`, `visible`. Each row is a dot on the line; `year` can be any text (e.g. "Now"). Until the tab exists, the page shows placeholder entries.
- Add a tab named exactly **Work** (import `sheet-template/Work.csv`). Columns: `year`, `title`, `publication`, `link`, `order`, `visible`. One row per published article. `link` is optional; rows without one show with no arrow and aren't clickable.
- New optional rows in the **Site** tab (key / value): `person_name`, `person_location` (top-left), `work_title`, `work_subtitle`, `contact_subtitle`, `linkedin_url`, `footer_name`. Existing `hero_title`, `hero_subtitle`, `contact_title` still apply.

## 6. Designing around it
- Text: `data-key="hero_title"` on any element.
- Links: `data-href-key="instagram_url"` on an `<a>`; it hides itself if the cell is empty.
- Repeating items: see the `data-list="Projects"` block in `public/index.html`. Add more tabs (e.g. `Services`) by adding the name to `TABS` in `config.js` and another `data-list` block. New tabs use a header row of column names, like Projects.
- Write sensible default text in the HTML. It shows first, and is what Google indexes.
- To add a new editable field, add its key to the Site tab and its `data-key` in the HTML.
