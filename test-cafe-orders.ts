import { fetchCafe24Orders } from './src/main/cafe24';

async function testFetchOrders() {
    const mallId = 'wiseteam';
    
    // Test pulling orders from the last 7 days
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    console.log(`Fetching Cafe24 orders for ${mallId} from ${formatDate(lastWeek)} to ${formatDate(today)}...`);

    try {
        const res: any = await fetchCafe24Orders(mallId, formatDate(lastWeek), formatDate(today));
        if (res.success && res.orders) {
            console.log(`✅ Success! Fetched ${res.orders.length} orders.`);
            if (res.orders.length > 0) {
                console.log(JSON.stringify(res.orders[0], null, 2));
            } else {
                console.log("No orders found in this period. The integration is working, just no test data.");
            }
        } else {
            console.error(`❌ Failed (API returned success: false):`, res.error);
        }
    } catch (e: any) {
         console.error(`❌ Failed to fetch orders:`, e.message);
    }
}

testFetchOrders();
