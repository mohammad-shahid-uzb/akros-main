import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../components/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";


function CostIntelligence() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("boq", file);

        try {
            const res = await axios.post("http://localhost:5000/api/boq/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-4">Cost Intelligence</h1>
            <p className="mb-4 text-gray-600">
                Upload your BOQ to analyze baseline vs. forecasted costs and AI-estimated overrun risk.
            </p>

            <div className="flex space-x-4 items-center">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={handleUpload}
                >
                    Upload & Analyze
                </button>
            </div>
            <button
                onClick={() => navigate("/input")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                ➕ Add / Edit BOQ Data
            </button>

            {result && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <h2 className="text-lg font-semibold">Baseline Cost</h2>
                                <p className="text-2xl font-bold text-green-600">${result.baseline}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <h2 className="text-lg font-semibold">Forecasted Cost</h2>
                                <p className="text-2xl font-bold text-blue-600">${result.forecast}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <h2 className="text-lg font-semibold">Overrun Risk</h2>
                                <p className="text-2xl font-bold text-red-600">{result.risk}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="font-semibold mb-4">Cost Comparison</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { name: "Baseline", value: result.baseline },
                                    { name: "Forecast", value: result.forecast }
                                ]}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Detailed Breakdown Table */}
                    {result.breakdown && (
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="font-semibold mb-4">Detailed Breakdown</h2>
                                <table className="w-full border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">Category</th>
                                            <th className="p-2 text-right">Baseline</th>
                                            <th className="p-2 text-right">Forecast</th>
                                            <th className="p-2 text-right">Variance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.breakdown.map((item, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="p-2">{item.category}</td>
                                                <td className="p-2 text-right">${item.baseline}</td>
                                                <td className="p-2 text-right">${item.forecast}</td>
                                                <td className="p-2 text-right text-red-600">
                                                    {item.forecast - item.baseline}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )
            }
        </div >
    );
}

export default CostIntelligence;
