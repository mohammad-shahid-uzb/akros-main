import React, { useState, useEffect } from "react";

export default function VendorModal({ show, onClose, onSave, initialData, categories }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        category: [],
    });

    useEffect(() => {
        if (initialData) setForm(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "category") {
            const updatedCategory = checked
                ? [...form.category, value]
                : form.category.filter((c) => c !== value);
            setForm({ ...form, category: updatedCategory });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = () => {
        if (!form.name || !form.email || form.category.length === 0) {
            alert("Please fill all required fields");
            return;
        }
        onSave(form);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={onClose}>
            <div
                className="bg-white rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Vendor" : "Add Vendor"}</h2>

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
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone"
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
                </div>

                <div className="flex justify-end mt-4 space-x-3">
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
    );
}
