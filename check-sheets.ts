import { google } from 'googleapis';
import * as fs from 'fs';

async function listAllSheets() {
    try {
        const credentialsPath = 'c:\\wise\\src\\main\\credentials.json';
        const tokenPath = 'C:\\Users\\shw\\AppData\\Roaming\\wise\\token.json';
        
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        
        const authClient = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        const tokenStr = fs.readFileSync(tokenPath, 'utf-8');
        authClient.setCredentials(JSON.parse(tokenStr));

        const drive = google.drive({ version: 'v3', auth: authClient });

        console.log(`Fetching all spreadsheets...`);
        const res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.spreadsheet'`,
            spaces: 'drive',
            fields: 'files(id, name, trashed, createdTime)',
            orderBy: 'createdTime desc',
            pageSize: 50
        });

        if (res.data.files && res.data.files.length > 0) {
            console.log("Recent Sheets:");
            res.data.files.forEach(f => {
                console.log(`- [${f.createdTime}] ${f.name} (ID: ${f.id}) [Trashed: ${f.trashed}]`);
            });
        } else {
            console.log('No spreadsheets found in Drive at all.');
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

listAllSheets();
