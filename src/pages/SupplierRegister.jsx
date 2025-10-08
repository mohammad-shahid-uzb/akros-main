import React, { useState } from "react";

export default function SupplierRegister() {
    const [form, setForm] = useState({
        name: "Test Supplier Co.",
        email: "test@supplier.uz",
        phone: "+998-901234567",
        address: "100 Main Street, Tashkent",
        website: "www.testsupplier.uz",
        city: "Tashkent"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            let digits = value.replace(/\D/g, ""); // only numbers
            if (digits.startsWith("998")) digits = digits.slice(3);
            if (digits.length > 9) digits = digits.slice(0, 9);
            const formatted = `+998-${digits}`;
            setForm({ ...form, phone: formatted });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // ✅ Register
            const res = await fetch("http://localhost:4000/api/suppliers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    contact: {
                        email: form.email,
                        phone: form.phone,
                        address: form.address,
                        website: form.website
                    },
                    location: { country: "Uzbekistan", city: form.city }
                })
            });

            const data = await res.json();

            if (data.exists) {
                alert("⚠️ Supplier already exists: " + data.supplier.name);
            } else {
                alert("✅ Supplier created: " + data.supplier.name);
            }

            // Reset form with test defaults again
            setForm({
                name: "Test Supplier Co.",
                email: "test@supplier.uz",
                phone: "+998-901234567",
                address: "100 Main Street, Tashkent",
                website: "www.testsupplier.uz",
                city: "Tashkent"
            });
        } catch (err) {
            console.error(err);
            alert("❌ Error registering supplier");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg space-y-5"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Register Supplier
                </h2>
                <p className="text-sm text-center text-gray-500 mb-2">
                    (🧪 Test mode: pre-filled data for testing)
                </p>

                <input
                    name="name"
                    placeholder="Supplier Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                    name="phone"
                    placeholder="+998-xxxxxxxxx"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                    name="website"
                    placeholder="Website"
                    value={form.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                    name="country"
                    value="Uzbekistan"
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600"
                />

                <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                    <option value="Tashkent">Tashkent</option>
                    <option value="Samarkand">Samarkand</option>
                    <option value="Bukhara">Bukhara</option>
                    <option value="Andijon">Andijon</option>
                    <option value="Namangan">Namangan</option>
                    <option value="Fergana">Fergana</option>
                    <option value="Nukus">Nukus</option>
                    <option value="Other">Other</option>
                </select>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Register
                </button>
            </form>
        </div>
    );
}
