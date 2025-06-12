const express = require("express");
const router = express.Router();
const userService = require("../services/userService");

router.post("/", async (req, res) => {
    try {
        await userService.createUser(req.body);
        res.status(201).send("User created");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put("/:id", async (req, res) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.send("User updated");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete("/:userId", async (req, res) => {
    try {
        await userService.deleteUser(req.params.userId);
        res.send("User deleted");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
