const express = require("express");
const router = express.Router();

router.post("/api/process-places", async (req, res) => {
    const { places } = req.body;
    console.log("Received places data:", places);
    if (!places || !Array.isArray(places)) {
        return res.status(400).json({ error: "Invalid places data" });
    }

    try {
        // 🔍 Filter out places where category includes "medicine" or "health"
        const filtered = places.filter((place) => {
            const categories = place.categories || [];
            return categories.some((cat) => {
                if (typeof cat === "string") {
                    const lower = cat.toLowerCase();
                    console.log("Processing category:", lower);
                    return (
                        lower.includes("medicine") || lower.includes("health")
                    );
                }
                console.log("Unexpected category format:", cat);
                return false;
            });
        });
        

        console.log("Filtered places count:", filtered.length);

        places.forEach((place) => {
            if (!Array.isArray(place.categories)) {
                console.warn(
                    "Unexpected categories format:",
                    place.name,
                    place.categories
                );
            }
        });
        

        // Example: Add dummy scoring to remaining
        const processed = filtered.map((place) => ({
            ...place,
            suitabilityScore: Math.random().toFixed(2),
        }));

        return res.status(200).json({ processed });
    } catch (error) {
        console.error("Error processing places:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
