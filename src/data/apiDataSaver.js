// apiDataSaver.js
const API_BASE_URL = 'https://green-book-server-production.up.railway.app';

// ---------- MATERIAL SUPPLIERS ----------

export const createMaterialSupplier = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/material-suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("❌ createMaterialSupplier failed:", err.message);
        return null;
    }
};

export const updateMaterialSupplier = async (id, updates) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/material-suppliers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("❌ updateMaterialSupplier failed:", err.message);
        return null;
    }
};

export const deleteMaterialSupplier = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/material-suppliers/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        return !!result?.message;
    } catch (err) {
        console.error("❌ deleteMaterialSupplier failed:", err.message);
        return false;
    }
};

// ---------- MATERIALS ----------

export const createMaterial = async (payload) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("❌ createMaterial failed:", err.message);
        return null;
    }
};

export const updateMaterial = async (id, updates) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/materials/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("❌ updateMaterial failed:", err.message);
        return null;
    }
};

export const deleteMaterial = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/materials/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        return !!result?.message;
    } catch (err) {
        console.error("❌ deleteMaterial failed:", err.message);
        return false;
    }
};

// ---------- SUPPLIERS ----------

export const createSupplier = async (payload) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("❌ createSupplier failed:", err.message);
        return null;
    }
};

export const updateSupplier = async (id, updates) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("❌ updateSupplier failed:", err.message);
        return null;
    }
};

export const deleteSupplier = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        return !!result?.message;
    } catch (err) {
        console.error("❌ deleteSupplier failed:", err.message);
        return false;
    }
};
