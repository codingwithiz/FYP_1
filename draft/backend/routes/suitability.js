const express = require("express");
const router = express.Router();
const arcgis = require("../services/arcgisServices");
const { scoreHospital } = require("../services/suitabilityScorer");

router.post("/api/suitability", async (req, res) => {
    const { location, category, radius } = req.body;
    const radiusKm = radius || 1000;
    const CATEGORY_MAP = {
        "health & medicines - hospital": "Hospitals",
        "education - school": "Schools",
        "food - restaurant": "Restaurants",
    };

    function normalizeCategory(input) {
        return CATEGORY_MAP[input.toLowerCase()] || "Hospitals";
    }
    
    try {
        const coord = await arcgis.geocodeLocation(location);
        const normalizedCategory = normalizeCategory(category);
        const places = await arcgis.getNearbyPlaces(
            coord.y,
            coord.x,
            radiusKm,
            normalizedCategory
        );

        const scoredPlaces = places.map((p) => ({
            ...p,
            lat: p.location.y,
            lon: p.location.x,
            score: scoreHospital(p, { latitude: coord.y, longitude: coord.x }),
        }));

        const top2 = scoredPlaces.sort((a, b) => b.score - a.score).slice(0, 2);

        const sampledCoords = [];
        const offsets = [
            { dx: 0.0045, dy: 0 },
            { dx: -0.0045, dy: 0 },
            { dx: 0, dy: 0.0045 },
            { dx: 0, dy: -0.0045 },
        ];

        for (const p of top2) {
            for (const { dx, dy } of offsets) {
                sampledCoords.push({
                    lat: p.lat + dy,
                    lon: p.lon + dx,
                });
            }
        }

        const finalResults = sampledCoords.map((p) => {
            const distToRoad = 200;
            const score = 1 / (distToRoad + 1);
            return { ...p, score };
        });

        const best = finalResults.sort((a, b) => b.score - a.score).slice(0, 3);
        return res.json({ recommended_locations: best });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Suitability analysis failed" });
    }
});

module.exports = router;
