import express from "express";
import logging from "logging";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import datenbankObjekt  from "./datenbank.js";
import controllerArray  from "./controller/index.js";
import middlewareArray  from "./middleware/allgemein.middleware.js";


const logger = logging.default("main");

const app = express();
const swaggerdocument = YAML.load("./documentation.yaml");

await datenbankObjekt.initialisieren();


app.use( express.json() );
app.use( express.static("public") );
app.use( middlewareArray );
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerdocument));

// Default-Funktion zum Registrieren von Routen für
// alle Controller aufrufen
let anzahlRestEndpunkte = 0;
for (const controller of controllerArray) {

    anzahlRestEndpunkte += controller(app);
}
logger.info(`Anzahl registrierter REST-Endpunkte: ${anzahlRestEndpunkte}\n`);

// Server starten
const PORT_NUMMER = 8080;
app.listen( PORT_NUMMER,
    () => { logger.info(`Web-Server lauscht auf Port ${PORT_NUMMER}.\n`); }
  );