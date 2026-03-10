import { getOrCreateCategoryMasterSheet } from './src/main/sheets';

async function testCreate() {
    try {
        console.log("Forcing creation of the Category Master DB...");
        const sheetId = await getOrCreateCategoryMasterSheet();
        console.log(`✅ Success! Created sheet ID: ${sheetId}`);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

testCreate();
