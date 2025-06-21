import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const Analysis = () => {
    const { user } = useAuth();
    const userId = user?.uid;

    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [chatIds, setChatIds] = useState([]);
    const [referenceNames, setReferenceNames] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState("all");
    const [selectedRefName, setSelectedRefName] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [formData, setFormData] = useState({ name: "", lat: "", lon: "" });

    const [selectedDate, setSelectedDate] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"

    const fetchAnalyses = async () => {
        try {
            const response = await api.get(`/analysis/${userId}`);
            const allAnalyses = response.data.analyses;

            setAnalyses(allAnalyses);

            const uniqueChatIds = Array.from(
                new Set(allAnalyses.map((a) => a.chatId))
            );
            const uniqueRefNames = Array.from(
                new Set(allAnalyses.map((a) => a.referencePoint.name))
            );

            setChatIds(uniqueChatIds);
            setReferenceNames(uniqueRefNames);
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

    const getFilteredAndSortedAnalyses = () => {
        console.log("Filtering and sorting analyses...", analyses);
        let filtered = analyses.filter((a) => {
            const chatMatch =
                selectedChatId === "all" || a.chatId === selectedChatId;
            const refMatch =
                selectedRefName === "all" ||
                a.referencePoint.name === selectedRefName;
            const dateMatch =
                !selectedDate ||
                new Date(a.createdAt).toLocaleDateString() ===
                    new Date(selectedDate).toLocaleDateString();
            return chatMatch && refMatch && dateMatch;
        });

        return filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
    };

    const filteredAnalyses = getFilteredAndSortedAnalyses();

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading)
        return <p className="text-center mt-10 text-black">Loading...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto text-black">
            <h1 className="text-3xl font-bold mb-6 text-[#1976d2]">
                Analysis Results
            </h1>

            {/* Filters container */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-wrap gap-6 items-start">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Filter by Chat ID
                        </label>
                        <select
                            value={selectedChatId}
                            onChange={(e) => setSelectedChatId(e.target.value)}
                            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg 
                                      shadow-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2] focus:ring-opacity-30 
                                      outline-none transition-all duration-200 hover:border-gray-400"
                        >
                            <option value="all" className="py-2">All Chats</option>
                            {chatIds.map((chatId) => (
                                <option key={chatId} value={chatId} className="py-2">
                                    {chatId}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Filter by Reference Point
                        </label>
                        <select
                            value={selectedRefName}
                            onChange={(e) => setSelectedRefName(e.target.value)}
                            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg 
                                      shadow-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2] focus:ring-opacity-30 
                                      outline-none transition-all duration-200 hover:border-gray-400"
                        >
                            <option value="all" className="py-2">All Reference Points</option>
                            {referenceNames.map((name) => (
                                <option key={name} value={name} className="py-2">
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Filter by Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg 
                                          shadow-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2] focus:ring-opacity-30 
                                          outline-none transition-all duration-200 hover:border-gray-400 pr-10"
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 
                                              text-gray-400 hover:text-gray-600 transition-colors
                                              rounded-full hover:bg-gray-100"
                                    type="button"
                                    aria-label="Clear date filter"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-5 w-5" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                    >
                                        <path 
                                            fillRule="evenodd" 
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                            clipRule="evenodd" 
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Sort Order
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg 
                                      shadow-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2] focus:ring-opacity-30 
                                      outline-none transition-all duration-200 hover:border-gray-400"
                        >
                            <option value="desc" className="py-2">Newest First</option>
                            <option value="asc" className="py-2">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredAnalyses.map((analysis) => (
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
                            <p className="text-sm text-gray-500">
                                Created: {formatDateTime(analysis.createdAt)}
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
                                <div className="mt-2 space-x-1">
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon}#map=19/${loc.lat}/${loc.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-xs"
                                    >
                                        View on OSM
                                    </a>
                                    <span className="text-xs text-gray-500">
                                        |
                                    </span>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-xs"
                                    >
                                        Navigate
                                    </a>
                                </div>
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

export default Analysis;
//