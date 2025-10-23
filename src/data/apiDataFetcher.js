// apiDataFetcher.js
const API_BASE_URL = 'https://green-book-server-production.up.railway.app'; // Adjust as needed

/**
 * Fetch a single endpoint with retries and robust error handling
 * @param {string} endpoint - API endpoint (e.g. "/api/materials")
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<any|null>} - Parsed JSON or null on failure
 */
export const fetchDataWithRetry = async (endpoint, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} – ${response.statusText}`);
            }

            const data = await response.json().catch(() => {
                throw new Error(`Invalid JSON from ${endpoint}`);
            });

            return data;
        } catch (error) {
            console.error(`⚠️ Error fetching ${endpoint} (attempt ${attempt}/${retries}):`, error.message);
            if (attempt === retries) {
                console.error(`❌ Giving up on ${endpoint}`);
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // exponential backoff
        }
    }
};

/**
 * Fetch all core datasets (materials, suppliers, materialSuppliers)
 */
export const fetchApiData = async () => {
    try {
        const [materials, suppliers, materialSuppliers] = await Promise.all([
            fetchDataWithRetry('/api/materials'),
            fetchDataWithRetry('/api/suppliers'),
            fetchDataWithRetry('/api/material-suppliers')
        ]);

        return {
            materials: Array.isArray(materials) ? materials : [],
            suppliers: Array.isArray(suppliers) ? suppliers : [],
            materialSuppliers: Array.isArray(materialSuppliers) ? materialSuppliers : []
        };
    } catch (error) {
        console.error("❌ fetchApiData failed:", error.message);
        return { materials: [], suppliers: [], materialSuppliers: [] };
    }
};

/**
 * Generic fetch for multiple endpoints with dynamic keys
 */
export const fetchAllApiData = async () => {
    const endpoints = [
        { key: 'materials', path: '/api/materials' },
        { key: 'suppliers', path: '/api/suppliers' },
        { key: 'materialSuppliers', path: '/api/material-suppliers' }
    ];

    const results = {};
    for (const endpoint of endpoints) {
        results[endpoint.key] = (await fetchDataWithRetry(endpoint.path)) || [];
    }
    return results;
};

/**
 * Fetch paginated material-suppliers WITH materials and suppliers data
 */
export const fetchPaginatedMaterialSuppliers = async (page = 1, limit = 50, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(filters.search && { search: filters.search }),
            ...(filters.category && filters.category !== 'All' && { category: filters.category }),
            ...(filters.supplierId && { supplierId: filters.supplierId }),
            ...(filters.materialId && { materialId: filters.materialId })
        });

        const result = await fetchDataWithRetry(`/api/material-suppliers/paginated?${params}`);
        if (!result) throw new Error("Failed to fetch paginated material-suppliers");

        return {
            data: result.data || [],
            materials: result.materials || [],
            suppliers: result.suppliers || [],
            page: result.page ?? page,
            pages: result.pages ?? 1,
            total: result.total ?? 0
        };
    } catch (error) {
        console.error('❌ Error fetching paginated material-suppliers:', error.message);
        return { data: [], materials: [], suppliers: [], page: 1, pages: 1, total: 0 };
    }
};

/**
 * Fetch all three endpoints separately: materials, suppliers, and material-suppliers
 */
export const fetchAllThreeEndpoints = async (page = 1, limit = 50, filters = {}) => {
    try {
        const query = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(filters.search && { search: filters.search }),
            ...(filters.category && filters.category !== 'All' && { category: filters.category })
        });

        const [materials, suppliers, materialSuppliers] = await Promise.all([
            fetchDataWithRetry('/api/materials'),
            fetchDataWithRetry('/api/suppliers'),
            fetchDataWithRetry(`/api/material-suppliers/paginated?${query}`)
        ]);

        if (!materials || !suppliers || !materialSuppliers) {
            throw new Error("One or more API calls failed");
        }

        return {
            data: materialSuppliers.data || [],
            materials: materials || [],
            suppliers: suppliers || [],
            page: materialSuppliers.page || page,
            pages: materialSuppliers.pages || 1,
            total: materialSuppliers.total || 0
        };
    } catch (error) {
        console.error('❌ Error fetching all three endpoints:', error.message);
        return { data: [], materials: [], suppliers: [], page: 1, pages: 1, total: 0 };
    }
};

// ---------- SUPPLIERS ----------
export const fetchSuppliers = async () => {
    return (await fetchDataWithRetry('/api/suppliers')) || [];
};

export const fetchSupplierById = async (id) => {
    return (await fetchDataWithRetry(`/api/suppliers/${id}`)) || null;
};

// ---------- MATERIALS ----------
export const fetchMaterials = async () => {
    return (await fetchDataWithRetry('/api/materials')) || [];
};

export const fetchMaterialById = async (id) => {
    return (await fetchDataWithRetry(`/api/materials/${id}`)) || null;
};

export const fetchTopSuppliersForMaterial = async (id, limit = 3) => {
    return (await fetchDataWithRetry(`/api/materials/${id}/cheapest-suppliers?limit=${limit}`)) || [];
};

export const fetchGlobalCheapestSuppliers = async (limit = 3) => {
    return (await fetchDataWithRetry(`/api/materials/cheapest?limit=${limit}`)) || [];
};
