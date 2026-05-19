# Google Sheets webhook setup

1. Create a new Google Sheet. In the first row, set headers:
   `timestamp | name | email | quantity | country`
2. Extensions → Apps Script. Replace the contents of `Code.gs` with:

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), d.name, d.email, d.quantity, d.country
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New deployment → Type: Web app. Execute as: Me. Who has access: Anyone. Deploy.
4. Copy the Web app URL.
5. Put it in `.env.local`:
   `SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec`
6. On Vercel, set the same env var in Project Settings → Environment Variables.

To rotate, redeploy the Apps Script as a new version and replace the URL.
