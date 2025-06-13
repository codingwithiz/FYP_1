const sql = require("mssql");

async function createReferencePoint({ name, lat, lon }) {
    const pointId = `point_${Date.now()}`;
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const result = await request
            .input("pointId", sql.VarChar, pointId)
            .input("name", sql.VarChar, name)
            .input("lat", sql.Float, lat)
            .input("lon", sql.Float, lon)
            .query(`
            INSERT INTO ReferencePoint (pointid, name, lat, lon)
            VALUES (@pointId, @name, @lat, @lon);
        `);
        await transaction.commit();
        return pointId;
    } catch (err) {
        await transaction.rollback();
        throw new Error("Failed to create reference point: " + err.message);
    }
}

module.exports = { createReferencePoint };
