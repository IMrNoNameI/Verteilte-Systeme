const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
let lendings = []; // Liste aller Ausleihen

// Buch ausleihen (POST /lendings)
router.post("/lendings", (req, res) => {
    const { bookId, memberId, dueDate } = req.body;

    if (!bookId || !memberId || !dueDate) {
        return res.status(400).json({ error: "bookId, memberId und dueDate sind erforderlich" });
    }

    const lending = {
        id: uuidv4(),
        bookId,
        memberId,
        loanDate: new Date().toISOString(),
        dueDate,
        status: "ausgeliehen"
    };

    lendings.push(lending);
    res.status(201).json(lending);
});

// Alle Ausleihen abrufen (GET /lendings)
router.get("/lendings", (req, res) => {
    res.json(lendings);
});

// Buch zurückgeben (PUT /lendings/:id)
router.put("/lendings/:id", (req, res) => {
    const lending = lendings.find(l => l.id === req.params.id);
    if (!lending) return res.status(404).json({ error: "Ausleihe nicht gefunden" });

    lending.returnDate = new Date().toISOString();
    lending.status = "zurückgegeben";
    
    res.json(lending);
});

module.exports = router;