import { google } from 'googleapis'
import { authorize } from './auth'
import { dometopiaCategories } from './dometopiaCategories'

export async function createSpreadsheet(title: string): Promise<string | null | undefined> {
  const auth = await authorize()
  const sheets = google.sheets({ version: 'v4', auth })

  const resource = {
    properties: {
      title
    }
  }

  const response = await sheets.spreadsheets.create({
    requestBody: resource,
    fields: 'spreadsheetId'
  })

  return response.data.spreadsheetId
}

export async function getOrCreateMasterSheet(): Promise<string> {
  const auth = await authorize()
  const drive = google.drive({ version: 'v3', auth })
  const sheets = google.sheets({ version: 'v4', auth })

  const masterSheetName = '[Mo2] 내 상품 마스터 DB'

  try {
    // Search Drive for existing sheet
    const res = await drive.files.list({
      q: `name='${masterSheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    })

    if (res.data.files && res.data.files.length > 0) {
      // Master Sheet already exists!
      const fileId = res.data.files[0].id!
      console.log(`[Master DB] Found existing database: ${fileId}`)
      return fileId
    }

    // Doesn't exist, create it anew
    console.log(`[Master DB] Not found. Creating new Master DB sheet...`)
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: masterSheetName }
      },
      fields: 'spreadsheetId'
    })

    const newSheetId = createRes.data.spreadsheetId!

    // Write Header Row for the Master DB
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: 'A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['도매처/공급사', '상품번호(SKU)', '스마트스토어채널번호', '업로드단가', '최초연동일시']
        ]
      }
    })

    // 1행 틀고정 (Freeze header row)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                gridProperties: { frozenRowCount: 1 }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          }
        ]
      }
    })

    return newSheetId
  } catch (error: unknown) {
    console.error('Failed to get or create Master Sheet', error)
    throw new Error(`Master DB Initialization Failed: ${(error as Error).message}`)
  }
}

export async function getOrCreateCategoryMasterSheet(): Promise<string> {
  const auth = await authorize()
  const drive = google.drive({ version: 'v3', auth })
  const sheets = google.sheets({ version: 'v4', auth })

  const categorySheetName = '[Mo2] 카테고리 매핑 마스터 DB v3'

  try {
    // Search Drive for existing sheet
    const res = await drive.files.list({
      q: `name='${categorySheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    })

    if (res.data.files && res.data.files.length > 0) {
      const fileId = res.data.files[0].id!
      console.log(`[Category DB] Found existing database: ${fileId}`)
      return fileId
    }

    // Doesn't exist, create it anew
    console.log(`[Category DB] Not found. Creating new Category DB sheet...`)
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: categorySheetName }
      },
      fields: 'spreadsheetId'
    })

    const newSheetId = createRes.data.spreadsheetId!

    // Deep Dometopia Categories list imported from dometopiaCategories.ts (398 total items)

    // Format data to write to sheet
    const initialData = [
      [
        '도매처',
        '소싱 카테고리명',
        '네이버 스마트스토어 ID',
        '카페24 카테고리 ID',
        '쿠팡 카테고리 ID',
        '기타 마켓 확장용'
      ],
      ...dometopiaCategories.map((cat) => [
        '도매토피아', // 도매처
        `[${cat[0]}] ${cat[1]}`, // 소싱 카테고리명
        '',
        '',
        '',
        '' // 빈 매핑 ID들
      ])
    ]

    // Write Header Row & Base categories for the Category DB
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: `A1:F${initialData.length}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: initialData
      }
    })

    // 1행 틀고정 (Freeze header row)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: { frozenRowCount: 1 }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          }
        ]
      }
    })

    return newSheetId
  } catch (error: unknown) {
    console.error('Failed to get or create Category Master Sheet', error)
    throw new Error(`Category DB Initialization Failed: ${(error as Error).message}`)
  }
}

export async function appendToMasterSheet(spreadsheetId: string, values: unknown[][]) {
  const auth = await authorize()
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:E', // Any place in these columns
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: values as any[][]
    }
  })
}

export async function writeToSheet(spreadsheetId: string, range: string, values: unknown[][]) {
  const auth = await authorize()
  const sheets = google.sheets({ version: 'v4', auth })

  const resource = {
    values: values as any[][]
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: resource
  })
}

export async function updateSheetCell(
  spreadsheetId: string,
  range: string,
  value: string | number
) {
  const auth = await authorize()
  const sheets = google.sheets({ version: 'v4', auth })

  const resource = {
    values: [[value]]
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: resource
  })
}

export async function readFromSheet(spreadsheetId: string, range: string) {
  const auth = await authorize()
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    console.log(`[readFromSheet] Requesting sheetId: ${spreadsheetId}, range: ${range}`)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    })

    console.log(`[readFromSheet] Response status: ${response.status}`)
    console.log(`[readFromSheet] Values length: ${response.data.values?.length}`)

    return response.data.values || []
  } catch (e: unknown) {
    console.error(`[readFromSheet] API Error:`, (e as Error).message)
    throw e
  }
}

export function setupSheetHandlers() {
  // Add internal sheet ipc handlers if needed
}

export async function getOrCreateOrderMasterSheet(): Promise<string> {
  const auth = await authorize()
  const drive = google.drive({ version: 'v3', auth })
  const sheets = google.sheets({ version: 'v4', auth })

  const orderSheetName = '[Mo2] 통합 주문수집 마스터 DB v3'

  try {
    const res = await drive.files.list({
      q: `name='${orderSheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    })

    if (res.data.files && res.data.files.length > 0) {
      const fileId = res.data.files[0].id!
      console.log(`[Order DB] Found existing database: ${fileId}`)
      return fileId
    }

    console.log(`[Order DB] Not found. Creating new Order DB sheet...`)
    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: orderSheetName }
      },
      fields: 'spreadsheetId'
    })

    const newSheetId = createRes.data.spreadsheetId!

    // Write Header Row
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: 'A1:M1', // 13 Columns
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            '주문채널',
            '주문번호',
            '주문일시',
            '주문상태',
            '상품명',
            '옵션명',
            '수량',
            '구매자명',
            '결제금액',
            '수취인/연락처/주소',
            '택배사',
            '송장번호',
            '발송일자'
          ]
        ]
      }
    })

    // 1행 틀고정 (Freeze header row)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: { frozenRowCount: 1 }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          }
        ]
      }
    })

    return newSheetId
  } catch (error: unknown) {
    console.error('Failed to get or create Order Master Sheet', error)
    throw new Error(`Order DB Initialization Failed: ${(error as Error).message}`)
  }
}

export async function appendOrdersToSheet(spreadsheetId: string, values: unknown[][]) {
  const auth = await authorize()
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A:M',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: values as any[][]
    }
  })
}
