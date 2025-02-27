const express = require('express');
const { v4: uuidv4 } = require('uuid');
let members = [];

const app = express();
app.use(express.json()); // Middleware für JSON-Anfragen

// Mitglied hinzufügen (POST /members)
app.post('/members', (req, res) => {
    const member = { id: uuidv4(), ...req.body };
    members.push(member);
    res.status(201).json(member);
});

// Alle Mitglieder abrufen (GET /members)
app.get('/members', (req, res) => {
    res.json(members);
});

// Server starten
app.listen(3001, () => console.log('Mitgliederverwaltung läuft auf Port 3001'));