const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors()); // Allow all origins, or configure specific origins

app.use(express.json());

app.post("/log", (req, res) => {
    const { level, service, message } = req.body;

    if (!level || !service || !message) {
        return res
            .status(400)
            .send('Missing "level" or "message" in request body');
    }

    if (console[level]) {
        console[level](`[Frontend log - ${level}] [${service}]: ${message}`);
    } else {
        console.log(`[Frontend log - unknown level] [${service}]: ${message}`);
    }

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Logging backend listening at http://localhost:${PORT}`);
});
