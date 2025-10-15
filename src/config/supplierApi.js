export const API_BASE_URL = "http://localhost:4000"; // change this to your production domain when deploying

const API_URL = `${API_BASE_URL}/api/suppliers`;

export const getSuppliers = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    return await res.json();
};

export const createSupplier = async (supplier) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
    });

    if (!res.ok) throw new Error("Failed to create supplier");
    return await res.json();
};

export const updateSupplier = async (id, supplier) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
    });

    if (!res.ok) throw new Error("Failed to update supplier");
    return await res.json();
};

export const deleteSupplier = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete supplier");
    return true;
};
