// main.js - Hauptdatei für die Bibliotheksverwaltung

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

let books = [];
let members = [];

// --- Bücher Endpunkte ---

// Buch erstellen
app.post("/books", (req, res) => {
    const book = { id: uuidv4(), ...req.body };
    books.push(book);
    res.status(201).json(book);
});

// Alle Bücher abrufen
app.get("/books", (req, res) => {
    res.json(books);
});

// Buch löschen
app.delete("/books/:id", (req, res) => {
    books = books.filter(book => book.id !== req.params.id);
    res.status(204).send();
});

// --- Mitglieder Endpunkte ---

// Mitglied hinzufügen
app.post("/members", (req, res) => {
    const member = { id: uuidv4(), ...req.body };
    members.push(member);
    res.status(201).json(member);
});

// Alle Mitglieder abrufen
app.get("/members", (req, res) => {
    res.json(members);
});

// Server starten
app.listen(PORT, () => console.log(`Bibliotheksverwaltung läuft auf Port ${PORT}`));