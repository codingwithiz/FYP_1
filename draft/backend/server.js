const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.post("/analyze-location", async (req, res) => {
    const { userInput } = req.body;

    try {
        // Step 1: Extract criteria from user input (mocked or via OpenAI)
        const intent = extractIntent(userInput); // Optionally call OpenAI API

        // Step 2: Find university locations (Geocoding API)
        const universityCoords = await findUniversities();

        // Step 3–4: For each university, analyze
        const results = await Promise.all(
            universityCoords.map(async (uni) => {
                const competition = await countNearbyGyms(uni);
                const demographics = await getPopulationData(uni);
                const accessibility = await getTransitScore(uni);

                const score = computeSuitabilityScore({
                    competition,
                    demographics,
                    accessibility,
                });

                return {
                    location: uni,
                    score,
                    metadata: { competition, demographics, accessibility },
                };
            })
        );

        res.json({ results });
    } catch (err) {
        console.error("Error analyzing location:", err);
        res.status(500).send("Server Error");
    }
});

const processPlacesRoute = require("./routes/processPlaces");
app.post("/api/process-places", processPlacesRoute);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Mock logic below – Replace with real API logic
function extractIntent(text) {
    return {
        near: "universities",
        footTraffic: "high",
        competition: "low",
    };
}

async function findUniversities() {
    return [
        { name: "University A", latitude: 40.73061, longitude: -73.935242 },
        { name: "University B", latitude: 40.7291, longitude: -73.9965 },
    ];
}

async function findNearbyUniversities(lat, lon) {
    const radius = 2000; // in meters
    const esriUrl = `https://places-api.arcgis.com/arcgis/rest/services/places-service/v1/categories`;

    const response = await axios.get(esriUrl, {
        headers: { Authorization: `Bearer ${ESRI_API_KEY}` },
        params: {
            categories: "4d4b7105d754a06377d81259",
            lat,
            lon,
            radius,
            limit: 10,
        },
    });

    return response.data.results.map((place) => ({
        name: place.name,
        latitude: place.location.y,
        longitude: place.location.x,
        address: place.addresses?.[0]?.address || "No address",
    }));
}


async function countNearbyGyms({ latitude, longitude }) {
    // Use Google Places or Esri Places API
    return Math.floor(Math.random() * 10); // Mock
}

async function getPopulationData({ latitude, longitude }) {
    return Math.random(); // Mock: 0 to 1
}

async function getTransitScore({ latitude, longitude }) {
    return Math.random(); // Mock: 0 to 1
}

function computeSuitabilityScore({ competition, demographics, accessibility }) {
    return (
        (1 - competition / 10) * 0.4 + demographics * 0.3 + accessibility * 0.3
    );
}
