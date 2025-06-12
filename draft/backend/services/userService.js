const sql = require("mssql");
const dbConfig = require("../database/dbConfig");

module.exports = {
    createUser: async (user) => {
        await sql.query`
      INSERT INTO Users (userId, name, preferenceId) 
      VALUES (${user.userId}, ${user.name}, ${user.preferenceId})
    `;
    },

    getUsers: async () => {
        const result = await sql.query("SELECT * FROM Users");
        return result.recordset;
    },

    updateUser: async (id, data) => {
        await sql.query`
      UPDATE Users 
      SET name = ${data.name}, preferenceId = ${data.preferenceId}
      WHERE userId = ${id}
    `;
    },

    deleteUser: async (userId) => {
        await sql.query`
      DELETE FROM Users WHERE userId = ${userId}
    `;
    },
};
