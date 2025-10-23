import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

export default function VendorModal({
    show,
    onClose,
    onSave,
    onDelete,
    initialData,
    categories,
}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        contact: "",
        city: "",
        country: "",
        category: [],
        certifications: [], // 🧩 new for file upload
    });

    // Normalized for display: { href: string, label: string, raw: string|object }
    const [existingCertifications, setExistingCertifications] = useState([]);

    useEffect(() => {
        if (initialData) {
            console.log("[VendorModal] initialData received", initialData);
            console.log("[VendorModal] initialData.certifications (raw)", initialData.certifications);
            setForm({
                name: initialData.name || "",
                email: initialData.contact?.email || initialData.email || "",
                contact: initialData.contact?.phone || initialData.phone || "",
                city: initialData.location?.city || initialData.city || "",
                country: initialData.location?.country || initialData.country || "",
                category: initialData.category || [],
                certifications: [], // don't prefill files
            });
            // Normalize certifications for display
            const rawCerts = Array.isArray(initialData.certifications) ? initialData.certifications : [];
            const normalized = rawCerts.map((c, idx) => {
                if (typeof c === "string") {
                    const isAbsolute = /^https?:\/\//i.test(c);
                    const href = isAbsolute ? c : `${API_BASE_URL}${c.startsWith('/') ? '' : '/'}${c}`;
                    const label = c.split('/').pop() || `Document-${idx + 1}`;
                    return { href, label, raw: c };
                }
                if (c && typeof c === "object") {
                    const hrefCandidate = c.url || c.path || c.fileUrl || c.filepath || c.location || c.href;
                    const isAbsolute = hrefCandidate ? /^https?:\/\//i.test(hrefCandidate) : false;
                    const href = hrefCandidate
                        ? (isAbsolute ? hrefCandidate : `${API_BASE_URL}${hrefCandidate.startsWith('/') ? '' : '/'}${hrefCandidate}`)
                        : undefined;
                    const label = c.filename || c.originalname || c.name || (hrefCandidate ? hrefCandidate.split('/').pop() : `Document-${idx + 1}`);
                    return href ? { href, label, raw: c } : null;
                }
                return null;
            }).filter(Boolean);
            console.log("[VendorModal] normalized existingCertifications", normalized);
            setExistingCertifications(normalized);
        } else {
            setForm({
                name: "",
                email: "",
                contact: "",
                city: "",
                country: "",
                category: [],
                certifications: [],
            });
            setExistingCertifications([]);
        }
    }, [initialData]);

    // 🧩 Handle text & checkbox changes
    const handleChange = (e) => {
        const { name, value, checked, files } = e.target;

        if (name === "category") {
            const updatedCategory = checked
                ? [...form.category, value]
                : form.category.filter((c) => c !== value);
            setForm({ ...form, category: updatedCategory });
        } else if (name === "certifications") {
            setForm({ ...form, certifications: Array.from(files) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // 🧩 Submit handler (creates FormData for multer)
    const handleSubmit = async () => {
        if (!form.name || !form.email || form.category.length === 0) {
            alert("Please fill all required fields");
            return;
        }

        const mode = initialData ? "update" : "create";
        const targetId = initialData?._id || initialData?.__id || null;
        console.log("[VendorModal] Submit clicked", {
            mode,
            targetId,
            formSnapshot: {
                name: form.name,
                email: form.email,
                contact: form.contact,
                city: form.city,
                country: form.country,
                categoriesCount: form.category.length,
                filesCount: form.certifications.length,
                existingCertificationsCount: existingCertifications.length,
            },
        });

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("contact[email]", form.email);
        formData.append("contact[phone]", form.contact);
        formData.append("location[city]", form.city);
        formData.append("location[country]", form.country);
        form.category.forEach((cat) => formData.append("category", cat));
        form.certifications.forEach((file) =>
            formData.append("certifications", file)
        );
        // Include existing certifications so backend can retain them
        // Send as JSON array of hrefs (server should merge them)
        try {
            const rawList = existingCertifications.map((c) => (c.raw !== undefined ? c.raw : c.href));
            formData.append("existingCertifications", JSON.stringify(rawList));
        } catch (e) {
            console.warn("[VendorModal] failed to serialize existingCertifications", e);
        }

        console.log("[VendorModal] Prepared FormData", {
            keys: Array.from(formData.keys()),
        });



        try {
            const requestInfo = initialData && (initialData._id || initialData.__id)
                ? { method: "PUT", url: `https://green-book-server-production.up.railway.app/api/suppliers/${initialData._id || initialData.__id}` }
                : { method: "POST", url: "https://green-book-server-production.up.railway.app/api/suppliers" };
            console.log("[VendorModal] Sending request", requestInfo);
            const res = await fetch(requestInfo.url, {
                method: requestInfo.method,
                body: formData,
            });

            console.log("[VendorModal] Response status:", res.status);
            const data = await res.json();
            console.log("[VendorModal] Response JSON:", data);
            if (!res.ok) throw new Error(data.error || "Upload failed");


            alert("Supplier saved successfully!");
            const savedSupplier = data?.supplier ?? data;
            onSave(savedSupplier);
            onClose();
        } catch (err) {
            console.error("❌ Error saving supplier:", err);
            alert("Error saving supplier: " + err.message);
        }
    };

    // 🗑️ Handle delete
    const handleDelete = () => {
        if (!initialData?._id) {
            alert("Vendor ID not found");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${form.name}"?`
        );
        if (confirmDelete && onDelete) {
            onDelete(initialData._id);
        }
    };

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">
                    {initialData ? "Edit Vendor" : "Add Vendor"}
                </h2>

                <div className="space-y-3">
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Vendor Name"
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        name="contact"
                        value={form.contact}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        placeholder="Country"
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full border rounded px-3 py-2"
                    />

                    {/* 🏷️ Categories */}
                    <div>
                        <p className="font-medium mb-1">Supply Categories</p>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                            {categories.map((cat) => (
                                <label key={cat} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="category"
                                        value={cat}
                                        checked={form.category.includes(cat)}
                                        onChange={handleChange}
                                    />
                                    <span className="text-sm">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 🧾 Certifications upload */}
                    <div>
                        <p className="font-medium mb-1">Upload Certifications (PDF / JPEG)</p>
                        <input
                            type="file"
                            name="certifications"
                            accept=".pdf, .jpg, .jpeg"
                            multiple
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        />
                        {existingCertifications.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {console.log("[VendorModal] rendering existingCertifications", existingCertifications)}
                                <p className="text-sm text-gray-600">Existing Certifications</p>
                                <ul className="space-y-1">
                                    {existingCertifications.map((c, idx) => {
                                        const href = c.href;
                                        const label = c.label;
                                        return (
                                            <li key={`${href}-${idx}`} className="flex items-center justify-between text-sm">
                                                <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[75%]">{label}</a>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            // Optimistic UI update
                                                            setExistingCertifications((prev) => prev.filter((x, i) => !(i === idx && x.href === href)));
                                                            // Inform backend to remove this certification
                                                            const supplierId = initialData?._id || initialData?.__id;
                                                            if (!supplierId) return;
                                                            const payload = { removeCertification: c.raw ?? href };
                                                            console.log('[VendorModal] Removing certification', payload);
                                                            const res = await fetch(`https://green-book-server-production.up.railway.app/api/suppliers/${supplierId}/certifications`, {
                                                                method: 'DELETE',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify(payload),
                                                            });
                                                            const json = await res.json().catch(() => ({}));
                                                            if (!res.ok) {
                                                                console.error('[VendorModal] Failed to remove certification', json);
                                                                alert(json.error || 'Failed to remove certification');
                                                            }
                                                        } catch (e) {
                                                            console.error('[VendorModal] Error removing certification', e);
                                                            alert('Error removing certification');
                                                        }
                                                    }}
                                                    className="ml-2 px-2 py-0.5 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p className="text-xs text-gray-400">Removed items will not be retained unless re-uploaded.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    {initialData && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    )}

                    <div className="flex space-x-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {initialData ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
