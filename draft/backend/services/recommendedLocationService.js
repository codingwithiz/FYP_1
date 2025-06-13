const sql = require("mssql");

async function createRecommendedLocations(locations, analysisId) {
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();

        for (const loc of locations) {
            const locationId = `loc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            const recomRequest = new sql.Request(transaction);
            await recomRequest
                .input("locationId", sql.VarChar, locationId)
                .input("analysisId", sql.VarChar, analysisId)
                .input("lat", sql.Float, loc.lat)
                .input("lon", sql.Float, loc.lon)
                .input("score", sql.Float, loc.score)
                .input("reason", sql.Text, loc.reason)
                .query(`
                    INSERT INTO RecommendedLocation (locationId, analysisId, lat, lon, score, reason)
                    VALUES (@locationId, @analysisId, @lat, @lon, @score, @reason);
                `);
        }

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        console.error("Transaction failed in createRecommendedLocations:", err);
        throw err;
    }
}

module.exports = { createRecommendedLocations };
