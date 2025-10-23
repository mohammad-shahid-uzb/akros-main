// Node.js script to test API data fetching
// Run with: node src/data/testApiData.js

const API_BASE_URL = 'https://green-book-server-production.up.railway.app'; // Adjust port as needed

// Function to fetch data from API endpoints
async function fetchApiData() {
    try {
        console.log('🚀 Starting API data fetch...');

        // Fetch materials data
        console.log('📦 Fetching materials data...');
        const materialsResponse = await fetch(`${API_BASE_URL}/api/materials`);
        const materialsData = await materialsResponse.json();
        console.log('✅ Materials Data:', JSON.stringify(materialsData, null, 2));

        // Fetch suppliers data
        console.log('🏢 Fetching suppliers data...');
        const suppliersResponse = await fetch(`${API_BASE_URL}/api/suppliers`);
        const suppliersData = await suppliersResponse.json();
        console.log('✅ Suppliers Data:', JSON.stringify(suppliersData, null, 2));

        // Fetch material-suppliers data
        console.log('🔗 Fetching material-suppliers data...');
        const materialSuppliersResponse = await fetch(`${API_BASE_URL}/api/material-suppliers`);
        const materialSuppliersData = await materialSuppliersResponse.json();
        console.log('✅ Material-Suppliers Data:', JSON.stringify(materialSuppliersData, null, 2));

        // Summary
        console.log('📊 Data Fetch Summary:');
        console.log(`- Materials: ${materialsData.length || 0} items`);
        console.log(`- Suppliers: ${suppliersData.length || 0} items`);
        console.log(`- Material-Suppliers: ${materialSuppliersData.length || 0} items`);

        return {
            materials: materialsData,
            suppliers: suppliersData,
            materialSuppliers: materialSuppliersData
        };

    } catch (error) {
        console.error('❌ Error fetching API data:', error);
        console.error('Make sure your server is running on the correct port');
        return null;
    }
}

// Function to test individual endpoints
async function testEndpoint(endpoint, name) {
    try {
        console.log(`📡 Testing ${name} endpoint...`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ ${name} Response:`, JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error(`❌ Error testing ${name}:`, error.message);
        return null;
    }
}

// Main execution
async function main() {
    console.log('🔧 API Data Fetcher Test Script');
    console.log('================================');

    // Test all endpoints
    await fetchApiData();

    console.log('\n🔍 Individual Endpoint Tests:');
    console.log('==============================');

    await testEndpoint('/api/materials', 'Materials');
    await testEndpoint('/api/suppliers', 'Suppliers');
    await testEndpoint('/api/material-suppliers', 'Material-Suppliers');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fetchApiData, testEndpoint };
