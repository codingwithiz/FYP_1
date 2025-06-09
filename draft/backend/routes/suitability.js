const express = require("express");
const router = express.Router();
const arcgis = require("../services/arcgisServices");
const { scorePlaceByDistance } = require("../services/suitabilityScorer");

router.post("/api/suitability", async (req, res) => {
    const { location, category, radius } = req.body;
    const radiusMeters = radius || 1000;

    const CATEGORY_MAP = {
        health: "Health and Medicine",
        retail: "Retail",
        food: "Dining and Drinking",
        sports: "Sports and Recreation",
    };

    const normalizeCategory = (input) =>
        CATEGORY_MAP[input.toLowerCase()] || "Health and Medicine";

    try {
        // Step 1: Geocode the main location
        const coord = await arcgis.geocodeLocation(location); // returns { x, y }
        const normalizedCategory = normalizeCategory(category);

        // Step 2: Get category IDs and nearby places
        const categoryIds = await arcgis.getCategories(normalizedCategory);
        const places = await arcgis.getNearbyPlaces(
            coord.y,
            coord.x,
            radiusMeters,
            normalizedCategory,
            categoryIds
        );

        console.log("Nearby places found:", places.length);

        // Step 3: Score each place
        const scoredPlaces = places.map((place) => ({
            ...place,
            lat: place.location.y,
            lon: place.location.x,
            score: scorePlaceByDistance(place, {
                latitude: coord.y,
                longitude: coord.x,
            }),
        }));

        const top2 = scoredPlaces.sort((a, b) => b.score - a.score).slice(0, 2);

        // Step 4: Sample coordinates around top 2 places
        const offsets = [
            { dx: 0.0045, dy: 0 },
            { dx: -0.0045, dy: 0 },
            { dx: 0, dy: 0.0045 },
            { dx: 0, dy: -0.0045 },
        ];

        const sampledCoords = [];
        for (const place of top2) {
            for (const { dx, dy } of offsets) {
                sampledCoords.push({
                    lat: place.lat + dy,
                    lon: place.lon + dx,
                });
            }
        }

        // Step 5: Score each sampled coordinate using the same logic
        const finalResults = sampledCoords.map((point) => {
            const dist = require("haversine-distance")(
                { latitude: coord.y, longitude: coord.x },
                { latitude: point.lat, longitude: point.lon }
            );

            const maxDistanceMeters = 1000;
            const proximity =
                dist > maxDistanceMeters ? 0 : 1 - dist / maxDistanceMeters;
            const score = parseFloat((proximity * 100).toFixed(2));

            return { ...point, score };
        });

        const best = finalResults.sort((a, b) => b.score - a.score).slice(0, 3);

        return res.json({ recommended_locations: best });
    } catch (err) {
        console.error("Error in suitability route:", err);
        return res
            .status(500)
            .json({ error: "Failed to compute suitability." });
    }
});

module.exports = router;
