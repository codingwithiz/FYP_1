const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const serviceAccount = require("../fyp-gis-24a89-firebase-adminsdk-fbsvc-faa0396f47.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

router.post("/verify", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
