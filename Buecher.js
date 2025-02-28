const express = require('express'); // Express.js wird für das Web-Framework importiert
const { v4: uuidv4 } = require('uuid'); // UUID für eindeutige IDs
let books = []; // Temporäre Datenbank als Array

const app = express();
app.use(express.json()); // Middleware zur Verarbeitung von JSON-Anfragen

// Buch erstellen (POST /books)
app.post('/books', (req, res) => {
    const book = { id: uuidv4(), ...req.body }; // Generiert eine ID und speichert die Buchdaten
    books.push(book);
    res.status(201).json(book); // Antwort mit dem neuen Buch
});

// Alle Bücher abrufen (GET /books)
app.get('/books', (req, res) => {
    res.json(books); // Gibt alle gespeicherten Bücher zurück
});

// Buch löschen (DELETE /books/:id)
app.delete('/books/:id', (req, res) => {
    books = books.filter(book => book.id !== req.params.id); // Entfernt das Buch mit der angegebenen ID
    res.status(204).send(); // Antwort ohne Inhalt (204: No Content)
});

// Server starten
app.listen(3000, () => console.log('Bücherverwaltung läuft auf Port 3000'));