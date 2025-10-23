import React, { useState } from "react";

export default function AdminCreateMaterial() {
    const [form, setForm] = useState({
        name: "Cement",
        description:
            "Cement is a fine, powdery material that hardens when mixed with water and is used as a binding agent in concrete and mortar.",
        customCode: "MAT-CEM-001",
        uniClassCode: "Pr_20_93_13_11",
        category: "Construction Material",
        subCategory: "Binders",
    });

    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Basic validation
        if (!form.name || !form.category) {
            setStatus("⚠️ Please fill in all required fields (Name, Category).");
            return;
        }

        setStatus("⏳ Submitting...");

        try {
            // ✅ Allow testing mode
            const token = localStorage.getItem("token") || "TEST_ADMIN_TOKEN";

            const res = await fetch("https://green-book-server-production.up.railway.app/api/materials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to create material");

            const data = await res.json();

            if (data.exists) {
                setStatus(`⚠️ Material already exists: ${data.data.name}`);
            } else {
                setStatus(`✅ Material created: ${data.data.name}`);
            }

            // Reset form (optional)
            setForm({
                name: "",
                description: "",
                customCode: "",
                uniClassCode: "",
                category: "",
                subCategory: "",
            });
        } catch (err) {
            console.error(err);
            setStatus("❌ Error creating material. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="p-6 w-full max-w-md bg-white shadow-lg rounded-lg space-y-4"
            >
                <h2 className="text-2xl font-semibold text-center mb-4">
                    Create Material (Admin)
                </h2>

                {[
                    "name",
                    "description",
                    "customCode",
                    "uniClassCode",
                    "category",
                    "subCategory",
                ].map((field) => (
                    <input
                        key={field}
                        name={field}
                        placeholder={field.replace(/([A-Z])/g, " $1")}
                        value={form[field]}
                        onChange={handleChange}
                        required={["name", "category"].includes(field)}
                        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                ))}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Create
                </button>

                {status && (
                    <p
                        className={`mt-2 text-sm text-center ${status.startsWith("✅")
                            ? "text-green-600"
                            : status.startsWith("❌")
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                    >
                        {status}
                    </p>
                )}
            </form>
        </div>
    );
}
