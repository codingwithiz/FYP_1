const sql = require("mssql");

async function createAnalysis({ userId, referencePointId, chatId }) {
    const analysisId = `analysis_${Date.now()}`;
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        await request
            .input("analysisId", sql.VarChar, analysisId)
            .input("userId", sql.VarChar, userId)
            .input("referencePointId", sql.VarChar, referencePointId)
            .input("chatId", sql.VarChar, chatId)
            .query(`
            INSERT INTO Analysis (analysisId, userId, referencePointId, chatId)
            VALUES (@analysisId, @userId, @referencePointId, @chatId)
        `);
    await transaction.commit();
    return analysisId;
    }
    catch (err) {
        await transaction.rollback();
        throw new Error("Failed to create analysis: " + err.message);
    }
}

async function getUserAnalysesWithDetails(userId) {
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const result = await request.input("userId", sql.VarChar, userId)
            .query(`
            SELECT 
                a.analysisId,
                a.chatId,
                a.referencePointId,
                rp.name AS referencePointName,
                rp.lat AS referencePointLat,
                rp.lon AS referencePointLon,
                rl.locationId AS locationId,
                rl.lat AS lat,
                rl.lon AS lon,
                rl.score,
                rl.reason
            FROM Analysis a
            LEFT JOIN ReferencePoint rp ON a.referencePointId = rp.pointId
            LEFT JOIN RecommendedLocation rl ON a.analysisId = rl.analysisId
            WHERE a.userId = @userId
            ORDER BY a.analysisId
        `);

        const analyses = {};
        for (const row of result.recordset) {
            if (!analyses[row.analysisId]) {
                analyses[row.analysisId] = {
                    analysisId: row.analysisId,
                    chatId: row.chatId,
                    referencePoint: {
                        referencePointId: row.referencePointId,
                        name: row.referencePointName,
                        lat: row.referencePointLat,
                        lon: row.referencePointLon,
                    },
                    recommendedLocations: [],
                };
            }

            if (row.locationId) {
                analyses[row.analysisId].recommendedLocations.push({
                    locationId: row.locationId,
                    lat: row.lat,
                    lon: row.lon,
                    score: row.score,
                    reason: row.reason,
                    // created_at can be added here if needed and available
                });
            }
        }

        await transaction.commit();
        return Object.values(analyses); // ✅ Moved inside try block
    } catch (err) {
        await transaction.rollback();
        throw new Error("Failed to get user analyses: " + err.message);
    }
}

async function updateAnalysisReferencePoint(analysisId, name, lat, lon ) {
    console.log("Updating reference point for analysis:", analysisId, name, lat, lon);
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // 1. Get the referencePointId from the Analysis table
        const result = await request.input(
            "analysisId",
            sql.VarChar,
            analysisId
        ).query(`
                SELECT referencePointId FROM Analysis WHERE analysisId = @analysisId
            `);

        if (result.recordset.length === 0) {
            throw new Error("Analysis not found.");
        }

        const referencePointId = result.recordset[0].referencePointId;

        // 2. Update the ReferencePoint table
        await request
            .input("referencePointId", sql.VarChar, referencePointId)
            .input("name", sql.VarChar, name)
            .input("lat", sql.Float, lat)
            .input("lon", sql.Float, lon).query(`
                UPDATE ReferencePoint
                SET name = @name, lat = @lat, lon = @lon
                WHERE pointId = @referencePointId
            `);

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw new Error("Failed to update reference point: " + err.message);
    }
}


async function deleteAnalysis(analysisId) {
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();

        // First request: get referencePointId
        const request1 = new sql.Request(transaction);
        const result = await request1.input(
            "analysisId",
            sql.VarChar,
            analysisId
        ).query(`
                SELECT referencePointId FROM Analysis WHERE analysisId = @analysisId
            `);

        if (result.recordset.length === 0) {
            throw new Error("Analysis not found.");
        }

        const referencePointId = result.recordset[0].referencePointId;

        // Second request: delete recommended locations
        const request2 = new sql.Request(transaction);
        await request2.input("analysisId", sql.VarChar, analysisId).query(`
                DELETE FROM RecommendedLocation WHERE analysisId = @analysisId
            `);

        // Third request: delete the analysis
        const request3 = new sql.Request(transaction);
        await request3.input("analysisId", sql.VarChar, analysisId).query(`
                DELETE FROM Analysis WHERE analysisId = @analysisId
            `);

        // Fourth request: delete the reference point
        const request4 = new sql.Request(transaction);
        await request4.input("referencePointId", sql.VarChar, referencePointId)
            .query(`
                DELETE FROM ReferencePoint WHERE pointId = @referencePointId
            `);

        await transaction.commit();
        return {
            success: true,
            message: "Analysis and related data deleted successfully.",
        };
    } catch (err) {
        await transaction.rollback();
        throw new Error("Failed to delete analysis: " + err.message);
    }
}


module.exports = { createAnalysis, getUserAnalysesWithDetails, updateAnalysisReferencePoint, deleteAnalysis };
