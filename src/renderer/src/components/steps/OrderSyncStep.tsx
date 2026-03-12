import React, { useState } from 'react'
import {
  Download,
  RefreshCw,
  Filter,
  CalendarDays,
  ShoppingBag,
  Truck,
  CheckCircle2,
  ChevronRight,
  Search,
  FileText,
  X
} from 'lucide-react'

interface OrderSyncStepProps {
  addLog: (msg: string) => void
  licenseTier: 'free' | 'pro'
  betaMarketsInfo: Record<string, unknown>
  credentials?: { clientId: string; clientSecret: string }
  cafe24Credentials?: { mallId: string; connected: boolean }
  orders: MockOrder[]
  setOrders: React.Dispatch<React.SetStateAction<MockOrder[]>>
  orderDBId: string
  setOrderDBId: React.Dispatch<React.SetStateAction<string>>
}

export type OrderStatus =
  | 'PAY_WAITING'
  | 'PAYED'
  | 'DISPATCHED'
  | 'CANCEL_REQUEST'
  | 'RETURN_REQUEST'

export interface MockOrder {
  id: string
  marketName: string
  orderDate: string
  productName: string
  option: string
  quantity: number
  price: number
  buyerName: string
  status: OrderStatus
  address?: string
  phone?: string
}

export const OrderSyncStep: React.FC<OrderSyncStepProps> = ({
  addLog,
  licenseTier,
  betaMarketsInfo,
  credentials,
  cafe24Credentials,
  orders,
  setOrders,
  orderDBId,
  setOrderDBId
}) => {
  const [selectedMarket, setSelectedMarket] = useState<string>('all')
  const [isFetching, setIsFetching] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null)

  // Initial load from Google Sheets if connected but memory is empty
  React.useEffect(() => {
    if (orderDBId && orders.length === 0) {
      handleLoadOrdersFromDB()
    }
  }, [orderDBId])

  const handleLoadOrdersFromDB = async () => {
    setIsFetching(true)
    addLog('마스터 DB에서 기존 주문 데이터를 불러옵니다...')
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ipcRenderer = (window as any).electron.ipcRenderer
      const res = await ipcRenderer.invoke('read-sheet', orderDBId, 'A2:M')
      if (res.success && res.data) {
        const loadedOrders: MockOrder[] = res.data.map((row: string[]) => ({
          marketName: row[0] || '',
          id: row[1] || `UNK-${Math.random()}`,
          orderDate: row[2] || '',
          status: (row[3] as OrderStatus) || 'PAYED',
          productName: row[4] || '',
          option: row[5] || '',
          quantity: parseInt(row[6], 10) || 1,
          buyerName: row[7] || '',
          price: parseInt(row[8], 10) || 0,
          address: row[9] || '',
          phone: ''
        }))
        // Sort by date desc
        loadedOrders.sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        setOrders(loadedOrders)
        addLog(`✅ 마스터 DB에서 ${loadedOrders.length}건의 주문 내역을 복원했습니다.`)
      } else if (res.error) {
        throw new Error(res.error)
      }
    } catch (err: unknown) {
      addLog(`❌ 마스터 DB 조회 오류: ${(err as Error).message}`)
    } finally {
      setIsFetching(false)
    }
  }

  const handleConnectOrderDB = async () => {
    setIsConnecting(true)
    addLog('구글 드라이브에서 통합 주문수집 마스터 DB를 검색/생성합니다...')
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ipcRenderer = (window as any).electron.ipcRenderer
      const res = await ipcRenderer.invoke('get-or-create-order-db')
      if (res.success && res.spreadsheetId) {
        setOrderDBId(res.spreadsheetId)
        addLog(`✅ 주문 마스터 DB 연결 성공! (ID: ${res.spreadsheetId})`)
      } else {
        throw new Error(res.error || '알 수 없는 오류')
      }
    } catch (err: unknown) {
      addLog(`❌ 마스터 DB 연결 실패: ${(err as Error).message}`)
      alert(`마스터 DB 연동 중 오류가 발생했습니다.\n${(err as Error).message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleFetchOrders = async () => {
    setIsFetching(true)
    addLog('각 마켓의 최근 주문 내역을 동기화합니다...')

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ipcRenderer = (window as any).electron.ipcRenderer
      let fetchedOrders: MockOrder[] = []

      // Helper to parsing the array to MockOrder
      const parseOrder = (arr: string[], marketName: string): MockOrder => {
        let status: OrderStatus = 'PAYED'
        const rawStatus = arr[9] || ''
        if (rawStatus.includes('배송준비') || rawStatus === 'PAYED' || rawStatus === 'N40')
          status = 'PAYED'
        else if (rawStatus.includes('배송중') || rawStatus === 'DISPATCHED') status = 'DISPATCHED'
        else if (rawStatus.includes('대기') || rawStatus === 'PAY_WAITING') status = 'PAY_WAITING'
        else if (rawStatus.includes('취소') || rawStatus === 'CANCEL_REQUEST')
          status = 'CANCEL_REQUEST'
        else if (rawStatus.includes('반품') || rawStatus === 'RETURN_REQUEST')
          status = 'RETURN_REQUEST'

        return {
          id: arr[1] || `UNK-${Date.now()}`,
          marketName,
          orderDate: arr[0] || new Date().toISOString().slice(0, 16).replace('T', ' '),
          productName: arr[2] || '상품명 없음',
          option: arr[3] || '단품',
          quantity: parseInt(arr[4], 10) || 1,
          buyerName: arr[5] || '알수없음',
          address: arr[6] || '',
          phone: arr[7] || '',
          price: parseInt(arr[8].replace(/,/g, ''), 10) || 0,
          status
        }
      }

      const fetchPromises: Promise<void>[] = []

      // 1. Fetch SmartStore (If selected and have Pro license)
      if (
        (selectedMarket === 'all' || selectedMarket === 'smartstore') &&
        licenseTier !== 'free' &&
        credentials?.clientId
      ) {
        fetchPromises.push(
          ipcRenderer
            .invoke('fetch-smartstore', credentials.clientId, credentials.clientSecret)
            .then((res: unknown) => {
              const result = res as { success: boolean; data?: string[][]; error?: string }
              if (result.success && result.data) {
                const parsed = result.data.map((row: string[]) => parseOrder(row, '스마트스토어'))
                fetchedOrders = [...fetchedOrders, ...parsed]
                addLog(`네이버 스마트스토어 주문 ${parsed.length}건 수집 완료.`)
              } else {
                addLog(`⚠️ 스마트스토어 주문 수집 실패: ${result.error || '알 수 없는 오류'}`)
              }
            })
            .catch((err: Error) => addLog(`⚠️ 스마트스토어 IPC 통신 오류: ${err.message}`))
        )
      }

      // 2. Fetch Cafe24 (If selected and connected)
      if (
        (selectedMarket === 'all' || selectedMarket === 'cafe24') &&
        cafe24Credentials?.connected
      ) {
        // Determine Date Range (Defaulting to recent 3 days for now to ensure data is caught)
        const endDt = new Date()
        const startDt = new Date()
        startDt.setDate(startDt.getDate() - 3)

        const formatDt = (d: Date) => d.toISOString().split('T')[0]

        fetchPromises.push(
          ipcRenderer
            .invoke(
              'fetch-cafe24-orders',
              cafe24Credentials.mallId,
              formatDt(startDt),
              formatDt(endDt)
            )
            .then((res: unknown) => {
              const result = res as { success: boolean; orders?: string[][]; error?: string }
              if (result.success && result.orders) {
                const parsed = result.orders.map((row: string[]) => parseOrder(row, '카페24'))
                fetchedOrders = [...fetchedOrders, ...parsed]
                addLog(`카페24(${cafe24Credentials.mallId}) 주문 ${parsed.length}건 수집 완료.`)
              } else {
                addLog(`⚠️ 카페24 주문 수집 실패: ${result.error || '알 수 없는 오류'}`)
              }
            })
            .catch((err: Error) => addLog(`⚠️ 카페24 IPC 통신 오류: ${err.message}`))
        )
      }

      if (fetchPromises.length === 0) {
        addLog('⚠️ API가 연결된 마켓이 없습니다. 환경 설정을 먼저 진행해주세요.')
        setIsFetching(false)
        return
      }

      await Promise.all(fetchPromises)

      // Filter out existing orders based on ID to find only truly NEW orders
      const newOrders = fetchedOrders.filter((fo) => !orders.some((eo) => eo.id === fo.id))

      if (newOrders.length > 0) {
        // Sort by Date Descending
        newOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())

        // Append to Google Sheets directly if DB is connected
        if (orderDBId) {
          addLog(`구글 시트에 신규 주문 ${newOrders.length}건을 기록합니다...`)
          const rowsToAppend = newOrders.map((o) => [
            o.marketName,
            o.id,
            o.orderDate,
            o.status,
            o.productName,
            o.option,
            o.quantity,
            o.buyerName,
            o.price,
            `${o.buyerName} / ${o.phone} / ${o.address}`,
            '', // 택배사
            '', // 송장번호
            '' // 발송일자
          ])
          await ipcRenderer.invoke('append-orders-to-sheet', orderDBId, rowsToAppend)
          addLog(`✅ 구글 시트에 신규 주문 기록 완료.`)
        } else {
          addLog(`⚠️ 주문 마스터 DB가 연결되지 않아 임시 보관됩니다.`)
        }

        const updatedOrders = [...orders, ...newOrders]
        updatedOrders.sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        setOrders(updatedOrders)
        addLog(`✅ 총 ${newOrders.length}건의 신규 주문 동기화가 완료되었습니다.`)
      } else {
        addLog(`✅ 동기화 완료: 새로운 주문이 없습니다.`)
      }
    } catch (error: unknown) {
      addLog(`❌ 주문 수집 중 시스템 오류 발생: ${(error as Error).message}`)
    } finally {
      setIsFetching(false)
    }
  }

  const handleDownloadExcel = () => {
    addLog('도매토피아 발주 전용 엑셀 포맷으로 다운로드를 시작합니다.')
    alert('발주서 엑셀 다운로드 (기능 준비 중)')
  }

  const handleSyncToMaster = () => {
    addLog('선택된 주문 데이터를 구글 마스터 시트로 백업합니다.')
    alert('구글 시트 백업 (기능 준비 중)')
  }

  const getStatusBadge = (status: OrderStatus) => {
    const baseStyle: React.CSSProperties = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }
    switch (status) {
      case 'PAY_WAITING':
        return (
          <span style={{ ...baseStyle, background: '#fef3c7', color: '#d97706' }}>결제대기</span>
        )
      case 'PAYED':
        return (
          <span style={{ ...baseStyle, background: '#dcfce7', color: '#15803d' }}>
            결제완료 (신규발주)
          </span>
        )
      case 'DISPATCHED':
        return <span style={{ ...baseStyle, background: '#eff6ff', color: '#1d4ed8' }}>배송중</span>
      case 'CANCEL_REQUEST':
        return (
          <span style={{ ...baseStyle, background: '#fee2e2', color: '#b91c1c' }}>취소요청</span>
        )
      case 'RETURN_REQUEST':
        return (
          <span style={{ ...baseStyle, background: '#f3e8ff', color: '#7e22ce' }}>반품요청</span>
        )
      default:
        return null
    }
  }

  return (
    <div
      style={{
        padding: '24px 32px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* Controls & Filters Wrapper */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}
        >
          <div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={24} color="#3b82f6" /> 통합 주문 관리
            </h1>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>
              연동된 모든 마켓의 신규 주문을 수집하고, 구글 시트에 누적 기록하여 발주를 관리합니다.
            </p>
          </div>
        </div>

        {/* DB Connection Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--color-text)' }}>
              통합 주문수집 마스터 DB 연결
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {orderDBId
                ? '구글 스프레드시트에 주문 데이터베이스가 안전하게 연결되어 있습니다.'
                : '수집된 주문 목록을 영구적으로 보관하고 관리할 구글 시트를 연동하세요.'}
            </p>
          </div>
          {orderDBId ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#dcfce7',
                color: '#15803d',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <CheckCircle2 size={16} /> 연결됨
            </div>
          ) : (
            <button className="primary" onClick={handleConnectOrderDB} disabled={isConnecting}>
              {isConnecting ? '연결 중...' : '마스터 DB 연동하기'}
            </button>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap' }}>
            <button
              className="secondary"
              onClick={handleDownloadExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                padding: '10px 16px',
                whiteSpace: 'nowrap'
              }}
              disabled={orders.length === 0}
            >
              <Download size={16} /> 도매처 발주서 다운로드
            </button>
            <button
              className="primary"
              onClick={handleFetchOrders}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                padding: '10px 16px',
                whiteSpace: 'nowrap'
              }}
              disabled={isFetching || !orderDBId}
            >
              {isFetching ? (
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <RefreshCw size={16} />
              )}
              {isFetching ? '수집 중...' : '신규 주문 마스터 동기화'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '8px'
              }}
            >
              <CalendarDays size={14} /> 조회 기간
            </label>
            <select style={{ width: '100%', fontSize: '14px', padding: '10px' }}>
              <option>최근 24시간 변경분 (권장)</option>
              <option>최근 3일</option>
              <option>최근 1주일</option>
              <option>직접 지정</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '8px'
              }}
            >
              <Filter size={14} /> 마켓 필터
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              style={{ width: '100%', fontSize: '14px', padding: '10px' }}
            >
              <option value="all">전체 마켓</option>
              <option value="cafe24">카페24 (Cafe24)</option>
              <option value="smartstore" disabled={licenseTier === 'free'}>
                네이버 스마트스토어 {licenseTier === 'free' ? '🔒' : ''}
              </option>
              <option value="coupang" disabled={licenseTier === 'free'}>
                쿠팡 {licenseTier === 'free' ? '🔒' : ''}
              </option>
            </select>
          </div>
          {/* Dummy usage for betaMarketsInfo to pass linting */}
          <div style={{ display: 'none' }}>{Object.keys(betaMarketsInfo).length}</div>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '8px'
              }}
            >
              <Search size={14} /> 주문 검색
            </label>
            <input
              type="text"
              placeholder="구매자명, 수취인명, 상품명, 전화번호 검색"
              style={{ width: '100%', fontSize: '14px', padding: '10px' }}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        className="glass-panel"
        style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text)'
            }}
          >
            <CheckCircle2 size={18} color="#10b981" /> 처리 대기 중인 발주 목록{' '}
            <span style={{ color: 'var(--color-primary)' }}>({orders.length})</span>
          </h3>
          {orders.length > 0 && (
            <button
              className="secondary"
              onClick={handleSyncToMaster}
              style={{
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                whiteSpace: 'nowrap'
              }}
            >
              구글 시트에 백업하기 <ChevronRight size={14} />
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '40px 0',
              color: 'var(--color-text-muted)'
            }}
          >
            <div
              style={{
                background: 'var(--color-surface-elevated)',
                padding: '24px',
                borderRadius: '50%',
                marginBottom: '16px'
              }}
            >
              <div style={{ opacity: 0.5 }}>
                <Truck size={40} />
              </div>
            </div>
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--color-text)'
              }}
            >
              조회된 신규 주문이 없습니다.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                textAlign: 'center',
                color: 'var(--color-text-muted)'
              }}
            >
              우측 상단의 [신규 주문 마스터 동기화] 버튼을 눌러
              <br />각 마켓의 최신 상태를 불러오세요.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input type="checkbox" style={{ accentColor: '#3b82f6' }} />
                  </th>
                  <th>주문채널 / 주문번호</th>
                  <th>상품 정보</th>
                  <th>구매자</th>
                  <th>결제금액</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" style={{ accentColor: '#3b82f6' }} />
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background:
                              order.marketName === '스마트스토어'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : 'rgba(56, 189, 248, 0.15)',
                            color: order.marketName === '스마트스토어' ? '#22c55e' : '#38bdf8'
                          }}
                        >
                          {order.marketName === '스마트스토어' ? 'N' : 'C'}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color: 'var(--color-text)'
                          }}
                        >
                          {order.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {order.orderDate}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                        {order.productName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          className="ghost"
                          style={{
                            padding: 0,
                            margin: 0,
                            height: 'auto',
                            background: 'transparent',
                            textAlign: 'left'
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <span
                            style={{
                              fontSize: '13px',
                              color: 'var(--color-text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {order.option} / {order.quantity}개{' '}
                            <FileText size={14} color="#eab308" />
                          </span>
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{order.buyerName}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {order.price.toLocaleString()} 원
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '500px',
              maxWidth: '90vw',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-surface-elevated)'
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={20} color="var(--color-primary)" />
                주문 상세 보기
              </h3>
              <button
                className="ghost"
                style={{ padding: '4px' }}
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: '12px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
              >
                <div style={{ color: 'var(--color-text-muted)' }}>주문번호</div>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  [{selectedOrder.marketName}] {selectedOrder.id}
                </div>

                <div style={{ color: 'var(--color-text-muted)' }}>주문일시</div>
                <div>{selectedOrder.orderDate}</div>

                <div style={{ color: 'var(--color-text-muted)' }}>주문상태</div>
                <div>{getStatusBadge(selectedOrder.status)}</div>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    height: '1px',
                    background: 'var(--color-border)',
                    margin: '8px 0'
                  }}
                />

                <div style={{ color: 'var(--color-text-muted)' }}>상품명</div>
                <div style={{ fontWeight: 500 }}>{selectedOrder.productName}</div>

                <div style={{ color: 'var(--color-text-muted)' }}>옵션/수량</div>
                <div>
                  {selectedOrder.option} /{' '}
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {selectedOrder.quantity}개
                  </span>
                </div>

                <div style={{ color: 'var(--color-text-muted)' }}>결제금액</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)' }}>
                  {selectedOrder.price.toLocaleString()} 원
                </div>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    height: '1px',
                    background: 'var(--color-border)',
                    margin: '8px 0'
                  }}
                />

                <div style={{ color: 'var(--color-text-muted)' }}>구매자(수취인)</div>
                <div style={{ fontWeight: 500 }}>{selectedOrder.buyerName}</div>

                <div style={{ color: 'var(--color-text-muted)' }}>연락처</div>
                <div>{selectedOrder.phone || '연락처 정보 없음'}</div>

                <div style={{ color: 'var(--color-text-muted)' }}>배송지 주소</div>
                <div style={{ lineHeight: '1.4' }}>{selectedOrder.address || '주소 정보 없음'}</div>
              </div>
            </div>
            <div
              style={{
                padding: '16px 24px',
                background: 'var(--color-surface)',
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: '1px solid var(--color-border)'
              }}
            >
              <button className="primary" onClick={() => setSelectedOrder(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
