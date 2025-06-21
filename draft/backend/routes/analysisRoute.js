const express = require("express");
const router = express.Router();
const sql = require("mssql");
const {
    getUserAnalysesWithDetails,
    updateAnalysisReferencePoint,
    deleteAnalysis,
} = require("../services/analysisService");

router.get("/analysis/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const analyses = await getUserAnalysesWithDetails(userId);
        console.log("Fetched analyses for user:", userId, analyses);
        res.status(200).json({ analyses });
    } catch (err) {
        console.error("Failed to fetch user analyses:", err);
        res.status(500).json({ error: "Failed to fetch user analyses" });
    }
});

router.patch("/analysis/:analysisId", async (req, res) => {
    const { analysisId } = req.params;
    const { name, lat, lon } = req.body;

    if (!name || lat == null || lon == null) {
        return res
            .status(400)
            .json({ error: "Missing reference point fields" });
    }

    try {
        await updateAnalysisReferencePoint(analysisId, name, lat, lon );
        res.status(200).json({
            message: "Reference point updated successfully",
        });
    } catch (err) {
        console.error("Failed to update reference point:", err);
        res.status(500).json({ error: "Failed to update reference point" });
    }
});

router.delete("/analysis/:analysisId", async (req, res) => {
    const { analysisId } = req.params;

    try {
        // Assuming you have a service to delete analysis by ID
        await deleteAnalysis(analysisId);
        res.status(200).json({
            message: "Analysis deleted successfully",
        });
    } catch (err) {
        console.error("Failed to delete analysis:", err);
        res.status(500).json({ error: "Failed to delete analysis" });
    }
});

// New: Get top 3 recommended locations for an analysisId
router.get("/analysis/:analysisId/recommendations", async (req, res) => {
    const { analysisId } = req.params;
    try {
        const result = await sql.query`
            SELECT TOP 3 locationId, lat, lon, score, reason
            FROM RecommendedLocation
            WHERE analysisId = ${analysisId}
            ORDER BY score DESC
        `;

        //get reference point details
        const refPointResult = await sql.query`
            SELECT rp.name, rp.lat, rp.lon
            FROM Analysis a
            JOIN ReferencePoint rp ON a.referencePointId = rp.pointId
            WHERE a.analysisId = ${analysisId}
        `;
        res.json({ locations: result.recordset, referencePoint: refPointResult.recordset[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

module.exports = router;
