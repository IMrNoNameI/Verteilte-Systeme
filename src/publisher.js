import mqtt from "mqtt";

const mqtt = require("mqtt");

// Verbindung zum MQTT-Server herstellen
const client = mqtt.connect("wss://mqtt.zimolong.eu", {
  username: "dhbw",
  password: "dhbw",
});

// Beispiel-Topic für Bestellungen
const topic = "WWI23B5_Abel";

client.on("connect", () => {
  console.log("Publisher verbunden mit MQTT-Server.");

  // Simuliere eine Datenänderung
  setInterval(() => {
    const order = {
      url: "https://api.example.com/orders/123",
      action: "created",
      data: { id: 123, customer: "Max Mustermann", total: 42.99 },
    };

    const message = JSON.stringify(order);
    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error("Fehler beim Senden:", err);
      } else {
        console.log("Nachricht gesendet:", message);
      }
    });
  }, 5000); // Alle 5 Sekunden eine Nachricht senden
});