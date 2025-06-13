import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const AnalysesPage = () => {
    const { user } = useAuth();
    const userId = user?.uid;
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [formData, setFormData] = useState({ name: "", lat: "", lon: "" });

    const fetchAnalyses = async () => {
        try {
            const response = await api.get(`/analysis/${userId}`);
            setAnalyses(response.data.analyses);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch analyses.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (analysisId) => {
        if (!window.confirm("Are you sure you want to delete this analysis?"))
            return;
        try {
            await api.delete(`/analysis/${analysisId}`);
            setAnalyses((prev) =>
                prev.filter((a) => a.analysisId !== analysisId)
            );
        } catch (err) {
            console.error("Failed to delete analysis:", err);
            alert("Delete failed.");
        }
    };

    const openUpdateModal = (analysis) => {
        setSelectedAnalysis(analysis);
        setFormData({
            name: analysis.referencePoint.name,
            lat: analysis.referencePoint.lat,
            lon: analysis.referencePoint.lon,
        });
        setShowModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(
                `/analysis/${selectedAnalysis.analysisId}`,
                formData
            );
            setShowModal(false);
            fetchAnalyses();
        } catch (err) {
            console.error("Failed to update:", err);
            alert("Update failed.");
        }
    };

    useEffect(() => {
        fetchAnalyses();
    }, []);

    if (loading)
        return <p className="text-center mt-10 text-black">Loading...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto text-black">
            <h1 className="text-3xl font-bold mb-6 text-[#1976d2]">
                Analysis Results
            </h1>

            {analyses.map((analysis) => (
                <div
                    key={analysis.analysisId}
                    className="mb-10 border-b border-black pb-6"
                >
                    <div className="mb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold">
                                📍 Reference Point:{" "}
                                <span className="text-[#1976d2]">
                                    {analysis.referencePoint.name}
                                </span>
                            </h2>
                            <p className="text-sm text-gray-700">
                                Lat: {analysis.referencePoint.lat}, Lon:{" "}
                                {analysis.referencePoint.lon}
                            </p>
                            <p className="text-sm text-gray-600">
                                Chat ID: {analysis.chatId}
                            </p>
                        </div>
                        <div className="space-x-2">
                            <button
                                onClick={() => openUpdateModal(analysis)}
                                className="bg-[#1976d2] hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition-transform transform hover:scale-105 shadow"
                            >
                                Update
                            </button>
                            <button
                                onClick={() =>
                                    handleDelete(analysis.analysisId)
                                }
                                className="bg-black hover:bg-gray-800 text-[#1976d2] font-semibold px-4 py-2 rounded transition-transform transform hover:scale-105 shadow"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysis.recommendedLocations.map((loc) => (
                            <div
                                key={loc.locationId}
                                className="bg-white border border-gray-300 hover:border-[#1976d2] rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200"
                            >
                                <h3 className="text-lg font-semibold text-black mb-2">
                                    🗺️ Location ID: {loc.locationId}
                                </h3>
                                <p className="text-sm text-black">
                                    📍 Lat: {loc.lat}
                                </p>
                                <p className="text-sm text-black">
                                    📍 Lon: {loc.lon}
                                </p>
                                <p className="text-sm font-medium text-[#1976d2] mt-1">
                                    ⭐ Score: {loc.score}
                                </p>
                                <p className="text-sm mt-2 text-gray-700 italic">
                                    {loc.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md text-black">
                        <h2 className="text-xl font-bold mb-4 text-[#1976d2]">
                            Update Reference Point
                        </h2>
                        <form
                            onSubmit={handleUpdateSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    value={formData.lat}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lat: parseFloat(e.target.value),
                                        })
                                    }
                                    className="w-full border border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    value={formData.lon}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lon: parseFloat(e.target.value),
                                        })
                                    }
                                    className="w-full border border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#1976d2] hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-transform transform hover:scale-105 shadow"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysesPage;
