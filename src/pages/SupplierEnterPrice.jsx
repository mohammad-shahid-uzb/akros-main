import React, { useEffect, useState } from "react";

export default function SupplierEnterPrice() {
    const [allMaterials, setAllMaterials] = useState([]); // all fetched materials
    const [materials, setMaterials] = useState([]); // filtered materials
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        material: "",
        price: "",
        currency: "USD",
        unit: "ton",
        availability: "In Stock",
        supplierName: "Akros Supplier", // test supplier name
        category: "",
    });

    // Fetch materials
    useEffect(() => {
        fetch("http://localhost:4000/api/materials")
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched materials:", data);
                setAllMaterials(data);

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map((m) => m.category))];
                setCategories(uniqueCategories);

                // Optionally set the first category as default
                if (uniqueCategories.length > 0) setForm((prev) => ({ ...prev, category: uniqueCategories[0] }));
            })
            .catch((err) => console.error(err));
    }, []);

    // Filter materials whenever category or allMaterials change
    useEffect(() => {
        if (!form.category) return;

        const filtered = allMaterials
            .filter((m) => m.category === form.category) // filter by category
            .filter(
                (m) =>
                    !m.prices || !m.prices.some((p) => p.supplierName === form.supplierName)
            ); // filter by supplier

        console.log(
            `Materials available for ${form.supplierName} in category "${form.category}":`,
            filtered.map((m) => m.name)
        );

        setMaterials(filtered);
        setForm((prev) => ({ ...prev, material: "" })); // reset selected material
    }, [form.category, allMaterials, form.supplierName]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:4000/api/material-suppliers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to add price");
            console.log("Response status:", res);
            const data = await res.json();
            alert("✅ Price entry added for " + data.materialName);

            setForm({
                material: "",
                price: "",
                currency: "USD",
                unit: "ton",
                availability: "In Stock",
                supplierName: form.supplierName,
                category: form.category,
            });
        } catch (err) {
            console.error(err);
            alert("❌ Error adding price entry");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-gray-100">
                <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
                    💰 Supplier Material Pricing
                </h1>

                <div className="text-center mb-6">
                    <p className="text-lg font-semibold text-gray-700">
                        👋 Welcome, <span className="text-blue-600">{form.supplierName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category dropdown */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Material dropdown */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Material</label>
                        <select
                            name="material"
                            value={form.material}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price, currency, unit */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Price</label>
                        <input
                            name="price"
                            type="number"
                            placeholder="Enter price"
                            value={form.price}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Currency</label>
                            <input
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Unit</label>
                            <input
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Availability</label>
                        <select
                            name="availability"
                            value={form.availability}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-[1.02]"
                    >
                        💾 Save Price
                    </button>
                </form>
            </div>
        </div>
    );
}
