import * as React from 'react'
import { useState, useRef } from 'react'
import { Rocket, ShieldCheck, Layers } from 'lucide-react'
import { ActionLogs } from './components/ActionLogs'
import { DataPrepStep, ScrapeMethod } from './components/steps/DataPrepStep'
import { MarketSyncStep } from './components/steps/MarketSyncStep'
import { SyncStepMaster } from './components/steps/SyncStepMaster'
import { SettingsStep } from './components/steps/SettingsStep'
import { OrderSyncStep, MockOrder } from './components/steps/OrderSyncStep'
import { Sidebar, ViewType } from './components/Sidebar'

type SyncStatus = 'pending' | 'syncing' | 'success' | 'failed'

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [licenseTier, setLicenseTier] = useState<'free' | 'pro'>('free')
  const [usageInfo, setUsageInfo] = useState<{
    currentMonthCount: number
    limit: number | 'unlimited'
  }>({ currentMonthCount: 0, limit: 100 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [betaMarketsInfo, setBetaMarketsInfo] = useState<any>({})

  const [activePlans, setActivePlans] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>([])

  // Auto-Update States
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
  const [updateDownloaded, setUpdateDownloaded] = useState<boolean>(false)
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [sheetData, setSheetData] = useState<string[][]>([])
  const [scrapeMethod, setScrapeMethod] = useState<ScrapeMethod>('product')
  const [scrapeQuery, setScrapeQuery] = useState<string>('183521')
  const [syncStatuses, setSyncStatuses] = useState<{
    [rowIdx: number]: { status: SyncStatus; message: string }
  }>({})

  const [isScraping, setIsScraping] = useState<boolean>(false)
  const cancelScrapeRef = useRef<boolean>(false)

  // Phase 4 Pricing States
  const [marginRate, setMarginRate] = useState<number>(20)
  const [extraShippingCost, setExtraShippingCost] = useState<number>(0)

  // Main View State
  const [currentView, setCurrentView] = useState<ViewType>('SOURCING')
  const [orders, setOrders] = useState<MockOrder[]>([])
  const [orderDBId, setOrderDBId] = useState<string>('')

  const [masterSheetId, setMasterSheetId] = useState<string>('')
  const [categoryMasterSheetId, setCategoryMasterSheetId] = useState<string>('')
  const [categoryMappingCache, setCategoryMappingCache] = useState<
    Record<string, { naver?: string; cafe24?: string; coupang?: string }>
  >({})
  const [syncMode, setSyncMode] = useState<'register' | 'master'>('register')

  // Shared Authentication State for Markets
  const [credentials, setCredentials] = useState({
    clientId: localStorage.getItem('naverClientId') || '',
    clientSecret: localStorage.getItem('naverClientSecret') || ''
  })

  const [cafe24Credentials, setCafe24Credentials] = useState({
    mallId: localStorage.getItem('cafe24MallId') || '',
    connected: false
  })

  React.useEffect(() => {
    const savedMallId = localStorage.getItem('cafe24MallId')
    if (savedMallId) {
      // 백그라운드에서 카페24 연동 상태(토큰 유효성)를 자동 복구
      fetch(`https://teamwise-sand.vercel.app/api/market/cafe24/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mallId: savedMallId })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.access_token) {
            setCafe24Credentials((prev) => ({ ...prev, connected: true }))
          }
        })
        .catch(() => {
          // Ignore network errors silently; user will just appear disconnected
        })
    }
  }, [])

  // Auto Updater IPC Listeners
  React.useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true)
      addLog('🚀 새 버전의 업데이트가 발견되었습니다! 백그라운드에서 다운로드를 시작합니다...')
    }

    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true)
      addLog('✅ 새 버전 다운로드가 완료되었습니다. 앱을 재시작하면 자동 반영됩니다.')
    }

    // For Local UI Testing
    if (import.meta.env.DEV) {
      ;(window as any).__test_update_available = handleUpdateAvailable
      ;(window as any).__test_update_downloaded = handleUpdateDownloaded
    }

    window.electron.ipcRenderer.on('update-available', handleUpdateAvailable)
    window.electron.ipcRenderer.on('update-downloaded', handleUpdateDownloaded)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('update-available')
      window.electron.ipcRenderer.removeAllListeners('update-downloaded')
      if (import.meta.env.DEV) {
        delete (window as any).__test_update_available
        delete (window as any).__test_update_downloaded
      }
    }
  }, [])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message])
  }

  const handleScrape = async () => {
    if (!scrapeQuery.trim()) {
      addLog('에러: 상품번호, 카테고리 코드 또는 검색어를 입력해주세요.')
      return
    }
    if (!sheetId) {
      addLog(
        '에러: 데이터를 저장할 시트가 필요합니다. 1단계에서 [테스트 시트 생성]을 먼저 진행해주세요.'
      )
      return
    }

    setIsScraping(true)
    cancelScrapeRef.current = false

    let urlsToScrape: string[] = []

    if (scrapeMethod === 'product') {
      const productIds = scrapeQuery
        .split('\n')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

      if (productIds.length === 0) {
        addLog('에러: 상품번호를 올바르게 입력해주세요.')
        return
      }
      urlsToScrape = productIds.map((id) => `https://dometopia.com/goods/view?no=${id}`)
      addLog(`입력된 상품번호 ${productIds.length}개로 파싱 완료.`)
    } else {
      let linkUrl = ''
      if (scrapeMethod === 'category') {
        // Handle full URL or just category code.
        const code = scrapeQuery.trim()
        linkUrl = code.startsWith('http')
          ? code
          : `https://dometopia.com/goods/catalog?code=${code}`
      } else if (scrapeMethod === 'search') {
        linkUrl = `https://dometopia.com/goods/search?search_text=${encodeURIComponent(scrapeQuery.trim())}`
      }

      addLog(
        `[${scrapeMethod === 'category' ? '카테고리' : '검색결과'}] 최대 10페이지에 걸쳐 대량 상품 링크 추출 중... (잠시만 기다려주세요)`
      )
      try {
        const linkRes = await window.electron.ipcRenderer.invoke('scrape-category', linkUrl)
        if (linkRes.success && linkRes.links && linkRes.links.length > 0) {
          urlsToScrape = linkRes.links
          addLog(`🎉 총 ${linkRes.links.length}개의 상품 링크를 성공적으로 추출했습니다!`)
        } else {
          addLog(`❌ 상품 링크를 찾을 수 없습니다: ${linkRes.error || '0 links found'}`)
          return
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        addLog(`❌ 링크 추출 중 오류 발생: ${errorMsg}`)
        setIsScraping(false)
        return
      }
    }

    if (urlsToScrape.length === 0) {
      setIsScraping(false)
      return
    }

    addLog(`총 ${urlsToScrape.length}개의 상품 수집을 시작합니다...`)

    // Fetch nextRow once to append continuously
    let nextRow = 2
    try {
      const readRes = await window.electron.ipcRenderer.invoke('read-sheet', sheetId, 'A:A')
      nextRow = readRes.success && readRes.data ? readRes.data.length + 1 : 2
    } catch {
      addLog('⚠️ 시트 길이를 가져오는데 실패하여 기본 2행으로 세팅합니다.')
    }

    for (let i = 0; i < urlsToScrape.length; i++) {
      if (cancelScrapeRef.current) {
        addLog(`⚠️ 사용자에 의해 데이터 수집이 중단되었습니다.`)
        break
      }

      const targetUrl = urlsToScrape[i]
      addLog(`[${i + 1}/${urlsToScrape.length}] 수집 중: ${targetUrl}`)
      try {
        const response = await window.electron.ipcRenderer.invoke('scrape-dometopia', targetUrl)

        if (response.success) {
          addLog(`  ✅ 수집 성공! 상품명: ${response.data.name}, 가격: ${response.data.salePrice}`)

          // 1. 이미지 처리는 상품 등록 전(Lazy Upload)으로 이관
          const naverImageUrl = response.data.mainImageUrl

          const clientId = '4aTjpvduCQkMgmJjioSzFK'
          const clientSecret = '$2a$04$UNqs4AJrZASKpHqfUFGxOe'

          // 2. 스마트 카테고리 매핑 (휴리스틱 & 폴백 로직)
          let categoryId = '50004393' // 최후의 보루 기본값 (생활/주방)
          const fullCategoryPath = response.data.categoryPath
            ? response.data.categoryPath.join(' > ')
            : ''
          addLog(`  분석 중인 카테고리 경로: ${fullCategoryPath || '없음'}`)

          let mappedFromCache = false
          if (fullCategoryPath) {
            const cacheKey = `도매토피아::${fullCategoryPath}`
            if (categoryMappingCache[cacheKey] && categoryMappingCache[cacheKey].naver) {
              categoryId = categoryMappingCache[cacheKey].naver!
              addLog(`  ✨ [마스터 DB 매핑 적중!] ➔ 네이버 카테고리 ID: ${categoryId} 즉시 적용`)
              mappedFromCache = true
            }
          }

          let searchKeyword = ''
          let fallbackKeyword = ''

          const path = response.data.categoryPath || []
          if (path.length > 0) {
            const leaf = path[path.length - 1]
            // 포괄적 단어 필터링
            const genericWords = [
              '기타',
              '소품',
              '용품',
              '일반',
              '세트',
              '리필',
              '악세사리',
              '용기',
              '단품'
            ]
            if (genericWords.some((w) => leaf.includes(w)) && path.length >= 2) {
              // 이전 단계 단어와 조합 (예: 주방 카테고리의 기타 -> "주방 기타")
              searchKeyword = `${path[path.length - 2]} ${leaf}`.substring(0, 20)
              fallbackKeyword = path[path.length - 2] // "주방"
            } else {
              searchKeyword = leaf
            }
          }

          if (!searchKeyword) {
            // 경로 추출에 아예 실패했을 경우
            // 검색어로 스크래핑한 경우라면 그 검색어를 최우선 폴백으로 활용!
            if (scrapeMethod === 'search' && scrapeQuery.trim()) {
              searchKeyword = scrapeQuery.trim().substring(0, 20)
            } else {
              const nameParts = response.data.name.split(' ')
              searchKeyword = nameParts.slice(0, 2).join(' ').substring(0, 20)
            }
          }

          if (!mappedFromCache) {
            addLog(`  🔍 네이버 카테고리 자동 검색 시도 중... (키워드: '${searchKeyword}')`)
            try {
              let catRes = await window.electron.ipcRenderer.invoke(
                'search-categories',
                clientId,
                clientSecret,
                searchKeyword
              )

              // 1차 검색 실패 & fallbackKeyword 가 있다면 2차 시도
              if (
                (!catRes.success || !catRes.data || catRes.data.length === 0) &&
                fallbackKeyword
              ) {
                addLog(
                  `  ⚠️ 검색 실패. 상위 카테고리('${fallbackKeyword}')로 2차 검색을 시도합니다.`
                )
                catRes = await window.electron.ipcRenderer.invoke(
                  'search-categories',
                  clientId,
                  clientSecret,
                  fallbackKeyword
                )
              }

              // 1/2차도 다 실패했다면 상품명 2어절로 최후 검색 시도
              if (!catRes.success || !catRes.data || catRes.data.length === 0) {
                const nameParts = response.data.name.split(' ')
                const finalFallback = nameParts.slice(0, 2).join(' ').substring(0, 20)
                addLog(
                  `  ⚠️ 검색 결과 없음. 최후 안전망으로 상품명('${finalFallback}') 기반 검색을 시도합니다.`
                )
                catRes = await window.electron.ipcRenderer.invoke(
                  'search-categories',
                  clientId,
                  clientSecret,
                  finalFallback
                )
              }

              if (catRes.success && catRes.data && catRes.data.length > 0) {
                categoryId = catRes.data[0].id.toString()
                // 매핑 결과 시인성 좋게 로깅
                addLog(
                  `  [자동 카테고리 매핑 완료] ➔ 네이버 카테고리 [${catRes.data[0].name}] (ID: ${categoryId}) 적용 완료!`
                )
              } else {
                addLog(`  ❌ 모든 방식의 카테고리 매칭 실패. 기본값(${categoryId})으로 설정됩니다.`)
              }
            } catch {
              addLog(`  ❌ 네이버 카테고리 검색 에러 발생. 기본값 사용.`)
            }
          }

          const rowData = [
            categoryId, // Category mapped automatically(A)
            response.data.name,
            response.data.detailHtml,
            naverImageUrl,
            response.data.salePrice.toString(),
            '100', // Default stock(F)
            '', // G: Channel Product No
            '', // H: Shipping Address ID
            '', // I: Return Address ID
            '010-0000-0000', // J: A/S Phone
            response.data.deliveryFee?.toString() || '2500', // K: 기본배송비
            response.data.freeCondition?.toString() || '0', // L: 조건부무료액
            response.data.manufacturer || '자체제작', // M: 제조사
            response.data.origin || '아시아/중국', // N: 원산지
            response.data.material || '상세화면 참조', // O: 소재
            response.data.modelName || '', // P: 모델명
            response.data.kcCertification || '' // Q: KC인증정보
          ]

          // 3. Write data to the next available row (Append) in the Google Sheet
          const writeRange = `A${nextRow}`
          const writeRes = await window.electron.ipcRenderer.invoke(
            'write-sheet',
            sheetId,
            writeRange,
            [rowData]
          )

          if (writeRes.success) {
            addLog(`  ✅ 상품 [${i + 1}] 시트 기록 완료!`)
            nextRow++
          } else {
            addLog(`  ❌ 시트 기록 실패: ${writeRes.error}`)
          }
        } else {
          addLog(`  ❌ 수집 실패: ${response.error}`)
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        addLog(`  ❌ 수집 중 에러 발생: ${msg}`)
      }
    }
    addLog(`🎉 수집 프로세스가 모두 완료되었습니다.`)
    setIsScraping(false)
  }

  const handleCancelScrape = () => {
    cancelScrapeRef.current = true
  }

  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)

  const handleAuth = async () => {
    setIsAuthenticating(true)
    addLog('Google 계정 연동 및 데스크톱 라이선스를 확인 중입니다...')

    try {
      const googleRes = await window.electron.ipcRenderer.invoke('google-auth')
      if (googleRes.success) {
        addLog(`✅ 통합 인증 완료! (계정: ${googleRes.email})`)
        setUserEmail(googleRes.email)

        if (googleRes.tier) setLicenseTier(googleRes.tier)
        if (googleRes.usage) setUsageInfo(googleRes.usage)
        if (googleRes.betaMarkets) setBetaMarketsInfo(googleRes.betaMarkets)

        if (googleRes.activePlans && googleRes.activePlans.length > 0) {
          addLog(`✨ 적용 완료된 부가서비스: ${googleRes.activePlans.join(', ')}`)
          setActivePlans(googleRes.activePlans)
        }
        setIsAuthenticated(true)

        // Phase 7: Fetch or create Master DB upon login
        addLog('마스터 DB 시트를 확인하는 중입니다...')
        const masterRes = await window.electron.ipcRenderer.invoke('get-or-create-master-sheet')
        if (masterRes.success && masterRes.sheetId) {
          setMasterSheetId(masterRes.sheetId)
          addLog(`✅ 마스터 DB 연결 완료! ID: ${masterRes.sheetId}`)
        } else {
          addLog(`⚠️ 마스터 DB 초기화 실패: ${masterRes.error}`)
        }

        // Category DB Connection
        addLog('카테고리 매핑 마스터 시트를 병합 중입니다...')
        const catRes = await window.electron.ipcRenderer.invoke(
          'get-or-create-category-master-sheet'
        )
        if (catRes.success && catRes.sheetId) {
          setCategoryMasterSheetId(catRes.sheetId)
          addLog(`✅ 카테고리 마스터 DB 연결 완료! ID: ${catRes.sheetId}`)

          const catDataRes = await window.electron.ipcRenderer.invoke(
            'read-sheet',
            catRes.sheetId,
            'A2:F'
          )
          if (catDataRes.success && catDataRes.data) {
            const newCache: Record<string, { naver?: string; cafe24?: string; coupang?: string }> =
              {}
            catDataRes.data.forEach((row: string[]) => {
              const vendor = row[0]?.trim() || ''
              const catName = row[1]?.trim() || ''
              if (vendor && catName) {
                const key = `${vendor}::${catName}`
                newCache[key] = {
                  naver: row[2]?.trim(),
                  cafe24: row[3]?.trim(),
                  coupang: row[4]?.trim()
                }
              }
            })
            setCategoryMappingCache(newCache)
            addLog(`✅ ${Object.keys(newCache).length}개의 카테고리 매핑 캐시 로드 완료`)
          }
        } else {
          addLog(`⚠️ 카테고리 마스터 DB 초기화 실패: ${catRes.error}`)
        }
      } else {
        addLog(`❌ 인증 실패: ${googleRes.error}`)
        alert(`로그인 실패\n${googleRes.error}`)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`❌ 인증 중 오류 발생: ${msg}`)
      alert(`오류 발생\n${msg}`)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    try {
      addLog('로그아웃을 진행합니다...')
      await window.electron.ipcRenderer.invoke('google-logout')
      setIsAuthenticated(false)
      setUserEmail(null)
      setActivePlans([])
      setMasterSheetId('')
      addLog('✅ 로그아웃 되었습니다.')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`❌ 로그아웃 중 오류 발생: ${msg}`)
      alert(`로그아웃 실패\n${msg}`)
    }
  }

  const handleCreateSheet = async () => {
    addLog('새로운 스프레드시트를 생성 및 초기화하는 중입니다...')
    try {
      const response = await window.electron.ipcRenderer.invoke(
        'create-sheet',
        'Market Integration Sheet'
      )
      if (response.success) {
        setSheetId(response.spreadsheetId)
        addLog(`스프레드시트가 성공적으로 생성되었습니다! ID: ${response.spreadsheetId}`)

        // Immediately write headers only, no sample data
        const headers = [
          [
            '카테고리ID',
            '상품명',
            '상세설명',
            '대표이미지 URL',
            '판매가',
            '재고수량',
            '스마트스토어 상품번호',
            '출고지주소ID',
            '반품지주소ID',
            'A/S전화번호',
            '기본배송비',
            '조건부무료액',
            '제조사',
            '원산지',
            '소재',
            '모델명',
            'KC인증정보'
          ]
        ]
        const writeRes = await window.electron.ipcRenderer.invoke(
          'write-sheet',
          response.spreadsheetId,
          'A1:Q1',
          headers
        )
        if (writeRes.success) {
          addLog('시트 헤더 초기화가 완료되었습니다.')
        } else {
          addLog(`헤더 초기화 실패: ${writeRes.error}`)
        }
      } else {
        addLog(`스프레드시트 생성 실패: ${response.error}`)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`스프레드시트 생성 중 오류 발생: ${msg}`)
    }
  }

  const handleReadProducts = async () => {
    if (!sheetId) {
      addLog('Error: Please create and write to a sheet first.')
      return
    }

    addLog('스프레드시트에서 상품을 읽어오는 중입니다...')
    try {
      const response = await window.electron.ipcRenderer.invoke('read-sheet', sheetId, 'A:Q')

      if (response.success) {
        if (response.data && response.data.length > 0) {
          const rowCount = response.data.length
          const productCount = Math.max(0, rowCount - 1) // Exclude header row

          if (productCount > 0) {
            // Stage 1 Duplicate Filtering: Filter out identical product names within the same sheet
            const seenNames = new Set<string>()
            const filteredData: string[][] = []
            let duplicateCount = 0

            if (
              response.data[0] &&
              (response.data[0][0] === '카테고리ID' || response.data[0][1] === '상품명')
            ) {
              filteredData.push(response.data[0]) // Keep header
            }

            for (let i = filteredData.length > 0 ? 1 : 0; i < response.data.length; i++) {
              const row = response.data[i]
              if (row.length >= 6 && row[1]) {
                const productName = row[1]
                if (seenNames.has(productName)) {
                  duplicateCount++
                  continue
                }
                seenNames.add(productName)
                filteredData.push(row)
              } else {
                filteredData.push(row) // Keep empty/invalid rows for accurate indexing, or handle differently
              }
            }

            addLog(`총 ${productCount}개의 상품데이터를 읽어왔습니다.`)
            if (duplicateCount > 0) {
              addLog(`⚠️ 시트 내 중복 항목 ${duplicateCount}개를 연동 목록에서 제외했습니다.`)
            }

            setSheetData(filteredData)

            if (filteredData.length > 1) {
              window.electron.ipcRenderer.invoke('save-sheet-cache', sheetId, filteredData)
                .catch(e => console.error('Failed to save sheet cache', e))
            }

            const validRows = filteredData.slice(
              filteredData.length > 0 &&
                (filteredData[0][0] === '카테고리ID' || filteredData[0][1] === '상품명')
                ? 1
                : 0
            )
            const sampleNames = validRows
              .slice(0, 3)
              .map((row: string[]) => row[1] || '이름 없음')
              .join(', ')
            const extraCount = Math.max(0, validRows.length - 3)
            addLog(
              `📦 수집 대기 목록 (${validRows.length}건): ${sampleNames} ${extraCount > 0 ? `외 ${extraCount}건` : ''}`
            )
          } else {
            addLog(`소스 시트가 비어있습니다. 이전 데이터 복원(이어올리기)을 시도합니다...`)

            let hasCache = false
            try {
              const cacheRes = await window.electron.ipcRenderer.invoke('load-sheet-cache', sheetId)
              if (cacheRes.success && cacheRes.data && cacheRes.data.length > 1) {
                if (masterSheetId) {
                  const masterRes = await window.electron.ipcRenderer.invoke('read-sheet', masterSheetId, 'A:F')
                  if (masterRes.success && masterRes.data && masterRes.data.length > 1) {
                    const pendingNames = new Set<string>()
                    for (let j = 1; j < masterRes.data.length; j++) {
                      const mRow = masterRes.data[j]
                      const statusVal = mRow[5] || ''
                      if (statusVal.includes('[미등록]') || statusVal.includes('[실패')) {
                         pendingNames.add(mRow[1])
                      }
                    }

                    if (pendingNames.size > 0) {
                      const restoredData: string[][] = []
                      restoredData.push(cacheRes.data[0]) // Header
                      let restoredCount = 0

                      for (let k = 1; k < cacheRes.data.length; k++) {
                        const cRow = cacheRes.data[k]
                        if (cRow.length >= 2 && pendingNames.has(cRow[1])) {
                           const newRow = [...cRow]
                           newRow[0] = newRow[0] || '[복구됨]'
                           restoredData.push(newRow)
                           restoredCount++
                        }
                      }

                      if (restoredCount > 0) {
                         addLog(`✅ 로컬 캐시에서 완벽한 원본 데이터를 찾아 ${restoredCount}건의 미완료 항목을 이미지/옵션 손실 없이 복원했습니다!`)
                         setSheetData(restoredData)
                         hasCache = true
                      }
                    } else {
                       addLog(`마스터 DB를 검사했으나 미완료 항목이 없습니다. 모두 완벽히 연동되었습니다!`)
                       setSheetData([])
                       hasCache = true
                    }
                  }
                }
              }
            } catch (e) {
               console.error('Local cache failed', e)
            }

            if (!hasCache && masterSheetId) {
             addLog(`⚠️ 로컬 캐시를 찾을 수 없습니다. 마스터 DB 최소 정보로 복원을 시도합니다...`)
             try {
                const masterRes = await window.electron.ipcRenderer.invoke('read-sheet', masterSheetId, 'A:F')
                if (masterRes.success && masterRes.data && masterRes.data.length > 1) {
                  const pendingData: string[][] = []
                  const headerRow = [
                    '카테고리ID', '상품명', '판매가정가', '이미지URL', '공급가', '옵션유무', '옵션1명', '옵션1항목'
                  ]
                  pendingData.push(headerRow)

                  let pendingCount = 0
                  for (let j = 1; j < masterRes.data.length; j++) {
                    const mRow = masterRes.data[j]
                    // F column is Status. If it includes 미등록 or 실패, we must resume
                    const statusVal = mRow[5] || ''
                    if (statusVal.includes('[미등록]') || statusVal.includes('[실패')) {
                       pendingCount++
                       const productName = mRow[1]
                       // Reconstruct UI Row
                       const finalPriceStr = mRow[3] || '0'
                       const finalPriceNum = parseInt(finalPriceStr.replace(/,/g, ''), 10)
                       const reversedSupplyPrice = Math.floor((finalPriceNum - 3000) / 1.3)
                       pendingData.push([
                         '[복구됨]', // Category ID - Must not be falsy so UI table renders
                         productName, // 1: Name
                         finalPriceStr, // 2: SellPrice
                         '', // 3: Image URL
                         reversedSupplyPrice.toString(), // 4: Supply Price
                         '없음', // 5
                         '', // 6
                         '', // 7
                       ])
                    }
                  }
                  if (pendingCount > 0) {
                     addLog(`⚠️ 원본 시트는 비어있지만, 마스터 DB에서 ${pendingCount}건의 [미등록]/[실패] 항목을 찾아 복원했습니다!`)
                     addLog(`💡 단, 이전 수집 데이터(상세 이미지 등)가 유실되었을 수 있으므로 가급적 [B2B 상품 소싱]에서 새로 수집 후 연동하는 것을 권장합니다.`)
                     setSheetData(pendingData)
                  } else {
                     addLog(`마스터 DB를 검사했으나 미완료 항목이 없습니다. 모두 완벽히 연동되었습니다!`)
                     setSheetData([])
                  }
                } else {
                  addLog(`마스터 DB에 접근할 수 없거나 데이터가 없습니다.`)
                }
             } catch(e) {
                addLog(`마스터 DB 확인 중 오류 발생: ${e}`)
             }
            } else {
              addLog(`마스터 DB가 등록되지 않아 이어올리기를 확인할 수 없습니다.`)
              setSheetData([])
            }
          }
        } else {
        }
      } else {
        addLog(`시트 읽기 실패: ${response.error}`)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`시트 읽기 중 오류 발생: ${msg}`)
    }
  }

  const handleSyncProducts = async (targetMarkets: string[], selectedCafe24CategoryObj?: { category_no: number; full_category_no?: string }) => {
    if (sheetData.length === 0) {
      addLog(
        '메모리에 상품 데이터가 없습니다. 먼저 [등록할 상품 시트에서 가져오기]를 실행해주세요.'
      )
      return
    }

    const hasHeader =
      sheetData[0] && (sheetData[0][0] === '카테고리ID' || sheetData[0][1] === '상품명')
    const startIndex = hasHeader ? 1 : 0
    const itemsCount = sheetData.length - startIndex

    if (itemsCount <= 0) {
      addLog('유효한 상품 데이터가 없습니다.')
      return
    }

    if (licenseTier === 'free' && usageInfo.limit !== 'unlimited') {
      if (usageInfo.currentMonthCount + itemsCount > (usageInfo.limit as number)) {
        alert(
          `🚨 전송 한도 초과: 무료 플랜은 월 ${usageInfo.limit}건까지만 전송 가능합니다.\n(현재 누적: ${usageInfo.currentMonthCount}건, 시도: ${itemsCount}건)\n\n제한 없이 무제한으로 등록하시려면 Pro 플랜으로 업그레이드 해주세요!`
        )
        addLog('❌ 월 무료 전송 한도 초과로 전송이 취소되었습니다.')
        return
      }
    }

    addLog(`총 ${itemsCount}개 상품의 연동을 시작합니다...`)

    // Stage 2 Duplicate Filtering: Fetch Master DB to see what's already registered
    const registeredProducts = new Map<string, string>() // Key: uniqueKey, Value: channelProductNo
    const registeredProductsRowMap = new Map<string, number>() // Key: uniqueKey, Value: sheet row (1-indexed)
    let masterNextRowNumber = 1

    if (masterSheetId) {
      addLog('마스터 DB를 조회하여 기등록 상품 밑 진행 상태를 파악합니다...')
      try {
        const masterRes = await window.electron.ipcRenderer.invoke(
          'read-sheet',
          masterSheetId,
          'A:F'
        )
        if (masterRes.success && masterRes.data && masterRes.data.length > 0) {
          masterNextRowNumber = masterRes.data.length + 1
          // Skip header row
          for (let j = 1; j < masterRes.data.length; j++) {
            const mRow = masterRes.data[j]
            if (mRow.length >= 2 && mRow[0] && mRow[1]) {
              const uniqueKey = `${mRow[0]}_${mRow[1]}`
              registeredProducts.set(uniqueKey, mRow[2] || '')
              registeredProductsRowMap.set(uniqueKey, j + 1)
            }
          }
          addLog(`기등록/이전 대기 상품 ${registeredProducts.size}건 확인 됨.`)
        }
      } catch (e) {
        addLog(`마스터 DB 조회 실패: ${e}`)
      }
    }

    // Determine target environments from global state
    const clientId = credentials.clientId
    const clientSecret = credentials.clientSecret
    const cafe24MallId = cafe24Credentials.mallId

    if (targetMarkets.includes('cafe24') && (!cafe24MallId || !cafe24Credentials.connected)) {
      addLog(
        '에러: 카페24 API 인증 정보가 누락되었습니다. [연동 및 환경 설정] 메뉴에서 기입해주세요.'
      )
      return
    }

    if (targetMarkets.includes('smartstore') && (!clientId || !clientSecret)) {
      addLog('에러: 네이버 스마트스토어 API 인증 정보가 누락되었습니다. 설정에서 기입해주세요.')
      return
    }

    // --- Cafe24 Selected Category ---
    const defaultCafe24CategoryNo = selectedCafe24CategoryObj?.category_no || null
    const defaultCafe24FullCategoryNo = selectedCafe24CategoryObj?.full_category_no || null
    if (targetMarkets.includes('cafe24')) {
      if (defaultCafe24CategoryNo)
        addLog(`적용할 카페24 기본 카테고리 ID: ${defaultCafe24CategoryNo}`)
      else
        addLog('⚠️ 카페24 카테고리 없음. (미분류로 전송됨)')
    }
    // ----------------------------------------

    // Initialize statuses for all valid rows to pending
    const initialStatuses: { [rowIdx: number]: { status: SyncStatus; message: string } } = {
      ...syncStatuses
    }
    for (let i = startIndex; i < sheetData.length; i++) {
      if (sheetData[i].length >= 6 && sheetData[i][0]) {
        initialStatuses[i] = { status: 'pending', message: '' }
      }
    }
    setSyncStatuses(initialStatuses)

    // Phase 3: Identify completely new items and BULK APPEND to Master DB as [미등록]
    const newMasterRows: string[][] = []
    const newMasterRowMapKeys: string[] = []

    for (let i = startIndex; i < sheetData.length; i++) {
      const row = sheetData[i]
      if (row.length < 6 || !row[0]) continue

      const productName = row[1]
      const uniqueKey = `도매토피아_${productName}`

      if (!registeredProductsRowMap.has(uniqueKey)) {
        const originalPrice = parseInt((row[4] || '0').replace(/,/g, ''), 10)
        const rawFinalPrice = originalPrice * (1 + marginRate / 100) + extraShippingCost
        const finalPrice = Math.floor(rawFinalPrice / 10) * 10

        newMasterRows.push([
          '도매토피아',
          productName,
          '',
          finalPrice.toString(),
          new Date().toISOString(),
          '[미등록]'
        ])
        newMasterRowMapKeys.push(uniqueKey)
      }
    }

    if (masterSheetId && newMasterRows.length > 0) {
      addLog(`새로운 상품 ${newMasterRows.length}건을 마스터 DB에 [미등록] 상태로 선행 기록합니다...`)
      try {
        const appendRes = await window.electron.ipcRenderer.invoke(
          'append-to-master-sheet',
          masterSheetId,
          newMasterRows
        )
        if (appendRes.success) {
          for (let idx = 0; idx < newMasterRowMapKeys.length; idx++) {
            registeredProductsRowMap.set(newMasterRowMapKeys[idx], masterNextRowNumber + idx)
            registeredProducts.set(newMasterRowMapKeys[idx], '')
          }
          addLog(`✅ 마스터 DB 선행 기록 완료. 이어서 동기화를 시작합니다.`)
        } else {
          addLog(`⚠️ 마스터 DB 선행 기록 실패: ${appendRes.error}`)
        }
      } catch (e: unknown) {
        addLog(`⚠️ 마스터 DB 기록 오류: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // Skip row 0 which is headers
    let updateCount = 0
    let newRegisterCount = 0

    for (let i = startIndex; i < sheetData.length; i++) {
      const row = sheetData[i]
      if (row.length < 6 || !row[0]) {
        addLog(`${i}번째 상품 건너뜀 (비어있거나 불완전함)`)
        continue
      }

      // Phase 4: Apply Pricing Margin Algorithm (Round to nearest 10 won)
      const payloadRow = [...row]
      const originalPrice = parseInt((payloadRow[4] || '0').replace(/,/g, ''), 10)
      const rawFinalPrice = originalPrice * (1 + marginRate / 100) + extraShippingCost
      const finalPrice = Math.floor(rawFinalPrice / 10) * 10
      payloadRow[4] = finalPrice.toString()

      const productName = row[1]
      // Build the unique key based on our scraping logic (assume Dometopia for now)
      const uniqueKey = `도매토피아_${productName}`

      const existingChannelProductNo = registeredProducts.get(uniqueKey)
      const isUpdate = !!existingChannelProductNo
      let updatedChannelProductNo = existingChannelProductNo || ''

      if (isUpdate) {
        addLog(
          `${i}번째 상품 (${productName}) ➔ [정보 수정] API 로 전송 중... [적용가: ${finalPrice.toLocaleString()}₩]`
        )
        setSyncStatuses((prev) => ({
          ...prev,
          [i]: { status: 'syncing', message: '정보 수정 중...' }
        }))
      } else {
        addLog(
          `${i}번째 상품 (${productName}) ➔ [신규 등록] API 로 전송 중... [적용가: ${finalPrice.toLocaleString()}₩]`
        )
        setSyncStatuses((prev) => ({
          ...prev,
          [i]: { status: 'syncing', message: '신규 등록 중...' }
        }))
      }

      // Phase 5: Lazy Image Uploading to Naver CDN
      const currentImageUrl = payloadRow[3]
      // 스마트스토어 연동 필수: 도매토피아 URL이거나 아직 shop1.phinf.naver.net로 변환되지 않은 경우
      if (
        targetMarkets.includes('smartstore') &&
        currentImageUrl &&
        !currentImageUrl.includes('shop1.phinf.naver.net')
      ) {
        addLog(`[Lazy Upload] ${i}번째 상품 ➔ 이미지 네이버 CDN 업로드 중...`)
        try {
          const uploadRes = await window.electron.ipcRenderer.invoke(
            'upload-naver-image',
            clientId,
            clientSecret,
            currentImageUrl
          )
          if (uploadRes.success && uploadRes.url) {
            payloadRow[3] = uploadRes.url
            addLog(`✅ 이미지 변환 완료`)
            // 나중의 재실행을 위해 시트 원본도 업데이트 (D열)
            if (sheetId) {
              await window.electron.ipcRenderer.invoke(
                'update-sheet-cell',
                sheetId,
                `D${i + 1}`,
                uploadRes.url
              )
            }
          } else {
            addLog(`⚠️ 이미지 변환 실패. 원본 URL을 전송합니다 (에러코드 반환 확률 높음).`)
          }
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e)
          addLog(`⚠️ 이미지 업로드 IPC 에러 발생: ${errMsg}`)
        }
      }

      // 1:N Distibution Logic
      const marketLogMsgs: string[] = []
      let allSuccess = true
      let itemCreated = false
      let itemUpdated = false

      // [1] Naver SmartStore Target
      if (targetMarkets.includes('smartstore')) {
        try {
          let response
          if (isUpdate) {
            response = await window.electron.ipcRenderer.invoke(
              'update-product',
              clientId,
              clientSecret,
              existingChannelProductNo,
              payloadRow
            )
          } else {
            response = await window.electron.ipcRenderer.invoke(
              'register-product',
              clientId,
              clientSecret,
              payloadRow
            )
          }

          if (response.success) {
            marketLogMsgs.push('스마스스토어(성공)')
            if (isUpdate) {
              itemUpdated = true
              addLog(
                `✅ ${i}번째 상품 스토어 [수정] 성공! (상품번호: ${response.channelProductNo})`
              )
            } else {
              itemCreated = true
              addLog(
                `✅ ${i}번째 상품 스토어 [신규등록] 성공! (채널상풍번호: ${response.channelProductNo})`
              )
            }

            // Phase 6: Sync product ID back to Google Sheets Column G
            const rowNumber = i + 1 // Sheets rows are 1-indexed
            const cellRange = `G${rowNumber}`

            addLog(`시트 업데이트 중... (${cellRange})`)
            try {
              const sheetRes = await window.electron.ipcRenderer.invoke(
                'update-sheet-cell',
                sheetId,
                cellRange,
                response.channelProductNo
              )
              if (!sheetRes.success) {
                addLog(`⚠️ 시트저장 실패: ${sheetRes.error}`)
              }

              updatedChannelProductNo = response.channelProductNo
            } catch (e: unknown) {
              addLog(
                `⚠️ 시트저장/마스터DB 연동 오류: ${e instanceof Error ? e.message : String(e)}`
              )
            }
          } else {
            marketLogMsgs.push(`스마트스토어(오류)`)
            addLog(`❌ [스마트스토어] ${i}번째 상품 전송 실패: ${response.error}`)
            allSuccess = false
          }
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error)
          marketLogMsgs.push(`스마트스토어(치명적오류)`)
          addLog(`❌ [스마트스토어] ${i}번째 상품 처리 중 로직 에러: ${msg}`)
          allSuccess = false
        }
      }

      // [2] Cafe24 Target
      if (targetMarkets.includes('cafe24')) {
        try {
          addLog(`[카페24] ${i}번째 상품 전송 준비 중...`)
          // Translate payloadRow (Dometopia data) into Cafe24's expected JSON
          const cafe24Payload = {
            shop_no: 1,
            request: {
              display_state: 'T',
              selling_state: 'T',
              product_name: payloadRow[1],
              price: finalPrice.toString(),
              retail_price: finalPrice.toString(),
              supply_price: originalPrice.toString(),
              summary_description: payloadRow[1],
              simple_description: payloadRow[1],
              description: payloadRow[2] || payloadRow[1],
              detail_image: row[3],
              custom_product_code: uniqueKey, // Our master DB ItemCode
              // Origin fields removed to avoid mismatch errors
              has_option: payloadRow[6] && payloadRow[7] ? 'T' : 'F',
              shipping_fee_type: 'T',
              ...(defaultCafe24FullCategoryNo
                ? {
                    category: String(defaultCafe24FullCategoryNo)
                      .split(',')
                      .map((idStr) => ({ category_no: Number(idStr), recommend: 'F' as const, new: 'F' as const }))
                  }
                : defaultCafe24CategoryNo
                  ? { category: [{ category_no: defaultCafe24CategoryNo, recommend: 'F' as const, new: 'F' as const }] }
                  : {})
            }
          }

          const cafe24Response = await window.electron.ipcRenderer.invoke(
            'register-cafe24-product',
            {
              mallId: cafe24Credentials.mallId
            },
            cafe24Payload
          )

          if (cafe24Response.success) {
            marketLogMsgs.push('카페24(성공)')

            // As of now Cafe24 only registers new products in this flow
            if (isUpdate)
              itemUpdated = true // Still mark as updated if exist in master DB mapping
            else itemCreated = true

            addLog(
              `✅ ${i}번째 상품 카페24 [신규등록] 성공! (상품번호: ${cafe24Response.productNo})`
            )
            if (!updatedChannelProductNo) updatedChannelProductNo = cafe24Response.productNo.toString()
          } else {
            marketLogMsgs.push('카페24(오류)')
            addLog(`❌ [카페24] ${i}번째 상품 전송 실패: ${cafe24Response.error}`)
            allSuccess = false
          }
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error)
          marketLogMsgs.push(`카페24(치명적오류)`)
          addLog(`❌ [카페24] ${i}번째 상품 처리 중 에러: ${msg}`)
          allSuccess = false
        }
      }

      // [3] Additional Markets (Placeholders)
      const otherMarkets = targetMarkets.filter((m) => m !== 'smartstore' && m !== 'cafe24')
      for (const m of otherMarkets) {
        marketLogMsgs.push(`${m}(준비중)`)
        allSuccess = false // We didn't sync yet, mark as partially failed to get attention
      }

      // Aggregating 1:N Status
      const finalStateStr = marketLogMsgs.join(' | ')
      setSyncStatuses((prev) => ({
        ...prev,
        [i]: { status: allSuccess ? 'success' : 'failed', message: finalStateStr }
      }))

      // Phase 8: Finalize Master DB Status for this row
      if (masterSheetId) {
        const mRowIdx = registeredProductsRowMap.get(uniqueKey)
        if (mRowIdx) {
           const finalStatusTxt = allSuccess ? '[성공]' : `[실패: ${finalStateStr.substring(0, 30)}]`
           const updateData = [[
             updatedChannelProductNo, // C
             finalPrice.toString(),   // D
             new Date().toISOString(),// E
             finalStatusTxt           // F
           ]]
           window.electron.ipcRenderer.invoke(
             'write-sheet', masterSheetId, `C${mRowIdx}:F${mRowIdx}`, updateData
           ).catch(err => addLog(`⚠️ 마스터 DB 상태 갱신 통신 오류: ${err}`))
        }
      }

      // Increment total counts based on if AT LEAST ONE market succeeded
      if (itemCreated) newRegisterCount++
      if (itemUpdated) updateCount++

      // Phase 7: Rate Limit Delay (Cafe24 Leaky Bucket 2req/s)
      if (targetMarkets.includes('cafe24') && i < sheetData.length - 1) {
        addLog(`⏳ (Rate Limit 방어 중: 다음 상품까지 1.5초 대기...)`)
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    }

    addLog(
      `✨ 모든 연동 작업이 완료되었습니다! (신규 등록: ${newRegisterCount}건, 정보 수정: ${updateCount}건)`
    )
  }

  const handleFetchSmartStoreOrders = async () => {
    if (!sheetId) {
      addLog('에러: 주문을 저장할 구글 시트를 먼저 연동해주세요.')
      return
    }

    const clientId = '4aTjpvduCQkMgmJjioSzFK'
    const clientSecret = '$2a$04$UNqs4AJrZASKpHqfUFGxOe'

    addLog('네이버 스마트스토어 API에서 최근 24시간 내 수정된 주문을 수집 중입니다...')
    try {
      const response = await window.electron.ipcRenderer.invoke(
        'fetch-smartstore',
        clientId,
        clientSecret
      )

      if (response.success) {
        const orders = response.data // Array of arrays

        if (!orders || orders.length === 0) {
          addLog('✅ 성공! 최근 24시간 내 신규/수정된 주문이 없습니다.')
          return
        }

        addLog(`총 ${orders.length}개의 주문을 성공적으로 수집했습니다. 구글 시트에 저장합니다...`)

        // 시트에 바로 Append 하기 위해 기존 시트의 데이터 길이를 구함 (orders를 M열 등에 써도 되지만, 밑에 이어쓰기로 PoC 진행)
        const readRes = await window.electron.ipcRenderer.invoke('read-sheet', sheetId, 'A:A')
        const nextRow = readRes.success && readRes.data ? readRes.data.length + 2 : 10

        // A~J 열에 주문 데이터 쓰기 (간단한 로깅 목적)
        const writeRange = `A${nextRow}`

        // 헤더 1줄 임의 추가
        const orderDataToWrite = [
          ['--- 신규 주문 수집 내역 ---', '', '', '', '', '', '', '', '', ''],
          [
            '주문일시',
            '주문번호',
            '상품명',
            '옵션',
            '수량',
            '수취인',
            '주소',
            '연락처',
            '결제금액',
            '주문상태'
          ],
          ...orders
        ]

        const writeRes = await window.electron.ipcRenderer.invoke(
          'write-sheet',
          sheetId,
          `${writeRange}:J${nextRow + orderDataToWrite.length}`,
          orderDataToWrite
        )

        if (writeRes.success) {
          addLog(`✅ 주문 데이터를 ${writeRange} 범위에 성공적으로 기록했습니다!`)
        } else {
          addLog(`❌ 주문 데이터 기록 실패: ${writeRes.error}`)
        }
      } else {
        addLog(`수집 실패: ${response.error}`)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`주문 수집 중 오류: ${msg}`)
    }
  }

  const handleOpenSheet = async () => {
    if (!sheetId) return
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
    await window.electron.ipcRenderer.invoke('open-external', url)
  }

  const handleOpenCategorySheet = async () => {
    if (!categoryMasterSheetId) return
    const url = `https://docs.google.com/spreadsheets/d/${categoryMasterSheetId}/edit`
    await window.electron.ipcRenderer.invoke('open-external', url)
  }

  if (!isAuthenticated) {
    return (
      <div
        className="container animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)'
        }}
      >
        <div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: '420px',
            textAlign: 'center',
            padding: '48px 32px',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <linearGradient id="mo2-gradient-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#60a5fa" offset="0%" />
                <stop stopColor="#a78bfa" offset="100%" />
              </linearGradient>
            </svg>
            <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
              <Layers size={80} stroke="url(#mo2-gradient-auth)" strokeWidth={2.5} />
            </div>
          </div>
          <h1
            style={{
              marginBottom: '16px',
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Mo2
          </h1>
          <p
            style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '15px', lineHeight: '1.6' }}
          >
            안전한 다중 마켓 연동과 통합 데이터 관리를 위해
            <br />
            Google 계정으로 간편하게 시작해 보세요.
          </p>
          <button
            className="primary hover-scale"
            onClick={handleAuth}
            disabled={isAuthenticating}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: isAuthenticating ? 'rgba(255,255,255,0.1)' : '#ffffff',
              color: isAuthenticating ? '#94a3b8' : '#0f172a',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              transition: 'all 0.2s',
              boxShadow: isAuthenticating
                ? 'none'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer'
            }}
          >
            {isAuthenticating ? (
              <span
                className="spinner"
                style={{
                  width: '22px',
                  height: '22px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              ></span>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span style={{ fontWeight: 600 }}>
              {isAuthenticating ? '인증 화면 대기 중...' : 'Google 계정으로 간편 시작'}
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        backgroundColor: '#f7fafc',
        overflow: 'hidden'
      }}
    >
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Auto Update Banner */}
        {updateAvailable && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 24px',
              backgroundColor: updateDownloaded ? '#3b82f6' : '#1e293b',
              color: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {updateDownloaded ? (
              <>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>
                  🎉 새 버전 다운로드가 완료되었습니다! 최신 기능과 버그 수정을 적용하려면 앱을
                  재시작해 주세요.
                </span>
                <button
                  onClick={() => window.electron.ipcRenderer.invoke('install-update')}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e40af',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  지금 재시작하여 적용
                </button>
              </>
            ) : (
              <>
                <span
                  className="spinner"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></span>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>
                  최신 업데이트를 백그라운드에서 안전하게 다운로드 중입니다... 잠시만 기다려주세요.
                </span>
              </>
            )}
          </div>
        )}

        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: updateAvailable ? '48px' : '0',
            transition: 'margin-top 0.3s ease'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#2d3748' }}>
            {currentView === 'SOURCING' && '상품 수집 (소싱 마스터)'}
            {currentView === 'SYNC' && '마켓 연동 (배포 마스터)'}
            {currentView === 'ORDERS' && '주문 관리'}
            {currentView === 'SETTINGS' && '환경 설정'}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {masterSheetId && (
              <span
                style={{
                  fontSize: '12px',
                  color: '#718096',
                  backgroundColor: '#edf2f7',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                마스터 DB 연결됨
              </span>
            )}
            {userEmail && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#475569' }}>
                  {userEmail}
                </span>
                {licenseTier && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#ffffff',
                      backgroundColor: licenseTier.includes('pro') ? '#3b82f6' : '#10B981',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {licenseTier.replace('trial_14days', 'FREE').replace('free', 'FREE')}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    marginLeft: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title="로그아웃"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flex: 1, padding: '32px', overflow: 'hidden' }}>
          <div
            className="card glass-panel"
            style={{
              flex: '1 1 60%',
              display: 'flex',
              flexDirection: 'column',
              padding: '32px',
              overflowY: 'auto'
            }}
          >
            {currentView === 'SOURCING' && (
              <DataPrepStep
                sheetId={sheetId}
                handleCreateSheet={handleCreateSheet}
                handleOpenSheet={handleOpenSheet}
                scrapeMethod={scrapeMethod}
                setScrapeMethod={setScrapeMethod}
                scrapeQuery={scrapeQuery}
                setScrapeQuery={setScrapeQuery}
                handleScrape={handleScrape}
                isScraping={isScraping}
                handleCancelScrape={handleCancelScrape}
              />
            )}

            {currentView === 'SYNC' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    backgroundColor: 'rgba(226, 232, 240, 0.6)',
                    padding: '6px',
                    borderRadius: '12px',
                    alignSelf: 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <button
                    onClick={() => setSyncMode('register')}
                    style={{
                      backgroundColor: syncMode === 'register' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: syncMode === 'register' ? 700 : 600,
                      color: syncMode === 'register' ? '#0f172a' : '#64748b',
                      padding: '10px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: syncMode === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Rocket size={18} /> 마켓 일괄 등록 (1:N 배포)
                    </div>
                  </button>
                  <button
                    onClick={() => setSyncMode('master')}
                    style={{
                      backgroundColor: syncMode === 'master' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: syncMode === 'master' ? 700 : 600,
                      color: syncMode === 'master' ? '#0f172a' : '#64748b',
                      padding: '10px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: syncMode === 'master' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} /> 마스터 DB 동기화 및 모니터링
                    </div>
                  </button>
                </div>

                {syncMode === 'register' && (
                  <MarketSyncStep
                    sheetData={sheetData}
                    syncStatuses={syncStatuses}
                    handleReadProducts={handleReadProducts}
                    handleSyncProducts={handleSyncProducts}
                    handleFetchSmartStoreOrders={handleFetchSmartStoreOrders}
                    marginRate={marginRate}
                    setMarginRate={setMarginRate}
                    extraShippingCost={extraShippingCost}
                    setExtraShippingCost={setExtraShippingCost}
                    masterSheetId={masterSheetId!}
                    licenseTier={licenseTier}
                    betaMarketsInfo={betaMarketsInfo}
                    credentials={credentials}
                    cafe24Credentials={cafe24Credentials}
                  />
                )}

                {syncMode === 'master' && (
                  <SyncStepMaster
                    masterSheetId={masterSheetId!}
                    activePlans={activePlans}
                    licenseTier={licenseTier}
                    betaMarketsInfo={betaMarketsInfo}
                    credentials={credentials}
                    cafe24Credentials={cafe24Credentials}
                  />
                )}
              </div>
            )}

            {currentView === 'ORDERS' && (
              <OrderSyncStep
                addLog={addLog}
                licenseTier={licenseTier}
                betaMarketsInfo={betaMarketsInfo}
                credentials={credentials}
                cafe24Credentials={cafe24Credentials}
                orders={orders}
                setOrders={setOrders}
                orderDBId={orderDBId}
                setOrderDBId={setOrderDBId}
              />
            )}

            {currentView === 'SETTINGS' && (
              <SettingsStep
                credentials={credentials}
                setCredentials={setCredentials}
                cafe24Credentials={cafe24Credentials}
                setCafe24Credentials={setCafe24Credentials}
                addLog={addLog}
                categoryMasterSheetId={categoryMasterSheetId}
                handleOpenCategorySheet={handleOpenCategorySheet}
                licenseTier={licenseTier}
              />
            )}
          </div>

          <ActionLogs logs={logs} />
        </div>
      </div>
    </div>
  )
}

export default App
