const mqtt = require('mqtt'); // MQTT-Modul importieren
const client = mqtt.connect('wss://mqtt.zimolong.eu'); // Verbindung zum MQTT-Server herstellen

// Verbindung herstellen
client.on('connect', () => {
    console.log('Mit MQTT-Server verbunden');
});

// Funktion zum Senden einer Buchausleihe
function publishBorrowing(bookId, memberId) {
    const message = JSON.stringify({ bookId, memberId, action: 'borrowed' }); // Nachricht als JSON
    client.publish('library/borrow', message); // Nachricht an das MQTT-Topic senden
}





async function buchAendern(buchID, buchObjekt) {

    const buchObj = getBybuchID(buchID);
    if (!buchObj) {

        logger.error(`Änderung der Werte für unbekanntes Buch "${buchID}" angefordert.`);
        return null;
    }

    await datenbankObjekt.buchAendern(buchID, buchObjekt);

    return buchObj;
}