import { google } from 'googleapis'
import * as fs from 'fs'

async function deleteOldCategorySheet() {
  try {
    const credentialsPath = 'c:\\wise\\src\\main\\credentials.json'
    const tokenPath = 'C:\\Users\\shw\\AppData\\Roaming\\wise\\token.json'

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))
    const { client_secret, client_id, redirect_uris } = credentials.installed

    const authClient = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    const tokenStr = fs.readFileSync(tokenPath, 'utf-8')
    authClient.setCredentials(JSON.parse(tokenStr))

    const drive = google.drive({ version: 'v3', auth: authClient })

    console.log(`Fetching recently created spreadsheets to find the Category DB...`)
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      orderBy: 'createdTime desc',
      pageSize: 100
    })

    const targetName = '[WISE] 카테고리 매핑 마스터 DB'
    const matches = (res.data.files || []).filter((f) => f.name === targetName)

    if (matches.length > 0) {
      for (const file of matches) {
        console.log(`Found file: ${file.name} (ID: ${file.id}). Deleting...`)
        await drive.files.delete({ fileId: file.id! })
        console.log(`✅ Deleted ${file.id}`)
      }
      console.log(
        'All matching sheets deleted. You can now click the button in the app to generate a fresh pre-filled sheet!'
      )
    } else {
      console.log('No existing sheets found even after fetching all recent spreadsheets.')
    }
  } catch (e: any) {
    console.error('Error deleting sheet:', e.message)
  }
}

deleteOldCategorySheet()
